import { XMLParser } from 'fast-xml-parser'
import type {
  BSCatalogue,
  BSGameSystem,
  BSSelectionEntry,
  BSSelectionEntryGroup,
  BSEntryLink,
  BSProfile,
  BSRule,
  BSCost,
  BSConstraint,
  BSModifier,
  BSCategoryLink,
  BSInfoLink,
  BSForceEntry,
  BSCategoryEntry,
  BSCostType,
  BSProfileType,
  BSCharacteristicType,
  BSCharacteristic,
  BSCondition,
  BSConditionGroup,
  BSPublication,
  BSCatalogueLink,
} from './types'

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (name) => ARRAY_NODES.has(name),
  parseAttributeValue: true,
  trimValues: true,
})

// Elements that should always be treated as arrays even with a single item
const ARRAY_NODES = new Set([
  'catalogue', 'gameSystem',
  'publications', 'publication',
  'costTypes', 'costType',
  'profileTypes', 'profileType',
  'characteristicTypes', 'characteristicType',
  'categoryEntries', 'categoryEntry',
  'forceEntries', 'forceEntry',
  'selectionEntries', 'selectionEntry',
  'selectionEntryGroups', 'selectionEntryGroup',
  'entryLinks', 'entryLink',
  'sharedSelectionEntries', 'sharedSelectionEntryGroups',
  'sharedProfiles', 'sharedProfile',
  'sharedRules', 'sharedRule',
  'profiles', 'profile',
  'rules', 'rule',
  'costs', 'cost',
  'constraints', 'constraint',
  'modifiers', 'modifier',
  'conditions', 'condition',
  'conditionGroups', 'conditionGroup',
  'repeats', 'repeat',
  'categoryLinks', 'categoryLink',
  'infoLinks', 'infoLink',
  'catalogueLinks', 'catalogueLink',
  'characteristics', 'characteristic',
])

function attr(node: Record<string, unknown>, key: string, fallback = ''): string {
  const v = node[`@_${key}`]
  return v !== undefined && v !== null ? String(v) : fallback
}

function attrBool(node: Record<string, unknown>, key: string): boolean {
  const v = node[`@_${key}`]
  return v === true || v === 'true'
}

function attrNum(node: Record<string, unknown>, key: string, fallback = 0): number {
  const v = node[`@_${key}`]
  if (v === undefined || v === null || v === '') return fallback
  const n = Number(v)
  return isNaN(n) ? fallback : n
}

function arr<T>(node: Record<string, unknown>, key: string): T[] {
  const v = node[key]
  if (!v) return []
  if (Array.isArray(v)) return v as T[]
  return [v as T]
}

// ─── Parsers for nested structures ───────────────────────────────────────────

function parsePublication(n: Record<string, unknown>): BSPublication {
  return {
    id: attr(n, 'id'),
    name: attr(n, 'name'),
    shortName: attr(n, 'shortName') || undefined,
    publisherName: attr(n, 'publisherName') || undefined,
    publisherUrl: attr(n, 'publisherUrl') || undefined,
  }
}

function parseCostType(n: Record<string, unknown>): BSCostType {
  return {
    id: attr(n, 'id'),
    name: attr(n, 'name'),
    defaultCostLimit: attrNum(n, 'defaultCostLimit', -1),
  }
}

function parseProfileType(n: Record<string, unknown>): BSProfileType {
  const ctArr = arr<Record<string, unknown>>(n, 'characteristicTypes')
  const raw = ctArr[0] as Record<string, unknown> | undefined
  const ctNodes: Record<string, unknown>[] = raw
    ? arr<Record<string, unknown>>(raw, 'characteristicType')
    : []
  const characteristicTypes: BSCharacteristicType[] = ctNodes.map((c) => ({
    id: attr(c, 'id'),
    name: attr(c, 'name'),
  }))
  return {
    id: attr(n, 'id'),
    name: attr(n, 'name'),
    characteristicTypes,
  }
}

