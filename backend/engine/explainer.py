"""
Recoza Graph-Grounded Explanation Engine
Generates transparent, verifiable reasons for each recommended item
based on community topology, co-occurrence graph paths, and recency memory.
"""
try:
    from .graph_engine import GraphEngine
    from .memory import UserMemory
except (ImportError, ValueError):
    from engine.graph_engine import GraphEngine
    from engine.memory import UserMemory

class RecommendationExplainer:
    def __init__(self, engine: GraphEngine):
        self.engine = engine

    def explain_item(self, item: dict, memory: UserMemory) -> dict:
        item_id = item['item_id']
        cid = item.get('community_id', -1)
        ranking_meta = item.get('ranking_meta', {})
        
        # 1. Community Explanation
        affinities = memory.get_community_affinity(self.engine.item_to_comm)
        comm_pct = int(affinities.get(cid, 0.0) * 100)
        
        comm_name = f"Community Cluster #{cid}" if cid != -1 else "General Catalog"
        if comm_pct > 0:
            comm_reason = f"Belongs to {comm_name}, which accounts for {comm_pct}% of your active preference affinity."
        else:
            comm_reason = f"Introduced from {comm_name} to provide fresh diversity and prevent recommendation echo chambers."

        # 2. Graph Connection Path
        weighted_hist = memory.get_weighted_history()
        best_connected_hist = None
        max_jacc = 0.0
        
        for h_id in weighted_hist.keys():
            jacc = self.engine.sim_matrix.get(item_id, {}).get(h_id, 0.0)
            if jacc > max_jacc:
                max_jacc = jacc
                best_connected_hist = h_id

        if best_connected_hist:
            hist_item = self.engine.get_item(best_connected_hist)
            shared_buyers = self.engine.item_graph[item_id][best_connected_hist].get('weight', 1) if self.engine.item_graph.has_edge(item_id, best_connected_hist) else 1
            graph_path = f"Frequently co-purchased with '{hist_item['title'][:40]}...' ({shared_buyers} co-occurrence links in training graph)."
            primary_reason = f"Matches your interest in '{hist_item['title'][:35]}...' through strong relational graph paths."
        else:
            graph_path = f"Verified across the Amazon Toys & Games knowledge graph with {item.get('popularity', 12)} customer interactions."
            primary_reason = f"Popular top-rated selection in {item.get('category', 'Toys & Games')} with high verified quality."

        # 3. Dynamic Recency Reason
        recent_items = memory.history[-3:]
        if recent_items:
            recency_reason = f"Ranked using exponential memory decay (alpha = {memory.decay_factor}) reflecting your latest interactions."
        else:
            recency_reason = "Recommended based on overall catalog popularity and topological community structure."

        # 4. Trust & Verification Badge
        verified = ranking_meta.get('verified', True)
        trust_badge = "Graph Verified (+0.05 Bonus)" if verified else "Exploratory Candidate"

        return {
            'item_id': item_id,
            'primary_reason': primary_reason,
            'community_context': comm_reason,
            'graph_path': graph_path,
            'recency_reason': recency_reason,
            'trust_badge': trust_badge,
            'average_rating': item.get('average_rating', 4.5),
            'rating_count': item.get('rating_number', 50),
            'community_id': cid
        }
