import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { useCatalogueStore } from '@/stores/catalogueStore'
import { useRosterStore } from '@/stores/rosterStore'
import { FactionSelector } from '@/components/army/FactionSelector'
import { UnitPicker } from '@/components/army/UnitPicker'
import { RosterPanel } from '@/components/army/RosterPanel'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { KnownRepo } from '@/lib/bsdata'
import type { BSSelectionEntry } from '@/lib/bsdata/types'

type BuilderStep = 'select-system' | 'building'

interface NewRosterForm {
  name: string
  pointsLimit: number
}

export function BuilderPage() {
  const [step, setStep] = useState<BuilderStep>('select-system')
  const [newRosterOpen, setNewRosterOpen] = useState(false)
  const [newRosterForm, setNewRosterForm] = useState<NewRosterForm>({ name: 'My Army', pointsLimit: 2000 })

  const { activeRepo, catalogues, gameSystem, loading, progress, error, loadRepo, resolver } = useCatalogueStore()
  const {
    rosters,
    activeRosterId,
    activeRoster,
    newRoster,
    setActiveRoster,
    addForceToActive,
    addUnit,
    addUnitWithForce,
    removeUnit,
    renameActiveRoster,
    setActivePointsLimit,
  } = useRosterStore()

  const roster = activeRoster()

  const handleSelectRepo = useCallback(async (repo: KnownRepo) => {
    await loadRepo(repo.id)
    setStep('building')
  }, [loadRepo])

  const handleCreateRoster = useCallback(() => {
    if (!gameSystem) return
    const id = newRoster({
      name: newRosterForm.name,
      gameSystemId: gameSystem.id,
      gameSystemRevision: gameSystem.revision,
      pointsLimit: newRosterForm.pointsLimit,
    })
    const forceEntry = gameSystem.forceEntries?.[0]
    const cat = catalogues.find((c) => !c.library) ?? catalogues[0]
    if (forceEntry && cat) {
      addForceToActive({
        name: forceEntry.name,
        entryId: forceEntry.id,
        catalogueId: cat.id,
        catalogueName: cat.name,
        catalogueRevision: cat.revision,
      })
    }
    setNewRosterOpen(false)
    setActiveRoster(id)
  }, [gameSystem, newRosterForm, catalogues, newRoster, addForceToActive, setActiveRoster])

  const handleAddUnit = useCallback((entry: BSSelectionEntry, catalogueId: string) => {
    const cat = catalogues.find((c) => c.id === catalogueId)
    const forceEntry = gameSystem?.forceEntries?.[0]

    if (!roster) {
      if (!gameSystem) return
      const id = newRoster({
        name: 'My Army',
        gameSystemId: gameSystem.id,
        gameSystemRevision: gameSystem.revision,
        pointsLimit: 2000,
      })
      setActiveRoster(id)
      if (forceEntry && cat) {
        addUnitWithForce(
          { name: forceEntry.name, entryId: forceEntry.id, catalogueId: cat.id, catalogueName: cat.name, catalogueRevision: cat.revision },
          entry,
        )
      }
      return
    }

    if (roster.forces.length === 0) {
      if (forceEntry && cat) {
        addUnitWithForce(
          { name: forceEntry.name, entryId: forceEntry.id, catalogueId: cat.id, catalogueName: cat.name, catalogueRevision: cat.revision },
          entry,
        )
      }
      return
    }

    addUnit(roster.forces[0].id, entry)
  }, [roster, gameSystem, catalogues, newRoster, addUnit, addUnitWithForce])

  const handleRemoveUnit = useCallback((forceId: string, selectionId: string) => {
    removeUnit(forceId, selectionId)
  }, [removeUnit])

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
        <Spinner size="lg" />
        <div className="text-center">
          {progress?.stage === 'listing' && <p className="text-neutral-500 text-sm">Fetching catalogue index...</p>}
          {progress?.stage === 'gameSystem' && <p className="text-neutral-500 text-sm">Loading game system...</p>}
          {progress?.stage === 'catalogues' && (
            <>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                Loading catalogues ({progress.loaded}/{progress.total})
              </p>
              {progress.currentFile && (
                <p className="text-neutral-400 text-xs mt-1 truncate max-w-xs">{progress.currentFile}</p>
              )}
              <div className="mt-4 w-56 h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-red-600 rounded-full"
                  animate={{ width: `${(progress.loaded / Math.max(progress.total, 1)) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8">
        <div className="size-14 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <ExclamationTriangleIcon className="size-7 text-red-600" />
        </div>
        <div className="text-center">
          <p className="text-neutral-800 dark:text-neutral-200 font-semibold">Failed to load game data</p>
          <p className="text-neutral-500 text-sm mt-1 max-w-sm">{error}</p>
        </div>
        <Button variant="secondary" onClick={() => setStep('select-system')}>Try Again</Button>
      </div>
    )
  }

  // ── System selection ────────────────────────────────────────────────────────
  if (step === 'select-system') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl font-extrabold uppercase tracking-wide text-neutral-900 dark:text-neutral-100 mb-2">
              Select Game System
            </h1>
            <p className="text-neutral-500 text-sm">
              Data loads directly from the community BSData repository
            </p>
          </div>
          <FactionSelector onSelect={handleSelectRepo} loading={loading} activeId={activeRepo?.id} />
        </div>
      </div>
    )
  }

  // ── Builder ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="shrink-0 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2 flex items-center gap-3">
        <button
          onClick={() => setStep('select-system')}
          className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors font-medium cursor-pointer"
        >
          <ArrowLeftIcon className="size-3.5" />
          {activeRepo?.name}
        </button>

        <div className="flex-1" />

        {rosters.length > 0 && (
          <div className="relative">
            <select
              value={activeRosterId ?? ''}
              onChange={(e) => setActiveRoster(e.target.value || null)}
              className={cn(
                'appearance-none text-xs rounded-lg border pl-3 pr-7 py-1.5',
                'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700',
                'text-neutral-700 dark:text-neutral-300',
                'focus:outline-none focus:border-red-400',
              )}
            >
              {!activeRosterId && <option value="">— Select roster —</option>}
              {rosters.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 size-3 text-neutral-400 pointer-events-none" />
          </div>
        )}

        <Button
          variant="primary"
          size="sm"
          onClick={() => setNewRosterOpen(true)}
          icon={<PlusIcon />}
          disabled={!gameSystem}
        >
          New Roster
        </Button>
      </div>

      {/* Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Unit Picker */}
        <div className="w-[320px] lg:w-[380px] shrink-0 border-r border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col bg-neutral-50 dark:bg-neutral-950">
          <div className="shrink-0 px-3 pt-3 pb-0">
            <p className="font-display text-[11px] font-bold tracking-widest uppercase text-neutral-400 mb-1">
              Unit Browser
            </p>
          </div>
          <UnitPicker
            catalogues={catalogues}
            resolver={resolver}
            onAddUnit={handleAddUnit}
            className="flex-1 overflow-hidden"
          />
        </div>

        {/* Roster panel */}
        <div className="flex-1 overflow-hidden flex flex-col min-w-0 bg-white dark:bg-neutral-950">
          {roster ? (
            <RosterPanel
              roster={roster}
              onRemoveUnit={handleRemoveUnit}
              onRename={renameActiveRoster}
              onSetLimit={setActivePointsLimit}
              className="flex-1"
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center p-8">
              <div className="size-16 rounded-full border-2 border-dashed border-neutral-200 dark:border-neutral-700 flex items-center justify-center">
                <PlusIcon className="size-7 text-neutral-300 dark:text-neutral-600" />
              </div>
              <div>
                <p className="text-neutral-700 dark:text-neutral-300 font-semibold mb-1">No roster open</p>
                <p className="text-neutral-400 text-sm">Use the button above to create a roster, or click + on any unit to start</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New roster modal */}
      <Modal
        open={newRosterOpen}
        onClose={() => setNewRosterOpen(false)}
        title="New Roster"
        description={`${activeRepo?.name ?? 'Game system'} · ${gameSystem?.name ?? ''}`}
        size="sm"
      >
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-1.5">
              Roster Name
            </label>
            <input
              autoFocus
              type="text"
              value={newRosterForm.name}
              onChange={(e) => setNewRosterForm((f) => ({ ...f, name: e.target.value }))}
              className={cn(
                'w-full rounded-lg border px-3 py-2 text-sm',
                'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700',
                'text-neutral-900 dark:text-neutral-100',
                'focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20',
              )}
              placeholder="My Army"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-1.5">
              Points Limit
            </label>
            <div className="flex gap-2 flex-wrap">
              {[1000, 1500, 2000, 2500].map((pts) => (
                <button
                  key={pts}
                  onClick={() => setNewRosterForm((f) => ({ ...f, pointsLimit: pts }))}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-mono border transition-colors cursor-pointer',
                    newRosterForm.pointsLimit === pts
                      ? 'bg-red-600 text-white border-red-600 font-bold'
                      : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300',
                  )}
                >
                  {pts}
                </button>
              ))}
              <input
                type="number"
                value={newRosterForm.pointsLimit}
                onChange={(e) => setNewRosterForm((f) => ({ ...f, pointsLimit: parseInt(e.target.value) || 2000 }))}
                className="w-20 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1.5 text-sm font-mono text-neutral-700 dark:text-neutral-300 text-right focus:outline-none focus:border-red-400"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setNewRosterOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateRoster} disabled={!newRosterForm.name.trim()}>
              Create Roster
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
