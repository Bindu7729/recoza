import {
  Item,
  Stats,
  UserMemory,
  DemoUser,
  ChatMessage,
  UserProfile,
  UserPreferences,
  ChatSessionSummary,
  ChatSessionDetail,
  FeedbackRecord,
  EvaluationData
} from './types'

const BASE_URL = '/api'

export async function fetchHealth(): Promise<{
  status: string
  dataset: string
  items_count: number
  communities: number
  graph_edges: number
  modularity_q: number
}> {
  const res = await fetch(`${BASE_URL}/health`)
  if (!res.ok) throw new Error('Health check failed')
  return res.json()
}

export async function fetchStats(): Promise<Stats> {
  const res = await fetch(`${BASE_URL}/stats`)
  if (!res.ok) throw new Error('Failed to fetch stats')
  return res.json()
}

export async function fetchCategories(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/categories`)
  if (!res.ok) throw new Error('Failed to fetch categories')
  const data = await res.json()
  return data.categories || []
}

export async function fetchCatalog(params: {
  q?: string
  category?: string
  community_id?: number
  min_rating?: number
  limit?: number
  offset?: number
}): Promise<{ total: number; offset: number; limit: number; items: Item[] }> {
  const query = new URLSearchParams()
  if (params.q) query.set('q', params.q)
  if (params.category && params.category !== 'all') query.set('category', params.category)
  if (params.community_id !== undefined && params.community_id !== null) query.set('community_id', String(params.community_id))
  if (params.min_rating) query.set('min_rating', String(params.min_rating))
  query.set('limit', String(params.limit || 18))
  query.set('offset', String(params.offset || 0))

  const res = await fetch(`${BASE_URL}/catalog?${query.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch catalog')
  return res.json()
}

export async function fetchItemDetail(itemId: string): Promise<{ item: Item; co_occurrence_neighbors: Item[] }> {
  const res = await fetch(`${BASE_URL}/catalog/${encodeURIComponent(itemId)}`)
  if (!res.ok) throw new Error('Failed to fetch item details')
  return res.json()
}

export async function fetchRecommendations(params: {
  user_id?: string
  query?: string
  category?: string
  limit?: number
}): Promise<{ user_id: string; recommendations: Item[]; memory_summary: UserMemory }> {
  const res = await fetch(`${BASE_URL}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: params.user_id || 'guest',
      query: params.query || '',
      category: params.category || null,
      limit: params.limit || 6
    })
  })
  if (!res.ok) throw new Error('Failed to fetch recommendations')
  return res.json()
}

export async function sendChatMessage(params: {
  user_id?: string
  message: string
  session_id?: string
}): Promise<{
  reply: string
  category_detected?: string
  items: Item[]
  clarification_needed?: boolean
  suggested_replies?: string[]
  memory_summary: UserMemory
}> {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: params.user_id || 'guest',
      message: params.message,
      session_id: params.session_id || 'default'
    })
  })
  if (!res.ok) throw new Error('Failed to send chat message')
  return res.json()
}

export async function submitFeedback(params: {
  user_id: string
  item_id: string
  feedback_type: 'like' | 'dislike' | 'save' | 'unsave' | 'dismiss' | 'irrelevant'
  reason?: string
  note?: string
  session_id?: string
}): Promise<{
  success: boolean
  message: string
  record?: FeedbackRecord
  memory_state: UserMemory
}> {
  const res = await fetch(`${BASE_URL}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  })
  if (!res.ok) throw new Error('Failed to submit feedback')
  return res.json()
}

export async function fetchUserFeedback(userId: string): Promise<{
  user_id: string
  total_feedback: number
  feedback_history: FeedbackRecord[]
  disliked_count: number
  liked_count: number
  saved_count: number
}> {
  const res = await fetch(`${BASE_URL}/user/feedback?user_id=${encodeURIComponent(userId)}`)
  if (!res.ok) throw new Error('Failed to fetch feedback history')
  return res.json()
}

export async function fetchEvaluationBenchmarks(): Promise<EvaluationData> {
  const res = await fetch(`${BASE_URL}/evaluate`)
  if (!res.ok) throw new Error('Failed to fetch evaluation benchmarks')
  return res.json()
}

// ----------------- AUTHENTICATION API -----------------

export async function registerUser(name: string, email: string, password: string): Promise<{
  success: boolean
  message: string
  user: UserProfile
  token: string
}> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Registration failed')
  return data
}

