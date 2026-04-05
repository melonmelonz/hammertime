import type { BSSelectionEntry, BSCost } from '../bsdata/types'
import type { Roster, RosterForce, RosterSelection } from './types'

let idCounter = 0
function generateId(): string {
  return `ws_${Date.now()}_${++idCounter}`
}

export function createRoster(params: {
  name: string
  gameSystemId: string
  gameSystemRevision: number
  pointsLimit?: number
}): Roster {
  return {
    id: generateId(),
    name: params.name,
    gameSystemId: params.gameSystemId,
    gameSystemRevision: params.gameSystemRevision,
    points: 0,
    pointsLimit: params.pointsLimit ?? 2000,
    forces: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function addForce(
  roster: Roster,
  params: {
    name: string
    entryId: string
    catalogueId: string
    catalogueName: string
    catalogueRevision: number
  },
): Roster {
  const force: RosterForce = {
    id: generateId(),
    name: params.name,
    entryId: params.entryId,
    catalogueId: params.catalogueId,
    catalogueName: params.catalogueName,
    catalogueRevision: params.catalogueRevision,
    selections: [],
  }
  return touchRoster({ ...roster, forces: [...roster.forces, force] })
}

export function addUnitToForce(
  roster: Roster,
  forceId: string,
  entry: BSSelectionEntry,
): Roster {
  const selection = entryToSelection(entry)
  const forces = roster.forces.map((f) => {
    if (f.id !== forceId) return f
    return { ...f, selections: [...f.selections, selection] }
  })
  return touchRoster(recalcPoints({ ...roster, forces }))
}

export function removeSelection(
  roster: Roster,
  forceId: string,
  selectionId: string,
): Roster {
  const forces = roster.forces.map((f) => {
    if (f.id !== forceId) return f
    return { ...f, selections: f.selections.filter((s) => s.id !== selectionId) }
  })
  return touchRoster(recalcPoints({ ...roster, forces }))
}

export function renameRoster(roster: Roster, name: string): Roster {
  return touchRoster({ ...roster, name })
}

export function setPointsLimit(roster: Roster, limit: number): Roster {
  return touchRoster({ ...roster, pointsLimit: limit })
}

function entryToSelection(entry: BSSelectionEntry): RosterSelection {
  const categoryIds = (entry.categoryLinks ?? []).map((c) => c.targetId)
  return {
    id: generateId(),
    entryId: entry.id,
    name: entry.name,
    number: 1,
    type: entry.type ?? 'upgrade',
    costs: (entry.costs ?? []).map((c) => ({ ...c })),
    categoryIds,
    selections: [],
  }
}

function sumCosts(costs: BSCost[]): number {
  return costs.reduce((sum, c) => sum + (c.value ?? 0), 0)
}

function selectionPoints(s: RosterSelection): number {
  return sumCosts(s.costs) * s.number + s.selections.reduce((t, child) => t + selectionPoints(child), 0)
}

function recalcPoints(roster: Roster): Roster {
  const points = roster.forces.reduce((total, force) => {
    return total + force.selections.reduce((t, s) => t + selectionPoints(s), 0)
  }, 0)
  return { ...roster, points }
}

function touchRoster(roster: Roster): Roster {
  return { ...roster, updatedAt: new Date().toISOString() }
}

// ─── Serialisation ────────────────────────────────────────────────────────────

export function serialiseRoster(roster: Roster): string {
  return JSON.stringify(roster, null, 2)
}

export function deserialiseRoster(json: string): Roster {
  return JSON.parse(json) as Roster
}
