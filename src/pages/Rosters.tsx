import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrashIcon, PencilSquareIcon, PlusIcon, RectangleStackIcon } from '@heroicons/react/24/outline'
import { useRosterStore } from '@/stores/rosterStore'
import { cn, formatPoints } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PointsTracker } from '@/components/army/PointsTracker'

export function RostersPage() {
  const { rosters, deleteRoster, setActiveRoster } = useRosterStore()

  const totalUnits = (r: (typeof rosters)[number]) =>
    r.forces.reduce((t, f) => t + f.selections.length, 0)

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-10">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-extrabold uppercase tracking-wide text-neutral-900 dark:text-neutral-100 mb-1">
            My Rosters
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            {rosters.length} roster{rosters.length !== 1 ? 's' : ''} saved locally
          </p>
        </div>
        <Link to="/builder">
          <Button variant="primary" icon={<PlusIcon />}>
            New Roster
          </Button>
        </Link>
      </div>

      {rosters.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'text-center py-24 rounded-xl border-2 border-dashed',
            'border-neutral-200 dark:border-neutral-800',
            'bg-neutral-50 dark:bg-neutral-900/30',
          )}
        >
          <RectangleStackIcon className="size-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400 text-lg font-semibold mb-2">No rosters yet</p>
          <p className="text-neutral-400 dark:text-neutral-600 text-sm mb-6">Build your first army to get started</p>
          <Link to="/builder">
            <Button variant="primary" icon={<PlusIcon />}>Open Builder</Button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {rosters.map((roster, i) => (
            <motion.div
              key={roster.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                'rounded-xl border overflow-hidden',
                'bg-white dark:bg-neutral-900',
                'border-neutral-200 dark:border-neutral-800',
                'hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm',
                'transition-all duration-150',
              )}
            >
              <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h2 className="font-display text-lg font-bold uppercase tracking-wide text-neutral-900 dark:text-neutral-100">
                      {roster.name}
                    </h2>
                    <Badge variant="muted" size="sm">
                      {totalUnits(roster)} units
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-xs text-neutral-400 dark:text-neutral-500 mb-3">
                    <span>{roster.forces.map((f) => f.catalogueName).join(', ') || 'No detachments'}</span>
                    <span>·</span>
                    <span>Updated {new Date(roster.updatedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="max-w-xs">
                    <PointsTracker current={roster.points} limit={roster.pointsLimit} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to="/builder"
                    onClick={() => setActiveRoster(roster.id)}
                  >
                    <Button variant="primary" size="sm" icon={<PencilSquareIcon />}>
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<TrashIcon />}
                    onClick={() => {
                      if (confirm(`Delete "${roster.name}"? This cannot be undone.`)) {
                        deleteRoster(roster.id)
                      }
                    }}
                    className="text-neutral-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    aria-label="Delete roster"
                  />
                </div>
              </div>

              {/* Force breakdown */}
              {roster.forces.length > 0 && (
                <div className="border-t border-neutral-100 dark:border-neutral-800 px-5 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 flex flex-wrap gap-4">
                  {roster.forces.map((force) => (
                    <div key={force.id} className="text-xs text-neutral-500 dark:text-neutral-400">
                      <span className="text-amber-600 dark:text-amber-500 font-semibold">{force.catalogueName}</span>
                      <span className="ml-1.5">
                        {force.selections.length} units · {formatPoints(force.selections.reduce((t, s) => t + (s.costs?.[0]?.value ?? 0), 0))} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
