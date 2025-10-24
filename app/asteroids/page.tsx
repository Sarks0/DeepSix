import { Metadata } from 'next';
import { SentryMonitor } from '@/components/asteroids/SentryMonitor';
import { NHATSList } from '@/components/asteroids/NHATSList';
import { CloseApproachFeed } from '@/components/asteroids/CloseApproachCard';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Asteroid Tracking - Planetary Defense & Mission Monitoring | DeepSix',
  description: 'Real-time asteroid tracking, impact monitoring with NASA Sentry, mission-accessible targets, and close approaches. Comprehensive planetary defense data from NASA and JPL.',
};

export default function AsteroidsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black px-4 md:px-6 lg:px-8 py-12">
      <div className="w-full mx-auto">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Asteroid Tracking & <span className="text-cyan-400">Planetary Defense</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-6">
            Real-time monitoring of near-Earth asteroids, impact risk assessment, and mission accessibility data from NASA and JPL
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center px-4 py-2 bg-gray-800/50 rounded-full border border-gray-700/50">
              <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
              <span className="text-gray-300">Sentry Impact Monitoring</span>
            </div>
            <div className="flex items-center px-4 py-2 bg-gray-800/50 rounded-full border border-gray-700/50">
              <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></span>
              <span className="text-gray-300">Mission-Accessible Targets</span>
            </div>
            <div className="flex items-center px-4 py-2 bg-gray-800/50 rounded-full border border-gray-700/50">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
              <span className="text-gray-300">Close Approach Tracking</span>
            </div>
          </div>
        </div>

        {/* Sentry Impact Monitoring - Primary Feature */}
        <section className="mb-12">
          <SentryMonitor />
        </section>

        {/* NHATS Mission-Accessible Asteroids */}
        <section className="mb-12">
          <NHATSList />
        </section>

        {/* Close Approaches This Week */}
        <section className="mb-12">
          <CloseApproachFeed />
        </section>

        {/* Our Asteroid Missions Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-sm rounded-lg border border-purple-800/50 p-8">
            <h2 className="text-3xl font-bold text-white mb-4">DeepSix Asteroid Missions</h2>
            <p className="text-gray-300 mb-6">
              DeepSix is actively tracking 3 NASA missions to asteroids, exploring their composition, origins,
              and potential as resources for future human exploration.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Lucy Mission */}
              <Link
                href="/missions/lucy"
                className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50 hover:border-purple-500 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">Lucy</h3>
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/50">
                    En Route
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Exploring Jupiter's Trojan asteroids - ancient remnants from the solar system's formation
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div>Target: Trojan Asteroids</div>
                  <div>Arrival: 2027-2033</div>
                  <div>Status: Active</div>
                </div>
              </Link>

              {/* Psyche Mission */}
              <Link
                href="/missions/psyche"
                className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50 hover:border-purple-500 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">Psyche</h3>
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/50">
                    En Route
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Journey to a metallic asteroid - possibly the exposed core of an early planet
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div>Target: Metallic Asteroid</div>
                  <div>Arrival: August 2029</div>
                  <div>Status: Active</div>
                </div>
              </Link>

              {/* OSIRIS-APEX Mission */}
              <Link
                href="/missions/osiris-apex"
                className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50 hover:border-purple-500 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">OSIRIS-APEX</h3>
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/50">
                    En Route
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Studying asteroid Apophis during its historic 2029 close approach to Earth
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div>Target: Asteroid Apophis</div>
                  <div>Arrival: April 2029</div>
                  <div>Status: Active</div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Educational Resources */}
        <section className="mb-12">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">About Asteroid Monitoring</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Why Track Asteroids?</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Asteroid tracking serves multiple purposes:
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-2 mt-1.5"></span>
                    <span><strong>Planetary Defense:</strong> Identify potential Earth impact threats decades in advance</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-2 mt-1.5"></span>
                    <span><strong>Scientific Research:</strong> Study solar system formation and evolution</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-2 mt-1.5"></span>
                    <span><strong>Resource Potential:</strong> Identify accessible targets for future mining and exploration</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-2 mt-1.5"></span>
                    <span><strong>Mission Planning:</strong> Enable human missions beyond Earth</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-orange-400 mb-2">Understanding the Scales</h3>
                <div className="space-y-3 text-sm">
                  <div className="bg-gray-800/50 rounded p-3 border border-gray-700/50">
                    <h4 className="font-semibold text-white mb-1">Torino Scale (0-10)</h4>
                    <p className="text-gray-400">
                      Public communication scale for impact hazard. Most asteroids rate 0 (no hazard) as
                      observations refine their orbits and eliminate impact possibilities.
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded p-3 border border-gray-700/50">
                    <h4 className="font-semibold text-white mb-1">Palermo Scale</h4>
                    <p className="text-gray-400">
                      Technical logarithmic scale comparing impact probability to background hazard level.
                      Values below -2 are considered negligible.
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded p-3 border border-gray-700/50">
                    <h4 className="font-semibold text-white mb-1">Delta-V (Δv)</h4>
                    <p className="text-gray-400">
                      Measure of fuel required to reach an asteroid. Lower values indicate easier access
                      for spacecraft missions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Note */}
        <div className="text-center text-gray-500 text-sm">
          <p>Data provided by NASA Sentry, NHATS, and NeoWs APIs</p>
          <p className="mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </main>
  );
}
