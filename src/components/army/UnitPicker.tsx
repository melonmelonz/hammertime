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
    for (const e of cat.selectionEntries ?? []) {
      if (!e.hidden) {
        result.push({ entry: e, catalogueId: cat.id, catalogueName: cat.name })
      }
    }
  }
  return result
}

const TYPE_TABS: { value: UnitType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unit', label: 'Units' },
  { value: 'model', label: 'Models' },
  { value: 'upgrade', label: 'Upgrades' },
]

export function UnitPicker({ catalogues, loading, onAddUnit, className }: UnitPickerProps) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<UnitType>('all')
  const [selectedCatalogue, setSelectedCatalogue] = useState<string>('all')

  const allEntries = useMemo(() => flattenEntries(catalogues), [catalogues])

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
      <div className={cn('flex flex-col items-center justify-center py-16 gap-3', className)}>
        <Spinner size="lg" />
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading catalogues...</p>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Search & Filters */}
      <div className="shrink-0 px-3 pt-3 pb-2 space-y-2 border-b border-neutral-100 dark:border-neutral-800">
        {/* Search input */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search units..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              'w-full pl-8 pr-3 h-9 text-sm rounded-lg border',
              'bg-white dark:bg-neutral-900',
              'border-neutral-200 dark:border-neutral-700',
              'text-neutral-900 dark:text-neutral-100',
              'placeholder:text-neutral-400 dark:placeholder:text-neutral-600',
              'focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20',
              'transition-colors',
            )}
          />
        </div>

        {/* Type filter tabs */}
        <div className="flex items-center gap-1">
          <FunnelIcon className="size-3.5 text-neutral-400 shrink-0 mr-0.5" />
          {TYPE_TABS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTypeFilter(value)}
              className={cn(
                'px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer',
                typeFilter === value
                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800',
              )}
            >
              {label}
            </button>
          ))}

          {catalogueOptions.length > 1 && (
            <select
              value={selectedCatalogue}
              onChange={(e) => setSelectedCatalogue(e.target.value)}
              className={cn(
                'ml-auto text-xs rounded-md border px-1.5 py-1',
                'bg-white dark:bg-neutral-900',
                'border-neutral-200 dark:border-neutral-700',
                'text-neutral-600 dark:text-neutral-300',
                'focus:outline-none focus:border-amber-400 dark:focus:border-amber-500',
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
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        {grouped.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
              {allEntries.length === 0
                ? 'Select a game system to browse units'
                : 'No units match your search'}
            </p>
          </div>
        ) : (
          grouped.map(([faction, entries]) => (
            <div key={faction}>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-display text-[11px] font-bold tracking-widest uppercase text-neutral-500 dark:text-neutral-400">
                  {faction}
                </h3>
                <div className="flex-1 h-px bg-neutral-100 dark:bg-neutral-800" />
                <span className="text-[11px] text-neutral-400 dark:text-neutral-600 font-mono tabular-nums">
                  {entries.length}
                </span>
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