function parseCategoryEntry(n: Record<string, unknown>): BSCategoryEntry {
  return {
    id: attr(n, 'id'),
    name: attr(n, 'name'),
    hidden: attrBool(n, 'hidden'),
  }
}

function parseCharacteristic(n: Record<string, unknown>): BSCharacteristic {
  return {
    typeId: attr(n, 'typeId'),
    name: attr(n, 'name'),
    value: String(n['#text'] ?? n['@_value'] ?? ''),
  }
}

function parseProfile(n: Record<string, unknown>): BSProfile {
  const charsWrapper = arr<Record<string, unknown>>(n, 'characteristics')
  const charNodes: Record<string, unknown>[] = charsWrapper[0]
    ? arr<Record<string, unknown>>(charsWrapper[0], 'characteristic')
    : []
  return {
    id: attr(n, 'id'),
    name: attr(n, 'name'),
    hidden: attrBool(n, 'hidden'),
    typeId: attr(n, 'typeId'),
    typeName: attr(n, 'typeName'),
    characteristics: charNodes.map(parseCharacteristic),
  }
}

function parseRule(n: Record<string, unknown>): BSRule {
  return {
    id: attr(n, 'id'),
    name: attr(n, 'name'),
    hidden: attrBool(n, 'hidden'),
    description: String(n['description'] ?? ''),
  }
}

function parseCost(n: Record<string, unknown>): BSCost {
  return {
    typeId: attr(n, 'typeId'),
    name: attr(n, 'name'),
    value: attrNum(n, 'value'),
  }
}

function parseConstraint(n: Record<string, unknown>): BSConstraint {
  return {
    id: attr(n, 'id'),
    field: attr(n, 'field'),
    scope: attr(n, 'scope'),
    value: attrNum(n, 'value'),
    percentValue: attrBool(n, 'percentValue'),
    shared: attrBool(n, 'shared'),
    includeChildSelections: attrBool(n, 'includeChildSelections'),
    includeChildForces: attrBool(n, 'includeChildForces'),
    type: attr(n, 'type') as BSConstraint['type'],
    childId: attr(n, 'childId') || undefined,
  }
}

function parseCondition(n: Record<string, unknown>): BSCondition {
  return {
    field: attr(n, 'field'),
    scope: attr(n, 'scope'),
    value: attrNum(n, 'value'),
    percentValue: attrBool(n, 'percentValue'),
    shared: attrBool(n, 'shared'),
    includeChildSelections: attrBool(n, 'includeChildSelections'),
    includeChildForces: attrBool(n, 'includeChildForces'),
    type: attr(n, 'type') as BSCondition['type'],
    childId: attr(n, 'childId'),
  }
}

function parseConditionGroup(n: Record<string, unknown>): BSConditionGroup {
  return {
    type: (attr(n, 'type') || 'and') as 'and' | 'or',
    conditions: arr<Record<string, unknown>>(n, 'condition').map(parseCondition),
    conditionGroups: arr<Record<string, unknown>>(n, 'conditionGroup').map(parseConditionGroup),
  }
}

function parseModifier(n: Record<string, unknown>): BSModifier {
  return {
    type: attr(n, 'type') as BSModifier['type'],
    field: attr(n, 'field'),
    value: n['@_value'] as string | number,
    conditions: arr<Record<string, unknown>>(n, 'condition').map(parseCondition),
    conditionGroups: arr<Record<string, unknown>>(n, 'conditionGroup').map(parseConditionGroup),
  }
}

function parseCategoryLink(n: Record<string, unknown>): BSCategoryLink {
  return {
    id: attr(n, 'id'),
    targetId: attr(n, 'targetId'),
    name: attr(n, 'name'),
    primary: attrBool(n, 'primary'),
    hidden: attrBool(n, 'hidden'),
  }
}

function parseInfoLink(n: Record<string, unknown>): BSInfoLink {
  return {
    id: attr(n, 'id'),
    targetId: attr(n, 'targetId'),
    type: attr(n, 'type') as BSInfoLink['type'],
    name: attr(n, 'name'),
    hidden: attrBool(n, 'hidden'),
  }
}

