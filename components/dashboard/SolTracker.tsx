'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { calculateSol, formatSolDisplay, getSolMilestone, type SolData } from '@/lib/utils/mars-sol';

interface SolTrackerProps {
  rover: 'perseverance' | 'curiosity' | 'opportunity' | 'spirit';
  variant?: 'compact' | 'detailed' | 'minimal';
  showProgress?: boolean;
  showMilestone?: boolean;
  updateInterval?: number;
  className?: string;
}

export function SolTracker({
  rover,
  variant = 'compact',
  showProgress = true,
  showMilestone = true,
  updateInterval = 60000, // Update every minute
  className = ''
}: SolTrackerProps) {
  const [solData, setSolData] = useState<SolData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Calculate initial sol data
    const updateSolData = () => {
      const now = new Date();
      setCurrentTime(now);
      setSolData(calculateSol(rover, now));
    };

    updateSolData();

    // Set up interval for updates
    const interval = setInterval(updateSolData, updateInterval);

    return () => clearInterval(interval);
  }, [rover, updateInterval]);

  if (!solData) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-700 rounded w-24"></div>
      </div>
    );
  }

  const display = formatSolDisplay(solData);
  const milestone = getSolMilestone(solData.currentSol);
  const isActive = rover === 'perseverance' || rover === 'curiosity';

  if (variant === 'minimal') {
    return (
      <motion.div 
        className={`text-sm ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span className="font-mono font-semibold text-orange-400">
          {display.solText}
        </span>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div 
        className={`space-y-1 ${className}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg font-mono font-bold text-orange-400">
            {display.solText}
          </span>
          {isActive && (
            <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full uppercase">
              Active
            </span>
          )}
        </div>
        <div className="text-xs text-gray-400">
          {display.durationText} • {display.timeText}
        </div>
        {showProgress && (
          <div className="relative h-1 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-red-500"
              initial={{ width: 0 }}
              animate={{ width: `${solData.solProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
        {showMilestone && milestone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs text-yellow-400 font-medium mt-1"
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
          <h3 className="text-sm font-medium text-gray-400 mb-1">
            {solData.rover} Rover
          </h3>
          <div className="text-2xl font-mono font-bold text-orange-400">
            {display.solText}
          </div>
        </div>
        {isActive ? (
          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full uppercase font-medium">
            Active Mission
          </span>
        ) : (
          <span className="px-2 py-1 bg-gray-600/20 text-gray-400 text-xs rounded-full uppercase font-medium">
            Completed
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500">Mission Duration:</span>
          <div className="font-medium">{display.durationText}</div>
        </div>
        <div>
          <span className="text-gray-500">Mars Time:</span>
          <div className="font-medium font-mono">{display.timeText}</div>
        </div>
        <div>
          <span className="text-gray-500">Season:</span>
          <div className="font-medium capitalize">{solData.season}</div>
        </div>
        <div>
          <span className="text-gray-500">Earth Date:</span>
          <div className="font-medium">{currentTime.toLocaleDateString()}</div>
        </div>
      </div>

      {showProgress && (
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Sol Progress</span>
            <span>{display.progressText}</span>
          </div>
          <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-red-500"
              initial={{ width: 0 }}
              animate={{ width: `${solData.solProgress}%` }}
              transition={{ duration: 0.5 }}
            />
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
        <div>Landing: {solData.landingDate.toLocaleDateString()}</div>
        <div>Last updated: {currentTime.toLocaleTimeString()}</div>
      </div>
    </motion.div>
  );
}