import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'xs' | 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
  iconRight?: React.ReactNode
}

const variants: Record<Variant, string> = {
  primary: [
    'bg-red-600 text-white font-semibold',
    'hover:bg-red-700 active:bg-red-800',
    'dark:bg-red-600 dark:hover:bg-red-500',
    'shadow-sm',
  ].join(' '),

  secondary: [
    'bg-neutral-100 text-neutral-800 font-medium',
    'hover:bg-neutral-200 active:bg-neutral-300',
    'dark:bg-neutral-800 dark:text-neutral-100',
    'dark:hover:bg-neutral-700 dark:active:bg-neutral-600',
  ].join(' '),

  ghost: [
    'bg-transparent text-neutral-600 font-medium',
    'hover:bg-neutral-100 hover:text-neutral-900',
    'dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
  ].join(' '),

  danger: [
    'bg-red-600 text-white font-medium',
    'hover:bg-red-700 active:bg-red-800',
  ].join(' '),

  outline: [
    'bg-transparent border font-medium',
    'border-neutral-300 text-neutral-700',
    'hover:bg-neutral-50 hover:border-neutral-400',
    'dark:border-neutral-600 dark:text-neutral-300',
    'dark:hover:bg-neutral-800 dark:hover:border-neutral-500',
  ].join(' '),
}

const sizes: Record<Size, string> = {
  xs: 'h-6 px-2 text-xs gap-1 rounded',
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-md',
  md: 'h-9 px-4 text-sm gap-2 rounded-md',
  lg: 'h-11 px-5 text-base gap-2 rounded-lg',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', loading, icon, iconRight, className, children, disabled, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center select-none transition-colors duration-150 cursor-pointer',
        'disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed',
        'focus-visible:outline-2 focus-visible:outline-red-500 focus-visible:outline-offset-2',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading
        ? <span className="size-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        : icon ? <span className="size-4 shrink-0 flex items-center justify-center">{icon}</span>
        : null}
      {children && <span>{children}</span>}
      {iconRight && !loading && <span className="size-4 shrink-0 flex items-center justify-center">{iconRight}</span>}
    </button>
  )
})
