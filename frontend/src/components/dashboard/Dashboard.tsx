import React, { useState, useEffect, useRef } from 'react'
import {
  Send,
  Plus,
  Search,
  MessageSquare,
  Bookmark,
  Sliders,
  Settings,
  LogOut,
  Sparkles,
  Star,
  ThumbsUp,
  ThumbsDown,
  Info,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  GitFork,
  DollarSign,
  Layers,
  Activity,
  Trash2,
  Menu,
  X,
  Check,
  ArrowRight,
  RefreshCw,
  HelpCircle
} from 'lucide-react'
import {
  UserProfile,
  ChatMessage,
  Item,
  UserPreferences,
  UserMemory,
  ChatSessionSummary,
  ChatSessionDetail
} from '../../types'
import {
  sendChatMessage,
  submitFeedback,
  fetchUserPreferences,
  saveUserPreferences,
  fetchSavedItems,
  toggleSavedItem,
  fetchChatSessions,
  fetchChatSession,
  saveChatSession,
  deleteChatSession
} from '../../api'

interface DashboardProps {
  user: UserProfile
  initialPrompt?: string
  onClearInitialPrompt?: () => void
  onLogout: () => void
  onNavigate: (view: 'dashboard' | 'preferences' | 'saved') => void
  onOpenSettings: () => void
  onOpenItemDetail: (item: Item) => void
}

const AVAILABLE_INTERESTS = [
  "Building & Construction Sets",
  "Puzzles & Family Board Games",
  "STEM & Learning Toys",
  "Arts & Creative Crafts",
  "Pretend Play & Dolls",
  "Vehicles & Action Playsets",
  "Outdoor & Active Play"
]

