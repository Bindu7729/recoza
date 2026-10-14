"""
Recoza Persistent Storage Module
Manages users, authentication, preferences, saved items, and chat history
persisted in JSON format.
"""
import os
import json
import time
import hashlib
import uuid
from typing import Optional, List, Dict, Any

STORAGE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "user_store.json")

def hash_password(password: str, salt: str = "recoza_salt_2026") -> str:
    return hashlib.sha256(f"{salt}_{password}".encode('utf-8')).hexdigest()

class PersistentStore:
    def __init__(self, filepath: str = STORAGE_PATH):
        self.filepath = filepath
        self.data = {
            "users": {},         # user_id -> user_dict
            "email_to_id": {},   # email -> user_id
            "saved_items": {},   # user_id -> list of item_ids
            "chat_sessions": {}, # user_id -> list of session_dicts
        }
        self._load()
        self._seed_demo_accounts()

    def _load(self):
        if os.path.exists(self.filepath):
            try:
                with open(self.filepath, 'r', encoding='utf-8') as f:
                    saved = json.load(f)
                    self.data.update(saved)
            except Exception as e:
                print(f"Warning: Failed to load storage from {self.filepath}: {e}")

    def _save(self):
        try:
            os.makedirs(os.path.dirname(self.filepath), exist_ok=True)
            with open(self.filepath, 'w', encoding='utf-8') as f:
                json.dump(self.data, f, indent=2)
        except Exception as e:
            print(f"Error saving persistent store: {e}")

    def _seed_demo_accounts(self):
        demo_accounts = [
            {
                "user_id": "u_demo_alex",
                "name": "Alex Rivera",
                "email": "alex@recoza.io",
                "password_hash": hash_password("recoza123"),
                "is_first_time": False,
                "role": "Creative Builder",
                "created_at": time.time() - 86400 * 5,
                "preferences": {
                    "interests": ["Building & Construction Sets", "STEM & Learning Toys"],
                    "relevance_weight": 85,
                    "familiarity_weight": 60,
                    "discovery_weight": 75,
                    "priority_mode": True,
                    "price_range": [10, 120]
                },
                "saved_items": ["B00NHQF65S", "B07BMH5L8B"]
            },
            {
                "user_id": "u_demo_sarah",
                "name": "Sarah Jenkins",
                "email": "sarah@recoza.io",
                "password_hash": hash_password("recoza123"),
                "is_first_time": False,
                "role": "Collector & Educator",
                "created_at": time.time() - 86400 * 3,
                "preferences": {
                    "interests": ["Puzzles & Family Board Games", "Arts & Creative Crafts"],
                    "relevance_weight": 90,
                    "familiarity_weight": 70,
                    "discovery_weight": 65,
                    "priority_mode": True,
                    "price_range": [15, 80]
                },
                "saved_items": ["B09M7XZ33P", "B0BVKDKNDH"]
            }
        ]

        for acc in demo_accounts:
            uid = acc["user_id"]
            if uid not in self.data["users"]:
                self.data["users"][uid] = {
                    "user_id": uid,
                    "name": acc["name"],
                    "email": acc["email"],
                    "password_hash": acc["password_hash"],
                    "is_first_time": acc["is_first_time"],
                    "role": acc["role"],
                    "created_at": acc["created_at"],
                    "preferences": acc["preferences"]
                }
                self.data["email_to_id"][acc["email"].lower()] = uid
                self.data["saved_items"][uid] = acc["saved_items"]
                self.data["chat_sessions"][uid] = [
                    {
                        "session_id": f"sess_{uid}_1",
                        "title": f"Initial {acc['role']} Exploration",
                        "created_at": acc["created_at"],
                        "updated_at": acc["created_at"] + 3600,
                        "messages": [
                            {
                                "id": "m1",
                                "sender": "user",
                                "text": "Looking for high quality sets with good reviews",
                                "timestamp": acc["created_at"]
                            },
                            {
                                "id": "m2",
                                "sender": "assistant",
                                "text": "Found verified items in your primary interest communities with verified graph co-occurrences.",
                                "timestamp": acc["created_at"] + 2,
                                "items": []
                            }
                        ]
                    }
                ]
        self._save()

    def register_user(self, name: str, email: str, password: str) -> Dict[str, Any]:
        email_clean = email.strip().lower()
        if email_clean in self.data["email_to_id"]:
            raise ValueError("An account with this email already exists.")

        user_id = f"user_{uuid.uuid4().hex[:10]}"
        now = time.time()
        user_record = {
            "user_id": user_id,
            "name": name.strip(),
            "email": email_clean,
            "password_hash": hash_password(password),
            "is_first_time": True,  # Flag for onboarding preference setup
            "role": "Member",
            "created_at": now,
            "preferences": {
                "interests": [],
                "relevance_weight": 75,
                "familiarity_weight": 60,
                "discovery_weight": 70,
                "priority_mode": True,
                "price_range": [0, 200]
            }
        }

        self.data["users"][user_id] = user_record
        self.data["email_to_id"][email_clean] = user_id
        self.data["saved_items"][user_id] = []
        self.data["chat_sessions"][user_id] = []
        self._save()

        # Return safe user profile without password_hash
        safe_user = dict(user_record)
        del safe_user["password_hash"]
        return safe_user

    def authenticate_user(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        email_clean = email.strip().lower()
        user_id = self.data["email_to_id"].get(email_clean)
        if not user_id or user_id not in self.data["users"]:
            return None

        user = self.data["users"][user_id]
        if user["password_hash"] != hash_password(password):
            return None

        safe_user = dict(user)
        del safe_user["password_hash"]
        return safe_user

    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        user = self.data["users"].get(user_id)
        if not user:
            return None
        safe = dict(user)
        safe.pop("password_hash", None)
        return safe

    def save_preferences(self, user_id: str, preferences: Dict[str, Any]) -> Dict[str, Any]:
        if user_id not in self.data["users"]:
            raise ValueError("User not found.")

        # Update preferences and mark first-time setup as complete
        self.data["users"][user_id]["preferences"].update(preferences)
        self.data["users"][user_id]["is_first_time"] = False
        self._save()

        safe = dict(self.data["users"][user_id])
        safe.pop("password_hash", None)
        return safe

    def get_preferences(self, user_id: str) -> Dict[str, Any]:
        user = self.data["users"].get(user_id)
        if not user:
            return {
                "interests": [],
                "relevance_weight": 75,
                "familiarity_weight": 60,
                "discovery_weight": 70,
                "priority_mode": True,
                "price_range": [0, 200]
            }
        return user.get("preferences", {})

    # Saved Items
    def get_saved_items(self, user_id: str) -> List[str]:
        return self.data["saved_items"].get(user_id, [])

    def toggle_saved_item(self, user_id: str, item_id: str) -> Dict[str, Any]:
        if user_id not in self.data["saved_items"]:
            self.data["saved_items"][user_id] = []

        current = self.data["saved_items"][user_id]
        if item_id in current:
            current.remove(item_id)
            is_saved = False
        else:
            current.append(item_id)
            is_saved = True

        self._save()
        return {"item_id": item_id, "is_saved": is_saved, "total_saved": len(current)}

    # Chat Sessions
    def get_chat_sessions(self, user_id: str) -> List[Dict[str, Any]]:
        sessions = self.data["chat_sessions"].get(user_id, [])
        # Return summary without full message payload for fast sidebar display
        return [
            {
                "session_id": s["session_id"],
                "title": s.get("title", "New Conversation"),
                "created_at": s.get("created_at", time.time()),
                "updated_at": s.get("updated_at", time.time()),
                "message_count": len(s.get("messages", []))
            }
            for s in sorted(sessions, key=lambda x: x.get("updated_at", 0), reverse=True)
        ]

    def get_chat_session(self, user_id: str, session_id: str) -> Optional[Dict[str, Any]]:
        sessions = self.data["chat_sessions"].get(user_id, [])
        for s in sessions:
            if s["session_id"] == session_id:
                return s
        return None

    def save_chat_session(self, user_id: str, session_id: str, title: str, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        if user_id not in self.data["chat_sessions"]:
            self.data["chat_sessions"][user_id] = []

        sessions = self.data["chat_sessions"][user_id]
        now = time.time()
        for s in sessions:
            if s["session_id"] == session_id:
                s["title"] = title or s["title"]
                s["messages"] = messages
                s["updated_at"] = now
                self._save()
                return s

        # Create new session
        new_session = {
            "session_id": session_id or f"sess_{uuid.uuid4().hex[:8]}",
            "title": title or (messages[0]["text"][:30] + "..." if messages else "New Chat"),
            "created_at": now,
            "updated_at": now,
            "messages": messages
        }
        sessions.append(new_session)
        self._save()
        return new_session

    def delete_chat_session(self, user_id: str, session_id: str) -> bool:
        if user_id in self.data["chat_sessions"]:
            self.data["chat_sessions"][user_id] = [
                s for s in self.data["chat_sessions"][user_id] if s["session_id"] != session_id
            ]
            self._save()
            return True
        return False
