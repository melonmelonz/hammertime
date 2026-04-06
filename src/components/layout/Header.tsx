import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheckIcon,
  RectangleStackIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'
import { supabaseEnabled } from '@/lib/supabase'
import { AuthModal } from '@/components/auth/AuthModal'
import { UserMenu } from '@/components/auth/UserMenu'

const NAV = [
  { label: 'Builder', href: '/builder', icon: <ShieldCheckIcon className="size-4" /> },
  { label: 'My Rosters', href: '/rosters', icon: <RectangleStackIcon className="size-4" /> },
]

const THEME_OPTIONS = [
  { value: 'light' as const, icon: <SunIcon className="size-4" />, label: 'Light' },
  { value: 'dark' as const,  icon: <MoonIcon className="size-4" />, label: 'Dark' },
  { value: 'system' as const, icon: <ComputerDesktopIcon className="size-4" />, label: 'System' },
]

export function Header() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)

  const { theme, setTheme } = useThemeStore()
  const { initialized } = useAuthStore()

  const currentThemeIcon = THEME_OPTIONS.find((o) => o.value === theme)?.icon ?? <SunIcon className="size-4" />

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="size-7 relative flex items-center justify-center">
              <svg viewBox="0 0 28 28" fill="none" className="size-7">
                <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-500" />
                <polygon points="14,7 21,10.5 21,17.5 14,21 7,17.5 7,10.5" fill="currentColor" className="text-amber-500" />
                <polygon points="14,11 18,13 18,15 14,17 10,15 10,13" fill="currentColor" className="text-white dark:text-neutral-950" />
              </svg>
            </div>
            <span className="font-display text-xl font-bold tracking-wider uppercase text-neutral-900 dark:text-neutral-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              Hammertime
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 ml-2">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'relative flex items-center gap-1.5 px-3 h-9 text-sm font-medium rounded-md transition-colors',
                    active
                      ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800',
                  )}
                >
                  {item.icon}
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute bottom-0.5 left-3 right-3 h-0.5 bg-amber-500 rounded-full"
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="flex-1" />

          {/* Right side actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme toggle */}
            <div className="relative">
              <button
                onClick={() => setThemeMenuOpen((v) => !v)}
                className={cn(
                  'flex items-center justify-center size-9 rounded-md transition-colors cursor-pointer',
                  'text-neutral-500 dark:text-neutral-400',
                  'hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100',
                )}
                aria-label="Toggle theme"
              >
                {currentThemeIcon}
              </button>

              {themeMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setThemeMenuOpen(false)} />
                  <div className={cn(
                    'absolute right-0 top-full mt-1 w-36 z-20 py-1',
                    'bg-white dark:bg-neutral-800',
                    'border border-neutral-200 dark:border-neutral-700',
                    'rounded-lg shadow-lg shadow-black/10',
                    'animate-fade-up',
                  )}>
                    {THEME_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setTheme(opt.value); setThemeMenuOpen(false) }}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors cursor-pointer',
                          theme === opt.value
                            ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700',
                        )}
                      >
                        {opt.icon}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* GitHub */}
            <a
              href="https://github.com/melonmelonz/hammertime"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center justify-center size-9 rounded-md transition-colors',
                'text-neutral-500 dark:text-neutral-400',
                'hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100',
              )}
              aria-label="GitHub"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-5">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
              </svg>
            </a>

            {/* Auth */}
            {initialized && (
              supabaseEnabled
                ? <UserMenu onOpenAuth={() => setAuthOpen(true)} />
                : null
            )}

            <Button variant="primary" size="sm" onClick={() => navigate('/builder')}>
              New Roster
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className={cn(
              'md:hidden flex items-center justify-center size-9 rounded-md transition-colors cursor-pointer',
              'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800',
            )}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <XMarkIcon className="size-5" /> : <Bars3Icon className="size-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950"
          >
            <nav className="p-3 space-y-0.5">
              {NAV.map((item) => {
                const active = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                      active
                        ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800',
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                )
              })}
              <div className="pt-2 flex items-center gap-2">
                {THEME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1 py-2 rounded-md text-xs transition-colors cursor-pointer',
                      theme === opt.value
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800',
                    )}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            </nav>
          </motion.div>
        )}
      </header>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}
