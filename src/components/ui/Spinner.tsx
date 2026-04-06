import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'size-4 border-2',
  md: 'size-6 border-2',
  lg: 'size-10 border-[3px]',
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-full animate-spin',
        'border-neutral-300 border-t-amber-600',
        'dark:border-neutral-700 dark:border-t-amber-400',
        sizes[size],
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  )
}

export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-neutral-400">
      <Spinner size="lg" />
      {message && <p className="text-sm">{message}</p>}
    </div>
  )
}
