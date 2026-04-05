// ─── BSData XML Types ─────────────────────────────────────────────────────────
// These mirror the BattleScribe/BSData .cat / .gst XML schema.

export interface BSPublication {
  id: string
  name: string
  shortName?: string
  publisherName?: string
  publisherUrl?: string
}

export interface BSCostType {
  id: string
  name: string
  defaultCostLimit: number
}

export interface BSProfileType {
  id: string
  name: string
  characteristicTypes: BSCharacteristicType[]
}

export interface BSCharacteristicType {
  id: string
  name: string
}

export interface BSCharacteristic {
  typeId: string
  name: string
  value: string
}

export interface BSProfile {
  id: string
  name: string
  hidden: boolean
  typeId: string
  typeName: string
  characteristics: BSCharacteristic[]
}

export interface BSRule {
  id: string
  name: string
  hidden: boolean
  description: string
}

export interface BSCost {
  typeId: string
  name: string
  value: number
}

export interface BSConstraint {
  id: string
  field: string
  scope: string
  value: number
  percentValue: boolean
  shared: boolean
  includeChildSelections: boolean
  includeChildForces: boolean
  type: 'min' | 'max'
  childId?: string
}

export interface BSCondition {
  field: string
  scope: string
  value: number
  percentValue: boolean
  shared: boolean
  includeChildSelections: boolean
  includeChildForces: boolean
  type: 'equalTo' | 'notEqualTo' | 'greaterThan' | 'lessThan' | 'greaterThanEqualTo' | 'lessThanEqualTo' | 'instanceOf' | 'notInstanceOf'
  childId: string
}

export interface BSConditionGroup {
  type: 'and' | 'or'
  conditions?: BSCondition[]
  conditionGroups?: BSConditionGroup[]
}

export interface BSModifier {
  type: 'set' | 'increment' | 'decrement' | 'append' | 'add' | 'remove' | 'setPercentage'
  field: string
  value: string | number
  conditions?: BSCondition[]
  conditionGroups?: BSConditionGroup[]
  repeats?: BSRepeat[]
}

export interface BSRepeat {
  field: string
  scope: string
  value: number
  percentValue: boolean
  shared: boolean
  includeChildSelections: boolean
  includeChildForces: boolean
  childId: string
  roundUp: boolean
}

export interface BSCategoryLink {
  id: string
  targetId: string
  name: string
  primary: boolean
  hidden: boolean
  modifiers?: BSModifier[]
}

export interface BSInfoLink {
  id: string
  targetId: string
  type: 'rule' | 'profile'
  name: string
  hidden: boolean
  modifiers?: BSModifier[]
}

export interface BSEntryLink {
  id: string
  targetId: string
  type: 'selectionEntry' | 'selectionEntryGroup'
  name: string
  hidden: boolean
  collective: boolean
  import: boolean
  constraints?: BSConstraint[]
  modifiers?: BSModifier[]
  costs?: BSCost[]
  categoryLinks?: BSCategoryLink[]
  profiles?: BSProfile[]
  rules?: BSRule[]
  infoLinks?: BSInfoLink[]
  selectionEntries?: BSSelectionEntry[]
  selectionEntryGroups?: BSSelectionEntryGroup[]
  entryLinks?: BSEntryLink[]
}

export interface BSSelectionEntry {
  id: string
  name: string
  hidden: boolean
  collective: boolean
  import: boolean
  type: 'unit' | 'model' | 'upgrade' | 'mount'
  costs?: BSCost[]
  constraints?: BSConstraint[]
  modifiers?: BSModifier[]
  categoryLinks?: BSCategoryLink[]
  profiles?: BSProfile[]
  rules?: BSRule[]
  infoLinks?: BSInfoLink[]
  selectionEntries?: BSSelectionEntry[]
  selectionEntryGroups?: BSSelectionEntryGroup[]
  entryLinks?: BSEntryLink[]
}

export interface BSSelectionEntryGroup {
  id: string
  name: string
  hidden: boolean
  collective: boolean
  import: boolean
  defaultSelectionEntryId?: string
  constraints?: BSConstraint[]
  modifiers?: BSModifier[]
  categoryLinks?: BSCategoryLink[]
  profiles?: BSProfile[]
  rules?: BSRule[]
  infoLinks?: BSInfoLink[]
  selectionEntries?: BSSelectionEntry[]
  selectionEntryGroups?: BSSelectionEntryGroup[]
  entryLinks?: BSEntryLink[]
}

export interface BSCategoryEntry {
  id: string
  name: string
  hidden: boolean
}

export interface BSForceEntry {
  id: string
  name: string
  hidden: boolean
  categoryLinks?: BSCategoryLink[]
  forceEntries?: BSForceEntry[]
  selectionEntries?: BSSelectionEntry[]
  selectionEntryGroups?: BSSelectionEntryGroup[]
  entryLinks?: BSEntryLink[]
  rules?: BSRule[]
  profiles?: BSProfile[]
}

export interface BSCatalogueLink {
  id: string
  targetId: string
  type: 'catalogue'
  name: string
  importRootEntries: boolean
}

export interface BSCatalogue {
  id: string
  name: string
  revision: number
  battleScribeVersion: string
  authorName?: string
  authorContact?: string
  authorUrl?: string
  library: boolean
  gameSystemId: string
  gameSystemRevision: number

  publications?: BSPublication[]
  costTypes?: BSCostType[]
  profileTypes?: BSProfileType[]
  categoryEntries?: BSCategoryEntry[]
  forceEntries?: BSForceEntry[]
  selectionEntries?: BSSelectionEntry[]
  selectionEntryGroups?: BSSelectionEntryGroup[]
  entryLinks?: BSEntryLink[]
  sharedSelectionEntries?: BSSelectionEntry[]
  sharedSelectionEntryGroups?: BSSelectionEntryGroup[]
  sharedProfiles?: BSProfile[]
  sharedRules?: BSRule[]
  catalogueLinks?: BSCatalogueLink[]
  rules?: BSRule[]
}

export interface BSGameSystem {
  id: string
  name: string
  revision: number
  battleScribeVersion: string
  authorName?: string
  authorContact?: string
  authorUrl?: string

  publications?: BSPublication[]
  costTypes?: BSCostType[]
  profileTypes?: BSProfileType[]
  categoryEntries?: BSCategoryEntry[]
  forceEntries?: BSForceEntry[]
  selectionEntries?: BSSelectionEntry[]
  selectionEntryGroups?: BSSelectionEntryGroup[]
  sharedSelectionEntries?: BSSelectionEntry[]
  sharedSelectionEntryGroups?: BSSelectionEntryGroup[]
  sharedProfiles?: BSProfile[]
  sharedRules?: BSRule[]
  rules?: BSRule[]
}

// Resolved catalogue with inherited data
export interface ResolvedCatalogue extends BSCatalogue {
  gameSystem?: BSGameSystem
  resolvedEntries: Map<string, BSSelectionEntry | BSSelectionEntryGroup>
  resolvedProfiles: Map<string, BSProfile>
  resolvedRules: Map<string, BSRule>
}
