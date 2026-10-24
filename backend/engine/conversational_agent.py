"""
Recoza Conversational Multi-Agent Dialogue Manager
Implements conversational preference-aware retrieval, multi-turn follow-up handling,
dynamic short-term session state, constraint parsing, clarification questions,
unsupported domain refusal, and evidence-grounded recommendation verification.
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
    0: ['build', 'lego', 'brick', 'block', 'construct', 'technic', 'mega bloks', 'model building', 'magnetic tiles'],
    1: ['board game', 'puzzle', 'jigsaw', 'strategy game', 'family game', 'card game', 'catan', 'monopoly', 'ravensburger', 'tabletop', 'balancing game', 'farkle'],
    2: ['stem', 'robot', 'science', 'circuit', 'chemistry', 'telescope', 'coding', 'microscope', 'learning toy', 'electronics', 'discovery', 'planetarium'],
    3: ['art', 'craft', 'paint', 'clay', 'color', 'draw', 'sewing', 'origami', 'jewelry', 'diy kit'],
    4: ['doll', 'barbie', 'action figure', 'figure', 'pretend play', 'miniature', 'costume', 'plush', 'stuffed animal'],
    5: ['car', 'vehicle', 'truck', 'hot wheels', 'die-cast', 'track set', 'rc car', 'remote control', 'train'],
    6: ['outdoor', 'sports', 'ride-on', 'bike', 'scooter', 'ball', 'water toy', 'pool', 'active play'],
    7: ['novelty', 'fidget', 'magic', 'gag', 'prank', 'spinner'],
    8: ['card game', 'deck', 'trading cards', 'pokemon', 'collectible cards', 'uno'],
    9: ['toddler', 'baby', 'infant', 'sensory', 'teether', 'rattle'],
    10: ['music', 'instrument', 'guitar', 'piano', 'drum', 'sound toy'],
    11: ['electronic pet', 'interactive toy', 'animatronic', 'robot toy'],
    12: ['costume', 'dress up', 'mask', 'cape', 'roleplay'],
    13: ['model kit', 'hobby', 'diecast', 'airplane model', 'train set']
}

UNSUPPORTED_DOMAINS = [
    {
        'pattern': r'\b(movie|movies|film|films|cinema|motion picture|blu-ray|dvd|netflix|streaming|director|actor|hollywood|bollywood)\b',
        'name': 'Movies & Films',
        'suggestion': 'Puzzles & Family Board Games or Building Sets'
    },
    {
        'pattern': r'\b(novel|novels|textbook|textbooks|ebook|ebooks|kindle|author|biography|fiction book|non-fiction book|paperback)\b',
        'name': 'Books & Literature',
        'suggestion': 'Interactive Learning Toys or Preschool Activity Sets'
    },
    {
        'pattern': r'\b(video game|video games|videogame|videogames|playstation|ps5|ps4|ps3|xbox|nintendo switch|wii|pc game|pc games|steam game|steam games|gaming console|game console)\b',
        'name': 'Video Game Software & Consoles',
        'suggestion': 'Tabletop Board Games, Card Games, or Electronic Interactive Toys'
    },
    {
        'pattern': r'\b(clothing|clothes|apparel|shirt|pants|trousers|dress|shoes|sneakers|jacket|hoodie|handbag)\b',
        'name': 'Apparel & Fashion',
        'suggestion': 'Costumes & Dress-Up Roleplay Accessories'
    },
    {
        'pattern': r'\b(smartphone|iphone|android phone|mobile phone|laptop|smart watch|television|headphone|earbuds|camera|dslr)\b',
        'name': 'Consumer Electronics & Phones',
        'suggestion': 'STEM Robotics & Electronic Circuit Kits'
    },
    {
        'pattern': r'\b(grocery|groceries|snack|snacks|food item|restaurant|beverage|coffee beans)\b',
        'name': 'Food & Groceries',
        'suggestion': 'Pretend Play Kitchen & Food Toys'
    }
]

NUMBER_WORDS = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
}

def extract_count(text: str) -> Optional[int]:
    t_low = text.lower()
    # Mask out age, money, and other number patterns
    clean = re.sub(r'\b\d+\s*[-]?\s*year[-]?\s*old\b', '', t_low)
    clean = re.sub(r'\bage\s*\d+\b', '', clean)
    clean = re.sub(r'[\$₹]\s*\d+(?:\.\d+)?', '', clean)
    clean = re.sub(r'\b\d+\s*(?:dollars|bucks|rupees|rs)\b', '', clean)
    
    m = re.search(r'\b(?:show|give me|find|recommend|list|display|top)?\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:options|items|products|recommendations|choices|results|toys|games)\b', clean)
    if not m:
        m = re.search(r'\b(?:show|give me|just|display)\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b', clean)
    if m:
        val_str = m.group(1)
        if val_str.isdigit():
            c = int(val_str)
            if 1 <= c <= 10:
                return c
        elif val_str in NUMBER_WORDS:
            return NUMBER_WORDS[val_str]
    return None

class ConversationalAgent:
    def __init__(self, engine: GraphEngine, ranker: RecommenderRanker, explainer: RecommendationExplainer):
        self.engine = engine
        self.ranker = ranker
        self.explainer = explainer

    def check_unsupported_domain(self, text: str) -> Optional[dict]:
        t_low = text.lower()
        for item in UNSUPPORTED_DOMAINS:
            if re.search(item['pattern'], t_low):
                return item
        return None

    def extract_constraints(self, text: str, session: dict) -> dict:
        t_low = text.lower()
        
        # Check for category transition / switch
        is_category_switch = bool(re.search(r'\b(now|instead|switch to|change to|rather than|different category|how about)\b', t_low))
        
        # Detect domain type
        domain_type = None
        if any(w in t_low for w in ['board game', 'card game', 'tabletop', 'puzzle', 'puzzles', 'games', 'game', 'dice']):
            domain_type = 'games'
        elif any(w in t_low for w in ['toy', 'toys', 'playset', 'kit', 'set']) and 'game' not in t_low:
            domain_type = 'toys'

        # If previous domain was toys and now explicitly asking for games (or vice versa), mark as switch
        prev_domain = session.get('domain_type')
        if prev_domain and domain_type and prev_domain != domain_type:
            is_category_switch = True

        # Base constraints from session unless category switch is triggered
        constraints = {
            'is_category_switch': is_category_switch,
            'domain_type': domain_type or (None if is_category_switch else session.get('domain_type')),
            'category_id': None if is_category_switch else session.get('category_constraint'),
            'category_name': None,
            'max_budget': session.get('max_budget'),
            'min_rating': session.get('min_rating', 0.0),
            'exclusions': set() if is_category_switch else set(session.get('exclusions', set())),
            'playstyle': None if is_category_switch else session.get('playstyle'),
            'target_audience': session.get('target_audience'),
            'is_educational': False if is_category_switch else session.get('is_educational', False),
            'is_building': False if is_category_switch else session.get('is_building', False),
            'requested_count': extract_count(text)
        }

        # 1. Budget extraction (supports $ and ₹ / Rs / INR numbers)
        budget_match = re.search(r'(?:under|below|less than|within|max|budget(?: of)?)\s*(?:[\$₹]|rs\.?|inr)?\s*(\d+(?:\.\d{1,2})?)', t_low)
        if not budget_match:
            budget_match = re.search(r'([\d]+(?:\.\d{1,2})?)\s*(?:dollars|bucks|rupees|rs)', t_low)
        if not budget_match:
            budget_match = re.search(r'[\$₹]\s*(\d+(?:\.\d{1,2})?)', t_low)
            
        if budget_match:
            val = float(budget_match.group(1))
            if '₹' in t_low or 'rs' in t_low or 'rupee' in t_low or val > 500:
                val = round(val / 80.0, 2)
            constraints['max_budget'] = val

        # 2. Specific features
        if any(w in t_low for w in ['educational', 'stem', 'learning', 'science', 'robotics', 'microscope', 'experiment']):
            constraints['is_educational'] = True
        if any(w in t_low for w in ['building', 'build', 'lego', 'brick', 'block', 'construct', 'tower', 'stack']):
            constraints['is_building'] = True

        # 3. Community / Category extraction
        for cid, kws in CATEGORY_KEYWORDS.items():
            if any(re.search(r'\b' + re.escape(kw) + r'\b', t_low) for kw in kws):
                constraints['category_id'] = cid
                constraints['category_name'] = COMMUNITY_NAMES.get(cid)
                break

        # 4. Quality & Rating preference
        rat_m = re.search(r'(?:min(?:imum)?\s*rating|rating\s*(?:of|at least|above|over|>=)?|rated)\s*(\d+(?:\.\d+)?)', t_low)
        if not rat_m:
            rat_m = re.search(r'(\d+(?:\.\d+)?)\s*(?:stars?|\s*star rating|\s*stars rating)', t_low)
        if rat_m:
            constraints['min_rating'] = float(rat_m.group(1))
        elif any(w in t_low for w in ['top rated', 'best quality', 'highest rating', 'good quality', 'premium', '5 star', '4.5']):
            constraints['min_rating'] = 4.5

        # 5. Target audience
        if any(w in t_low for w in ['kid', 'child', 'children', '10-year-old', '10 year old', '8 year old', '9 year old', 'boy', 'girl']):
            constraints['target_audience'] = 'Kids (8-12)'
        elif any(w in t_low for w in ['toddler', 'baby', 'infant', 'age 3', 'preschool', '18 month']):
            constraints['target_audience'] = 'Toddlers & Preschool'
        elif any(w in t_low for w in ['family', 'family game night', 'grandparents', 'everyone']):
            constraints['target_audience'] = 'Family & Multi-generational'
        elif any(w in t_low for w in ['adult', 'collector', 'teen']):
            constraints['target_audience'] = 'Adults & Collectors'

        # 6. Playstyle / Features
        if 'cooperative' in t_low or 'co-op' in t_low or 'team' in t_low:
            constraints['playstyle'] = 'Cooperative'
        elif 'strategy' in t_low or 'strategic' in t_low:
            constraints['playstyle'] = 'Strategy'
        elif 'fast' in t_low or 'quick' in t_low or 'party' in t_low:
            constraints['playstyle'] = 'Fast-Paced Party'

        # 7. Exclusions
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
        # STEP 0: Check for Unsupported Catalog Domains (Movies, Books, etc.)
        # -------------------------------------------------------------
        unsupported = self.check_unsupported_domain(text)
        if unsupported:
            reply = (
                f"Recoza currently specializes exclusively in our verified **Amazon Toys & Games catalog** "
                f"(comprising 2,399 items across 14 Louvain community clusters, including building sets, board games, "
                f"STEM kits, and puzzles).\n\n"
                f"**{unsupported['name']}** are outside our verified catalog domain. Rather than returning unrelated "
                f"substitute products, we transparently report that no matching {unsupported['name'].lower()} exist in our inventory. "
                f"Would you like to explore related physical items, such as **{unsupported['suggestion']}** instead?"
            )
            return {
                'reply': reply,
                'items': [],
                'unsupported_domain': unsupported['name'],
                'clarification_needed': False,
                'suggested_replies': [
                    "Cooperative family board games",
                    "Educational building sets for kids",
                    "STEM robotics and science kits",
                    "Puzzles & Family Board Games"
                ],
                'memory_summary': memory.to_dict(self.engine.item_to_comm)
            }
        
        # -------------------------------------------------------------
        # STEP 1: Conversational Follow-Up Intent Recognition
        # -------------------------------------------------------------
        is_short_msg = len(text.split()) <= 5
        is_cheaper_request = any(p in t_low for p in ['cheaper', 'too expensive', 'lower price', 'budget friendly', 'less expensive', 'cost less']) and is_short_msg
        is_quality_request = any(p in t_low for p in ['better quality', 'higher rating', 'more reviews']) and is_short_msg
        is_similar_request = any(p in t_low for p in ['something similar', 'similar items', 'more like this', 'like the first', 'like the second', 'more like'])
        is_remove_request = any(p in t_low for p in ['remove that', 'remove option', 'don\'t like option', 'not that one', 'dismiss that', 'don\'t show this'])
        is_why_request = any(p in t_low for p in ['why did you recommend', 'why this', 'explain why', 'reason for this', 'how does this match'])
        is_category_ban_request = any(p in t_low for p in ['don\'t show this category', 'no more of this category', 'different category'])
        
        # Follow-up Refinements
        is_edu_refinement = any(p in t_low for p in ['only educational', 'educational ones', 'make them educational', 'focus on learning', 'only stem', 'stem only']) and is_short_msg
        is_count_request = bool(extract_count(text) is not None and len(text.split()) <= 4)

        similar_to_id = None
        session_negative_items = set()
        reply_prefix = None
        
        if is_cheaper_request:
            curr_budget = session.get('max_budget') or 50.0
            new_budget = max(15.0, round(curr_budget * 0.70, 2))
            session['max_budget'] = new_budget
            memory.update_session(session_id, max_budget=new_budget)
            reply_prefix = f"Adjusted your budget filter to **under ${new_budget:.2f}**. Here are budget-conscious options from the catalog:"
            
        elif is_quality_request:
            session['min_rating'] = 4.8
            memory.update_session(session_id, min_rating=4.8)
            reply_prefix = "Prioritizing top-tier products with **4.8+ star ratings** and verified customer reviews. Here are the highest-quality candidates:"

        elif is_similar_request and last_items:
            target_item = last_items[0]
            if 'second' in t_low and len(last_items) > 1:
                target_item = last_items[1]
            similar_to_id = target_item['item_id']
            reply_prefix = f"Exploring items with strong topological co-occurrence to **'{target_item['title'][:40]}...'**:"
            
        elif is_remove_request and last_items:
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
        elif is_edu_refinement:
            session['is_educational'] = True
            reply_prefix = "Refining recommendations to focus strictly on verified **educational & STEM learning** items:"
        elif is_count_request:
            reply_prefix = f"Here are your updated recommendations based on your active criteria:"

        # -------------------------------------------------------------
        # STEP 2: Constraint Extraction & Ambiguity Handling
        # -------------------------------------------------------------
        constraints = self.extract_constraints(text, session)
        
        # Check if user message is a simple greeting or completely ambiguous
        is_greeting = any(w in t_low for w in ['hello', 'hi', 'hey', 'start', 'greetings']) and len(text.split()) <= 2
        is_vague = text.strip() in ['recommend something', 'show me items', 'what do you have', 'good options', 'i need something']
        
        if is_greeting:
            return {
                'reply': "Hello! I'm your Recoza personalized recommendation advisor. I can help you discover items from our verified Amazon Toys & Games catalog grounded in 14 community clusters. What kind of items are you looking for today?",
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
            
        if is_vague and not session.get('category_constraint') and not session.get('domain_type'):
            return {
                'reply': "I'd love to help! To give you the most accurate recommendations from our 2,399 verified catalog items, could you share what category or age group you're shopping for?",
                'items': [],
                'clarification_needed': True,
                'suggested_replies': [
                    "Building & Construction Sets",
                    "Puzzles & Family Board Games",
                    "STEM & Learning Toys",
                    "Card Games & Collectibles"
                ],
                'memory_summary': memory.to_dict(self.engine.item_to_comm)
            }

        # Handle category transition / switch
        if constraints['is_category_switch']:
            session['domain_type'] = constraints['domain_type']
            session['category_constraint'] = constraints['category_id']
            session['is_educational'] = constraints['is_educational']
            session['is_building'] = constraints['is_building']
            session['exclusions'] = constraints['exclusions']
            session['last_query'] = text
        else:
            if constraints['domain_type'] is not None:
                session['domain_type'] = constraints['domain_type']
            if constraints['category_id'] is not None:
                session['category_constraint'] = constraints['category_id']
            if constraints['is_educational']:
                session['is_educational'] = True
            if constraints['is_building']:
                session['is_building'] = True

        if constraints['max_budget'] is not None:
            session['max_budget'] = constraints['max_budget']
        if constraints['min_rating'] > 0:
            session['min_rating'] = constraints['min_rating']
        if constraints['exclusions']:
            session['exclusions'].update(constraints['exclusions'])
        if constraints['target_audience']:
            session['target_audience'] = constraints['target_audience']
        if constraints['requested_count']:
            session['requested_count'] = constraints['requested_count']
            
        # -------------------------------------------------------------
        # STEP 3: Candidate Retrieval & Verification
        # -------------------------------------------------------------
        target_cid = session.get('category_constraint')
        target_budget = session.get('max_budget')
        min_rat = session.get('min_rating', 0.0)
        excl_list = list(session.get('exclusions', set()))
        domain_type = session.get('domain_type')
        is_edu = session.get('is_educational', False)
        is_bld = session.get('is_building', False)
        top_k = session.get('requested_count', 4)

        # For follow-ups like "Only educational ones" or "Show five options", reuse prior substantive query if message is brief
        query_text = text
        if (is_edu_refinement or is_count_request or is_cheaper_request or is_quality_request) and len(text.split()) <= 4:
            if session.get('last_query'):
                query_text = session['last_query']

        recommended_items = self.ranker.recommend(
            memory=memory,
            query=query_text,
            top_k=top_k,
            community_id_filter=target_cid,
            max_budget=target_budget,
            min_rating=min_rat,
            exclusions=excl_list,
            session_negative_items=session_negative_items,
            similar_to_item_id=similar_to_id,
            enable_mmr=True,
            domain_type=domain_type,
            is_educational=is_edu,
            is_building=is_bld,
            target_audience=session.get('target_audience')
        )

        # Verification step: ensure every item exists in catalog and deduplicate by ASIN
        verified_items = []
        seen_asins = set()
        
        for it in recommended_items:
            asin = it['item_id']
            if asin in self.engine.items_meta and asin not in seen_asins:
                seen_asins.add(asin)
                exp = self.explainer.explain_item(it, memory, {
                    'query': query_text,
                    'category': COMMUNITY_NAMES.get(target_cid, ''),
                    'max_budget': target_budget,
                    'domain_type': domain_type,
                    'is_educational': is_edu,
                    'is_building': is_bld,
                    'target_audience': session.get('target_audience')
                })
                it_copy = dict(it)
                it_copy['explanation'] = exp
                verified_items.append(it_copy)

        # If no candidates met the criteria, handle gracefully without dumping unrelated popular items
        if not verified_items:
            criteria_parts = []
            if domain_type:
                criteria_parts.append(f"Domain: {domain_type}")
            if is_edu:
                criteria_parts.append("Educational/STEM focus")
            if is_bld:
                criteria_parts.append("Building/Construction mechanics")
            if target_budget:
                criteria_parts.append(f"Budget <= ${target_budget:.2f}")
            if min_rat > 0:
                criteria_parts.append(f"Rating >= {min_rat} stars")
            criteria_desc = ", ".join(criteria_parts) if criteria_parts else f"'{text}'"
            
            return {
                'reply': f"I could not find any items in our verified Amazon Toys & Games catalog meeting all your specific constraints ({criteria_desc}).\n\nPlease try relaxing your budget, lowering the rating filter, or exploring related product categories.",
                'items': [],
                'clarification_needed': False,
                'suggested_replies': [
                    "Show beginner-friendly building games",
                    "Recommend educational building toys",
                    "Cooperative family board games",
                    "STEM science and robotics kits"
                ],
                'memory_summary': memory.to_dict(self.engine.item_to_comm)
            }

        # Update session memory
        session['last_recommended_items'] = verified_items
        if not (is_edu_refinement or is_count_request or is_cheaper_request or is_quality_request):
            session['last_query'] = text
            
        memory.update_session(
            session_id,
            last_recommended_items=verified_items,
            last_query=session.get('last_query', text)
        )

        # -------------------------------------------------------------
        # STEP 4: Formulate Natural Language Response
        # -------------------------------------------------------------
        cat_name = COMMUNITY_NAMES.get(target_cid)
        budget_str = f" under ${target_budget:.2f}" if target_budget else ""
        
        if reply_prefix:
            reply = reply_prefix
        elif domain_type == 'games':
            reply = f"Here are verified recommendations for **games & tabletop puzzles**{budget_str}, ranked by graph connectivity and customer review confidence:"
        elif is_edu and is_bld:
            reply = f"Here are top verified **educational building & STEM toys**{budget_str}, ranked via community graph topology:"
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
            'category_detected': cat_name or (domain_type.capitalize() if domain_type else None),
            'items': verified_items,
            'clarification_needed': False,
            'suggested_replies': suggested,
            'extracted_constraints': {
                'domain_type': domain_type,
                'category': cat_name,
                'is_educational': is_edu,
                'is_building': is_bld,
                'max_budget': target_budget,
                'min_rating': min_rat,
                'exclusions': excl_list,
                'target_audience': session.get('target_audience')
            },
            'memory_summary': memory.to_dict(self.engine.item_to_comm)
        }
