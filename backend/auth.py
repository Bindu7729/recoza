"""
Recoza User Session & Authentication Store
Manages guest sessions, registered users, and pre-seeded evaluation profiles
from the authentic Amazon Toys & Games dataset.
"""
from collections import defaultdict
try:
    from .engine.memory import UserMemory
except (ImportError, ValueError):
    from engine.memory import UserMemory

class AuthStore:
    def __init__(self, graph_engine):
        self.graph_engine = graph_engine
        self.users = {}       # username -> {password, name, user_id}
        self.sessions = {}    # user_id -> UserMemory
        
        self._seed_demo_users()

    def _seed_demo_users(self):
        # 1. Demo User: Strategy & Puzzles Enthusiast
        u1 = "sarah_games"
        self.users[u1] = {"username": u1, "name": "Sarah Jenkins", "user_id": "u_demo_1", "role": "Collector"}
        mem1 = UserMemory("u_demo_1")
        # Add a few real items from community 0/1
        sample_items = list(self.graph_engine.items_meta.keys())[:3]
        for it in sample_items:
            mem1.add_interaction(it, self.graph_engine.items_meta[it].get('title', ''))
        self.sessions["u_demo_1"] = mem1

        # 2. Demo User: Vehicles & Building Sets Fan
        u2 = "alex_builder"
        self.users[u2] = {"username": u2, "name": "Alex Rivera", "user_id": "u_demo_2", "role": "Builder"}
        mem2 = UserMemory("u_demo_2")
        sample_items2 = list(self.graph_engine.items_meta.keys())[10:14]
        for it in sample_items2:
            mem2.add_interaction(it, self.graph_engine.items_meta[it].get('title', ''))
        self.sessions["u_demo_2"] = mem2

        # 3. Default Guest
        self.sessions["guest"] = UserMemory("guest")

    def get_or_create_memory(self, user_id: str) -> UserMemory:
        if not user_id:
            user_id = "guest"
        if user_id not in self.sessions:
            self.sessions[user_id] = UserMemory(user_id)
        return self.sessions[user_id]

    def login(self, username: str) -> dict:
        u = self.users.get(username)
        if not u:
            # Auto-create lightweight user
            user_id = f"user_{len(self.users) + 1}"
            u = {"username": username, "name": username.title(), "user_id": user_id, "role": "Member"}
            self.users[username] = u
            self.sessions[user_id] = UserMemory(user_id)
            
        return {
            "success": True,
            "user": u,
            "token": f"token_{u['user_id']}"
        }

    def list_demo_users(self) -> list:
        return [
            {"username": u['username'], "name": u['name'], "user_id": u['user_id'], "role": u['role']}
            for u in self.users.values()
        ]
