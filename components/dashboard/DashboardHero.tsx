'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { StatCard } from '@/components/ui/StatCard';
import {
  RocketLaunchIcon,
  GlobeAltIcon,
  SignalIcon
} from '@heroicons/react/24/outline';

interface DashboardHeroProps {
  activeMissions: number;
  totalDistance?: number;
  dataStatus: {
    online: boolean;
    lastUpdate: string;
  };
}

export function DashboardHero({ activeMissions, totalDistance, dataStatus }: DashboardHeroProps) {
  return (
    <section className="mb-12">
      {/* Hero Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Mission Control
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Track humanity&apos;s journey into space in real-time
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Explore active missions, from Mars rovers to deep space probes
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard
          icon={<RocketLaunchIcon className="w-6 h-6" />}
          label="Active Missions"
          value={activeMissions}
          helpText="Spacecraft currently operating and transmitting data"
          color="cyan"
          delay={0.1}
        />

        <StatCard
          icon={<GlobeAltIcon className="w-6 h-6" />}
          label="Total Distance"
          value={totalDistance ? `${totalDistance.toFixed(1)}` : '—'}
          unit={totalDistance ? 'billion km' : ''}
          helpText="Combined distance traveled by all active missions"
          color="purple"
          delay={0.2}
        />

        <StatCard
          icon={<SignalIcon className="w-6 h-6" />}
          label="Data Status"
          value={dataStatus.online ? 'Live' : 'Offline'}
          helpText={`Last updated: ${dataStatus.lastUpdate}`}
          color={dataStatus.online ? 'green' : 'gray'}
          delay={0.3}
        />
      </div>

      {/* Quick Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap justify-center gap-4"
      >
        <Link
          href="#missions"
          className="px-6 py-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 text-cyan-400 rounded-lg border border-cyan-500/30 transition-all font-medium"
        >
          Browse Missions
        </Link>
        <Link
          href="/asteroids"
          className="px-6 py-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 text-purple-400 rounded-lg border border-purple-500/30 transition-all font-medium"
        >
          Asteroid Tracking
        </Link>
      </motion.div>

      {/* Beginner-friendly explainer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 p-4 bg-cyan-900/10 border border-cyan-800/30 rounded-lg"
      >
        <p className="text-sm text-cyan-200/80 text-center">
          <span className="font-semibold">New to space missions?</span> Start by exploring the Featured Mission below,
          or browse missions by category to discover spacecraft exploring our solar system.
        </p>
      </motion.div>
    </section>
  );
}
