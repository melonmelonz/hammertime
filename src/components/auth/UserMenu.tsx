import { useState, useRef, useEffect } from 'react'
import { UserCircleIcon, ArrowRightStartOnRectangleIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '@/stores/authStore'
import { useRosterStore } from '@/stores/rosterStore'
import { cn } from '@/lib/utils'

interface UserMenuProps {
  onOpenAuth: () => void
}

export function UserMenu({ onOpenAuth }: UserMenuProps) {
  const { user, signOut, uploadRoster, fetchCloudRosters } = useAuthStore()
  const { rosters, importRoster } = useRosterStore()
  const [open, setOpen] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSync = async () => {
    setSyncing(true)
    // Upload all local rosters
    await Promise.all(rosters.map((r) => uploadRoster(r)))
    // Pull cloud rosters
    const cloud = await fetchCloudRosters()
    for (const r of cloud) importRoster(r)
    setSyncing(false)
    setOpen(false)
  }

  if (!user) {
    return (
      <button
        onClick={onOpenAuth}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
          'text-neutral-700 dark:text-neutral-300',
          'hover:bg-neutral-100 dark:hover:bg-neutral-800',
          'border border-neutral-200 dark:border-neutral-700',
        )}
      >
        Sign in
      </button>
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
          'text-neutral-700 dark:text-neutral-300',
          'hover:bg-neutral-100 dark:hover:bg-neutral-800',
        )}
      >
        <UserCircleIcon className="size-5 text-amber-600 dark:text-amber-400" />
        <span className="hidden sm:block max-w-[140px] truncate text-xs">
          {user.email}
        </span>
      </button>

      {open && (
        <div className={cn(
          'absolute right-0 top-full mt-1 w-52 z-50',
          'bg-white dark:bg-neutral-800',
          'border border-neutral-200 dark:border-neutral-700',
          'rounded-lg shadow-lg shadow-black/10 dark:shadow-black/40',
          'py-1 animate-fade-up',
        )}>
          <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-700">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{user.email}</p>
          </div>

          <button
            onClick={handleSync}
            disabled={syncing}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors',
              'text-neutral-700 dark:text-neutral-300',
              'hover:bg-neutral-50 dark:hover:bg-neutral-700',
              'disabled:opacity-50',
            )}
          >
            <CloudArrowUpIcon className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
            {syncing ? 'Syncing…' : 'Sync rosters'}
          </button>

          <button
            onClick={() => { signOut(); setOpen(false) }}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors',
              'text-neutral-700 dark:text-neutral-300',
              'hover:bg-neutral-50 dark:hover:bg-neutral-700',
            )}
          >
            <ArrowRightStartOnRectangleIcon className="size-4 shrink-0" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
