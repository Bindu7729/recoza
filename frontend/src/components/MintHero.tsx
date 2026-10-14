import React, { useState, useEffect } from 'react'
import { ArrowUpRight, Sparkles, Send, CheckCircle2, RotateCcw, ThumbsUp, ThumbsDown, Info } from 'lucide-react'

interface MintHeroProps {
  onDiscoverPrompt: (prompt: string) => void
}

const DEFAULT_CHIPS = [
  "Help me explore my options",
  "Find something that fits me",
  "Discover something new"
]

export const MintHero: React.FC<MintHeroProps> = ({ onDiscoverPrompt }) => {
  const [prompt, setPrompt] = useState('')
  const [activeChip, setActiveChip] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewFeedback, setPreviewFeedback] = useState<'liked' | 'adjusted' | null>(null)

  const handleChipClick = (chipText: string) => {
    setPrompt(chipText)
    setActiveChip(chipText)
    setShowPreview(true)
    setPreviewFeedback(null)
    onDiscoverPrompt(chipText)
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!prompt.trim()) return
    setShowPreview(true)
    setPreviewFeedback(null)
    onDiscoverPrompt(prompt.trim())
  }

  return (
    <section className="relative w-full pt-12 pb-20 px-6 sm:px-10 overflow-hidden">
      
      {/* ── Background Fluid 3D Glass Ribbons matching reference ── */}
      <div className="absolute top-0 left-0 w-80 sm:w-96 h-full pointer-events-none opacity-85 select-none -translate-x-12 sm:-translate-x-4">
        <img 
          src="/assets/left_glass_ribbon.png" 
          alt="" 
          className="w-full h-auto object-contain animate-float-slow"
        />
      </div>

      <div className="absolute top-0 right-0 w-88 sm:w-[420px] h-full pointer-events-none opacity-85 select-none translate-x-12 sm:translate-x-4">
        <img 
          src="/assets/right_glass_ribbon.png" 
          alt="" 
          className="w-full h-auto object-contain animate-float-reverse"
        />
      </div>

      {/* Floating subtle ambient light orbs */}
      <div className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full bg-emerald-200/30 blur-3xl pointer-events-none animate-pulse-soft" />
      <div className="absolute top-1/2 right-1/4 w-72 h-72 rounded-full bg-teal-100/40 blur-3xl pointer-events-none" />

      {/* ── Center Content ── */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        
        {/* Top Pill Badge matching reference */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill text-xs font-semibold text-[#132E24]/90 mb-8 shadow-xs hover:border-[#132E24]/20 transition-all cursor-default">
          <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
          <span>A more personal way to discover</span>
        </div>

        {/* Main Headline matching reference */}
        <h1 className="text-5xl sm:text-6xl md:text-[72px] font-extrabold tracking-tight text-[#132E24] leading-[1.08] mb-6">
          Find what fits you<span className="text-[#132E24]">.</span>
        </h1>

        {/* Subtitle matching reference */}
        <p className="text-base sm:text-xl text-[#132E24]/75 max-w-xl mx-auto font-normal leading-relaxed mb-10">
          Less searching. More discovering.<br />
          Recommendations that start with your preferences,<br />
          and make sense for you.
        </p>

        {/* ── Conversational Prompt Box matching reference ── */}
        <div className="max-w-2xl mx-auto mb-6">
          <form 
            onSubmit={handleSubmit}
            className="glass-card rounded-[28px] p-5 sm:p-6 text-left shadow-[0_20px_50px_rgba(19,46,36,0.06)] hover:shadow-[0_24px_60px_rgba(19,46,36,0.09)] transition-all relative group"
          >
            {/* Input field */}
            <div className="mb-6">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Tell me what you're looking for..."
                className="w-full bg-transparent text-[#132E24] placeholder-[#132E24]/40 text-base sm:text-lg font-medium focus:outline-none"
              />
            </div>

            {/* Bottom Row inside Prompt Box */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/60">
              <div className="flex items-center gap-2 text-xs font-medium text-[#132E24]/60">
                <span className="w-2 h-2 rounded-full bg-[#52B788] animate-pulse" />
                <span>Your next discovery starts here</span>
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 bg-[#132E24] hover:bg-[#0A1A14] text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-full shadow-md shadow-[#132E24]/15 hover:shadow-[#132E24]/25 transition-all hover:scale-[1.02] active:scale-100 self-end sm:self-auto cursor-pointer"
              >
                <span>Let's discover</span>
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </form>
        </div>

        {/* ── "Try asking:" Prompt Chips matching reference ── */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-xs text-[#132E24]/70 mb-4">
          <span className="font-semibold text-[#132E24]/50">Try asking:</span>
          {DEFAULT_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleChipClick(chip)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeChip === chip
                  ? 'bg-[#132E24] text-white shadow-xs'
                  : 'glass-pill text-[#132E24]/85 hover:text-[#132E24] hover:bg-white/90 shadow-2xs'
              }`}
            >
              <span>{chip}</span>
              <ArrowUpRight className="w-3 h-3 stroke-[2.5] opacity-70" />
            </button>
          ))}
        </div>

        {/* Disclaimer Note matching reference */}
        <div className="text-[11px] font-medium text-[#132E24]/45 flex items-center justify-center gap-1.5">
          <span>✦ Interactive preview · No live recommendations yet</span>
        </div>

        {/* ── CONCEPTUAL PREVIEW DRAWER (Expands when prompt is submitted or chip clicked) ── */}
        {showPreview && (
          <div className="max-w-2xl mx-auto mt-8 p-6 rounded-[28px] glass-card text-left border border-white animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-[#132E24]/10 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#132E24] flex items-center justify-center text-white text-xs">
                  ✦
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#132E24] uppercase tracking-wider">
                    Conceptual Discovery Synthesis
                  </h4>
                  <p className="text-[11px] text-[#132E24]/60">
                    Understanding: <span className="font-semibold text-[#132E24]">"{prompt}"</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPreview(false)}
                className="text-xs font-semibold text-[#132E24]/50 hover:text-[#132E24] transition-colors"
              >
                Close Preview
              </button>
            </div>

            {/* Abstract Match Previews without assuming domain */}
            <div className="space-y-3 mb-4">
              <div className="p-3.5 rounded-2xl bg-white/70 border border-white/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#132E24]">Candidate Match Alpha</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800">
                      96% Alignment
                    </span>
                  </div>
                  <p className="text-xs text-[#132E24]/70">
                    Directly addresses your expressed criteria with high topological preference affinity.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#132E24]/60 shrink-0 self-end sm:self-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium">Verified Fit</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/70 border border-white/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#132E24]">Candidate Match Beta</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100/80 text-teal-800">
                      Diversity Alternative
                    </span>
                  </div>
                  <p className="text-xs text-[#132E24]/70">
                    Broadens your selection by introducing a complementary cluster to prevent echo chambers.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#132E24]/60 shrink-0 self-end sm:self-center">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span className="font-medium">Broad Fit</span>
                </div>
              </div>
            </div>

            {/* Feedback Demonstration */}
            <div className="flex items-center justify-between pt-3 border-t border-[#132E24]/10 text-xs text-[#132E24]/70">
              <span>How does this match feel?</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewFeedback('liked')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    previewFeedback === 'liked'
                      ? 'bg-[#132E24] text-white'
                      : 'glass-pill hover:bg-white text-[#132E24]'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Fits Me</span>
                </button>
                <button
                  onClick={() => setPreviewFeedback('adjusted')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    previewFeedback === 'adjusted'
                      ? 'bg-[#132E24] text-white'
                      : 'glass-pill hover:bg-white text-[#132E24]'
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>Adjust</span>
                </button>
              </div>
            </div>
            {previewFeedback && (
              <p className="text-[11px] text-[#2D6A4F] font-semibold mt-2 text-right">
                ✦ Your preference memory would immediately recalibrate future suggestions!
              </p>
            )}
          </div>
        )}

      </div>
    </section>
  )
}
