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
        'inline-block rounded-full border-steel-600 border-t-gold-500 animate-spin',
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
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-steel-400">
      <Spinner size="lg" />
      {message && <p className="text-sm font-mono">{message}</p>}
    </div>
  )
}
