import { cn } from '@/lib/utils'

type Variant = 'default' | 'amber' | 'red' | 'green' | 'blue' | 'muted'

interface BadgeProps {
  variant?: Variant
  size?: 'sm' | 'md'
  children: React.ReactNode
  className?: string
}

const variants: Record<Variant, string> = {
  default: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  amber:   'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  red:     'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  green:   'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  blue:    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  muted:   'bg-neutral-50 text-neutral-400 dark:bg-neutral-900 dark:text-neutral-500',
}

const sizes = {
  sm: 'text-[10px] px-1.5 py-0 rounded',
  md: 'text-xs px-2 py-0.5 rounded-md',
}

export function Badge({ variant = 'default', size = 'md', children, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center font-medium', variants[variant], sizes[size], className)}>
      {children}
    </span>
  )
}
