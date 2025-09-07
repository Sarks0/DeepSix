'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { SolarSystemErrorBoundary } from '@/components/solar-system/ErrorBoundary';

// Dynamic import for heavy Three.js components
const SolarSystemScene = dynamic(
  () =>
    import('@/components/solar-system/SolarSystemScene').then((mod) => ({
      default: mod.SolarSystemScene,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading Solar System...</p>
          <p className="text-sm text-gray-400 mt-2">Initializing 3D engine</p>
        </div>
      </div>
    ),
  }
);

const SolarSystemControls = dynamic(
  () =>
    import('@/components/solar-system/SolarSystemControls').then((mod) => ({
      default: mod.SolarSystemControls,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="absolute top-4 right-4 bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700 p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-700 rounded w-20"></div>
          <div className="h-4 bg-gray-700 rounded w-16"></div>
          <div className="h-4 bg-gray-700 rounded w-24"></div>
        </div>
      </div>
    ),
  }
);

export default function SolarSystemPage() {
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showSpacecraft, setShowSpacecraft] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [timeSpeed, setTimeSpeed] = useState(1.0);
  const [focusTarget, setFocusTarget] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative z-10 p-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-orange-400 bg-clip-text text-transparent">
          3D Solar System Explorer
        </h1>
        <p className="text-gray-400 mt-2">
          Interactive visualization of our solar system and active space missions
        </p>
      </div>

      {/* Main 3D Scene Container */}
      <div className="relative w-full h-[calc(100vh-120px)]">
        <SolarSystemErrorBoundary>
          <SolarSystemScene
            className="w-full h-full"
            showOrbits={showOrbits}
            showLabels={showLabels}
            showSpacecraft={showSpacecraft}
            autoRotate={autoRotate}
            timeSpeed={timeSpeed}
            focusTarget={focusTarget}
            onFocusChange={setFocusTarget}
          />
        </SolarSystemErrorBoundary>

        {/* Control Panel */}
        <SolarSystemControls
          showOrbits={showOrbits}
          showLabels={showLabels}
          showSpacecraft={showSpacecraft}
          autoRotate={autoRotate}
          timeSpeed={timeSpeed}
          focusTarget={focusTarget}
          onShowOrbitsChange={setShowOrbits}
          onShowLabelsChange={setShowLabels}
          onShowSpacecraftChange={setShowSpacecraft}
          onAutoRotateChange={setAutoRotate}
          onTimeSpeedChange={setTimeSpeed}
          onFocusChange={setFocusTarget}
        />

        {/* Information Panel */}
        {focusTarget && (
          <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700 p-4 max-w-sm">
            <h3 className="text-lg font-bold text-white mb-2">{focusTarget}</h3>
            <div className="text-sm text-gray-300 space-y-1">
              {focusTarget === 'Sun' && (
                <>
                  <div>Type: G-type Main Sequence Star</div>
                  <div>Surface Temperature: 5,778 K</div>
                  <div>Mass: 1.989 × 10³⁰ kg</div>
                  <div>Age: ~4.6 billion years</div>
                </>
              )}
              {focusTarget === 'Earth' && (
                <>
                  <div>Type: Terrestrial Planet</div>
                  <div>Distance from Sun: 1.0 AU</div>
                  <div>Orbital Period: 365.25 days</div>
                  <div>Moons: 1 (Luna)</div>
                </>
              )}
              {focusTarget === 'Mars' && (
                <>
                  <div>Type: Terrestrial Planet</div>
                  <div>Distance from Sun: 1.52 AU</div>
                  <div>Orbital Period: 687 Earth days</div>
                  <div>Active Missions: Perseverance, Curiosity</div>
                </>
              )}
              {focusTarget === 'Perseverance' && (
                <>
                  <div>Mission: Mars 2020</div>
                  <div>Launch: July 30, 2020</div>
                  <div>Location: Jezero Crater, Mars</div>
                  <div>Status: Active</div>
                </>
              )}
              {focusTarget === 'Voyager 1' && (
                <>
                  <div>Mission: Voyager Program</div>
                  <div>Launch: September 5, 1977</div>
                  <div>Distance: ~159 AU from Sun</div>
                  <div>Status: Active in Interstellar Space</div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
