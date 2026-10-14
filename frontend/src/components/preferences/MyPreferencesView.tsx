import React, { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Sliders,
  Sparkles,
  Layers,
  DollarSign,
  Activity,
  Check,
  RefreshCw,
  Save,
  ShieldCheck,
  Compass
} from 'lucide-react'
import { UserProfile, UserPreferences } from '../../types'
import { fetchUserPreferences, saveUserPreferences } from '../../api'

interface MyPreferencesViewProps {
  user: UserProfile
  onBack: () => void
  onUpdateUser: (updatedUser: UserProfile) => void
}

const AVAILABLE_INTERESTS = [
  { id: "Building & Construction Sets", label: "Building & Construction Sets", desc: "LEGO, architectural sets, and modular bricks", cluster: 0 },
  { id: "Puzzles & Family Board Games", label: "Puzzles & Family Board Games", desc: "Jigsaws, strategy games, and party challenges", cluster: 1 },
  { id: "STEM & Learning Toys", label: "STEM & Learning Toys", desc: "Robotics, science experiments, and logic circuits", cluster: 2 },
  { id: "Arts & Creative Crafts", label: "Arts & Creative Crafts", desc: "Painting, sculpting, jewelry, and DIY kits", cluster: 3 },
  { id: "Pretend Play & Dolls", label: "Pretend Play & Dolls", desc: "Action figures, miniatures, and creative storytelling", cluster: 4 },
  { id: "Vehicles & Action Playsets", label: "Vehicles & Action Playsets", desc: "Die-cast cars, tracks, and remote-controlled models", cluster: 5 },
  { id: "Outdoor & Active Play", label: "Outdoor & Active Play", desc: "Active outdoor gear, ride-ons, and sports sets", cluster: 6 },
]

