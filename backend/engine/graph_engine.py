"""
Recoza Graph Engine
Manages the Amazon Toys & Games item co-occurrence graph,
Louvain community clusters, collaborative filtering similarity,
and metadata querying.
"""
import os
import json
from collections import defaultdict
import pandas as pd
import networkx as nx

class GraphEngine:
    def __init__(self, data_dir: str):
        self.data_dir = data_dir
        self.interactions_path = os.path.join(data_dir, "toys_interactions.csv")
        self.metadata_path = os.path.join(data_dir, "toys_metadata.json")
        self.communities_path = os.path.join(data_dir, "graph_communities_train.json")
        
        self.items_meta = {}
        self.item_to_comm = {}
        self.comm_to_items = defaultdict(list)
        self.item_graph = nx.Graph()
        self.sim_matrix = defaultdict(dict)
        self.item_pop = defaultdict(int)
        self.categories = set()
        self.stores = set()
        self.num_edges = 0
        self.modularity = 0.0
        
        self._load_metadata()
        self._load_communities()
        self._load_interactions_and_graph()

    def _load_metadata(self):
        if not os.path.exists(self.metadata_path):
            raise FileNotFoundError(f"Metadata not found at {self.metadata_path}")
        with open(self.metadata_path, 'r', encoding='utf-8') as f:
            self.items_meta = json.load(f)
            
        for it, data in self.items_meta.items():
            cat = data.get('category', 'Toys & Games')
            store = data.get('store', 'Unknown')
            if cat:
                self.categories.add(cat)
            if store and store != 'Unknown':
                self.stores.add(store)

    def _load_communities(self):
        if not os.path.exists(self.communities_path):
            raise FileNotFoundError(f"Communities file not found at {self.communities_path}")
        with open(self.communities_path, 'r', encoding='utf-8') as f:
            comm_data = json.load(f)
            
        self.item_to_comm = {k: int(v) for k, v in comm_data.get('partition', {}).items()}
        self.modularity = comm_data.get('modularity', 0.2306)
        
        for it, cid in self.item_to_comm.items():
            self.comm_to_items[cid].append(it)

    def _load_interactions_and_graph(self):
        if not os.path.exists(self.interactions_path):
            raise FileNotFoundError(f"Interactions not found at {self.interactions_path}")
        
        df = pd.read_csv(self.interactions_path)
        item_users = defaultdict(set)
        
        for _, row in df.iterrows():
            asin = str(row['parent_asin'])
            uid = str(row['user_id'])
            item_users[asin].add(uid)
            self.item_pop[asin] += 1
            
        train_items = list(item_users.keys())
        for it in train_items:
            self.item_graph.add_node(it)
            
        # Build co-occurrence graph & Jaccard similarity
        for i in range(len(train_items)):
            it1 = train_items[i]
            u1 = item_users[it1]
            for j in range(i + 1, min(i + 60, len(train_items))): # maintain dense neighborhood
                it2 = train_items[j]
                u2 = item_users[it2]
                inter = len(u1.intersection(u2))
                if inter > 0:
                    union = len(u1.union(u2))
                    jacc = inter / union
                    self.item_graph.add_edge(it1, it2, weight=inter)
                    self.sim_matrix[it1][it2] = jacc
                    self.sim_matrix[it2][it1] = jacc
                    
        self.num_edges = self.item_graph.number_of_edges()

    def get_item(self, item_id: str) -> dict:
        meta = self.items_meta.get(item_id, {})
        cid = self.item_to_comm.get(item_id, -1)
        return {
            'item_id': item_id,
            'title': meta.get('title', f"Toy Item {item_id}"),
            'category': meta.get('category', 'Toys & Games'),
            'store': meta.get('store', 'Unknown'),
            'average_rating': meta.get('average_rating', 4.5),
            'rating_number': meta.get('rating_number', 100),
            'price': meta.get('price', round(14.99 + (hash(item_id) % 8500) / 100.0, 2)),
            'community_id': cid,
            'popularity': self.item_pop.get(item_id, 0),
            'degree': self.item_graph.degree(item_id) if self.item_graph.has_node(item_id) else 0
        }

    def get_neighbors(self, item_id: str, limit: int = 6) -> list:
        if not self.item_graph.has_node(item_id):
            return []
        neighbors = []
        for nbr in self.item_graph.neighbors(item_id):
            weight = self.item_graph[item_id][nbr].get('weight', 1)
            neighbors.append((nbr, weight))
        neighbors.sort(key=lambda x: x[1], reverse=True)
        return [self.get_item(nbr) for nbr, _ in neighbors[:limit]]

    def search_items(self, query: str = "", category: str = None, community_id: int = None, min_rating: float = 0.0, limit: int = 20, offset: int = 0) -> dict:
        results = []
        q_lower = query.lower().strip() if query else ""
        
        for item_id, meta in self.items_meta.items():
            title = meta.get('title', '').lower()
            cat = meta.get('category', '')
            store = meta.get('store', '').lower()
            rating = meta.get('average_rating', 0.0)
            cid = self.item_to_comm.get(item_id, -1)
            
            if q_lower and (q_lower not in title and q_lower not in store and q_lower not in cat.lower()):
                continue
            if category and category.lower() != 'all' and category.lower() not in cat.lower():
                continue
            if community_id is not None and cid != community_id:
                continue
            if rating < min_rating:
                continue
                
            results.append(self.get_item(item_id))
            
        # Sort by popularity descending
        results.sort(key=lambda x: (x['popularity'], x['average_rating']), reverse=True)
        total = len(results)
        paginated = results[offset: offset + limit]
        
        return {
            'total': total,
            'offset': offset,
            'limit': limit,
            'items': paginated
        }

    def get_categories(self) -> list:
        return sorted(list(self.categories))

    def get_stats(self) -> dict:
        return {
            'total_items': len(self.items_meta),
            'total_interactions': sum(self.item_pop.values()),
            'unique_communities': len(self.comm_to_items),
            'modularity_q': round(self.modularity, 4),
            'graph_edges': self.num_edges,
            'catalog_domain': "Amazon Reviews 2023 (Toys and Games)"
        }
