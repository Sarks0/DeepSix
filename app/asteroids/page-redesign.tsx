import { Metadata } from 'next';
import { ScoutTracker } from '@/components/asteroids/ScoutTracker';
import { SentryMonitor } from '@/components/asteroids/SentryMonitor';
import { NHATSList } from '@/components/asteroids/NHATSList';
import { CloseApproachFeed } from '@/components/asteroids/CloseApproachCard';
import { FireballMap } from '@/components/asteroids/FireballMap';
import { AdvancedSearch } from '@/components/asteroids/AdvancedSearch';
import MissionDesignTool from '@/components/asteroids/MissionDesignTool';
import { RadarTrackedList } from '@/components/asteroids/RadarTrackedList';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Asteroid Tracking - Planetary Defense & Mission Monitoring | DeepSix',
  description: 'Real-time asteroid tracking, impact monitoring with NASA Sentry, mission-accessible targets, and close approaches. Comprehensive planetary defense data from NASA and JPL.',
};

export default function AsteroidsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black px-4 md:px-6 lg:px-8 py-12">
      <div className="w-full mx-auto">
        {/* Hero Section - Simplified */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Asteroid Tracking & <span className="text-cyan-400">Planetary Defense</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-6">
            Real-time monitoring of near-Earth asteroids, impact risk assessment, and mission accessibility data from NASA and JPL
          </p>

          {/* Simplified Category Badges */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center px-4 py-2 bg-red-900/20 border border-red-700/50 rounded-lg">
              <span className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse"></span>
              <span className="text-gray-300">Planetary Defense</span>
            </div>
            <div className="flex items-center px-4 py-2 bg-cyan-900/20 border border-cyan-700/50 rounded-lg">
              <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></span>
              <span className="text-gray-300">Mission Planning</span>
            </div>
            <div className="flex items-center px-4 py-2 bg-blue-900/20 border border-blue-700/50 rounded-lg">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
              <span className="text-gray-300">Tracking & Observation</span>
            </div>
          </div>
        </div>

        {/* Beginner Guide */}
        <div
          className="mb-12 p-6 bg-cyan-900/10 border border-cyan-800/30 rounded-lg"
        >
          <h3 className="text-lg font-bold text-cyan-300 mb-3">New to Asteroid Tracking?</h3>
          <p className="text-sm text-cyan-200/80 mb-4">
            This page organizes asteroid data into three main categories based on how we use the information:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-cyan-200/80">
            <div>
              <p className="font-semibold mb-1 text-red-400">Planetary Defense</p>
              <p>Monitoring newly discovered asteroids and assessing potential impact risks to Earth.</p>
            </div>
            <div>
              <p className="font-semibold mb-1 text-cyan-400">Mission Planning</p>
              <p>Identifying asteroids we could visit with spacecraft and calculating mission trajectories.</p>
            </div>
            <div>
              <p className="font-semibold mb-1 text-blue-400">Tracking & Observation</p>
              <p>Observing asteroids with radar and telescopes to refine their orbits and characteristics.</p>
            </div>
          </div>
        </div>

        {/* PLANETARY DEFENSE SECTION */}
        <div
          className="mb-8"
        >
          <CollapsibleSection
            title="Planetary Defense"
            description="Monitoring asteroids for potential Earth impacts"
            helpText="NASA tracks near-Earth objects to identify any that could pose a threat to our planet"
            badge="2 systems"
            badgeColor="red"
            defaultExpanded={false}
            storageKey="asteroids-planetary-defense-expanded"
          >
            <div className="space-y-8">
              {/* Scout: Newly Discovered Objects */}
              <div>
                <ScoutTracker />
              </div>

              {/* Sentry Impact Monitoring */}
              <div>
                <SentryMonitor />
              </div>
            </div>
          </CollapsibleSection>
        </div>

        {/* MISSION PLANNING SECTION */}
        <div
          className="mb-8"
        >
          <CollapsibleSection
            title="Mission Planning"
            description="Asteroids accessible for future spacecraft missions"
            helpText="These tools help scientists and engineers plan missions to visit asteroids"
            badge="2 tools"
            badgeColor="cyan"
            defaultExpanded={false}
            storageKey="asteroids-mission-planning-expanded"
          >
            <div className="space-y-8">
              {/* NHATS Mission-Accessible Asteroids */}
              <div>
                <NHATSList />
              </div>

              {/* Mission Design Tool */}
              <div>
                <MissionDesignTool />
              </div>
            </div>
          </CollapsibleSection>
        </div>

        {/* TRACKING & OBSERVATION SECTION */}
        <div
          className="mb-8"
        >
          <CollapsibleSection
            title="Tracking & Observation"
            description="Real-time asteroid detection and monitoring"
            helpText="Tracking systems that observe asteroids as they pass near Earth"
            badge="3 feeds"
            badgeColor="blue"
            defaultExpanded={false}
            storageKey="asteroids-tracking-expanded"
          >
            <div className="space-y-8">
              {/* Radar-Tracked Asteroids */}
              <div>
                <RadarTrackedList />
              </div>

              {/* Close Approaches This Week */}
              <div>
                <CloseApproachFeed />
              </div>

              {/* Recent Fireball Detections */}
              <div>
                <FireballMap />
              </div>
            </div>
          </CollapsibleSection>
        </div>

        {/* ADVANCED TOOLS SECTION */}
        <div
          className="mb-12"
        >
          <CollapsibleSection
            title="Advanced Search"
            description="Search for specific asteroids by name or designation"
            helpText="Use filters to find asteroids by size, orbit, or hazard level"
            defaultExpanded={false}
            storageKey="asteroids-search-expanded"
          >
            <AdvancedSearch />
          </CollapsibleSection>
        </div>

        {/* Our Asteroid Missions Section */}
        <section
          className="mb-12"
        >
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
                <h3 className="text-xl font-bold text-purple-400 mb-2 group-hover:text-purple-300">Lucy</h3>
                <p className="text-sm text-gray-400 mb-3">Exploring Jupiter&apos;s Trojan Asteroids</p>
                <div className="text-xs text-gray-500">
                  <div className="mb-1">Status: <span className="text-blue-400">En Route</span></div>
                  <div>Targets: 7 asteroids in 12 years</div>
                </div>
              </Link>

              {/* Psyche Mission */}
              <Link
                href="/missions/psyche"
                className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50 hover:border-purple-500 transition-all group"
              >
                <h3 className="text-xl font-bold text-purple-400 mb-2 group-hover:text-purple-300">Psyche</h3>
                <p className="text-sm text-gray-400 mb-3">Visiting a Metal-Rich Asteroid</p>
                <div className="text-xs text-gray-500">
                  <div className="mb-1">Status: <span className="text-blue-400">En Route</span></div>
                  <div>Target: 16 Psyche (Metal Asteroid)</div>
                </div>
              </Link>

              {/* OSIRIS-APEX Mission */}
              <Link
                href="/missions/osirisapex"
                className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50 hover:border-purple-500 transition-all group"
              >
                <h3 className="text-xl font-bold text-purple-400 mb-2 group-hover:text-purple-300">OSIRIS-APEX</h3>
                <p className="text-sm text-gray-400 mb-3">Extended Mission to Apophis</p>
                <div className="text-xs text-gray-500">
                  <div className="mb-1">Status: <span className="text-blue-400">En Route</span></div>
                  <div>Target: 99942 Apophis (2029)</div>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
