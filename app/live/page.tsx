'use client';

import { motion } from 'framer-motion';
import { MissionStatistics } from '@/components/live-data/MissionStatistics';
import { useSpacecraftDelays } from '@/hooks/use-spacecraft';
import { SuspenseWrapper } from '@/components/ui/suspense-wrapper';
import Link from 'next/link';

export default function LiveDataPage() {
  const { delays, isLoading } = useSpacecraftDelays();

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Mission Control Overview
        </h1>
        <p className="text-gray-400">Cross-mission communication status and system metrics</p>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/dsn" className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-400 hover:text-blue-300 transition-colors">
            🛰️ Deep Space Network
          </Link>
          <Link href="/missions" className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-purple-400 hover:text-purple-300 transition-colors">
            🚀 Mission Details
          </Link>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Communication Delays */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6"
        >
          <h3 className="text-xl font-semibold mb-4 text-white">Communication Delays</h3>
          <p className="text-sm text-gray-400 mb-4">Real-time signal travel times to active spacecraft</p>
          <div className="space-y-3">
            {!isLoading && delays ? (
              delays.map((spacecraft, index) => (
                <motion.div
                  key={spacecraft.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex justify-between items-center p-3 rounded-lg bg-gray-900/30 border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-300">{spacecraft.name}</span>
                  <div className="text-right">
                    <span className="font-mono text-sm text-blue-400 font-semibold">
                      {spacecraft.oneWay || 'N/A'}
                    </span>
                    <div className="text-xs text-gray-500">{spacecraft.distanceAU} AU</div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-gray-800 rounded" />
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Mission Statistics Placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6"
        >
          <h3 className="text-xl font-semibold mb-4 text-white">System Overview</h3>
          <p className="text-sm text-gray-400 mb-4">Mission control metrics and telemetry</p>
          <div className="h-64">
            <SuspenseWrapper fallback="card" fallbackProps={{ hasImage: false, lines: 4 }}>
              <MissionStatistics />
            </SuspenseWrapper>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
