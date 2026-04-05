import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShieldCheckIcon,
  RectangleStackIcon,
  BookOpenIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

const NAV = [
  { label: 'Builder', href: '/builder', icon: <ShieldCheckIcon className="size-4" /> },
  { label: 'My Rosters', href: '/rosters', icon: <RectangleStackIcon className="size-4" /> },
  { label: 'About', href: '/about', icon: <BookOpenIcon className="size-4" /> },
]

export function Header() {
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-steel-800 bg-void-950/90 backdrop-blur-md">
      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="relative size-7">
            <svg viewBox="0 0 28 28" fill="none" className="size-7">
              <polygon
                points="14,2 26,8 26,20 14,26 2,20 2,8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-gold-500 group-hover:text-gold-400 transition-colors"
              />
              <polygon
                points="14,7 21,10.5 21,17.5 14,21 7,17.5 7,10.5"
                fill="currentColor"
                className="text-gold-600 group-hover:text-gold-500 transition-colors"
              />
              <polygon
                points="14,10 18,12 18,16 14,18 10,16 10,12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-void-950 transition-colors"
              />
            </svg>
          </div>
          <span className="font-display text-xl font-bold tracking-[0.12em] uppercase text-steel-50 group-hover:text-gold-300 transition-colors">
            Warscribe
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 ml-2" aria-label="Main navigation">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'relative flex items-center gap-1.5 px-3 h-9 text-sm font-medium rounded-[3px] transition-colors',
                  active
                    ? 'text-gold-400 bg-gold-900/20'
                    : 'text-steel-400 hover:text-steel-100 hover:bg-steel-800',
                )}
              >
                {item.icon}
                {item.label}
                {active && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-px bg-gold-500 rounded-full"
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {}}
          >
            New Roster
          </Button>
          <a
            href="https://github.com/yascherice/warscribe"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex items-center justify-center size-9 rounded-[3px] transition-colors',
              'text-steel-400 hover:text-steel-100 hover:bg-steel-800',
            )}
            aria-label="GitHub repository"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-5">
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
            </svg>
          </a>
        </div>

        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          icon={mobileOpen ? <XMarkIcon /> : <Bars3Icon />}
        />
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-steel-800 bg-void-900"
        >
          <nav className="flex flex-col p-3 gap-1">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2.5 rounded-[3px] text-sm font-medium transition-colors',
                    active
                      ? 'text-gold-400 bg-gold-900/20'
                      : 'text-steel-400 hover:text-steel-100 hover:bg-steel-800',
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </motion.div>
      )}
    </header>
  )
}
