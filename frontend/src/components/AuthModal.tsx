import React, { useState } from 'react'
import { X, User, Sparkles, LogIn, ArrowUpRight } from 'lucide-react'
import { DemoUser } from '../types'
import { loginUser } from '../api'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess: (user: DemoUser) => void
  demoUsers: DemoUser[]
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  demoUsers
}) => {
  if (!isOpen) return null

  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return
    setLoading(true)
    try {
      const res = await loginUser(username.trim())
      onLoginSuccess(res.user)
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectDemo = async (u: DemoUser) => {
    setLoading(true)
    try {
      const res = await loginUser(u.username)
      onLoginSuccess(res.user)
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        onClick={e => e.stopPropagation()}
        className="aurora-card rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-teal-500/30 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
          <h2 className="text-xl font-bold text-white tracking-tight">Sign In to Recoza</h2>
        </div>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Select an authentic persona from our knowledge graph to test personalized preference memory:
        </p>

        {/* Demo Personas List */}
        <div className="space-y-2.5 mb-6">
          {demoUsers.map((u) => (
            <button
              key={u.username}
              onClick={() => handleSelectDemo(u)}
              disabled={loading}
              className="w-full text-left p-3.5 rounded-2xl bg-white/5 hover:bg-teal-500/10 border border-white/5 hover:border-teal-500/30 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center text-teal-300 font-bold text-xs group-hover:scale-105 transition-transform">
                  {u.name[0]}
                </div>
                <div>
                  <div className="font-bold text-sm text-white group-hover:text-teal-300 transition-colors">
                    {u.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {u.role}
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-teal-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>

        {/* Custom Username Input */}
        <div className="pt-4 border-t border-white/10">
          <form onSubmit={handleCustomLogin} className="flex gap-2">
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Or enter custom username..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400/50"
            />
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="aurora-btn-glow px-4 py-2 rounded-xl text-xs font-bold text-white transition-transform hover:scale-[1.02] active:scale-100 disabled:opacity-40 cursor-pointer"
            >
              Sign In
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
export default AuthModal
