import { cn } from '@/lib/utils'

type Variant = 'default' | 'gold' | 'blood' | 'success' | 'warning' | 'muted'

interface BadgeProps {
  variant?: Variant
  size?: 'sm' | 'md'
  children: React.ReactNode
  className?: string
}

const variants: Record<Variant, string> = {
  default: 'bg-steel-700 text-steel-200 border-steel-600',
  gold: 'bg-gold-900/60 text-gold-300 border-gold-700',
  blood: 'bg-blood-900/60 text-blood-300 border-blood-700',
  success: 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
  warning: 'bg-amber-900/60 text-amber-300 border-amber-700',
  muted: 'bg-void-800 text-steel-400 border-void-700',
}

const sizes = {
  sm: 'text-[10px] px-1.5 py-0.5 rounded-[2px]',
  md: 'text-xs px-2 py-0.5 rounded-[3px]',
}

export function Badge({ variant = 'default', size = 'md', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-mono font-medium tracking-wide border uppercase',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </span>
  )
}
