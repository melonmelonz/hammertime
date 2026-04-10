import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShieldCheckIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  DevicePhoneMobileIcon,
  CloudArrowUpIcon,
  BoltIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  delay?: number
}

function FeatureCard({ icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.35 }}
      className={cn(
        'p-5 rounded-xl border',
        'bg-white dark:bg-neutral-900/80',
        'border-neutral-200 dark:border-neutral-800',
        'hover:border-red-300 dark:hover:border-red-800/70',
        'hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-red-950/40',
        'transition-all duration-200',
      )}
    >
      <div className="flex items-start gap-3.5 mb-3">
        <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40 text-red-600 dark:text-red-400 shrink-0">
          <span className="block size-5">{icon}</span>
        </div>
        <h3 className="font-display text-sm font-bold tracking-wide uppercase text-neutral-900 dark:text-neutral-100 mt-1.5">
          {title}
        </h3>
      </div>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{description}</p>
    </motion.div>
  )
}

const FEATURES: FeatureCardProps[] = [
  { icon: <BoltIcon />, title: 'Live Validation', description: 'Real-time points tracking and constraint checking as you build. Never accidentally submit an illegal list.' },
  { icon: <ArrowDownTrayIcon />, title: 'Import Rosters', description: 'Fully compatible with BattleScribe .ros and .rosz files. Bring your existing lists over instantly.' },
  { icon: <ArrowUpTrayIcon />, title: 'Export & Share', description: 'Export to BattleScribe format, copy as plain text, or share a link. Works with any TO system.' },
  { icon: <CloudArrowUpIcon />, title: 'Community Data', description: 'Powered by BSData — community-maintained, always up to date with the latest FAQs and erratas.' },
  { icon: <DevicePhoneMobileIcon />, title: 'Mobile Apps', description: 'iOS and Android apps coming soon. Your rosters sync seamlessly across all your devices.' },
  { icon: <ShieldCheckIcon />, title: 'Game Tracker', description: 'Track your 40k games round-by-round. Score objectives, secondaries, and CP live at the table.' },
]

export function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-white dark:bg-neutral-950">
        {/* Diamond grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-15 dark:opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 1 L39 20 L20 39 L1 20 Z' fill='none' stroke='%23dc2626' stroke-width='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px',
          }}
        />
        {/* Fade overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white via-white/60 to-white dark:from-neutral-950 dark:via-neutral-950/60 dark:to-neutral-950" />
        {/* Red glow blob — dark mode */}
        <div className="absolute inset-0 pointer-events-none hidden dark:block">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] rounded-full bg-red-600/8 blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
            </span>
            <Badge variant="red">Open Beta — Free Forever</Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="font-display text-6xl sm:text-8xl font-extrabold uppercase tracking-tight text-neutral-900 dark:text-neutral-50 mb-4"
            style={{ lineHeight: '0.9' }}
          >
            <span className="block">Build Your</span>
            <span className="block text-red-600 dark:text-red-500 text-glow-red">
              Perfect Army
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="mt-6 text-lg text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto"
          >
            The fastest, most intuitive Warhammer 40,000 army builder.
            Powered by community data. Free forever.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link to="/builder">
              <Button variant="primary" size="lg">Start Building</Button>
            </Link>
            <Link to="/rosters">
              <Button variant="secondary" size="lg">My Rosters</Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-2.5"
          >
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">Warhammer 40,000</span>
              <span className="text-neutral-400">10th Ed</span>
              <Badge variant="green" size="sm">Live</Badge>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="h-px bg-neutral-100 dark:bg-neutral-800/60" />

      {/* Features */}
      <section className="bg-neutral-50 dark:bg-[#0b0b0b]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-wide text-neutral-900 dark:text-neutral-100 mb-3">
              Everything You Need
            </h2>
            <p className="text-neutral-500 max-w-lg mx-auto">
              Built for competitive players and casual hobbyists alike. No account required. No ads.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feat, i) => (
              <FeatureCard key={feat.title} {...feat} delay={i * 0.05} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-red-900/20 dark:border-red-900/30 bg-neutral-50 dark:bg-neutral-950">
        {/* Red accent line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-red-600/60 to-transparent" />
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none hidden dark:block">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-red-600/6 blur-[100px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-5xl sm:text-7xl font-extrabold uppercase tracking-wide text-neutral-900 dark:text-neutral-50 mb-2 leading-none">
              Blood for the
            </h2>
            <h2 className="font-display text-5xl sm:text-7xl font-extrabold uppercase tracking-wide text-red-600 dark:text-red-500 mb-10 leading-none text-glow-red">
              Blood God
            </h2>
            <Link to="/builder">
              <Button variant="primary" size="lg">Open the Builder</Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
