import React from 'react'
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Database,
  GitFork,
  Layers,
  ShieldCheck,
  TrendingUp,
  Sliders
} from 'lucide-react'

export const ValueComparison: React.FC = () => {
  return (
    <section id="more-than-results" className="relative z-10 w-full py-24 sm:py-32 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto border-t border-teal-500/10">
      
      {/* Eyebrow badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full aurora-pill text-xs font-semibold text-teal-300 mb-4 border border-teal-500/20">
        <Sparkles className="w-3.5 h-3.5 text-teal-400" />
        <span>VALUE & ARCHITECTURE</span>
      </div>

      {/* Main Section Heading (36-48px) */}
      <div className="max-w-3xl mb-16">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
          More Than a{' '}
          <span className="bg-gradient-to-r from-[#2DD4BF] via-[#38BDF8] to-[#34D399] bg-clip-text text-transparent">
            List of Results.
          </span>
        </h2>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
          Traditional platforms display lists based on advertising bids and popularity. Recoza helps you actively explore relevant options, understand why each match fits, and steer recommendations through conversation.
        </p>
      </div>

      {/* Clean Visual Composition: Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-16">
        
        {/* Card 1: Conventional Search */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/5">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  The Old Way
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-200 mt-1">
                  Conventional E-Commerce Search
                </h3>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <XCircle className="w-5 h-5" />
              </div>
            </div>

            <ul className="space-y-4 text-sm sm:text-[15px] text-slate-400">
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-400/80 shrink-0 mt-0.5" />
                <span><strong>Keyword-Dependent:</strong> Fails when queries don't match exact merchant product titles.</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-400/80 shrink-0 mt-0.5" />
                <span><strong>Black-Box Ranking:</strong> Driven by paid advertising bids and generic universal bestsellers.</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-400/80 shrink-0 mt-0.5" />
                <span><strong>Rigid Filter Menus:</strong> Selecting multiple checkboxes often returns a frustrating "0 items found".</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-400/80 shrink-0 mt-0.5" />
                <span><strong>Zero Explanation:</strong> Gives no clue why an item was chosen or how it relates to your taste.</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-400/80 shrink-0 mt-0.5" />
                <span><strong>Stateless & Forgetful:</strong> Resets every session without learning from your feedback reactions.</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-white/5 text-xs text-slate-500 font-mono">
            Outcome: Overwhelming choices, endless scrolling, high regret
          </div>
        </div>

        {/* Card 2: Recoza Conversational Discovery */}
        <div className="aurora-card p-8 sm:p-10 rounded-3xl border border-teal-500/35 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-teal-500/20">
              <div>
                <span className="text-xs font-bold text-teal-300 uppercase tracking-wider block">
                  The Recoza Way
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  Conversational Graph Discovery
                </h3>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <ul className="space-y-4 text-sm sm:text-[15px] text-slate-200">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <span><strong>Natural Intent Dialogue:</strong> Speak in natural language with budgets, age brackets, and themes.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <span><strong>Topological Knowledge Graph:</strong> Matches surfaced via 63,745 genuine co-occurrence item edges.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <span><strong>Transparent Explainability:</strong> Shows community clusters, match percentages, and reasoning paths.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <span><strong>Customizable Priority Multipliers:</strong> Fine-tune relevance, familiarity, and diversity (MMR).</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <span><strong>Dynamic Preference Memory:</strong> Learns from every like and bookmark with exponential decay (α = 0.85).</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-teal-500/20 text-xs text-teal-300 font-mono flex items-center justify-between">
            <span>Outcome: Confident, fast discovery that aligns with you</span>
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          </div>
        </div>

      </div>

      {/* Ground-Truth Telemetry Callout Strip */}
      <div className="aurora-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Genuine Dataset Ground Truth</h4>
              <p className="text-xs text-slate-400">Strictly backed by authentic data with zero invented catalog items</p>
            </div>
          </div>

          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-bold">
            Verified In Production
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Catalog Items
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
              2,399
            </span>
            <span className="text-[11px] text-teal-300/80 block mt-1">Amazon Toys & Games</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Graph Edges
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
              63,745
            </span>
            <span className="text-[11px] text-teal-300/80 block mt-1">Topological Co-occurrence</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Louvain Clusters
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
              14
            </span>
            <span className="text-[11px] text-teal-300/80 block mt-1">Modularity Q = 0.742</span>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Memory Decay
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-teal-300">
              α = 0.85
            </span>
            <span className="text-[11px] text-teal-300/80 block mt-1">Dynamic Recency Vector</span>
          </div>
        </div>
      </div>

    </section>
  )
}
export default ValueComparison
