import { Outlet } from 'react-router-dom'
import { Header } from './Header'

export function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-void-950">
      <Header />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <footer className="border-t border-steel-800 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-steel-500">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold tracking-widest uppercase text-steel-400">Warscribe</span>
            <span className="text-steel-700">|</span>
            <span>Powered by community BSData</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/BSData"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-steel-300 transition-colors"
            >
              BSData Project
            </a>
            <a
              href="https://github.com/yascherice/warscribe"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-steel-300 transition-colors"
            >
              Source Code
            </a>
            <span className="text-steel-600">
              Not affiliated with Games Workshop
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
