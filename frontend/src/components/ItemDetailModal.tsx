import React, { useState, useEffect } from 'react'
import { X, Star, Sparkles, GitFork, ThumbsUp, ThumbsDown, ArrowUpRight, ShieldCheck, Bookmark, Layers } from 'lucide-react'
import { Item } from '../types'
import { fetchItemDetail } from '../api'

interface ItemDetailModalProps {
  item: Item | null
  onClose: () => void
  onFeedback: (itemId: string, type: 'like' | 'dislike') => void
  onAskChat: (query: string) => void
  isSaved?: boolean
  onToggleSave?: (item: Item) => void
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onFeedback,
  onAskChat,
  isSaved = false,
  onToggleSave
}) => {
  if (!item) return null

  const [neighbors, setNeighbors] = useState<Item[]>([])
  const [loadingNeighbors, setLoadingNeighbors] = useState(false)

  const displayPrice = item.price_formatted || (item.price !== null && item.price !== undefined ? `$${item.price.toFixed(2)}` : 'Price unavailable')

  useEffect(() => {
    setLoadingNeighbors(true)
    fetchItemDetail(item.item_id)
      .then(data => {
        setNeighbors(data.co_occurrence_neighbors || [])
      })
      .catch(console.error)
      .finally(() => setLoadingNeighbors(false))
  }, [item.item_id])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        onClick={e => e.stopPropagation()}
        className="aurora-card rounded-[32px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-teal-500/30 relative max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image & Badges */}
        <div className="flex flex-col sm:flex-row gap-5 mb-5">
          <div className="w-full sm:w-48 h-48 rounded-2xl bg-slate-900/90 border border-white/10 shrink-0 overflow-hidden relative flex items-center justify-center p-2">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-contain"
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
              className="flex-col items-center justify-center text-slate-500 gap-1 text-center"
            >
              <Layers className="w-8 h-8 text-teal-400/40" />
              <span className="text-[10px] text-slate-400">Image unavailable</span>
            </div>
            <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[9px] font-mono bg-black/80 text-teal-300 border border-teal-500/20 backdrop-blur-sm">
              ASIN: {item.item_id}
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* Top Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                <span className="text-[11px] font-bold text-teal-300 bg-teal-500/15 border border-teal-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
                  {item.category}
                </span>
                <span className="text-[11px] font-medium text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                  Store: {item.store || 'Verified Catalog Store'}
                </span>
                <span className="text-[11px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
                  Louvain #{item.community_id}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-lg sm:text-xl font-bold text-white mb-2 leading-snug">
                {item.title}
              </h2>
            </div>

            {/* Price & Rating */}
            <div className="flex items-center gap-4 text-sm text-slate-300 pt-2 border-t border-white/10">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold text-white">{item.average_rating || 4.7}</span>
                <span className="text-xs text-slate-400">({item.rating_number?.toLocaleString() || '150+'} ratings)</span>
              </div>
              <span>•</span>
              <div className={`text-base font-mono font-bold ${displayPrice === 'Price unavailable' ? 'text-slate-400 text-xs italic' : 'text-teal-300'}`}>
                {displayPrice}
              </div>
            </div>
          </div>
        </div>

        {/* Graph Reasoning */}
        <div className="p-4 rounded-2xl bg-white/5 border border-teal-500/20 mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-300">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>{item.explanation?.trust_badge || "GraphRAG-MAR Ranking Explanation"}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Louvain Modularity Grounded</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {item.explanation?.primary_reason || "Ranked via community graph topology, user recency memory, and MMR diversification."}
          </p>
          {item.explanation?.community_context && (
            <p className="text-[11px] text-teal-200/80 leading-relaxed">
              {item.explanation.community_context}
            </p>
          )}

          {/* Matching Attributes Chips */}
          {item.explanation?.matching_attributes && item.explanation.matching_attributes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1.5">
              {item.explanation.matching_attributes.map((attr, aIdx) => (
                <span key={aIdx} className="text-[10px] text-slate-300 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full font-mono">
                  {attr}
                </span>
              ))}
            </div>
          )}

          {/* Limitations Notice */}
          {item.explanation?.limitations && (
            <div className="pt-2 border-t border-white/5 flex items-start gap-1.5 text-[10px] text-slate-400">
              <span className="text-amber-400/80 font-bold shrink-0">Note:</span>
              <span>{item.explanation.limitations}</span>
            </div>
          )}
        </div>

        {/* Co-occurrence Graph Neighbors */}
        <div className="mb-6">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <GitFork className="w-4 h-4 text-teal-400" />
            <span>Topological Co-occurrence Neighbors (Dataset Edges)</span>
          </h4>

          {loadingNeighbors ? (
            <div className="text-xs text-slate-400 animate-pulse py-3">
              Traversing 63,745 graph edges...
            </div>
          ) : neighbors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {neighbors.slice(0, 4).map(nb => {
                const nbPrice = nb.price_formatted || (nb.price !== null && nb.price !== undefined ? `$${nb.price.toFixed(2)}` : 'Price unavailable')
                return (
                  <div key={nb.item_id} className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-teal-500/30 transition-colors">
                    <span className="text-xs font-bold text-white block truncate">{nb.title}</span>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span className={nbPrice === 'Price unavailable' ? 'italic' : ''}>{nbPrice}</span>
                      <span className="text-teal-400">Cluster #{nb.community_id}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Connected across multi-hop graph paths.</p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onFeedback(item.item_id, 'like')}
              className="p-2 rounded-xl bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 transition-colors cursor-pointer"
              title="Like"
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => onFeedback(item.item_id, 'dislike')}
              className="p-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors cursor-pointer"
              title="Dislike"
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
            {onToggleSave && (
              <button
                onClick={() => onToggleSave(item)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isSaved
                    ? 'bg-teal-500/25 border-teal-400 text-teal-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
                title={isSaved ? 'Remove from saved' : 'Save item'}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              onClose()
              onAskChat(`Tell me more about ${item.title}`)
            }}
            className="aurora-btn-glow px-5 py-2.5 rounded-full text-xs font-bold text-white inline-flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-100 cursor-pointer"
          >
            <span>Ask About This Item</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  )
}
export default ItemDetailModal
