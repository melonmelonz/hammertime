import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold'
type Size = 'xs' | 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
  iconRight?: React.ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary: `
    bg-gold-500 text-void-950 font-semibold
    hover:bg-gold-400 active:bg-gold-600
    border border-gold-400
    shadow-[0_0_12px_rgba(192,138,34,0.3)]
    hover:shadow-[0_0_20px_rgba(192,138,34,0.5)]
    transition-all
  `,
  secondary: `
    bg-steel-800 text-steel-100 font-medium
    hover:bg-steel-700 active:bg-steel-900
    border border-steel-600
    transition-all
  `,
  ghost: `
    bg-transparent text-steel-300 font-medium
    hover:bg-steel-800 hover:text-steel-100
    border border-transparent hover:border-steel-600
    transition-all
  `,
  danger: `
    bg-blood-700 text-steel-50 font-medium
    hover:bg-blood-600 active:bg-blood-800
    border border-blood-600
    transition-all
  `,
  gold: `
    bg-transparent text-gold-400 font-semibold
    hover:bg-gold-900/30 active:bg-gold-900/50
    border border-gold-700 hover:border-gold-500
    transition-all
  `,
}

const sizeClasses: Record<Size, string> = {
  xs: 'h-6 px-2 text-xs gap-1 rounded-[2px]',
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-[3px]',
  md: 'h-9 px-4 text-sm gap-2 rounded-[4px]',
  lg: 'h-11 px-6 text-base gap-2 rounded-[4px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', loading, icon, iconRight, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-body select-none',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'focus-visible:outline-2 focus-visible:outline-gold-500 focus-visible:outline-offset-2',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <span className="size-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="shrink-0 size-4">{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
      {iconRight && !loading && <span className="shrink-0 size-4">{iconRight}</span>}
    </button>
  )
})
