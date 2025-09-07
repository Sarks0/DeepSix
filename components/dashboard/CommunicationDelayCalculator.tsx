'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSpacecraftDelays } from '@/hooks/use-spacecraft';

export function CommunicationDelayCalculator() {
  const { delays, isLoading } = useSpacecraftDelays();
  const [selectedCraft, setSelectedCraft] = useState<string | null>(null);
  const [messageLength, setMessageLength] = useState(100);
  const [sendTime, setSendTime] = useState<Date | null>(null);
  const [arrivalTime, setArrivalTime] = useState<Date | null>(null);

  const calculateArrival = (craftId: string) => {
    const craft = delays.find((d) => d.id === craftId);
    if (!craft) return;

    const now = new Date();
    setSendTime(now);

    // Parse the delay string (e.g., "23h 17m 47s") to seconds
    const parseDelay = (delayStr: string): number => {
      let totalSeconds = 0;
      const parts = delayStr.split(' ');

      parts.forEach((part) => {
        if (part.includes('h')) {
          totalSeconds += parseInt(part) * 3600;
        } else if (part.includes('m')) {
          totalSeconds += parseInt(part) * 60;
        } else if (part.includes('s')) {
          totalSeconds += parseInt(part);
        }
      });

      return totalSeconds;
    };

    const delaySeconds = parseDelay(craft.oneWay);
    const arrival = new Date(now.getTime() + delaySeconds * 1000);
    setArrivalTime(arrival);
    setSelectedCraft(craftId);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-gray-700 p-8">
        <h2 className="text-2xl font-bold mb-6">Communication Delay Calculator</h2>
        <div className="animate-pulse">
          <div className="h-20 bg-gray-700 rounded-lg mb-4"></div>
          <div className="h-20 bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-gray-700 p-8">
      <h2 className="text-2xl font-bold mb-6">Communication Delay Calculator</h2>

      {/* Spacecraft Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {delays.map((spacecraft) => (
          <motion.button
            key={spacecraft.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => calculateArrival(spacecraft.id)}
            className={`p-4 rounded-lg border transition-all ${
              selectedCraft === spacecraft.id
                ? 'bg-blue-600/20 border-blue-500'
                : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
            }`}
          >
            <p className="text-sm text-gray-400 mb-1">{spacecraft.name}</p>
            <p className="text-xl font-mono font-bold text-purple-400">{spacecraft.oneWay}</p>
            <p className="text-xs text-gray-500 mt-1">{spacecraft.distanceAU} AU away</p>
          </motion.button>
        ))}

        {/* Mars (static for now) */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            const now = new Date();
            setSendTime(now);
            setArrivalTime(new Date(now.getTime() + 14 * 60 * 1000)); // 14 minutes
            setSelectedCraft('mars');
          }}
          className={`p-4 rounded-lg border transition-all ${
            selectedCraft === 'mars'
              ? 'bg-orange-600/20 border-orange-500'
              : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
          }`}
        >
          <p className="text-sm text-gray-400 mb-1">Mars</p>
          <p className="text-xl font-mono font-bold text-orange-400">~14 min</p>
          <p className="text-xs text-gray-500 mt-1">varies by position</p>
        </motion.button>
      </div>

      {/* Message Simulation */}
      {sendTime && arrivalTime && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-gray-900/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Message Transmission</h3>

            {/* Message Input */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">
                Message Length (characters)
              </label>
              <input
                type="range"
                min="1"
                max="1000"
                value={messageLength}
                onChange={(e) => setMessageLength(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 char</span>
                <span>{messageLength} characters</span>
                <span>1000 chars</span>
              </div>
            </div>

            {/* Transmission Timeline */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-32 text-right">
                  <p className="text-sm text-gray-400">Send Time</p>
                  <p className="font-mono text-green-400">{formatTime(sendTime)}</p>
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full relative">
                    <motion.div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"
                      initial={{ left: '0%' }}
                      animate={{ left: '100%' }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                  </div>
                </div>
                <div className="w-32">
                  <p className="text-sm text-gray-400">Arrival Time</p>
                  <p className="font-mono text-blue-400">{formatTime(arrivalTime)}</p>
                </div>
              </div>

              {arrivalTime.getDate() !== sendTime.getDate() && (
                <div className="text-center text-sm text-yellow-400">
                  Message arrives on {formatDate(arrivalTime)}
                </div>
              )}
            </div>
          </div>

          {/* Fun Facts */}
          <div className="bg-gray-900/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Did You Know?</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                Radio signals travel at the speed of light (299,792 km/s)
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>A conversation with Voyager 1 takes
                over 46 hours round-trip
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                Mars communication delay varies from 4 to 24 minutes based on orbital positions
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                Data from spacecraft is transmitted at rates of 1-6 Mbps
              </li>
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
}
