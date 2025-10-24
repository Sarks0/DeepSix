'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Asteroid {
  designation: string;
  name: string;
  fullName: string;
  isNEO: boolean;
  isPHA: boolean;
  absoluteMagnitude: number | null;
  diameter: number | null;
  diameterUnit: string;
  orbitClass: string;
  sizeCategory: string;
  hazardLevel: string;
}

interface SearchResponse {
  success: boolean;
  dataSource: string;
  timestamp: string;
  query: {
    constraints: Record<string, string>;
    limit: number;
  };
  summary: {
    total: number;
    returned: number;
    neo: number;
    pha: number;
    sizeDistribution: {
      veryLarge: number;
      large: number;
      medium: number;
      small: number;
      verySmall: number;
    };
  };
  asteroids: Asteroid[];
}

export function AdvancedSearch() {
  const [neo, setNeo] = useState<string>('any');
  const [pha, setPha] = useState<string>('any');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const [limit, setLimit] = useState<string>('50');

  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      // Build query parameters
      const params = new URLSearchParams();

      if (neo !== 'any') params.append('neo', neo);
      if (pha !== 'any') params.append('pha', pha);
      params.append('limit', limit);

      // Add size filters (using absolute magnitude as proxy)
      if (sizeFilter === 'large') {
        params.append('h-max', '18'); // H < 18 = Large (>1km)
      } else if (sizeFilter === 'medium') {
        params.append('h-min', '18');
        params.append('h-max', '22'); // H 18-22 = Medium (140m-1km)
      } else if (sizeFilter === 'small') {
        params.append('h-min', '22'); // H > 22 = Small (<140m)
      }

      const response = await fetch(`/api/asteroids/sbdb-query?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Search failed');
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const getHazardColor = (hazardLevel: string) => {
    if (hazardLevel.includes('Hazardous')) return 'text-red-400 bg-red-500/20 border-red-500/50';
    if (hazardLevel.includes('Near-Earth')) return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
    return 'text-green-400 bg-green-500/20 border-green-500/50';
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Advanced Asteroid Search</h2>
        <p className="text-gray-400 text-sm">
          Search NASA&apos;s database of 1+ million asteroids using custom filters
        </p>
      </div>

      {/* Search Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* NEO Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Near-Earth Object
          </label>
          <select
            value={neo}
            onChange={(e) => setNeo(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="any">Any</option>
            <option value="true">NEO Only</option>
            <option value="false">Non-NEO Only</option>
          </select>
        </div>

        {/* PHA Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Hazardous Status
          </label>
          <select
            value={pha}
            onChange={(e) => setPha(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="any">Any</option>
            <option value="true">PHA Only</option>
            <option value="false">Non-PHA Only</option>
          </select>
        </div>

        {/* Size Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Size Category
          </label>
          <select
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">All Sizes</option>
            <option value="large">Large (&gt;1km)</option>
            <option value="medium">Medium (140m-1km)</option>
            <option value="small">Small (&lt;140m)</option>
          </select>
        </div>

        {/* Limit */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Max Results
          </label>
          <select
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="250">250</option>
          </select>
        </div>
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        disabled={loading}
        className="w-full md:w-auto px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
      >
        {loading ? 'Searching...' : 'Search Asteroids'}
      </button>

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-900/20 border border-red-800/50 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Results Summary */}
      {data && searched && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
              <p className="text-gray-400 text-xs mb-1">Results</p>
              <p className="text-2xl font-bold text-white">{data.summary.returned}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
              <p className="text-gray-400 text-xs mb-1">Total Found</p>
              <p className="text-2xl font-bold text-cyan-400">{data.summary.total.toLocaleString()}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
              <p className="text-gray-400 text-xs mb-1">NEOs</p>
              <p className="text-2xl font-bold text-orange-400">{data.summary.neo}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
              <p className="text-gray-400 text-xs mb-1">PHAs</p>
              <p className="text-2xl font-bold text-red-400">{data.summary.pha}</p>
            </div>
          </div>

          {/* Results Grid */}
          {data.asteroids.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.asteroids.map((asteroid, index) => (
                <motion.div
                  key={asteroid.designation}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-cyan-500/50 transition-all"
                >
                  {/* Asteroid Name */}
                  <Link
                    href={`/asteroids/${encodeURIComponent(asteroid.designation)}`}
                    className="block mb-2"
                  >
                    <h3 className="text-lg font-bold text-white hover:text-cyan-400 transition-colors truncate">
                      {asteroid.fullName}
                    </h3>
                  </Link>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getHazardColor(asteroid.hazardLevel)}`}>
                      {asteroid.isPHA ? 'PHA' : asteroid.isNEO ? 'NEO' : 'Non-NEO'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/50">
                      {asteroid.sizeCategory}
                    </span>
                  </div>

                  {/* Properties */}
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Orbit:</span>
                      <span className="text-white font-medium">{asteroid.orbitClass}</span>
                    </div>
                    {typeof asteroid.diameter === 'number' && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Diameter:</span>
                        <span className="text-cyan-400 font-medium">{asteroid.diameter.toFixed(2)} {asteroid.diameterUnit}</span>
                      </div>
                    )}
                    {typeof asteroid.absoluteMagnitude === 'number' && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Magnitude:</span>
                        <span className="text-white font-medium">{asteroid.absoluteMagnitude.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No asteroids found matching your criteria.</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your search filters.</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Help Text */}
      {!searched && (
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800/50 rounded-lg">
          <p className="text-sm text-blue-300">
            <strong>Search Tips:</strong> Use the filters above to search NASA&apos;s comprehensive asteroid database.
            NEO (Near-Earth Object) are asteroids with orbits that bring them close to Earth.
            PHA (Potentially Hazardous Asteroid) are NEOs larger than 140m that can approach Earth within 0.05 AU.
          </p>
        </div>
      )}
    </div>
  );
}
