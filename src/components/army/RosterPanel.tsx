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
  return (s.costs ?? []).reduce((sum, c) => sum + c.value, 0) * s.number
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
    <div className="space-y-1">
      {/* Force header */}
      <div className="flex items-center justify-between px-1 pb-1">
        <div>
          <p className="font-display text-xs font-bold tracking-widest uppercase text-gold-500">
            {force.catalogueName}
          </p>
          <p className="text-xs text-steel-500">{force.name}</p>
        </div>
        <Badge variant="muted" size="sm">{force.selections.length} units</Badge>
      </div>

      {force.selections.length === 0 ? (
        <p className="text-xs text-steel-600 italic text-center py-3">No units added yet</p>
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
        'flex items-center gap-2 px-2.5 py-2 rounded-[3px]',
        'bg-void-900 border border-steel-800',
        'hover:border-steel-700 transition-colors group',
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-steel-200 truncate font-display uppercase tracking-wide">
          {selection.customName ?? selection.name}
        </p>
        {selection.selections.length > 0 && (
          <p className="text-[10px] text-steel-500 truncate">
            {selection.selections.map((s) => s.name).join(', ')}
          </p>
        )}
      </div>
      {cost > 0 && (
        <span className="text-xs font-mono font-bold text-gold-500 shrink-0">
          {formatPoints(cost)}<span className="text-steel-600 text-[10px] ml-0.5">pts</span>
        </span>
      )}
      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 p-1 text-steel-600 hover:text-blood-400 transition-all rounded"
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
      <div className="shrink-0 px-4 py-3 border-b border-steel-800 bg-void-900/50">
        {editingName ? (
          <div className="flex items-center gap-2 mb-2">
            <input
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameSave()
                if (e.key === 'Escape') setEditingName(false)
              }}
              className={cn(
                'flex-1 bg-void-800 border border-gold-600 rounded-[3px] px-2 py-1',
                'text-sm font-display font-bold uppercase tracking-wide text-steel-100',
                'focus:outline-none focus:ring-1 focus:ring-gold-500/40',
              )}
            />
            <button onClick={handleNameSave} className="p-1 text-gold-500 hover:text-gold-300">
              <CheckIcon className="size-4" />
            </button>
            <button onClick={() => setEditingName(false)} className="p-1 text-steel-500 hover:text-steel-300">
              <XMarkIcon className="size-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setEditingName(true); setNameInput(roster.name) }}
            className="flex items-center gap-1.5 group mb-2"
          >
            <h2 className="font-display text-base font-bold tracking-wide uppercase text-steel-100 group-hover:text-gold-300 transition-colors">
              {roster.name}
            </h2>
            <PencilIcon className="size-3 text-steel-600 group-hover:text-gold-500 transition-colors" />
          </button>
        )}

        <PointsTracker current={roster.points} limit={roster.pointsLimit} />

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-steel-500 font-mono">{totalUnits} units</span>
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
                  'w-20 bg-void-800 border border-gold-600 rounded-[2px] px-1.5 py-0.5',
                  'text-xs font-mono text-steel-100 text-right',
                  'focus:outline-none',
                )}
              />
              <button onClick={handleLimitSave} className="p-0.5 text-gold-500"><CheckIcon className="size-3" /></button>
              <button onClick={() => setEditingLimit(false)} className="p-0.5 text-steel-500"><XMarkIcon className="size-3" /></button>
            </div>
          ) : (
            <button
              onClick={() => { setEditingLimit(true); setLimitInput(String(roster.pointsLimit)) }}
              className="text-xs text-steel-500 hover:text-steel-300 font-mono flex items-center gap-1 group"
            >
              Limit: {formatPoints(roster.pointsLimit)}pts
              <PencilIcon className="size-2.5 text-steel-700 group-hover:text-steel-500" />
            </button>
          )}
        </div>
      </div>

      {/* Force list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <AnimatePresence>
          {roster.forces.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-steel-500 text-sm">No detachments added</p>
              <p className="text-steel-600 text-xs mt-1">Select a game system to get started</p>
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
