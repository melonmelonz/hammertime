import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrashIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { cn, formatPoints } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { PointsTracker } from './PointsTracker'
import type { Roster, RosterSelection, RosterForce } from '@/lib/roster/types'

interface RosterPanelProps {
  roster: Roster
  onRemoveUnit: (forceId: string, selectionId: string) => void
  onRename: (name: string) => void
  onSetLimit: (limit: number) => void
  className?: string
}

function selectionCost(s: RosterSelection): number {
  return (s.costs ?? []).reduce((sum, c) => sum + (c.value ?? 0), 0) * Math.max(s.number ?? 1, 1)
    + s.selections.reduce((t, child) => t + selectionCost(child), 0)
}

function ForceSection({
  force,
  onRemove,
}: {
  force: RosterForce
  onRemove: (selectionId: string) => void
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 px-1 pb-0.5">
        <div className="flex-1 min-w-0">
          <p className="font-display text-[11px] font-bold tracking-widest uppercase text-amber-600 dark:text-amber-500 truncate">
            {force.catalogueName}
          </p>
        </div>
        <Badge variant="muted" size="sm">{force.selections.length} units</Badge>
      </div>

      {force.selections.length === 0 ? (
        <p className="text-xs text-neutral-400 dark:text-neutral-600 italic text-center py-4">
          No units added yet
        </p>
      ) : (
        <div className="space-y-1">
          {force.selections.map((sel) => (
            <SelectionRow key={sel.id} selection={sel} onRemove={() => onRemove(sel.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

function SelectionRow({
  selection,
  onRemove,
}: {
  selection: RosterSelection
  onRemove: () => void
}) {
  const cost = selectionCost(selection)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className={cn(
        'flex items-center gap-2 px-2.5 py-2 rounded-lg border group',
        'bg-white dark:bg-neutral-900',
        'border-neutral-200 dark:border-neutral-800',
        'hover:border-neutral-300 dark:hover:border-neutral-700',
        'transition-colors',
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate font-display uppercase tracking-wide">
          {selection.customName ?? selection.name}
        </p>
        {selection.selections.length > 0 && (
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate mt-0.5">
            {selection.selections.map((s) => s.name).join(', ')}
          </p>
        )}
      </div>
      {cost > 0 && (
        <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 shrink-0">
          {formatPoints(cost)}<span className="text-neutral-400 text-[10px] ml-0.5">pts</span>
        </span>
      )}
      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 p-1 rounded text-neutral-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer"
        aria-label="Remove unit"
      >
        <TrashIcon className="size-3.5" />
      </button>
    </motion.div>
  )
}

export function RosterPanel({ roster, onRemoveUnit, onRename, onSetLimit, className }: RosterPanelProps) {
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(roster.name)
  const [editingLimit, setEditingLimit] = useState(false)
  const [limitInput, setLimitInput] = useState(String(roster.pointsLimit))

  const handleNameSave = () => {
    if (nameInput.trim()) onRename(nameInput.trim())
    setEditingName(false)
  }

  const handleLimitSave = () => {
    const n = parseInt(limitInput, 10)
    if (!isNaN(n) && n > 0) onSetLimit(n)
    setEditingLimit(false)
  }

  const totalUnits = roster.forces.reduce((t, f) => t + f.selections.length, 0)

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Roster header */}
      <div className="shrink-0 px-4 py-3.5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
        {editingName ? (
          <div className="flex items-center gap-2 mb-3">
            <input
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameSave()
                if (e.key === 'Escape') setEditingName(false)
              }}
              className={cn(
                'flex-1 rounded-lg border px-2.5 py-1.5',
                'bg-white dark:bg-neutral-800',
                'border-amber-400 dark:border-amber-500',
                'text-sm font-display font-bold uppercase tracking-wide',
                'text-neutral-900 dark:text-neutral-100',
                'focus:outline-none focus:ring-2 focus:ring-amber-400/30',
              )}
            />
            <button
              onClick={handleNameSave}
              className="p-1.5 rounded-md text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors cursor-pointer"
            >
              <CheckIcon className="size-4" />
            </button>
            <button
              onClick={() => setEditingName(false)}
              className="p-1.5 rounded-md text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <XMarkIcon className="size-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setEditingName(true); setNameInput(roster.name) }}
            className="flex items-center gap-1.5 group mb-3 cursor-pointer"
          >
            <h2 className="font-display text-base font-bold tracking-wide uppercase text-neutral-900 dark:text-neutral-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {roster.name}
            </h2>
            <PencilIcon className="size-3.5 text-neutral-400 group-hover:text-amber-500 transition-colors" />
          </button>
        )}

        <PointsTracker current={roster.points} limit={roster.pointsLimit} />

        <div className="flex items-center justify-between mt-2.5">
          <span className="text-xs text-neutral-400 dark:text-neutral-500 font-mono tabular-nums">
            {totalUnits} unit{totalUnits !== 1 ? 's' : ''}
          </span>
          {editingLimit ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                type="number"
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleLimitSave()
                  if (e.key === 'Escape') setEditingLimit(false)
                }}
                className={cn(
                  'w-20 rounded-md border px-1.5 py-0.5',
                  'bg-white dark:bg-neutral-800',
                  'border-amber-400 dark:border-amber-500',
                  'text-xs font-mono text-right',
                  'text-neutral-900 dark:text-neutral-100',
                  'focus:outline-none',
                )}
              />
              <button onClick={handleLimitSave} className="p-0.5 text-amber-600 dark:text-amber-400 cursor-pointer">
                <CheckIcon className="size-3.5" />
              </button>
              <button onClick={() => setEditingLimit(false)} className="p-0.5 text-neutral-400 cursor-pointer">
                <XMarkIcon className="size-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setEditingLimit(true); setLimitInput(String(roster.pointsLimit)) }}
              className="text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 font-mono flex items-center gap-1 group cursor-pointer transition-colors"
            >
              Limit: {formatPoints(roster.pointsLimit)} pts
              <PencilIcon className="size-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>
      </div>

      {/* Force list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        <AnimatePresence>
          {roster.forces.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-500 text-sm">No detachments added</p>
              <p className="text-neutral-400 dark:text-neutral-600 text-xs mt-1">Select a game system to get started</p>
            </div>
          ) : (
            roster.forces.map((force) => (
              <motion.div key={force.id} layout>
                <ForceSection
                  force={force}
                  onRemove={(selectionId) => onRemoveUnit(force.id, selectionId)}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
