'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface AsteroidData {
  success: boolean;
  dataSource: string;
  timestamp: string;
  asteroid: {
    designation: string;
    fullName: string;
    alternativeDesignations?: {
      primary: string;
      provisional: string | null;
      name: string | null;
    };
    orbitClass: string;
    spectralType: string;
    isPHA: boolean;
    isNEO: boolean;
    hazardLevel: string;
    sizeCategory: string;
    physicalProperties: {
      absoluteMagnitude: number | null;
      diameter: number | null;
      diameterUnit: string;
      extent: string | null;
      albedo: number | null;
      rotationPeriod: number | null;
      rotationUnit: string;
      density: number | null;
      densityUnit: string;
      mass: number | null;
    };
    orbitalElements: {
      eccentricity: number | null;
      semiMajorAxis: number | null;
      semiMajorAxisUnit: string;
      perihelionDistance: number | null;
      inclination: number | null;
      inclinationUnit: string;
      longitudeAscendingNode: number | null;
      argumentPerihelion: number | null;
      meanAnomaly: number | null;
      orbitalPeriod: number | null;
      orbitalPeriodUnit: string;
      epoch: string | null;
      firstObservation: string | null;
      lastObservation: string | null;
      dataArc: string | null;
      orbitUncertainty: string | null;
      moid: number | null;
    };
    descriptions: {
      orbitDescription: string;
      sizeDescription: string;
      spectralDescription: string;
    };
  };
}

interface RadarObservation {
  designation: string;
  epoch: string;
  value: number;
  sigma: number;
  units: string;
  frequency: number;
  receiver: number;
  transmitter: number;
  bouncePoint: string;
  receiverName: string;
  transmitterName: string;
  measurementType: string;
  fullName?: string;
  observer?: string;
  notes?: string;
  reference?: string;
}

interface RadarData {
  success: boolean;
  dataSource: string;
  totalObservations: number;
  observations: RadarObservation[];
}

interface CloseApproach {
  date: string;
  dateCalendar: string;
  distance: number;
  distanceAU: number;
  distanceLunar: number;
  distanceKm: number;
  velocity: number;
  severity: 'extreme' | 'very-close' | 'close' | 'moderate' | 'distant';
  description: string;
}

interface CloseApproachData {
  success: boolean;
  dataSource: string;
  summary: {
    total: number;
    future: number;
    past: number;
    closestEver: CloseApproach | null;
    nextApproach: CloseApproach | null;
  };
  approaches: {
    future: CloseApproach[];
    past: CloseApproach[];
  };
}

interface SentryData {
  success: boolean;
  dataSource: string;
  monitored: boolean;
  designation?: string;
  fullName?: string;
  risk?: {
    impactProbability: number;
    impactOdds: string;
    torinoScale: number;
    palermoScale: number;
    numberOfImpacts: number;
    hazardLevel: string;
    hazardColor: string;
    hazardDescription: string;
    palermoInterpretation: string;
  };
  message?: string;
  status: string;
}

interface MissionAccessibilityData {
  success: boolean;
  dataSource: string;
  accessible: boolean;
  designation?: string;
  fullName?: string;
  mission?: {
    accessibilityLevel: string;
    accessibilityColor: string;
    accessibilityDescription: string;
    missionType: string;
    minimumDeltaV: {
      value: number;
      duration: number;
      trajectory: {
        launchDate: string;
        totalDuration: number;
        outboundDuration: number;
        returnDuration: number;
        stayTime: number;
        deltaV: number;
        c3Energy: number;
      } | null;
    };
    shortestDuration: {
      value: number;
      deltaV: number;
      trajectory: {
        launchDate: string;
        totalDuration: number;
        stayTime: number;
      } | null;
    };
    viableTrajectories: number;
  };
  physicalProperties?: {
    estimatedSize: number | null;
    minSize: number | null;
    maxSize: number | null;
  };
  observation?: {
    nextWindow: {
      start: string | null;
      end: string | null;
      magnitude: number | null;
    };
  };
  message?: string;
  status: string;
}

interface ObservationWindow {
  startDate: string;
  endDate: string;
  peakDate: string;
  peakMagnitude: number;
  peakDistance: number;
  visibility: 'naked-eye' | 'binoculars' | 'small-telescope' | 'large-telescope' | 'professional';
  visibilityDescription: string;
  recommendedEquipment: string;
  observabilityRating: number;
}

interface ObservationData {
  success: boolean;
  dataSource: string;
  hasOpportunities: boolean;
  designation?: string;
  fullName?: string;
  absoluteMagnitude?: number;
  currentStatus?: {
    visible: boolean;
    magnitude?: number;
    visibility?: string;
    description?: string;
    equipment?: string;
    message?: string;
  };
  bestOpportunity?: {
    date: string;
    magnitude: number;
    visibility: string;
    description: string;
    equipment: string;
    rating: number;
  } | null;
  windows?: ObservationWindow[];
  total?: number;
  message?: string;
}

