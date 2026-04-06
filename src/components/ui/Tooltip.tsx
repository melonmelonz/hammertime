import { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  placement?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function Tooltip({ content, children, placement = 'top', className }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => setVisible(true), 300)
  }, [])

  const hide = useCallback(() => {
    if (timerRef.current !== undefined) clearTimeout(timerRef.current)
    setVisible(false)
  }, [])

  const placementClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <span
          className={cn(
            'absolute z-50 pointer-events-none',
            'px-2 py-1 rounded-md text-xs text-neutral-100 bg-neutral-800 dark:bg-neutral-700 border border-neutral-700',
            'whitespace-nowrap shadow-lg',
            'animate-fade-in',
            placementClasses[placement],
            className,
          )}
        >
          {content}
        </span>
      )}
    </span>
  )
}
