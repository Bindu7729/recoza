import React, { useState, useEffect, useRef } from 'react'
import { Send, Sparkles, Star, ThumbsUp, ThumbsDown, Info, Bot, User as UserIcon, RotateCcw, Activity } from 'lucide-react'
import { ChatMessage, Item, UserMemory, DemoUser } from '../types'
import { sendChatMessage, submitFeedback } from '../api'

interface ChatAssistantProps {
  currentUser: DemoUser | null
  onOpenExplain: (item: Item) => void
  onOpenItemDetail: (item: Item) => void
  onRefreshMemory?: () => void
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  currentUser,
  onOpenExplain,
  onOpenItemDetail,
  onRefreshMemory
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I'm your Recoza AI shopping assistant. Tell me what kind of toys, hobbies, or age groups you're looking for, and I'll find graph-grounded recommendations from our catalog!",
      timestamp: Date.now()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [memoryState, setMemoryState] = useState<UserMemory | null>(null)
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'like' | 'dislike'>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!input.trim() || loading) return

    const userText = input.trim()
    setInput('')

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: Date.now()
    }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await sendChatMessage({
        user_id: currentUser ? currentUser.user_id : 'guest',
        message: userText
      })

      const botMsg: ChatMessage = {
        id: `b_${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        items: res.items,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, botMsg])
      if (res.memory_summary) {
        setMemoryState(res.memory_summary)
      }
      if (onRefreshMemory) onRefreshMemory()
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: "I encountered an error connecting to the recommendation engine. Please make sure the backend server is running.",
          timestamp: Date.now()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleFeedback = async (itemId: string, type: 'like' | 'dislike') => {
    try {
      setFeedbackGiven(prev => ({ ...prev, [itemId]: type }))
      const res = await submitFeedback({
        user_id: currentUser ? currentUser.user_id : 'guest',
        item_id: itemId,
        feedback_type: type
      })
      if (res.memory_state) {
        setMemoryState(res.memory_state)
      }
      if (onRefreshMemory) onRefreshMemory()
    } catch (err) {
      console.error("Failed to submit feedback", err)
    }
  }

  const quickPrompts = [
    "Looking for building blocks or STEM toys",
    "Find fun strategy games for kids",
    "Show me popular vehicle playsets",
    "Creative puzzles under $30"
  ]

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Chat Panel */}
        <div className="lg:col-span-8 bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden flex flex-col h-[680px]">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <span>Recoza Conversational Assistant</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </h3>
                <p className="text-xs text-slate-500">
                  GraphRAG Multi-Agent Guidance • Amazon Reviews 2023
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setMessages([messages[0]])
                setFeedbackGiven({})
              }}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 font-semibold p-2 rounded-xl hover:bg-slate-100 transition-colors"
              title="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] ${msg.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                  {/* Text bubble */}
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-xs shadow-md shadow-blue-500/10'
                        : 'bg-slate-100/80 text-slate-800 rounded-tl-xs border border-slate-200/50'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Attached Recommendation Cards */}
                  {msg.items && msg.items.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 w-full">
                      {msg.items.map(item => (
                        <div
                          key={item.item_id}
                          className="bg-white border border-slate-200 hover:border-purple-300 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                                {item.category}
                              </span>
                              <span className="text-xs font-black text-slate-900">
                                ${item.price.toFixed(2)}
                              </span>
                            </div>

                            <h4
                              onClick={() => onOpenItemDetail(item)}
                              className="text-xs font-bold text-slate-800 line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors"
                            >
                              {item.title}
                            </h4>

                            <div className="flex items-center gap-1.5 my-1.5">
                              <div className="flex text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-2.5 h-2.5 ${i < Math.floor(item.average_rating) ? 'fill-amber-400' : 'text-slate-200'}`}
                                  />
                                ))}
                              </div>
                              <span className="text-[10px] font-semibold text-slate-500">
                                {item.average_rating.toFixed(1)} ({item.rating_number})
                              </span>
                            </div>

                            {/* Short Reasoning snippet */}
                            {item.explanation && (
                              <p className="text-[11px] text-slate-500 line-clamp-2 bg-slate-50 p-2 rounded-xl border border-slate-100 my-1.5">
                                {item.explanation.primary_reason}
                              </p>
                            )}
                          </div>

                          {/* Action Footer */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                            <button
                              onClick={() => onOpenExplain(item)}
                              className="text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                            >
                              <Info className="w-3 h-3" />
                              <span>Why this?</span>
                            </button>

                            {/* Feedback Buttons */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleFeedback(item.item_id, 'like')}
                                className={`p-1.5 rounded-lg text-xs transition-colors ${
                                  feedbackGiven[item.item_id] === 'like'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                                }`}
                                title="Like (boosts preference affinity)"
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleFeedback(item.item_id, 'dislike')}
                                className={`p-1.5 rounded-lg text-xs transition-colors ${
                                  feedbackGiven[item.item_id] === 'dislike'
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                                }`}
                                title="Dislike (penalizes in dynamic memory)"
                              >
                                <ThumbsDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0 mt-0.5">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 shrink-0 animate-pulse">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="bg-slate-100 text-slate-500 text-xs px-4 py-3 rounded-2xl rounded-tl-xs flex items-center gap-2 font-medium">
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" />
                  <span>Consulting dynamic community graphs and ranking candidates...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-6 py-2 border-t border-slate-100 bg-slate-50/60 overflow-x-auto flex gap-2 no-scrollbar">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(qp)
                }}
                className="whitespace-nowrap px-3 py-1 rounded-full bg-white border border-slate-200/80 text-xs text-slate-600 hover:border-purple-400 hover:text-purple-700 transition-colors shrink-0"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask for toys, games, categories, or specific hobbies..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Dynamic Preference Memory Inspector Panel */}
        <div className="lg:col-span-4 bg-white rounded-[32px] border border-slate-100 shadow-xl p-6 flex flex-col justify-between h-[680px]">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <Activity className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Dynamic Memory Inspector</h3>
                <p className="text-[11px] text-slate-500">Real-time state for {currentUser ? currentUser.name : 'Guest Session'}</p>
              </div>
            </div>

            {/* Recency Decay Stat */}
            <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-4 mb-4">
              <div className="text-xs font-bold text-purple-900 mb-1 flex items-center justify-between">
                <span>Exponential Recency Factor</span>
                <span className="font-mono bg-purple-200/80 px-2 py-0.5 rounded-full text-[10px]">α = 0.85</span>
              </div>
              <p className="text-[11px] text-purple-700 leading-relaxed">
                Weights past interactions using exponential recency decay (α = 0.85). Recent turns dominate immediate ranking while retaining long-term affinities.
              </p>
            </div>

            {/* Community Affinity Distribution */}
            <div className="mb-4">
              <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
                <span>Top Community Affinities</span>
                <span className="text-[10px] text-slate-400">14 Louvain Clusters</span>
              </h4>

              {memoryState && Object.keys(memoryState.community_affinity).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(memoryState.community_affinity)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 4)
                    .map(([cid, weight]) => (
                      <div key={cid} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                          <span>Community #{cid}</span>
                          <span>{(weight * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, weight * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic p-4 text-center border border-dashed border-slate-200 rounded-2xl">
                  Chat with the assistant or like products to form active community affinities!
                </div>
              )}
            </div>

            {/* Feedback Stats */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Likes Given</span>
                <div className="text-lg font-black text-emerald-900">{memoryState?.liked_count || Object.values(feedbackGiven).filter(v => v === 'like').length}</div>
              </div>
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3">
                <span className="text-[10px] font-bold text-rose-700 uppercase">Disliked Items</span>
                <div className="text-lg font-black text-rose-900">{memoryState?.disliked_count || Object.values(feedbackGiven).filter(v => v === 'dislike').length}</div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 text-center">
            Zero data leakage: recommendations query training graph structure strictly.
          </div>
        </div>

      </div>
    </div>
  )
}
