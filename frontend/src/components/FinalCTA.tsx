import React from 'react'
import { ArrowRight, Sparkles, Check } from 'lucide-react'

interface FinalCTAProps {
  onDiscoverClick: () => void
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onDiscoverClick }) => {
  return (
    <section className="relative z-10 w-full py-28 sm:py-36 px-6 sm:px-8 lg:px-12 max-w-5xl mx-auto text-center border-t border-teal-500/10">
      
      {/* Ambient background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[300px] bg-teal-500/12 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full aurora-pill text-xs font-semibold text-teal-300 mb-6 border border-teal-500/20">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>START EXPLORING RECOZA</span>
        </div>

        {/* Main Headline matching exact specification (~48-60px) */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] mb-6 max-w-3xl">
          Your next great discovery{' '}
          <span className="bg-gradient-to-r from-[#2DD4BF] via-[#38BDF8] to-[#34D399] bg-clip-text text-transparent">
            starts here.
          </span>
        </h2>

        {/* Supporting text matching exact specification (18-20px) */}
        <p className="text-base sm:text-lg lg:text-xl text-slate-300 leading-relaxed max-w-2xl mb-10 font-normal">
          Start with what you like. Refine what matters. Discover recommendations that fit you.
        </p>

        {/* Prominent Button: Get Started */}
        <button
          onClick={onDiscoverClick}
          className="aurora-btn-glow px-9 py-4 rounded-full text-base sm:text-lg font-bold text-white transition-all hover:scale-105 active:scale-100 cursor-pointer shadow-2xl shadow-teal-500/25 flex items-center gap-3"
        >
          <span>Get Started</span>
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Supporting Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-teal-400" />
            <span>2,399 Grounded Catalog Items</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-teal-400" />
            <span>No Credit Card Required</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-teal-400" />
            <span>Explainable Graph AI</span>
          </span>
        </div>

      </div>
    </section>
  )
}
export default FinalCTA
