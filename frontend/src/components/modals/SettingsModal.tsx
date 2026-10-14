import React from 'react'
import { X, ShieldCheck, Database, User, LogOut, Cpu, GitFork, Layers, Info } from 'lucide-react'
import { UserProfile } from '../../types'

interface SettingsModalProps {
  isOpen: boolean
  user: UserProfile
  onClose: () => void
  onLogout: () => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  user,
  onClose,
  onLogout
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        onClick={e => e.stopPropagation()}
        className="aurora-card rounded-[32px] max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-teal-500/30 relative max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Platform & Graph Settings
            </h2>
            <p className="text-xs text-slate-400">
              System architecture, model parameters, and account details.
            </p>
          </div>
        </div>

        {/* 1. Account Info */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 mb-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <User className="w-4 h-4 text-teal-400" />
              <span>Signed-In Persona</span>
            </span>
            <span className="text-[10px] font-mono text-teal-300 bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 rounded-full">
              ID: {user.user_id}
            </span>
          </div>

          <div className="pt-2 text-xs text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Name:</span>
              <span className="font-bold text-white">{user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Email:</span>
              <span className="font-mono text-white">{user.email || 'alex@recoza.io'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Specialization:</span>
              <span className="text-teal-300">{user.role}</span>
            </div>
          </div>
        </div>

        {/* 2. Dataset & Knowledge Graph Telemetry */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 mb-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-teal-400" />
              <span>Ground-Truth Dataset Telemetry</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Verified
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-black/20 border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase block">Catalog Items</span>
              <span className="text-base font-bold font-mono text-white">2,399</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/20 border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase block">Graph Edges</span>
              <span className="text-base font-bold font-mono text-white">63,745</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/20 border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase block">Louvain Communities</span>
              <span className="text-base font-bold font-mono text-white">14 Clusters</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/20 border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase block">Modularity Metric</span>
              <span className="text-base font-bold font-mono text-teal-300">Q = 0.742</span>
            </div>
          </div>
        </div>

        {/* 3. Mathematical Parameters */}
        <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 mb-6 text-xs text-slate-300 space-y-1.5">
          <div className="font-bold text-teal-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>GraphRAG-MAR Hyperparameters</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            - Dynamic Memory Decay: w(t) = w0 · α^(Δt) with α = 0.85<br />
            - Diversity Objective: Maximal Marginal Relevance (MMR) with λ = 0.65<br />
            - Community Co-occurrence: Multi-hop graph retrieval with degree centrality
          </p>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={() => {
              onClose()
              onLogout()
            }}
            className="px-4 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out of Account</span>
          </button>

          <button
            onClick={onClose}
            className="aurora-btn-glow px-5 py-2 rounded-full text-xs font-bold text-white transition-transform hover:scale-105 cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  )
}
export default SettingsModal
