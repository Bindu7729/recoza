"""
Recoza GraphRAG-MAR Ranking Pipeline
Performs candidate generation, joint community/CF scoring,
connectivity verification bonus, and MMR diversity re-ranking.
"""
from collections import defaultdict
try:
    from .graph_engine import GraphEngine
    from .memory import UserMemory
except (ImportError, ValueError):
    from engine.graph_engine import GraphEngine
    from engine.memory import UserMemory

class RecommenderRanker:
    def __init__(self, engine: GraphEngine):
        self.engine = engine

    def recommend(self, memory: UserMemory, query: str = "", top_k: int = 8, category_filter: str = None) -> list:
        weighted_history = memory.get_weighted_history()
        disliked = memory.disliked_items
        seen_history_items = set(entry['item_id'] for entry in memory.history)
        
        # 1. Candidate Generation
        candidate_pool = set()
        
        # If user has history, expand from graph neighbors of top weighted items
        if weighted_history:
            top_recent = sorted(weighted_history.items(), key=lambda x: x[1], reverse=True)[:5]
            for it, _ in top_recent:
                nbrs = self.engine.get_neighbors(it, limit=15)
                for nbr in nbrs:
                    candidate_pool.add(nbr['item_id'])
                    
            # Also add items from user's top communities
            affinities = memory.get_community_affinity(self.engine.item_to_comm)
            for cid in sorted(affinities.keys(), key=lambda c: affinities[c], reverse=True)[:2]:
                comm_items = self.engine.comm_to_items.get(cid, [])
                for cit in comm_items[:25]:
                    candidate_pool.add(cit)
                    
        # If query provided, search relevant items and add to candidates
        if query:
            search_res = self.engine.search_items(query=query, limit=30)
            for it in search_res['items']:
                candidate_pool.add(it['item_id'])
                
        # If pool still small (e.g. cold start), add top popular items
        if len(candidate_pool) < 20:
            top_pop = sorted(self.engine.item_pop.items(), key=lambda x: x[1], reverse=True)[:40]
            for it, _ in top_pop:
                candidate_pool.add(it)

        # Remove disliked and filter by category if needed
        valid_candidates = []
        for c in candidate_pool:
            if c in disliked:
                continue
            item_data = self.engine.get_item(c)
            if category_filter and category_filter.lower() != 'all':
                if category_filter.lower() not in item_data['category'].lower():
                    continue
            valid_candidates.append(c)

        if not valid_candidates:
            # Fallback to general popular items
            valid_candidates = [it for it, _ in sorted(self.engine.item_pop.items(), key=lambda x: x[1], reverse=True)[:top_k]]

        # 2. Score Candidates
        user_comms = defaultdict(float)
        for h, w in weighted_history.items():
            cid = self.engine.item_to_comm.get(h, -1)
            if cid != -1:
                user_comms[cid] += w
        sum_w = sum(weighted_history.values()) + 1e-5

        scores = {}
        score_details = {}
        for c in valid_candidates:
            cid = self.engine.item_to_comm.get(c, -1)
            comm_score = user_comms.get(cid, 0.0) / sum_w if weighted_history else 0.5
            
            # Collaborative Filtering Similarity Score
            cf_score = 0.0
            if weighted_history:
                cf_score = sum(w * self.engine.sim_matrix.get(c, {}).get(h, 0.0) for h, w in weighted_history.items())
            else:
                cf_score = min(1.0, self.engine.item_pop.get(c, 0) / 50.0)
                
            # Query match bonus if query exists
            q_bonus = 0.0
            if query:
                c_meta = self.engine.items_meta.get(c, {})
                title = c_meta.get('title', '').lower()
                q_words = query.lower().split()
                matched = sum(1 for w in q_words if w in title)
                q_bonus = 0.3 * (matched / len(q_words)) if q_words else 0.0

            # Connectivity verification
            has_connection = (comm_score > 0.05 or cf_score > 0.01 or q_bonus > 0.1)
            verified_bonus = 0.05 if has_connection else -0.30
            
            final_score = 0.50 * comm_score + 0.45 * cf_score + q_bonus + verified_bonus
            scores[c] = final_score
            score_details[c] = {
                'comm_score': round(comm_score, 4),
                'cf_score': round(cf_score, 4),
                'verified': has_connection,
                'final_score': round(final_score, 4)
            }

        # 3. Maximal Marginal Relevance (MMR) Diversity Re-Ranking
        sorted_cands = sorted(valid_candidates, key=lambda x: scores[x], reverse=True)
        selected = []
        selected_comms = defaultdict(int)
        
        remaining = sorted_cands.copy()
        while remaining and len(selected) < top_k:
            best_c = None
            best_mmr = -float('inf')
            for c in remaining[:25]:
                cid = self.engine.item_to_comm.get(c, -1)
                # Penalize multiple items from the same topological community
                pen = 0.12 * selected_comms[cid]
                # Slight penalty if item was already in history to encourage discovery
                seen_pen = 0.15 if c in seen_history_items else 0.0
                mmr_val = scores[c] - pen - seen_pen
                if mmr_val > best_mmr:
                    best_mmr = mmr_val
                    best_c = c
            if best_c:
                selected.append(best_c)
                cid = self.engine.item_to_comm.get(best_c, -1)
                selected_comms[cid] += 1
                remaining.remove(best_c)
            else:
                break

        # Package results with full item data and ranking metadata
        results = []
        for it in selected:
            item_obj = self.engine.get_item(it)
            item_obj['ranking_meta'] = score_details.get(it, {})
            results.append(item_obj)
            
        return results
