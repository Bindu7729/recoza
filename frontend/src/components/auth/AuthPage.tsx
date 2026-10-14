import React, { useState } from 'react'
import { Eye, EyeOff, ArrowRight, ArrowLeft, Sparkles, AlertCircle, CheckCircle2, User, Mail, Lock } from 'lucide-react'
import { registerUser, loginUserWithEmail } from '../../api'
import { UserProfile } from '../../types'

interface AuthPageProps {
  onAuthSuccess: (user: UserProfile) => void
  onBackToHome: () => void
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, onBackToHome }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  
  // Form fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // UI states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!email.trim() || !password.trim()) {
      setError('Please provide both email and password.')
      return
    }
    if (mode === 'register' && !name.trim()) {
      setError('Please provide your full name.')
      return
    }
    if (mode === 'register' && password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      if (mode === 'register') {
        const res = await registerUser(name.trim(), email.trim(), password)
        localStorage.setItem('recoza_user_id', res.user.user_id)
        localStorage.setItem('recoza_token', res.token)
        onAuthSuccess(res.user)
      } else {
        const res = await loginUserWithEmail(email.trim(), password)
        localStorage.setItem('recoza_user_id', res.user.user_id)
        localStorage.setItem('recoza_token', res.token)
        onAuthSuccess(res.user)
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  // Quick Demo Account Auto-Fill
  const handleFillDemo = (demoEmail: string, demoName: string) => {
    setMode('login')
    setEmail(demoEmail)
    setPassword('recoza123')
    setError(null)
  }

  return (
    <div className="min-h-screen bg-[#080B10] text-[#E2E8F0] font-sans flex flex-col justify-between relative overflow-hidden px-4 py-8">
      
      {/* Ambient Aurora Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[140px] animate-pulse-glow" />
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] rounded-full bg-emerald-500/10 blur-[130px]" />
      </div>

      {/* Top Header */}
      <div className="relative z-10 max-w-md w-full mx-auto flex items-center justify-between mb-4">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer py-1.5 px-3 rounded-full hover:bg-white/5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-6 h-5 flex items-center justify-center">
            <svg viewBox="0 0 36 28" fill="none" className="w-full h-full drop-shadow-[0_0_10px_rgba(45,212,191,0.5)]">
              <path 
                d="M10 24C6.68629 24 4 21.3137 4 18C4 14.8638 6.40982 12.2903 9.48911 12.0249C10.2831 7.47277 14.2384 4 19 4C24.1685 4 28.4184 7.92558 28.9567 12.9669C31.849 13.5684 34 16.1264 34 19.2C34 22.7346 31.1346 25.6 27.6 25.6C26.969 25.6 11.2 25.6 10 24Z" 
                fill="#F8FAFC"
              />
            </svg>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white lowercase">
            recoza<span className="text-teal-400">.</span>
          </span>
        </div>
      </div>

      {/* Auth Card Container */}
      <div className="relative z-10 max-w-md w-full mx-auto aurora-card rounded-[32px] p-6 sm:p-8 border border-teal-500/25 shadow-2xl">
        
        {/* Tab Switcher */}
        <div className="flex p-1 rounded-2xl bg-white/5 border border-white/5 mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Title & Description */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {mode === 'login' ? 'Welcome Back' : 'Get Started with Recoza'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {mode === 'login'
              ? 'Sign in to access your conversational recommendation workspace.'
              : 'Create your account to experience personalized, explainable recommendations.'}
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 mb-5 text-xs text-rose-300 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-teal-400/80 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400/50"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-teal-400/80 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400/50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-teal-400/80 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400/50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full aurora-btn-glow py-3 rounded-2xl text-xs sm:text-sm font-bold text-white transition-all hover:scale-[1.01] active:scale-100 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Workspace' : 'Create My Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

        {/* Demo Accounts Quick-Fill Section */}
        <div className="mt-8 pt-5 border-t border-white/10">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
            Quick-Test Personas
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('alex@recoza.io', 'Alex Rivera')}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-teal-500/10 border border-white/5 hover:border-teal-500/30 text-left transition-all cursor-pointer"
            >
              <span className="text-xs font-bold text-white block">Alex Rivera</span>
              <span className="text-[10px] text-teal-300/80 block">Creative Builder</span>
            </button>

            <button
              type="button"
              onClick={() => handleFillDemo('sarah@recoza.io', 'Sarah Jenkins')}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-teal-500/10 border border-white/5 hover:border-teal-500/30 text-left transition-all cursor-pointer"
            >
              <span className="text-xs font-bold text-white block">Sarah Jenkins</span>
              <span className="text-[10px] text-teal-300/80 block">Collector</span>
            </button>
          </div>
        </div>

      </div>

      {/* Footer Info */}
      <div className="relative z-10 text-center text-[11px] text-slate-500 mt-6">
        <span>Protected with secure persistent hashing · Recoza Platform 2026</span>
      </div>

    </div>
  )
}
export default AuthPage
