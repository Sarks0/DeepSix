'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SolTracker } from '@/components/dashboard/SolTracker';
import { MissionTracker } from '@/components/dashboard/MissionTracker';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { FeaturedMission } from '@/components/dashboard/FeaturedMission';
import { TabNavigation, useTabState } from '@/components/ui/TabNavigation';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';

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
  const { activeTab, setActiveTab, isActive } = useTabState('deep-space');

  // Mission counts for tabs
  const missionCounts = {
    'deep-space': 6,
    'mars-system': 5, // 2 rovers + 3 orbiters
    'en-route': 4,
  };

  return (
    <div className="min-h-screen px-4 md:px-6 lg:px-8 py-8">
      {/* Hero Section with Quick Stats */}
      <DashboardHero
        activeMissions={16}
        totalDistance={24.9} // Voyager 1 distance in billions of km
        dataStatus={{
          online: true,
          lastUpdate: '2 min ago',
        }}
      />

      {/* Featured Mission Spotlight */}
      <FeaturedMission
        mission={{
          id: 'voyager1',
          name: 'Voyager 1',
          tagline: 'Humanity\'s Farthest Explorer',
          description: 'Launched in 1977, Voyager 1 is the most distant human-made object in space. It entered interstellar space in 2012 and continues to send back data about the boundary between our solar system and the rest of the galaxy.',
          status: 'Active',
          distance: {
            value: 165,
            unit: 'AU',
            label: 'Distance from Earth',
          },
          speed: {
            value: 17.0,
            unit: 'km/s',
          },
          whyFeatured: 'Voyager 1 is exploring territory no spacecraft has ever reached before. At 165 AU from Earth, it takes over 22 hours for signals to reach us, yet it still transmits data about the mysterious region between stars.',
          quickFacts: [
            {
              label: 'Launched',
              value: 'Sep 5, 1977',
              helpText: 'Launch date from Cape Canaveral',
            },
            {
              label: 'Mission Time',
              value: '47+ years',
              helpText: 'Total time in space since launch',
            },
          ],
          detailLink: '/missions/voyager1',
        }}
      />

      {/* Mission Categories with Tabs */}
      <section id="missions" className="mb-12">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">Active Missions</h2>
          <p className="text-gray-400">Explore spacecraft by category and location</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <TabNavigation
            tabs={[
              {
                id: 'deep-space',
                label: 'Deep Space',
                count: missionCounts['deep-space'],
                helpText: 'Missions exploring beyond Mars orbit',
              },
              {
                id: 'mars-system',
                label: 'Mars System',
                count: missionCounts['mars-system'],
                helpText: 'Rovers and orbiters at Mars',
              },
              {
                id: 'en-route',
                label: 'En Route',
                count: missionCounts['en-route'],
                helpText: 'Missions traveling to their destinations',
              },
            ]}
            defaultTab={activeTab}
            onChange={setActiveTab}
            variant="pills"
          />
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Deep Space Missions */}
          {isActive('deep-space') && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-sm">
                  Spacecraft exploring the outer solar system and beyond
                </p>
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
            </div>
          )}

          {/* Mars System Missions */}
          {isActive('mars-system') && (
            <div className="space-y-8">
              {/* Mars Rovers Section */}
              <CollapsibleSection
                title="Mars Rovers"
                description="Surface exploration missions currently active on Mars"
                badge={2}
                badgeColor="red"
                defaultExpanded={true}
                storageKey="dashboard-mars-rovers-expanded"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-400 text-sm">
                    Autonomous robots exploring the Martian surface and searching for signs of past life
                  </p>
                  <DataSourceBadge source="NASA Mars Rover API" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <SolTracker rover="perseverance" variant="detailed" />
                  <SolTracker rover="curiosity" variant="detailed" />
                </div>
              </CollapsibleSection>

              {/* Mars Orbiters Section */}
              <CollapsibleSection
                title="Mars Orbiters"
                description="Spacecraft orbiting Mars for communications and observation"
                badge={3}
                badgeColor="red"
                defaultExpanded={false}
                storageKey="dashboard-mars-orbiters-expanded"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-400 text-sm">
                    Orbital missions studying Mars from above and relaying data from surface rovers
                  </p>
                  <DataSourceBadge source="NASA JPL Horizons System" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <MissionTracker mission="mro" variant="detailed" />
                  <MissionTracker mission="maven" variant="detailed" />
                  <MissionTracker mission="odyssey" variant="detailed" />
                </div>
              </CollapsibleSection>
            </div>
          )}

          {/* En Route Missions */}
          {isActive('en-route') && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-sm">
                  Missions traveling through space to reach their scientific targets
                </p>
                <DataSourceBadge source="NASA JPL Horizons System" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <MissionTracker mission="europaclipper" variant="detailed" />
                <MissionTracker mission="lucy" variant="detailed" />
                <MissionTracker mission="psyche" variant="detailed" />
                <MissionTracker mission="osirisapex" variant="detailed" />
              </div>
            </div>
          )}
        </motion.div>
      </section>

      {/* Helpful Tips for Beginners */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 p-6 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-800/30 rounded-lg"
      >
        <h3 className="text-lg font-bold text-cyan-300 mb-3">New to Space Missions?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-cyan-200/80">
          <div>
            <p className="font-semibold mb-1 text-cyan-400">Deep Space</p>
            <p>Missions exploring beyond Mars, including the outer planets and interstellar space.</p>
          </div>
          <div>
            <p className="font-semibold mb-1 text-cyan-400">Mars System</p>
            <p>Rovers driving on Mars surface and orbiters studying the planet from above.</p>
          </div>
          <div>
            <p className="font-semibold mb-1 text-cyan-400">En Route</p>
            <p>Spacecraft currently traveling to asteroids, moons, and other destinations.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
