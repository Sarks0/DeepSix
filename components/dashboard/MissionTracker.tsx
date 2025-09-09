'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  calculateMissionData, 
  formatMissionDisplay, 
  getMissionMilestone,
  calculateCommunicationDelay,
  type MissionData 
} from '@/lib/utils/mission-tracking';

interface MissionTrackerProps {
  mission: 'voyager1' | 'voyager2' | 'parker' | 'newhorizons';
  variant?: 'compact' | 'detailed' | 'minimal';
  showCommunicationDelay?: boolean;
  showMilestone?: boolean;
  updateInterval?: number;
  className?: string;
}

export function MissionTracker({
  mission,
  variant = 'compact',
  showCommunicationDelay = true,
  showMilestone = true,
  updateInterval = 60000, // Update every minute
  className = ''
}: MissionTrackerProps) {
  const [missionData, setMissionData] = useState<MissionData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Calculate initial mission data
    const updateMissionData = () => {
      const now = new Date();
      setCurrentTime(now);
      setMissionData(calculateMissionData(mission, now));
    };

    updateMissionData();

    // Set up interval for updates
    const interval = setInterval(updateMissionData, updateInterval);

    return () => clearInterval(interval);
  }, [mission, updateInterval]);

  if (!missionData) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-700 rounded w-24"></div>
      </div>
    );
  }

  const display = formatMissionDisplay(missionData);
  const milestone = getMissionMilestone(mission, missionData);
  const isActive = missionData.status === 'active';
  const isExtended = missionData.status === 'extended';

  if (variant === 'minimal') {
    return (
      <motion.div 
        className={`text-sm space-y-1 ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="font-mono font-semibold text-purple-400">
          {display.durationText}
        </div>
        {missionData.currentDistance && (
          <div className="text-xs text-gray-400">
            {display.distanceText} away
          </div>
        )}
        {showCommunicationDelay && display.communicationDelay && (
          <div className="text-xs text-yellow-400">
            Signal: {display.communicationDelay}
          </div>
        )}
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div 
        className={`space-y-2 ${className}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-purple-400">
            {missionData.name}
          </span>
          {isActive && (
            <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full uppercase">
              Active
            </span>
          )}
          {isExtended && (
            <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full uppercase">
              Extended
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500">Mission Duration:</span>
            <div className="font-medium">{display.durationText}</div>
          </div>
          {missionData.keyMetric && (
            <div>
              <span className="text-gray-500">{missionData.keyMetric.label}:</span>
              <div className="font-medium">
                {missionData.keyMetric.value} {missionData.keyMetric.unit}
              </div>
            </div>
          )}
        </div>

        {showCommunicationDelay && display.communicationDelay && (
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <span className="text-gray-400">Signal delay: {display.communicationDelay}</span>
          </div>
        )}

        {showMilestone && milestone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs text-yellow-400 font-medium"
          >
            {milestone}
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Detailed variant
  return (
    <motion.div 
      className={`bg-gray-800/50 rounded-lg p-4 space-y-3 border border-gray-700 ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {missionData.name}
          </h3>
          <p className="text-sm text-gray-400 mt-1">{missionData.primaryObjective}</p>
        </div>
        {isActive ? (
          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full uppercase font-medium">
            Active Mission
          </span>
        ) : isExtended ? (
          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full uppercase font-medium">
            Extended Mission
          </span>
        ) : (
          <span className="px-2 py-1 bg-gray-600/20 text-gray-400 text-xs rounded-full uppercase font-medium">
            {missionData.status}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-500">Launch Date:</span>
          <div className="font-medium">{missionData.launchDate.toLocaleDateString()}</div>
        </div>
        <div>
          <span className="text-gray-500">Mission Duration:</span>
          <div className="font-medium">{display.durationText}</div>
        </div>
        {missionData.currentDistance && (
          <div>
            <span className="text-gray-500">Distance from Earth:</span>
            <div className="font-medium">{display.distanceText}</div>
          </div>
        )}
        {missionData.currentSpeed && (
          <div>
            <span className="text-gray-500">Current Speed:</span>
            <div className="font-medium">{display.speedText}</div>
          </div>
        )}
      </div>

      {missionData.keyMetric && (
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-3 border border-purple-800/30">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">{missionData.keyMetric.label}</span>
            <span className="text-xl font-bold text-purple-300">
              {missionData.keyMetric.value} {missionData.keyMetric.unit}
            </span>
          </div>
        </div>
      )}

      {showCommunicationDelay && display.communicationDelay && (
        <div className="flex items-center gap-3 bg-yellow-900/20 rounded-lg p-2 border border-yellow-800/30">
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
          <div className="text-sm">
            <span className="text-gray-400">Round-trip signal time: </span>
            <span className="font-medium text-yellow-400">
              {(() => {
                const delay = calculateCommunicationDelay(missionData.currentDistance!);
                const totalMinutes = delay.delayMinutes * 2;
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                return hours > 0 ? `${hours}h ${minutes}m` : `${totalMinutes}m`;
              })()}
            </span>
          </div>
        </div>
      )}

      {showMilestone && milestone && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2"
        >
          <div className="text-sm font-medium text-yellow-400 text-center">
            {milestone}
          </div>
        </motion.div>
      )}

      <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
        <div>Last updated: {currentTime.toLocaleTimeString()}</div>
      </div>
    </motion.div>
  );
}