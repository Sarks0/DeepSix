'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SpacecraftData {
  name: string;
  launchDate: Date;
  distance: number; // AU
  signalDelay: number; // seconds
  milestones: { date: Date; event: string; distance?: number }[];
}

const SPACECRAFT_INFO: Record<string, Omit<SpacecraftData, 'signalDelay'>> = {
  'VGR1': {
    name: 'Voyager 1',
    launchDate: new Date('1977-09-05'),
    distance: 164.7,
    milestones: [
      { date: new Date('1979-03-05'), event: 'Jupiter Flyby', distance: 5.2 },
      { date: new Date('1980-11-12'), event: 'Saturn Flyby', distance: 9.5 },
      { date: new Date('1990-02-14'), event: 'Pale Blue Dot Photo', distance: 40.5 },
      { date: new Date('2012-08-25'), event: 'Entered Interstellar Space', distance: 121 },
      { date: new Date('2025-01-01'), event: 'Current Position', distance: 164.7 }
    ]
  },
  'VGR2': {
    name: 'Voyager 2',
    launchDate: new Date('1977-08-20'),
    distance: 137.6,
    milestones: [
      { date: new Date('1979-07-09'), event: 'Jupiter Flyby', distance: 5.2 },
      { date: new Date('1981-08-25'), event: 'Saturn Flyby', distance: 9.5 },
      { date: new Date('1986-01-24'), event: 'Uranus Flyby', distance: 19.2 },
      { date: new Date('1989-08-25'), event: 'Neptune Flyby', distance: 30.1 },
      { date: new Date('2018-11-05'), event: 'Entered Interstellar Space', distance: 119 }
    ]
  }
};

interface SpacecraftTimelineProps {
  spacecraftCode: string;
  isActive: boolean;
}

export function SpacecraftTimeline({ spacecraftCode, isActive }: SpacecraftTimelineProps) {
  const [signalProgress, setSignalProgress] = useState(0);
  const [simulatingMessage, setSimulatingMessage] = useState(false);
  const [messageText, setMessageText] = useState('');

  const spacecraft = SPACECRAFT_INFO[spacecraftCode];
  if (!spacecraft) return null;

  const AU_TO_KM = 149597870.7;
  const SPEED_OF_LIGHT = 299792.458; // km/s
  const signalDelaySeconds = (spacecraft.distance * AU_TO_KM) / SPEED_OF_LIGHT;
  const signalDelayHours = signalDelaySeconds / 3600;

  const missionDurationDays = Math.floor(
    (new Date().getTime() - spacecraft.launchDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const missionDurationYears = (missionDurationDays / 365.25).toFixed(1);

  const simulateMessage = () => {
    if (simulatingMessage || !messageText) return;
    
    setSimulatingMessage(true);
    setSignalProgress(0);

    // Simulate signal travel (accelerated - 10 seconds = full journey)
    const duration = 10000; // 10 seconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setSignalProgress(progress);

      if (progress < 100) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          setSimulatingMessage(false);
          setSignalProgress(0);
        }, 2000);
      }
    };

    animate();
  };

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/50 rounded-lg p-6 border border-gray-700"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">{spacecraft.name}</h3>
          <p className="text-sm text-gray-400">
            Mission Duration: {missionDurationYears} years ({missionDurationDays.toLocaleString()} days)
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Distance from Earth</p>
          <p className="text-2xl font-bold text-purple-400">{spacecraft.distance} AU</p>
        </div>
      </div>

      {/* Signal Delay Visualization */}
      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
        <h4 className="text-sm font-semibold text-white mb-2">Communication Delay</h4>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">One-way signal time</span>
          <span className="text-lg font-mono text-yellow-400">
            {signalDelayHours.toFixed(2)} hours
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Round-trip time</span>
          <span className="text-lg font-mono text-orange-400">
            {(signalDelayHours * 2).toFixed(2)} hours
          </span>
        </div>
      </div>

      {/* Journey Timeline */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-white mb-3">Journey Milestones</h4>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-700"></div>
          {spacecraft.milestones.map((milestone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-center mb-3"
            >
              <div className={`absolute left-3 w-2 h-2 rounded-full ${
                index === spacecraft.milestones.length - 1 
                  ? 'bg-green-400 animate-pulse' 
                  : 'bg-blue-400'
              }`}></div>
              <div className="ml-8">
                <p className="text-sm text-white">{milestone.event}</p>
                <p className="text-xs text-gray-400">
                  {milestone.date.toLocaleDateString()} 
                  {milestone.distance && ` • ${milestone.distance} AU`}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Message Simulator */}
      <div className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-800/30">
        <h4 className="text-sm font-semibold text-white mb-3">Send a Message to {spacecraft.name}</h4>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
            disabled={simulatingMessage}
          />
          <button
            onClick={simulateMessage}
            disabled={simulatingMessage || !messageText}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Send
          </button>
        </div>

        {simulatingMessage && (
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Signal traveling...</span>
              <span>{signalProgress.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                style={{ width: `${signalProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {signalProgress < 50 
                ? `Passing ${(spacecraft.distance * signalProgress / 100).toFixed(1)} AU...`
                : signalProgress < 100
                ? 'Almost there...'
                : '✓ Message received by ' + spacecraft.name + '!'}
            </p>
          </div>
        )}

        <p className="text-xs text-gray-500 mt-2">
          When you send this message, Earth will have rotated {((signalDelayHours / 24) * 360).toFixed(0)}° 
          by the time it arrives.
        </p>
      </div>
    </motion.div>
  );
}