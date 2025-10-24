'use client';

import { motion } from 'framer-motion';
import { SolTracker } from '@/components/dashboard/SolTracker';
import { MissionTracker } from '@/components/dashboard/MissionTracker';

// Data source badge component
function DataSourceBadge({ source, className = "" }: { source: string; className?: string }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-800/50 border border-gray-700/50 text-gray-300 ${className}`}>
      <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse"></span>
      {source}
    </span>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen px-4 md:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          DeepSix
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Real-time mission control for humanity&apos;s journey into the deepest reaches of space
        </p>
      </motion.div>

      {/* Sol Tracking Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-12"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-2xl font-bold mb-2 md:mb-0">Mars Mission Sol Tracking</h2>
          <DataSourceBadge source="NASA Mars Rover API" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <SolTracker rover="perseverance" variant="detailed" />
          <SolTracker rover="curiosity" variant="detailed" />
        </div>
      </motion.div>

      {/* Deep Space Missions Tracking Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-12"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-2xl font-bold mb-2 md:mb-0">Deep Space Mission Tracking</h2>
          <DataSourceBadge source="NASA JPL Horizons System" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <MissionTracker mission="voyager1" variant="detailed" />
          <MissionTracker mission="voyager2" variant="detailed" />
          <MissionTracker mission="parker" variant="detailed" />
          <MissionTracker mission="newhorizons" variant="detailed" />
          <MissionTracker mission="juno" variant="detailed" />
          <MissionTracker mission="jwst" variant="detailed" />
        </div>
      </motion.div>

      {/* Mars System Missions Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-12"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-2xl font-bold mb-2 md:mb-0">Mars System Missions</h2>
          <DataSourceBadge source="NASA JPL Horizons System" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <MissionTracker mission="mro" variant="detailed" />
          <MissionTracker mission="maven" variant="detailed" />
          <MissionTracker mission="odyssey" variant="detailed" />
        </div>
      </motion.div>

      {/* En Route Missions Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-12"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-2xl font-bold mb-2 md:mb-0">Missions En Route</h2>
          <DataSourceBadge source="NASA JPL Horizons System" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <MissionTracker mission="europaclipper" variant="detailed" />
          <MissionTracker mission="lucy" variant="detailed" />
          <MissionTracker mission="psyche" variant="detailed" />
          <MissionTracker mission="osirisapex" variant="detailed" />
        </div>
      </motion.div>

    </div>
  );
}