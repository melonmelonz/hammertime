import { cn } from '@/lib/utils'
import { formatPoints } from '@/lib/utils'

interface PointsTrackerProps {
  current: number
  limit: number
  className?: string
}

export function PointsTracker({ current, limit, className }: PointsTrackerProps) {
  const safeCurrent = isNaN(current) || !isFinite(current) ? 0 : current
  const pct = limit > 0 ? Math.min(safeCurrent / limit, 1) : 0
  const over = safeCurrent > limit && limit > 0

  const barColor = over
    ? 'bg-red-500'
    : pct > 0.9
      ? 'bg-amber-500'
      : 'bg-amber-500'

  const textColor = over ? 'text-red-600 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Points</span>
        <span className={cn('font-display text-lg font-bold leading-none', textColor)}>
          {formatPoints(safeCurrent)}
          <span className="text-neutral-400 dark:text-neutral-500 font-normal text-sm mx-1">/</span>
          <span className="text-neutral-600 dark:text-neutral-300 text-sm">{formatPoints(limit)}</span>
        </span>
      </div>
      <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
      {over && (
        <p className="text-xs text-red-600 dark:text-red-400">
          {formatPoints(safeCurrent - limit)} pts over limit
        </p>
      )}
    </div>
  )
}
