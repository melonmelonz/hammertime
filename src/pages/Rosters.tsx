import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrashIcon, PencilSquareIcon, PlusIcon } from '@heroicons/react/24/outline'
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
          <h1 className="font-display text-3xl font-extrabold uppercase tracking-wide text-steel-100 mb-1">
            My Rosters
          </h1>
          <p className="text-steel-500 text-sm">
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
        <div className="text-center py-24 border border-dashed border-steel-800 rounded-[4px]">
          <p className="text-steel-400 text-lg font-semibold mb-2">No rosters yet</p>
          <p className="text-steel-600 text-sm mb-6">Build your first army to get started</p>
          <Link to="/builder">
            <Button variant="primary" icon={<PlusIcon />}>Open Builder</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {rosters.map((roster, i) => (
            <motion.div
              key={roster.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                'bg-void-800 border border-steel-700 rounded-[4px] overflow-hidden',
                'hover:border-steel-500 transition-colors',
              )}
            >
              <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h2 className="font-display text-lg font-bold uppercase tracking-wide text-steel-100">
                      {roster.name}
                    </h2>
                    <Badge variant="muted" size="sm">
                      {totalUnits(roster)} units
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap text-xs text-steel-500">
                    <span className="font-mono">{roster.forces.map((f) => f.catalogueName).join(', ')}</span>
                    <span>·</span>
                    <span>Updated {new Date(roster.updatedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="mt-3 max-w-xs">
                    <PointsTracker current={roster.points} limit={roster.pointsLimit} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to="/builder"
                    onClick={() => setActiveRoster(roster.id)}
                  >
                    <Button variant="gold" size="sm" icon={<PencilSquareIcon />}>
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
                    className="text-steel-500 hover:text-blood-400"
                    aria-label="Delete roster"
                  />
                </div>
              </div>

              {/* Force breakdown */}
              {roster.forces.length > 0 && (
                <div className="border-t border-steel-800 px-5 py-2.5 bg-void-900/50 flex flex-wrap gap-3">
                  {roster.forces.map((force) => (
                    <div key={force.id} className="text-xs text-steel-500">
                      <span className="text-gold-600 font-semibold">{force.catalogueName}</span>
                      <span className="ml-1">{force.selections.length} units · {formatPoints(force.selections.reduce((t, s) => t + (s.costs?.[0]?.value ?? 0), 0))}pts</span>
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
