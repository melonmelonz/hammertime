import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { KNOWN_REPOS } from '@/lib/bsdata'
import type { KnownRepo } from '@/lib/bsdata'
import { Badge } from '@/components/ui/Badge'
import { ChevronRightIcon } from '@heroicons/react/24/outline'

interface FactionSelectorProps {
  onSelect: (repo: KnownRepo) => void
  loading?: boolean
  activeId?: string
}

const STATUS: Record<string, { label: string; variant: 'green' | 'amber' }> = {
  'wh40k-10e':     { label: 'Stable', variant: 'green' },
  'horus-heresy':  { label: 'Beta',   variant: 'amber' },
}

export function FactionSelector({ onSelect, loading, activeId }: FactionSelectorProps) {
  return (
    <div className="space-y-2">
      {KNOWN_REPOS.map((repo, i) => {
        const status = STATUS[repo.id]
        const active = activeId === repo.id

        return (
          <motion.button
            key={repo.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            onClick={() => onSelect(repo)}
            disabled={loading}
            className={cn(
              'w-full text-left flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all cursor-pointer',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              active
                ? 'border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-sm'
                : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-600 hover:shadow-sm',
            )}
          >
            <span className="text-2xl shrink-0" role="img" aria-label={repo.name}>
              {repo.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={cn(
                  'font-display font-bold text-base tracking-wide uppercase',
                  active ? 'text-amber-700 dark:text-amber-400' : 'text-neutral-900 dark:text-neutral-100',
                )}>
                  {repo.name}
                </span>
                {status && (
                  <Badge variant={status.variant} size="sm">{status.label}</Badge>
                )}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                {repo.description}
              </p>
            </div>
            <ChevronRightIcon className={cn(
              'size-4 shrink-0 transition-colors',
              active ? 'text-amber-500' : 'text-neutral-300 dark:text-neutral-600',
            )} />
          </motion.button>
        )
      })}
    </div>
  )
}
