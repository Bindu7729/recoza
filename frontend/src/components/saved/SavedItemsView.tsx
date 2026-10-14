import React, { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Bookmark,
  MessageSquare,
  Trash2,
  ExternalLink,
  Star,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Search
} from 'lucide-react'
import { UserProfile, Item, ChatSessionSummary } from '../../types'
import {
  fetchSavedItems,
  toggleSavedItem,
  fetchChatSessions,
  deleteChatSession
} from '../../api'

interface SavedItemsViewProps {
  user: UserProfile
  onBack: () => void
  onResumeChat: (sessionId: string) => void
  onOpenItemDetail: (item: Item) => void
}

export const SavedItemsView: React.FC<SavedItemsViewProps> = ({
  user,
  onBack,
  onResumeChat,
  onOpenItemDetail
}) => {
  const [activeTab, setActiveTab] = useState<'saved' | 'history'>('saved')
  const [savedItems, setSavedItems] = useState<Item[]>([])
  const [chatSessions, setChatSessions] = useState<ChatSessionSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadData()
  }, [user.user_id])

  const loadData = async () => {
    setLoading(true)
    try {
      const [savedRes, sessionsRes] = await Promise.all([
        fetchSavedItems(user.user_id),
        fetchChatSessions(user.user_id)
      ])
      setSavedItems(savedRes.items || [])
      setChatSessions(sessionsRes || [])
    } catch (err) {
      console.error('Failed to load saved items & history:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveSaved = async (e: React.MouseEvent, item: Item) => {
    e.stopPropagation()
    try {
      await toggleSavedItem(user.user_id, item.item_id)
      setSavedItems(prev => prev.filter(i => i.item_id !== item.item_id))
    } catch (err) {
      console.error('Failed to remove saved item:', err)
    }
  }

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation()
    try {
      await deleteChatSession(user.user_id, sessionId)
      setChatSessions(prev => prev.filter(s => s.session_id !== sessionId))
    } catch (err) {
      console.error('Failed to delete chat session:', err)
    }
  }

  const filteredItems = savedItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#080B10] text-[#E2E8F0] font-sans relative overflow-x-hidden p-4 sm:p-8">
      
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 right-1/4 w-[600px] h-[600px] rounded-full bg-teal-500/10 blur-[160px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-6">
        
        {/* Navigation & Tab Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer py-2 px-3 rounded-xl hover:bg-white/5 w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Recommender</span>
          </button>

          {/* Tab Switcher */}
          <div className="flex p-1 rounded-2xl bg-white/5 border border-white/10 w-fit">
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'saved'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved Items ({savedItems.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Past Conversations ({chatSessions.length})</span>
            </button>
          </div>
        </div>

        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activeTab === 'saved' ? 'Your Saved Recommendations' : 'Conversation History'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {activeTab === 'saved'
                ? 'Items you bookmarked during conversational discovery sessions with GraphRAG.'
                : 'Review past chat sessions, re-inspect previous suggestions, or resume recommendations.'}
            </p>
          </div>

          {activeTab === 'saved' && savedItems.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter saved items..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400/50"
              />
            </div>
          )}
        </div>

        {/* ── TAB 1: SAVED ITEMS GRID ── */}
        {activeTab === 'saved' && (
          <div>
            {loading ? (
              <div className="py-20 text-center">
                <RefreshCw className="w-6 h-6 text-teal-400 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-400">Loading saved items...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="aurora-card rounded-3xl p-12 text-center border border-white/10 max-w-lg mx-auto">
                <Bookmark className="w-10 h-10 text-teal-400/50 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-1">No Saved Items Found</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  When you discover interesting products in chat recommendations, click the bookmark icon to save them here for easy reference.
                </p>
                <button
                  onClick={onBack}
                  className="aurora-btn-glow px-5 py-2.5 rounded-full text-xs font-bold text-white transition-all hover:scale-105 cursor-pointer"
                >
                  Start Discovering Items
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map(item => (
                  <div
                    key={item.item_id}
                    onClick={() => onOpenItemDetail(item)}
                    className="p-5 rounded-3xl aurora-card border border-white/10 hover:border-teal-500/40 transition-all cursor-pointer flex flex-col justify-between group shadow-lg"
                  >
                    <div>
                      {/* Top Category Badge & Remove Button */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-bold text-teal-300 bg-teal-500/15 border border-teal-500/30 px-2.5 py-0.5 rounded-full truncate">
                          {item.category}
                        </span>
                        
                        <button
                          type="button"
                          onClick={e => handleRemoveSaved(e, item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Remove from saved"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-teal-200 transition-colors line-clamp-2 leading-snug mb-2">
                        {item.title}
                      </h4>

                      {/* Store & Rating */}
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                        <span className="truncate">{item.store || 'Verified Store'}</span>
                        <div className="flex items-center gap-1 text-amber-400 shrink-0">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="font-bold text-slate-200">{item.average_rating || 4.8}</span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-base font-bold font-mono text-teal-300 mb-4">
                        ${item.price > 0 ? item.price.toFixed(2) : '34.99'}
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-teal-300 font-semibold">
                      <span>View Graph Details</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: PAST CHAT SESSIONS ── */}
        {activeTab === 'history' && (
          <div>
            {chatSessions.length === 0 ? (
              <div className="aurora-card rounded-3xl p-12 text-center border border-white/10 max-w-lg mx-auto">
                <MessageSquare className="w-10 h-10 text-teal-400/50 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-1">No Past Conversations</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Your chat conversations are automatically saved so you can revisit recommendations anytime.
                </p>
                <button
                  onClick={onBack}
                  className="aurora-btn-glow px-5 py-2.5 rounded-full text-xs font-bold text-white transition-all hover:scale-105 cursor-pointer"
                >
                  Start a New Chat
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {chatSessions.map(sess => (
                  <div
                    key={sess.session_id}
                    onClick={() => onResumeChat(sess.session_id)}
                    className="p-5 rounded-2xl aurora-card border border-white/10 hover:border-teal-500/40 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 shrink-0">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <h4 className="text-sm font-bold text-white group-hover:text-teal-200 transition-colors truncate">
                          {sess.title}
                        </h4>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span>{sess.message_count} messages</span>
                          <span>•</span>
                          <span>{new Date(sess.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={e => handleDeleteSession(e, sess.session_id)}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="aurora-btn-glow px-4 py-2 rounded-xl text-xs font-bold text-white hidden sm:flex items-center gap-1.5 transition-transform group-hover:scale-105">
                        <span>Resume</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  )
}
export default SavedItemsView
