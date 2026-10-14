import React, { useState } from 'react'
import { ArrowUpRight, Menu, X, Sparkles } from 'lucide-react'
import { DemoUser } from '../types'

interface NavbarProps {
  currentUser: DemoUser | null
  onOpenAuth: () => void
  onGetStarted: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuth,
  onGetStarted
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-[#080B10]/85 border-b border-teal-500/15 transition-all">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4 flex items-center justify-between">
        
        {/* Recoza Logo and Brand Name */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-8 h-7 flex items-center justify-center transition-transform group-hover:scale-105">
            <svg viewBox="0 0 36 28" fill="none" className="w-full h-full drop-shadow-[0_0_14px_rgba(45,212,191,0.6)]">
              <path 
                d="M10 24C6.68629 24 4 21.3137 4 18C4 14.8638 6.40982 12.2903 9.48911 12.0249C10.2831 7.47277 14.2384 4 19 4C24.1685 4 28.4184 7.92558 28.9567 12.9669C31.849 13.5684 34 16.1264 34 19.2C34 22.7346 31.1346 25.6 27.6 25.6C26.969 25.6 11.2 25.6 10 24Z" 
                fill="#F8FAFC"
              />
            </svg>
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white lowercase">
            recoza<span className="text-teal-400">.</span>
          </span>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-[10px] font-bold text-teal-300 uppercase tracking-wider ml-1">
            AI Platform
          </span>
        </div>

        {/* Center Nav Items */}
        <nav className="hidden lg:flex items-center gap-8">
          <button 
            onClick={() => scrollToSection('conversational')}
            className="text-sm font-medium text-slate-300 hover:text-teal-300 transition-colors cursor-pointer"
          >
            Conversational AI
          </button>
          <button 
            onClick={() => scrollToSection('how-it-works')}
            className="text-sm font-medium text-slate-300 hover:text-teal-300 transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button 
            onClick={() => scrollToSection('why-recoza')}
            className="text-sm font-medium text-slate-300 hover:text-teal-300 transition-colors cursor-pointer"
          >
            Why Recoza
          </button>
          <button 
            onClick={() => scrollToSection('more-than-results')}
            className="text-sm font-medium text-slate-300 hover:text-teal-300 transition-colors cursor-pointer"
          >
            Comparison
          </button>
        </nav>

        {/* Right Actions: Sign In & Get Started Button */}
        <div className="hidden sm:flex items-center gap-5">
          <button 
            onClick={onOpenAuth}
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer px-3 py-1.5 rounded-xl hover:bg-white/5"
          >
            {currentUser ? `Hi, ${currentUser.name.split(' ')[0]}` : 'Sign In'}
          </button>

          <button 
            onClick={onGetStarted}
            className="aurora-btn-glow text-white text-sm font-bold px-5 py-2.5 rounded-full flex items-center gap-2 transition-all hover:scale-105 active:scale-100 cursor-pointer shadow-lg shadow-teal-500/15"
          >
            <span>Get Started</span>
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-6 pb-6 pt-3 border-t border-white/5 bg-[#080B10]/98 space-y-3 animate-in fade-in duration-200">
          <button 
            onClick={() => scrollToSection('conversational')}
            className="w-full text-left py-2.5 text-sm font-medium text-slate-200 hover:text-teal-300"
          >
            Conversational AI
          </button>
          <button 
            onClick={() => scrollToSection('how-it-works')}
            className="w-full text-left py-2.5 text-sm font-medium text-slate-200 hover:text-teal-300"
          >
            How It Works
          </button>
          <button 
            onClick={() => scrollToSection('why-recoza')}
            className="w-full text-left py-2.5 text-sm font-medium text-slate-200 hover:text-teal-300"
          >
            Why Recoza
          </button>
          <button 
            onClick={() => scrollToSection('more-than-results')}
            className="w-full text-left py-2.5 text-sm font-medium text-slate-200 hover:text-teal-300"
          >
            Comparison
          </button>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            <button 
              onClick={() => { setMobileMenuOpen(false); onOpenAuth(); }}
              className="w-full py-2.5 text-center text-sm font-semibold text-slate-200 hover:text-white rounded-xl bg-white/5"
            >
              {currentUser ? `Signed in as ${currentUser.name}` : 'Sign In'}
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onGetStarted(); }}
              className="w-full py-3 aurora-btn-glow text-white rounded-full text-sm font-bold flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
export default Navbar
