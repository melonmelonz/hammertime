import JSZip from 'jszip'
import { parseCatalogue, parseGameSystem } from './parser'
import type { BSCatalogue, BSGameSystem } from './types'

const GITHUB_RAW = 'https://raw.githubusercontent.com'
const GITHUB_API = 'https://api.github.com'

// Optional GitHub token via env var — raises rate limit from 60 to 5000 req/hr
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN as string | undefined

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

export const KNOWN_REPOS: KnownRepo[] = [
  {
    id: 'wh40k-10e',
    name: 'Warhammer 40,000',
    description: '10th Edition — all factions and detachments',
    org: 'BSData',
    repo: 'wh40k-10e',
    branch: 'main',
    gameSystemFile: 'Warhammer 40,000.gst',
    icon: '⚔️',
  },
  {
    id: 'horus-heresy',
    name: 'Horus Heresy',
    description: 'Age of Darkness — the galaxy in flames',
    org: 'BSData',
    repo: 'horus-heresy',
    branch: 'main',
    gameSystemFile: 'Horus Heresy.gst',
    icon: '🔥',
  },
]

const CACHE_PREFIX = 'hammertime_bsdata_v2_'

interface CacheEntry {
  sha: string
  data: string
  timestamp: number
}

const CACHE_TTL_MS = 12 * 60 * 60 * 1000 // 12 hours

function cacheKey(org: string, repo: string, file: string): string {
  return `${CACHE_PREFIX}${org}_${repo}_${file.replace(/[^a-z0-9]/gi, '_')}`
}

function readCache(key: string, sha?: string): string | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) return null
    // If we have a sha to compare, only use cache when sha matches
    if (sha && entry.sha !== sha) return null
    return entry.data
  } catch {
    return null
  }
}

function writeCache(key: string, sha: string, data: string): void {
  try {
    const entry: CacheEntry = { sha, data, timestamp: Date.now() }
    localStorage.setItem(key, JSON.stringify(entry))
  } catch {
    // Silently ignore — localStorage may be full
  }
}

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  }
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`
  }
  return headers
}

export async function fetchRepoContents(known: KnownRepo): Promise<RepoFile[]> {
  const url = `${GITHUB_API}/repos/${known.org}/${known.repo}/contents?ref=${known.branch}`
  const res = await fetch(url, { headers: githubHeaders() })

  if (!res.ok) {
    if (res.status === 403) {
      const remaining = res.headers.get('x-ratelimit-remaining')
      if (remaining === '0') {
        const reset = res.headers.get('x-ratelimit-reset')
        const resetTime = reset ? new Date(Number(reset) * 1000).toLocaleTimeString() : 'soon'
        throw new Error(`GitHub rate limit reached. Resets at ${resetTime}. Add a VITE_GITHUB_TOKEN to your environment to increase the limit.`)
      }
    }
    if (res.status === 404) {
      throw new Error(`Repository not found: ${known.org}/${known.repo}. The BSData repo may have been renamed or moved.`)
    }
    throw new Error(`GitHub API error ${res.status}: ${res.statusText}`)
  }

  const files = (await res.json()) as RepoFile[]
  return files.filter((f) =>
    f.name.endsWith('.cat') ||
    f.name.endsWith('.gst') ||
    f.name.endsWith('.catz') ||
    f.name.endsWith('.gstz')
  )
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`)
  return res.text()
}

async function fetchAndDecompress(downloadUrl: string, filename: string): Promise<string> {
  if (filename.endsWith('z')) {
    const res = await fetch(downloadUrl)
    if (!res.ok) throw new Error(`Failed to fetch ${downloadUrl}: ${res.status}`)
    const buffer = await res.arrayBuffer()
    const zip = await JSZip.loadAsync(buffer)
    const innerName = filename.slice(0, -1)
    const file = zip.file(innerName) ?? Object.values(zip.files)[0]
    if (!file) throw new Error('Empty zip archive')
    return file.async('string')
  }
  return fetchText(downloadUrl)
}

export async function fetchGameSystem(known: KnownRepo, sha?: string): Promise<BSGameSystem> {
  const key = cacheKey(known.org, known.repo, known.gameSystemFile)
  const cached = readCache(key, sha)
  if (cached) return parseGameSystem(cached)

  const rawUrl = `${GITHUB_RAW}/${known.org}/${known.repo}/${known.branch}/${encodeURIComponent(known.gameSystemFile)}`
  const xml = await fetchAndDecompress(rawUrl, known.gameSystemFile)
  if (sha) writeCache(key, sha, xml)
  return parseGameSystem(xml)
}

export async function fetchCatalogue(known: KnownRepo, file: RepoFile): Promise<BSCatalogue> {
  const key = cacheKey(known.org, known.repo, file.name)
  const cached = readCache(key, file.sha)
  if (cached) return parseCatalogue(cached)

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

  const gstFile = files.find(
    (f) => f.name === known.gameSystemFile || f.name === `${known.gameSystemFile}z`
  )
  onProgress?.({ stage: 'gameSystem', loaded: 0, total: 1 })
  const gameSystem = await fetchGameSystem(known, gstFile?.sha)

  const catFiles = files.filter((f) => f.name.endsWith('.cat') || f.name.endsWith('.catz'))
  const catalogues: BSCatalogue[] = []

  for (let i = 0; i < catFiles.length; i++) {
    const f = catFiles[i]
    onProgress?.({ stage: 'catalogues', loaded: i, total: catFiles.length, currentFile: f.name.replace(/\.catz?$/, '') })
    try {
      const cat = await fetchCatalogue(known, f)
      catalogues.push(cat)
    } catch (err) {
      console.warn(`Skipping catalogue ${f.name}:`, err)
    }
  }

  onProgress?.({ stage: 'catalogues', loaded: catFiles.length, total: catFiles.length })
  return { gameSystem, catalogues }
}
