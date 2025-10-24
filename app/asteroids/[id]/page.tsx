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

export default function AsteroidDetailPage() {
  const params = useParams();
  const asteroidId = params.id as string;

  const [data, setData] = useState<AsteroidData | null>(null);
  const [radarData, setRadarData] = useState<RadarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [radarLoading, setRadarLoading] = useState(true);
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

    fetchAsteroidData();
    fetchRadarData();
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

        {/* Data Source */}
        <div className="text-center text-gray-500 text-sm">
          <p>Data provided by {data.dataSource}</p>
          <p className="mt-2">Last updated: {new Date(data.timestamp).toLocaleString()}</p>
        </div>
      </div>
    </main>
  );
}
