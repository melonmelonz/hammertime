import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon, PlusIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { BSSelectionEntry } from '@/lib/bsdata/types'

interface UnitCardProps {
  entry: BSSelectionEntry
  onAdd?: (entry: BSSelectionEntry) => void
  className?: string
}

function getCost(entry: BSSelectionEntry): number {
  return (entry.costs ?? []).reduce((sum, c) => sum + (c.value ?? 0), 0)
}

const TYPE_VARIANT: Record<string, 'amber' | 'default' | 'muted' | 'red' | 'blue'> = {
  unit:    'amber',
  model:   'blue',
  upgrade: 'default',
  mount:   'red',
}

export function UnitCard({ entry, onAdd, className }: UnitCardProps) {
  const [expanded, setExpanded] = useState(false)
  const cost = getCost(entry)
  const type = entry.type ?? 'upgrade'
  const profiles = entry.profiles ?? []
  const rules = entry.rules ?? []
  const hasDetails = profiles.length > 0 || rules.length > 0
  const primaryProfile = profiles[0]
  const chars = primaryProfile?.characteristics ?? []

  return (
    <div className={cn(
      'group rounded-lg border transition-all duration-150',
      'bg-white dark:bg-neutral-900',
      'border-neutral-200 dark:border-neutral-800',
      'hover:border-neutral-300 dark:hover:border-neutral-700',
      'hover:shadow-sm',
      className,
    )}>
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        {/* Name + stats */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="font-display font-bold text-sm tracking-wide uppercase text-neutral-900 dark:text-neutral-100 leading-none">
              {entry.name}
            </span>
            <Badge variant={TYPE_VARIANT[type] ?? 'default'} size="sm">{type}</Badge>
          </div>

          {/* Compact stat row */}
          {chars.length > 0 && (
            <div className="flex items-center gap-3 mt-1">
              {chars.slice(0, 6).map((c) => (
                <div key={c.typeId} className="flex flex-col items-center">
                  <span className="text-[9px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-mono leading-none">{c.name}</span>
                  <span className="text-[11px] font-bold font-mono text-neutral-700 dark:text-neutral-300 leading-tight">{c.value || '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {cost > 0 && (
            <span className="font-mono text-sm font-bold text-amber-700 dark:text-amber-400 whitespace-nowrap">
              {cost}<span className="text-neutral-400 text-xs ml-0.5">pts</span>
            </span>
          )}
          {hasDetails && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label={expanded ? 'Collapse' : 'Details'}
            >
              <ChevronDownIcon className={cn('size-3.5 transition-transform duration-200', expanded && 'rotate-180')} />
            </button>
          )}
          {onAdd && (
            <Button
              variant="primary"
              size="xs"
              onClick={() => onAdd(entry)}
              icon={<PlusIcon />}
              aria-label={`Add ${entry.name}`}
            />
          )}
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && hasDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="border-t border-neutral-100 dark:border-neutral-800 px-3 py-2.5 space-y-2">
              {/* Additional profiles (weapons, abilities) */}
              {profiles.slice(1).map((p) => (
                <div key={p.id} className="bg-neutral-50 dark:bg-neutral-800/60 rounded-md px-2.5 py-2">
                  <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    {p.name}
                    <span className="ml-1.5 font-normal text-neutral-400 dark:text-neutral-500">{p.typeName}</span>
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                    {p.characteristics.map((c) => (
                      <div key={c.typeId} className="flex items-center gap-1">
                        <span className="text-[9px] uppercase text-neutral-400 font-mono">{c.name}:</span>
                        <span className="text-[10px] font-mono font-semibold text-neutral-700 dark:text-neutral-300">{c.value || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Rules */}
              {rules.slice(0, 3).map((r) => (
                <p key={r.id} className="text-xs text-neutral-600 dark:text-neutral-400">
                  <span className="font-semibold italic text-neutral-700 dark:text-neutral-300">{r.name}: </span>
                  <span className="line-clamp-2">{r.description}</span>
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
