'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { StarIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid';
import { HelpTooltip } from '@/components/ui/Tooltip';

interface FeaturedMissionData {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: 'Active' | 'En Route';
  distance: {
    value: number;
    unit: string;
    label: string;
  };
  speed?: {
    value: number;
    unit: string;
  };
  whyFeatured: string; // Beginner-friendly explanation of why this is interesting
  quickFacts: Array<{
    label: string;
    value: string;
    helpText?: string;
  }>;
  imageUrl?: string;
  detailLink: string;
}

interface FeaturedMissionProps {
  mission: FeaturedMissionData;
}

export function FeaturedMission({ mission }: FeaturedMissionProps) {
  const statusColor = mission.status === 'Active' ? 'bg-green-400' : 'bg-blue-400';

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="mb-12"
    >
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4">
        <StarIcon className="w-6 h-6 text-yellow-400" />
        <h2 className="text-2xl font-bold text-white">Featured Mission</h2>
        <HelpTooltip content="Highlighting a mission with recent milestones or significant ongoing activity" />
      </div>

      {/* Featured Card */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        {/* Gradient overlay for visual interest */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />

        <div className="relative p-6 md:p-8">
          {/* Header with Mission Name and Status */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-3xl md:text-4xl font-bold text-white">{mission.name}</h3>
                <div className={`w-3 h-3 rounded-full ${statusColor} ${mission.status === 'Active' ? 'animate-pulse' : ''}`} />
              </div>
              <p className="text-lg text-cyan-400 font-medium">{mission.tagline}</p>
            </div>

            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-sm font-semibold">
              {mission.status}
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-300 text-base mb-4 leading-relaxed max-w-3xl">
            {mission.description}
          </p>

          {/* Why Featured - Beginner friendly */}
          <div className="mb-6 p-4 bg-cyan-900/20 border border-cyan-800/30 rounded-lg">
            <p className="text-sm text-cyan-200/90">
              <span className="font-semibold text-cyan-300">Why this mission matters:</span> {mission.whyFeatured}
            </p>
          </div>

          {/* Quick Facts Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Always show distance prominently */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-start justify-between mb-1">
                <p className="text-xs text-gray-400">{mission.distance.label}</p>
                {mission.distance.label && (
                  <HelpTooltip content="Current distance from Earth" />
                )}
              </div>
              <p className="text-2xl font-bold text-cyan-400">
                {mission.distance.value}
              </p>
              <p className="text-xs text-gray-500">{mission.distance.unit}</p>
            </div>

            {/* Speed if available */}
            {mission.speed && (
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-xs text-gray-400">Speed</p>
                  <HelpTooltip content="Velocity relative to the Sun" />
                </div>
                <p className="text-2xl font-bold text-purple-400">
                  {mission.speed.value}
                </p>
                <p className="text-xs text-gray-500">{mission.speed.unit}</p>
              </div>
            )}

            {/* Additional quick facts */}
            {mission.quickFacts.map((fact, idx) => (
              <div
                key={idx}
                className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="text-xs text-gray-400">{fact.label}</p>
                  {fact.helpText && <HelpTooltip content={fact.helpText} />}
                </div>
                <p className="text-lg font-bold text-white truncate" title={fact.value}>
                  {fact.value}
                </p>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3">
            <Link
              href={mission.detailLink}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-cyan-500/20"
            >
              <span>View Mission Details</span>
              <ArrowTopRightOnSquareIcon className="w-5 h-5" />
            </Link>

            <Link
              href="/missions"
              className="px-6 py-3 bg-gray-800/50 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700 rounded-lg font-medium transition-all"
            >
              Explore All Missions
            </Link>
          </div>
        </div>
      </div>

      {/* Helpful hint for newcomers */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Scroll down to see all active missions organized by category
        </p>
      </div>
    </motion.section>
  );
}
