import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="font-display text-8xl font-black text-neutral-200 dark:text-neutral-800 tracking-tight">404</div>
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-neutral-700 dark:text-neutral-300 mb-2">
          Page Not Found
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">This sector of the galaxy remains unmapped.</p>
      </div>
      <Link to="/">
        <Button variant="primary">Return to Safety</Button>
      </Link>
    </div>
  )
}
