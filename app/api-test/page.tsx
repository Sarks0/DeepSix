'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRoverPhotos, useMarsWeather } from '@/hooks/use-nasa-api';
import { useCommunicationDelays, useMissionStatistics } from '@/hooks/use-spacecraft-tracking';

interface APODResult {
  success: boolean;
  title?: string;
  error?: string;
}

interface TestResults {
  apod?: APODResult;
}

export default function APITestPage() {
  const [testResults, setTestResults] = useState<TestResults>({});

  // Test Mars Rover Photos API
  const {
    photos,
    isLoading: photosLoading,
    error: photosError,
  } = useRoverPhotos({
    rover: 'perseverance',
    limit: 5,
  });

  // Test Mars Weather API (InSight - may be deprecated)
  const { weatherData, isLoading: weatherLoading, error: weatherError } = useMarsWeather();

  // Test JPL Horizons Integration
  const { delays, isLoading: delaysLoading, error: delaysError } = useCommunicationDelays();
  const { stats, isLoading: statsLoading } = useMissionStatistics();

  // Test direct NASA API call
  useEffect(() => {
    const testAPOD = async () => {
      try {
        const response = await fetch(
          `https://api.nasa.gov/planetary/apod?api_key=${process.env.NEXT_PUBLIC_NASA_API_KEY}`
        );
        const data = await response.json();
        setTestResults((prev: TestResults) => ({
          ...prev,
          apod: { success: true, title: data.title },
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setTestResults((prev: TestResults) => ({
          ...prev,
          apod: { success: false, error: errorMessage },
        }));
      }
    };

    testAPOD();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
        API Integration Test Dashboard
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NASA API Key Test */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-lg border border-gray-800 p-6"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">🔑 NASA API Key Status</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">API Key Configured</span>
              <span
                className={process.env.NEXT_PUBLIC_NASA_API_KEY ? 'text-green-400' : 'text-red-400'}
              >
                {process.env.NEXT_PUBLIC_NASA_API_KEY ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">APOD Test</span>
              <span className={testResults.apod?.success ? 'text-green-400' : 'text-yellow-400'}>
                {testResults.apod?.success ? '✅ Working' : '⏳ Testing...'}
              </span>
            </div>
            {testResults.apod?.title && (
              <div className="text-sm text-gray-500 mt-2">
                Today&apos;s APOD: {testResults.apod.title}
              </div>
            )}
          </div>
        </motion.div>

        {/* Mars Rover Photos Test */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 rounded-lg border border-gray-800 p-6"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">📸 Mars Rover Photos API</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <span
                className={
                  photosError
                    ? 'text-red-400'
                    : photosLoading
                      ? 'text-yellow-400'
                      : 'text-green-400'
                }
              >
                {photosError ? '❌ Error' : photosLoading ? '⏳ Loading...' : '✅ Working'}
              </span>
            </div>
            {photos && photos.length > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-400">Photos Retrieved</span>
                  <span className="text-blue-400">{photos.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Latest Photo</span>
                  <span className="text-gray-500 text-sm">{photos[0]?.earthDate}</span>
                </div>
              </>
            )}
            {photosError && (
              <div className="text-red-400 text-sm mt-2">Error: {photosError.message}</div>
            )}
          </div>
        </motion.div>

        {/* JPL Horizons / Communication Delays */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900 rounded-lg border border-gray-800 p-6"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            📡 Communication Delays (JPL Horizons)
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <span
                className={
                  delaysError
                    ? 'text-red-400'
                    : delaysLoading
                      ? 'text-yellow-400'
                      : 'text-green-400'
                }
              >
                {delaysError ? '❌ Error' : delaysLoading ? '⏳ Loading...' : '✅ Working'}
              </span>
            </div>
            {delays && delays.length > 0 && (
              <div className="space-y-2 mt-3">
                {delays.slice(0, 3).map((spacecraft) => (
                  <div key={spacecraft.id} className="flex justify-between text-sm">
                    <span className="text-gray-400">{spacecraft.name}</span>
                    <span className="font-mono text-purple-400">{spacecraft.oneWay}</span>
                  </div>
                ))}
              </div>
            )}
            {delaysError && (
              <div className="text-red-400 text-sm mt-2">
                Note: JPL Horizons may require CORS proxy for browser access
              </div>
            )}
          </div>
        </motion.div>

        {/* Mission Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900 rounded-lg border border-gray-800 p-6"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">📊 Mission Statistics</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Data Status</span>
              <span
                className={
                  statsLoading ? 'text-yellow-400' : stats ? 'text-green-400' : 'text-gray-400'
                }
              >
                {statsLoading ? '⏳ Loading...' : stats ? '✅ Available' : '⚠️ No Data'}
              </span>
            </div>
            {stats && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tracked Spacecraft</span>
                  <span className="text-blue-400">{stats.totalSpacecraft}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Furthest</span>
                  <span className="text-purple-400 text-sm">{stats.furthest.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Distance</span>
                  <span className="text-yellow-400 text-sm">{stats.furthest.distance}</span>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Mars Weather Test */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900 rounded-lg border border-gray-800 p-6"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            🌡️ Mars Weather API (InSight)
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <span
                className={
                  weatherError
                    ? 'text-orange-400'
                    : weatherLoading
                      ? 'text-yellow-400'
                      : 'text-green-400'
                }
              >
                {weatherError ? '⚠️ Deprecated' : weatherLoading ? '⏳ Loading...' : '✅ Working'}
              </span>
            </div>
            {weatherData && weatherData.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400">Latest Sol</span>
                <span className="text-blue-400">{weatherData[0]?.sol}</span>
              </div>
            )}
            {weatherError && (
              <div className="text-orange-400 text-sm mt-2">
                InSight mission ended Dec 2022 - API may be deprecated
              </div>
            )}
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-gray-700 p-6 lg:col-span-2"
        >
          <h2 className="text-xl font-semibold mb-4">📋 API Integration Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-1">✅</div>
              <div className="text-sm text-gray-400">NASA API Key</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">{photos && photos.length > 0 ? '✅' : '⏳'}</div>
              <div className="text-sm text-gray-400">Mars Photos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">{delays && delays.length > 0 ? '✅' : '⚠️'}</div>
              <div className="text-sm text-gray-400">JPL Horizons</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">⚠️</div>
              <div className="text-sm text-gray-400">Mars Weather</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Note: JPL Horizons API may require server-side implementation due to CORS restrictions.
            Mars Weather API is deprecated since InSight mission ended.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
