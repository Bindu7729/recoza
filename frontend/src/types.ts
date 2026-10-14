export interface RankingMeta {
  comm_score: number;
  cf_score: number;
  verified: boolean;
  final_score: number;
}

export interface Explanation {
  item_id: string;
  primary_reason: string;
  community_context: string;
  graph_path: string;
  recency_reason: string;
  trust_badge: string;
  average_rating: number;
  rating_count: number;
  community_id: number;
}

export interface Item {
  item_id: string;
  title: string;
  category: string;
  store: string;
  average_rating: number;
  rating_number: number;
  price: number;
  community_id: number;
  popularity: number;
  degree?: number;
  ranking_meta?: RankingMeta;
  explanation?: Explanation;
}

export interface UserPreferences {
  interests: string[];
  relevance_weight: number;
  familiarity_weight: number;
  discovery_weight: number;
  priority_mode: boolean;
  price_range: [number, number];
}

export interface UserProfile {
  user_id: string;
  name: string;
  email: string;
  role: string;
  is_first_time: boolean;
  created_at?: number;
  preferences: UserPreferences;
}

export interface UserMemory {
  user_id: string;
  history_count: number;
  recent_history: Array<{ item_id: string; title: string; timestamp: number }>;
  liked_count: number;
  disliked_count: number;
  feedback_events: number;
  decay_factor: number;
  community_affinity: Record<number, number>;
  weighted_history_summary: Record<string, number>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  items?: Item[];
}

export interface ChatSessionSummary {
  session_id: string;
  title: string;
  created_at: number;
  updated_at: number;
  message_count: number;
}

export interface ChatSessionDetail {
  session_id: string;
  title: string;
  created_at: number;
  updated_at: number;
  messages: ChatMessage[];
}

export interface Stats {
  total_items: number;
  total_interactions: number;
  unique_communities: number;
  modularity_q: number;
  graph_edges: number;
  catalog_domain: string;
}

export interface DemoUser {
  username: string;
  name: string;
  user_id: string;
  role: string;
}