function parseSelectionEntry(n: Record<string, unknown>): BSSelectionEntry {
  const modifiersWrapper = arr<Record<string, unknown>>(n, 'modifiers')
  const modifiers = modifiersWrapper[0]
    ? arr<Record<string, unknown>>(modifiersWrapper[0], 'modifier').map(parseModifier)
    : []

  const constraintsWrapper = arr<Record<string, unknown>>(n, 'constraints')
  const constraints = constraintsWrapper[0]
    ? arr<Record<string, unknown>>(constraintsWrapper[0], 'constraint').map(parseConstraint)
    : []

  const costsWrapper = arr<Record<string, unknown>>(n, 'costs')
  const costs = costsWrapper[0]
    ? arr<Record<string, unknown>>(costsWrapper[0], 'cost').map(parseCost)
    : []

  const profilesWrapper = arr<Record<string, unknown>>(n, 'profiles')
  const profiles = profilesWrapper[0]
    ? arr<Record<string, unknown>>(profilesWrapper[0], 'profile').map(parseProfile)
    : []

  const rulesWrapper = arr<Record<string, unknown>>(n, 'rules')
  const rules = rulesWrapper[0]
    ? arr<Record<string, unknown>>(rulesWrapper[0], 'rule').map(parseRule)
    : []

  const infoLinksWrapper = arr<Record<string, unknown>>(n, 'infoLinks')
  const infoLinks = infoLinksWrapper[0]
    ? arr<Record<string, unknown>>(infoLinksWrapper[0], 'infoLink').map(parseInfoLink)
    : []

  const categoryLinksWrapper = arr<Record<string, unknown>>(n, 'categoryLinks')
  const categoryLinks = categoryLinksWrapper[0]
    ? arr<Record<string, unknown>>(categoryLinksWrapper[0], 'categoryLink').map(parseCategoryLink)
    : []

  const seWrapper = arr<Record<string, unknown>>(n, 'selectionEntries')
  const selectionEntries = seWrapper[0]
    ? arr<Record<string, unknown>>(seWrapper[0], 'selectionEntry').map(parseSelectionEntry)
    : []

  const segWrapper = arr<Record<string, unknown>>(n, 'selectionEntryGroups')
  const selectionEntryGroups = segWrapper[0]
    ? arr<Record<string, unknown>>(segWrapper[0], 'selectionEntryGroup').map(parseSelectionEntryGroup)
    : []

  const elWrapper = arr<Record<string, unknown>>(n, 'entryLinks')
  const entryLinks = elWrapper[0]
    ? arr<Record<string, unknown>>(elWrapper[0], 'entryLink').map(parseEntryLink)
    : []

  return {
    id: attr(n, 'id'),
    name: attr(n, 'name'),
    hidden: attrBool(n, 'hidden'),
    collective: attrBool(n, 'collective'),
    import: attrBool(n, 'import') ?? true,
    type: (attr(n, 'type') || 'upgrade') as BSSelectionEntry['type'],
    costs,
    constraints,
    modifiers,
    categoryLinks,
    profiles,
    rules,
    infoLinks,
    selectionEntries,
    selectionEntryGroups,
    entryLinks,
  }
}

