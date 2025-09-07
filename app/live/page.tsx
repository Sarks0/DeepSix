'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DSNStream } from '@/components/live-data/DSNStream';
import { MissionStatistics } from '@/components/live-data/MissionStatistics';
import { useSpacecraftDelays } from '@/hooks/use-spacecraft';
import { SuspenseWrapper, SuspenseList } from '@/components/ui/suspense-wrapper';

export default function LiveDataPage() {
  const [selectedMission, setSelectedMission] = useState('perseverance');
  const { delays, isLoading } = useSpacecraftDelays();

  const missions = [
    { id: 'perseverance', name: 'Mars Perseverance', type: 'rover' as const },
    { id: 'curiosity', name: 'Mars Curiosity', type: 'rover' as const },
    { id: 'voyager-1', name: 'Voyager 1', type: 'probe' as const },
    { id: 'voyager-2', name: 'Voyager 2', type: 'probe' as const },
    { id: 'parker-solar-probe', name: 'Parker Solar Probe', type: 'solar' as const },
  ];

  const currentMission = missions.find((m) => m.id === selectedMission) || missions[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Live Mission Data
        </h1>
        <p className="text-gray-400">Real-time telemetry and mission status monitoring</p>
      </motion.div>

      {/* Mission Selector */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {missions.map((mission) => (
            <motion.button
              key={mission.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedMission(mission.id)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                selectedMission === mission.id
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-gray-900/50 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              {mission.name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Mission-specific status card */}
        <motion.div
          key={`mission-status-${selectedMission}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4"
        >
          <h3 className="text-lg font-semibold mb-4 text-white">{currentMission.name} Status</h3>
          <div className="space-y-3">
            {currentMission.type === 'rover' && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-400">Mission Type</span>
                  <span className="text-white">Mars Rover</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Location</span>
                  <span className="text-white">
                    {selectedMission === 'perseverance' ? 'Jezero Crater' : 'Gale Crater'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className="text-green-400">Active</span>
                </div>
              </>
            )}
            {currentMission.type === 'probe' && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-400">Mission Type</span>
                  <span className="text-white">Deep Space Probe</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Distance from Earth</span>
                  <span className="text-white">
                    {delays.find((d) => d.id === selectedMission)?.distanceAU || 'N/A'} AU
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Communication Delay</span>
                  <span className="text-blue-400">
                    {delays.find((d) => d.id === selectedMission)?.oneWay || 'N/A'}
                  </span>
                </div>
              </>
            )}
            {currentMission.type === 'solar' && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-400">Mission Type</span>
                  <span className="text-white">Solar Research</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Target</span>
                  <span className="text-white">Sun&apos;s Corona</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className="text-green-400">Active</span>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Communication Delays */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4"
        >
          <h3 className="text-lg font-semibold mb-4 text-white">Communication Delays</h3>
          <div className="space-y-3">
            {!isLoading && delays ? (
              delays.map((spacecraft, index) => (
                <motion.div
                  key={spacecraft.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex justify-between items-center p-2 rounded bg-gray-900/30 border border-gray-800"
                >
                  <span className="text-sm text-gray-400">{spacecraft.name}</span>
                  <div className="text-right">
                    <span className="font-mono text-sm text-blue-400">
                      {spacecraft.oneWay || 'N/A'}
                    </span>
                    <div className="text-xs text-gray-500">{spacecraft.distanceAU} AU</div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-800 rounded" />
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Deep Space Network Stream - Mission Filtered - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 xl:col-span-3"
        >
          <SuspenseList count={5} hasAvatar={false}>
            <DSNStream missionFilter={selectedMission} />
          </SuspenseList>
        </motion.div>
      </div>

      {/* Mission Statistics - Real Data */}
      <div className="mt-6">
        <SuspenseWrapper fallback="card" fallbackProps={{ hasImage: false, lines: 4 }}>
          <MissionStatistics />
        </SuspenseWrapper>
      </div>
    </div>
  );
}
