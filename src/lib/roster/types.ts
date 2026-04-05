import type { BSCost } from '../bsdata/types'

export interface RosterCost {
  typeId: string
  name: string
  value: number
}

export interface RosterSelection {
  id: string           // Unique instance ID (generated)
  entryId: string      // BSData selectionEntry ID
  entryGroupId?: string
  name: string
  number: number       // How many of this selection
  type: 'unit' | 'model' | 'upgrade' | 'mount'
  costs: BSCost[]
  categoryIds: string[]
  selections: RosterSelection[]  // Child selections (upgrades, weapons, etc.)
  customName?: string
}

export interface RosterForce {
  id: string
  name: string
  entryId: string
  catalogueId: string
  catalogueName: string
  catalogueRevision: number
  selections: RosterSelection[]
}

export interface Roster {
  id: string
  name: string
  gameSystemId: string
  gameSystemRevision: number
  points: number
  pointsLimit: number
  forces: RosterForce[]
  createdAt: string
  updatedAt: string
}

export interface ValidationError {
  type: 'error' | 'warning'
  message: string
  entryId?: string
  selectionId?: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}
