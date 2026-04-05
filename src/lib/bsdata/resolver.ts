import type {
  BSCatalogue,
  BSGameSystem,
  BSSelectionEntry,
  BSSelectionEntryGroup,
  BSCost,
  BSProfile,
  BSRule,
  BSEntryLink,
} from './types'

/**
 * Builds a lookup map of all shared entries, profiles, and rules across
 * a game system and all its catalogues. This is the key step that allows
 * entryLinks to resolve to their actual definitions.
 */
export class CatalogueResolver {
  private entriesById = new Map<string, BSSelectionEntry | BSSelectionEntryGroup>()
  private profilesById = new Map<string, BSProfile>()
  private rulesById = new Map<string, BSRule>()

  constructor(gameSystem: BSGameSystem, catalogues: BSCatalogue[]) {
    this.indexGameSystem(gameSystem)
    for (const cat of catalogues) {
      this.indexCatalogue(cat)
    }
  }

  private indexGameSystem(gs: BSGameSystem): void {
    for (const e of gs.sharedSelectionEntries ?? []) this.entriesById.set(e.id, e)
    for (const g of gs.sharedSelectionEntryGroups ?? []) this.entriesById.set(g.id, g)
    for (const p of gs.sharedProfiles ?? []) this.profilesById.set(p.id, p)
    for (const r of gs.sharedRules ?? []) this.rulesById.set(r.id, r)
    for (const e of gs.selectionEntries ?? []) this.entriesById.set(e.id, e)
  }

  private indexCatalogue(cat: BSCatalogue): void {
    for (const e of cat.sharedSelectionEntries ?? []) this.entriesById.set(e.id, e)
    for (const g of cat.sharedSelectionEntryGroups ?? []) this.entriesById.set(g.id, g)
    for (const p of cat.sharedProfiles ?? []) this.profilesById.set(p.id, p)
    for (const r of cat.sharedRules ?? []) this.rulesById.set(r.id, r)
    for (const e of cat.selectionEntries ?? []) this.entriesById.set(e.id, e)
  }

  resolveEntry(id: string): BSSelectionEntry | BSSelectionEntryGroup | undefined {
    return this.entriesById.get(id)
  }

  resolveProfile(id: string): BSProfile | undefined {
    return this.profilesById.get(id)
  }

  resolveRule(id: string): BSRule | undefined {
    return this.rulesById.get(id)
  }

  /**
   * Resolves an entryLink to its target, merging any override costs/modifiers.
   * Returns a shallow copy so we don't mutate the original.
   */
  resolveLink(link: BSEntryLink): BSSelectionEntry | BSSelectionEntryGroup | null {
    const target = this.entriesById.get(link.targetId)
    if (!target) return null

    // Merge link-level costs and modifiers onto a shallow copy
    const resolved = { ...target }

    if (link.costs && link.costs.length > 0 && 'costs' in resolved) {
      // Link costs override target costs for the same cost type
      const resolvedEntry = resolved as BSSelectionEntry
      const baseCosts: BSCost[] = resolvedEntry.costs ?? []
      const costMap = new Map(baseCosts.map((c) => [c.typeId, { ...c }]))
      for (const lc of link.costs) {
        const existing = costMap.get(lc.typeId)
        if (existing) {
          existing.value += lc.value
        } else {
          costMap.set(lc.typeId, { ...lc })
        }
      }
      resolvedEntry.costs = Array.from(costMap.values())
    }

    if (link.modifiers && link.modifiers.length > 0) {
      resolved.modifiers = [...(resolved.modifiers ?? []), ...link.modifiers]
    }

    if (link.name && link.name !== target.name) {
      resolved.name = link.name
    }

    if (link.hidden !== undefined) {
      resolved.hidden = link.hidden
    }

    return resolved as BSSelectionEntry | BSSelectionEntryGroup
  }

  /** Returns all entries indexed (for debugging/inspection) */
  getAllEntries(): Map<string, BSSelectionEntry | BSSelectionEntryGroup> {
    return this.entriesById
  }
}
