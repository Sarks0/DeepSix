'use client';

import { useEffect, useState } from 'react';
import { CompactStat } from '@/components/ui/StatCard';
import { HelpTooltip } from '@/components/ui/Tooltip';
import { formatLocalDateTime, formatLocalDate } from '@/lib/utils/datetime';

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
  narrative?: {
    overview: string;
    journey: {
      origin: string;
      discovery: string;
      perihelion: string;
      currentStatus?: string;
      earthApproach: string;
      future?: string;
      departure?: string;
      legacy?: string;
      currentLocation?: string;
    };
    observability?: {
      currentConstellation: string;
      visibility: string;
      apparentMagnitude: number;
      magnitudeNote: string;
      bestViewing: {
        period: string;
        reason: string;
      };
      equipment: {
        minimum: string;
        recommended: string;
        photography: string;
      };
      appearance: string;
      challengeLevel: string;
      viewingTips: string;
    };
    significance: {
      rarity: string;
      scientificValue: string;
      composition?: string;
      comparison: string;
      uniqueTrajectory?: string;
      uniqueShape?: string;
      mysteriousAcceleration?: string;
      noComaDetected?: string;
      scientificDebate?: string;
      cometActivity?: string;
    };
    research: {
      activeObservations?: string;
      observations?: string;
      spectroscopy?: string;
      dynamics?: string;
      spaceWeathering?: string;
      futureStudies?: string;
      composition?: string;
      nucleus?: string;
      dust?: string;
      scientificImpact?: string;
      colorAndReflectivity?: string;
      rotationAndTumbling?: string;
      controversialTheories?: string;
      lessonsLearned?: string;
    };
    oneTimeOpportunity?: string;
    historicalSignificance?: string;
  };
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
            <span>Discovered: {formatLocalDate(object.discoveryDate)}</span>
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
            <p className="text-white font-semibold">{formatLocalDate(object.perihelionDate)}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Closest Earth Approach</p>
            <p className="text-white font-semibold">
              {formatLocalDate(object.closestEarthApproach)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Eccentricity Card */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-gray-400">Eccentricity</p>
                <HelpTooltip content="e > 1.0 indicates hyperbolic (interstellar) trajectory" />
              </div>
            </div>
            <p className="text-3xl font-bold text-yellow-400">{object.eccentricity.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Hyperbolic</p>
          </div>

          {/* Perihelion Distance Card */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-gray-400">Perihelion Distance</p>
                <HelpTooltip content="Closest distance to the Sun" />
              </div>
            </div>
            <p className="text-3xl font-bold text-cyan-400">{object.perihelionDistanceAU.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">AU</p>
          </div>

          {/* Inclination Card (if available) */}
          {ephemeris?.orbital?.inclinationDeg > 0 && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs text-gray-400">Inclination</p>
                  <HelpTooltip content="Tilt of orbit relative to ecliptic plane" />
                </div>
              </div>
              <p className="text-3xl font-bold text-purple-400">{ephemeris.orbital.inclinationDeg.toFixed(1)}°</p>
              <p className="text-xs text-gray-500 mt-1">Degrees</p>
            </div>
          )}
        </div>

        {/* Hyperbolic orbit notice */}
        {object.eccentricity > 1 && (
          <div className="mt-4 text-sm text-yellow-300 bg-yellow-900/20 border border-yellow-800/30 rounded px-3 py-2">
            Hyperbolic orbit - this object will leave the Solar System forever
          </div>
        )}
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

      {/* Overview Section */}
      {object.narrative?.overview && (
        <div className="mb-6 p-6 bg-blue-900/10 border border-blue-800/30 rounded-lg">
          <h3 className="text-xl font-bold text-blue-300 mb-3">Overview</h3>
          <p className="text-base text-gray-200 leading-relaxed">{object.narrative.overview}</p>
        </div>
      )}

      {/* Journey Timeline */}
      {object.narrative?.journey && (
        <div className="mb-6 p-6 bg-gray-800/30 border border-gray-700/50 rounded-lg">
          <h3 className="text-xl font-bold text-white mb-4">Journey Through the Solar System</h3>

          <div className="space-y-4">
            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <h4 className="text-base font-semibold text-purple-300 mb-1">Origin</h4>
              <p className="text-base text-gray-300">{object.narrative.journey.origin}</p>
            </div>

            <div className="border-l-4 border-cyan-500 pl-4 py-2">
              <h4 className="text-base font-semibold text-cyan-300 mb-1">Discovery</h4>
              <p className="text-base text-gray-300">{object.narrative.journey.discovery}</p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4 py-2">
              <h4 className="text-base font-semibold text-yellow-300 mb-1">Perihelion</h4>
              <p className="text-base text-gray-300">{object.narrative.journey.perihelion}</p>
            </div>

            {object.narrative.journey.currentStatus && (
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <h4 className="text-base font-semibold text-green-300 mb-1">Current Status</h4>
                <p className="text-base text-gray-300">{object.narrative.journey.currentStatus}</p>
              </div>
            )}

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h4 className="text-base font-semibold text-blue-300 mb-1">Earth Approach</h4>
              <p className="text-base text-gray-300">{object.narrative.journey.earthApproach}</p>
            </div>

            {object.narrative.journey.future && (
              <div className="border-l-4 border-red-500 pl-4 py-2">
                <h4 className="text-base font-semibold text-red-300 mb-1">Future</h4>
                <p className="text-base text-gray-300">{object.narrative.journey.future}</p>
              </div>
            )}

            {object.narrative.journey.departure && (
              <div className="border-l-4 border-gray-500 pl-4 py-2">
                <h4 className="text-base font-semibold text-gray-300 mb-1">Departure</h4>
                <p className="text-base text-gray-300">{object.narrative.journey.departure}</p>
              </div>
            )}

            {object.narrative.journey.legacy && (
              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <h4 className="text-base font-semibold text-purple-300 mb-1">Legacy</h4>
                <p className="text-base text-gray-300">{object.narrative.journey.legacy}</p>
              </div>
            )}

            {object.narrative.journey.currentLocation && (
              <div className="border-l-4 border-indigo-500 pl-4 py-2">
                <h4 className="text-base font-semibold text-indigo-300 mb-1">Current Location</h4>
                <p className="text-base text-gray-300">{object.narrative.journey.currentLocation}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Observability & Viewing Guide (only for active objects) */}
      {object.status === 'active' && object.narrative?.observability && (
        <div className="mb-6 p-6 bg-gradient-to-br from-green-900/20 to-blue-900/20 border border-green-800/30 rounded-lg">
          <h3 className="text-xl font-bold text-green-300 mb-4">🔭 Observability & Viewing Guide</h3>

          <div className="space-y-4">
            {/* Current Status */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-base font-semibold text-green-400 mb-2">Current Visibility</h4>
              <p className="text-base text-gray-200 mb-2">{object.narrative.observability.visibility}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Constellation:</span>
                  <span className="text-white ml-2 font-semibold">{object.narrative.observability.currentConstellation}</span>
                </div>
                <div>
                  <span className="text-gray-400">Apparent Magnitude:</span>
                  <span className="text-white ml-2 font-semibold">{object.narrative.observability.apparentMagnitude}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2 italic">{object.narrative.observability.magnitudeNote}</p>
            </div>

            {/* Best Viewing Period */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-base font-semibold text-blue-400 mb-2">Best Viewing Period</h4>
              <p className="text-lg font-bold text-blue-300 mb-1">{object.narrative.observability.bestViewing.period}</p>
              <p className="text-base text-gray-300">{object.narrative.observability.bestViewing.reason}</p>
            </div>

            {/* Equipment Requirements */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-base font-semibold text-cyan-400 mb-3">Equipment Required</h4>
              <div className="space-y-2 text-base">
                <div>
                  <span className="text-gray-400">Minimum:</span>
                  <p className="text-gray-200 ml-4">{object.narrative.observability.equipment.minimum}</p>
                </div>
                <div>
                  <span className="text-gray-400">Recommended:</span>
                  <p className="text-gray-200 ml-4">{object.narrative.observability.equipment.recommended}</p>
                </div>
                <div>
                  <span className="text-gray-400">Photography:</span>
                  <p className="text-gray-200 ml-4">{object.narrative.observability.equipment.photography}</p>
                </div>
              </div>
            </div>

            {/* What You'll See */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-base font-semibold text-purple-400 mb-2">What You'll See</h4>
              <p className="text-base text-gray-200 mb-3">{object.narrative.observability.appearance}</p>
              <div className="flex items-start gap-2 p-3 bg-yellow-900/20 border border-yellow-800/30 rounded">
                <span className="text-yellow-400 text-lg">⚠️</span>
                <div>
                  <p className="text-sm font-semibold text-yellow-300">Challenge Level</p>
                  <p className="text-sm text-yellow-200">{object.narrative.observability.challengeLevel}</p>
                </div>
              </div>
            </div>

            {/* Viewing Tips */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-base font-semibold text-indigo-400 mb-2">💡 Viewing Tips</h4>
              <p className="text-base text-gray-200">{object.narrative.observability.viewingTips}</p>
            </div>
          </div>
        </div>
      )}

      {/* One-Time Opportunity Banner (for active objects) */}
      {object.status === 'active' && object.narrative?.oneTimeOpportunity && (
        <div className="mb-6 p-6 bg-gradient-to-r from-red-900/30 via-orange-900/30 to-yellow-900/30 border-2 border-orange-500/50 rounded-lg">
          <h3 className="text-xl font-bold text-orange-300 mb-3 flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            Once-in-a-Lifetime Opportunity
          </h3>
          <p className="text-base text-gray-200 leading-relaxed">{object.narrative.oneTimeOpportunity}</p>
        </div>
      )}

      {/* Scientific Significance */}
      {object.narrative?.significance && (
        <div className="mt-6 p-6 bg-purple-900/20 border border-purple-800/30 rounded-lg">
          <h4 className="text-xl font-bold text-purple-300 mb-4">🌟 Why This Is Extraordinary</h4>

          <div className="space-y-4">
            {/* Rarity */}
            <div className="bg-purple-900/30 rounded-lg p-4">
              <h5 className="text-base font-semibold text-purple-300 mb-2">Unprecedented Rarity</h5>
              <p className="text-base text-purple-200/90">{object.narrative.significance.rarity}</p>
            </div>

            {/* Scientific Value */}
            <div className="bg-purple-900/30 rounded-lg p-4">
              <h5 className="text-base font-semibold text-purple-300 mb-2">Scientific Value</h5>
              <p className="text-base text-purple-200/90">{object.narrative.significance.scientificValue}</p>
            </div>

            {/* Composition */}
            {object.narrative.significance.composition && (
              <div className="bg-purple-900/30 rounded-lg p-4">
                <h5 className="text-base font-semibold text-purple-300 mb-2">Composition</h5>
                <p className="text-base text-purple-200/90">{object.narrative.significance.composition}</p>
              </div>
            )}

            {/* Comparison */}
            <div className="bg-purple-900/30 rounded-lg p-4">
              <h5 className="text-base font-semibold text-purple-300 mb-2">Comparison with Other Objects</h5>
              <p className="text-base text-purple-200/90">{object.narrative.significance.comparison}</p>
            </div>

            {/* Unique Shape (for Oumuamua) */}
            {object.narrative.significance.uniqueShape && (
              <div className="bg-purple-900/30 rounded-lg p-4">
                <h5 className="text-base font-semibold text-purple-300 mb-2">Unusual Shape</h5>
                <p className="text-base text-purple-200/90">{object.narrative.significance.uniqueShape}</p>
              </div>
            )}

            {/* Mysterious Acceleration (for Oumuamua) */}
            {object.narrative.significance.mysteriousAcceleration && (
              <div className="bg-purple-900/30 rounded-lg p-4">
                <h5 className="text-base font-semibold text-purple-300 mb-2">Mysterious Acceleration</h5>
                <p className="text-base text-purple-200/90">{object.narrative.significance.mysteriousAcceleration}</p>
              </div>
            )}

            {/* No Coma Detected (for Oumuamua) */}
            {object.narrative.significance.noComaDetected && (
              <div className="bg-purple-900/30 rounded-lg p-4">
                <h5 className="text-base font-semibold text-purple-300 mb-2">No Cometary Activity</h5>
                <p className="text-base text-purple-200/90">{object.narrative.significance.noComaDetected}</p>
              </div>
            )}

            {/* Scientific Debate (for Oumuamua) */}
            {object.narrative.significance.scientificDebate && (
              <div className="bg-purple-900/30 rounded-lg p-4">
                <h5 className="text-base font-semibold text-purple-300 mb-2">Ongoing Scientific Debate</h5>
                <p className="text-base text-purple-200/90">{object.narrative.significance.scientificDebate}</p>
              </div>
            )}

            {/* Comet Activity (for Borisov) */}
            {object.narrative.significance.cometActivity && (
              <div className="bg-purple-900/30 rounded-lg p-4">
                <h5 className="text-base font-semibold text-purple-300 mb-2">Cometary Activity</h5>
                <p className="text-base text-purple-200/90">{object.narrative.significance.cometActivity}</p>
              </div>
            )}

            {/* Unique Trajectory */}
            {object.narrative.significance.uniqueTrajectory && (
              <div className="bg-purple-900/30 rounded-lg p-4">
                <h5 className="text-base font-semibold text-purple-300 mb-2">Hyperbolic Trajectory</h5>
                <p className="text-base text-purple-200/90">{object.narrative.significance.uniqueTrajectory}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scientific Research */}
      {object.narrative?.research && (
        <div className="mt-6 p-6 bg-blue-900/20 border border-blue-800/30 rounded-lg">
          <h4 className="text-xl font-bold text-blue-300 mb-4">🔬 Scientific Research</h4>

          <div className="space-y-4">
            {/* Active Observations (for current objects) */}
            {object.narrative.research.activeObservations && (
              <div className="bg-blue-900/30 rounded-lg p-4">
                <h5 className="text-base font-semibold text-blue-300 mb-2">Active Observations</h5>
                <p className="text-base text-blue-200/90">{object.narrative.research.activeObservations}</p>
              </div>
            )}

            {/* Historical Observations (for past objects) */}
            {object.narrative.research.observations && (
              <div className="bg-blue-900/30 rounded-lg p-4">
                <h5 className="text-base font-semibold text-blue-300 mb-2">Observational Campaign</h5>
                <p className="text-base text-blue-200/90">{object.narrative.research.observations}</p>
              </div>
            )}

            {/* Spectroscopy */}
            {object.narrative.research.spectroscopy && (
              <div className="bg-blue-900/30 rounded-lg p-4">
                <h5 className="text-base font-semibold text-blue-300 mb-2">Spectroscopic Analysis</h5>
                <p className="text-base text-blue-200/90">{object.narrative.research.spectroscopy}</p>
              </div>
            )}

            {/* Composition */}
            {object.narrative.research.composition && (
              <div className="bg-blue-900/30 rounded-lg p-4">
                <h5 className="text-base font-semibold text-blue-300 mb-2">Compositional Analysis</h5>
                <p className="text-base text-blue-200/90">{object.narrative.research.composition}</p>
              </div>
            )}

            {/* Dynamics */}
            {object.narrative.research.dynamics && (
              <div className="bg-blue-900/30 rounded-lg p-4">
                <h5 className="text-base font-semibold text-blue-300 mb-2">Orbital Dynamics</h5>
                <p className="text-base text-blue-200/90">{object.narrative.research.dynamics}</p>
              </div>
            )}

            {/* Space Weathering */}
            {object.narrative.research.spaceWeathering && (
              <div className="bg-blue-900/30 rounded-lg p-4">
                <h5 className="text-base font-semibold text-blue-300 mb-2">Space Weathering</h5>
                <p className="text-base text-blue-200/90">{object.narrative.research.spaceWeathering}</p>
              </div>
            )}

            {/* Nucleus */}
            {object.narrative.research.nucleus && (
              <div className="bg-blue-900/30 rounded-lg p-4">
                <h5 className="text-base font-semibold text-blue-300 mb-2">Nucleus Properties</h5>
                <p className="text-base text-blue-200/90">{object.narrative.research.nucleus}</p>
              </div>
            )}

            {/* Dust */}
            {object.narrative.research.dust && (
              <div className="bg-blue-900/30 rounded-lg p-4">
                <h5 className="text-base font-semibold text-blue-300 mb-2">Dust Analysis</h5>
                <p className="text-base text-blue-200/90">{object.narrative.research.dust}</p>
              </div>
            )}

            {/* Color and Reflectivity */}
            {object.narrative.research.colorAndReflectivity && (
              <div className="bg-blue-900/30 rounded-lg p-4">
                <h5 className="text-base font-semibold text-blue-300 mb-2">Color & Reflectivity</h5>
                <p className="text-base text-blue-200/90">{object.narrative.research.colorAndReflectivity}</p>
              </div>
            )}

            {/* Rotation and Tumbling */}
            {object.narrative.research.rotationAndTumbling && (
              <div className="bg-blue-900/30 rounded-lg p-4">
                <h5 className="text-base font-semibold text-blue-300 mb-2">Rotation & Tumbling</h5>
                <p className="text-base text-blue-200/90">{object.narrative.research.rotationAndTumbling}</p>
              </div>
            )}

            {/* Controversial Theories */}
            {object.narrative.research.controversialTheories && (
              <div className="bg-blue-900/30 rounded-lg p-4">
                <h5 className="text-base font-semibold text-blue-300 mb-2">Controversial Theories</h5>
                <p className="text-base text-blue-200/90">{object.narrative.research.controversialTheories}</p>
              </div>
            )}

            {/* Lessons Learned */}
            {object.narrative.research.lessonsLearned && (
              <div className="bg-blue-900/30 rounded-lg p-4">
                <h5 className="text-base font-semibold text-blue-300 mb-2">Lessons Learned</h5>
                <p className="text-base text-blue-200/90">{object.narrative.research.lessonsLearned}</p>
              </div>
            )}

            {/* Scientific Impact */}
            {object.narrative.research.scientificImpact && (
              <div className="bg-blue-900/30 rounded-lg p-4">
                <h5 className="text-base font-semibold text-blue-300 mb-2">Scientific Impact</h5>
                <p className="text-base text-blue-200/90">{object.narrative.research.scientificImpact}</p>
              </div>
            )}

            {/* Future Studies */}
            {object.narrative.research.futureStudies && (
              <div className="bg-blue-900/30 rounded-lg p-4">
                <h5 className="text-base font-semibold text-blue-300 mb-2">Future Studies</h5>
                <p className="text-base text-blue-200/90">{object.narrative.research.futureStudies}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Historical Significance (for past objects) */}
      {object.status === 'historical' && object.narrative?.historicalSignificance && (
        <div className="mt-6 p-6 bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-800/30 rounded-lg">
          <h4 className="text-xl font-bold text-amber-300 mb-3 flex items-center gap-2">
            <span className="text-2xl">📜</span>
            Historical Significance
          </h4>
          <p className="text-base text-gray-200 leading-relaxed">{object.narrative.historicalSignificance}</p>
        </div>
      )}

      {/* Data timestamp */}
      <div className="mt-4 text-xs text-gray-500 text-center space-y-1">
        <div>Ephemeris data last updated: {formatLocalDateTime(timestamp)}</div>
        <div className="text-gray-600">
          Object characteristics last reviewed: {formatLocalDate(object.lastUpdated)}
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
