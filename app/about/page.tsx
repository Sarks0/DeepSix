'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AboutPage() {
  const techStack = [
    { name: 'Next.js 15', description: 'React framework with App Router' },
    { name: 'TypeScript', description: 'Type-safe development' },
    { name: 'Tailwind CSS', description: 'Utility-first styling' },
    { name: 'Framer Motion', description: 'Smooth animations' },
    { name: 'NASA APIs', description: 'Real-time space data' },
    { name: 'Vercel', description: 'Cloud deployment platform' },
    { name: 'Zustand', description: 'State management' },
    { name: 'IndexedDB', description: 'Client-side data caching' },
  ];

  const dataSources = [
    { name: 'Mars Rover Photos API', description: 'Latest images from Mars rovers' },
    { name: 'Deep Space Network', description: 'Real-time spacecraft communications' },
    { name: 'NASA Image Library', description: 'Historical mission photos and media' },
    { name: 'Mars Weather Service', description: 'Current conditions on Mars' },
    { name: 'Spacecraft Tracking', description: 'Position and status data' },
  ];

  const features = [
    {
      title: 'Mars Rover Gallery',
      description: 'Browse thousands of photos from Perseverance, Curiosity, and Opportunity rovers',
    },
    {
      title: 'Offline Image Caching',
      description: 'Automatic storage of rover photos for seamless offline browsing',
    },
    {
      title: 'Mission Dashboard',
      description: 'Track active and completed NASA missions with real-time status updates',
    },
    {
      title: 'Live Data Feeds',
      description: 'Real-time telemetry and communication data from Deep Space Network',
    },
    {
      title: 'Mission Archives',
      description: 'Explore historical missions including Spirit, Opportunity, and InSight',
    },
    {
      title: 'Responsive Design',
      description: 'Optimized experience across desktop, tablet, and mobile devices',
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
          DeepSix is a real-time NASA mission tracking dashboard that brings space exploration 
          directly to your screen. We aggregate data from multiple NASA APIs to provide a 
          comprehensive view of Mars exploration and deep space missions.
        </p>
        <p className="text-gray-300 leading-relaxed">
          From the dusty plains of Mars captured by rovers to tracking distant spacecraft, 
          DeepSix presents scientific data in an accessible, engaging format. Whether you&apos;re 
          a space enthusiast, educator, or researcher, DeepSix offers a window into ongoing 
          space exploration with a focus on Mars missions and their incredible discoveries.
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
          All data displayed on DeepSix comes directly from official NASA sources:
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

      {/* Current Missions */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold mb-4">Featured Missions</h2>
        <div className="grid gap-4">
          <div className="bg-gray-900/50 backdrop-blur rounded-lg border border-gray-800 p-4">
            <h3 className="font-semibold text-green-400 mb-2">Active Rovers</h3>
            <p className="text-sm text-gray-300">
              <span className="font-bold">Perseverance</span> - Exploring Jezero Crater since 2021<br/>
              <span className="font-bold">Curiosity</span> - Investigating Gale Crater since 2012
            </p>
          </div>
          <div className="bg-gray-900/50 backdrop-blur rounded-lg border border-gray-800 p-4">
            <h3 className="font-semibold text-yellow-400 mb-2">Historical Missions</h3>
            <p className="text-sm text-gray-300">
              <span className="font-bold">Opportunity</span> - 15 years of exploration (2004-2018)<br/>
              <span className="font-bold">Spirit</span> - Twin rover mission (2004-2010)<br/>
              <span className="font-bold">InSight</span> - Mars seismology studies (2018-2022)
            </p>
          </div>
        </div>
      </motion.section>

      {/* Why DeepSix */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
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
        transition={{ delay: 0.7 }}
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
            <li>• Mars Exploration Program</li>
            <li>• Deep Space Network</li>
            <li>• NASA Open Data Portal</li>
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
        transition={{ delay: 0.8 }}
        className="text-center py-8"
      >
        <p className="text-gray-400 mb-6">Ready to explore Mars?</p>
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