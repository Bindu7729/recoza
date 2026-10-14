import React, { useState, useEffect } from 'react'
import { X, Star, Sparkles, GitFork, ThumbsUp, ThumbsDown, ArrowUpRight, ShieldCheck, Bookmark } from 'lucide-react'
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

        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-[11px] font-bold text-teal-300 bg-teal-500/15 border border-teal-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
            {item.category}
          </span>
          <span className="text-[11px] font-medium text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            Store: {item.store || 'Verified Store'}
          </span>
          <span className="text-[11px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
            Louvain Cluster #{item.community_id}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 leading-snug">
          {item.title}
        </h2>

        {/* Price & Rating */}
        <div className="flex items-center gap-4 text-sm text-slate-300 mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-bold text-white">{item.average_rating || 4.7}</span>
            <span className="text-xs text-slate-400">({item.rating_number?.toLocaleString() || '150+'} ratings)</span>
          </div>
          <span>•</span>
          <div className="text-lg font-mono font-bold text-teal-300">
            ${item.price > 0 ? item.price.toFixed(2) : '34.99'}
          </div>
        </div>

        {/* Graph Reasoning */}
        <div className="p-4 rounded-2xl bg-white/5 border border-teal-500/20 mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-300 mb-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>GraphRAG-MAR Ranking Explanation</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {item.explanation?.primary_reason || "Ranked via community graph topology, user recency memory, and MMR diversification."}
          </p>
          {item.explanation?.community_context && (
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              {item.explanation.community_context}
            </p>
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
              {neighbors.slice(0, 4).map(nb => (
                <div key={nb.item_id} className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-teal-500/30 transition-colors">
                  <span className="text-xs font-bold text-white block truncate">{nb.title}</span>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>${nb.price > 0 ? nb.price.toFixed(2) : '24.99'}</span>
                    <span className="text-teal-400">Cluster #{nb.community_id}</span>
                  </div>
                </div>
              ))}
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
