import { useState, useMemo } from 'react'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { cn, groupBy, sortBy } from '@/lib/utils'
import { UnitCard } from './UnitCard'
import { Spinner } from '@/components/ui/Spinner'
import type { BSSelectionEntry, BSCatalogue } from '@/lib/bsdata/types'

interface UnitPickerProps {
  catalogues: BSCatalogue[]
  loading?: boolean
  onAddUnit: (entry: BSSelectionEntry, catalogueId: string) => void
  className?: string
}

type UnitType = 'unit' | 'model' | 'upgrade' | 'all'

function flattenEntries(catalogues: BSCatalogue[]): Array<{ entry: BSSelectionEntry; catalogueId: string; catalogueName: string }> {
  const result: Array<{ entry: BSSelectionEntry; catalogueId: string; catalogueName: string }> = []
  for (const cat of catalogues) {
    // Top-level selection entries that are units
    for (const e of cat.selectionEntries ?? []) {
      if (!e.hidden) {
        result.push({ entry: e, catalogueId: cat.id, catalogueName: cat.name })
      }
    }
  }
  return result
}

export function UnitPicker({ catalogues, loading, onAddUnit, className }: UnitPickerProps) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<UnitType>('all')
  const [selectedCatalogue, setSelectedCatalogue] = useState<string>('all')

  const allEntries = useMemo(() => flattenEntries(catalogues), [catalogues])

  // Unique catalogues for filter
  const catalogueOptions = useMemo(() => {
    const seen = new Set<string>()
    const opts: Array<{ id: string; name: string }> = []
    for (const { catalogueId, catalogueName } of allEntries) {
      if (!seen.has(catalogueId)) {
        seen.add(catalogueId)
        opts.push({ id: catalogueId, name: catalogueName })
      }
    }
    return sortBy(opts, (o) => o.name)
  }, [allEntries])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allEntries.filter(({ entry, catalogueId }) => {
      if (selectedCatalogue !== 'all' && catalogueId !== selectedCatalogue) return false
      if (typeFilter !== 'all' && entry.type !== typeFilter) return false
      if (q && !entry.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [allEntries, search, typeFilter, selectedCatalogue])

  const grouped = useMemo(() => {
    const byFaction = groupBy(filtered, (e) => e.catalogueName)
    return Object.entries(byFaction).sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

  if (loading) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16 gap-4', className)}>
        <Spinner size="lg" />
        <p className="text-sm text-steel-400 font-mono">Loading catalogues...</p>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Search & Filters */}
      <div className="shrink-0 p-3 border-b border-steel-800 space-y-2">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-steel-500 pointer-events-none" />
          <input
            type="search"
            placeholder="Search units..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              'w-full pl-8 pr-3 h-8 text-sm bg-void-900 border border-steel-700 rounded-[3px]',
              'text-steel-100 placeholder:text-steel-600',
              'focus:outline-none focus:border-gold-600 focus:ring-1 focus:ring-gold-600/30',
              'transition-colors',
            )}
          />
        </div>

        <div className="flex items-center gap-2">
          <FunnelIcon className="size-3.5 text-steel-500 shrink-0" />
          <div className="flex items-center gap-1 flex-wrap">
            {(['all', 'unit', 'model', 'upgrade'] as UnitType[]).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  'px-2 py-0.5 text-xs rounded-[2px] font-mono uppercase tracking-wide transition-colors',
                  typeFilter === t
                    ? 'bg-gold-500 text-void-950 font-bold'
                    : 'text-steel-500 hover:text-steel-300',
                )}
              >
                {t}
              </button>
            ))}
          </div>
          {catalogueOptions.length > 1 && (
            <select
              value={selectedCatalogue}
              onChange={(e) => setSelectedCatalogue(e.target.value)}
              className={cn(
                'ml-auto text-xs bg-void-900 border border-steel-700 rounded-[2px]',
                'text-steel-300 px-1.5 py-0.5',
                'focus:outline-none focus:border-gold-600',
              )}
            >
              <option value="all">All factions</option>
              {catalogueOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {grouped.length === 0 ? (
          <div className="text-center py-12 text-steel-500 text-sm">
            {allEntries.length === 0
              ? 'Select a game system to browse units'
              : 'No units match your search'}
          </div>
        ) : (
          grouped.map(([faction, entries]) => (
            <div key={faction}>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-display text-xs font-bold tracking-widest uppercase text-steel-500">
                  {faction}
                </h3>
                <span className="text-xs text-steel-700 font-mono">({entries.length})</span>
              </div>
              <div className="space-y-1.5">
                {entries.map(({ entry, catalogueId }) => (
                  <UnitCard
                    key={`${catalogueId}-${entry.id}`}
                    entry={entry}
                    onAdd={() => onAddUnit(entry, catalogueId)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
