"""
Recoza GraphRAG-MAR Ranking Pipeline
Performs candidate generation, joint community/CF scoring,
connectivity verification bonus, hard constraint filtering, and MMR diversity re-ranking.
"""
from collections import defaultdict
import re

try:
    from .graph_engine import GraphEngine
    from .memory import UserMemory
except (ImportError, ValueError):
    from engine.graph_engine import GraphEngine
    from engine.memory import UserMemory

class RecommenderRanker:
    def __init__(self, engine: GraphEngine):
        self.engine = engine

    def recommend(
        self,
        memory: UserMemory,
        query: str = "",
        top_k: int = 4,
        category_filter: str = None,
        community_id_filter: int = None,
        max_budget: float = None,
        min_rating: float = 0.0,
        exclusions: list = None,
        session_negative_items: set = None,
        similar_to_item_id: str = None,
        enable_mmr: bool = True,
        diversity_lambda: float = 0.65
    ) -> list:
        weighted_history = memory.get_weighted_history()
        disliked = set(memory.disliked_items)
        if session_negative_items:
            disliked.update(session_negative_items)
            
        seen_history_items = set(entry['item_id'] for entry in memory.history)
        exclusions_lower = [ex.lower().strip() for ex in (exclusions or []) if ex.strip()]
        
        # 1. Candidate Generation
        candidate_pool = set()
        
        # Scenario A: User specifically requested "similar to [item_id]"
        if similar_to_item_id and similar_to_item_id in self.engine.items_meta:
            nbrs = self.engine.get_neighbors(similar_to_item_id, limit=30)
            for nbr in nbrs:
                candidate_pool.add(nbr['item_id'])
            # Also add items from the same community
            sim_cid = self.engine.item_to_comm.get(similar_to_item_id, -1)
            if sim_cid != -1:
                for cit in self.engine.comm_to_items.get(sim_cid, [])[:30]:
                    candidate_pool.add(cit)
                    
        # Scenario B: Expand from graph neighbors of top weighted items in memory
        if weighted_history:
            top_recent = sorted(weighted_history.items(), key=lambda x: x[1], reverse=True)[:5]
            for it, _ in top_recent:
                nbrs = self.engine.get_neighbors(it, limit=15)
                for nbr in nbrs:
                    candidate_pool.add(nbr['item_id'])
                    
            # Add items from user's learned community affinities
            affinities = memory.get_community_affinity(self.engine.item_to_comm)
            for cid in sorted(affinities.keys(), key=lambda c: affinities[c], reverse=True)[:3]:
                comm_items = self.engine.comm_to_items.get(cid, [])
                for cit in comm_items[:25]:
                    candidate_pool.add(cit)

        # Scenario C: If query provided, search relevant items
        if query:
            search_res = self.engine.search_items(
                query=query,
                category=category_filter,
                community_id=community_id_filter,
                min_rating=min_rating,
                max_price=max_budget,
                limit=40
            )
            for it in search_res['items']:
                candidate_pool.add(it['item_id'])
                
        # Scenario D: If specific community filter provided
        if community_id_filter is not None:
            comm_items = self.engine.comm_to_items.get(community_id_filter, [])
            for cit in comm_items[:40]:
                candidate_pool.add(cit)

        # Cold-start fallback: Add top popular items
        if len(candidate_pool) < 20:
            top_pop = sorted(self.engine.item_pop.items(), key=lambda x: x[1], reverse=True)[:50]
            for it, _ in top_pop:
                candidate_pool.add(it)

        # 2. Hard Constraint Filtering & Verification
        valid_candidates = []
        for c in candidate_pool:
            # Must exist in dataset metadata
            if c not in self.engine.items_meta:
                continue
            # Must not be disliked or marked for removal
            if c in disliked:
                continue
                
            item_data = self.engine.get_item(c)
            
            # Category filter check
            if category_filter and category_filter.lower() != 'all':
                cat_lower = item_data['category'].lower()
                cluster_lower = item_data.get('cluster_name', '').lower()
                req_cat = category_filter.lower()
                if req_cat not in cat_lower and req_cat not in cluster_lower and not any(w in cat_lower or w in cluster_lower for w in req_cat.split()):
                    continue

            # Community ID filter check: if community is large enough (>= top_k), keep within community;
            # otherwise allow search candidates to provide diversity without returning empty lists.
            if community_id_filter is not None:
                comm_size = len(self.engine.comm_to_items.get(community_id_filter, []))
                if comm_size >= top_k:
                    if item_data.get('community_id') != community_id_filter:
                        continue
                    
            # Rating constraint
            if min_rating > 0 and item_data.get('average_rating', 0.0) < min_rating:
                continue
                
            # Budget constraint verification
            if max_budget is not None and item_data.get('price') is not None:
                if item_data['price'] > max_budget:
                    continue

            # Exclusions check
            if exclusions_lower:
                item_text = f"{item_data.get('title', '')} {item_data.get('store', '')} {item_data.get('category', '')}".lower()
                if any(ex in item_text for ex in exclusions_lower):
                    continue

            valid_candidates.append(c)

        if not valid_candidates:
            # Safe verified fallback: return items from popular set that exist
            valid_candidates = [
                it for it, _ in sorted(self.engine.item_pop.items(), key=lambda x: x[1], reverse=True)
                if it in self.engine.items_meta and it not in disliked
            ][:top_k * 2]

        # 3. Score Candidates
        user_comms = defaultdict(float)
        for h, w in weighted_history.items():
            cid = self.engine.item_to_comm.get(h, -1)
            if cid != -1:
                user_comms[cid] += w
        sum_w = sum(weighted_history.values()) + 1e-5

        scores = {}
        score_details = {}
        q_tokens = [w.lower() for w in re.findall(r'\b[a-zA-Z]{3,}\b', query)] if query else []

        for c in valid_candidates:
            cid = self.engine.item_to_comm.get(c, -1)
            comm_score = user_comms.get(cid, 0.0) / sum_w if weighted_history else 0.5
            if community_id_filter is not None and cid == community_id_filter:
                comm_score += 0.5
            
            # Collaborative Filtering Similarity Score
            if similar_to_item_id:
                cf_score = self.engine.sim_matrix.get(c, {}).get(similar_to_item_id, 0.0)
            elif weighted_history:
                cf_score = sum(w * self.engine.sim_matrix.get(c, {}).get(h, 0.0) for h, w in weighted_history.items())
            else:
                cf_score = min(1.0, self.engine.item_pop.get(c, 0) / 40.0)
                
            # Text relevance bonus
            q_bonus = 0.0
            if q_tokens:
                c_meta = self.engine.items_meta.get(c, {})
                title = c_meta.get('title', '').lower()
                store = c_meta.get('store', '').lower()
                cluster_str = self.engine.get_item(c).get('cluster_name', '').lower()
                search_corpus = f"{title} {store} {cluster_str}"
                matched = sum(1 for tok in q_tokens if tok in search_corpus)
                q_bonus = 0.35 * (matched / len(q_tokens))
                
            # Rating bonus
            rating_bonus = (self.engine.items_meta.get(c, {}).get('average_rating', 4.0) - 4.0) * 0.1

            # Topological connectivity verification bonus
            has_connection = (comm_score > 0.05 or cf_score > 0.01 or q_bonus > 0.1)
            verified_bonus = 0.05 if has_connection else -0.20
            
            final_score = 0.40 * comm_score + 0.35 * cf_score + q_bonus + rating_bonus + verified_bonus
            scores[c] = final_score
            score_details[c] = {
                'comm_score': round(comm_score, 4),
                'cf_score': round(cf_score, 4),
                'verified': has_connection,
                'final_score': round(final_score, 4)
            }

        # 4. Maximal Marginal Relevance (MMR) Diversity Re-Ranking
        sorted_cands = sorted(valid_candidates, key=lambda x: scores[x], reverse=True)
        
        if not enable_mmr:
            selected = sorted_cands[:top_k]
        else:
            selected = []
            selected_comms = defaultdict(int)
            remaining = sorted_cands.copy()
            
            while remaining and len(selected) < top_k:
                best_c = None
                best_mmr = -float('inf')
                for c in remaining[:30]:
                    cid = self.engine.item_to_comm.get(c, -1)
                    # Community redundancy penalty (controls cross-community variety)
                    diversity_penalty = (1.0 - diversity_lambda) * (0.25 * selected_comms[cid])
                    # Discovery penalty if item was seen in user history
                    seen_penalty = 0.10 if c in seen_history_items else 0.0
                    
                    mmr_val = scores[c] - diversity_penalty - seen_penalty
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

        # Package verified output
        results = []
        for it in selected:
            item_obj = self.engine.get_item(it)
            item_obj['ranking_meta'] = score_details.get(it, {})
            results.append(item_obj)
            
        return results
