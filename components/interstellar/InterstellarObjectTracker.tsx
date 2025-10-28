'use client';

import { useEffect, useState } from 'react';
import { CompactStat } from '@/components/ui/StatCard';
import { HelpTooltip } from '@/components/ui/Tooltip';

interface InterstellarObject {
  designation: string;
  alternateName: string;
  type: string;
  discoveryDate: string;
  discoveryLocation: string;
  status: 'active' | 'historical';
  interstellarOrigin: boolean;
  perihelionDate: string;
  perihelionDistanceAU: number;
  closestEarthApproach: string;
  closestEarthDistanceAU: number;
  estimatedDiameterKm: string;
  eccentricity: number;
  characteristics: string;
  lastUpdated: string;
}

interface Position {
  ra: string;
  dec: string;
  distanceFromSunAU: number;
  distanceFromEarthAU: number;
  distanceFromEarthKm: number;
}

interface Velocity {
  totalKmS: number;
  radialVelocityKmS: number;
}

interface Orbital {
  eccentricity: number;
  perihelionDistanceAU: number;
  inclinationDeg: number;
  hyperbolicExcessVelocityKmS?: number;
}

interface Visual {
  magnitude: number;
  phaseAngleDeg: number;
  illuminationPercent: number;
}

interface Ephemeris {
  timestamp: string;
  position: Position;
  velocity: Velocity;
  orbital: Orbital;
  visual: Visual;
}

interface InterstellarData {
  success: boolean;
  object: InterstellarObject;
  ephemeris: Ephemeris;
  dataSource: string;
  timestamp: string;
  rawData?: string;
}

interface InterstellarObjectTrackerProps {
  objectId?: string; // Default to '3I' (current visitor)
  showRawData?: boolean;
}

