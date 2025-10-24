'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface RadarAsteroid {
  designation: string;
  name: string;
  observations: number;
  latestObservation: string;
  primaryStation: string;
}

// Well-known radar-tracked asteroids
const RADAR_TRACKED_ASTEROIDS: RadarAsteroid[] = [
  { designation: '433', name: 'Eros', observations: 0, latestObservation: '', primaryStation: '' },
  { designation: '1566', name: 'Icarus', observations: 0, latestObservation: '', primaryStation: '' },
  { designation: '1620', name: 'Geographos', observations: 0, latestObservation: '', primaryStation: '' },
  { designation: '1862', name: 'Apollo', observations: 0, latestObservation: '', primaryStation: '' },
  { designation: '2062', name: 'Aten', observations: 0, latestObservation: '', primaryStation: '' },
  { designation: '4179', name: 'Toutatis', observations: 0, latestObservation: '', primaryStation: '' },
  { designation: '99942', name: 'Apophis', observations: 0, latestObservation: '', primaryStation: '' },
  { designation: '101955', name: 'Bennu', observations: 0, latestObservation: '', primaryStation: '' },
];

export function RadarTrackedList() {
  const [asteroids, setAsteroids] = useState<RadarAsteroid[]>(RADAR_TRACKED_ASTEROIDS);
  const [loading, setLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    async function fetchRadarData() {
      const updatedAsteroids: RadarAsteroid[] = [];

      for (const asteroid of RADAR_TRACKED_ASTEROIDS) {
        try {
          const response = await fetch(`/api/asteroids/radar?des=${asteroid.designation}`);
          const data = await response.json();

          if (data.success && data.totalObservations > 0) {
            updatedAsteroids.push({
              ...asteroid,
              observations: data.totalObservations,
              latestObservation: data.observations[0]?.epoch || 'Unknown',
              primaryStation: data.observations[0]?.transmitterName || 'Unknown',
            });
          }
        } catch (error) {
          console.log(`No radar data for ${asteroid.designation}`);
        }
        setLoadedCount((prev) => prev + 1);
      }

      // Sort by number of observations (descending)
      updatedAsteroids.sort((a, b) => b.observations - a.observations);
      setAsteroids(updatedAsteroids);
      setLoading(false);
    }

    fetchRadarData();
  }, []);

  return (
    <div className="bg-gradient-to-br from-green-900/30 to-teal-900/30 backdrop-blur-sm rounded-lg border border-green-800/50 p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Radar-Tracked Asteroids</h2>
        <p className="text-teal-200">
          Asteroids observed by planetary radar systems (Goldstone, Arecibo) for precise shape models and rotation data.
        </p>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mb-4"></div>
          <p className="text-teal-300">Loading radar data... ({loadedCount}/{RADAR_TRACKED_ASTEROIDS.length})</p>
        </div>
      )}

      {!loading && asteroids.length === 0 && (
        <div className="text-center py-8 text-teal-300">
          <p>No radar-tracked asteroids found in the database.</p>
        </div>
      )}

      {!loading && asteroids.length > 0 && (
        <div className="space-y-3">
          {asteroids.map((asteroid, index) => (
            <motion.div
              key={asteroid.designation}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/asteroids/${asteroid.designation}`}
                className="block bg-gray-800/30 rounded-lg p-4 border border-gray-700/50 hover:border-green-700/50 hover:bg-gray-800/50 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors mb-2">
                      {asteroid.designation} {asteroid.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-gray-400 mb-1">Radar Observations</p>
                        <p className="text-green-400 font-semibold">{asteroid.observations}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Latest Observation</p>
                        <p className="text-white font-semibold">
                          {new Date(asteroid.latestObservation).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Primary Station</p>
                        <p className="text-cyan-400 font-semibold">{asteroid.primaryStation}</p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-teal-900/20 border border-teal-800/50 rounded-lg">
        <h3 className="text-sm font-semibold text-teal-300 mb-2">About Planetary Radar</h3>
        <p className="text-sm text-teal-200">
          Planetary radar systems like Goldstone and Arecibo bounce radio waves off asteroids to determine precise shapes,
          sizes, rotation rates, and surface characteristics. This data is crucial for planetary defense and mission planning.
        </p>
      </div>
    </div>
  );
}
