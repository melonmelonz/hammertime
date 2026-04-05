import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon, InformationCircleIcon, PlusIcon } from '@heroicons/react/24/outline'
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

function getType(entry: BSSelectionEntry): string {
  return entry.type ?? 'upgrade'
}

const TYPE_COLORS: Record<string, string> = {
  unit: 'gold',
  model: 'default',
  upgrade: 'muted',
  mount: 'blood',
}

export function UnitCard({ entry, onAdd, className }: UnitCardProps) {
  const [expanded, setExpanded] = useState(false)
  const cost = getCost(entry)
  const type = getType(entry)
  const profiles = entry.profiles ?? []
  const rules = entry.rules ?? []
  const hasDetails = profiles.length > 0 || rules.length > 0

  const primaryProfile = profiles[0]
  const characteristics = primaryProfile?.characteristics ?? []

  return (
    <div
      className={cn(
        'bg-void-800 border border-steel-700 rounded-[4px] overflow-hidden',
        'hover:border-steel-500 transition-colors',
        className,
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display text-sm font-semibold tracking-wide text-steel-100 uppercase truncate">
              {entry.name}
            </span>
            <Badge variant={TYPE_COLORS[type] as 'gold' | 'default' | 'muted' | 'blood'} size="sm">
              {type}
            </Badge>
          </div>

          {/* Stat bar for units */}
          {characteristics.length > 0 && (
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {characteristics.slice(0, 6).map((c) => (
                <div key={c.typeId} className="flex flex-col items-center min-w-[28px]">
                  <span className="text-[9px] text-steel-500 uppercase tracking-wider font-mono">{c.name}</span>
                  <span className="text-xs font-mono font-bold text-steel-200">{c.value || '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {cost > 0 && (
            <span className="font-mono text-sm font-bold text-gold-400">{cost}<span className="text-steel-500 text-xs ml-0.5">pts</span></span>
          )}
          {hasDetails && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="p-1 text-steel-500 hover:text-steel-300 transition-colors"
              aria-label={expanded ? 'Collapse' : 'Expand details'}
            >
              <ChevronDownIcon
                className={cn('size-3.5 transition-transform duration-200', expanded && 'rotate-180')}
              />
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
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-steel-800 px-3 py-2.5 space-y-2">
              {/* Weapon / stat profiles */}
              {profiles.length > 1 && (
                <div className="space-y-1">
                  {profiles.slice(1).map((p) => (
                    <div key={p.id} className="bg-void-900 rounded-[2px] px-2 py-1.5">
                      <div className="flex items-center gap-2 mb-1">
                        <InformationCircleIcon className="size-3 text-steel-500 shrink-0" />
                        <span className="text-xs font-semibold text-steel-300 uppercase tracking-wide">{p.name}</span>
                        <span className="text-xs text-steel-500">{p.typeName}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                        {p.characteristics.map((c) => (
                          <div key={c.typeId} className="flex items-center gap-1">
                            <span className="text-[9px] text-steel-500 uppercase font-mono">{c.name}:</span>
                            <span className="text-[10px] font-mono text-steel-300">{c.value || '—'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Rules */}
              {rules.slice(0, 3).map((r) => (
                <div key={r.id} className="text-xs">
                  <span className="font-semibold text-steel-300 italic">{r.name}: </span>
                  <span className="text-steel-500 line-clamp-2">{r.description}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