export const MyPreferencesView: React.FC<MyPreferencesViewProps> = ({
  user,
  onBack,
  onUpdateUser
}) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    user.preferences?.interests || ["Building & Construction Sets"]
  )
  const [relevanceWeight, setRelevanceWeight] = useState(user.preferences?.relevance_weight || 80)
  const [familiarityWeight, setFamiliarityWeight] = useState(user.preferences?.familiarity_weight || 65)
  const [discoveryWeight, setDiscoveryWeight] = useState(user.preferences?.discovery_weight || 75)
  const [maxPrice, setMaxPrice] = useState(user.preferences?.price_range?.[1] || 100)
  
  const [memoryAffinity, setMemoryAffinity] = useState<Record<number, number>>({})
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    fetchUserPreferences(user.user_id)
      .then(data => {
        if (data.preferences) {
          setSelectedInterests(data.preferences.interests || [])
          setRelevanceWeight(data.preferences.relevance_weight || 80)
          setFamiliarityWeight(data.preferences.familiarity_weight || 65)
          setDiscoveryWeight(data.preferences.discovery_weight || 75)
          setMaxPrice(data.preferences.price_range?.[1] || 100)
        }
        if (data.memory_affinity) {
          setMemoryAffinity(data.memory_affinity)
        }
      })
      .catch(console.error)
  }, [user.user_id])

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleSave = async () => {
    setSaving(true)
    setSavedSuccess(false)
    try {
      const prefs: Partial<UserPreferences> = {
        interests: selectedInterests,
        relevance_weight: relevanceWeight,
        familiarity_weight: familiarityWeight,
        discovery_weight: discoveryWeight,
        price_range: [0, maxPrice]
      }
      const res = await saveUserPreferences(user.user_id, prefs)
      onUpdateUser(res.user)
      if (res.memory_affinity) {
        setMemoryAffinity(res.memory_affinity)
      }
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to save preferences:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080B10] text-[#E2E8F0] font-sans relative overflow-x-hidden p-4 sm:p-8">
      
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-1/3 w-[600px] h-[600px] rounded-full bg-teal-500/10 blur-[160px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer py-2 px-3 rounded-xl hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Recommender</span>
          </button>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-4 h-4 text-teal-400" />
                <span>Preferences & Memory Synchronized!</span>
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="aurora-btn-glow px-5 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 active:scale-100 cursor-pointer flex items-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full aurora-pill text-[10px] font-bold text-teal-300 uppercase mb-2 border border-teal-500/20">
            <Compass className="w-3.5 h-3.5 text-teal-400" />
            <span>Dynamic Preference Memory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Personalization Settings & Graph Weights
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure how Recoza's GraphRAG engine ranks suggestions based on your preferred domains, brand affinity, and diversity factor.
          </p>
        </div>

        {/* 1. Category Interests */}
        <div className="aurora-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-400" />
              <span>Category Domains & Communities</span>
            </h3>
            <span className="text-xs text-teal-300 font-mono">
              {selectedInterests.length} of {AVAILABLE_INTERESTS.length} selected
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Active category domains receive positive affinity boosts during multi-hop graph retrieval:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {AVAILABLE_INTERESTS.map(item => {
              const isSelected = selectedInterests.includes(item.id)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleInterest(item.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-teal-500/15 border-teal-400/50 shadow-md shadow-teal-500/10'
                      : 'bg-white/5 border-white/5 hover:border-teal-500/30'
                  }`}
                >
                  <div>
                    <span className={`text-xs font-bold block ${isSelected ? 'text-teal-200' : 'text-white'}`}>
                      {item.label}
                    </span>
                    <span className="text-[11px] text-slate-400 leading-snug block mt-1">
                      {item.desc}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-2 block">
                      Cluster Community #{item.cluster}
                    </span>
                  </div>

                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isSelected ? 'bg-teal-400 text-slate-950 font-bold' : 'border border-slate-600'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 2. Priority Sliders & Price Cap */}
        <div className="aurora-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-teal-400" />
            <span>Ranking & Diversity Multipliers</span>
          </h3>
          <p className="text-xs text-slate-400">
            Adjust the formula balance between historical relevance, familiar brands, and serendipitous discovery (Maximal Marginal Relevance):
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Relevance */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                <span>Personal Relevance</span>
                <span className="text-teal-400 font-mono font-bold">{relevanceWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={relevanceWeight}
                onChange={e => setRelevanceWeight(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 mt-2 block leading-relaxed">
                Prioritizes items connected to your recent positive feedback interactions.
              </span>
            </div>

            {/* Familiarity */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                <span>Familiarity Weight</span>
                <span className="text-teal-400 font-mono font-bold">{familiarityWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={familiarityWeight}
                onChange={e => setFamiliarityWeight(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 mt-2 block leading-relaxed">
                Prioritizes established brands with high rating count in the knowledge base.
              </span>
            </div>

            {/* Discovery / MMR */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                <span>Discovery (MMR Diversity)</span>
                <span className="text-teal-400 font-mono font-bold">{discoveryWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={discoveryWeight}
                onChange={e => setDiscoveryWeight(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 mt-2 block leading-relaxed">
                Applies MMR penalty to redundant items and introduces diverse sub-clusters.
              </span>
            </div>
          </div>

          {/* Budget Limit */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-teal-400" />
                <span>Preferred Budget Ceiling:</span>
                <span className="text-teal-300 font-mono text-sm font-extrabold ml-1">${maxPrice}</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Filter items in queries to stay within this target price range.</p>
            </div>

            <div className="w-full sm:w-64">
              <input
                type="range"
                min="20"
                max="250"
                step="5"
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

        </div>

        {/* 3. Learned Graph Memory Status */}
        <div className="aurora-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-400" />
              <span>Learned Graph Memory Vector State</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Decay parameter: α = 0.85
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-xs text-slate-300 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Whenever you interact with items (via thumbs up, thumbs down, or saving), Recoza dynamically re-weights your affinity across the 14 Louvain communities. Older actions undergo exponential decay so fresh discoveries reflect your evolving taste.
            </p>
          </div>
        </div>

      </div>

    </div>
  )
}
export default MyPreferencesView
