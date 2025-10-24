'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Mission {
  cd: string;
  ca: string;
  mjd0: number;
  mjdf: number;
  tof: number;
  vinf: number;
  c3: number;
  dv: number;
  phase: number;
  dist: number;
  elong: number;
  dec: number;
  approach: number;
  launchDate: string;
  arrivalDate: string;
  durationDays: number;
  durationYears: string;
  launchVelocity: number;
  launchEnergy: number;
  totalDeltaV: number;
  missionComplexity: string;
  launchWindow: string;
}

interface MissionData {
  success: boolean;
  object: {
    designation: string;
    fullName: string;
    orbitClass: string;
  } | null;
  totalMissions: number;
  missions: Mission[];
  summary: {
    lowestDeltaV: number;
    shortestDuration: number;
    earliestLaunch: string;
  } | null;
}

// Popular asteroids for mission design
const POPULAR_TARGETS = [
  { name: '433 Eros', designation: '433' },
  { name: '101955 Bennu', designation: '101955' },
  { name: '162173 Ryugu', designation: '162173' },
  { name: '16 Psyche', designation: '16' },
  { name: '99942 Apophis', designation: '99942' },
  { name: '1 Ceres', designation: '1' },
  { name: '4 Vesta', designation: '4' },
];

export default function MissionDesignTool() {
  const [selectedTarget, setSelectedTarget] = useState(POPULAR_TARGETS[0].designation);
  const [customTarget, setCustomTarget] = useState('');
  const [data, setData] = useState<MissionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const fetchMissionData = async (target: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/asteroids/mission-design?des=${encodeURIComponent(target)}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch mission data');
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mission data');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const target = customTarget.trim() || selectedTarget;
    fetchMissionData(target);
    setExpanded(true);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Easy': return 'text-green-400 bg-green-500/20 border-green-500/50';
      case 'Moderate': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'Challenging': return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
      default: return 'text-red-400 bg-red-500/20 border-red-500/50';
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-lg border border-purple-800/50 p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Mission Design Tool</h2>
        <p className="text-purple-200">
          Explore pre-computed mission opportunities to asteroids. Analyze launch windows, delta-V requirements, and mission durations.
        </p>
      </div>

      {/* Target Selection */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Select Popular Target
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {POPULAR_TARGETS.map((target) => (
              <button
                key={target.designation}
                onClick={() => {
                  setSelectedTarget(target.designation);
                  setCustomTarget('');
                }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedTarget === target.designation && !customTarget
                    ? 'bg-purple-600 text-white border-2 border-purple-400'
                    : 'bg-gray-800/50 text-gray-300 border border-gray-700 hover:border-purple-500'
                }`}
              >
                {target.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Or Enter Custom Designation
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customTarget}
              onChange={(e) => setCustomTarget(e.target.value)}
              placeholder="e.g., 2012 TC4, 243, 1566"
              className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? 'Calculating...' : 'Calculate'}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4"></div>
          <p className="text-purple-300">Computing mission trajectories...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 mb-6">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {data && !loading && expanded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Target Info */}
            {data.object && (
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-2">{data.object.fullName}</h3>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-full">
                    {data.object.orbitClass}
                  </span>
                  <span className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-full">
                    {data.totalMissions} mission opportunities
                  </span>
                </div>
              </div>
            )}

            {/* Mission Summary */}
            {data.summary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">Lowest Delta-V</p>
                  <p className="text-2xl font-bold text-cyan-400">{data.summary.lowestDeltaV.toFixed(2)} km/s</p>
                  <p className="text-xs text-gray-500 mt-1">Minimum fuel requirement</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">Shortest Duration</p>
                  <p className="text-2xl font-bold text-green-400">
                    {(data.summary.shortestDuration / 365.25).toFixed(1)} years
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{data.summary.shortestDuration} days</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">Earliest Launch</p>
                  <p className="text-lg font-bold text-white">
                    {new Date(data.summary.earliestLaunch).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {/* Mission Opportunities */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Mission Opportunities</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {data.missions.slice(0, 15).map((mission, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50 hover:border-purple-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-white font-semibold text-lg">Mission {idx + 1}</p>
                        <p className="text-gray-400 text-sm">{mission.launchWindow} Launch Window</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getComplexityColor(mission.missionComplexity)}`}>
                        {mission.missionComplexity}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-gray-400 mb-1">Launch Date</p>
                        <p className="text-white font-semibold">
                          {new Date(mission.launchDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Duration</p>
                        <p className="text-cyan-400 font-semibold">
                          {mission.durationYears} years
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">Delta-V</p>
                        <p className="text-orange-400 font-semibold">
                          {mission.totalDeltaV.toFixed(2)} km/s
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-1">V-infinity</p>
                        <p className="text-purple-400 font-semibold">
                          {mission.launchVelocity.toFixed(2)} km/s
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-700/50 text-xs text-gray-400">
                      <p>Arrival: {new Date(mission.arrivalDate).toLocaleDateString()} •
                         Phase Angle: {mission.phase.toFixed(1)}° •
                         Solar Elongation: {mission.elong.toFixed(1)}°</p>
                    </div>
                  </motion.div>
                ))}
                {data.missions.length > 15 && (
                  <div className="text-center py-2 text-gray-400 text-sm">
                    Showing 15 of {data.totalMissions} mission opportunities
                  </div>
                )}
              </div>
            </div>

            {/* Educational Info */}
            <div className="bg-purple-900/20 border border-purple-800/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-purple-300 mb-2">Understanding Mission Parameters</h4>
              <div className="space-y-2 text-sm text-purple-200">
                <p><strong>Delta-V:</strong> Total velocity change required - lower is easier (less fuel)</p>
                <p><strong>V-infinity:</strong> Departure speed relative to Earth - affects launch energy</p>
                <p><strong>Phase Angle:</strong> Geometric angle between Sun-asteroid-spacecraft at arrival</p>
                <p><strong>Mission Complexity:</strong> Based on fuel requirements and duration</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Initial State */}
      {!expanded && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚀</div>
          <p className="text-gray-400 mb-4">Select an asteroid and click Calculate to explore mission opportunities</p>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
          >
            Calculate Mission to {POPULAR_TARGETS.find(t => t.designation === selectedTarget)?.name}
          </button>
        </div>
      )}
    </div>
  );
}
