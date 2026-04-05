import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
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
  const [newRosterForm, setNewRosterForm] = useState<NewRosterForm>({
    name: 'My Army',
    pointsLimit: 2000,
  })

  const { activeRepo, catalogues, gameSystem, loading, progress, error, loadRepo } = useCatalogueStore()
  const {
    rosters,
    activeRosterId,
    activeRoster,
    newRoster,
    setActiveRoster,
    addForceToActive,
    addUnit,
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
    // Auto-add a default force if forceEntries exist
    if (gameSystem.forceEntries?.[0] && activeRepo) {
      const forceEntry = gameSystem.forceEntries[0]
      // Find the catalogue matching active repo
      const cat = catalogues[0]
      if (cat) {
        addForceToActive({
          name: forceEntry.name,
          entryId: forceEntry.id,
          catalogueId: cat.id,
          catalogueName: cat.name,
          catalogueRevision: cat.revision,
        })
      }
    }
    setNewRosterOpen(false)
    setActiveRoster(id)
  }, [gameSystem, newRosterForm, activeRepo, catalogues, newRoster, addForceToActive, setActiveRoster])

  const handleAddUnit = useCallback((entry: BSSelectionEntry, catalogueId: string) => {
    if (!roster) {
      // Auto-create roster if none exists
      if (!gameSystem) return
      const id = newRoster({
        name: 'My Army',
        gameSystemId: gameSystem.id,
        gameSystemRevision: gameSystem.revision,
        pointsLimit: 2000,
      })
      const cat = catalogues.find((c) => c.id === catalogueId)
      if (cat && gameSystem.forceEntries?.[0]) {
        addForceToActive({
          name: gameSystem.forceEntries[0].name,
          entryId: gameSystem.forceEntries[0].id,
          catalogueId: cat.id,
          catalogueName: cat.name,
          catalogueRevision: cat.revision,
        })
      }
      setActiveRoster(id)
      // Need to add unit after state settles — defer slightly
      setTimeout(() => addUnit(id, entry), 50)
      return
    }

    if (roster.forces.length === 0) {
      const cat = catalogues.find((c) => c.id === catalogueId)
      if (cat && gameSystem?.forceEntries?.[0]) {
        addForceToActive({
          name: gameSystem.forceEntries[0].name,
          entryId: gameSystem.forceEntries[0].id,
          catalogueId: cat.id,
          catalogueName: cat.name,
          catalogueRevision: cat.revision,
        })
      }
    }

    const forceId = roster.forces[0]?.id
    if (forceId) addUnit(forceId, entry)
  }, [roster, gameSystem, catalogues, newRoster, addForceToActive, addUnit, setActiveRoster])

  const handleRemoveUnit = useCallback((forceId: string, selectionId: string) => {
    removeUnit(forceId, selectionId)
  }, [removeUnit])

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
        <Spinner size="lg" />
        <div className="text-center">
          {progress?.stage === 'listing' && (
            <p className="text-steel-300 font-mono text-sm">Fetching catalogue index...</p>
          )}
          {progress?.stage === 'gameSystem' && (
            <p className="text-steel-300 font-mono text-sm">Loading game system...</p>
          )}
          {progress?.stage === 'catalogues' && (
            <>
              <p className="text-steel-300 font-mono text-sm">
                Loading catalogues ({progress.loaded}/{progress.total})
              </p>
              {progress.currentFile && (
                <p className="text-steel-500 font-mono text-xs mt-1 truncate max-w-xs">
                  {progress.currentFile}
                </p>
              )}
              <div className="mt-3 w-48 h-1 bg-void-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gold-500 rounded-full"
                  animate={{ width: `${(progress.loaded / Math.max(progress.total, 1)) * 100}%` }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
        <ExclamationTriangleIcon className="size-10 text-blood-500" />
        <div className="text-center">
          <p className="text-steel-200 font-semibold">Failed to load game data</p>
          <p className="text-steel-500 text-sm mt-1 max-w-sm">{error}</p>
        </div>
        <Button variant="secondary" onClick={() => setStep('select-system')}>
          Try Again
        </Button>
      </div>
    )
  }

  // ── System selection ────────────────────────────────────────────────────────
  if (step === 'select-system') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl font-extrabold uppercase tracking-wide text-steel-100 mb-2">
              Select Game System
            </h1>
            <p className="text-steel-400 text-sm">
              Data loads directly from the community BSData repository
            </p>
          </div>
          <FactionSelector
            onSelect={handleSelectRepo}
            loading={loading}
            activeId={activeRepo?.id}
          />
        </div>
      </div>
    )
  }

  // ── Builder ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Builder toolbar */}
      <div className="shrink-0 border-b border-steel-800 bg-void-900/60 px-4 py-2 flex items-center gap-3">
        <button
          onClick={() => setStep('select-system')}
          className="flex items-center gap-1 text-xs text-steel-500 hover:text-steel-300 transition-colors"
        >
          <ArrowLeftIcon className="size-3" />
          {activeRepo?.name}
        </button>

        <div className="flex-1" />

        {/* Roster switcher */}
        {rosters.length > 0 && (
          <select
            value={activeRosterId ?? ''}
            onChange={(e) => setActiveRoster(e.target.value || null)}
            className={cn(
              'text-xs bg-void-800 border border-steel-700 rounded-[2px]',
              'text-steel-300 px-2 py-1',
              'focus:outline-none focus:border-gold-600',
            )}
          >
            {!activeRosterId && <option value="">— Select roster —</option>}
            {rosters.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
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

      {/* Three-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Unit Picker */}
        <div className="w-[340px] lg:w-[380px] shrink-0 border-r border-steel-800 overflow-hidden flex flex-col">
          <div className="shrink-0 px-3 pt-3 pb-0">
            <h2 className="font-display text-xs font-bold tracking-widest uppercase text-steel-500 mb-2">
              Units
            </h2>
          </div>
          <UnitPicker
            catalogues={catalogues}
            onAddUnit={handleAddUnit}
            className="flex-1 overflow-hidden"
          />
        </div>

        {/* Roster panel */}
        <div className="flex-1 overflow-hidden flex flex-col min-w-0">
          {roster ? (
            <RosterPanel
              roster={roster}
              onRemoveUnit={handleRemoveUnit}
              onRename={renameActiveRoster}
              onSetLimit={setActivePointsLimit}
              className="flex-1"
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
              <div className="size-16 rounded-full border-2 border-dashed border-steel-700 flex items-center justify-center">
                <PlusIcon className="size-7 text-steel-600" />
              </div>
              <div>
                <p className="text-steel-400 font-semibold mb-1">No roster open</p>
                <p className="text-steel-600 text-sm">Create a new roster to start adding units</p>
              </div>
              <Button
                variant="primary"
                onClick={() => setNewRosterOpen(true)}
                disabled={!gameSystem}
                icon={<PlusIcon />}
              >
                New Roster
              </Button>
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
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-steel-400 mb-1.5">
              Roster Name
            </label>
            <input
              autoFocus
              type="text"
              value={newRosterForm.name}
              onChange={(e) => setNewRosterForm((f) => ({ ...f, name: e.target.value }))}
              className={cn(
                'w-full bg-void-900 border border-steel-700 rounded-[3px] px-3 py-2',
                'text-sm text-steel-100',
                'focus:outline-none focus:border-gold-600 focus:ring-1 focus:ring-gold-600/30',
              )}
              placeholder="My Army"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-steel-400 mb-1.5">
              Points Limit
            </label>
            <div className="flex gap-2 flex-wrap">
              {[1000, 1500, 2000, 2500].map((pts) => (
                <button
                  key={pts}
                  onClick={() => setNewRosterForm((f) => ({ ...f, pointsLimit: pts }))}
                  className={cn(
                    'px-3 py-1.5 rounded-[3px] text-sm font-mono border transition-colors',
                    newRosterForm.pointsLimit === pts
                      ? 'bg-gold-500 text-void-950 border-gold-400 font-bold'
                      : 'bg-void-900 text-steel-400 border-steel-700 hover:border-steel-500',
                  )}
                >
                  {pts}
                </button>
              ))}
              <input
                type="number"
                value={newRosterForm.pointsLimit}
                onChange={(e) => setNewRosterForm((f) => ({ ...f, pointsLimit: parseInt(e.target.value) || 2000 }))}
                className={cn(
                  'w-20 bg-void-900 border border-steel-700 rounded-[3px] px-2 py-1.5',
                  'text-sm font-mono text-steel-300 text-right',
                  'focus:outline-none focus:border-gold-600',
                )}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setNewRosterOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleCreateRoster}
              disabled={!newRosterForm.name.trim()}
            >
              Create Roster
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
