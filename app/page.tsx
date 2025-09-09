'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSpacecraftDelays } from '@/hooks/use-spacecraft';
import { RoverIcon, ProbeIcon, SolarIcon } from '@/components/icons/MissionIcons';
import { SolTracker } from '@/components/dashboard/SolTracker';
import { MissionTracker } from '@/components/dashboard/MissionTracker';

export default function Home() {
  const { delays, isLoading } = useSpacecraftDelays();
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          DeepSix
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-2">
          Navigate the Deepest Frontiers
        </p>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Real-time mission control for humanity&apos;s journey into the deepest reaches of space
        </p>
      </motion.div>

      {/* Sol Tracking Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Mars Mission Sol Tracking</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <SolTracker rover="perseverance" variant="detailed" />
          <SolTracker rover="curiosity" variant="detailed" />
        </div>
      </motion.div>

      {/* Deep Space Missions Tracking Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Deep Space Mission Tracking</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          <MissionTracker mission="voyager1" variant="detailed" />
          <MissionTracker mission="voyager2" variant="detailed" />
          <MissionTracker mission="parker" variant="detailed" />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6 hover:border-red-500 transition-all hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:bg-gray-900/70"
        >
          <div className="h-12 w-12 bg-gradient-to-br from-red-600/30 to-orange-600/30 rounded-lg flex items-center justify-center mb-4 border border-red-500/30">
            <RoverIcon className="text-red-400" size={28} />
          </div>
          <h2 className="text-xl font-semibold mb-2 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Mars Missions
          </h2>
          <p className="text-gray-400 mb-3">
            Follow Perseverance and Curiosity rovers exploring the Red Planet
          </p>
          <div className="space-y-2">
            <SolTracker rover="perseverance" variant="minimal" />
            <SolTracker rover="curiosity" variant="minimal" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6 hover:border-purple-500 transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:bg-gray-900/70"
        >
          <div className="h-12 w-12 bg-gradient-to-br from-purple-600/30 to-indigo-600/30 rounded-lg flex items-center justify-center mb-4 border border-purple-500/30">
            <ProbeIcon className="text-purple-400" size={28} />
          </div>
          <h2 className="text-xl font-semibold mb-2 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Voyager Probes
          </h2>
          <p className="text-gray-400 mb-3">
            The most distant human-made objects in interstellar space
          </p>
          <div className="space-y-2">
            <MissionTracker mission="voyager1" variant="minimal" />
            <MissionTracker mission="voyager2" variant="minimal" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6 hover:border-yellow-500 transition-all hover:shadow-[0_0_30px_rgba(250,204,21,0.3)] hover:bg-gray-900/70"
        >
          <div className="h-12 w-12 bg-gradient-to-br from-yellow-600/30 to-orange-600/30 rounded-lg flex items-center justify-center mb-4 border border-yellow-500/30">
            <SolarIcon className="text-yellow-400" size={28} />
          </div>
          <h2 className="text-xl font-semibold mb-2 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Parker Solar Probe
          </h2>
          <p className="text-gray-400 mb-3">
            Touching the Sun and studying our star&apos;s corona up close
          </p>
          <MissionTracker mission="parker" variant="minimal" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-gray-700 p-8"
      >
        <h2 className="text-2xl font-bold mb-4">Communication Delay Calculator</h2>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-pulse text-gray-400">Loading spacecraft data...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Mars</p>
              <p className="text-2xl font-mono font-bold text-orange-400">~14 min</p>
              <p className="text-xs text-gray-500">varies by position</p>
            </div>
            {delays.slice(0, 2).map((spacecraft) => (
              <div key={spacecraft.id} className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">{spacecraft.name}</p>
                <p className="text-2xl font-mono font-bold text-purple-400">
                  {spacecraft.oneWay || 'N/A'}
                </p>
                <p className="text-xs text-gray-500">{spacecraft.distanceAU} AU from Earth</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

    </div>
  );
}