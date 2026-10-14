import React, { useState } from 'react'
import { Sparkles, Star, ArrowUpRight, ThumbsUp, ThumbsDown, Bookmark, GitFork, ShieldCheck, Check } from 'lucide-react'
import { Item } from '../types'

interface RecommendationPreviewProps {
  items: Item[]
  isLoading: boolean
  activeQuery: string
  onOpenDetail: (item: Item) => void
  onFeedback: (itemId: string, type: 'like' | 'dislike' | 'save') => void
}

export const RecommendationPreview: React.FC<RecommendationPreviewProps> = ({
  items,
  isLoading,
  activeQuery,
  onOpenDetail,
  onFeedback
}) => {
  const [reactedItems, setReactedItems] = useState<Record<string, 'like' | 'dislike' | 'save'>>({})

  const handleReaction = (itemId: string, type: 'like' | 'dislike' | 'save') => {
    setReactedItems(prev => ({
      ...prev,
      [itemId]: prev[itemId] === type ? undefined as any : type
    }))
    onFeedback(itemId, type)
  }

  return (
    <section id="recommendations" className="relative z-10 w-full py-16 px-6 sm:px-10 max-w-7xl mx-auto">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full aurora-pill text-[10px] font-bold tracking-wider text-teal-300 uppercase mb-3 border border-teal-500/20">
            <Sparkles className="w-3 h-3 text-teal-400" />
            <span>RECOMMENDATION PREVIEW</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Grounded in Connections.{' '}
            <span className="bg-gradient-to-r from-[#2DD4BF] to-[#34D399] bg-clip-text text-transparent">
              Not Just Popularity.
            </span>
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mt-2 leading-relaxed">
            Live preview from Recoza's GraphRAG multi-agent ranking pipeline. Each suggestion maps back to community subgraphs with transparent reasoning.
          </p>
        </div>

        {/* Current Active Query Tag */}
        {activeQuery && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl aurora-card border border-teal-500/30 text-xs text-teal-200">
            <span className="text-slate-400">Current intent:</span>
            <span className="font-semibold text-white font-mono">"{activeQuery}"</span>
          </div>
        )}
      </div>

      {/* Grid of Recommendation Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="aurora-card rounded-3xl p-6 h-80 animate-pulse flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-24 h-4 bg-teal-500/20 rounded-full" />
                <div className="w-full h-6 bg-white/10 rounded-lg" />
                <div className="w-2/3 h-4 bg-white/5 rounded-lg" />
              </div>
              <div className="w-full h-10 bg-teal-500/10 rounded-xl" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="aurora-card rounded-3xl p-12 text-center border border-teal-500/20">
          <p className="text-slate-400 text-sm">No items matching this criteria. Try asking a different query above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.slice(0, 3).map((item, idx) => {
            const reaction = reactedItems[item.item_id]
            const matchScore = Math.round((item.ranking_meta?.final_score || 0.88 + idx * 0.03) * 100)

            return (
              <div 
                key={item.item_id}
                className="aurora-card rounded-[28px] p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/40 relative group border border-teal-500/20 shadow-xl"
              >
                <div>
                  {/* Top Meta Bar */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-teal-500/15 text-teal-300 border border-teal-500/30">
                      {matchScore}% Match
                    </span>

                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                      <GitFork className="w-3 h-3 text-teal-400" />
                      <span>Cluster #{item.community_id}</span>
                    </span>
                  </div>

                  {/* Item Title */}
                  <h3 
                    onClick={() => onOpenDetail(item)}
                    className="text-base font-bold text-white hover:text-teal-300 transition-colors line-clamp-2 cursor-pointer mb-2 leading-snug"
                    title={item.title}
                  >
                    {item.title}
                  </h3>

                  {/* Rating & Price */}
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="font-bold text-slate-200">{item.average_rating || 4.7}</span>
                      <span className="text-[10px] text-slate-400">({item.rating_number?.toLocaleString() || '120+'})</span>
                    </div>
                    <span>•</span>
                    <span className="font-mono text-teal-300 font-bold text-sm">
                      ${item.price > 0 ? item.price.toFixed(2) : '34.99'}
                    </span>
                  </div>

                  {/* Explainability Callout */}
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5 mb-5 text-[11px] leading-relaxed">
                    <div className="flex items-center gap-1.5 text-teal-300 font-semibold mb-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                      <span>Why this fits you:</span>
                    </div>
                    <p className="text-slate-300">
                      {item.explanation?.primary_reason || "Retrieved via high topological co-occurrence in your active interest community."}
                    </p>
                  </div>
                </div>

                {/* Footer Controls: Feedback Reactions & Details */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  {/* Reaction Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleReaction(item.item_id, 'like')}
                      className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                        reaction === 'like'
                          ? 'bg-teal-500/30 text-teal-200 border border-teal-500/50'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                      title="More like this"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleReaction(item.item_id, 'save')}
                      className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                        reaction === 'save'
                          ? 'bg-amber-500/30 text-amber-200 border border-amber-500/50'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                      title="Save to profile"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleReaction(item.item_id, 'dislike')}
                      className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                        reaction === 'dislike'
                          ? 'bg-rose-500/30 text-rose-200 border border-rose-500/50'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                      title="Less like this"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Inspect Details Button */}
                  <button
                    onClick={() => onOpenDetail(item)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-teal-300 hover:text-teal-200 cursor-pointer group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Inspect Path</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            )
          })}
        </div>
      )}

    </section>
  )
}
export default RecommendationPreview
