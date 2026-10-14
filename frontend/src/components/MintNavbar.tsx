import React, { useState } from 'react'
import { ArrowUpRight, Menu, X, Sparkles } from 'lucide-react'

interface MintNavbarProps {
  onHowItWorksClick: () => void
  onAboutClick: () => void
  onGetStartedClick: () => void
  onSignInClick: () => void
}

export const MintNavbar: React.FC<MintNavbarProps> = ({
  onHowItWorksClick,
  onAboutClick,
  onGetStartedClick,
  onSignInClick
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="w-full max-w-7xl mx-auto px-6 sm:px-10 pt-6 pb-4 relative z-40">
      <div className="flex items-center justify-between">
        
        {/* Brand Logo matching reference */}
        <div className="flex items-center gap-2.5 cursor-pointer group">
          <div className="w-7 h-5 flex items-center justify-center transition-transform group-hover:scale-105">
            <svg viewBox="0 0 36 28" fill="none" className="w-full h-full">
              <path 
                d="M10 24C6.68629 24 4 21.3137 4 18C4 14.8638 6.40982 12.2903 9.48911 12.0249C10.2831 7.47277 14.2384 4 19 4C24.1685 4 28.4184 7.92558 28.9567 12.9669C31.849 13.5684 34 16.1264 34 19.2C34 22.7346 31.1346 25.6 27.6 25.6C26.969 25.6 11.2 25.6 10 24Z" 
                fill="#132E24"
              />
            </svg>
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#132E24] lowercase">
            recoza<span className="text-[#132E24]">.</span>
          </span>
        </div>

        {/* Center Links matching reference */}
        <nav className="hidden md:flex items-center gap-10">
          <button
            onClick={onHowItWorksClick}
            className="text-sm font-semibold text-[#132E24]/80 hover:text-[#132E24] transition-colors"
          >
            How it works
          </button>
          <button
            onClick={onAboutClick}
            className="text-sm font-semibold text-[#132E24]/80 hover:text-[#132E24] transition-colors"
          >
            About Recoza
          </button>
        </nav>

        {/* Right CTA Actions matching reference */}
        <div className="hidden sm:flex items-center gap-6">
          <button
            onClick={onSignInClick}
            className="text-sm font-semibold text-[#132E24]/85 hover:text-[#132E24] transition-colors"
          >
            Sign in
          </button>

          <button
            onClick={onGetStartedClick}
            className="flex items-center gap-1.5 bg-[#132E24] hover:bg-[#0A1A14] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Get started</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-[#132E24] hover:bg-black/5"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 p-5 rounded-3xl glass-card space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => {
              onHowItWorksClick()
              setMobileMenuOpen(false)
            }}
            className="w-full text-left py-2 text-sm font-bold text-[#132E24]"
          >
            How it works
          </button>
          <button
            onClick={() => {
              onAboutClick()
              setMobileMenuOpen(false)
            }}
            className="w-full text-left py-2 text-sm font-bold text-[#132E24]"
          >
            About Recoza
          </button>
          <div className="pt-3 border-t border-[#132E24]/10 flex flex-col gap-2">
            <button
              onClick={() => {
                onSignInClick()
                setMobileMenuOpen(false)
              }}
              className="w-full text-left py-2 text-sm font-bold text-[#132E24]"
            >
              Sign in
            </button>
            <button
              onClick={() => {
                onGetStartedClick()
                setMobileMenuOpen(false)
              }}
              className="w-full py-2.5 bg-[#132E24] text-white rounded-full text-sm font-bold flex items-center justify-center gap-1.5"
            >
              <span>Get started</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
