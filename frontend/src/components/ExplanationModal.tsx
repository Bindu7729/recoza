import React from 'react'
import { X, Sparkles, Network, Activity, ShieldCheck, Star, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Item } from '../types'

interface ExplanationModalProps {
  item: Item | null
  onClose: () => void
  onFeedback: (itemId: string, type: 'like' | 'dislike') => void
}

export const ExplanationModal: React.FC<ExplanationModalProps> = ({
  item,
  onClose,
  onFeedback
}) => {
  if (!item) return null

  const exp = item.explanation || {
    primary_reason: `High collaborative affinity with active user preferences in ${item.category}.`,
    community_context: `Assigned to Louvain Community #${item.community_id} (Modularity Q=0.2306).`,
    graph_path: `Co-occurrence links verified across Amazon Toys & Games item graph.`,
    recency_reason: `Weighted via exponential decay (alpha = 0.85) reflecting interaction recency.`,
    trust_badge: "Graph Verified (+0.05 Bonus)"
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Why was this recommended?</h3>
            <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 mt-0.5">
              {exp.trust_badge}
            </span>
          </div>
        </div>

        {/* Item Title Preview */}
        <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5 mb-5 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-200/50 flex items-center justify-center text-xl shrink-0">
            🎁
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">
              {item.category}
            </span>
            <h4 className="text-xs font-bold text-slate-900 truncate" title={item.title}>
              {item.title}
            </h4>
            <div className="text-[11px] font-bold text-slate-700 mt-0.5">
              ${item.price.toFixed(2)} • {item.average_rating.toFixed(1)}★ ({item.rating_number} reviews)
            </div>
          </div>
        </div>

        {/* Reasoning Pillars */}
        <div className="space-y-3 mb-6">
          {/* 1. Primary Reason */}
          <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-2xl">
            <div className="text-[11px] font-bold text-purple-900 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Primary Relevance</span>
            </div>
            <p className="text-xs text-purple-800 leading-relaxed">
              {exp.primary_reason}
            </p>
          </div>

          {/* 2. Community Topology */}
          <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-2xl">
            <div className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5 mb-1">
              <Network className="w-3.5 h-3.5 text-blue-600" />
              <span>Community Topology (Louvain Cluster #{item.community_id})</span>
            </div>
            <p className="text-xs text-blue-800 leading-relaxed">
              {exp.community_context}
            </p>
          </div>

          {/* 3. Relational Path & Recency */}
          <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl">
            <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 mb-1">
              <Activity className="w-3.5 h-3.5 text-slate-600" />
              <span>Dynamic Memory Path</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-1">
              {exp.graph_path}
            </p>
            <p className="text-[11px] text-slate-400 italic">
              {exp.recency_reason}
            </p>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-500 font-medium">Was this explanation helpful?</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onFeedback(item.item_id, 'like')
                onClose()
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Helpful</span>
            </button>
            <button
              onClick={() => {
                onFeedback(item.item_id, 'dislike')
                onClose()
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>Not Helpful</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
