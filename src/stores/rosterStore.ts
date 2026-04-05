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

interface RosterState {
  rosters: Roster[]
  activeRosterId: string | null

  // Getters (derived)
  activeRoster: () => Roster | null

  // Actions
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

  addForceToActive: (params: {
    name: string
    entryId: string
    catalogueId: string
    catalogueName: string
    catalogueRevision: number
  }) => void

  addUnit: (forceId: string, entry: BSSelectionEntry) => void
  removeUnit: (forceId: string, selectionId: string) => void

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
        set((state) => {
          const roster = state.rosters.find((r) => r.id === state.activeRosterId)
          if (!roster) return state
          const updated = addForce(roster, params)
          return {
            rosters: state.rosters.map((r) => (r.id === updated.id ? updated : r)),
          }
        })
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
