"""
Recoza Conversational Multi-Agent Dialogue Manager
Implements conversational preference-aware retrieval, multi-turn follow-up handling,
dynamic short-term session state, constraint parsing, clarification questions,
and recommendation verification.
"""
import re
from typing import Optional, List, Dict, Any

try:
    from .graph_engine import GraphEngine, COMMUNITY_NAMES
    from .memory import UserMemory
    from .ranking import RecommenderRanker
    from .explainer import RecommendationExplainer
except (ImportError, ValueError):
    from engine.graph_engine import GraphEngine, COMMUNITY_NAMES
    from engine.memory import UserMemory
    from engine.ranking import RecommenderRanker
    from engine.explainer import RecommendationExplainer

CATEGORY_KEYWORDS = {
    0: ['build', 'lego', 'brick', 'block', 'construct', 'technic', 'mega bloks', 'model building'],
    1: ['board game', 'puzzle', 'jigsaw', 'strategy game', 'family game', 'card game', 'catan', 'monopoly', 'ravensburger', 'tabletop'],
    2: ['stem', 'robot', 'science', 'circuit', 'chemistry', 'telescope', 'coding', 'microscope', 'learning toy', 'electronics', 'discovery'],
    3: ['art', 'craft', 'paint', 'clay', 'color', 'draw', 'sewing', 'origami', 'jewelry', 'diy kit'],
    4: ['doll', 'barbie', 'action figure', 'figure', 'pretend play', 'miniature', 'costume', 'plush', 'stuffed animal'],
    5: ['car', 'vehicle', 'truck', 'hot wheels', 'die-cast', 'track set', 'rc car', 'remote control', 'train'],
    6: ['outdoor', 'sports', 'ride-on', 'bike', 'scooter', 'ball', 'water toy', 'pool', 'active play'],
    7: ['novelty', 'fidget', 'magic', 'gag', 'prank', 'spinner'],
    8: ['card game', 'deck', 'trading cards', 'pokemon', 'collectible cards'],
    9: ['toddler', 'baby', 'infant', 'sensory', 'teether', 'rattle'],
    10: ['music', 'instrument', 'guitar', 'piano', 'drum', 'sound toy'],
    11: ['electronic pet', 'interactive toy', 'animatronic', 'robot toy'],
    12: ['costume', 'dress up', 'mask', 'cape', 'roleplay'],
    13: ['model kit', 'hobby', 'diecast', 'airplane model', 'train set']
}

