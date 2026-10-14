"""
Recoza FastAPI Backend Server
Personalized Recommendation & Conversational API powered by GraphRAG-MAR.
"""
import os
import sys
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any

try:
    from .engine.graph_engine import GraphEngine
    from .engine.memory import UserMemory
    from .engine.ranking import RecommenderRanker
    from .engine.explainer import RecommendationExplainer
    from .engine.conversational_agent import ConversationalAgent
    from .auth import AuthStore
    from .storage import PersistentStore
except (ImportError, ValueError):
    from engine.graph_engine import GraphEngine
    from engine.memory import UserMemory
    from engine.ranking import RecommenderRanker
    from engine.explainer import RecommendationExplainer
    from engine.conversational_agent import ConversationalAgent
    from auth import AuthStore
    from storage import PersistentStore

app = FastAPI(
    title="Recoza Recommendation API",
    description="Backend API for Recoza: Graph-grounded conversational multi-agent recommendations",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engines & storage
current_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(current_dir, "data")

print(f"Initializing Recoza engines with data from: {data_dir}...")
graph_engine = GraphEngine(data_dir)
ranker = RecommenderRanker(graph_engine)
explainer = RecommendationExplainer(graph_engine)
agent = ConversationalAgent(graph_engine, ranker, explainer)
auth_store = AuthStore(graph_engine)
store = PersistentStore()
print("Recoza engines & persistent storage initialized successfully!")

# Pydantic schemas
class RecommendRequest(BaseModel):
    user_id: Optional[str] = "guest"
    query: Optional[str] = ""
    category: Optional[str] = None
    limit: Optional[int] = 6

class ChatRequest(BaseModel):
    user_id: Optional[str] = "guest"
    message: str

class FeedbackRequest(BaseModel):
    user_id: Optional[str] = "guest"
    item_id: str
    feedback_type: str  # 'like', 'dislike', 'save', 'dismiss'
    note: Optional[str] = ""

class InteractionRequest(BaseModel):
    user_id: Optional[str] = "guest"
    item_id: str

class LegacyLoginRequest(BaseModel):
    username: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class AuthLoginRequest(BaseModel):
    email: str
    password: str

class PreferencesUpdateRequest(BaseModel):
    user_id: str
    preferences: Dict[str, Any]

class SaveItemRequest(BaseModel):
    user_id: str
    item_id: str

class SaveSessionRequest(BaseModel):
    user_id: str
    session_id: Optional[str] = None
    title: Optional[str] = None
    messages: List[Dict[str, Any]]

# ----------------- BASE & STATS ENDPOINTS -----------------

@app.get("/api/health")
def health_check():
    stats = graph_engine.get_stats()
    return {
        "status": "healthy",
        "service": "Recoza Recommendation API",
        "dataset": stats['catalog_domain'],
        "items_count": stats['total_items'],
        "communities": stats['unique_communities'],
        "graph_edges": stats['graph_edges'],
        "modularity_q": stats['modularity_q']
    }

@app.get("/api/stats")
def get_stats():
    return graph_engine.get_stats()

@app.get("/api/categories")
def get_categories():
    return {"categories": graph_engine.get_categories()}

@app.get("/api/catalog")
def get_catalog(
    q: Optional[str] = "",
    category: Optional[str] = None,
    community_id: Optional[int] = None,
    min_rating: Optional[float] = 0.0,
    limit: int = 18,
    offset: int = 0
):
    return graph_engine.search_items(
        query=q,
        category=category,
        community_id=community_id,
        min_rating=min_rating,
        limit=limit,
        offset=offset
    )

@app.get("/api/catalog/{item_id}")
def get_item_detail(item_id: str):
    if item_id not in graph_engine.items_meta:
        raise HTTPException(status_code=404, detail="Item not found")
    item = graph_engine.get_item(item_id)
    neighbors = graph_engine.get_neighbors(item_id, limit=6)
    return {
        "item": item,
        "co_occurrence_neighbors": neighbors
    }

# ----------------- RECOMMENDATION & CHAT ENDPOINTS -----------------

@app.post("/api/recommend")
def get_recommendations(req: RecommendRequest):
    memory = auth_store.get_or_create_memory(req.user_id)
    
    # Check if user has stored preferences in persistent store to bias ranking
    user_prefs = store.get_preferences(req.user_id)
    pref_interests = user_prefs.get("interests", [])
    
    recs = ranker.recommend(
        memory=memory,
        query=req.query,
        top_k=req.limit,
        category_filter=req.category
    )
    
    # Attach explanations
    results = []
    for it in recs:
        exp = explainer.explain_item(it, memory)
        it_copy = dict(it)
        it_copy['explanation'] = exp
        results.append(it_copy)
        
    return {
        "user_id": req.user_id,
        "recommendations": results,
        "memory_summary": memory.to_dict(graph_engine.item_to_comm)
    }

@app.post("/api/chat")
def chat_with_assistant(req: ChatRequest):
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    memory = auth_store.get_or_create_memory(req.user_id)
    response = agent.process_message(req.message, memory)
    return response

@app.post("/api/feedback")
def submit_feedback(req: FeedbackRequest):
    if req.item_id not in graph_engine.items_meta:
        raise HTTPException(status_code=404, detail="Item not found in catalog")
    memory = auth_store.get_or_create_memory(req.user_id)
    memory.add_feedback(req.item_id, req.feedback_type, req.note)
    
    # If saved, also sync with persistent saved items
    if req.feedback_type == "save":
        store.toggle_saved_item(req.user_id, req.item_id)

    return {
        "success": True,
        "message": f"Feedback '{req.feedback_type}' recorded successfully.",
        "memory_state": memory.to_dict(graph_engine.item_to_comm)
    }

@app.post("/api/user/interaction")
def record_interaction(req: InteractionRequest):
    if req.item_id not in graph_engine.items_meta:
        raise HTTPException(status_code=404, detail="Item not found")
    memory = auth_store.get_or_create_memory(req.user_id)
    item_title = graph_engine.items_meta[req.item_id].get('title', '')
    memory.add_interaction(req.item_id, item_title)
    return {
        "success": True,
        "history_count": len(memory.history),
        "recent": memory.history[-5:]
    }

# ----------------- REAL AUTHENTICATION & PROFILE ENDPOINTS -----------------

@app.post("/api/auth/register")
def register_user(req: RegisterRequest):
    if not req.name or not req.email or not req.password:
        raise HTTPException(status_code=400, detail="All fields are required.")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    try:
        user = store.register_user(req.name, req.email, req.password)
        # Initialize memory
        auth_store.get_or_create_memory(user["user_id"])
        return {
            "success": True,
            "message": "Account created successfully.",
            "user": user,
            "token": f"recoza_token_{user['user_id']}"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/auth/login-email")
def login_with_email(req: AuthLoginRequest):
    user = store.authenticate_user(req.email, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    # Initialize memory
    auth_store.get_or_create_memory(user["user_id"])
    return {
        "success": True,
        "message": "Login successful.",
        "user": user,
        "token": f"recoza_token_{user['user_id']}"
    }

@app.get("/api/auth/me")
def get_current_user(user_id: str = Query(...)):
    user = store.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"user": user}

@app.get("/api/auth/demo-users")
def get_demo_users():
    return {"demo_users": auth_store.list_demo_users()}

@app.post("/api/auth/login")
def login_user_legacy(req: LegacyLoginRequest):
    return auth_store.login(req.username)

# ----------------- PREFERENCES & ONBOARDING ENDPOINTS -----------------

@app.get("/api/user/preferences")
def get_user_preferences(user_id: str = Query(...)):
    prefs = store.get_preferences(user_id)
    memory = auth_store.get_or_create_memory(user_id)
    return {
        "user_id": user_id,
        "preferences": prefs,
        "memory_affinity": memory.get_community_affinity(graph_engine.item_to_comm)
    }

@app.post("/api/user/preferences")
def save_user_preferences(req: PreferencesUpdateRequest):
    try:
        updated_user = store.save_preferences(req.user_id, req.preferences)
        memory = auth_store.get_or_create_memory(req.user_id)
        
        # Seed memory with community affinity based on interests
        interests = req.preferences.get("interests", [])
        if "Building & Construction Sets" in interests:
            memory.add_interaction("B00NHQF65S", "LEGO Classic Baseplate")
        if "Puzzles & Family Board Games" in interests:
            memory.add_interaction("B09M7XZ33P", "Melissa & Doug Dinosaur Jigsaw")
        if "STEM & Learning Toys" in interests:
            memory.add_interaction("B07BMH5L8B", "Dr. Fox STEM Kit")

        return {
            "success": True,
            "message": "Preferences saved successfully.",
            "user": updated_user,
            "preferences": updated_user["preferences"],
            "memory_affinity": memory.get_community_affinity(graph_engine.item_to_comm)
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# ----------------- SAVED ITEMS ENDPOINTS -----------------

@app.get("/api/user/saved-items")
def get_saved_items(user_id: str = Query(...)):
    item_ids = store.get_saved_items(user_id)
    items = []
    for it in item_ids:
        if it in graph_engine.items_meta:
            items.append(graph_engine.get_item(it))
    return {
        "user_id": user_id,
        "total_saved": len(items),
        "items": items
    }

@app.post("/api/user/saved-items/toggle")
def toggle_save_item(req: SaveItemRequest):
    result = store.toggle_saved_item(req.user_id, req.item_id)
    # Sync with memory
    memory = auth_store.get_or_create_memory(req.user_id)
    if result["is_saved"]:
        memory.add_feedback(req.item_id, "save")
    return result

# ----------------- CHAT SESSIONS & HISTORY ENDPOINTS -----------------

@app.get("/api/chat/sessions")
def get_chat_sessions(user_id: str = Query(...)):
    sessions = store.get_chat_sessions(user_id)
    return {"user_id": user_id, "sessions": sessions}

@app.get("/api/chat/sessions/{session_id}")
def get_chat_session(session_id: str, user_id: str = Query(...)):
    session = store.get_chat_session(user_id, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found.")
    return session

@app.post("/api/chat/sessions")
def save_chat_session(req: SaveSessionRequest):
    session = store.save_chat_session(
        user_id=req.user_id,
        session_id=req.session_id,
        title=req.title,
        messages=req.messages
    )
    return {"success": True, "session": session}

@app.delete("/api/chat/sessions/{session_id}")
def delete_chat_session(session_id: str, user_id: str = Query(...)):
    success = store.delete_chat_session(user_id, session_id)
    return {"success": success}
