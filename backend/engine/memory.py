"""
Recoza Dynamic Preference Memory
Implements exponential recency decay (alpha = 0.85),
short-term session context vs long-term persistent preference separation,
and observable feedback logging with structured rejection reasons.
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
        self.saved_items = set()
        self.feedback_log = [] # list of dicts: {'item_id', 'type', 'reason', 'timestamp', 'note'}
        self.conversational_queries = []
        
        # Short-term session preferences (separated from persistent profile preferences)
        self.session_states = defaultdict(lambda: {
            'last_recommended_items': [],
            'domain_type': None,
            'category_constraint': None,
            'is_educational': False,
            'is_building': False,
            'requested_count': 4,
            'max_budget': None,
            'min_rating': 0.0,
            'exclusions': set(),
            'target_audience': None,
            'playstyle': None,
            'last_query': ''
        })
        
    def get_session(self, session_id: str) -> dict:
        sess_key = session_id or "default"
        return self.session_states[sess_key]

    def update_session(self, session_id: str, **kwargs):
        sess = self.get_session(session_id)
        for k, v in kwargs.items():
            if k == 'exclusions' and isinstance(v, (set, list)):
                sess['exclusions'].update(v)
            else:
                sess[k] = v

    def add_interaction(self, item_id: str, title: str = ""):
        self.history.append({
            'item_id': item_id,
            'title': title,
            'timestamp': time.time()
        })

    def add_feedback(self, item_id: str, feedback_type: str, reason: str = "", note: str = ""):
        """
        Records structured item-level feedback.
        feedback_type: 'like', 'dislike', 'save', 'unsave', 'irrelevant'
        reason: 'outside_budget', 'wrong_category', 'poor_recommendation', 'already_own', 'other'
        """
        now = time.time()
        
        if feedback_type in ['like', 'love']:
            self.liked_items.add(item_id)
            self.disliked_items.discard(item_id)
        elif feedback_type in ['dislike', 'dismiss', 'hide', 'irrelevant']:
            self.disliked_items.add(item_id)
            self.liked_items.discard(item_id)
        elif feedback_type == 'save':
            self.saved_items.add(item_id)
            self.liked_items.add(item_id)
        elif feedback_type == 'unsave':
            self.saved_items.discard(item_id)
            
        record = {
            'item_id': item_id,
            'type': feedback_type,
            'reason': reason or ('Not specified' if feedback_type == 'dislike' else ''),
            'timestamp': now,
            'note': note or ''
        }
        self.feedback_log.append(record)
        return record

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
            'saved_count': len(self.saved_items),
            'feedback_events': len(self.feedback_log),
            'decay_factor': self.decay_factor,
            'community_affinity': affinity,
            'weighted_history_summary': {it: round(w, 3) for it, w in list(weighted.items())[-5:]}
        }
