import React, { useState } from 'react'
import { Sparkles, ArrowRight, Check, Compass, Sliders, DollarSign, Layers } from 'lucide-react'
import { UserProfile, UserPreferences } from '../../types'
import { saveUserPreferences } from '../../api'

interface PreferenceSetupProps {
  user: UserProfile
  onComplete: (updatedUser: UserProfile) => void
  onSkip: () => void
}

const AVAILABLE_INTERESTS = [
  { id: "Building & Construction Sets", label: "Building & Construction Sets", desc: "LEGO, architectural models, and modular bricks" },
  { id: "Puzzles & Family Board Games", label: "Puzzles & Family Board Games", desc: "Jigsaws, tabletop strategy, and party challenges" },
  { id: "STEM & Learning Toys", label: "STEM & Learning Toys", desc: "Robotics, science experiments, and logic circuits" },
  { id: "Arts & Creative Crafts", label: "Arts & Creative Crafts", desc: "Painting, sculpting, jewelry, and DIY projects" },
  { id: "Pretend Play & Dolls", label: "Pretend Play & Dolls", desc: "Dolls, action figures, miniatures, and imaginative play" },
  { id: "Vehicles & Action Playsets", label: "Vehicles & Action Playsets", desc: "Die-cast cars, track systems, and RC models" },
  { id: "Outdoor & Active Play", label: "Outdoor & Active Play", desc: "Active games, ride-ons, and backyard sports" },
]

export const PreferenceSetup: React.FC<PreferenceSetupProps> = ({ user, onComplete, onSkip }) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    user.preferences?.interests || ["Building & Construction Sets", "Puzzles & Family Board Games"]
  )
  const [relevanceWeight, setRelevanceWeight] = useState(user.preferences?.relevance_weight || 80)
  const [familiarityWeight, setFamiliarityWeight] = useState(user.preferences?.familiarity_weight || 65)
  const [discoveryWeight, setDiscoveryWeight] = useState(user.preferences?.discovery_weight || 75)
  const [maxPrice, setMaxPrice] = useState(100)
  const [saving, setSaving] = useState(false)

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const prefs: Partial<UserPreferences> = {
        interests: selectedInterests,
        relevance_weight: relevanceWeight,
        familiarity_weight: familiarityWeight,
        discovery_weight: discoveryWeight,
        priority_mode: true,
        price_range: [0, maxPrice]
      }
      const res = await saveUserPreferences(user.user_id, prefs)
      onComplete(res.user)
    } catch (err) {
      console.error('Failed to save preferences:', err)
      onSkip() // fallback smoothly
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080B10] text-[#E2E8F0] font-sans flex flex-col justify-between relative overflow-hidden px-4 py-8">
      
      {/* Ambient Aurora Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-1/3 w-[600px] h-[600px] rounded-full bg-teal-500/10 blur-[150px] animate-pulse-glow" />
      </div>

      <div className="relative z-10 max-w-3xl w-full mx-auto">
        
        {/* Progress Bar & Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full aurora-pill text-[10px] font-bold text-teal-300 uppercase mb-2 border border-teal-500/20">
              <Sparkles className="w-3 h-3 text-teal-400" />
              <span>Step 1 of 1 · First-Time Personalization</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Personalize Your Recoza Experience
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select your favorite categories and fine-tune how our graph engine recommends items for you.
            </p>
          </div>

          <button
            onClick={onSkip}
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer py-2 px-4 rounded-xl hover:bg-white/5"
          >
            Skip for now
          </button>
        </div>

        {/* Step Content Card */}
        <div className="aurora-card rounded-[32px] p-6 sm:p-8 border border-teal-500/20 shadow-2xl space-y-8">
          
          {/* 1. Category Interests */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-400" />
                <span>What are you most interested in exploring?</span>
              </h3>
              <span className="text-[11px] text-teal-300 font-mono">
                {selectedInterests.length} selected
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Grounds your initial dynamic memory vector in corresponding knowledge graph communities:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_INTERESTS.map(item => {
                const isSelected = selectedInterests.includes(item.id)
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleInterest(item.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-teal-500/15 border-teal-400/50 shadow-sm shadow-teal-500/10'
                        : 'bg-white/5 border-white/5 hover:border-teal-500/30'
                    }`}
                  >
                    <div>
                      <span className={`text-xs font-bold block ${isSelected ? 'text-teal-200' : 'text-white'}`}>
                        {item.label}
                      </span>
                      <span className="text-[11px] text-slate-400 leading-snug block mt-0.5">
                        {item.desc}
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

          {/* 2. Priority Sliders */}
          <div className="pt-6 border-t border-white/10">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-400" />
              <span>Discovery & Ranking Priorities</span>
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Control the balance between high relevance, familiar brands, and serendipitous discovery:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Relevance */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <span>Personal Relevance</span>
                  <span className="text-teal-400 font-mono font-bold text-xs">{relevanceWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={relevanceWeight}
                  onChange={e => setRelevanceWeight(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 mt-2 block leading-tight">
                  Weight past interactions
                </span>
              </div>

              {/* Familiarity */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <span>Something Familiar</span>
                  <span className="text-teal-400 font-mono font-bold text-xs">{familiarityWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={familiarityWeight}
                  onChange={e => setFamiliarityWeight(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 mt-2 block leading-tight">
                  Prioritize known brands
                </span>
              </div>

              {/* Discovery */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <span>New Discoveries</span>
                  <span className="text-teal-400 font-mono font-bold text-xs">{discoveryWeight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={discoveryWeight}
                  onChange={e => setDiscoveryWeight(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 mt-2 block leading-tight">
                  MMR graph diversity
                </span>
              </div>
            </div>
          </div>

          {/* 3. Target Budget */}
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-teal-400" />
                <span>Preferred Maximum Price:</span>
                <span className="text-teal-300 font-mono text-sm font-extrabold ml-1">${maxPrice}</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Filter items to align with your desired budget.</p>
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

          {/* Action Button */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onSkip}
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer px-4 py-2.5 rounded-full"
            >
              Skip
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="aurora-btn-glow px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white transition-all hover:scale-105 active:scale-100 cursor-pointer flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Preferences...</span>
                </>
              ) : (
                <>
                  <span>Save Preferences & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>

      </div>

      <div className="relative z-10 text-center text-[11px] text-slate-500 mt-8">
        <span>You can always update your preferences later from your dashboard.</span>
      </div>

    </div>
  )
}
export default PreferenceSetup