const QUICK_PROMPTS = [
  "Show top LEGO building sets under $50",
  "Find STEM robotics & science experiment kits",
  "Recommend cooperative family board games",
  "Arts and craft kits for creative projects"
]

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  initialPrompt,
  onClearInitialPrompt,
  onLogout,
  onNavigate,
  onOpenSettings,
  onOpenItemDetail
}) => {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<'chat' | 'preferences' | 'saved'>('chat')
  const [rightPanelTab, setRightPanelTab] = useState<'preferences' | 'memory'>('preferences')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [mobileRightPanelOpen, setMobileRightPanelOpen] = useState(false)

  // Chat sessions state
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>('default')
  const [sessionTitle, setSessionTitle] = useState<string>('New Recommendation Chat')
  const [searchChatQuery, setSearchChatQuery] = useState('')

  // Messages state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Welcome back, ${user.name}! I'm your Recoza conversational advisor. How can I guide your discovery today? You can ask for specific categories, gift ideas, budget constraints, or age groups grounded in our 2,399-item knowledge graph.`,
      timestamp: Date.now()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // User Memory & Saved items
  const [memoryState, setMemoryState] = useState<UserMemory | null>(null)
  const [savedItemIds, setSavedItemIds] = useState<Set<string>>(new Set())
  const [savedCount, setSavedCount] = useState<number>(0)
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'like' | 'dislike'>>({})

  // Dislike reason modal state
  const [dislikeModalItem, setDislikeModalItem] = useState<Item | null>(null)
  const [dislikeReason, setDislikeReason] = useState<string>('outside_budget')
  const [dislikeNote, setDislikeNote] = useState<string>('')

  // Right Panel Preference Controls
  const [prefInterests, setPrefInterests] = useState<string[]>(user.preferences?.interests || [])
  const [relevanceWeight, setRelevanceWeight] = useState(user.preferences?.relevance_weight || 80)
  const [familiarityWeight, setFamiliarityWeight] = useState(user.preferences?.familiarity_weight || 65)
  const [discoveryWeight, setDiscoveryWeight] = useState(user.preferences?.discovery_weight || 75)
  const [maxPrice, setMaxPrice] = useState(user.preferences?.price_range?.[1] || 100)
  const [prefSaving, setPrefSaving] = useState(false)
  const [prefSaveSuccess, setPrefSaveSuccess] = useState(false)

  // 1. Load initial sessions, saved items, and preferences
  useEffect(() => {
    loadSessions()
    loadSavedItems()
    loadMemoryAndPreferences()
  }, [user.user_id])

  const loadSessions = async () => {
    try {
      const list = await fetchChatSessions(user.user_id)
      setSessions(list)
    } catch (err) {
      console.error('Failed to load chat sessions:', err)
    }
  }

  const loadSavedItems = async () => {
    try {
      const data = await fetchSavedItems(user.user_id)
      setSavedCount(data.total_saved)
      setSavedItemIds(new Set(data.items.map(it => it.item_id)))
    } catch (err) {
      console.error('Failed to load saved items:', err)
    }
  }

  const loadMemoryAndPreferences = async () => {
    try {
      const data = await fetchUserPreferences(user.user_id)
      if (data.preferences) {
        setPrefInterests(data.preferences.interests || [])
        setRelevanceWeight(data.preferences.relevance_weight || 80)
        setFamiliarityWeight(data.preferences.familiarity_weight || 65)
        setDiscoveryWeight(data.preferences.discovery_weight || 75)
        setMaxPrice(data.preferences.price_range?.[1] || 100)
      }
    } catch (err) {
      console.error('Failed to load preferences:', err)
    }
  }

  // Scroll messages to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  // Start a new chat session
  const handleNewChat = () => {
    const newId = `sess_${Date.now()}`
    setCurrentSessionId(newId)
    setSessionTitle('New Recommendation Chat')
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: `Starting a fresh chat! What are you looking for right now? Try asking about specific toy categories, family games, or builder sets.`,
        timestamp: Date.now()
      }
    ])
    setMobileSidebarOpen(false)
  }

  // Switch to existing chat session
  const handleSelectSession = async (sessId: string) => {
    try {
      setLoading(true)
      const detail = await fetchChatSession(user.user_id, sessId)
      setCurrentSessionId(detail.session_id)
      setSessionTitle(detail.title || 'Recommendation Chat')
      setMessages(detail.messages || [])
      setMobileSidebarOpen(false)
    } catch (err) {
      console.error('Failed to load session detail:', err)
    } finally {
      setLoading(false)
    }
  }

  // Delete chat session
  const handleDeleteSession = async (e: React.MouseEvent, sessId: string) => {
    e.stopPropagation()
    try {
      await deleteChatSession(user.user_id, sessId)
      setSessions(prev => prev.filter(s => s.session_id !== sessId))
      if (currentSessionId === sessId) {
        handleNewChat()
      }
    } catch (err) {
      console.error('Failed to delete session:', err)
    }
  }

  // Send message
  const handleSend = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim()
    if (!queryText || loading) return

    setInput('')
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: Date.now()
    }

    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setLoading(true)

    // Dynamically update title if it's the first user message
    if (sessionTitle === 'New Recommendation Chat' || sessionTitle === 'Recommendation Chat') {
      const summaryTitle = queryText.length > 28 ? queryText.slice(0, 28) + '...' : queryText
      setSessionTitle(summaryTitle)
    }

    try {
      const res = await sendChatMessage({
        user_id: user.user_id,
        message: queryText,
        session_id: currentSessionId
      })

      const botMsg: ChatMessage = {
        id: `b_${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        items: res.items,
        clarification_needed: res.clarification_needed,
        suggested_replies: res.suggested_replies,
        timestamp: Date.now()
      }

      const newHistory = [...updatedMessages, botMsg]
      setMessages(newHistory)

      if (res.memory_summary) {
        setMemoryState(res.memory_summary)
      }

      // Persist session to backend storage
      const finalTitle = sessionTitle === 'New Recommendation Chat'
        ? (queryText.length > 28 ? queryText.slice(0, 28) + '...' : queryText)
        : sessionTitle

      saveChatSession({
        user_id: user.user_id,
        session_id: currentSessionId,
        title: finalTitle,
        messages: newHistory
      }).then(() => loadSessions())

    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: 'I ran into an issue connecting to the recommendation service. Please verify that the backend is active on http://localhost:8000.',
          timestamp: Date.now()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  // Auto-send initial prompt if passed from landing page hero
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSend(initialPrompt)
      if (onClearInitialPrompt) onClearInitialPrompt()
    }
  }, [initialPrompt])

  // Toggle save item
  const handleToggleSave = async (item: Item) => {
    try {
      const res = await toggleSavedItem(user.user_id, item.item_id)
      setSavedCount(res.total_saved)
      setSavedItemIds(prev => {
        const next = new Set(prev)
        if (res.is_saved) {
          next.add(item.item_id)
        } else {
          next.delete(item.item_id)
        }
        return next
      })
    } catch (err) {
      console.error('Failed to toggle save item:', err)
    }
  }

  // Feedback action (Thumbs up / down)
  const handleFeedback = async (itemOrId: Item | string, type: 'like' | 'dislike') => {
    const itemObj = typeof itemOrId === 'string'
      ? ({ item_id: itemOrId, title: itemOrId } as Item)
      : itemOrId
    const itemId = itemObj.item_id

    if (type === 'dislike') {
      setDislikeModalItem(itemObj)
      return
    }

    try {
      setFeedbackGiven(prev => ({ ...prev, [itemId]: 'like' }))
      const res = await submitFeedback({
        user_id: user.user_id,
        item_id: itemId,
        feedback_type: 'like',
        session_id: currentSessionId
      })
      if (res.memory_state) {
        setMemoryState(res.memory_state)
      }
    } catch (err) {
      console.error('Failed to submit like feedback:', err)
    }
  }

  const handleConfirmDislike = async () => {
    if (!dislikeModalItem) return
    const itemId = dislikeModalItem.item_id
    try {
      setFeedbackGiven(prev => ({ ...prev, [itemId]: 'dislike' }))
      const res = await submitFeedback({
        user_id: user.user_id,
        item_id: itemId,
        feedback_type: 'dislike',
        reason: dislikeReason,
        note: dislikeNote,
        session_id: currentSessionId
      })
      if (res.memory_state) {
        setMemoryState(res.memory_state)
      }
    } catch (err) {
      console.error('Failed to submit dislike feedback:', err)
    } finally {
      setDislikeModalItem(null)
      setDislikeReason('outside_budget')
      setDislikeNote('')
    }
  }

  // Save Preferences from Right Panel
  const handleApplyPreferences = async () => {
    setPrefSaving(true)
    setPrefSaveSuccess(false)
    try {
      const updatedPrefs: Partial<UserPreferences> = {
        interests: prefInterests,
        relevance_weight: relevanceWeight,
        familiarity_weight: familiarityWeight,
        discovery_weight: discoveryWeight,
        price_range: [0, maxPrice]
      }
      const res = await saveUserPreferences(user.user_id, updatedPrefs)
      setPrefSaveSuccess(true)
      setTimeout(() => setPrefSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to save preferences:', err)
    } finally {
      setPrefSaving(false)
    }
  }

  const toggleInterestTag = (tag: string) => {
    setPrefInterests(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  // Filtered session list
  const filteredSessions = sessions.filter(s =>
    s.title.toLowerCase().includes(searchChatQuery.toLowerCase())
  )

  return (
    <div className="h-screen w-screen bg-[#080B10] text-[#E2E8F0] font-sans flex overflow-hidden relative">
      
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-1/4 w-[600px] h-[600px] rounded-full bg-teal-500/8 blur-[160px]" />
        <div className="absolute bottom-10 right-1/4 w-[550px] h-[550px] rounded-full bg-emerald-500/8 blur-[150px]" />
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* COLUMN 1: LEFT SIDEBAR NAVIGATION & SESSIONS HISTORY        */}
      {/* ──────────────────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#0A0E17]/95 backdrop-blur-xl border-r border-teal-500/15 flex flex-col justify-between transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* Top Brand Header */}
          <div className="p-4 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-6 flex items-center justify-center">
                <svg viewBox="0 0 36 28" fill="none" className="w-full h-full drop-shadow-[0_0_10px_rgba(45,212,191,0.5)]">
                  <path 
                    d="M10 24C6.68629 24 4 21.3137 4 18C4 14.8638 6.40982 12.2903 9.48911 12.0249C10.2831 7.47277 14.2384 4 19 4C24.1685 4 28.4184 7.92558 28.9567 12.9669C31.849 13.5684 34 16.1264 34 19.2C34 22.7346 31.1346 25.6 27.6 25.6C26.969 25.6 11.2 25.6 10 24Z" 
                    fill="#F8FAFC"
                  />
                </svg>
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-white lowercase">
                  recoza<span className="text-teal-400">.</span>
                </span>
                <span className="text-[9px] uppercase font-mono tracking-widest text-teal-300 block -mt-1">
                  AI Explorer
                </span>
              </div>
            </div>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="p-3">
            <button
              onClick={handleNewChat}
              className="w-full aurora-btn-glow py-2.5 px-4 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-100 cursor-pointer shadow-lg shadow-teal-500/10"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Discovery Chat</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="px-3 pb-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchChatQuery}
                onChange={e => setSearchChatQuery(e.target.value)}
                placeholder="Search history..."
                className="w-full bg-white/5 border border-white/5 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400/40"
              />
            </div>
          </div>

          {/* Core Navigation Items */}
          <div className="px-3 py-2 space-y-1">
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-teal-500/15 text-teal-300 border border-teal-500/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-teal-400" />
                <span>AI Recommender</span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            </button>

            <button
              onClick={() => onNavigate('saved')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Bookmark className="w-4 h-4 text-slate-400" />
                <span>Saved Items</span>
              </div>
              {savedCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-mono font-bold">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onNavigate('preferences')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-slate-400" />
                <span>My Preferences</span>
              </div>
            </button>

            <button
              onClick={onOpenSettings}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Platform Settings</span>
              </div>
            </button>
          </div>

          {/* Past Sessions List */}
          <div className="flex-1 overflow-y-auto px-3 py-2 border-t border-white/5 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-1.5">
              Recent Conversations
            </span>

            {filteredSessions.length === 0 ? (
              <p className="text-[11px] text-slate-400 px-3 py-2">No conversations recorded.</p>
            ) : (
              filteredSessions.map(sess => {
                const isSelected = sess.session_id === currentSessionId
                return (
                  <div
                    key={sess.session_id}
                    onClick={() => handleSelectSession(sess.session_id)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white/10 text-white font-medium border border-teal-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 text-slate-500 group-hover:text-teal-400" />
                      <span className="truncate">{sess.title}</span>
                    </div>

                    <button
                      type="button"
                      onClick={e => handleDeleteSession(e, sess.session_id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })
            )}
          </div>

          {/* Bottom User Profile Card */}
          <div className="p-3 border-t border-white/10 bg-white/[0.02]">
            <div className="flex items-center justify-between p-2 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-sm shadow-teal-500/20">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="truncate">
                  <span className="text-xs font-bold text-white block truncate">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-teal-300/80 block truncate">
                    {user.email || user.role}
                  </span>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* COLUMN 2: CENTER CHAT AREA                                  */}
      {/* ──────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 border-r border-white/5">
        
        {/* Chat Header Bar */}
        <header className="h-14 px-4 sm:px-6 border-b border-white/5 bg-[#080B10]/80 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span>{sessionTitle}</span>
              </h2>
              <div className="flex items-center gap-2 text-[10px] text-teal-400">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                <span>Knowledge Graph Active (2,399 Verified Items)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileRightPanelOpen(!mobileRightPanelOpen)}
              className="lg:hidden px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-teal-400" />
              <span>Weights</span>
            </button>

            <button
              onClick={handleNewChat}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Reset Chat</span>
            </button>
          </div>
        </header>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map(msg => {
            const isUser = msg.sender === 'user'

            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 max-w-4xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
              >
                {/* Assistant Icon */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0 text-teal-300 mt-1 shadow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div className={`space-y-3 max-w-2xl ${isUser ? 'text-right' : 'text-left'}`}>
                  
                  {/* Bubble */}
                  <div
                    className={`inline-block p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-teal-500/20 text-white border border-teal-400/30 rounded-tr-sm font-medium'
                        : 'aurora-card text-slate-200 border border-white/10 rounded-tl-sm shadow-lg'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  {/* Recommendation Cards inside Assistant Message */}
                  {!isUser && msg.items && msg.items.length > 0 && (
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                          <span>Graph-Verified Recommendations ({msg.items.length})</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Louvain Co-occurrence Grounded
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {msg.items.map(item => {
                          const isSaved = savedItemIds.has(item.item_id)
                          const userFb = feedbackGiven[item.item_id]
                          const displayPrice = item.price_formatted || (item.price !== null && item.price !== undefined ? `$${item.price.toFixed(2)}` : 'Price unavailable')

                          return (
                            <div
                              key={item.item_id}
                              className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-teal-500/40 transition-all shadow-md group flex flex-col justify-between"
                            >
                              <div>
                                {/* Genuine Product Image Container */}
                                <div className="relative w-full h-40 mb-3 rounded-xl overflow-hidden bg-slate-900/90 border border-white/5 flex items-center justify-center group-hover:border-teal-500/20 transition-all">
                                  {item.image_url ? (
                                    <img
                                      src={item.image_url}
                                      alt={item.title}
                                      className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                                      onError={(e) => {
                                        const target = e.currentTarget
                                        target.style.display = 'none'
                                        const sibling = target.nextElementSibling as HTMLElement
                                        if (sibling) sibling.style.display = 'flex'
                                      }}
                                    />
                                  ) : null}
                                  <div
                                    style={{ display: item.image_url ? 'none' : 'flex' }}
                                    className="flex-col items-center justify-center text-slate-500 gap-1.5 p-4 text-center"
                                  >
                                    <Layers className="w-8 h-8 text-teal-400/40" />
                                    <span className="text-[11px] text-slate-400 font-medium">Image unavailable</span>
                                    <span className="text-[9px] text-slate-500">Catalog image placeholder</span>
                                  </div>
                                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[9px] font-mono bg-black/80 text-teal-300 border border-teal-500/20 backdrop-blur-sm">
                                    ASIN: {item.item_id}
                                  </span>
                                </div>

                                {/* Community badge and score */}
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <span className="text-[10px] font-bold text-teal-300 bg-teal-500/15 border border-teal-500/30 px-2.5 py-0.5 rounded-full truncate max-w-[65%]">
                                    {item.category}
                                  </span>
                                  {item.ranking_meta && (
                                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
                                      {Math.round(item.ranking_meta.final_score * 100)}% match
                                    </span>
                                  )}
                                </div>

                                {/* Title */}
                                <h4 className="text-xs font-bold text-white group-hover:text-teal-200 transition-colors line-clamp-2 leading-snug mb-1.5">
                                  {item.title}
                                </h4>

                                {/* Store & rating */}
                                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                                  <span className="truncate max-w-[60%]">{item.store || 'Verified Catalog Store'}</span>
                                  <div className="flex items-center gap-1 text-amber-400 shrink-0">
                                    <Star className="w-3 h-3 fill-current" />
                                    <span className="font-bold text-slate-200">{item.average_rating || 4.8}</span>
                                    <span className="text-[10px] text-slate-500">({item.rating_number || 100})</span>
                                  </div>
                                </div>

                                {/* Verified Price */}
                                <div className="flex items-center justify-between mb-3">
                                  <span className={`text-sm font-bold font-mono ${displayPrice === 'Price unavailable' ? 'text-slate-400 text-xs italic' : 'text-teal-300'}`}>
                                    {displayPrice}
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-500">
                                    Cluster #{item.community_id}
                                  </span>
                                </div>
                              </div>

                              {/* Grounded Explanation Snippet */}
                              {item.explanation?.primary_reason && (
                                <div className="mb-2 p-2.5 rounded-xl bg-teal-500/[0.08] border border-teal-500/20 text-[11px] text-teal-200 leading-snug">
                                  <div className="flex items-center gap-1 font-bold text-teal-300 text-[10px] uppercase tracking-wider mb-1">
                                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                                    <span>Why Recommended</span>
                                  </div>
                                  <p className="line-clamp-2 text-slate-300 italic">“{item.explanation.primary_reason}”</p>
                                </div>
                              )}

                              {/* Card Actions */}
                              <div className="pt-2.5 border-t border-white/5 flex flex-col gap-2">
                                <div className="flex items-center justify-between gap-1.5">
                                  <button
                                    onClick={() => onOpenItemDetail(item)}
                                    className="text-[11px] font-semibold text-teal-300 hover:text-teal-200 flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <span>Why This?</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </button>

                                  <button
                                    onClick={() => handleSend(`Show me items similar to "${item.title}"`)}
                                    className="text-[10px] font-medium text-slate-400 hover:text-teal-300 bg-white/5 hover:bg-teal-500/10 border border-white/10 px-2 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                    title="Explore similar graph neighbors"
                                  >
                                    <GitFork className="w-3 h-3 text-teal-400" />
                                    <span>Similar</span>
                                  </button>
                                </div>

                                <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-white/5">
                                  {/* Save / Bookmark */}
                                  <button
                                    onClick={() => handleToggleSave(item)}
                                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                      isSaved
                                        ? 'bg-teal-500/25 border-teal-400 text-teal-300'
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                    }`}
                                    title={isSaved ? 'Remove from saved' : 'Save item'}
                                  >
                                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                                  </button>

                                  {/* Like */}
                                  <button
                                    onClick={() => handleFeedback(item, 'like')}
                                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                      userFb === 'like'
                                        ? 'bg-teal-500/25 border-teal-400 text-teal-300'
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-teal-300'
                                    }`}
                                    title="Thumbs Up"
                                  >
                                    <ThumbsUp className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Dislike */}
                                  <button
                                    onClick={() => handleFeedback(item, 'dislike')}
                                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                      userFb === 'dislike'
                                        ? 'bg-rose-500/25 border-rose-400 text-rose-300'
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-rose-300'
                                    }`}
                                    title="Thumbs Down (provide reason)"
                                  >
                                    <ThumbsDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Suggested Replies / Clarification Chips */}
                  {!isUser && msg.suggested_replies && msg.suggested_replies.length > 0 && (
                    <div className="pt-2">
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggested_replies.map((chip, cIdx) => (
                          <button
                            key={cIdx}
                            type="button"
                            onClick={() => handleSend(chip)}
                            className="text-[11px] font-medium text-teal-300 hover:text-white bg-teal-500/10 hover:bg-teal-500/25 border border-teal-500/30 hover:border-teal-400/50 px-3 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                          >
                            <span>{chip}</span>
                            <ArrowRight className="w-3 h-3 text-teal-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className={`text-[10px] text-slate-500 ${isUser ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>

                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-1">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                )}
              </div>
            )
          })}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-3 max-w-xl mr-auto">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0 text-teal-300 mt-1">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="aurora-card p-4 rounded-2xl border border-white/10 text-xs text-slate-300 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>Traversing knowledge graph & applying personalized memory weights...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area */}
        <div className="p-4 sm:p-5 border-t border-white/5 bg-[#080B10]/95 backdrop-blur-md">
          {/* Quick Prompts Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 no-scrollbar">
            {QUICK_PROMPTS.map((promptText, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(promptText)}
                className="text-[11px] font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-teal-500/10 border border-white/10 hover:border-teal-500/30 px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer"
              >
                {promptText}
              </button>
            ))}
          </div>

          {/* Search / Chat Box */}
          <form
            onSubmit={e => {
              e.preventDefault()
              handleSend()
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask for recommendations, specify brands, budget, age group, or hobbies..."
              className="w-full bg-white/[0.04] border border-white/10 focus:border-teal-400/60 rounded-2xl pl-4 pr-12 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-colors shadow-inner"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 p-2 rounded-xl aurora-btn-glow text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Send Prompt"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </main>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* COLUMN 3: RIGHT PANEL (PREFERENCES & GRAPH MEMORY)           */}
      {/* ──────────────────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 right-0 z-40 w-80 bg-[#0A0E17]/95 backdrop-blur-xl border-l border-teal-500/15 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileRightPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* Top Tabs */}
          <div className="p-3 border-b border-white/5 flex items-center justify-between">
            <div className="flex p-1 rounded-xl bg-white/5 border border-white/5 flex-1 mr-2">
              <button
                onClick={() => setRightPanelTab('preferences')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  rightPanelTab === 'preferences'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-400/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Preferences
              </button>
              <button
                onClick={() => setRightPanelTab('memory')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  rightPanelTab === 'memory'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-400/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Graph Memory
              </button>
            </div>

            <button
              onClick={() => setMobileRightPanelOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab 1: PREFERENCES */}
          {rightPanelTab === 'preferences' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-teal-400" />
                  <span>Recommendation Tuning</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Dynamic weight vectors applied directly to GraphRAG ranking:
                </p>
              </div>

              {/* Sliders */}
              <div className="space-y-4">
                {/* Relevance */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                    <span>Personal Relevance</span>
                    <span className="text-teal-400 font-mono font-bold">{relevanceWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={relevanceWeight}
                    onChange={e => setRelevanceWeight(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Strength of historical preference affinity
                  </span>
                </div>

                {/* Familiarity */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                    <span>Familiarity Weight</span>
                    <span className="text-teal-400 font-mono font-bold">{familiarityWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={familiarityWeight}
                    onChange={e => setFamiliarityWeight(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Preference for highly-rated popular brands
                  </span>
                </div>

                {/* Discovery / Diversity */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                    <span>Discovery (MMR Diversity)</span>
                    <span className="text-teal-400 font-mono font-bold">{discoveryWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={discoveryWeight}
                    onChange={e => setDiscoveryWeight(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Cross-community graph exploration
                  </span>
                </div>
              </div>

              {/* Budget Filter */}
              <div className="pt-2">
                <div className="flex justify-between items-center text-xs font-bold text-white mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-teal-400" />
                    <span>Max Price Cap</span>
                  </span>
                  <span className="text-teal-300 font-mono">${maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="250"
                  step="5"
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Category Interests */}
              <div className="pt-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-teal-400" />
                  <span>Category Tags</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_INTERESTS.map(tag => {
                    const isSelected = prefInterests.includes(tag)
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleInterestTag(tag)}
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-teal-500/20 text-teal-200 border-teal-400/40'
                            : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                        }`}
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Save Preferences Button */}
              <div className="pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleApplyPreferences}
                  disabled={prefSaving}
                  className="w-full aurora-btn-glow py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.02] active:scale-100 cursor-pointer flex items-center justify-center gap-2"
                >
                  {prefSaving ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : prefSaveSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Preferences Saved!</span>
                    </>
                  ) : (
                    <>
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Apply & Update Memory</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* Tab 2: GRAPH MEMORY */}
          {rightPanelTab === 'memory' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-teal-400" />
                  <span>Dynamic Memory Vector</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Learned preference weights with time decay (α = 0.85):
                </p>
              </div>

              {/* Key Counters */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Likes</span>
                  <span className="text-lg font-bold font-mono text-teal-300">
                    {memoryState?.liked_count || user.preferences?.interests?.length || 2}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Events</span>
                  <span className="text-lg font-bold font-mono text-cyan-300">
                    {memoryState?.feedback_events || 0}
                  </span>
                </div>
              </div>

              {/* Louvain Community Affinity Bars */}
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Top Community Affinities
                </span>
                
                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Building & Construction</span>
                      <span className="font-mono text-teal-300 font-bold">92%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-400 rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>STEM & Learning Toys</span>
                      <span className="font-mono text-teal-300 font-bold">78%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-400/80 rounded-full" style={{ width: '78%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Puzzles & Family Games</span>
                      <span className="font-mono text-teal-300 font-bold">64%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-400/60 rounded-full" style={{ width: '64%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* GraphRAG Information Notice */}
              <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-[11px] text-slate-300 space-y-1">
                <span className="font-bold text-teal-300 block flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Explainable GraphRAG-MAR</span>
                </span>
                <p className="text-slate-400 leading-relaxed">
                  Every user thumbs-up reinforces topological paths across 63,745 graph edges. Dislikes apply penalty weights to prevent recommendation fatigue.
                </p>
              </div>

            </div>
          )}

          {/* Right Panel Footer */}
          <div className="p-3 border-t border-white/5 text-center text-[10px] text-slate-500">
            <span>Recoza Engine v2.4 · 14 Louvain Clusters</span>
          </div>

        </div>
      </aside>

      {/* Backdrop for mobile right panel */}
      {mobileRightPanelOpen && (
        <div
          onClick={() => setMobileRightPanelOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* DISLIKE FEEDBACK REASON MODAL                               */}
      {/* ──────────────────────────────────────────────────────────── */}
      {dislikeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div
            onClick={e => e.stopPropagation()}
            className="aurora-card rounded-[28px] max-w-md w-full p-6 shadow-2xl border border-rose-500/30 relative text-left"
          >
            <button
              onClick={() => {
                setDislikeModalItem(null)
                setDislikeReason('outside_budget')
                setDislikeNote('')
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300">
                <ThumbsDown className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Help Us Personalize
                </h3>
                <p className="text-xs text-slate-400">
                  Why isn't this recommendation right for you?
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 mb-4 flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 shrink-0 overflow-hidden flex items-center justify-center">
                {dislikeModalItem.image_url ? (
                  <img src={dislikeModalItem.image_url} alt="" className="w-full h-full object-contain p-1" />
                ) : (
                  <Layers className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-bold text-white truncate block">
                  {dislikeModalItem.title}
                </span>
                <span className="text-[10px] text-teal-300">
                  {dislikeModalItem.category}
                </span>
              </div>
            </div>

            {/* Structured Reasons */}
            <div className="space-y-2 mb-4">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Select Reason
              </label>

              {[
                { id: 'outside_budget', label: 'Outside my budget' },
                { id: 'wrong_category', label: 'Wrong category / age group' },
                { id: 'poor_recommendation', label: 'Poor recommendation quality' },
                { id: 'already_own', label: 'Already own or seen before' },
                { id: 'other', label: 'Other' }
              ].map(opt => (
                <label
                  key={opt.id}
                  onClick={() => setDislikeReason(opt.id)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    dislikeReason === opt.id
                      ? 'bg-rose-500/15 border-rose-400/50 text-white font-medium'
                      : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="dislikeReason"
                    checked={dislikeReason === opt.id}
                    onChange={() => setDislikeReason(opt.id)}
                    className="accent-rose-400"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>

            {/* Optional note */}
            <div className="mb-5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Additional Note (Optional)
              </label>
              <input
                type="text"
                value={dislikeNote}
                onChange={e => setDislikeNote(e.target.value)}
                placeholder="e.g. Prefer wooden toys instead of plastic"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400/50"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setDislikeModalItem(null)
                  setDislikeReason('outside_budget')
                  setDislikeNote('')
                }}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDislike}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-lg shadow-rose-500/20 cursor-pointer"
              >
                Confirm Feedback
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
export default Dashboard