function parseSelectionEntryGroup(n: Record<string, unknown>): BSSelectionEntryGroup {
  const modifiersWrapper = arr<Record<string, unknown>>(n, 'modifiers')
  const modifiers = modifiersWrapper[0]
    ? arr<Record<string, unknown>>(modifiersWrapper[0], 'modifier').map(parseModifier)
    : []

  const constraintsWrapper = arr<Record<string, unknown>>(n, 'constraints')
  const constraints = constraintsWrapper[0]
    ? arr<Record<string, unknown>>(constraintsWrapper[0], 'constraint').map(parseConstraint)
    : []

  const profilesWrapper = arr<Record<string, unknown>>(n, 'profiles')
  const profiles = profilesWrapper[0]
    ? arr<Record<string, unknown>>(profilesWrapper[0], 'profile').map(parseProfile)
    : []

  const rulesWrapper = arr<Record<string, unknown>>(n, 'rules')
  const rules = rulesWrapper[0]
    ? arr<Record<string, unknown>>(rulesWrapper[0], 'rule').map(parseRule)
    : []

  const infoLinksWrapper = arr<Record<string, unknown>>(n, 'infoLinks')
  const infoLinks = infoLinksWrapper[0]
    ? arr<Record<string, unknown>>(infoLinksWrapper[0], 'infoLink').map(parseInfoLink)
    : []

  const categoryLinksWrapper = arr<Record<string, unknown>>(n, 'categoryLinks')
  const categoryLinks = categoryLinksWrapper[0]
    ? arr<Record<string, unknown>>(categoryLinksWrapper[0], 'categoryLink').map(parseCategoryLink)
    : []

  const seWrapper = arr<Record<string, unknown>>(n, 'selectionEntries')
  const selectionEntries = seWrapper[0]
    ? arr<Record<string, unknown>>(seWrapper[0], 'selectionEntry').map(parseSelectionEntry)
    : []

  const segWrapper = arr<Record<string, unknown>>(n, 'selectionEntryGroups')
  const selectionEntryGroups = segWrapper[0]
    ? arr<Record<string, unknown>>(segWrapper[0], 'selectionEntryGroup').map(parseSelectionEntryGroup)
    : []

  const elWrapper = arr<Record<string, unknown>>(n, 'entryLinks')
  const entryLinks = elWrapper[0]
    ? arr<Record<string, unknown>>(elWrapper[0], 'entryLink').map(parseEntryLink)
    : []

  return {
    id: attr(n, 'id'),
    name: attr(n, 'name'),
    hidden: attrBool(n, 'hidden'),
    collective: attrBool(n, 'collective'),
    import: attrBool(n, 'import') ?? true,
    defaultSelectionEntryId: attr(n, 'defaultSelectionEntryId') || undefined,
    constraints,
    modifiers,
    categoryLinks,
    profiles,
    rules,
    infoLinks,
    selectionEntries,
    selectionEntryGroups,
    entryLinks,
  }
}

function parseEntryLink(n: Record<string, unknown>): BSEntryLink {
  const costsWrapper = arr<Record<string, unknown>>(n, 'costs')
  const costs = costsWrapper[0]
    ? arr<Record<string, unknown>>(costsWrapper[0], 'cost').map(parseCost)
    : []

  const modifiersWrapper = arr<Record<string, unknown>>(n, 'modifiers')
  const modifiers = modifiersWrapper[0]
    ? arr<Record<string, unknown>>(modifiersWrapper[0], 'modifier').map(parseModifier)
    : []

  const constraintsWrapper = arr<Record<string, unknown>>(n, 'constraints')
  const constraints = constraintsWrapper[0]
    ? arr<Record<string, unknown>>(constraintsWrapper[0], 'constraint').map(parseConstraint)
    : []

  const categoryLinksWrapper = arr<Record<string, unknown>>(n, 'categoryLinks')
  const categoryLinks = categoryLinksWrapper[0]
    ? arr<Record<string, unknown>>(categoryLinksWrapper[0], 'categoryLink').map(parseCategoryLink)
    : []

  const profilesWrapper = arr<Record<string, unknown>>(n, 'profiles')
  const profiles = profilesWrapper[0]
    ? arr<Record<string, unknown>>(profilesWrapper[0], 'profile').map(parseProfile)
    : []

  const rulesWrapper = arr<Record<string, unknown>>(n, 'rules')
  const rules = rulesWrapper[0]
    ? arr<Record<string, unknown>>(rulesWrapper[0], 'rule').map(parseRule)
    : []

  const infoLinksWrapper = arr<Record<string, unknown>>(n, 'infoLinks')
  const infoLinks = infoLinksWrapper[0]
    ? arr<Record<string, unknown>>(infoLinksWrapper[0], 'infoLink').map(parseInfoLink)
    : []

  const seWrapper = arr<Record<string, unknown>>(n, 'selectionEntries')
  const selectionEntries = seWrapper[0]
    ? arr<Record<string, unknown>>(seWrapper[0], 'selectionEntry').map(parseSelectionEntry)
    : []

  const segWrapper = arr<Record<string, unknown>>(n, 'selectionEntryGroups')
  const selectionEntryGroups = segWrapper[0]
    ? arr<Record<string, unknown>>(segWrapper[0], 'selectionEntryGroup').map(parseSelectionEntryGroup)
    : []

  const elWrapper = arr<Record<string, unknown>>(n, 'entryLinks')
  const entryLinks = elWrapper[0]
    ? arr<Record<string, unknown>>(elWrapper[0], 'entryLink').map(parseEntryLink)
    : []

  return {
    id: attr(n, 'id'),
    targetId: attr(n, 'targetId'),
    type: attr(n, 'type') as BSEntryLink['type'],
    name: attr(n, 'name'),
    hidden: attrBool(n, 'hidden'),
    collective: attrBool(n, 'collective'),
    import: attrBool(n, 'import') ?? true,
    constraints,
    modifiers,
    costs,
    categoryLinks,
    profiles,
    rules,
    infoLinks,
    selectionEntries,
    selectionEntryGroups,
    entryLinks,
  }
}