class ConversationalAgent:
    def __init__(self, engine: GraphEngine, ranker: RecommenderRanker, explainer: RecommendationExplainer):
        self.engine = engine
        self.ranker = ranker
        self.explainer = explainer

    def extract_constraints(self, text: str, session: dict) -> dict:
        t_low = text.lower()
        constraints = {
            'category_id': session.get('category_constraint'),
            'category_name': None,
            'max_budget': session.get('max_budget'),
            'min_rating': session.get('min_rating', 0.0),
            'exclusions': set(session.get('exclusions', set())),
            'playstyle': session.get('playstyle'),
            'target_audience': session.get('target_audience')
        }

        # 1. Budget extraction (supports $ and ₹ / Rs / INR numbers)
        budget_match = re.search(r'(?:under|below|less than|within|max|budget(?: of)?)\s*(?:[\$₹]|rs\.?|inr)?\s*(\d+(?:\.\d{1,2})?)', t_low)
        if not budget_match:
            budget_match = re.search(r'([\d]+(?:\.\d{1,2})?)\s*(?:dollars|bucks|rupees|rs)', t_low)
        if not budget_match:
            budget_match = re.search(r'[\$₹]\s*(\d+(?:\.\d{1,2})?)', t_low)
            
        if budget_match:
            val = float(budget_match.group(1))
            # If user mentioned ₹ or rupees (e.g. ₹2000), map approximately to catalog dollar units (1 USD ~ 83 INR) or direct scale
            if '₹' in t_low or 'rs' in t_low or 'rupee' in t_low or val > 500:
                # ₹2000 corresponds to approx $25 - $30
                val = round(val / 80.0, 2)
            constraints['max_budget'] = val

        # 2. Category extraction
        for cid, kws in CATEGORY_KEYWORDS.items():
            if any(re.search(r'\b' + re.escape(kw) + r'\b', t_low) for kw in kws):
                constraints['category_id'] = cid
                constraints['category_name'] = COMMUNITY_NAMES.get(cid)
                break

        # 3. Quality & Rating preference
        if any(w in t_low for w in ['top rated', 'best quality', 'highest rating', 'good quality', 'premium']):
            constraints['min_rating'] = 4.5

        # 4. Target audience
        if any(w in t_low for w in ['kid', 'child', 'children', '10-year-old', '10 year old', '8 year old', 'boy', 'girl']):
            constraints['target_audience'] = 'Kids (8-12)'
        elif any(w in t_low for w in ['toddler', 'baby', 'infant', 'age 3', 'preschool']):
            constraints['target_audience'] = 'Toddlers & Preschool'
        elif any(w in t_low for w in ['family', 'family game night', 'grandparents', 'everyone']):
            constraints['target_audience'] = 'Family & Multi-generational'
        elif any(w in t_low for w in ['adult', 'collector', 'teen']):
            constraints['target_audience'] = 'Adults & Collectors'

        # 5. Playstyle / Features
        if 'cooperative' in t_low or 'co-op' in t_low or 'team' in t_low:
            constraints['playstyle'] = 'Cooperative'
        elif 'strategy' in t_low or 'strategic' in t_low:
            constraints['playstyle'] = 'Strategy'
        elif 'fast' in t_low or 'quick' in t_low or 'party' in t_low:
            constraints['playstyle'] = 'Fast-Paced Party'

        # 6. Exclusions
        exclusion_match = re.search(r'(?:not|no|don\'t show|exclude|without)\s+([a-zA-Z\s]+?)(?:$|\.|\band\b|\bplease\b)', t_low)
        if exclusion_match:
            ex_term = exclusion_match.group(1).strip()
            if len(ex_term) > 2:
                constraints['exclusions'].add(ex_term)

        return constraints

    def process_message(self, message: str, memory: UserMemory, session_id: str = "default") -> dict:
        text = message.strip()
        t_low = text.lower()
        memory.add_query(text)
        session = memory.get_session(session_id)
        
        last_items = session.get('last_recommended_items', [])
        
        # -------------------------------------------------------------
        # STEP 1: Conversational Follow-Up Intent Recognition
        # -------------------------------------------------------------
        
        # Intent A: "Show me cheaper options" / "Too expensive"
        is_cheaper_request = any(p in t_low for p in ['cheaper', 'too expensive', 'lower price', 'budget friendly', 'less expensive', 'cost less'])
        
        # Intent B: "I prefer better quality" / "Highest rated"
        is_quality_request = any(p in t_low for p in ['better quality', 'higher rating', 'top rated', 'best rated', 'more reviews'])
        
        # Intent C: "Show me something similar [to X]"
        is_similar_request = any(p in t_low for p in ['something similar', 'similar items', 'more like this', 'like the first', 'like the second', 'more like'])
        
        # Intent D: "Remove that option" / "Don't like this" / "I don't like option X"
        is_remove_request = any(p in t_low for p in ['remove that', 'remove option', 'don\'t like option', 'not that one', 'dismiss that', 'don\'t show this'])
        
        # Intent E: "Why did you recommend this?"
        is_why_request = any(p in t_low for p in ['why did you recommend', 'why this', 'explain why', 'reason for this', 'how does this match'])
        
        # Intent F: "Don't show this category again"
        is_category_ban_request = any(p in t_low for p in ['don\'t show this category', 'no more of this category', 'different category'])

        # -------------------------------------------------------------
        # STEP 2: Process Follow-up Instructions
        # -------------------------------------------------------------
        
        similar_to_id = None
        session_negative_items = set()
        
        if is_cheaper_request:
            curr_budget = session.get('max_budget') or 50.0
            # Lower current budget by 30%
            new_budget = max(15.0, round(curr_budget * 0.70, 2))
            session['max_budget'] = new_budget
            memory.update_session(session_id, max_budget=new_budget)
            reply_prefix = f"I've adjusted your budget filter to **under ${new_budget:.2f}**. Here are budget-conscious options from the catalog:"
            
        elif is_quality_request:
            session['min_rating'] = 4.8
            memory.update_session(session_id, min_rating=4.8)
            reply_prefix = "Prioritizing top-tier products with **4.8+ star ratings** and verified customer reviews. Here are the highest-quality candidates:"

        elif is_similar_request and last_items:
            # Pick the top recommended item from last turn
            target_item = last_items[0]
            if 'second' in t_low and len(last_items) > 1:
                target_item = last_items[1]
            similar_to_id = target_item['item_id']
            reply_prefix = f"Exploring items with strong topological co-occurrence to **'{target_item['title'][:40]}...'**:"
            
        elif is_remove_request and last_items:
            # Identify which item to remove
            remove_idx = 0
            if 'second' in t_low and len(last_items) > 1:
                remove_idx = 1
            elif 'third' in t_low and len(last_items) > 2:
                remove_idx = 2
            item_to_remove = last_items[remove_idx]
            session_negative_items.add(item_to_remove['item_id'])
            memory.add_feedback(item_to_remove['item_id'], 'dislike', reason='conversational_removal')
            reply_prefix = f"Removed **'{item_to_remove['title'][:35]}...'** from consideration. Here are alternative candidates selected from other clusters:"

        elif is_category_ban_request:
            curr_cid = session.get('category_constraint')
            if curr_cid is not None:
                ban_name = COMMUNITY_NAMES.get(curr_cid, "this category")
                session['exclusions'].add(ban_name.lower())
                session['category_constraint'] = None
                reply_prefix = f"Understood! Banning **{ban_name}** from future suggestions. Here are options from different categories:"
            else:
                reply_prefix = "Switched categories. Here are diverse recommendations across different catalog clusters:"

        elif is_why_request and last_items:
            top_it = last_items[0]
            exp = self.explainer.explain_item(top_it, memory, session)
            return {
                'reply': f"### Why **{top_it['title']}** was recommended:\n\n- **Primary Reason:** {exp['primary_reason']}\n- **Community Context:** {exp['community_context']}\n- **Graph Trace:** {exp['graph_path']}\n- **Rating Quality:** {top_it.get('average_rating')}★ across {top_it.get('rating_number', 0):,} verified reviews.",
                'items': [top_it],
                'clarification_needed': False,
                'suggested_replies': ["Show cheaper options", "Show something similar", "Try another category"],
                'memory_summary': memory.to_dict(self.engine.item_to_comm)
            }
        else:
            reply_prefix = None

        # -------------------------------------------------------------
        # STEP 3: Constraint Extraction & Ambiguity Handling
        # -------------------------------------------------------------
        constraints = self.extract_constraints(text, session)
        
        # Check if user message is a simple greeting or completely ambiguous
        is_greeting = any(w in t_low for w in ['hello', 'hi', 'hey', 'start', 'greetings']) and len(text.split()) <= 2
        is_vague = text.strip() in ['recommend something', 'show me items', 'what do you have', 'good options', 'i need something']
        
        if is_greeting:
            return {
                'reply': "Hello! I'm your Recoza personalized recommendation advisor. I can help you discover items from our verified catalog grounded in 14 community clusters. What kind of items are you looking for today?",
                'items': [],
                'clarification_needed': True,
                'suggested_replies': [
                    "STEM robotics kits under $60",
                    "LEGO & architectural building sets",
                    "Cooperative family board games",
                    "Outdoor sports & active play"
                ],
                'memory_summary': memory.to_dict(self.engine.item_to_comm)
            }
            
        if is_vague and not session.get('category_constraint'):
            return {
                'reply': "I'd love to help! To give you the most accurate recommendations from our 2,399 verified catalog items, could you share what category or age group you're shopping for?",
                'items': [],
                'clarification_needed': True,
                'suggested_replies': [
                    "Building & Construction Sets",
                    "Puzzles & Family Board Games",
                    "STEM & Learning Toys",
                    "Arts & Creative Crafts"
                ],
                'memory_summary': memory.to_dict(self.engine.item_to_comm)
            }

        # Update session with newly extracted constraints
        if constraints['category_id'] is not None:
            session['category_constraint'] = constraints['category_id']
        if constraints['max_budget'] is not None:
            session['max_budget'] = constraints['max_budget']
        if constraints['min_rating'] > 0:
            session['min_rating'] = constraints['min_rating']
        if constraints['exclusions']:
            session['exclusions'].update(constraints['exclusions'])
        if constraints['target_audience']:
            session['target_audience'] = constraints['target_audience']
            
        # -------------------------------------------------------------
        # STEP 4: Candidate Retrieval & Verification
        # -------------------------------------------------------------
        target_cid = session.get('category_constraint')
        target_budget = session.get('max_budget')
        min_rat = session.get('min_rating', 0.0)
        excl_list = list(session.get('exclusions', set()))
        
        recommended_items = self.ranker.recommend(
            memory=memory,
            query=text if not (is_cheaper_request or is_quality_request or is_similar_request) else session.get('last_query', text),
            top_k=4,
            community_id_filter=target_cid,
            max_budget=target_budget,
            min_rating=min_rat,
            exclusions=excl_list,
            session_negative_items=session_negative_items,
            similar_to_item_id=similar_to_id,
            enable_mmr=True
        )

        # Verification step: ensure every item exists in catalog
        verified_items = []
        for it in recommended_items:
            if it['item_id'] in self.engine.items_meta:
                # Attach explanation
                exp = self.explainer.explain_item(it, memory, {
                    'query': text,
                    'category': COMMUNITY_NAMES.get(target_cid, ''),
                    'max_budget': target_budget
                })
                it_copy = dict(it)
                it_copy['explanation'] = exp
                verified_items.append(it_copy)

        # Update session memory
        session['last_recommended_items'] = verified_items
        session['last_query'] = text
        memory.update_session(
            session_id,
            last_recommended_items=verified_items,
            last_query=text
        )

        # -------------------------------------------------------------
        # STEP 5: Formulate Natural Language Response
        # -------------------------------------------------------------
        cat_name = COMMUNITY_NAMES.get(target_cid)
        budget_str = f" under ${target_budget:.2f}" if target_budget else ""
        
        if reply_prefix:
            reply = reply_prefix
        elif cat_name:
            reply = f"Here are verified recommendations in **{cat_name}**{budget_str}, ranked via community graph topology and your active preference vector:"
        elif target_budget:
            reply = f"Here are top-rated recommendations matching your criteria{budget_str}, balanced for quality and diversity:"
        else:
            reply = f"Based on your request '{text}', here are {len(verified_items)} graph-verified recommendations with evidence-grounded explanations:"

        suggested = [
            "Show cheaper options",
            "I prefer higher ratings",
            "Show something similar",
            "Try another category"
        ]

        return {
            'reply': reply,
            'category_detected': cat_name,
            'items': verified_items,
            'clarification_needed': False,
            'suggested_replies': suggested,
            'extracted_constraints': {
                'category': cat_name,
                'max_budget': target_budget,
                'min_rating': min_rat,
                'exclusions': excl_list,
                'target_audience': session.get('target_audience')
            },
            'memory_summary': memory.to_dict(self.engine.item_to_comm)
        }
