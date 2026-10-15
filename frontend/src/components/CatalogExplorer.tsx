import React, { useState, useEffect } from 'react'
import { Search, Filter, Star, Sparkles, ChevronLeft, ChevronRight, Compass, X } from 'lucide-react'
import { Item } from '../types'
import { fetchCatalog, fetchCategories } from '../api'

interface CatalogExplorerProps {
  isOpen: boolean
  onClose: () => void
  onOpenItemDetail: (item: Item) => void
}

export const CatalogExplorer: React.FC<CatalogExplorerProps> = ({
  isOpen,
  onClose,
  onOpenItemDetail
}) => {
  if (!isOpen) return null

  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  // Filters
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCommunity, setSelectedCommunity] = useState<number | null>(null)
  const [page, setPage] = useState(0)
  const limit = 12

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error)
  }, [])

  useEffect(() => {
    loadItems()
  }, [search, selectedCategory, selectedCommunity, page])

  const loadItems = async () => {
    setLoading(true)
    try {
      const data = await fetchCatalog({
        q: search,
        category: selectedCategory,
        community_id: selectedCommunity !== null ? selectedCommunity : undefined,
        limit,
        offset: page * limit
      })
      setItems(data.items)
      setTotal(data.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        onClick={e => e.stopPropagation()}
        className="aurora-card rounded-[32px] max-w-5xl w-full h-[90vh] flex flex-col p-6 sm:p-8 shadow-2xl border border-teal-500/30 relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-500/15 border border-teal-500/30">
              <Compass className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Explore Knowledge Graph Catalog</h2>
              <p className="text-xs text-slate-400">2,399 verified Amazon items across 14 Louvain communities</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-6 shrink-0">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-teal-400/80 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Filter by title or keyword..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400/50"
            />
          </div>

          <div className="sm:col-span-6 flex gap-2">
            <select
              value={selectedCommunity ?? ''}
              onChange={e => { setSelectedCommunity(e.target.value ? Number(e.target.value) : null); setPage(0); }}
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-400/50 cursor-pointer"
            >
              <option value="" className="bg-[#080B10]">All 14 Communities</option>
              {Array.from({ length: 14 }).map((_, i) => (
                <option key={i} value={i} className="bg-[#080B10]">Community #{i}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs text-teal-300">Filtering catalog...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-xs">
              No items match this filter criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {items.map(item => (
                <div
                  key={item.item_id}
                  onClick={() => onOpenItemDetail(item)}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/40 hover:bg-white/10 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-teal-400 mb-1.5 font-mono">
                      <span>Cluster #{item.community_id}</span>
                      <span className="font-bold text-white">{item.price_formatted || (item.price != null ? `$${item.price.toFixed(2)}` : 'Price unavailable')}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors line-clamp-2 mb-2 leading-snug">
                      {item.title}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{item.average_rating || 4.6}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Degree: {item.degree || 12}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Found {total} items · Page {page + 1} of {Math.max(1, totalPages)}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 cursor-pointer text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 cursor-pointer text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
export default CatalogExplorer