export function InterstellarObjectTracker({
  objectId = '3I',
  showRawData = false,
}: InterstellarObjectTrackerProps) {
  const [data, setData] = useState<InterstellarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Add cache-busting timestamp for daily updates
        const cacheBuster = Math.floor(Date.now() / 86400000); // Changes once per day
        const response = await fetch(`/api/interstellar/horizons?object=${objectId}&_t=${cacheBuster}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to fetch data');
        }

        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Failed to fetch interstellar data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // Refresh every hour for position updates
    const interval = setInterval(fetchData, 3600000);
    return () => clearInterval(interval);
  }, [objectId]);

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-64"></div>
          <div className="h-4 bg-gray-700 rounded w-96"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-red-800/50 p-6">
        <h3 className="text-xl font-bold text-red-400 mb-2">Unable to Load Tracking Data</h3>
        <p className="text-gray-400">{error || 'Data temporarily unavailable'}</p>
        <p className="text-sm text-gray-500 mt-2">
          Try again later or check NASA JPL Horizons status
        </p>
      </div>
    );
  }

  const { object, ephemeris, dataSource, timestamp } = data;
  const isActive = object.status === 'active';

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-sm rounded-lg border border-purple-800/50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">{object.designation}</h2>
            <p className="text-lg text-purple-300">{object.alternateName}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                isActive
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
              }`}
            >
              {isActive ? 'Currently Observable' : 'Historical'}
            </span>
            {object.interstellarOrigin && (
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/50">
                Interstellar Origin
              </span>
            )}
            {isActive && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/50 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                Daily Updates
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 text-sm text-gray-400">
          <div className="flex items-center gap-4">
            <span>{object.type}</span>
            <span>•</span>
            <span>Discovered: {new Date(object.discoveryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Discovery Site: {object.discoveryLocation}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Data: {dataSource}
              <HelpTooltip content="Real-time data from NASA's Jet Propulsion Laboratory" />
            </span>
          </div>
        </div>
      </div>

      {/* Discovery & Physical Characteristics */}
      <div className="mb-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
        <h3 className="text-lg font-bold text-white mb-3">Object Characteristics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400 mb-1">Estimated Diameter</p>
            <p className="text-white font-semibold">{object.estimatedDiameterKm} km</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Orbital Eccentricity</p>
            <p className="text-white font-semibold">{object.eccentricity.toFixed(2)} (hyperbolic)</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Perihelion Date</p>
            <p className="text-white font-semibold">{new Date(object.perihelionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Closest Earth Approach</p>
            <p className="text-white font-semibold">
              {new Date(object.closestEarthApproach).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              {' '}({object.closestEarthDistanceAU.toFixed(2)} AU)
            </p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-700/50">
          <p className="text-gray-400 text-xs mb-1">Notable Characteristics</p>
          <p className="text-purple-200 text-sm">{object.characteristics}</p>
        </div>
      </div>

      {/* Position & Distance Data */}
      {ephemeris && ephemeris.position && (
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-4">Current Position</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-400">Distance from Sun</p>
                <HelpTooltip content="Current distance from the Sun in Astronomical Units" />
              </div>
              <p className="text-2xl font-bold text-cyan-400">
                {ephemeris.position.distanceFromSunAU.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">AU</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-400">Distance from Earth</p>
                <HelpTooltip content="Current distance from Earth in Astronomical Units" />
              </div>
              <p className="text-2xl font-bold text-blue-400">
                {ephemeris.position.distanceFromEarthAU.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">AU</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-400">Right Ascension</p>
                <HelpTooltip content="Sky coordinate (longitude equivalent)" />
              </div>
              <p className="text-lg font-bold text-white">{ephemeris.position.ra}</p>
              <p className="text-xs text-gray-500">RA</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-400">Declination</p>
                <HelpTooltip content="Sky coordinate (latitude equivalent)" />
              </div>
              <p className="text-lg font-bold text-white">{ephemeris.position.dec}</p>
              <p className="text-xs text-gray-500">DEC</p>
            </div>
          </div>
        </div>
      )}

      {/* Orbital Characteristics */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-4">Orbital Characteristics</h3>
        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
          <div className="space-y-2">
            <CompactStat
              label="Eccentricity"
              value={object.eccentricity.toFixed(2)}
              helpText="e > 1.0 indicates hyperbolic (interstellar) trajectory"
            />
            {object.eccentricity > 1 && (
              <div className="text-sm text-yellow-300 bg-yellow-900/20 border border-yellow-800/30 rounded px-3 py-2">
                Hyperbolic orbit - this object will leave the Solar System forever
              </div>
            )}
            <CompactStat
              label="Perihelion Distance"
              value={`${object.perihelionDistanceAU.toFixed(2)} AU`}
              helpText="Closest distance to the Sun"
            />
            {ephemeris?.orbital?.inclinationDeg > 0 && (
              <CompactStat
                label="Inclination"
                value={`${ephemeris.orbital.inclinationDeg.toFixed(1)}°`}
                helpText="Tilt of orbit relative to ecliptic plane"
              />
            )}
          </div>
        </div>
      </div>

      {/* Visual Observation Data */}
      {ephemeris && ephemeris.visual && ephemeris.visual.magnitude < 50 && (
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-4">Observation Data</h3>
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
            <CompactStat
              label="Apparent Magnitude"
              value={ephemeris.visual.magnitude.toFixed(1)}
              helpText="Brightness as seen from Earth (lower = brighter)"
            />
            {ephemeris.visual.magnitude < 10 && (
              <div className="mt-2 text-sm text-green-300 bg-green-900/20 border border-green-800/30 rounded px-3 py-2">
                Visible with amateur telescopes
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interstellar Context */}
      <div className="mt-6 p-4 bg-purple-900/20 border border-purple-800/30 rounded-lg">
        <h4 className="text-sm font-bold text-purple-300 mb-2">Why This Is Extraordinary</h4>
        <p className="text-sm text-purple-200/80 mb-3">
          {object.designation} is one of only{' '}
          {objectId === '3I' ? 'three' : objectId === '2I' ? 'two' : 'one'} confirmed interstellar
          {object.type.includes('Comet') ? ' comet' : ' object'}
          {objectId === '3I' ? 's' : ''} ever detected passing through our Solar System.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-purple-900/30 rounded p-2">
            <p className="text-purple-300 font-semibold mb-1">Hyperbolic Trajectory</p>
            <p className="text-purple-200/70">
              Eccentricity of {object.eccentricity.toFixed(2)} means it&apos;s traveling faster than escape velocity
              and will leave the Solar System forever.
            </p>
          </div>
          <div className="bg-purple-900/30 rounded p-2">
            <p className="text-purple-300 font-semibold mb-1">Interstellar Origin</p>
            <p className="text-purple-200/70">
              Came from another star system, providing a rare chance to study material from beyond our Solar System.
            </p>
          </div>
          <div className="bg-purple-900/30 rounded p-2">
            <p className="text-purple-300 font-semibold mb-1">Brief Encounter</p>
            <p className="text-purple-200/70">
              Perihelion at {object.perihelionDistanceAU.toFixed(2)} AU on {new Date(object.perihelionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.
              One-time observation opportunity.
            </p>
          </div>
          <div className="bg-purple-900/30 rounded p-2">
            <p className="text-purple-300 font-semibold mb-1">Scientific Value</p>
            <p className="text-purple-200/70">
              {object.characteristics}
            </p>
          </div>
        </div>
      </div>

      {/* Data timestamp */}
      <div className="mt-4 text-xs text-gray-500 text-center space-y-1">
        <div>Ephemeris data last updated: {new Date(timestamp).toLocaleString()}</div>
        <div className="text-gray-600">
          Object characteristics last reviewed: {new Date(object.lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <div className="text-gray-600">
          {object.status === 'active'
            ? 'Position data updates hourly • Characteristics reviewed daily'
            : 'Historical data - no longer updating'}
        </div>
      </div>

      {/* Debug: Raw Data */}
      {showRawData && data.rawData && (
        <details className="mt-4">
          <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
            Show raw Horizons data
          </summary>
          <pre className="mt-2 p-4 bg-black/50 rounded text-xs text-gray-400 overflow-auto max-h-96">
            {data.rawData}
          </pre>
        </details>
      )}
    </div>
  );
}
