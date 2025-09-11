'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { RoverIcon, ProbeIcon, SolarIcon, SatelliteIcon } from '@/components/icons/MissionIcons';

const missions = [
  {
    id: 'perseverance',
    name: 'Mars Perseverance',
    description: 'Exploring Jezero Crater for signs of ancient life',
    status: 'Active',
    type: 'Mars Rover',
    icon: RoverIcon,
    color: 'from-red-500 to-orange-600',
  },
  {
    id: 'curiosity',
    name: 'Mars Curiosity',
    description: 'Analyzing Gale Crater geology and climate',
    status: 'Active',
    type: 'Mars Rover',
    icon: RoverIcon,
    color: 'from-orange-500 to-red-600',
  },
  {
    id: 'insight',
    name: 'Mars InSight',
    description: 'Studied Mars&apos; deep interior and seismic activity',
    status: 'Ended',
    type: 'Mars Lander',
    icon: SatelliteIcon,
    color: 'from-red-600 to-gray-600',
    endDate: 'Dec 15, 2022',
  },
  {
    id: 'voyager-1',
    name: 'Voyager 1',
    description: 'Humanity&apos;s furthest spacecraft in interstellar space',
    status: 'Active',
    type: 'Deep Space',
    icon: ProbeIcon,
    color: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'voyager-2',
    name: 'Voyager 2',
    description: 'Grand Tour veteran exploring interstellar space',
    status: 'Active',
    type: 'Deep Space',
    icon: ProbeIcon,
    color: 'from-indigo-500 to-purple-600',
  },
  {
    id: 'parker-solar-probe',
    name: 'Parker Solar Probe',
    description: 'Touching the Sun&apos;s corona for the first time',
    status: 'Active',
    type: 'Solar',
    icon: SolarIcon,
    color: 'from-yellow-500 to-orange-600',
  },
  {
    id: 'mars-reconnaissance-orbiter',
    name: 'Mars Reconnaissance Orbiter',
    description: 'High-resolution imaging and surface analysis for 19+ years',
    status: 'Active',
    type: 'Mars Orbiter',
    icon: SatelliteIcon,
    color: 'from-red-500 to-orange-500',
  },
  {
    id: 'maven',
    name: 'MAVEN',
    description: 'Studying Mars atmospheric escape and climate evolution',
    status: 'Active',
    type: 'Mars Orbiter',
    icon: SatelliteIcon,
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'mars-odyssey',
    name: '2001 Mars Odyssey',
    description: 'Longest-serving Mars orbiter mapping water and climate',
    status: 'Active',
    type: 'Mars Orbiter',
    icon: SatelliteIcon,
    color: 'from-red-600 to-orange-600',
  },
  {
    id: 'james-webb-space-telescope',
    name: 'James Webb Space Telescope',
    description: 'Revolutionary infrared observatory exploring deep space',
    status: 'Active',
    type: 'Space Observatory',
    icon: SatelliteIcon,
    color: 'from-blue-500 to-purple-600',
  },
];

export default function MissionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Active Missions
        </h1>
        <p className="text-gray-400 text-lg">
          Track NASA&apos;s ongoing exploration of our solar system and beyond
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {missions.map((mission, index) => (
          <motion.div
            key={mission.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={`/missions/${mission.id}`}>
              <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-blue-500 transition-all duration-300 cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${mission.color} p-0.5`}>
                    <div className="h-full w-full rounded-lg bg-gray-900/80 flex items-center justify-center">
                      <mission.icon className="text-white" size={24} />
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      mission.status === 'Active'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {mission.status}
                  </span>
                </div>

                <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                  {mission.name}
                </h2>
                <p className="text-gray-400 text-sm mb-3">{mission.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{mission.type}</span>
                  <span className="text-blue-400 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
