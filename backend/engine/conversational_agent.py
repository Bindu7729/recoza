"""
Recoza Conversational Multi-Agent Dialogue Manager
Extracts intents and constraints from chat dialogues, updates dynamic memory,
and coordinates recommendation and explanation generation.
"""
try:
    from .graph_engine import GraphEngine
    from .memory import UserMemory
    from .ranking import RecommenderRanker
    from .explainer import RecommendationExplainer
except (ImportError, ValueError):
    from engine.graph_engine import GraphEngine
    from engine.memory import UserMemory
    from engine.ranking import RecommenderRanker
    from engine.explainer import RecommendationExplainer

class ConversationalAgent:
    def __init__(self, engine: GraphEngine, ranker: RecommenderRanker, explainer: RecommendationExplainer):
        self.engine = engine
        self.ranker = ranker
        self.explainer = explainer

    def process_message(self, message: str, memory: UserMemory) -> dict:
        text = message.strip()
        memory.add_query(text)
        
        # 1. Intent extraction
        t_lower = text.lower()
        extracted_category = None
        for cat in self.engine.categories:
            if cat.lower() in t_lower or any(word in t_lower for word in cat.lower().split() if len(word) > 3):
                extracted_category = cat
                break
                
        # Keyword checks
        if not extracted_category:
            if any(k in t_lower for k in ['puzzle', 'jigsaw', 'brain teaser']):
                extracted_category = 'Puzzles'
            elif any(k in t_lower for k in ['game', 'board game', 'card game']):
                extracted_category = 'Games'
            elif any(k in t_lower for k in ['doll', 'barbie', 'figure', 'action figure']):
                extracted_category = 'Dolls & Accessories'
            elif any(k in t_lower for k in ['build', 'lego', 'block', 'stem', 'construct']):
                extracted_category = 'Building Toys'
            elif any(k in t_lower for k in ['outdoor', 'sports', 'ride', 'bike']):
                extracted_category = 'Sports & Outdoor Play'
            elif any(k in t_lower for k in ['car', 'vehicle', 'truck', 'hot wheels']):
                extracted_category = 'Play Vehicles'

        # 2. Get recommendations
        recommended_items = self.ranker.recommend(
            memory=memory,
            query=text,
            top_k=4,
            category_filter=extracted_category
        )

        # 3. Attach explanations to each recommendation
        explained_items = []
        for it in recommended_items:
            exp = self.explainer.explain_item(it, memory)
            it_copy = dict(it)
            it_copy['explanation'] = exp
            explained_items.append(it_copy)

        # 4. Formulate conversational response
        if extracted_category:
            reply = f"I found some top-rated options in **{extracted_category}** that align with your request and your active preference history. Here are my verified recommendations:"
        elif any(w in t_lower for w in ['hello', 'hi', 'hey', 'start']):
            reply = "Hello! I'm your Recoza AI shopping assistant. Tell me what kind of toys, games, or hobbies you're looking for, and I'll find graph-grounded recommendations from our catalog!"
        elif any(w in t_lower for w in ['why', 'explain', 'reason']):
            reply = "Every recommendation here is verified through our item co-occurrence graph and your recent interactions. You can click 'Why this?' on any item below to inspect the full reasoning path!"
        else:
            reply = f"Based on your query '{text}' and our dynamic community graph, here are the top matching items selected for relevance and variety:"

        return {
            'reply': reply,
            'category_detected': extracted_category,
            'items': explained_items,
            'memory_summary': memory.to_dict(self.engine.item_to_comm)
        }
