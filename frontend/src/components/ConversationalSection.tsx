import React, { useState } from 'react'
import {
  MessageSquare,
  Sparkles,
  SlidersHorizontal,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Star,
  Layers,
  ChevronRight
} from 'lucide-react'

export const ConversationalSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'initial' | 'refinement'>('initial')

  return (
    <section id="conversational" className="relative z-10 w-full py-24 sm:py-32 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto border-t border-teal-500/10">
      
      {/* Eyebrow badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full aurora-pill text-xs font-semibold text-teal-300 mb-4 border border-teal-500/20">
        <Sparkles className="w-3.5 h-3.5 text-teal-400" />
        <span>NATURAL INTENT DISCOVERY</span>
      </div>

      {/* Main Section Heading (36-48px) */}
      <div className="max-w-3xl mb-16">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
          Personalization,{' '}
          <span className="bg-gradient-to-r from-[#2DD4BF] via-[#38BDF8] to-[#34D399] bg-clip-text text-transparent">
            Made Conversational.
          </span>
        </h2>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
          Skip the endless drop-downs and frustrating zero-result filter traps. Express what you want in everyday language, and let Recoza translate your intent into graph-grounded recommendations with clear explanations.
        </p>
      </div>

      {/* Two-Column Interactive Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        
        {/* Left Column: 3 Capabilities */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card 1 */}
          <div className="aurora-card rounded-2xl p-6 border border-white/10 hover:border-teal-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 mb-4">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 leading-snug">
              Speak Naturally, Not in Keywords
            </h3>
            <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed">
              Say what you need: <em>"Find a logic game for 4 players under $40 that grandparents and kids can play together."</em> Recoza extracts nuance, complexity, and constraints automatically.
            </p>
          </div>

          {/* Card 2 */}
          <div className="aurora-card rounded-2xl p-6 border border-white/10 hover:border-teal-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 mb-4">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 leading-snug">
              Nuance & Constraint Extraction
            </h3>
            <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed">
              Price caps, age brackets, game lengths, and material preferences are parsed into dynamic graph query vectors, preventing irrelevant results from clogging your feed.
            </p>
          </div>

          {/* Card 3 */}
          <div className="aurora-card rounded-2xl p-6 border border-white/10 hover:border-teal-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 mb-4">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 leading-snug">
              Iterative Dialogue Refinement
            </h3>
            <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed">
              Follow up without starting over: <em>"Can we make it cooperative?"</em> or <em>"Keep it under 45 minutes playtime."</em> Recoza re-ranks candidates in real time.
            </p>
          </div>

        </div>

        {/* Right Column: Interactive Chat Dialogue Showcase */}
        <div className="lg:col-span-7">
          <div className="aurora-card rounded-3xl p-6 sm:p-8 border border-teal-500/30 shadow-2xl relative">
            
            {/* Header with Dialogue Toggle */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Simulated Conversational Flow
                </span>
                <span className="text-[11px] text-teal-400 font-mono">
                  Natural Language Dialogue · Real Data Output
                </span>
              </div>

              {/* Step Toggle */}
              <div className="flex p-1 rounded-xl bg-white/5 border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('initial')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'initial'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-400/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Turn 1: Initial Search
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('refinement')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'refinement'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-400/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Turn 2: Follow-Up Refinement
                </button>
              </div>
            </div>

            {/* Turn 1: Initial Prompt and Result */}
            {activeTab === 'initial' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                
                {/* User Message */}
                <div className="flex items-start justify-end gap-3">
                  <div className="bg-teal-500/20 border border-teal-400/30 rounded-2xl rounded-tr-sm p-4 max-w-md text-xs sm:text-sm text-white leading-relaxed">
                    "We need a fun family strategy board game for 4 players under $45 that is easy to teach but has deep replay value."
                  </div>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-400 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">
                    U
                  </div>
                </div>

                {/* Entity Extraction Pill */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-2 flex-wrap">
                  <span className="text-teal-400 font-mono text-[11px] font-bold">Detected Intent:</span>
                  <span className="px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-300 border border-teal-500/20 text-[10px]">
                    Cluster #1: Board Games
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 text-[10px]">
                    Players: 4
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 text-[10px]">
                    Price: &lt; $45.00
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 text-[10px]">
                    Strategy: Accessible
                  </span>
                </div>

                {/* Assistant Output Item */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-teal-300 bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 rounded-full">
                          Puzzles & Family Games
                        </span>
                        <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
                          97% Match
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        Catan Trade & Build Strategy Board Game (5th Edition)
                      </h4>
                      <span className="text-xs text-slate-400">Store: Catan Studio · 4 Players · 60 mins</span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-bold font-mono text-teal-300">$43.99</span>
                      <div className="flex items-center gap-1 text-amber-400 text-xs justify-end mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-bold text-slate-200">4.9</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-slate-300 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-teal-300">Why recommended:</strong> Strongest modularity hub in Community Cluster #1. Matches your 4-player requirement, under your $45 cap, with accessible trading mechanics for multi-generational groups.
                    </span>
                  </div>
                </div>

              </div>
            )}

            {/* Turn 2: Follow-Up Refinement */}
            {activeTab === 'refinement' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                
                {/* User Follow-up */}
                <div className="flex items-start justify-end gap-3">
                  <div className="bg-teal-500/20 border border-teal-400/30 rounded-2xl rounded-tr-sm p-4 max-w-md text-xs sm:text-sm text-white leading-relaxed">
                    "I love that, but can we pivot to something cooperative so players work as a team instead of competing?"
                  </div>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-400 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">
                    U
                  </div>
                </div>

                {/* Real-time Constraint Update */}
                <div className="p-3 rounded-xl bg-teal-500/15 border border-teal-500/30 text-xs text-teal-300 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-teal-400 animate-spin" />
                  <span>
                    <strong>Updated Query:</strong> Retaining [Family, 4 Players, &lt;$45] + Adding [Cooperative Mechanics]. MMR diversity reranking executed.
                  </span>
                </div>

                {/* Assistant Output Item */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-teal-300 bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 rounded-full">
                          Cooperative Tabletop
                        </span>
                        <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
                          99% Match
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        Pandemic: Cooperative Strategy Board Game
                      </h4>
                      <span className="text-xs text-slate-400">Store: Z-Man Games · 2-4 Players · 45 mins</span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-bold font-mono text-teal-300">$39.99</span>
                      <div className="flex items-center gap-1 text-amber-400 text-xs justify-end mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-bold text-slate-200">4.8</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-slate-300 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-teal-300">Why recommended:</strong> Directly addresses your refinement for cooperative team gameplay. Well within budget ($39.99 vs $45 cap), 45-minute playtime, with proven co-occurrence in family game libraries.
                    </span>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>

    </section>
  )
}
export default ConversationalSection
