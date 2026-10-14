import React from 'react'
import { MessageSquare, Search, ShieldCheck, Sparkles, Layers, ArrowRight } from 'lucide-react'

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: "01",
      icon: MessageSquare,
      title: "Tell Us What Matters",
      subtitle: "Share your interests, needs, and preferences.",
      detail: "Describe what you're seeking in your own words, set priority sliders for relevance or diversity, and specify budget or age parameters. Recoza extracts multi-dimensional preference vectors without forcing you through rigid filter menus.",
      tag: "Conversational Intent Extraction"
    },
    {
      num: "02",
      icon: Search,
      title: "Discover Relevant Matches",
      subtitle: "Explore recommendations selected around your preferences.",
      detail: "Our GraphRAG engine traverses 63,745 verified co-occurrence edges across 14 Louvain communities to surface candidates that truly fit your criteria, balancing high relevance with curated diversity via Maximal Marginal Relevance.",
      tag: "Topological Candidate Retrieval"
    },
    {
      num: "03",
      icon: ShieldCheck,
      title: "Understand Every Match",
      subtitle: "See explanations of why the recommended options may suit you.",
      detail: "Every suggestion is paired with transparent, human-readable explanations showing exact community clusters, graph co-occurrence paths, and rating metrics so you can evaluate matches with complete confidence.",
      tag: "Explainable Graph Traversal"
    }
  ]

  return (
    <section id="how-it-works" className="relative z-10 w-full py-24 sm:py-32 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto border-t border-teal-500/10">
      
      {/* Eyebrow badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full aurora-pill text-xs font-semibold text-teal-300 mb-4 border border-teal-500/20">
        <Sparkles className="w-3.5 h-3.5 text-teal-400" />
        <span>THREE SIMPLE STEPS</span>
      </div>

      {/* Main Headline (36-48px) */}
      <div className="max-w-3xl mb-16">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
          How Recoza{' '}
          <span className="bg-gradient-to-r from-[#2DD4BF] via-[#38BDF8] to-[#34D399] bg-clip-text text-transparent">
            Works.
          </span>
        </h2>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
          Designed from the ground up to replace black-box recommendation lists with a transparent, adaptive discovery engine that respects your taste.
        </p>
      </div>

      {/* 3 Visually Distinct Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, idx) => {
          const Icon = step.icon
          return (
            <div
              key={idx}
              className="aurora-card rounded-3xl p-7 sm:p-8 flex flex-col justify-between group hover:-translate-y-2 transition-all duration-300 border border-teal-500/20 hover:border-teal-500/40 shadow-xl"
            >
              <div>
                {/* Header: Step Number + Icon */}
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-2xl font-bold text-teal-400">
                    {step.num} /
                  </span>
                  
                  <div className="p-3 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-300 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                {/* Card Title (20-24px) */}
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-snug">
                  {step.title}
                </h3>

                {/* Card Subtitle */}
                <h4 className="text-sm font-semibold text-teal-300/90 mb-3 leading-snug">
                  {step.subtitle}
                </h4>

                {/* Card Detail (15-17px) */}
                <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed">
                  {step.detail}
                </p>
              </div>

              {/* Footer Process Tag */}
              <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-teal-400/90">
                <span>{step.tag}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              </div>
            </div>
          )
        })}
      </div>

    </section>
  )
}
export default HowItWorks
