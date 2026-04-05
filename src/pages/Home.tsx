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

interface FeatureProps {
  icon: React.ReactNode
  title: string
  description: string
  delay?: number
}

function Feature({ icon, title, description, delay = 0 }: FeatureProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className={cn(
        'p-5 rounded-[4px] border border-steel-800 bg-void-800/50',
        'hover:border-steel-600 transition-colors',
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-[3px] bg-gold-900/30 border border-gold-800/50 text-gold-500">
          <span className="block size-5">{icon}</span>
        </div>
        <h3 className="font-display text-base font-semibold tracking-wide uppercase text-steel-100">
          {title}
        </h3>
      </div>
      <p className="text-sm text-steel-400 leading-relaxed">{description}</p>
    </motion.div>
  )
}

const FEATURES: FeatureProps[] = [
  {
    icon: <BoltIcon />,
    title: 'Live Validation',
    description: 'Real-time points tracking and constraint checking as you build. Never accidentally submit an illegal list.',
  },
  {
    icon: <ArrowDownTrayIcon />,
    title: 'Import Rosters',
    description: 'Fully compatible with BattleScribe .ros and .rosz files. Bring your existing lists over instantly.',
  },
  {
    icon: <ArrowUpTrayIcon />,
    title: 'Export & Share',
    description: 'Export to BattleScribe format, copy as plain text, or share a link. Works with any TO system.',
  },
  {
    icon: <CloudArrowUpIcon />,
    title: 'Community Data',
    description: 'Powered by BSData — community-maintained, always up to date with the latest FAQs and erratas.',
  },
  {
    icon: <DevicePhoneMobileIcon />,
    title: 'Mobile Apps',
    description: 'iOS and Android apps coming soon. Your rosters sync seamlessly across all your devices.',
  },
  {
    icon: <ShieldCheckIcon />,
    title: 'All Game Modes',
    description: 'Matched Play, Crusade, Narrative — all point limits and detachment rules supported.',
  },
]

const SUPPORTED_SYSTEMS = [
  { name: 'Warhammer 40,000', edition: '10th Ed', status: 'Live' },
  { name: 'Kill Team', edition: '2024', status: 'Live' },
  { name: 'Horus Heresy', edition: 'Age of Darkness', status: 'Beta' },
]

export function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold-900/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-blood-900/10 rounded-full blur-[80px]" />
        </div>

        {/* Hexagon grid decoration */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hex-grid" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
                <polygon points="30,2 58,16 58,36 30,50 2,36 2,16" fill="none" stroke="#c08a22" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hex-grid)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500" />
            </span>
            <Badge variant="gold">Open Beta — Free Forever</Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="font-display text-5xl sm:text-7xl font-extrabold uppercase tracking-tight text-steel-50 mb-4"
            style={{ lineHeight: '0.95' }}
          >
            <span className="block">Build Your</span>
            <span className="block bg-gradient-to-r from-gold-400 via-gold-300 to-gold-500 bg-clip-text text-transparent">
              Perfect Army
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="mt-6 text-lg text-steel-400 max-w-xl mx-auto"
          >
            The fastest, most intuitive Warhammer 40,000 army builder.
            Powered by community data. Works on any device.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link to="/builder">
              <Button variant="primary" size="lg">
                Start Building
              </Button>
            </Link>
            <Link to="/rosters">
              <Button variant="secondary" size="lg">
                My Rosters
              </Button>
            </Link>
          </motion.div>

          {/* Supported systems */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-3"
          >
            {SUPPORTED_SYSTEMS.map((sys) => (
              <div
                key={sys.name}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-steel-800 bg-void-800/60 text-xs text-steel-400"
              >
                <span className="font-semibold text-steel-300">{sys.name}</span>
                <span className="text-steel-600">{sys.edition}</span>
                <Badge variant={sys.status === 'Live' ? 'success' : 'warning'} size="sm">
                  {sys.status}
                </Badge>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="sep-ornament mx-6 sm:mx-12">
        <svg viewBox="0 0 24 24" className="size-5 text-gold-700" fill="currentColor">
          <polygon points="12,2 22,7 22,17 12,22 2,17 2,7" />
        </svg>
      </div>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-wide text-steel-100 mb-3">
            Everything You Need
          </h2>
          <p className="text-steel-400 max-w-lg mx-auto">
            Built for competitive players and casual hobbyists alike.
            No account required. No ads. No paywalls.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feat, i) => (
            <Feature key={feat.title} {...feat} delay={i * 0.05} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-steel-800 bg-void-900/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold uppercase tracking-wide text-steel-50 mb-4">
              Ready for War?
            </h2>
            <p className="text-steel-400 mb-8">
              Join thousands of commanders building their forces on Hammertime.
            </p>
            <Link to="/builder">
              <Button variant="primary" size="lg">
                Open the Builder
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