export default function AsteroidDetailPage() {
  const params = useParams();
  const asteroidId = params.id as string;

  const [data, setData] = useState<AsteroidData | null>(null);
  const [radarData, setRadarData] = useState<RadarData | null>(null);
  const [closeApproachData, setCloseApproachData] = useState<CloseApproachData | null>(null);
  const [sentryData, setSentryData] = useState<SentryData | null>(null);
  const [missionData, setMissionData] = useState<MissionAccessibilityData | null>(null);
  const [observationData, setObservationData] = useState<ObservationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [radarLoading, setRadarLoading] = useState(true);
  const [closeApproachLoading, setCloseApproachLoading] = useState(true);
  const [sentryLoading, setSentryLoading] = useState(true);
  const [missionLoading, setMissionLoading] = useState(true);
  const [observationLoading, setObservationLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAsteroidData() {
      try {
        const response = await fetch(`/api/asteroids/sbdb?sstr=${encodeURIComponent(asteroidId)}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch asteroid data');
        }

        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    async function fetchRadarData() {
      try {
        const response = await fetch(`/api/asteroids/radar?des=${encodeURIComponent(asteroidId)}&fullname=true&observer=true`);
        const result = await response.json();

        if (response.ok && result.success && result.totalObservations > 0) {
          setRadarData(result);
        }
      } catch (_err) {
        // Silently fail - not all asteroids have radar data
        console.log('No radar data available for this asteroid');
      } finally {
        setRadarLoading(false);
      }
    }

    async function fetchCloseApproachData() {
      try {
        const response = await fetch(`/api/asteroids/close-approach?des=${encodeURIComponent(asteroidId)}`);
        const result = await response.json();

        if (response.ok && result.success) {
          setCloseApproachData(result);
        }
      } catch (_err) {
        console.log('No close approach data available for this asteroid');
      } finally {
        setCloseApproachLoading(false);
      }
    }

    async function fetchSentryData() {
      try {
        const response = await fetch(`/api/asteroids/sentry-check?des=${encodeURIComponent(asteroidId)}`);
        const result = await response.json();

        if (response.ok && result.success) {
          setSentryData(result);
        }
      } catch (_err) {
        console.log('No sentry data available for this asteroid');
      } finally {
        setSentryLoading(false);
      }
    }

    async function fetchMissionData() {
      try {
        const response = await fetch(`/api/asteroids/mission-accessibility?des=${encodeURIComponent(asteroidId)}`);
        const result = await response.json();

        if (response.ok && result.success) {
          setMissionData(result);
        }
      } catch (_err) {
        console.log('No mission accessibility data available for this asteroid');
      } finally {
        setMissionLoading(false);
      }
    }

    async function fetchObservationData() {
      try {
        const response = await fetch(`/api/asteroids/observation-opportunities?des=${encodeURIComponent(asteroidId)}`);
        const result = await response.json();

        if (response.ok && result.success) {
          setObservationData(result);
        }
      } catch (_err) {
        console.log('No observation data available for this asteroid');
      } finally {
        setObservationLoading(false);
      }
    }

    fetchAsteroidData();
    fetchRadarData();
    fetchCloseApproachData();
    fetchSentryData();
    fetchMissionData();
    fetchObservationData();
  }, [asteroidId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black px-4 md:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-700 rounded w-96 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black px-4 md:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-red-800/50 p-6">
            <h1 className="text-2xl font-bold text-red-400 mb-2">Unable to Load Asteroid Data</h1>
            <p className="text-gray-400 mb-4">{error || 'Data temporarily unavailable'}</p>
            <Link
              href="/asteroids"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              ← Back to Asteroid Tracking
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { asteroid } = data;
  const phys = asteroid.physicalProperties;
  const orbit = asteroid.orbitalElements;

  const getHazardColor = (hazardLevel: string) => {
    if (hazardLevel.includes('Hazardous')) return 'text-red-400 bg-red-500/20 border-red-500/50';
    if (hazardLevel.includes('Near-Earth')) return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
    return 'text-green-400 bg-green-500/20 border-green-500/50';
  };

  const getSizeCategoryColor = (category: string) => {
    switch (category) {
      case 'Very Large': return 'text-red-400';
      case 'Large': return 'text-orange-400';
      case 'Medium': return 'text-yellow-400';
      case 'Small': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black px-4 md:px-6 lg:px-8 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <Link
          href="/asteroids"
          className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors mb-6"
        >
          ← Back to Asteroid Tracking
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {asteroid.fullName}
          </h1>
          <div className="flex flex-wrap gap-3">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getHazardColor(asteroid.hazardLevel)}`}>
              {asteroid.hazardLevel}
            </span>
            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-800/50 border border-gray-700/50 text-gray-300">
              {asteroid.orbitClass}
            </span>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getSizeCategoryColor(asteroid.sizeCategory)}`}>
              {asteroid.sizeCategory}
            </span>
          </div>
        </motion.div>

        {/* Overview Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-sm rounded-lg border border-blue-800/50 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-400 mb-1">Designation</p>
                <p className="text-white font-semibold">{asteroid.designation}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Orbit Type</p>
                <p className="text-white font-semibold">{asteroid.orbitClass}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Spectral Type</p>
                <p className="text-white font-semibold">{asteroid.spectralType}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <p className="text-gray-300">{asteroid.descriptions.orbitDescription}</p>
            </div>
          </div>
        </motion.section>

        {/* Alternative Designations */}
        {asteroid.alternativeDesignations && (asteroid.alternativeDesignations.provisional || asteroid.alternativeDesignations.name) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Alternative Designations</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <p className="text-gray-400 text-sm mb-1">Primary Designation</p>
                  <p className="text-xl font-bold text-white">{asteroid.alternativeDesignations.primary}</p>
                </div>

                {asteroid.alternativeDesignations.name && (
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-700/50">
                    <p className="text-gray-400 text-sm mb-1">Name</p>
                    <p className="text-xl font-bold text-cyan-400">{asteroid.alternativeDesignations.name}</p>
                  </div>
                )}

                {asteroid.alternativeDesignations.provisional && (
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <p className="text-gray-400 text-sm mb-1">Provisional Designation</p>
                    <p className="text-xl font-bold text-orange-400">{asteroid.alternativeDesignations.provisional}</p>
                    <p className="text-xs text-gray-500 mt-1">Discovery designation</p>
                  </div>
                )}
              </div>

              <div className="mt-4 p-4 bg-blue-900/20 border border-blue-800/50 rounded-lg">
                <p className="text-blue-200 text-sm">
                  Asteroids receive provisional designations upon discovery (e.g., {asteroid.alternativeDesignations.provisional || 'YYYY XX###'}),
                  then are assigned permanent numbers ({asteroid.alternativeDesignations.primary}) once their orbits are well-determined.
                  Some asteroids also receive names approved by the International Astronomical Union.
                </p>
              </div>
            </div>
          </motion.section>
        )}

        {/* Discovery & Observation History */}
        {(orbit.firstObservation || orbit.lastObservation || orbit.dataArc || typeof orbit.moid === 'number') && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="mb-8"
          >
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Discovery & Observation History</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {orbit.firstObservation && (
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <p className="text-gray-400 text-sm mb-1">First Observed</p>
                    <p className="text-xl font-bold text-cyan-400">{orbit.firstObservation}</p>
                  </div>
                )}

                {orbit.lastObservation && (
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <p className="text-gray-400 text-sm mb-1">Last Observed</p>
                    <p className="text-xl font-bold text-green-400">{orbit.lastObservation}</p>
                  </div>
                )}

                {orbit.dataArc && (
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <p className="text-gray-400 text-sm mb-1">Observation Arc</p>
                    <p className="text-2xl font-bold text-purple-400">{orbit.dataArc}</p>
                    <p className="text-xs text-gray-500 mt-1">days of observations</p>
                  </div>
                )}

                {typeof orbit.moid === 'number' && (
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <p className="text-gray-400 text-sm mb-1">MOID (Earth)</p>
                    <p className="text-2xl font-bold text-orange-400">{orbit.moid.toFixed(4)} AU</p>
                    <p className="text-xs text-gray-500 mt-1">Minimum orbit intersection distance</p>
                  </div>
                )}

                {orbit.orbitUncertainty && (
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <p className="text-gray-400 text-sm mb-1">Orbit Uncertainty</p>
                    <p className="text-2xl font-bold text-white">{orbit.orbitUncertainty}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {orbit.orbitUncertainty === '0' ? 'Very well determined' :
                       parseInt(orbit.orbitUncertainty) <= 3 ? 'Well determined' :
                       parseInt(orbit.orbitUncertainty) <= 6 ? 'Moderately uncertain' :
                       'Poorly determined'}
                    </p>
                  </div>
                )}
              </div>

              {(orbit.firstObservation && orbit.lastObservation && orbit.dataArc) && (
                <div className="mt-4 p-4 bg-blue-900/20 border border-blue-800/50 rounded-lg">
                  <p className="text-blue-200 text-sm">
                    This asteroid has been observed for{' '}
                    <span className="font-semibold">
                      {Math.floor(parseInt(orbit.dataArc) / 365.25)} years
                    </span>
                    , providing a well-constrained orbit.
                    {typeof orbit.moid === 'number' && orbit.moid < 0.05 && (
                      <span className="text-orange-300"> The minimum orbit intersection distance (MOID) is less than 0.05 AU, making this a near-Earth object of interest.</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </motion.section>
        )}

        {/* Physical Properties */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Physical Properties</h2>

            {/* Size Description */}
            <div className="mb-6 p-4 bg-purple-900/20 border border-purple-800/50 rounded-lg">
              <p className="text-purple-300">{asteroid.descriptions.sizeDescription}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {typeof phys.diameter === 'number' && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <p className="text-gray-400 text-sm mb-1">Diameter</p>
                  <p className="text-2xl font-bold text-cyan-400">{phys.diameter.toFixed(2)} {phys.diameterUnit}</p>
                </div>
              )}

              {typeof phys.absoluteMagnitude === 'number' && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <p className="text-gray-400 text-sm mb-1">Absolute Magnitude</p>
                  <p className="text-2xl font-bold text-white">{phys.absoluteMagnitude.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">Lower = brighter/larger</p>
                </div>
              )}

              {typeof phys.albedo === 'number' && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <p className="text-gray-400 text-sm mb-1">Albedo</p>
                  <p className="text-2xl font-bold text-white">{phys.albedo.toFixed(3)}</p>
                  <p className="text-xs text-gray-500 mt-1">Surface reflectivity</p>
                </div>
              )}

              {typeof phys.rotationPeriod === 'number' && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <p className="text-gray-400 text-sm mb-1">Rotation Period</p>
                  <p className="text-2xl font-bold text-orange-400">{phys.rotationPeriod.toFixed(2)} {phys.rotationUnit}</p>
                </div>
              )}

              {typeof phys.density === 'number' && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <p className="text-gray-400 text-sm mb-1">Density</p>
                  <p className="text-2xl font-bold text-white">{phys.density.toFixed(2)} {phys.densityUnit}</p>
                </div>
              )}

              {phys.extent && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <p className="text-gray-400 text-sm mb-1">Dimensions</p>
                  <p className="text-lg font-bold text-white">{phys.extent}</p>
                  <p className="text-xs text-gray-500 mt-1">Tri-axial extent</p>
                </div>
              )}
            </div>

            {/* Spectral Type Description */}
            <div className="mt-6 p-4 bg-gray-800/30 border border-gray-700/50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Composition</h3>
              <p className="text-gray-300">{asteroid.descriptions.spectralDescription}</p>
            </div>
          </div>
        </motion.section>

        {/* Size Comparison */}
        {phys.diameter && phys.diameter > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-sm rounded-lg border border-indigo-800/50 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Size Comparison</h2>

              {(() => {
                // Convert diameter to meters
                const diameterMeters = phys.diameter * 1000;

                // Define familiar objects for comparison
                const familiarObjects = [
                  { name: 'Football Field', size: 109, unit: 'm', icon: '🏈' },
                  { name: 'Statue of Liberty', size: 93, unit: 'm', icon: '🗽' },
                  { name: 'Eiffel Tower', size: 330, unit: 'm', icon: '🗼' },
                  { name: 'Empire State Building', size: 443, unit: 'm', icon: '🏢' },
                  { name: 'Burj Khalifa', size: 828, unit: 'm', icon: '🏙️' },
                  { name: 'Mount Everest', size: 8849, unit: 'm', icon: '⛰️' },
                ];

                // Find closest comparison
                const closestObject = familiarObjects.reduce((prev, curr) => {
                  return Math.abs(curr.size - diameterMeters) < Math.abs(prev.size - diameterMeters) ? curr : prev;
                });

                // Calculate how many times larger/smaller
                const ratio = diameterMeters / closestObject.size;
                const comparisonText = ratio > 1.5
                  ? `${ratio.toFixed(1)}× larger than ${closestObject.name}`
                  : ratio < 0.67
                  ? `${(1/ratio).toFixed(1)}× smaller than ${closestObject.name}`
                  : `Similar size to ${closestObject.name}`;

                // Filter objects for visual scale (show 3-5 objects)
                const scaleObjects = familiarObjects.filter(obj => {
                  const objRatio = diameterMeters / obj.size;
                  return objRatio > 0.1 && objRatio < 10;
                }).slice(0, 5);

                return (
                  <>
                    {/* Main Comparison */}
                    <div className="mb-6 p-4 bg-indigo-900/20 border border-indigo-800/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-indigo-200 text-lg font-semibold mb-1">
                            {closestObject.icon} {comparisonText}
                          </p>
                          <p className="text-indigo-300 text-sm">
                            {diameterMeters >= 1000
                              ? `${phys.diameter.toFixed(2)} km (${(diameterMeters/1000).toFixed(1)} thousand meters)`
                              : `${diameterMeters.toFixed(0)} meters`
                            }
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold text-3xl">{phys.diameter.toFixed(2)} km</p>
                          <p className="text-gray-400 text-sm">diameter</p>
                        </div>
                      </div>
                    </div>

                    {/* Visual Scale Bars */}
                    <div className="space-y-3 mb-6">
                      <h3 className="text-lg font-semibold text-white mb-3">Visual Scale</h3>

                      {/* Asteroid bar */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-cyan-400 font-semibold text-sm">{asteroid.fullName}</span>
                          <span className="text-cyan-400 text-sm">{diameterMeters >= 1000 ? `${phys.diameter.toFixed(2)} km` : `${diameterMeters.toFixed(0)} m`}</span>
                        </div>
                        <div className="h-8 bg-cyan-600 rounded-lg relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-cyan-700"></div>
                        </div>
                      </div>

                      {/* Comparison objects */}
                      {scaleObjects.map((obj, idx) => {
                        const widthPercent = Math.min((obj.size / diameterMeters) * 100, 100);
                        return (
                          <div key={idx}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-gray-300 text-sm">{obj.icon} {obj.name}</span>
                              <span className="text-gray-400 text-sm">{obj.size} {obj.unit}</span>
                            </div>
                            <div className="h-6 bg-gray-700/30 rounded relative">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-purple-700 rounded"
                                style={{ width: `${widthPercent}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Fun Facts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                        <p className="text-gray-400 text-sm mb-1">Football Fields</p>
                        <p className="text-white font-bold text-xl">
                          {(diameterMeters / 109).toFixed(1)} fields
                        </p>
                        <p className="text-xs text-gray-500 mt-1">across the diameter</p>
                      </div>

                      {diameterMeters >= 1000 && (
                        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                          <p className="text-gray-400 text-sm mb-1">City Blocks</p>
                          <p className="text-white font-bold text-xl">
                            {(diameterMeters / 80).toFixed(0)} blocks
                          </p>
                          <p className="text-xs text-gray-500 mt-1">approximately</p>
                        </div>
                      )}

                      {diameterMeters < 1000 && (
                        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                          <p className="text-gray-400 text-sm mb-1">Statue of Liberty</p>
                          <p className="text-white font-bold text-xl">
                            {(diameterMeters / 93).toFixed(1)}×
                          </p>
                          <p className="text-xs text-gray-500 mt-1">times the size</p>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </motion.section>
        )}

        {/* Orbital Elements */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Orbital Elements</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {typeof orbit.semiMajorAxis === 'number' && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <p className="text-gray-400 text-sm mb-1">Semi-Major Axis</p>
                  <p className="text-2xl font-bold text-cyan-400">{orbit.semiMajorAxis.toFixed(3)} {orbit.semiMajorAxisUnit}</p>
                </div>
              )}

              {typeof orbit.eccentricity === 'number' && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <p className="text-gray-400 text-sm mb-1">Eccentricity</p>
                  <p className="text-2xl font-bold text-white">{orbit.eccentricity.toFixed(4)}</p>
                  <p className="text-xs text-gray-500 mt-1">0 = circular, 1 = parabolic</p>
                </div>
              )}

              {typeof orbit.inclination === 'number' && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <p className="text-gray-400 text-sm mb-1">Inclination</p>
                  <p className="text-2xl font-bold text-orange-400">{orbit.inclination.toFixed(2)}°</p>
                </div>
              )}

              {typeof orbit.perihelionDistance === 'number' && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <p className="text-gray-400 text-sm mb-1">Perihelion Distance</p>
                  <p className="text-2xl font-bold text-white">{orbit.perihelionDistance.toFixed(3)} AU</p>
                  <p className="text-xs text-gray-500 mt-1">Closest to Sun</p>
                </div>
              )}

              {typeof orbit.orbitalPeriod === 'number' && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <p className="text-gray-400 text-sm mb-1">Orbital Period</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {orbit.orbitalPeriod < 365
                      ? `${orbit.orbitalPeriod.toFixed(0)} days`
                      : `${(orbit.orbitalPeriod / 365.25).toFixed(2)} years`
                    }
                  </p>
                </div>
              )}

              {typeof orbit.longitudeAscendingNode === 'number' && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <p className="text-gray-400 text-sm mb-1">Longitude of Asc. Node</p>
                  <p className="text-xl font-bold text-white">{orbit.longitudeAscendingNode.toFixed(2)}°</p>
                </div>
              )}

              {typeof orbit.argumentPerihelion === 'number' && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <p className="text-gray-400 text-sm mb-1">Argument of Perihelion</p>
                  <p className="text-xl font-bold text-white">{orbit.argumentPerihelion.toFixed(2)}°</p>
                </div>
              )}

              {typeof orbit.meanAnomaly === 'number' && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <p className="text-gray-400 text-sm mb-1">Mean Anomaly</p>
                  <p className="text-xl font-bold text-white">{orbit.meanAnomaly.toFixed(2)}°</p>
                </div>
              )}

              {orbit.epoch && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <p className="text-gray-400 text-sm mb-1">Epoch</p>
                  <p className="text-lg font-bold text-white">{orbit.epoch}</p>
                  <p className="text-xs text-gray-500 mt-1">Reference time</p>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Radar Observations */}
        {radarData && radarData.totalObservations > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-br from-green-900/30 to-teal-900/30 backdrop-blur-sm rounded-lg border border-green-800/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Radar Observations</h2>
                <span className="px-3 py-1 bg-green-600/30 text-green-300 text-sm font-semibold rounded-full">
                  {radarData.totalObservations} observations
                </span>
              </div>

              <div className="mb-4 p-4 bg-teal-900/20 border border-teal-800/50 rounded-lg">
                <p className="text-teal-200 text-sm">
                  Radar observations provide precise measurements used to determine shape models, rotation rates, and surface characteristics.
                  Data from planetary radar systems like Goldstone and Arecibo.
                </p>
              </div>

              {/* Recent Observations Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <p className="text-gray-400 text-sm mb-1">Total Observations</p>
                  <p className="text-2xl font-bold text-green-400">{radarData.totalObservations}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <p className="text-gray-400 text-sm mb-1">Latest Observation</p>
                  <p className="text-lg font-bold text-white">
                    {new Date(radarData.observations[0].epoch).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <p className="text-gray-400 text-sm mb-1">Primary Station</p>
                  <p className="text-lg font-bold text-cyan-400">
                    {radarData.observations[0].transmitterName}
                  </p>
                </div>
              </div>

              {/* Observation Details */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {radarData.observations.slice(0, 10).map((obs, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50 hover:border-green-700/50 transition-colors"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-gray-400 mb-1">Date</p>
                        <p className="text-white font-semibold">{obs.epoch}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Type</p>
                        <p className="text-white font-semibold">{obs.measurementType}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Station</p>
                        <p className="text-cyan-400 font-semibold">{obs.transmitterName}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Frequency</p>
                        <p className="text-white font-semibold">{obs.frequency} MHz</p>
                      </div>
                    </div>
                    {obs.observer && (
                      <div className="mt-2 pt-2 border-t border-gray-700/50">
                        <p className="text-gray-400 text-xs">Observer: <span className="text-gray-300">{obs.observer}</span></p>
                      </div>
                    )}
                  </div>
                ))}
                {radarData.observations.length > 10 && (
                  <div className="text-center py-2 text-gray-400 text-sm">
                    Showing 10 of {radarData.totalObservations} observations
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        )}

        {radarLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 text-center text-gray-500 text-sm"
          >
            <p>Loading radar data...</p>
          </motion.div>
        )}

        {/* Close Approach Data */}
        {closeApproachData && closeApproachData.summary.total > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 backdrop-blur-sm rounded-lg border border-orange-800/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Close Approaches to Earth</h2>
                <span className="px-3 py-1 bg-orange-600/30 text-orange-300 text-sm font-semibold rounded-full">
                  {closeApproachData.summary.total} approaches found
                </span>
              </div>

              <div className="mb-4 p-4 bg-orange-900/20 border border-orange-800/50 rounded-lg">
                <p className="text-orange-200 text-sm">
                  Close approach data shows when this asteroid passes near Earth.
                  Distances within 0.05 AU (~7.5 million km) are considered significant.
                </p>
              </div>

              {/* Summary Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <p className="text-gray-400 text-sm mb-1">Total Approaches</p>
                  <p className="text-2xl font-bold text-white">{closeApproachData.summary.total}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {closeApproachData.summary.future} future, {closeApproachData.summary.past} past
                  </p>
                </div>

                {closeApproachData.summary.closestEver && (
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <p className="text-gray-400 text-sm mb-1">Closest Approach Ever</p>
                    <p className="text-2xl font-bold text-red-400">
                      {closeApproachData.summary.closestEver.distanceLunar.toFixed(2)} LD
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(closeApproachData.summary.closestEver.dateCalendar).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {closeApproachData.summary.nextApproach && (
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                    <p className="text-gray-400 text-sm mb-1">Next Approach</p>
                    <p className="text-2xl font-bold text-cyan-400">
                      {closeApproachData.summary.nextApproach.distanceLunar.toFixed(2)} LD
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(closeApproachData.summary.nextApproach.dateCalendar).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Future Approaches */}
              {closeApproachData.approaches.future.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-3">Upcoming Approaches</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {closeApproachData.approaches.future.slice(0, 5).map((approach, idx) => {
                      const getSeverityColor = (severity: string) => {
                        switch (severity) {
                          case 'extreme': return 'border-red-600 bg-red-900/30';
                          case 'very-close': return 'border-orange-600 bg-orange-900/30';
                          case 'close': return 'border-yellow-600 bg-yellow-900/30';
                          case 'moderate': return 'border-blue-600 bg-blue-900/30';
                          default: return 'border-gray-600 bg-gray-800/30';
                        }
                      };

                      return (
                        <div
                          key={idx}
                          className={`rounded-lg p-4 border-2 ${getSeverityColor(approach.severity)}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-white font-bold text-lg">
                              {new Date(approach.dateCalendar).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              approach.severity === 'extreme' ? 'bg-red-600 text-white' :
                              approach.severity === 'very-close' ? 'bg-orange-600 text-white' :
                              approach.severity === 'close' ? 'bg-yellow-600 text-black' :
                              'bg-blue-600 text-white'
                            }`}>
                              {approach.description}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-gray-400">Distance (AU)</p>
                              <p className="text-white font-semibold">{approach.distanceAU.toFixed(4)}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Lunar Distances</p>
                              <p className="text-white font-semibold">{approach.distanceLunar.toFixed(2)} LD</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Distance (km)</p>
                              <p className="text-white font-semibold">{approach.distanceKm.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Velocity</p>
                              <p className="text-white font-semibold">{approach.velocity.toFixed(2)} km/s</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {closeApproachData.approaches.future.length > 5 && (
                      <div className="text-center py-2 text-gray-400 text-sm">
                        Showing 5 of {closeApproachData.approaches.future.length} future approaches
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Past Approaches */}
              {closeApproachData.approaches.past.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Past Approaches</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {closeApproachData.approaches.past.slice(0, 3).map((approach, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/50"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-white font-semibold">
                            {new Date(approach.dateCalendar).toLocaleDateString()}
                          </p>
                          <div className="flex gap-3 text-sm">
                            <span className="text-gray-400">
                              {approach.distanceLunar.toFixed(2)} LD
                            </span>
                            <span className="text-gray-500">
                              {approach.velocity.toFixed(2)} km/s
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {closeApproachData.approaches.past.length > 3 && (
                      <div className="text-center py-2 text-gray-400 text-sm">
                        Showing 3 of {closeApproachData.approaches.past.length} past approaches
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.section>
        )}

        {closeApproachLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 text-center text-gray-500 text-sm"
          >
            <p>Loading close approach data...</p>
          </motion.div>
        )}

        {/* Impact Risk Assessment (Sentry) */}
        {sentryData && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            {sentryData.monitored ? (
              <div className="bg-gradient-to-br from-red-900/40 to-orange-900/40 backdrop-blur-sm rounded-lg border-2 border-red-700/70 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">Impact Risk Assessment</h2>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    sentryData.risk && sentryData.risk.torinoScale === 0 ? 'bg-green-600 text-white' :
                    sentryData.risk && sentryData.risk.torinoScale === 1 ? 'bg-yellow-600 text-black' :
                    sentryData.risk && sentryData.risk.torinoScale <= 4 ? 'bg-orange-600 text-white' :
                    'bg-red-600 text-white'
                  }`}>
                    {sentryData.status}
                  </span>
                </div>

                <div className="mb-4 p-4 bg-red-900/30 border border-red-800/50 rounded-lg">
                  <p className="text-red-200 text-sm font-semibold">
                    ⚠️ This asteroid is being monitored by NASA&apos;s Sentry impact monitoring system.
                  </p>
                </div>

                {sentryData.risk && (
                  <>
                    {/* Risk Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                        <p className="text-gray-400 text-sm mb-1">Impact Probability</p>
                        <p className="text-2xl font-bold text-red-400">{sentryData.risk.impactOdds}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {(sentryData.risk.impactProbability * 100).toExponential(2)}%
                        </p>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                        <p className="text-gray-400 text-sm mb-1">Torino Scale</p>
                        <p className="text-3xl font-bold text-orange-400">{sentryData.risk.torinoScale}</p>
                        <p className="text-xs text-gray-500 mt-1">Public hazard scale (0-10)</p>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                        <p className="text-gray-400 text-sm mb-1">Palermo Scale</p>
                        <p className="text-2xl font-bold text-white">{sentryData.risk.palermoScale.toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-1">Technical hazard scale</p>
                      </div>
                    </div>

                    {/* Hazard Description */}
                    <div className="space-y-3">
                      <div className={`p-4 rounded-lg border-2 ${
                        sentryData.risk.hazardColor === 'white' ? 'bg-gray-800/50 border-gray-600' :
                        sentryData.risk.hazardColor === 'green' ? 'bg-green-900/30 border-green-600' :
                        sentryData.risk.hazardColor === 'yellow' ? 'bg-yellow-900/30 border-yellow-600' :
                        sentryData.risk.hazardColor === 'orange' ? 'bg-orange-900/30 border-orange-600' :
                        'bg-red-900/30 border-red-600'
                      }`}>
                        <h3 className="text-white font-bold mb-2">Torino Scale Assessment</h3>
                        <p className="text-gray-200 text-sm">{sentryData.risk.hazardDescription}</p>
                      </div>

                      <div className="p-4 bg-gray-800/30 border border-gray-700/50 rounded-lg">
                        <h3 className="text-white font-bold mb-2">Palermo Scale Assessment</h3>
                        <p className="text-gray-200 text-sm">{sentryData.risk.palermoInterpretation}</p>
                      </div>

                      <div className="p-4 bg-purple-900/20 border border-purple-800/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 text-sm">Number of Potential Impacts</span>
                          <span className="text-white font-bold text-lg">{sentryData.risk.numberOfImpacts}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-green-900/30 to-blue-900/30 backdrop-blur-sm rounded-lg border border-green-800/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">Impact Risk Assessment</h2>
                  <span className="px-3 py-1 bg-green-600/30 text-green-300 text-sm font-semibold rounded-full">
                    {sentryData.status}
                  </span>
                </div>

                <div className="p-4 bg-green-900/20 border border-green-800/50 rounded-lg">
                  <p className="text-green-200 text-sm">
                    ✓ {sentryData.message || 'This asteroid is not currently monitored for impact risk by the Sentry system.'}
                  </p>
                </div>
              </div>
            )}
          </motion.section>
        )}

        {sentryLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 text-center text-gray-500 text-sm"
          >
            <p>Loading impact risk data...</p>
          </motion.div>
        )}

        {/* Mission Accessibility */}
        {missionData && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mb-8"
          >
            {missionData.accessible ? (
              <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-sm rounded-lg border-2 border-blue-700/70 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">Mission Accessibility</h2>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    missionData.mission && missionData.mission.accessibilityColor === 'green' ? 'bg-green-600 text-white' :
                    missionData.mission && missionData.mission.accessibilityColor === 'blue' ? 'bg-blue-600 text-white' :
                    missionData.mission && missionData.mission.accessibilityColor === 'yellow' ? 'bg-yellow-600 text-black' :
                    'bg-orange-600 text-white'
                  }`}>
                    {missionData.status}
                  </span>
                </div>

                <div className="mb-4 p-4 bg-blue-900/30 border border-blue-800/50 rounded-lg">
                  <p className="text-blue-200 text-sm font-semibold">
                    🚀 {missionData.mission?.accessibilityDescription}
                  </p>
                  <p className="text-blue-300 text-sm mt-2">
                    {missionData.mission?.missionType}
                  </p>
                </div>

                {missionData.mission && (
                  <>
                    {/* Mission Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                        <p className="text-gray-400 text-sm mb-1">Minimum Delta-V</p>
                        <p className="text-2xl font-bold text-cyan-400">{missionData.mission.minimumDeltaV.value.toFixed(2)} km/s</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {missionData.mission.minimumDeltaV.duration} days total
                        </p>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                        <p className="text-gray-400 text-sm mb-1">Shortest Duration</p>
                        <p className="text-2xl font-bold text-white">{missionData.mission.shortestDuration.value} days</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {missionData.mission.shortestDuration.deltaV.toFixed(2)} km/s delta-V
                        </p>
                      </div>

                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                        <p className="text-gray-400 text-sm mb-1">Viable Trajectories</p>
                        <p className="text-2xl font-bold text-green-400">
                          {missionData.mission.viableTrajectories.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Mission opportunities</p>
                      </div>
                    </div>

                    {/* Optimal Mission Details */}
                    {missionData.mission.minimumDeltaV.trajectory && (
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-white mb-3">Optimal Low Delta-V Mission</h3>
                        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-gray-400 text-sm">Launch Date</p>
                              <p className="text-white font-semibold">
                                {new Date(missionData.mission.minimumDeltaV.trajectory.launchDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Outbound</p>
                              <p className="text-white font-semibold">
                                {missionData.mission.minimumDeltaV.trajectory.outboundDuration} days
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Stay Time</p>
                              <p className="text-white font-semibold">
                                {missionData.mission.minimumDeltaV.trajectory.stayTime} days
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Return</p>
                              <p className="text-white font-semibold">
                                {missionData.mission.minimumDeltaV.trajectory.returnDuration} days
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-700/50 grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-gray-400 text-sm">Total Delta-V</p>
                              <p className="text-cyan-400 font-semibold">
                                {missionData.mission.minimumDeltaV.trajectory.deltaV.toFixed(2)} km/s
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">C3 Energy</p>
                              <p className="text-white font-semibold">
                                {missionData.mission.minimumDeltaV.trajectory.c3Energy.toFixed(2)} km²/s²
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Total Duration</p>
                              <p className="text-white font-semibold">
                                {missionData.mission.minimumDeltaV.trajectory.totalDuration} days
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quick Mission Details */}
                    {missionData.mission.shortestDuration.trajectory && (
                      <div>
                        <h3 className="text-xl font-bold text-white mb-3">Fastest Mission Profile</h3>
                        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-gray-400 text-sm">Launch Date</p>
                              <p className="text-white font-semibold">
                                {new Date(missionData.mission.shortestDuration.trajectory.launchDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Total Duration</p>
                              <p className="text-white font-semibold">
                                {missionData.mission.shortestDuration.trajectory.totalDuration} days
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Stay Time</p>
                              <p className="text-white font-semibold">
                                {missionData.mission.shortestDuration.trajectory.stayTime} days
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Delta-V Required</p>
                              <p className="text-orange-400 font-semibold">
                                {missionData.mission.shortestDuration.deltaV.toFixed(2)} km/s
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-900/30 to-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-700/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">Mission Accessibility</h2>
                  <span className="px-3 py-1 bg-gray-600/30 text-gray-300 text-sm font-semibold rounded-full">
                    {missionData.status}
                  </span>
                </div>

                <div className="p-4 bg-gray-800/20 border border-gray-700/50 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    {missionData.message || 'This asteroid is not currently classified as accessible for human missions.'}
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    NHATS (Near-Earth Object Human Space Flight Accessible Targets Study) tracks asteroids
                    with favorable trajectories and low delta-V requirements for human missions.
                  </p>
                </div>
              </div>
            )}
          </motion.section>
        )}

        {missionLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 text-center text-gray-500 text-sm"
          >
            <p>Loading mission accessibility data...</p>
          </motion.div>
        )}

        {/* Observation Opportunities */}
        {observationData && observationData.hasOpportunities && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-sm rounded-lg border-2 border-purple-700/70 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Observation Opportunities</h2>
                {observationData.currentStatus?.visible ? (
                  <span className="px-3 py-1 bg-green-600 text-white text-sm font-semibold rounded-full">
                    Currently Visible
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-600/30 text-gray-300 text-sm font-semibold rounded-full">
                    Not Currently Visible
                  </span>
                )}
              </div>

              {/* Current Status */}
              <div className="mb-4 p-4 bg-purple-900/30 border border-purple-800/50 rounded-lg">
                {observationData.currentStatus?.visible ? (
                  <div>
                    <p className="text-purple-200 text-sm font-semibold mb-2">
                      🔭 {observationData.currentStatus.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-purple-300">Magnitude:</span>
                        <span className="text-white ml-2 font-semibold">
                          {observationData.currentStatus.magnitude?.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-purple-300">Equipment:</span>
                        <span className="text-white ml-2 font-semibold">
                          {observationData.currentStatus.equipment}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-purple-200 text-sm">
                    {observationData.currentStatus?.message || 'Not currently in favorable position for observation'}
                  </p>
                )}
              </div>

              {/* Best Opportunity */}
              {observationData.bestOpportunity && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-3">Best Viewing Opportunity</h3>
                  <div className="bg-gradient-to-r from-purple-800/30 to-indigo-800/30 rounded-lg p-4 border-2 border-purple-600/50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-purple-300 text-sm">Peak Date</p>
                        <p className="text-white font-bold text-lg">
                          {new Date(observationData.bestOpportunity.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-purple-300 text-sm">Apparent Magnitude</p>
                        <p className={`font-bold text-2xl ${
                          observationData.bestOpportunity.magnitude < 6 ? 'text-green-400' :
                          observationData.bestOpportunity.magnitude < 10 ? 'text-cyan-400' :
                          observationData.bestOpportunity.magnitude < 14 ? 'text-yellow-400' :
                          'text-orange-400'
                        }`}>
                          {observationData.bestOpportunity.magnitude.toFixed(2)}
                        </p>
                        <p className="text-xs text-purple-200 mt-1">(lower = brighter)</p>
                      </div>
                      <div>
                        <p className="text-purple-300 text-sm">Observability</p>
                        <p className="text-white font-bold text-lg">
                          {observationData.bestOpportunity.rating}/10
                        </p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-purple-700/50">
                      <p className="text-purple-200 text-sm mb-2">
                        {observationData.bestOpportunity.description}
                      </p>
                      <p className="text-purple-300 text-sm">
                        <span className="font-semibold">Recommended Equipment:</span> {observationData.bestOpportunity.equipment}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Upcoming Opportunities */}
              {observationData.windows && observationData.windows.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Upcoming Viewing Windows
                    {observationData.total && observationData.total > observationData.windows.length && (
                      <span className="text-sm text-purple-300 ml-2 font-normal">
                        (Showing top {observationData.windows.length} of {observationData.total})
                      </span>
                    )}
                  </h3>
                  <div className="space-y-3">
                    {observationData.windows.map((window, idx) => {
                      const getVisibilityColor = (visibility: string) => {
                        switch (visibility) {
                          case 'naked-eye': return 'border-green-600 bg-green-900/30';
                          case 'binoculars': return 'border-cyan-600 bg-cyan-900/30';
                          case 'small-telescope': return 'border-yellow-600 bg-yellow-900/30';
                          case 'large-telescope': return 'border-orange-600 bg-orange-900/30';
                          default: return 'border-gray-600 bg-gray-800/30';
                        }
                      };

                      return (
                        <div
                          key={idx}
                          className={`rounded-lg p-4 border ${getVisibilityColor(window.visibility)}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-white font-bold">
                              {new Date(window.peakDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-600 text-white">
                              Rating: {window.observabilityRating}/10
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-gray-400">Magnitude</p>
                              <p className="text-white font-semibold">{window.peakMagnitude.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Distance</p>
                              <p className="text-white font-semibold">{window.peakDistance.toFixed(4)} AU</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Visibility</p>
                              <p className="text-white font-semibold capitalize">
                                {window.visibility.replace('-', ' ')}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400">Window</p>
                              <p className="text-white font-semibold">
                                {new Date(window.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(window.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-700/50">
                            <p className="text-gray-300 text-sm">{window.recommendedEquipment}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.section>
        )}

        {observationLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 text-center text-gray-500 text-sm"
          >
            <p>Loading observation data...</p>
          </motion.div>
        )}

        {/* Related Objects */}
        {(() => {
          // Define well-known asteroids by orbital class
          const relatedAsteroids: Record<string, Array<{id: string, name: string, description: string}>> = {
            'Apollo': [
              { id: '1862', name: 'Apollo', description: 'The namesake of the Apollo group' },
              { id: '99942', name: 'Apophis', description: 'Famous for its 2029 close approach' },
              { id: '101955', name: 'Bennu', description: 'OSIRIS-REx sample return target' },
              { id: '4179', name: 'Toutatis', description: 'Elongated, tumbling asteroid' },
            ],
            'Aten': [
              { id: '2062', name: 'Aten', description: 'The namesake of the Aten group' },
              { id: '99942', name: 'Apophis', description: 'Famous for its 2029 close approach' },
              { id: '3753', name: 'Cruithne', description: 'Earth\'s quasi-satellite' },
            ],
            'Amor': [
              { id: '1221', name: 'Amor', description: 'The namesake of the Amor group' },
              { id: '433', name: 'Eros', description: 'First NEO discovered, NEAR mission target' },
              { id: '1036', name: 'Ganymed', description: 'Largest Amor asteroid' },
            ],
            'Atira': [
              { id: '163693', name: 'Atira', description: 'The namesake, orbits entirely inside Earth' },
            ],
          };

          const currentOrbitClass = asteroid.orbitClass;
          const related = relatedAsteroids[currentOrbitClass] || [];

          // Filter out the current asteroid
          const filteredRelated = related.filter(r => r.id !== asteroidId);

          if (filteredRelated.length === 0) return null;

          return (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-br from-teal-900/30 to-emerald-900/30 backdrop-blur-sm rounded-lg border border-teal-800/50 p-6">
                <h2 className="text-2xl font-bold text-white mb-4">Related Objects</h2>

                <div className="mb-4 p-4 bg-teal-900/20 border border-teal-800/50 rounded-lg">
                  <p className="text-teal-200 text-sm">
                    Other well-known asteroids in the <span className="font-semibold">{currentOrbitClass}</span> orbital family.
                    These objects share similar orbital characteristics with {asteroid.alternativeDesignations?.name || asteroid.designation}.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRelated.map((related, idx) => (
                    <Link
                      key={idx}
                      href={`/asteroids/${related.id}`}
                      className="block"
                    >
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-teal-600 hover:bg-teal-900/20 transition-all cursor-pointer group">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-white font-bold text-lg group-hover:text-teal-400 transition-colors">
                              {related.name}
                            </p>
                            <p className="text-gray-400 text-sm">ID: {related.id}</p>
                          </div>
                          <span className="text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            →
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm">{related.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-gray-800/30 border border-gray-700/50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">About {currentOrbitClass} Asteroids</h3>
                  <p className="text-gray-300 text-sm">
                    {currentOrbitClass === 'Apollo' && 'Apollo asteroids cross Earth\'s orbit with semi-major axes greater than Earth\'s (1.0 AU). They are named after 1862 Apollo.'}
                    {currentOrbitClass === 'Aten' && 'Aten asteroids cross Earth\'s orbit with semi-major axes less than Earth\'s (1.0 AU). They spend most of their time inside Earth\'s orbit.'}
                    {currentOrbitClass === 'Amor' && 'Amor asteroids approach Earth\'s orbit from outside but don\'t cross it. Their perihelion distances are between 1.017 and 1.3 AU.'}
                    {currentOrbitClass === 'Atira' && 'Atira asteroids orbit entirely within Earth\'s orbit. They are also called Interior-Earth Objects (IEOs).'}
                    {!['Apollo', 'Aten', 'Amor', 'Atira'].includes(currentOrbitClass) && `${currentOrbitClass} asteroids share similar orbital characteristics.`}
                  </p>
                </div>
              </div>
            </motion.section>
          );
        })()}

        {/* Data Source */}
        <div className="text-center text-gray-500 text-sm">
          <p>Data provided by {data.dataSource}</p>
          <p className="mt-2">Last updated: {new Date(data.timestamp).toLocaleString()}</p>
        </div>
      </div>
    </main>
  );
}
