import React, { useState, useEffect } from 'react'
import { User, Activity, ThumbsUp, History, Star, RefreshCw } from 'lucide-react'
import { DemoUser, UserMemory, Item } from '../types'
import { fetchUserProfile } from '../api'

interface ProfileViewProps {
  currentUser: DemoUser | null
  onOpenExplain: (item: Item) => void
  onOpenItemDetail: (item: Item) => void
  onOpenAuth: () => void
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onOpenExplain,
  onOpenItemDetail,
  onOpenAuth
}) => {
  const [profileData, setProfileData] = useState<{
    memory: UserMemory
    liked_items: Item[]
    history_items: Item[]
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const loadProfile = async () => {
    setLoading(true)
    try {
      const uid = currentUser ? currentUser.user_id : 'guest'
      const data = await fetchUserProfile(uid)
      setProfileData(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [currentUser])

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4">
      {/* Profile Overview Card */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 text-2xl font-black">
              {currentUser ? currentUser.name[0] : 'G'}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {currentUser ? currentUser.name : 'Guest Session'}
              </h2>
              <p className="text-xs text-slate-500">
                {currentUser ? `@${currentUser.username} • ${currentUser.role}` : 'Anonymous visitor • Ephemeral memory'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadProfile}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Refresh profile state"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onOpenAuth}
              className="px-4 py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-colors"
            >
              Switch Profile
            </button>
          </div>
        </div>

        {/* Dynamic Affinity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Recorded Interactions
            </span>
            <div className="text-2xl font-black text-slate-900">
              {profileData?.memory?.history_count || 0}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Chronologically sorted for exponential decay.
            </p>
          </div>

          <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block mb-1">
              Active Community Clusters
            </span>
            <div className="text-2xl font-black text-purple-900">
              {profileData?.memory ? Object.keys(profileData.memory.community_affinity).length : 0}
            </div>
            <p className="text-[11px] text-purple-700 mt-1">
              Louvain communities influencing ranking.
            </p>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
              Positive Feedback Signals
            </span>
            <div className="text-2xl font-black text-emerald-900">
              {profileData?.memory?.liked_count || 0}
            </div>
            <p className="text-[11px] text-emerald-700 mt-1">
              Boosted in dynamic preference weights.
            </p>
          </div>
        </div>
      </div>

      {/* Liked Items & History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Liked Items */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl p-6">
          <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <ThumbsUp className="w-4 h-4 text-emerald-600" />
            <span>Liked Products ({profileData?.liked_items?.length || 0})</span>
          </h3>

          {profileData?.liked_items && profileData.liked_items.length > 0 ? (
            <div className="space-y-3">
              {profileData.liked_items.map(it => (
                <div
                  key={it.item_id}
                  onClick={() => onOpenItemDetail(it)}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/60 hover:border-emerald-200 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block">{it.category}</span>
                    <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-800">{it.title}</h4>
                    <span className="text-xs font-extrabold text-slate-900">{it.price_formatted || (it.price != null ? `$${it.price.toFixed(2)}` : 'Price unavailable')}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onOpenExplain(it)
                    }}
                    className="text-[10px] text-purple-700 font-bold bg-white px-2.5 py-1 rounded-xl shadow-2xs shrink-0"
                  >
                    Explain
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic p-6 text-center border border-dashed border-slate-200 rounded-2xl">
              No liked products yet. Like products in chat or explore to train your personal profile!
            </div>
          )}
        </div>

        {/* Recent History */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl p-6">
          <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <History className="w-4 h-4 text-purple-600" />
            <span>Interaction History ({profileData?.history_items?.length || 0})</span>
          </h3>

          {profileData?.history_items && profileData.history_items.length > 0 ? (
            <div className="space-y-3">
              {profileData.history_items.map((it, idx) => (
                <div
                  key={`${it.item_id}_${idx}`}
                  onClick={() => onOpenItemDetail(it)}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-purple-50/50 border border-slate-200/60 hover:border-purple-200 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] font-bold text-purple-600 uppercase block">{it.category}</span>
                    <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-purple-800">{it.title}</h4>
                    <span className="text-xs font-extrabold text-slate-900">{it.price_formatted || (it.price != null ? `$${it.price.toFixed(2)}` : 'Price unavailable')}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onOpenExplain(it)
                    }}
                    className="text-[10px] text-purple-700 font-bold bg-white px-2.5 py-1 rounded-xl shadow-2xs shrink-0"
                  >
                    Explain
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic p-6 text-center border border-dashed border-slate-200 rounded-2xl">
              No interaction history yet. Browse the catalog to build your dynamic session!
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