export async function loginUserWithEmail(email: string, password: string): Promise<{
  success: boolean
  message: string
  user: UserProfile
  token: string
}> {
  const res = await fetch(`${BASE_URL}/auth/login-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Login failed')
  return data
}

export async function fetchCurrentUser(userId: string): Promise<UserProfile> {
  const res = await fetch(`${BASE_URL}/auth/me?user_id=${encodeURIComponent(userId)}`)
  if (!res.ok) throw new Error('Failed to fetch user')
  const data = await res.json()
  return data.user
}

export async function fetchDemoUsers(): Promise<DemoUser[]> {
  const res = await fetch(`${BASE_URL}/auth/demo-users`)
  if (!res.ok) throw new Error('Failed to fetch demo users')
  const data = await res.json()
  return data.demo_users || []
}

// ----------------- PREFERENCES API -----------------

export async function fetchUserPreferences(userId: string): Promise<{
  preferences: UserPreferences
  memory_affinity: Record<number, number>
}> {
  const res = await fetch(`${BASE_URL}/user/preferences?user_id=${encodeURIComponent(userId)}`)
  if (!res.ok) throw new Error('Failed to fetch preferences')
  return res.json()
}

export async function saveUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<{
  success: boolean
  user: UserProfile
  preferences: UserPreferences
  memory_affinity: Record<number, number>
}> {
  const res = await fetch(`${BASE_URL}/user/preferences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, preferences })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to save preferences')
  return data
}

// ----------------- SAVED ITEMS API -----------------

export async function fetchSavedItems(userId: string): Promise<{
  total_saved: number
  items: Item[]
}> {
  const res = await fetch(`${BASE_URL}/user/saved-items?user_id=${encodeURIComponent(userId)}`)
  if (!res.ok) throw new Error('Failed to fetch saved items')
  return res.json()
}

export async function toggleSavedItem(userId: string, itemId: string): Promise<{
  item_id: string
  is_saved: boolean
  total_saved: number
}> {
  const res = await fetch(`${BASE_URL}/user/saved-items/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, item_id: itemId })
  })
  if (!res.ok) throw new Error('Failed to toggle save item')
  return res.json()
}

// ----------------- CHAT SESSIONS API -----------------

export async function fetchChatSessions(userId: string): Promise<ChatSessionSummary[]> {
  const res = await fetch(`${BASE_URL}/chat/sessions?user_id=${encodeURIComponent(userId)}`)
  if (!res.ok) return []
  const data = await res.json()
  return data.sessions || []
}

export async function fetchChatSession(userId: string, sessionId: string): Promise<ChatSessionDetail> {
  const res = await fetch(`${BASE_URL}/chat/sessions/${encodeURIComponent(sessionId)}?user_id=${encodeURIComponent(userId)}`)
  if (!res.ok) throw new Error('Failed to fetch chat session')
  return res.json()
}

export async function saveChatSession(params: {
  user_id: string
  session_id?: string
  title?: string
  messages: ChatMessage[]
}): Promise<ChatSessionDetail> {
  const res = await fetch(`${BASE_URL}/chat/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  })
  const data = await res.json()
  if (!res.ok) throw new Error('Failed to save chat session')
  return data.session
}

export async function deleteChatSession(userId: string, sessionId: string): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/chat/sessions/${encodeURIComponent(sessionId)}?user_id=${encodeURIComponent(userId)}`, {
    method: 'DELETE'
  })
  return res.ok
}

// Backward-compatible helpers for legacy components
export async function loginUser(username: string): Promise<{ success: boolean; user: DemoUser }> {
  return {
    success: true,
    user: {
      username: username.toLowerCase().replace(/\s+/g, '_'),
      name: username,
      user_id: username.toLowerCase().replace(/\s+/g, '_'),
      role: 'Standard User'
    }
  }
}

export async function fetchUserProfile(userId: string): Promise<{
  memory: UserMemory
  liked_items: Item[]
  history_items: Item[]
}> {
  return {
    memory: {
      user_id: userId,
      history_count: 0,
      recent_history: [],
      liked_count: 0,
      disliked_count: 0,
      feedback_events: 0,
      decay_factor: 0.85,
      community_affinity: {},
      weighted_history_summary: {}
    },
    liked_items: [],
    history_items: []
  }
}
