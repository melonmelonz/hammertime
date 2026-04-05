import { cn } from '@/lib/utils'
import { formatPoints } from '@/lib/utils'

interface PointsTrackerProps {
  current: number
  limit: number
  className?: string
}

export function PointsTracker({ current, limit, className }: PointsTrackerProps) {
  const pct = limit > 0 ? Math.min(current / limit, 1) : 0
  const over = current > limit && limit > 0

  const barColor = over
    ? 'bg-blood-500'
    : pct > 0.9
      ? 'bg-amber-500'
      : 'bg-gold-500'

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-mono text-steel-400 uppercase tracking-widest">Points</span>
        <span
          className={cn(
            'font-display text-lg font-bold tracking-wide',
            over ? 'text-blood-400' : pct > 0.9 ? 'text-amber-400' : 'text-gold-400',
          )}
        >
          {formatPoints(current)}
          <span className="text-steel-500 font-normal text-sm mx-1">/</span>
          <span className="text-steel-300 text-sm">{formatPoints(limit)}</span>
        </span>
      </div>

      {/* Bar */}
      <div className="h-1.5 bg-void-700 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', barColor)}
          style={{ width: `${pct * 100}%` }}
        />
      </div>

      {over && (
        <p className="text-xs text-blood-400 font-mono">
          {formatPoints(current - limit)} pts over limit
        </p>
      )}
    </div>
  )
}
