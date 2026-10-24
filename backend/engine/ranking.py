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
        diversity_lambda: float = 0.65,
        domain_type: str = None,
        is_educational: bool = False,
        is_building: bool = False,
        target_audience: str = None
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
                    
            affinities = memory.get_community_affinity(self.engine.item_to_comm)
            for cid in sorted(affinities.keys(), key=lambda c: affinities[c], reverse=True)[:3]:
                comm_items = self.engine.comm_to_items.get(cid, [])
                for cit in comm_items[:25]:
                    candidate_pool.add(cit)

        # Scenario C: Search relevant items using text query and domain filters
        if query or is_building or is_educational or domain_type:
            search_res = self.engine.search_items(
                query=query,
                category=category_filter,
                community_id=community_id_filter if not query else None,
                min_rating=min_rating,
                max_price=max_budget,
                limit=60,
                domain_type=domain_type,
                is_educational=is_educational,
                is_building=is_building
            )
            for it in search_res['items']:
                candidate_pool.add(it['item_id'])

        # Scenario D: If specific domain is games, include all verified games in candidate pool
        if domain_type == 'games':
            for git in self.engine.get_game_items():
                candidate_pool.add(git)
                
        # Scenario E: If specific community filter provided
        if community_id_filter is not None:
            comm_items = self.engine.comm_to_items.get(community_id_filter, [])
            for cit in comm_items[:40]:
                candidate_pool.add(cit)

        # Cold-start fallback: Add popular items if pool is small and no hard domain restriction
        if len(candidate_pool) < top_k * 2 and not query and not domain_type:
            top_pop = sorted(self.engine.item_pop.items(), key=lambda x: x[1], reverse=True)[:50]
            for it, _ in top_pop:
                candidate_pool.add(it)

        # 2. Hard Constraint Filtering & Verification
        valid_candidates = []
        for c in candidate_pool:
            if c not in self.engine.items_meta:
                continue
            if c in disliked:
                continue
                
            item_data = self.engine.get_item(c)
            
            # Domain constraint check (Games vs Toys)
            if domain_type == 'games' and not self.engine.is_game(item_data):
                continue
            elif domain_type == 'toys' and not self.engine.is_toy(item_data):
                continue

            # Building constraint check
            if is_building and not self.engine.is_building(item_data):
                if domain_type == 'games' and any(w in item_data['title'].lower() for w in ['tower', 'stack', 'balanc', 'puzzle', 'block', 'construct', 'maze']):
                    pass
                else:
                    continue

            # Educational constraint check
            if is_educational and not self.engine.is_educational(item_data):
                continue

            # Category filter check
            if category_filter and category_filter.lower() != 'all':
                cluster_lower = item_data.get('cluster_name', '').lower()
                req_cat = category_filter.lower()
                if req_cat not in cluster_lower and not any(w in cluster_lower for w in req_cat.split()):
                    continue

            # Community ID filter check: only hard-filter by community when exploring without a specific search query
            if community_id_filter is not None and not query:
                comm_size = len(self.engine.comm_to_items.get(community_id_filter, []))
                if comm_size >= top_k:
                    if item_data.get('community_id') != community_id_filter:
                        continue
                    
            # Rating constraint
            if min_rating > 0 and item_data.get('average_rating', 0.0) < min_rating:
                continue
                
            # Budget constraint verification
            if max_budget is not None:
                if item_data.get('price') is not None:
                    if item_data['price'] > max_budget:
                        continue
                elif max_budget < 5.0: # Unrealistic budget threshold for verified catalog toys/games
                    continue

            # Exclusions check
            if exclusions_lower:
                item_text = f"{item_data.get('title', '')} {item_data.get('store', '')} {item_data.get('cluster_name', '')}".lower()
                if any(ex in item_text for ex in exclusions_lower):
                    continue

            valid_candidates.append(c)

        # If strict constraints returned no items, DO NOT substitute with random popular items!
        # Return empty list so the system gracefully informs the user.
        if not valid_candidates:
            return []

        # 3. Score Candidates
        user_comms = defaultdict(float)
        for h, w in weighted_history.items():
            cid = self.engine.item_to_comm.get(h, -1)
            if cid != -1:
                user_comms[cid] += w
        sum_w = sum(weighted_history.values()) + 1e-5

        scores = {}
        score_details = {}
        stop_words = {'recommend', 'show', 'please', 'find', 'give', 'best', 'some', 'with', 'under', 'from', 'what', 'have', 'only', 'want', 'need'}
        q_tokens = [w.lower() for w in re.findall(r'\b[a-zA-Z]{3,}\b', query) if w.lower() not in stop_words] if query else []

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
                
            # Text & feature relevance bonus
            q_bonus = 0.0
            c_meta = self.engine.items_meta.get(c, {})
            title = c_meta.get('title', '').lower()
            store = c_meta.get('store', '').lower()
            cluster_str = self.engine.get_item(c).get('cluster_name', '').lower()
            search_corpus = f"{title} {store} {cluster_str}"

            if q_tokens:
                matched = sum(1 for tok in q_tokens if tok in search_corpus)
                q_bonus = 0.40 * (matched / len(q_tokens))
                
            # Additional boost if item has a rich real title vs synthetic "Toy Item"
            if not title.startswith("toy item "):
                q_bonus += 0.20
                
            # Domain bonus
            if domain_type == 'games' and self.engine.is_game(c_meta):
                q_bonus += 0.25
            if is_educational and self.engine.is_educational(c_meta):
                q_bonus += 0.20
            if is_building and self.engine.is_building(c_meta):
                q_bonus += 0.20
                
            # Rating bonus
            rating_bonus = (self.engine.items_meta.get(c, {}).get('average_rating', 4.0) - 4.0) * 0.15

            # Topological connectivity verification bonus
            has_connection = (comm_score > 0.05 or cf_score > 0.01 or q_bonus > 0.1)
            verified_bonus = 0.05 if has_connection else -0.10
            
            final_score = 0.35 * comm_score + 0.30 * cf_score + q_bonus + rating_bonus + verified_bonus
            scores[c] = final_score
            score_details[c] = {
                'comm_score': round(comm_score, 4),
                'cf_score': round(cf_score, 4),
                'verified': has_connection,
                'final_score': round(final_score, 4)
            }

        # 4. Maximal Marginal Relevance (MMR) Diversity Re-Ranking with Strict ASIN Deduplication
        sorted_cands = sorted(valid_candidates, key=lambda x: scores[x], reverse=True)
        
        selected = []
        selected_asins = set()
        
        if not enable_mmr:
            for it in sorted_cands:
                if it not in selected_asins:
                    selected.append(it)
                    selected_asins.add(it)
                if len(selected) >= top_k:
                    break
        else:
            selected_comms = defaultdict(int)
            remaining = sorted_cands.copy()
            
            while remaining and len(selected) < top_k:
                best_c = None
                best_mmr = -float('inf')
                for c in remaining[:30]:
                    if c in selected_asins:
                        continue
                    cid = self.engine.item_to_comm.get(c, -1)
                    diversity_penalty = (1.0 - diversity_lambda) * (0.25 * selected_comms[cid])
                    seen_penalty = 0.10 if c in seen_history_items else 0.0
                    
                    mmr_val = scores[c] - diversity_penalty - seen_penalty
                    if mmr_val > best_mmr:
                        best_mmr = mmr_val
                        best_c = c
                        
                if best_c and best_c not in selected_asins:
                    selected.append(best_c)
                    selected_asins.add(best_c)
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
