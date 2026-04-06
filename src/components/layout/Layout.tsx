import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { Header } from './Header'
import { useAuthStore } from '@/stores/authStore'

export function Layout() {
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <div className="flex flex-col min-h-dvh bg-neutral-50 dark:bg-neutral-950">
      <Header />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-400 dark:text-neutral-500">
          <span className="font-display font-bold tracking-widest uppercase text-neutral-500 dark:text-neutral-400">
            Hammertime
          </span>
          <div className="flex items-center gap-4">
            <a href="https://github.com/BSData" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
              BSData
            </a>
            <a href="https://github.com/melonmelonz/hammertime" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
              Source
            </a>
            <span>Not affiliated with Games Workshop</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
