"""
Recoza Dynamic Preference Memory
Implements exponential recency decay (alpha = 0.85),
dynamic community affinity tracking, and real-time feedback logging.
"""
import time
from collections import defaultdict

class UserMemory:
    def __init__(self, user_id: str = "guest", decay_factor: float = 0.85):
        self.user_id = user_id
        self.decay_factor = decay_factor
        self.history = []  # list of dicts: {'item_id': str, 'timestamp': float, 'title': str}
        self.liked_items = set()
        self.disliked_items = set()
        self.feedback_log = [] # list of dicts: {'item_id', 'type', 'timestamp', 'note'}
        self.conversational_queries = [] # list of user chat queries
        
    def add_interaction(self, item_id: str, title: str = ""):
        self.history.append({
            'item_id': item_id,
            'title': title,
            'timestamp': time.time()
        })

    def add_feedback(self, item_id: str, feedback_type: str, note: str = ""):
        # feedback_type: 'like', 'dislike', 'save', 'dismiss'
        now = time.time()
        if feedback_type in ['like', 'love', 'save']:
            self.liked_items.add(item_id)
            if item_id in self.disliked_items:
                self.disliked_items.remove(item_id)
        elif feedback_type in ['dislike', 'dismiss', 'hide']:
            self.disliked_items.add(item_id)
            if item_id in self.liked_items:
                self.liked_items.remove(item_id)
                
        self.feedback_log.append({
            'item_id': item_id,
            'type': feedback_type,
            'timestamp': now,
            'note': note
        })

    def add_query(self, query: str):
        if query and query.strip():
            self.conversational_queries.append({
                'query': query.strip(),
                'timestamp': time.time()
            })

    def get_weighted_history(self) -> dict:
        """
        Calculates exponential recency decay w_t = (0.85) ** (n - 1 - idx)
        with positive feedback boost (+50%) and negative suppression.
        """
        n = len(self.history)
        weighted = {}
        for idx, entry in enumerate(self.history):
            it = entry['item_id']
            if it in self.disliked_items:
                continue # completely suppress disliked items
            base_w = (self.decay_factor) ** (n - 1 - idx)
            if it in self.liked_items:
                base_w *= 1.5 # boost explicitly liked items
            weighted[it] = base_w
        return weighted

    def get_community_affinity(self, item_to_comm: dict) -> dict:
        weighted_hist = self.get_weighted_history()
        comm_weights = defaultdict(float)
        total_w = sum(weighted_hist.values()) + 1e-6
        
        for it, w in weighted_hist.items():
            cid = item_to_comm.get(it, -1)
            if cid != -1:
                comm_weights[cid] += w
                
        return {cid: round(w / total_w, 4) for cid, w in comm_weights.items()}

    def to_dict(self, item_to_comm: dict = None) -> dict:
        weighted = self.get_weighted_history()
        affinity = self.get_community_affinity(item_to_comm) if item_to_comm else {}
        return {
            'user_id': self.user_id,
            'history_count': len(self.history),
            'recent_history': self.history[-10:],
            'liked_count': len(self.liked_items),
            'disliked_count': len(self.disliked_items),
            'feedback_events': len(self.feedback_log),
            'decay_factor': self.decay_factor,
            'community_affinity': affinity,
            'weighted_history_summary': {it: round(w, 3) for it, w in list(weighted.items())[-5:]}
        }
