import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedDark: () => boolean
}

function prefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',

      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },

      resolvedDark: () => {
        const { theme } = get()
        if (theme === 'dark') return true
        if (theme === 'light') return false
        return prefersDark()
      },
    }),
    { name: 'hammertime-theme' },
  ),
)

export function applyTheme(theme: Theme): void {
  const dark =
    theme === 'dark' || (theme === 'system' && prefersDark())
  document.documentElement.classList.toggle('dark', dark)
}

export function initTheme(): void {
  const stored = localStorage.getItem('hammertime-theme')
  let theme: Theme = 'system'
  try {
    const parsed = JSON.parse(stored ?? '{}') as { state?: { theme?: Theme } }
    theme = parsed?.state?.theme ?? 'system'
  } catch { /* ignore */ }
  applyTheme(theme)

  // Watch system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const current = useThemeStore.getState().theme
    if (current === 'system') applyTheme('system')
  })
}
