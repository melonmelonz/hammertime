import JSZip from 'jszip'
import { parseCatalogue, parseGameSystem } from './parser'
import type { BSCatalogue, BSGameSystem } from './types'

const GITHUB_RAW = 'https://raw.githubusercontent.com'
const GITHUB_API = 'https://api.github.com'

export interface RepoFile {
  name: string
  path: string
  download_url: string
  size: number
  sha: string
}

export interface KnownRepo {
  id: string
  name: string
  description: string
  org: string
  repo: string
  branch: string
  gameSystemFile: string
  icon?: string
}

// Supported game systems with their BSData repositories
export const KNOWN_REPOS: KnownRepo[] = [
  {
    id: 'wh40k-10e',
    name: 'Warhammer 40,000',
    description: '10th Edition — All factions and detachments',
    org: 'BSData',
    repo: 'wh40k-10e',
    branch: 'main',
    gameSystemFile: 'Warhammer 40,000.gst',
    icon: '⚔️',
  },
  {
    id: 'wh40k-killteam',
    name: 'Kill Team',
    description: '2021 Edition — Skirmish battles in the 41st Millennium',
    org: 'BSData',
    repo: 'killteam',
    branch: 'master',
    gameSystemFile: 'Kill Team.gst',
    icon: '🎯',
  },
  {
    id: 'horus-heresy',
    name: 'Horus Heresy',
    description: 'Age of Darkness — The galaxy in flames',
    org: 'BSData',
    repo: 'horus-heresy',
    branch: 'master',
    gameSystemFile: 'Horus Heresy.gst',
    icon: '🔥',
  },
]

const CACHE_PREFIX = 'warscribe_bsdata_'
const CACHE_VERSION = 1

interface CacheEntry {
  version: number
  sha: string
  data: string
  timestamp: number
}

function cacheKey(org: string, repo: string, file: string): string {
  return `${CACHE_PREFIX}${org}_${repo}_${file.replace(/[^a-z0-9]/gi, '_')}`
}

function readCache(key: string): CacheEntry | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry
    if (entry.version !== CACHE_VERSION) return null
    // Expire after 24 hours
    if (Date.now() - entry.timestamp > 24 * 60 * 60 * 1000) return null
    return entry
  } catch {
    return null
  }
}

function writeCache(key: string, sha: string, data: string): void {
  try {
    const entry: CacheEntry = { version: CACHE_VERSION, sha, data, timestamp: Date.now() }
    localStorage.setItem(key, JSON.stringify(entry))
  } catch {
    // LocalStorage might be full — silently ignore
  }
}

export async function fetchRepoContents(known: KnownRepo): Promise<RepoFile[]> {
  const url = `${GITHUB_API}/repos/${known.org}/${known.repo}/contents?ref=${known.branch}`
  const res = await fetch(url, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  })
  if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`)
  const files = (await res.json()) as RepoFile[]
  return files.filter((f) => f.name.endsWith('.cat') || f.name.endsWith('.gst') || f.name.endsWith('.catz') || f.name.endsWith('.gstz'))
}

async function fetchRawFile(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return res.text()
}

async function fetchAndDecompress(url: string, filename: string): Promise<string> {
  if (filename.endsWith('z')) {
    // Compressed — fetch as binary and decompress
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
    const buffer = await res.arrayBuffer()
    const zip = await JSZip.loadAsync(buffer)
    const innerName = filename.slice(0, -1) // .catz → .cat, .gstz → .gst
    const file = zip.file(innerName)
    if (!file) {
      // Try first file in zip
      const files = Object.values(zip.files)
      if (!files[0]) throw new Error('Empty zip archive')
      return files[0].async('string')
    }
    return file.async('string')
  }
  return fetchRawFile(url)
}

export async function fetchGameSystem(known: KnownRepo, sha?: string): Promise<BSGameSystem> {
  const key = cacheKey(known.org, known.repo, known.gameSystemFile)
  const cached = readCache(key)
  if (cached && sha && cached.sha === sha) {
    return parseGameSystem(cached.data)
  }

  const rawUrl = `${GITHUB_RAW}/${known.org}/${known.repo}/${known.branch}/${encodeURIComponent(known.gameSystemFile)}`
  const xml = await fetchAndDecompress(rawUrl, known.gameSystemFile)
  if (sha) writeCache(key, sha, xml)
  return parseGameSystem(xml)
}

export async function fetchCatalogue(known: KnownRepo, file: RepoFile): Promise<BSCatalogue> {
  const key = cacheKey(known.org, known.repo, file.name)
  const cached = readCache(key)
  if (cached && cached.sha === file.sha) {
    return parseCatalogue(cached.data)
  }

  const xml = await fetchAndDecompress(file.download_url, file.name)
  writeCache(key, file.sha, xml)
  return parseCatalogue(xml)
}

export type FetchProgress = {
  stage: 'listing' | 'gameSystem' | 'catalogues'
  loaded: number
  total: number
  currentFile?: string
}

export async function fetchAllCatalogues(
  known: KnownRepo,
  onProgress?: (p: FetchProgress) => void,
): Promise<{ gameSystem: BSGameSystem; catalogues: BSCatalogue[] }> {
  onProgress?.({ stage: 'listing', loaded: 0, total: 1 })
  const files = await fetchRepoContents(known)

  const gstFile = files.find((f) => f.name === known.gameSystemFile || f.name === known.gameSystemFile + 'z')
  onProgress?.({ stage: 'gameSystem', loaded: 0, total: 1 })
  const gameSystem = await fetchGameSystem(known, gstFile?.sha)

  const catFiles = files.filter((f) => f.name.endsWith('.cat') || f.name.endsWith('.catz'))
  const catalogues: BSCatalogue[] = []

  for (let i = 0; i < catFiles.length; i++) {
    const f = catFiles[i]
    onProgress?.({ stage: 'catalogues', loaded: i, total: catFiles.length, currentFile: f.name })
    try {
      const cat = await fetchCatalogue(known, f)
      catalogues.push(cat)
    } catch (err) {
      console.warn(`Failed to load catalogue ${f.name}:`, err)
    }
  }

  onProgress?.({ stage: 'catalogues', loaded: catFiles.length, total: catFiles.length })
  return { gameSystem, catalogues }
}