function parseForceEntry(n: Record<string, unknown>): BSForceEntry {
  const categoryLinksWrapper = arr<Record<string, unknown>>(n, 'categoryLinks')
  const categoryLinks = categoryLinksWrapper[0]
    ? arr<Record<string, unknown>>(categoryLinksWrapper[0], 'categoryLink').map(parseCategoryLink)
    : []

  const forceEntriesWrapper = arr<Record<string, unknown>>(n, 'forceEntries')
  const forceEntries = forceEntriesWrapper[0]
    ? arr<Record<string, unknown>>(forceEntriesWrapper[0], 'forceEntry').map(parseForceEntry)
    : []

  const seWrapper = arr<Record<string, unknown>>(n, 'selectionEntries')
  const selectionEntries = seWrapper[0]
    ? arr<Record<string, unknown>>(seWrapper[0], 'selectionEntry').map(parseSelectionEntry)
    : []

  const segWrapper = arr<Record<string, unknown>>(n, 'selectionEntryGroups')
  const selectionEntryGroups = segWrapper[0]
    ? arr<Record<string, unknown>>(segWrapper[0], 'selectionEntryGroup').map(parseSelectionEntryGroup)
    : []

  const elWrapper = arr<Record<string, unknown>>(n, 'entryLinks')
  const entryLinks = elWrapper[0]
    ? arr<Record<string, unknown>>(elWrapper[0], 'entryLink').map(parseEntryLink)
    : []

  const rulesWrapper = arr<Record<string, unknown>>(n, 'rules')
  const rules = rulesWrapper[0]
    ? arr<Record<string, unknown>>(rulesWrapper[0], 'rule').map(parseRule)
    : []

  const profilesWrapper = arr<Record<string, unknown>>(n, 'profiles')
  const profiles = profilesWrapper[0]
    ? arr<Record<string, unknown>>(profilesWrapper[0], 'profile').map(parseProfile)
    : []

  return {
    id: attr(n, 'id'),
    name: attr(n, 'name'),
    hidden: attrBool(n, 'hidden'),
    categoryLinks,
    forceEntries,
    selectionEntries,
    selectionEntryGroups,
    entryLinks,
    rules,
    profiles,
  }
}

// ─── Main parse functions ─────────────────────────────────────────────────────

