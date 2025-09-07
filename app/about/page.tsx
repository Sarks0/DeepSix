'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AboutPage() {
  const techStack = [
    { name: 'Next.js 14', description: 'React framework with App Router' },
    { name: 'TypeScript', description: 'Type-safe development' },
    { name: 'Three.js / React Three Fiber', description: '3D visualization' },
    { name: 'Tailwind CSS', description: 'Utility-first styling' },
    { name: 'Framer Motion', description: 'Smooth animations' },
    { name: 'NASA APIs', description: 'Real-time space data' },
    { name: 'Docker', description: 'Containerized deployment' },
  ];

  const dataSources = [
    { name: 'Deep Space Network', description: 'Real-time spacecraft communications' },
    { name: 'Mars Rover Photos API', description: 'Latest images from Mars' },
    { name: 'InSight Weather API', description: 'Historical Mars weather data' },
    { name: 'JPL Horizons', description: 'Spacecraft ephemeris data' },
    { name: 'ISS Location API', description: 'International Space Station tracking' },
  ];

  const features = [
    {
      title: 'Real-Time Tracking',
      description:
        'Monitor active NASA missions with live telemetry data from the Deep Space Network',
    },
    {
      title: '3D Solar System',
      description: 'Interactive visualization of spacecraft positions and planetary orbits',
    },
    {
      title: 'Mars Exploration',
      description: 'Browse thousands of photos from Perseverance and Curiosity rovers',
    },
    {
      title: 'Mission Archives',
      description: "Explore both active and completed missions, including InSight's achievements",
    },
    {
      title: 'Communication Delays',
      description: 'Calculate signal travel times to spacecraft billions of kilometers away',
    },
    {
      title: 'Educational Resource',
      description: 'Learn about space exploration through real data and visualizations',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          About DeepSix
        </h1>
        <p className="text-xl text-gray-400">Navigate the Deepest Frontiers</p>
      </motion.div>

      {/* Mission Statement */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          DeepSix is a real-time mission control dashboard that brings NASA&apos;s deep space
          exploration directly to your screen. We aggregate data from multiple NASA APIs and space
          agencies to provide an comprehensive view of humanity&apos;s journey into the cosmos.
        </p>
        <p className="text-gray-300 leading-relaxed">
          From the dusty plains of Mars to the edge of interstellar space, DeepSix tracks active
          missions, visualizes spacecraft positions, and presents scientific data in an accessible,
          engaging format. Whether you&apos;re a space enthusiast, educator, or researcher, DeepSix
          offers a window into ongoing space exploration.
        </p>
      </motion.section>

      {/* Features Grid */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold mb-6">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-gray-900/50 backdrop-blur rounded-lg p-4 border border-gray-800"
            >
              <h3 className="font-semibold text-blue-400 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Data Sources */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold mb-6">Data Sources</h2>
        <p className="text-gray-300 mb-4">
          All data displayed on DeepSix comes directly from official NASA and space agency sources:
        </p>
        <div className="bg-gray-900/50 backdrop-blur rounded-lg border border-gray-800 p-6">
          <ul className="space-y-3">
            {dataSources.map((source) => (
              <li key={source.name} className="flex items-start">
                <span className="text-green-400 mr-3 mt-1">•</span>
                <div>
                  <span className="font-semibold text-white">{source.name}</span>
                  <span className="text-gray-400 ml-2">- {source.description}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </motion.section>

      {/* Technology Stack */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold mb-6">Technology Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="bg-gray-900/50 backdrop-blur rounded-lg p-3 border border-gray-800"
            >
              <p className="font-semibold text-sm text-white">{tech.name}</p>
              <p className="text-xs text-gray-500">{tech.description}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Why DeepSix */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold mb-4">Why &quot;DeepSix&quot;?</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          The name &quot;DeepSix&quot; carries multiple meanings that reflect our mission. In naval
          terminology, &quot;deep six&quot; refers to the deepest fathoms of the ocean - a fitting
          metaphor for exploring the deepest reaches of space. The &quot;six&quot; also represents
          the six degrees of freedom in spacecraft navigation (x, y, z, pitch, yaw, roll), essential
          for tracking objects in three-dimensional space.
        </p>
        <p className="text-gray-300 leading-relaxed">
          Just as maritime explorers once charted unknown waters, today&apos;s space missions
          venture into the cosmic deep, and DeepSix serves as your portal to follow their journey.
        </p>
      </motion.section>

      {/* Credits */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold mb-4">Credits & Acknowledgments</h2>
        <div className="bg-gray-900/50 backdrop-blur rounded-lg border border-gray-800 p-6">
          <p className="text-gray-300 mb-4">
            DeepSix is made possible by the open data initiatives of:
          </p>
          <ul className="space-y-2 text-gray-400">
            <li>• NASA (National Aeronautics and Space Administration)</li>
            <li>• JPL (Jet Propulsion Laboratory)</li>
            <li>• DSN (Deep Space Network)</li>
            <li>• The Mars Exploration Program</li>
            <li>• The Planetary Data System</li>
          </ul>
          <p className="text-sm text-gray-500 mt-4">
            This project is not affiliated with NASA or any government agency. All data is publicly
            available through official APIs.
          </p>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-center py-8"
      >
        <p className="text-gray-400 mb-6">Ready to explore the cosmos?</p>
        <Link
          href="/missions"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-colors"
        >
          View Active Missions
          <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </Link>
      </motion.div>
    </div>
  );
}
