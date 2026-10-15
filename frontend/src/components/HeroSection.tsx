import React, { useState } from 'react'
import { ArrowUpRight, Sparkles, Star, MessageSquare, CheckCircle2, ChevronRight, Info } from 'lucide-react'
import { Item } from '../types'

interface HeroSectionProps {
  onStartShopping: () => void
  onOpenItemDetail: (item: Item) => void
  onOpenExplain: (item: Item) => void
  previewItems: Item[]
}

const SAMPLE_PROMPTS = [
  "Looking for creative building kits under $50",
  "Find top-rated strategy board games for family",
  "Popular Hot Wheels vehicle sets for kids"
]

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartShopping,
  onOpenItemDetail,
  onOpenExplain,
  previewItems
}) => {
  const [selectedPrompt, setSelectedPrompt] = useState(0)

  // Use preview items from catalog or fallback to matching realistic items
  const displayItems = previewItems.slice(0, 2)

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4">
      {/* Outer Rounded Container matching the reference screenshot */}
      <div className="bg-white rounded-[32px] sm:rounded-[40px] shadow-[0_20px_50px_rgba(124,58,237,0.08)] border border-slate-100 p-6 sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* LEFT COLUMN: Hero Text + Interactive Preview Card */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            {/* Top Text Content */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold tracking-wide mb-6">
                <span>AI Shopping Assistant</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-slate-900 leading-[1.12] mb-4">
                Shop Smarter with AI <br />
                <span className="text-blue-600">Anywhere!</span>
              </h1>

              {/* Subheading */}
              <p className="text-slate-500 text-base sm:text-lg max-w-lg leading-relaxed mb-6">
                Find products, compare prices and shop confidently with the help of our AI shopping assistant.
              </p>

              {/* Start Shopping CTA Button matching screenshot */}
              <div className="flex items-center gap-4 mb-8">
                <button
                  onClick={onStartShopping}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base px-6 py-3 rounded-full shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Start Shopping</span>
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>
            </div>

            {/* INTERACTIVE FLOATING PREVIEW CARD matching screenshot bottom-left */}
            <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm mt-4">
              
              {/* User Prompt Bubble */}
              <div className="flex justify-start mb-3">
                <div className="bg-white border border-slate-100 text-slate-700 text-xs sm:text-sm px-4 py-2.5 rounded-2xl rounded-tl-sm shadow-xs font-medium max-w-md">
                  {SAMPLE_PROMPTS[selectedPrompt]}
                </div>
              </div>

              {/* Assistant Response Bubble with Blue Icon */}
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs sm:text-sm text-slate-600 font-medium">
                  Here are the best options for you
                </div>
              </div>

              {/* Product Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                {displayItems.length > 0 ? (
                  displayItems.map((item, idx) => (
                    <div 
                      key={item.item_id}
                      className="bg-white border border-slate-200/70 hover:border-purple-300 rounded-xl sm:rounded-2xl p-3 shadow-xs hover:shadow-md transition-all flex items-center gap-3 group cursor-pointer"
                      onClick={() => onOpenItemDetail(item)}
                    >
                      {/* Product Thumbnail / Graphic */}
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-purple-100 to-blue-50 flex items-center justify-center shrink-0 border border-purple-100 overflow-hidden group-hover:scale-105 transition-transform">
                        <img 
                          src={`https://images.unsplash.com/photo-${idx === 0 ? '1584679109597-c656b19974c9' : '1566576912321-d58ddd7a6088'}?auto=format&fit=crop&w=160&q=80`}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to stylized SVG
                            (e.target as HTMLElement).style.display = 'none'
                          }}
                        />
                        <span className="text-xl">🎁</span>
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
                          {item.store || 'Featured'}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 truncate" title={item.title}>
                          {item.title}
                        </h4>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-1 my-0.5">
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-2.5 h-2.5 ${i < Math.floor(item.average_rating) ? 'fill-amber-400' : 'text-slate-200'}`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {item.average_rating.toFixed(1)}
                          </span>
                        </div>

                        {/* Price & Why Button */}
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs font-extrabold text-slate-900">
                            {item.price_formatted || (item.price != null ? `$${item.price.toFixed(2)}` : 'Price unavailable')}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onOpenExplain(item)
                            }}
                            className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-2 flex items-center gap-0.5"
                          >
                            <span>Why this?</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // Fallback demo cards matching the JBL & Anker screenshot layout
                  <>
                    <div className="bg-white border border-slate-200/70 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-purple-100/70 flex items-center justify-center text-2xl">
                        🎧
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400">JBL</span>
                        <h4 className="text-xs font-bold text-slate-800">Tune 510BT</h4>
                        <div className="flex text-amber-400 text-xs">★★★★☆</div>
                        <span className="text-xs font-extrabold text-slate-900">$49.99</span>
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200/70 rounded-xl p-3 flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-blue-100/70 flex items-center justify-center text-2xl">
                        🎧
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400">ANKER</span>
                        <h4 className="text-xs font-bold text-slate-800">SoundQ20</h4>
                        <div className="flex text-amber-400 text-xs">★★★★☆</div>
                        <span className="text-xs font-extrabold text-slate-900">$79.99</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Bottom Badge matching screenshot */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex gap-1.5">
                  {SAMPLE_PROMPTS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedPrompt(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        selectedPrompt === i ? 'bg-purple-600 w-4' : 'bg-slate-300'
                      }`}
                      title={`Sample query ${i+1}`}
                    />
                  ))}
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-slate-200/80 text-[11px] font-semibold text-purple-700 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span>AI Suggested</span>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: Rich Purple 3D Illustration Card matching reference */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#8B5CF6] via-[#7C3AED] to-[#6D28D9] rounded-[28px] sm:rounded-[36px] relative overflow-hidden flex flex-col justify-between p-6 sm:p-8 min-h-[440px] sm:min-h-[500px] shadow-xl shadow-purple-600/20">
            
            {/* Top Right Header Controls inside Purple card */}
            <div className="flex items-center justify-end gap-2.5 z-10">
              <div className="flex items-center gap-1.5 text-xs font-medium text-white/90 bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full shadow-xs">
                <span>🇬🇧</span>
                <span>English</span>
                <span className="text-white/60 text-[10px]">▼</span>
              </div>
              <button
                onClick={onStartShopping}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md shadow-blue-600/30 transition-all hover:scale-105 active:scale-100"
              >
                <span>Get Started</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* CENTER 3D ILLUSTRATION: Phone Frame + Reaching Hand holding Shopping Bags */}
            <div className="relative my-auto flex items-center justify-center py-4">
              {/* Soft purple glow circles */}
              <div className="absolute w-72 h-72 rounded-full bg-purple-400/20 blur-3xl -top-10 -right-10 pointer-events-none" />
              <div className="absolute w-64 h-64 rounded-full bg-blue-500/20 blur-3xl -bottom-10 -left-10 pointer-events-none" />

              {/* Reference 3D Artwork Render */}
              <div className="relative z-10 w-full max-w-[340px] aspect-[4/3] flex items-center justify-center group">
                <img 
                  src="/assets/hero_3d_card.png" 
                  alt="Recoza 3D Shopping Assistant" 
                  className="w-full h-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.25)] rounded-2xl group-hover:scale-102 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback to reference image
                    (e.target as HTMLImageElement).src = '/assets/reference_hero.png'
                  }}
                />
              </div>
            </div>

            {/* Bottom floating verified badges */}
            <div className="relative z-10 grid grid-cols-2 gap-2.5 pt-2">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2.5 flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white">2,399 Products</div>
                  <div className="text-[9px] text-purple-200">Amazon 2023 Catalog</div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2.5 flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white">14 Communities</div>
                  <div className="text-[9px] text-purple-200">GraphRAG Grounding</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
