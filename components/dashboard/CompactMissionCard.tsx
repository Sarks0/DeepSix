'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronDownIcon, ChevronUpIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { CompactStat } from '@/components/ui/StatCard';

interface MissionData {
  id: string;
  name: string;
  status: 'Active' | 'En Route' | 'Historical';
  distance?: {
    value: number;
    unit: string;
    label: string;
  };
  speed?: {
    value: number;
    unit: string;
  };
  launched?: string;
  target?: string;
  description?: string;
  latestData?: Array<{
    label: string;
    value: string;
    helpText?: string;
  }>;
}

interface CompactMissionCardProps {
  mission: MissionData;
  defaultExpanded?: boolean;
  detailLink?: string;
}

export function CompactMissionCard({ mission, defaultExpanded = false, detailLink }: CompactMissionCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const statusColors = {
    Active: 'bg-green-500/20 text-green-400 border-green-500/50',
    'En Route': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    Historical: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
  };

  const statusDots = {
    Active: 'bg-green-400 animate-pulse',
    'En Route': 'bg-blue-400',
    Historical: 'bg-gray-400',
  };

  return (
    <motion.div
      layout
      className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 overflow-hidden hover:border-cyan-500/30 transition-all"
    >
      {/* Compact Header - Always Visible */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          {/* Mission Name & Status */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white">{mission.name}</h3>
              <div className={`w-2 h-2 rounded-full ${statusDots[mission.status]}`} />
            </div>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColors[mission.status]}`}>
              {mission.status}
            </span>
          </div>

          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-gray-700/50 transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>

        {/* Quick Stats - Collapsed State */}
        {!isExpanded && (
          <div className="grid grid-cols-2 gap-3 mt-3">
            {mission.distance && (
              <div>
                <p className="text-xs text-gray-400">{mission.distance.label}</p>
                <p className="text-base font-semibold text-cyan-400">
                  {mission.distance.value} {mission.distance.unit}
                </p>
              </div>
            )}
            {mission.target && (
              <div>
                <p className="text-xs text-gray-400">Target</p>
                <p className="text-base font-semibold text-white">{mission.target}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-gray-700/50 pt-4 space-y-4">
              {/* Description */}
              {mission.description && (
                <p className="text-sm text-gray-300 leading-relaxed">{mission.description}</p>
              )}

              {/* Detailed Stats */}
              <div className="space-y-1 bg-gray-900/50 rounded-lg p-3 border border-gray-700/30">
                {mission.distance && (
                  <CompactStat
                    label={mission.distance.label}
                    value={`${mission.distance.value} ${mission.distance.unit}`}
                    helpText={`Current distance from Earth`}
                  />
                )}

                {mission.speed && (
                  <CompactStat
                    label="Speed"
                    value={`${mission.speed.value} ${mission.speed.unit}`}
                    helpText="Velocity relative to the Sun"
                  />
                )}

                {mission.launched && (
                  <CompactStat
                    label="Launched"
                    value={mission.launched}
                    helpText="Mission launch date from Earth"
                  />
                )}

                {mission.target && (
                  <CompactStat
                    label="Target"
                    value={mission.target}
                  />
                )}
              </div>

              {/* Latest Data */}
              {mission.latestData && mission.latestData.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Latest Data</h4>
                  <div className="space-y-1 bg-gray-900/50 rounded-lg p-3 border border-gray-700/30">
                    {mission.latestData.map((data, idx) => (
                      <CompactStat
                        key={idx}
                        label={data.label}
                        value={data.value}
                        helpText={data.helpText}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* View Details Link */}
              {detailLink && (
                <Link
                  href={detailLink}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg border border-cyan-500/30 transition-colors text-sm font-medium"
                >
                  <span>View Full Details</span>
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