function parseCatalogueRoot(root: Record<string, unknown>): BSCatalogue {
  const n = root as Record<string, unknown>

  const publicationsWrapper = arr<Record<string, unknown>>(n, 'publications')
  const publications = publicationsWrapper[0]
    ? arr<Record<string, unknown>>(publicationsWrapper[0], 'publication').map(parsePublication)
    : []

  const costTypesWrapper = arr<Record<string, unknown>>(n, 'costTypes')
  const costTypes = costTypesWrapper[0]
    ? arr<Record<string, unknown>>(costTypesWrapper[0], 'costType').map(parseCostType)
    : []

  const profileTypesWrapper = arr<Record<string, unknown>>(n, 'profileTypes')
  const profileTypes = profileTypesWrapper[0]
    ? arr<Record<string, unknown>>(profileTypesWrapper[0], 'profileType').map(parseProfileType)
    : []

  const categoryEntriesWrapper = arr<Record<string, unknown>>(n, 'categoryEntries')
  const categoryEntries = categoryEntriesWrapper[0]
    ? arr<Record<string, unknown>>(categoryEntriesWrapper[0], 'categoryEntry').map(parseCategoryEntry)
    : []

  const forceEntriesWrapper = arr<Record<string, unknown>>(n, 'forceEntries')
  const forceEntries = forceEntriesWrapper[0]
    ? arr<Record<string, unknown>>(forceEntriesWrapper[0], 'forceEntry').map(parseForceEntry)
    : []

  const seWrapper = arr<Record<string, unknown>>(n, 'selectionEntries')
  const selectionEntries = seWrapper[0]
    ? arr<Record<string, unknown>>(seWrapper[0], 'selectionEntry').map(parseSelectionEntry)
    : []

  const sharedSeWrapper = arr<Record<string, unknown>>(n, 'sharedSelectionEntries')
  const sharedSelectionEntries = sharedSeWrapper[0]
    ? arr<Record<string, unknown>>(sharedSeWrapper[0], 'selectionEntry').map(parseSelectionEntry)
    : []

  const sharedSegWrapper = arr<Record<string, unknown>>(n, 'sharedSelectionEntryGroups')
  const sharedSelectionEntryGroups = sharedSegWrapper[0]
    ? arr<Record<string, unknown>>(sharedSegWrapper[0], 'selectionEntryGroup').map(parseSelectionEntryGroup)
    : []

  const sharedProfilesWrapper = arr<Record<string, unknown>>(n, 'sharedProfiles')
  const sharedProfiles = sharedProfilesWrapper[0]
    ? arr<Record<string, unknown>>(sharedProfilesWrapper[0], 'profile').map(parseProfile)
    : []

  const sharedRulesWrapper = arr<Record<string, unknown>>(n, 'sharedRules')
  const sharedRules = sharedRulesWrapper[0]
    ? arr<Record<string, unknown>>(sharedRulesWrapper[0], 'rule').map(parseRule)
    : []

  const rulesWrapper = arr<Record<string, unknown>>(n, 'rules')
  const rules = rulesWrapper[0]
    ? arr<Record<string, unknown>>(rulesWrapper[0], 'rule').map(parseRule)
    : []

  const catalogueLinksWrapper = arr<Record<string, unknown>>(n, 'catalogueLinks')
  const catalogueLinks: BSCatalogueLink[] = catalogueLinksWrapper[0]
    ? arr<Record<string, unknown>>(catalogueLinksWrapper[0], 'catalogueLink').map((cl) => ({
      id: attr(cl, 'id'),
      targetId: attr(cl, 'targetId'),
      type: 'catalogue' as const,
      name: attr(cl, 'name'),
      importRootEntries: attrBool(cl, 'importRootEntries'),
    }))
    : []

  return {
    id: attr(n, 'id'),
    name: attr(n, 'name'),
    revision: attrNum(n, 'revision'),
    battleScribeVersion: attr(n, 'battleScribeVersion'),
    authorName: attr(n, 'authorName') || undefined,
    authorContact: attr(n, 'authorContact') || undefined,
    authorUrl: attr(n, 'authorUrl') || undefined,
    library: attrBool(n, 'library'),
    gameSystemId: attr(n, 'gameSystemId'),
    gameSystemRevision: attrNum(n, 'gameSystemRevision'),
    publications,
    costTypes,
    profileTypes,
    categoryEntries,
    forceEntries,
    selectionEntries,
    sharedSelectionEntries,
    sharedSelectionEntryGroups,
    sharedProfiles,
    sharedRules,
    catalogueLinks,
    rules,
  }
}

