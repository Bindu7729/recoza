import React, { useState } from 'react'
import {
  ArrowUpRight,
  Search,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Star,
  ShieldCheck,
  Bookmark,
  ChevronRight,
  ArrowRight,
  GitFork,
  Activity,
  Check
} from 'lucide-react'

interface HeroProps {
  onDiscover: (query: string) => void
  onExploreHowItWorks?: () => void
}

const EXAMPLE_PROMPTS = [
  "Recommend a lightweight laptop for programming under ₹70,000",
  "Suggest a sci-fi movie like Interstellar",
  "Recommend a useful gift for someone who loves photography",
  "Cooperative family board games & tabletop strategy"
]

export const Hero: React.FC<HeroProps> = ({ onDiscover, onExploreHowItWorks }) => {
  const [prompt, setPrompt] = useState('')
  const [activeChip, setActiveChip] = useState<string | null>(null)
  
  // Interactive mock state for Hero preview card
  const [previewLiked, setPreviewLiked] = useState<Record<string, 'like' | 'dislike'>>({
    'B001': 'like'
  })
  const [previewSaved, setPreviewSaved] = useState<Record<string, boolean>>({
    'B001': true
  })
  const [activeExplainId, setActiveExplainId] = useState<string | null>('B001')

  const handleChipClick = (chip: string) => {
    setPrompt(chip)
    setActiveChip(chip)
    onDiscover(chip)
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!prompt.trim()) return
    onDiscover(prompt.trim())
  }

  const togglePreviewSave = (id: string) => {
    setPreviewSaved(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const togglePreviewFeedback = (id: string, type: 'like' | 'dislike') => {
    setPreviewLiked(prev => ({
      ...prev,
      [id]: prev[id] === type ? (null as any) : type
    }))
  }

  const handleScrollToHowItWorks = () => {
    if (onExploreHowItWorks) {
      onExploreHowItWorks()
    } else {
      const el = document.getElementById('how-it-works')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative z-10 w-full pt-12 pb-24 sm:pt-20 sm:pb-32 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
      
      {/* ── Two-Column Grid: Hero Copy on Left (col-span-5), Preview Mockup on Right (col-span-7) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 xl:gap-16 items-center">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: Main Typography & Conversational Prompt     */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full aurora-pill text-xs font-semibold text-teal-300 mb-6 shadow-sm border border-teal-500/25 w-fit">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Conversational Graph-Powered Recommendations</span>
          </div>

          {/* Headline matching exact specification (~60-72px desktop) */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[68px] font-extrabold tracking-tight text-white leading-[1.08] mb-6">
            Recommendations That{' '}
            <span className="bg-gradient-to-r from-[#2DD4BF] via-[#38BDF8] to-[#34D399] bg-clip-text text-transparent">
              Understand You.
            </span>
          </h1>

          {/* Supporting text matching exact specification (18-20px desktop) */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-300 leading-relaxed mb-8 max-w-xl font-normal">
            Discover recommendations shaped around your interests, preferences, and changing needs. Tell Recoza what matters to you, explore relevant options, and understand why each recommendation fits.
          </p>

          {/* CTA Buttons Row: Start Discovering + Explore How It Works */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <button
              onClick={() => onDiscover(prompt || 'Explore Top Recommendations')}
              className="aurora-btn-glow text-white text-sm sm:text-base font-bold px-7 py-3.5 rounded-full flex items-center gap-2.5 transition-all hover:scale-105 active:scale-100 cursor-pointer shadow-xl shadow-teal-500/20"
            >
              <span>Start Discovering</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              onClick={handleScrollToHowItWorks}
              className="text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-500/30 text-sm sm:text-base font-semibold px-6 py-3.5 rounded-full transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Explore How It Works</span>
              <ChevronRight className="w-4 h-4 text-teal-400" />
            </button>
          </div>

          {/* Conversational prompt input box */}
          <div id="hero-prompt-box" className="mb-4">
            <form 
              onSubmit={handleSubmit}
              className="aurora-card rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2 shadow-2xl relative border border-teal-500/30 group"
            >
              <div className="flex items-center gap-3 flex-1 pl-3 sm:pl-4">
                <Search className="w-4 h-4 text-teal-400 shrink-0" />
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Find engaging STEM robotics kits or building sets under $60..."
                  className="w-full bg-transparent text-sm sm:text-base text-slate-100 placeholder-slate-400 focus:outline-none font-normal"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 bg-[#0D241C] hover:bg-[#133327] text-teal-200 border border-teal-500/40 text-xs sm:text-sm font-bold px-5 py-2.5 sm:py-3 rounded-xl transition-all shrink-0 hover:scale-[1.02] active:scale-100 cursor-pointer shadow-sm shadow-teal-500/20"
              >
                <span>Discover</span>
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>
          </div>

          {/* Example prompt chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400 mr-1">Try asking:</span>
            {EXAMPLE_PROMPTS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChipClick(chip)}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeChip === chip
                    ? 'bg-teal-500/20 text-teal-200 border border-teal-400/50 shadow-sm'
                    : 'bg-white/5 text-slate-300 border border-white/5 hover:border-teal-500/30 hover:text-white'
                }`}
              >
                <span>{chip}</span>
              </button>
            ))}
          </div>

        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: Realistic Conversational Product Preview   */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          
          {/* Main Simulated Product Container */}
          <div className="aurora-card rounded-3xl p-5 sm:p-7 border border-teal-500/25 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
            
            {/* Ambient inner glow */}
            <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />
            
            {/* Header bar of simulated app */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Recoza Conversational Workspace</span>
                  <span className="text-[10px] text-teal-400 flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                    2,399 items · 14 Louvain Communities Grounded
                  </span>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-slate-400">
                Live Preview
              </span>
            </div>

            {/* Simulated Chat Dialogue Stream */}
            <div className="space-y-4 mb-5">
              
              {/* User Prompt Bubble */}
              <div className="flex items-start justify-end gap-2.5">
                <div className="bg-teal-500/20 border border-teal-400/30 rounded-2xl rounded-tr-sm p-3.5 max-w-sm text-xs sm:text-sm text-white font-medium leading-relaxed shadow-sm">
                  "Looking for a creative STEM building set or engineering kit for a 10-year-old under $60."
                </div>
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-400 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  U
                </div>
              </div>

              {/* Assistant Response Bubble */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0 text-teal-300 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-3.5 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-2 flex-1">
                  <p>
                    Retrieved from our verified catalog across <span className="text-teal-300 font-semibold">Community Cluster #2 (STEM & Science)</span> and <span className="text-teal-300 font-semibold">Cluster #0 (Building Sets)</span> with 98% intent match:
                  </p>
                </div>
              </div>

            </div>

            {/* Embedded Genuine Recommendation Cards */}
            <div className="space-y-3">
              
              {/* Item Card 1 (Authentic Amazon Dataset Item) */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-teal-500/40 transition-all shadow-md">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-teal-300 bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 rounded-full">
                        STEM & Learning Toys
                      </span>
                      <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
                        98% Match
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Cluster #2
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                      Snap Circuits Extreme SC-750 Electronics Discovery Kit
                    </h4>
                  </div>

                  <span className="text-sm sm:text-base font-bold font-mono text-teal-300 shrink-0">
                    $54.99
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span>Store: Elenco Electronics</span>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-bold text-slate-200">4.9</span>
                    <span className="text-[11px] text-slate-500">(1,840 ratings)</span>
                  </div>
                </div>

                {/* Explainability Callout */}
                <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 mb-3 text-[11px] text-slate-300 flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-teal-300">Why recommended:</strong> Top topological co-occurrence with modular logic circuits and creative electronics experiments.
                  </span>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveExplainId(activeExplainId === 'B001' ? null : 'B001')}
                    className="text-[11px] font-semibold text-teal-300 hover:text-teal-200 flex items-center gap-1 cursor-pointer"
                  >
                    <GitFork className="w-3 h-3" />
                    <span>{activeExplainId === 'B001' ? 'Hide Graph Trace' : 'Inspect Graph Path'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => togglePreviewSave('B001')}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        previewSaved['B001']
                          ? 'bg-teal-500/25 border-teal-400 text-teal-300'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                      title="Save Item"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${previewSaved['B001'] ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => togglePreviewFeedback('B001', 'like')}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        previewLiked['B001'] === 'like'
                          ? 'bg-teal-500/25 border-teal-400 text-teal-300'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-teal-300'
                      }`}
                      title="Thumbs Up"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => togglePreviewFeedback('B001', 'dislike')}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        previewLiked['B001'] === 'dislike'
                          ? 'bg-rose-500/25 border-rose-400 text-rose-300'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-rose-300'
                      }`}
                      title="Thumbs Down"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Graph Trace Drawer if active */}
                {activeExplainId === 'B001' && (
                  <div className="mt-3 pt-2.5 border-t border-teal-500/20 text-[10px] text-slate-400 font-mono space-y-1">
                    <div className="flex justify-between text-teal-300">
                      <span>Graph Path: User Intent → Cluster #2 → Degree: 54</span>
                      <span>Modularity Q: 0.742</span>
                    </div>
                    <p className="text-slate-400">
                      Decay factor α = 0.85 applied. Reinforces STEM cluster affinity for subsequent queries.
                    </p>
                  </div>
                )}

              </div>

              {/* Item Card 2 (Authentic Amazon Dataset Item) */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-teal-500/40 transition-all shadow-md">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-teal-300 bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 rounded-full">
                        Building & Construction Sets
                      </span>
                      <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
                        95% Match
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Cluster #0
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                      LEGO Technic Heavy-Duty Rescue Tow Truck Building Set
                    </h4>
                  </div>

                  <span className="text-sm sm:text-base font-bold font-mono text-teal-300 shrink-0">
                    $49.99
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span>Store: LEGO Construction</span>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-bold text-slate-200">4.8</span>
                    <span className="text-[11px] text-slate-500">(2,110 ratings)</span>
                  </div>
                </div>

                {/* Explainability Callout */}
                <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 mb-3 text-[11px] text-slate-300 flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-teal-300">Why recommended:</strong> Strong engineering gear mechanics aligned with 10-year-old difficulty and under-$60 budget ceiling.
                  </span>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    Traversed via 63,745 co-occurrence edges
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => togglePreviewSave('B002')}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        previewSaved['B002']
                          ? 'bg-teal-500/25 border-teal-400 text-teal-300'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                      title="Save Item"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${previewSaved['B002'] ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => togglePreviewFeedback('B002', 'like')}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        previewLiked['B002'] === 'like'
                          ? 'bg-teal-500/25 border-teal-400 text-teal-300'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-teal-300'
                      }`}
                      title="Thumbs Up"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => togglePreviewFeedback('B002', 'dislike')}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        previewLiked['B002'] === 'dislike'
                          ? 'bg-rose-500/25 border-rose-400 text-rose-300'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-rose-300'
                      }`}
                      title="Thumbs Down"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  )
}
export default Hero
