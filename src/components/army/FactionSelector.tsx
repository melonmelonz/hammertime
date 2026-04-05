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

const REPO_DETAILS: Record<string, { tagline: string; status: 'stable' | 'beta' | 'wip' }> = {
  'wh40k-10e': {
    tagline: 'All factions · Points-matched · Crusade',
    status: 'stable',
  },
  'wh40k-killteam': {
    tagline: 'All operatives · 2021 compendium',
    status: 'beta',
  },
  'horus-heresy': {
    tagline: 'Legions Astartes · Solar Auxilia · Mechanicum',
    status: 'beta',
  },
}

export function FactionSelector({ onSelect, loading, activeId }: FactionSelectorProps) {
  return (
    <div className="grid gap-3">
      {KNOWN_REPOS.map((repo, i) => {
        const details = REPO_DETAILS[repo.id]
        const active = activeId === repo.id

        return (
          <motion.button
            key={repo.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => onSelect(repo)}
            disabled={loading}
            className={cn(
              'w-full text-left px-5 py-4 rounded-[4px] border transition-all group',
              'flex items-center gap-4',
              active
                ? 'bg-gold-900/20 border-gold-600 shadow-[0_0_20px_rgba(192,138,34,0.15)]'
                : 'bg-void-800 border-steel-700 hover:border-steel-500 hover:bg-void-700',
              loading && 'opacity-50 cursor-not-allowed',
            )}
          >
            <span className="text-3xl" role="img" aria-label={repo.name}>
              {repo.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className={cn(
                    'font-display text-base font-semibold tracking-wide uppercase',
                    active ? 'text-gold-300' : 'text-steel-100 group-hover:text-white',
                  )}
                >
                  {repo.name}
                </span>
                {details && (
                  <Badge
                    variant={details.status === 'stable' ? 'success' : details.status === 'beta' ? 'warning' : 'muted'}
                    size="sm"
                  >
                    {details.status}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-steel-400 truncate">
                {details?.tagline ?? repo.description}
              </p>
            </div>
            <ChevronRightIcon
              className={cn(
                'size-4 shrink-0 transition-transform',
                active ? 'text-gold-500' : 'text-steel-600 group-hover:text-steel-400',
                active && 'translate-x-0.5',
              )}
            />
          </motion.button>
        )
      })}
    </div>
  )
}
