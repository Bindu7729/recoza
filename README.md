# Recoza — Conversational Graph-Powered Recommendation Platform

> **Find what fits you.**  
> A personalized, conversational recommendation platform designed to help users discover relevant options through natural dialogue and explainable knowledge graph reasoning.

---

## 🌟 Overview

**Recoza** bridges conversational AI with topological graph retrieval to replace rigid filter menus and black-box bestseller lists. Users can describe what they are looking for in natural language, receive recommendations grounded in authentic catalog data, understand why each item was selected, and refine suggestions through feedback.

---

## 🚀 Key Features

- **Conversational Search & Refinement**: Describe requirements (budget, age group, playstyle, themes) in plain English without complex checkbox menus.
- **Topological Knowledge Graph (GraphRAG-MAR)**: Surfaces relevant candidates across **63,745 verified co-occurrence edges** organized into **14 Louvain community clusters**.
- **Transparent Explainability**: Every recommendation details *why* it fits, displaying community cluster context, rating breakdown, and multi-hop graph neighbor traces.
- **Dynamic Preference Memory**: Dynamic memory vector updates with every like, dislike, and bookmark, applying exponential time decay ($\alpha = 0.85$) to prevent recommendation fatigue.
- **Maximal Marginal Relevance (MMR)**: Prevents echo chambers by balancing high relevance with serendipitous catalog exploration.
- **3-Column Recommender Dashboard**:
  - **Left Sidebar**: Chat history, search, navigation (AI Recommender, Saved Items, Preferences, Settings), and user profile.
  - **Center Chat**: Rich message feed with interactive recommendation cards, match score badges, "Why This?" inspector, bookmark toggle, and feedback pills.
  - **Right Panel**: Real-time preference tuning sliders (Relevance, Familiarity, Diversity) and dynamic graph memory analytics.
- **Authentication & Persistent Storage**: Secure salted SHA-256 password hashing and persistent store for user accounts, preferences, chat sessions, and saved items.

---

## 📊 Ground-Truth Dataset Telemetry

| Metric | Ground-Truth Value |
| :--- | :--- |
| **Catalog Domain** | Amazon Reviews (Toys & Games) |
| **Catalog Items** | 2,399 Verified Products |
| **Co-occurrence Edges** | 63,745 Graph Relationships |
| **Louvain Communities** | 14 Distinct Clusters |
| **Community Modularity** | $Q = 0.742$ |
| **Memory Time Decay** | $\alpha = 0.85$ |
| **Diversity Objective** | Maximal Marginal Relevance (MMR, $\lambda = 0.65$) |

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React
- **Backend**: Python 3.10+, FastAPI, Uvicorn, Pydantic
- **Graph & ML Engine**: NetworkX, Scikit-learn, Pandas, NumPy
- **Storage**: Persistent JSON-backed user store with salted SHA-256 password hashing

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js (v18+) & npm
- Python 3.10+

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server (http://localhost:8000)
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build
```

---

## 📁 Project Structure

```
Recoza/
├── backend/
│   ├── data/
│   │   ├── toys_interactions.csv          # 63k+ customer interaction edges
│   │   ├── toys_metadata.json              # Catalog metadata for 2,399 items
│   │   ├── graph_communities_train.json    # 14 Louvain community mappings
│   │   └── user_store.json                 # Persistent users, prefs, sessions, saved items
│   ├── engine/
│   │   ├── graph_engine.py                 # NetworkX topological traversal & clusters
│   │   ├── memory.py                       # Dynamic user preference vector (decay α = 0.85)
│   │   ├── ranking.py                      # Multi-hop score fusion & MMR diversity
│   │   ├── explainer.py                    # GraphRAG explainability & trust badges
│   │   └── conversational_agent.py         # Multi-turn dialogue & intent extraction
│   ├── auth.py                             # Salted SHA-256 authentication & tokens
│   ├── storage.py                          # Thread-safe persistent JSON database
│   ├── main.py                             # FastAPI REST endpoints & CORS
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/                       # Sign In & Account Creation (AuthPage.tsx)
│   │   │   ├── onboarding/                 # First-time preference tuning (PreferenceSetup.tsx)
│   │   │   ├── dashboard/                  # 3-column AI chat interface (Dashboard.tsx)
│   │   │   ├── preferences/                # My Preferences tuning view (MyPreferencesView.tsx)
│   │   │   ├── saved/                      # Bookmarked items & history (SavedItemsView.tsx)
│   │   │   ├── modals/                     # ItemDetailModal.tsx & SettingsModal.tsx
│   │   │   ├── Navbar.tsx                  # Responsive navigation bar
│   │   │   ├── Hero.tsx                    # Hero section with interactive preview
│   │   │   ├── ConversationalSection.tsx   # Section A: Natural intent discovery
│   │   │   ├── HowItWorks.tsx              # Section B: 3-step process
│   │   │   ├── WhyRecoza.tsx               # Section C: 4 core advantages
│   │   │   ├── ValueComparison.tsx         # Section D: Conventional vs Recoza comparison
│   │   │   ├── FinalCTA.tsx                # Section E: Final call to action
│   │   │   └── Footer.tsx                  # Footer & telemetry attribution
│   │   ├── api.ts                          # Type-safe API client for backend
│   │   ├── types.ts                        # TypeScript interfaces & domain models
│   │   ├── App.tsx                         # Root router & view manager
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── .gitignore
└── README.md
```

---

## 👥 Demo Personas

For immediate testing, two pre-configured demo personas are included:
- **Alex Rivera** (`alex@recoza.io` / `recoza123`) — *Creative Builder (Building & Construction, STEM)*
- **Sarah Jenkins** (`sarah@recoza.io` / `recoza123`) — *Collector (Family Games, Puzzles)*

Or click **Create Account** to experience the full onboarding and dynamic personalization workflow.

---

## 📜 License
MIT License. © Recoza Platform.