export function parseCatalogue(xmlText: string): BSCatalogue {
  const result = xmlParser.parse(xmlText) as Record<string, unknown>
  const catNode = result['catalogue'] as Record<string, unknown>
  if (!catNode) throw new Error('Not a valid catalogue XML — missing <catalogue> root')
  return parseCatalogueRoot(catNode)
}

export function parseGameSystem(xmlText: string): BSGameSystem {
  const result = xmlParser.parse(xmlText) as Record<string, unknown>
  const gsNode = result['gameSystem'] as Record<string, unknown>
  if (!gsNode) throw new Error('Not a valid game system XML — missing <gameSystem> root')

  const publicationsWrapper = arr<Record<string, unknown>>(gsNode, 'publications')
  const publications = publicationsWrapper[0]
    ? arr<Record<string, unknown>>(publicationsWrapper[0], 'publication').map(parsePublication)
    : []

  const costTypesWrapper = arr<Record<string, unknown>>(gsNode, 'costTypes')
  const costTypes = costTypesWrapper[0]
    ? arr<Record<string, unknown>>(costTypesWrapper[0], 'costType').map(parseCostType)
    : []

  const profileTypesWrapper = arr<Record<string, unknown>>(gsNode, 'profileTypes')
  const profileTypes = profileTypesWrapper[0]
    ? arr<Record<string, unknown>>(profileTypesWrapper[0], 'profileType').map(parseProfileType)
    : []

  const categoryEntriesWrapper = arr<Record<string, unknown>>(gsNode, 'categoryEntries')
  const categoryEntries = categoryEntriesWrapper[0]
    ? arr<Record<string, unknown>>(categoryEntriesWrapper[0], 'categoryEntry').map(parseCategoryEntry)
    : []

  const forceEntriesWrapper = arr<Record<string, unknown>>(gsNode, 'forceEntries')
  const forceEntries = forceEntriesWrapper[0]
    ? arr<Record<string, unknown>>(forceEntriesWrapper[0], 'forceEntry').map(parseForceEntry)
    : []

  const sharedSeWrapper = arr<Record<string, unknown>>(gsNode, 'sharedSelectionEntries')
  const sharedSelectionEntries = sharedSeWrapper[0]
    ? arr<Record<string, unknown>>(sharedSeWrapper[0], 'selectionEntry').map(parseSelectionEntry)
    : []

  const sharedProfilesWrapper = arr<Record<string, unknown>>(gsNode, 'sharedProfiles')
  const sharedProfiles = sharedProfilesWrapper[0]
    ? arr<Record<string, unknown>>(sharedProfilesWrapper[0], 'profile').map(parseProfile)
    : []

  const sharedRulesWrapper = arr<Record<string, unknown>>(gsNode, 'sharedRules')
  const sharedRules = sharedRulesWrapper[0]
    ? arr<Record<string, unknown>>(sharedRulesWrapper[0], 'rule').map(parseRule)
    : []

  const rulesWrapper = arr<Record<string, unknown>>(gsNode, 'rules')
  const rules = rulesWrapper[0]
    ? arr<Record<string, unknown>>(rulesWrapper[0], 'rule').map(parseRule)
    : []

  return {
    id: attr(gsNode, 'id'),
    name: attr(gsNode, 'name'),
    revision: attrNum(gsNode, 'revision'),
    battleScribeVersion: attr(gsNode, 'battleScribeVersion'),
    authorName: attr(gsNode, 'authorName') || undefined,
    publications,
    costTypes,
    profileTypes,
    categoryEntries,
    forceEntries,
    sharedSelectionEntries,
    sharedProfiles,
    sharedRules,
    rules,
  }
}
