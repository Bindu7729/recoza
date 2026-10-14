import React, { useState } from 'react'
import { ThumbsUp, ThumbsDown, Star, Sparkles, Sliders, CheckCircle2 } from 'lucide-react'

export const PersonalizationSection: React.FC = () => {
  // Preference Controls State
  const [customPreferences, setCustomPreferences] = useState(false)
  const [priorityPreferences, setPriorityPreferences] = useState(true)
  const [relevanceValue, setRelevanceValue] = useState(78)
  const [familiarValue, setFamiliarValue] = useState(62)
  const [discoveryValue, setDiscoveryValue] = useState(85)
  const [feedbackSelected, setFeedbackSelected] = useState<'like' | 'star' | 'dislike' | null>('like')

  // Graph Map State
  const [selectedNode, setSelectedNode] = useState<string>('core')
  const [graphFeedback, setGraphFeedback] = useState<'up' | 'down' | null>('up')

  // Dynamic values based on selected graph node
  const nodeInfo = {
    core: { label: "User Dynamic Preference Vector", matchPref: "94%", matchPrio: "88%" },
    node1: { label: "Cluster #01 · Board & Family Games", matchPref: "91%", matchPrio: "85%" },
    node2: { label: "Cluster #03 · STEM Robotics & Tech", matchPref: "87%", matchPrio: "93%" },
    node3: { label: "Cluster #04 · Creative Building Sets", matchPref: "96%", matchPrio: "90%" },
    node4: { label: "Cluster #07 · Puzzles & Logic Games", matchPref: "89%", matchPrio: "82%" },
    node5: { label: "Cluster #11 · Vehicles & Outdoor", matchPref: "83%", matchPrio: "79%" },
  }

  const activeStats = nodeInfo[selectedNode as keyof typeof nodeInfo] || nodeInfo.core

  return (
    <section id="personalization" className="relative z-10 w-full py-16 px-6 sm:px-10 max-w-7xl mx-auto border-t border-white/5">
      
      {/* Section Header matching reference */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center px-3.5 py-1 rounded-full aurora-pill text-[10px] font-bold tracking-wider text-teal-300 uppercase mb-3 border border-teal-500/20">
          <span>CONCEPT PREVIEW</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Personalization & Explainability UI
        </h2>
        <p className="text-xs font-bold text-teal-400 tracking-widest uppercase mt-2">
          MADE FOR YOUR KIND OF DIFFERENT
        </p>
      </div>

      {/* ── Two Cards Side-by-Side Grid matching reference ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* ────────────────────────────────────────────────────────── */}
        {/* CARD A: "Your preferences. Not everyone else's."           */}
        {/* ────────────────────────────────────────────────────────── */}
        <div className="aurora-card rounded-[32px] p-6 sm:p-8 flex flex-col justify-between border border-teal-500/25 shadow-2xl">
          <div>
            <h3 className="text-lg font-extrabold text-white leading-snug">
              Your preferences.
            </h3>
            <h4 className="text-sm font-medium text-slate-400 mb-6">
              Not everyone else's.
            </h4>

            {/* Toggle: Custom preferences */}
            <div className="flex items-center justify-between py-2.5 px-4 rounded-2xl bg-white/5 border border-white/5 mb-3">
              <span className="text-xs font-medium text-slate-200">Custom preferences</span>
              <button
                type="button"
                onClick={() => setCustomPreferences(!customPreferences)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  customPreferences ? 'bg-teal-500 shadow-md shadow-teal-500/30' : 'bg-slate-700'
                }`}
              >
                <div 
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    customPreferences ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle: Priority preferences (Active Glowing) */}
            <div className="flex items-center justify-between py-2.5 px-4 rounded-2xl bg-teal-950/40 border border-teal-500/30 mb-6">
              <span className="text-xs font-semibold text-teal-200">Priority preferences</span>
              <button
                type="button"
                onClick={() => setPriorityPreferences(!priorityPreferences)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  priorityPreferences ? 'bg-teal-400 shadow-md shadow-teal-400/40' : 'bg-slate-700'
                }`}
              >
                <div 
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    priorityPreferences ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Interactive Sliders matching reference */}
            <div className="space-y-4 mb-6">
              {/* Slider 1: Personal relevance */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <span>Personal relevance</span>
                  <span className="text-teal-400 font-mono font-bold text-xs">{relevanceValue}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={relevanceValue}
                  onChange={(e) => setRelevanceValue(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Slider 2: Something familiar */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <span>Something familiar</span>
                  <span className="text-teal-400 font-mono font-bold text-xs">{familiarValue}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={familiarValue}
                  onChange={(e) => setFamiliarValue(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Slider 3: New discoveries */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <span>New discoveries</span>
                  <span className="text-teal-400 font-mono font-bold text-xs">{discoveryValue}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={discoveryValue}
                  onChange={(e) => setDiscoveryValue(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Feedback Row matching reference */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <span className="text-xs font-medium text-slate-400">Feedback</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFeedbackSelected('like')}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  feedbackSelected === 'like' ? 'bg-teal-500/25 text-teal-300 border border-teal-500/50 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Like"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => setFeedbackSelected('star')}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  feedbackSelected === 'star' ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Favorite"
              >
                <Star className="w-4 h-4" />
              </button>
              <button
                onClick={() => setFeedbackSelected('dislike')}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  feedbackSelected === 'dislike' ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Dislike"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ────────────────────────────────────────────────────────── */}
        {/* CARD B: "A recommendation. And a reason."                  */}
        {/* ────────────────────────────────────────────────────────── */}
        <div className="aurora-card rounded-[32px] p-6 sm:p-8 flex flex-col justify-between border border-teal-500/25 shadow-2xl">
          <div>
            <h3 className="text-lg font-extrabold text-white leading-snug">
              A recommendation.
            </h3>
            <h4 className="text-sm font-medium text-slate-400 mb-4">
              And a reason.
            </h4>

            {/* Explainability data map bar + feedback */}
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-semibold text-teal-300">Explainability data map</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setGraphFeedback('up')}
                  className={`p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                    graphFeedback === 'up' ? 'bg-teal-500/30 text-teal-200 border border-teal-500/40' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Feedback positive"
                >
                  👍
                </button>
                <button 
                  onClick={() => setGraphFeedback('down')}
                  className={`p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                    graphFeedback === 'down' ? 'bg-rose-500/30 text-rose-200 border border-rose-500/40' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Feedback negative"
                >
                  👎
                </button>
              </div>
            </div>

            {/* ── KNOWLEDGE GRAPH VISUALIZATION matching reference ── */}
            <div className="w-full h-44 rounded-2xl bg-[#060D13]/85 border border-teal-500/25 relative overflow-hidden flex items-center justify-center p-2 mb-4">
              <svg className="w-full h-full" viewBox="0 0 240 140">
                {/* Connecting Edges */}
                <line x1="120" y1="70" x2="60" y2="40" stroke="#2DD4BF" strokeOpacity={selectedNode === 'node1' ? "0.9" : "0.35"} strokeWidth={selectedNode === 'node1' ? "2.5" : "1.5"} />
                <line x1="120" y1="70" x2="180" y2="40" stroke="#A855F7" strokeOpacity={selectedNode === 'node2' ? "0.9" : "0.35"} strokeWidth={selectedNode === 'node2' ? "2.5" : "1.5"} />
                <line x1="120" y1="70" x2="48" y2="100" stroke="#34D399" strokeOpacity={selectedNode === 'node3' ? "0.9" : "0.35"} strokeWidth={selectedNode === 'node3' ? "2.5" : "1.5"} />
                <line x1="120" y1="70" x2="192" y2="100" stroke="#38BDF8" strokeOpacity={selectedNode === 'node4' ? "0.9" : "0.35"} strokeWidth={selectedNode === 'node4' ? "2.5" : "1.5"} />
                <line x1="120" y1="70" x2="120" y2="122" stroke="#818CF8" strokeOpacity={selectedNode === 'node5' ? "0.9" : "0.3"} strokeWidth={selectedNode === 'node5' ? "2.5" : "1.5"} />
                <line x1="60" y1="40" x2="48" y2="100" stroke="#64748B" strokeOpacity="0.2" strokeWidth="1" />
                <line x1="180" y1="40" x2="192" y2="100" stroke="#64748B" strokeOpacity="0.2" strokeWidth="1" />

                {/* Peripheral Node 1 */}
                <g onClick={() => setSelectedNode('node1')} className="cursor-pointer">
                  <circle cx="60" cy="40" r="10" fill="#38BDF8" fillOpacity="0.2" />
                  <circle cx="60" cy="40" r="6" fill="#38BDF8" />
                </g>

                {/* Peripheral Node 2 */}
                <g onClick={() => setSelectedNode('node2')} className="cursor-pointer">
                  <circle cx="180" cy="40" r="10" fill="#A855F7" fillOpacity="0.2" />
                  <circle cx="180" cy="40" r="6" fill="#A855F7" />
                </g>

                {/* Peripheral Node 3 */}
                <g onClick={() => setSelectedNode('node3')} className="cursor-pointer">
                  <circle cx="48" cy="100" r="10" fill="#34D399" fillOpacity="0.2" />
                  <circle cx="48" cy="100" r="6" fill="#34D399" />
                </g>

                {/* Peripheral Node 4 */}
                <g onClick={() => setSelectedNode('node4')} className="cursor-pointer">
                  <circle cx="192" cy="100" r="11" fill="#2DD4BF" fillOpacity="0.2" />
                  <circle cx="192" cy="100" r="7" fill="#2DD4BF" />
                </g>

                {/* Peripheral Node 5 */}
                <g onClick={() => setSelectedNode('node5')} className="cursor-pointer">
                  <circle cx="120" cy="122" r="8" fill="#818CF8" fillOpacity="0.2" />
                  <circle cx="120" cy="122" r="5" fill="#818CF8" />
                </g>

                {/* Central Glowing Core Node */}
                <g onClick={() => setSelectedNode('core')} className="cursor-pointer">
                  <circle cx="120" cy="70" r="18" fill="#2DD4BF" fillOpacity="0.25" className="animate-pulse" />
                  <circle cx="120" cy="70" r="10" fill="#2DD4BF" />
                  <circle cx="120" cy="70" r="4" fill="#FFFFFF" />
                </g>
              </svg>

              <div className="absolute bottom-2 left-3 text-[10px] text-teal-300 font-mono">
                {activeStats.label}
              </div>
            </div>
          </div>

          {/* Match traits footer row matching reference */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Match traits
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-sm font-black text-teal-400 block">{activeStats.matchPref}</span>
                <span className="text-[10px] text-slate-300 leading-tight block mt-0.5">Connected to your preferences</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-sm font-black text-teal-400 block">{activeStats.matchPrio}</span>
                <span className="text-[10px] text-slate-300 leading-tight block mt-0.5">Aligned with your priorities</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </section>
  )
}
export default PersonalizationSection
