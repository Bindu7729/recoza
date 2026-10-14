import React from 'react'
import {
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Activity,
  Layers,
  CheckCircle2,
  GitBranch,
  Sliders
} from 'lucide-react'

export const WhyRecoza: React.FC = () => {
  const features = [
    {
      icon: Sparkles,
      title: "Personalized Discovery",
      short: "Recommendations tailored to unique preference vectors.",
      detail: "Instead of serving universal bestseller lists or paid sponsorships, Recoza shapes suggestions around your specific tastes, favorite brands, and current project goals.",
      techBadge: "GraphRAG Dynamic Ranking"
    },
    {
      icon: ShieldCheck,
      title: "Explainable Recommendations",
      short: "Transparent reasoning behind every match.",
      detail: "Every suggested item includes explicit topological explanations: community context, graph co-occurrence paths, and rating metrics so you understand exactly why it was surfaced.",
      techBadge: "Topological Graph Paths"
    },
    {
      icon: MessageSquare,
      title: "Preference-Aware Conversations",
      short: "Natural language dialogue that retains context.",
      detail: "Describe what you need in natural sentences. Recoza extracts constraints like budgets, age brackets, and complexity, retaining them across multi-turn discovery sessions.",
      techBadge: "Multi-Turn Intent Memory"
    },
    {
      icon: Activity,
      title: "Continuous Preference Refinement",
      short: "Adaptive taste memory that evolves with you.",
      detail: "Every thumbs up, thumbs down, and bookmark dynamically re-weights your community affinity vector using exponential time decay (α = 0.85) to prevent recommendation fatigue.",
      techBadge: "Exponential Decay Memory"
    }
  ]

  return (
    <section id="why-recoza" className="relative z-10 w-full py-24 sm:py-32 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto border-t border-teal-500/10">
      
      {/* Eyebrow badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full aurora-pill text-xs font-semibold text-teal-300 mb-4 border border-teal-500/20">
        <Sparkles className="w-3.5 h-3.5 text-teal-400" />
        <span>CORE PLATFORM ADVANTAGES</span>
      </div>

      {/* Main Section Heading (36-48px) */}
      <div className="max-w-3xl mb-16">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
          Why{' '}
          <span className="bg-gradient-to-r from-[#2DD4BF] via-[#38BDF8] to-[#34D399] bg-clip-text text-transparent">
            Recoza?
          </span>
        </h2>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
          Traditional recommendation systems treat you like a statistic in a static matrix. Recoza creates an intelligent pair-discovery experience grounded in authentic catalog relationships.
        </p>
      </div>

      {/* 4 Premium Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((item, idx) => {
          const Icon = item.icon
          return (
            <div
              key={idx}
              className="aurora-card rounded-3xl p-7 sm:p-9 flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300 border border-teal-500/20 hover:border-teal-500/40 shadow-xl"
            >
              <div>
                {/* Header: Icon + Tech Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-teal-300 font-medium">
                    {item.techBadge}
                  </span>
                </div>

                {/* Heading (20-24px) */}
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-snug">
                  {item.title}
                </h3>

                {/* Subtitle */}
                <h4 className="text-sm font-semibold text-teal-300/90 mb-3 leading-snug">
                  {item.short}
                </h4>

                {/* Detailed Description (15-17px) */}
                <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed">
                  {item.detail}
                </p>
              </div>

              {/* Number indicator footer */}
              <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Advantage 0{idx + 1}</span>
                <span className="text-teal-400 font-bold">Implemented & Grounded</span>
              </div>
            </div>
          )
        })}
      </div>

    </section>
  )
}
export default WhyRecoza
