import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  createRoster,
  addForce,
  addUnitToForce,
  removeSelection,
  renameRoster,
  setPointsLimit,
} from '@/lib/roster/builder'
import type { Roster } from '@/lib/roster/types'
import type { BSSelectionEntry } from '@/lib/bsdata/types'

interface ForceParams {
  name: string
  entryId: string
  catalogueId: string
  catalogueName: string
  catalogueRevision: number
}

interface RosterState {
  rosters: Roster[]
  activeRosterId: string | null

  activeRoster: () => Roster | null

  newRoster: (params: {
    name: string
    gameSystemId: string
    gameSystemRevision: number
    pointsLimit?: number
  }) => string
  deleteRoster: (id: string) => void
  setActiveRoster: (id: string | null) => void
  renameActiveRoster: (name: string) => void
  setActivePointsLimit: (limit: number) => void

  addForceToActive: (params: ForceParams) => string | null   // returns new force id
  addUnit: (forceId: string, entry: BSSelectionEntry) => void
  removeUnit: (forceId: string, selectionId: string) => void

  // Atomic: add a force (if needed) and immediately add a unit to it
  addUnitWithForce: (forceParams: ForceParams, entry: BSSelectionEntry) => void

  importRoster: (roster: Roster) => void
}

export const useRosterStore = create<RosterState>()(
  persist(
    (set, get) => ({
      rosters: [],
      activeRosterId: null,

      activeRoster: () => {
        const { rosters, activeRosterId } = get()
        return rosters.find((r) => r.id === activeRosterId) ?? null
      },

      newRoster: (params) => {
        const roster = createRoster(params)
        set((state) => ({
          rosters: [...state.rosters, roster],
          activeRosterId: roster.id,
        }))
        return roster.id
      },

      deleteRoster: (id) => {
        set((state) => ({
          rosters: state.rosters.filter((r) => r.id !== id),
          activeRosterId: state.activeRosterId === id ? null : state.activeRosterId,
        }))
      },

      setActiveRoster: (id) => {
        set({ activeRosterId: id })
      },

      renameActiveRoster: (name) => {
        set((state) => {
          const roster = state.rosters.find((r) => r.id === state.activeRosterId)
          if (!roster) return state
          return {
            rosters: state.rosters.map((r) =>
              r.id === state.activeRosterId ? renameRoster(r, name) : r,
            ),
          }
        })
      },

      setActivePointsLimit: (limit) => {
        set((state) => ({
          rosters: state.rosters.map((r) =>
            r.id === state.activeRosterId ? setPointsLimit(r, limit) : r,
          ),
        }))
      },

      addForceToActive: (params) => {
        let forceId: string | null = null
        set((state) => {
          const roster = state.rosters.find((r) => r.id === state.activeRosterId)
          if (!roster) return state
          const updated = addForce(roster, params)
          // The newly added force is always the last one
          forceId = updated.forces[updated.forces.length - 1]?.id ?? null
          return {
            rosters: state.rosters.map((r) => (r.id === updated.id ? updated : r)),
          }
        })
        return forceId
      },

      addUnit: (forceId, entry) => {
        set((state) => {
          const roster = state.rosters.find((r) => r.id === state.activeRosterId)
          if (!roster) return state
          const updated = addUnitToForce(roster, forceId, entry)
          return {
            rosters: state.rosters.map((r) => (r.id === updated.id ? updated : r)),
          }
        })
      },

      removeUnit: (forceId, selectionId) => {
        set((state) => {
          const roster = state.rosters.find((r) => r.id === state.activeRosterId)
          if (!roster) return state
          const updated = removeSelection(roster, forceId, selectionId)
          return {
            rosters: state.rosters.map((r) => (r.id === updated.id ? updated : r)),
          }
        })
      },

      // Atomic: ensures both the force and the unit are committed in one pass,
      // avoiding the race condition of calling addForceToActive + addUnit separately.
      addUnitWithForce: (forceParams, entry) => {
        set((state) => {
          const roster = state.rosters.find((r) => r.id === state.activeRosterId)
          if (!roster) return state
          // Add force first, then unit — all in the same state update
          const withForce = addForce(roster, forceParams)
          const newForce = withForce.forces[withForce.forces.length - 1]
          if (!newForce) return state
          const withUnit = addUnitToForce(withForce, newForce.id, entry)
          return {
            rosters: state.rosters.map((r) => (r.id === withUnit.id ? withUnit : r)),
          }
        })
      },

      importRoster: (roster) => {
        set((state) => ({
          rosters: [...state.rosters.filter((r) => r.id !== roster.id), roster],
          activeRosterId: roster.id,
        }))
      },
    }),
    {
      name: 'hammertime-rosters',
      version: 1,
    },
  ),
)
