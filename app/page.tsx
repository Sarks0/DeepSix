'use client';

import { motion } from 'framer-motion';
import { SolTracker } from '@/components/dashboard/SolTracker';
import { MissionTracker } from '@/components/dashboard/MissionTracker';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
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
        className="mb-8"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Mars System Missions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
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
        className="mb-8"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Missions En Route</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          <MissionTracker mission="europaclipper" variant="detailed" />
          <MissionTracker mission="lucy" variant="detailed" />
          <MissionTracker mission="psyche" variant="detailed" />
          <MissionTracker mission="osirisapex" variant="detailed" />
        </div>
      </motion.div>

    </div>
  );
}