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
  recency_reason?: string;
  matching_attributes?: string[];
  limitations?: string;
  trust_badge: string;
  average_rating: number;
  rating_count: number;
  community_id: number;
}

export interface Item {
  item_id: string;
  title: string;
  category: string;
  cluster_name?: string;
  store: string;
  average_rating: number;
  rating_number: number;
  price: number | null;
  price_formatted?: string;
  image_url?: string | null;
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
  clarification_needed?: boolean;
  suggested_replies?: string[];
}

export interface FeedbackRecord {
  item_id: string;
  title: string;
  category: string;
  community_id: number;
  community_name?: string;
  image_url?: string;
  type: 'like' | 'dislike' | 'save' | 'unsave' | 'irrelevant';
  reason?: string;
  note?: string;
  timestamp: number;
}

export interface BenchmarkMetrics {
  "HR@5": number;
  "HR@10": number;
  "NDCG@5": number;
  "NDCG@10": number;
  "Comm_ILD@10": number;
  "Latency_ms": number;
}

export interface AblationItem {
  configuration: string;
  hr_10: number;
  ndcg_10: number;
  comm_ild_10: number;
  diversity_delta?: string;
  description: string;
}

export interface EvaluationData {
  dataset: string;
  catalog_items: number;
  graph_edges: number;
  communities: number;
  modularity_q: number;
  benchmarks: Record<string, BenchmarkMetrics>;
  ablation_study: AblationItem[];
  key_takeaways: string[];
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
