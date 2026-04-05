import { create } from 'zustand'
import { fetchAllCatalogues, KNOWN_REPOS, CatalogueResolver } from '@/lib/bsdata'
import type { BSCatalogue, BSGameSystem } from '@/lib/bsdata'
import type { KnownRepo, FetchProgress } from '@/lib/bsdata/fetcher'

interface CatalogueState {
  // Selected game system
  activeRepo: KnownRepo | null

  // Loaded data
  gameSystem: BSGameSystem | null
  catalogues: BSCatalogue[]
  resolver: CatalogueResolver | null

  // Load state
  loading: boolean
  progress: FetchProgress | null
  error: string | null

  // Actions
  loadRepo: (repoId: string) => Promise<void>
  clearRepo: () => void
}

export const useCatalogueStore = create<CatalogueState>((set) => ({
  activeRepo: null,
  gameSystem: null,
  catalogues: [],
  resolver: null,
  loading: false,
  progress: null,
  error: null,

  loadRepo: async (repoId: string) => {
    const repo = KNOWN_REPOS.find((r) => r.id === repoId)
    if (!repo) {
      set({ error: `Unknown repo: ${repoId}` })
      return
    }

    set({ loading: true, error: null, activeRepo: repo, progress: null })

    try {
      const { gameSystem, catalogues } = await fetchAllCatalogues(repo, (progress) => {
        set({ progress })
      })

      const resolver = new CatalogueResolver(gameSystem, catalogues)

      set({
        gameSystem,
        catalogues,
        resolver,
        loading: false,
        progress: null,
      })
    } catch (err) {
      set({
        loading: false,
        progress: null,
        error: err instanceof Error ? err.message : 'Failed to load game data',
      })
    }
  },

  clearRepo: () => {
    set({
      activeRepo: null,
      gameSystem: null,
      catalogues: [],
      resolver: null,
      error: null,
      progress: null,
    })
  },
}))

export { KNOWN_REPOS }
