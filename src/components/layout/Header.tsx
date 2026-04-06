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
  PlayIcon,
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
  { label: 'Rosters', href: '/rosters', icon: <RectangleStackIcon className="size-4" /> },
  { label: 'Tracker', href: '/tracker', icon: <PlayIcon className="size-4" /> },
]

const THEME_OPTIONS = [
  { value: 'light' as const, icon: <SunIcon className="size-4" />, label: 'Light' },
  { value: 'dark' as const, icon: <MoonIcon className="size-4" />, label: 'Dark' },
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
  const onBuilder = pathname.startsWith('/builder')

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="size-7 relative flex items-center justify-center">
              <svg viewBox="0 0 28 28" fill="none" className="size-7">
                <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-500" />
                <polygon points="14,7 21,10.5 21,17.5 14,21 7,17.5 7,10.5" fill="currentColor" className="text-red-500" />
                <polygon points="14,11 18,13 18,15 14,17 10,15 10,13" fill="currentColor" className="text-white dark:text-neutral-950" />
              </svg>
            </div>
            <span className="font-display text-xl font-bold tracking-wider uppercase text-neutral-900 dark:text-neutral-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
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
                      ? 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800',
                  )}
                >
                  {item.icon}
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute bottom-0.5 left-3 right-3 h-0.5 bg-red-500 rounded-full"
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="flex-1" />

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme toggle */}
            <div className="relative">
              <button
                onClick={() => setThemeMenuOpen((v) => !v)}
                className="flex items-center justify-center size-9 rounded-md transition-colors cursor-pointer text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100"
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
                            ? 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
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

            {/* Auth */}
            {initialized && (
              supabaseEnabled
                ? <UserMenu onOpenAuth={() => setAuthOpen(true)} />
                : null
            )}

            {!onBuilder && (
              <Button variant="primary" size="sm" onClick={() => navigate('/builder')}>
                New Roster
              </Button>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden flex items-center justify-center size-9 rounded-md transition-colors cursor-pointer text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
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
                        ? 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
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
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
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
