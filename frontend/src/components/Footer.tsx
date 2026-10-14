import React from 'react'
import { Sparkles, ArrowUp } from 'lucide-react'

export const Footer: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative z-20 w-full border-t border-teal-500/15 py-14 px-6 sm:px-8 lg:px-12 bg-[#06090E]/95">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Recoza Logo & Short Brand Description */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div 
            onClick={scrollToTop}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-8 h-6 flex items-center justify-center transition-transform group-hover:scale-110">
              <svg viewBox="0 0 36 28" fill="none" className="w-full h-full drop-shadow-[0_0_12px_rgba(45,212,191,0.5)]">
                <path 
                  d="M10 24C6.68629 24 4 21.3137 4 18C4 14.8638 6.40982 12.2903 9.48911 12.0249C10.2831 7.47277 14.2384 4 19 4C24.1685 4 28.4184 7.92558 28.9567 12.9669C31.849 13.5684 34 16.1264 34 19.2C34 22.7346 31.1346 25.6 27.6 25.6C26.969 25.6 11.2 25.6 10 24Z" 
                  fill="#F8FAFC"
                />
              </svg>
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white lowercase">
              recoza<span className="text-teal-400">.</span>
            </span>
          </div>

          <div className="text-xs text-slate-400 max-w-sm leading-relaxed">
            Personalized, conversational recommendation platform designed to help you discover what fits you through explainable graph intelligence.
          </div>
        </div>

        {/* Links: Conversational AI, How It Works, Why Recoza, Comparison */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-300">
          <button 
            onClick={() => scrollTo('conversational')} 
            className="hover:text-teal-300 transition-colors cursor-pointer"
          >
            Conversational AI
          </button>
          <button 
            onClick={() => scrollTo('how-it-works')} 
            className="hover:text-teal-300 transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button 
            onClick={() => scrollTo('why-recoza')} 
            className="hover:text-teal-300 transition-colors cursor-pointer"
          >
            Why Recoza
          </button>
          <button 
            onClick={() => scrollTo('more-than-results')} 
            className="hover:text-teal-300 transition-colors cursor-pointer"
          >
            Comparison
          </button>
          <button 
            onClick={scrollToTop} 
            className="p-2 rounded-xl bg-white/5 hover:bg-teal-500/10 text-slate-400 hover:text-teal-300 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Back to Top"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Top</span>
          </button>
        </div>

      </div>

      {/* Copyright text and telemetry stamp */}
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <span>© {new Date().getFullYear()} Recoza Inc. Grounded in 2,399 Amazon Toys & Games catalog items.</span>
        <span className="text-teal-400/80 font-mono text-[11px]">GraphRAG-MAR Engine v2.4 · 14 Louvain Communities</span>
      </div>
    </footer>
  )
}
export default Footer
