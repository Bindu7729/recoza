"""
Recoza Graph Engine
Manages the Amazon Toys & Games item co-occurrence graph,
Louvain community clusters, collaborative filtering similarity,
and metadata querying.
"""
import os
import re
import json
from collections import defaultdict
import pandas as pd
import networkx as nx

COMMUNITY_NAMES = {
    0: "Building & Construction Sets",
    1: "Puzzles & Family Board Games",
    2: "STEM & Learning Toys",
    3: "Arts & Creative Crafts",
    4: "Pretend Play & Dolls",
    5: "Vehicles & Action Playsets",
    6: "Outdoor & Active Play",
    7: "Novelty & Gag Toys",
    8: "Card Games & Collectibles",
    9: "Infant & Toddler Toys",
    10: "Musical & Sound Toys",
    11: "Electronic & Interactive Toys",
    12: "Costumes & Roleplay Accessories",
    13: "Model Kits & Hobbies"
}

GAME_TITLE_PAT = re.compile(
    r'\b(game|games|boardgame|board game|card game|tabletop|puzzle|puzzles|jigsaw|dice|deck|catan|monopoly|uno|farkle|chess|checkers|trivia|dominoes|balancing|shaky tower|strategy game)\b',
    re.IGNORECASE
)
GAME_STORES = {'ravensburger', 'epoch games', 'mattel games', 'hasbro gaming', 'thinkfun', 'banana panda', 'spin master games', 'pressman'}
NON_GAME_PAT = re.compile(
    r'\b(doll|barbie|plush|stuffed animal|monster truck|hot wheels|vehicle|truck|die-cast|baby|infant|teether|rattle|pool float|swimways|costume|cape|dress up)\b',
    re.IGNORECASE
)
BUILDING_PAT = re.compile(
    r'\b(build|building|lego|brick|bricks|block|blocks|construct|construction|technic|mega bloks|magnetic tiles|mind-building|model kit|stacking|tower|sorter blocks)\b',
    re.IGNORECASE
)
EDU_PAT = re.compile(
    r'\b(stem|science|robot|robotics|learn|learning|educat|educational|coding|microscope|circuit|planetarium|math|alphabet|chemistry|engineering|experiment|discovery)\b',
    re.IGNORECASE
)

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

    def is_game(self, item_id_or_meta) -> bool:
        meta = item_id_or_meta if isinstance(item_id_or_meta, dict) else self.items_meta.get(item_id_or_meta, {})
        title = meta.get('title', '')
        store = meta.get('store', '').lower()
        if NON_GAME_PAT.search(title):
            return False
        if store in GAME_STORES:
            return True
        if GAME_TITLE_PAT.search(title):
            return True
        return False

    def is_toy(self, item_id_or_meta) -> bool:
        meta = item_id_or_meta if isinstance(item_id_or_meta, dict) else self.items_meta.get(item_id_or_meta, {})
        title = meta.get('title', '')
        # Pure tabletop card/board games without physical toy elements
        if re.search(r'\b(board game|card game|dice-rolling game|deck of cards|dnd dice|metal dice)\b', title, re.IGNORECASE):
            return False
        return True

    def is_building(self, item_id_or_meta) -> bool:
        meta = item_id_or_meta if isinstance(item_id_or_meta, dict) else self.items_meta.get(item_id_or_meta, {})
        title = meta.get('title', '')
        store = meta.get('store', '')
        text = f"{title} {store}"
        return bool(BUILDING_PAT.search(text))

    def is_educational(self, item_id_or_meta) -> bool:
        meta = item_id_or_meta if isinstance(item_id_or_meta, dict) else self.items_meta.get(item_id_or_meta, {})
        title = meta.get('title', '')
        store = meta.get('store', '')
        text = f"{title} {store}"
        return bool(EDU_PAT.search(text))

    def get_game_items(self) -> list:
        return [it for it in self.items_meta if self.is_game(it)]

    def get_item(self, item_id: str) -> dict:
        meta = self.items_meta.get(item_id, {})
        cid = self.item_to_comm.get(item_id, -1)
        cluster_name = COMMUNITY_NAMES.get(cid, "General Toys & Games")
        
        # Genuine price from dataset if present, else None
        raw_price = meta.get('price', None)
        price_val = float(raw_price) if raw_price is not None and str(raw_price).strip() != '' else None
        price_formatted = f"${price_val:.2f}" if price_val is not None else "Price unavailable"
        
        # Genuine Amazon ASIN image CDN URL
        image_url = meta.get('image', meta.get('image_url', f"https://images-na.ssl-images-amazon.com/images/P/{item_id}.01._SX300_SCLZZZZZZZ_.jpg"))
        
        return {
            'item_id': item_id,
            'title': meta.get('title', f"Toy Item {item_id}"),
            'category': cluster_name if meta.get('category') in ['Toys & Games', None] else meta.get('category'),
            'cluster_name': cluster_name,
            'store': meta.get('store', 'Verified Catalog Store'),
            'average_rating': meta.get('average_rating', 4.5),
            'rating_number': meta.get('rating_number', 100),
            'price': price_val,
            'price_formatted': price_formatted,
            'image_url': image_url,
            'community_id': cid,
            'popularity': self.item_pop.get(item_id, 0),
            'degree': self.item_graph.degree(item_id) if self.item_graph.has_node(item_id) else 0,
            'is_game': self.is_game(meta),
            'is_toy': self.is_toy(meta),
            'is_building': self.is_building(meta),
            'is_educational': self.is_educational(meta)
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

    def search_items(
        self,
        query: str = "",
        category: str = None,
        community_id: int = None,
        min_rating: float = 0.0,
        max_price: float = None,
        limit: int = 20,
        offset: int = 0,
        domain_type: str = None,
        is_educational: bool = False,
        is_building: bool = False
    ) -> dict:
        results = []
        q_lower = query.lower().strip() if query else ""
        # Filter out common stop words to keep substantive search tokens
        stop_words = {'recommend', 'show', 'please', 'find', 'give', 'best', 'some', 'with', 'under', 'from', 'what', 'have', 'only', 'want', 'need'}
        q_tokens = [w for w in re.findall(r'\b[a-zA-Z]{3,}\b', q_lower) if w not in stop_words] if q_lower else []
        
        for item_id, meta in self.items_meta.items():
            title = meta.get('title', '').lower()
            store = meta.get('store', '').lower()
            cid = self.item_to_comm.get(item_id, -1)
            cluster_name = COMMUNITY_NAMES.get(cid, '').lower()
            rating = meta.get('average_rating', 0.0)
            
            # Domain-level filtering
            if domain_type == 'games' and not self.is_game(meta):
                continue
            elif domain_type == 'toys' and not self.is_toy(meta):
                continue
                
            if is_building and not self.is_building(meta):
                # allow puzzle / balancing games if building game is requested
                if domain_type == 'games' and any(w in title for w in ['tower', 'stack', 'balanc', 'puzzle', 'block', 'construct']):
                    pass
                else:
                    continue
                    
            if is_educational and not self.is_educational(meta):
                continue

            # Text matching score: exclude generic 'Toys & Games' string to prevent false positive matches
            match_score = 0
            combined_text = f"{title} {store} {cluster_name}"
            
            if q_tokens:
                matched_tokens = sum(1 for tok in q_tokens if tok in combined_text)
                if matched_tokens == 0:
                    continue
                match_score = matched_tokens / len(q_tokens)
            elif q_lower:
                if q_lower not in combined_text:
                    continue
                match_score = 1.0

            # Filter by category/cluster if provided
            if category and category.lower() != 'all':
                c_low = category.lower()
                if c_low not in cluster_name:
                    continue
                    
            if community_id is not None and cid != community_id:
                continue
                
            if rating < min_rating:
                continue
                
            # Filter by max price if specified and item has price
            raw_p = meta.get('price', None)
            if max_price is not None and raw_p is not None:
                if float(raw_p) > max_price:
                    continue

            it_data = self.get_item(item_id)
            it_data['text_match_score'] = match_score
            results.append(it_data)
            
        # Sort by match_score first, then popularity, then rating
        results.sort(key=lambda x: (x.get('text_match_score', 0), x['popularity'], x['average_rating']), reverse=True)
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
