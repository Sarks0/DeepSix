'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePerformanceMonitoring } from '@/hooks/use-performance';

interface PerformanceMonitorProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  minimal?: boolean;
}

export function PerformanceMonitor({
  enabled = process.env.NODE_ENV === 'development',
  position = 'bottom-right',
  minimal = false,
}: PerformanceMonitorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { metrics, grade, warnings, isPerformant } = usePerformanceMonitoring();

  if (!enabled) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const gradeColors = {
    A: 'text-green-400 border-green-500',
    B: 'text-blue-400 border-blue-500',
    C: 'text-yellow-400 border-yellow-500',
    D: 'text-orange-400 border-orange-500',
    F: 'text-red-400 border-red-500',
  };

  const formatTime = (time: number) => {
    return time < 1000 ? `${Math.round(time)}ms` : `${(time / 1000).toFixed(1)}s`;
  };

  const getWarningIcon = () => {
    if (!Object.values(warnings).some(Boolean)) return null;
    return <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />;
  };

  if (minimal) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`fixed ${positionClasses[position]} z-50`}
      >
        <div
          className={`flex items-center gap-2 px-3 py-2 bg-gray-900/90 backdrop-blur-sm rounded-lg border ${gradeColors[grade]} text-sm font-mono`}
        >
          <span>{metrics.fps}fps</span>
          <span className={gradeColors[grade]}>Grade: {grade}</span>
          {getWarningIcon()}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`fixed ${positionClasses[position]} z-50 w-80`}
    >
      <div className="bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700 shadow-2xl">
        {/* Header */}
        <div
          className="flex items-center justify-between p-3 border-b border-gray-800 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${isPerformant ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}
            />
            <span className="text-sm font-semibold text-white">Performance</span>
            {getWarningIcon()}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold font-mono ${gradeColors[grade]}`}>{grade}</span>
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="text-gray-400">
              ▼
            </motion.div>
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-3 space-y-3 text-sm font-mono">
                {/* FPS */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">FPS</span>
                  <span
                    className={
                      metrics.fps < 30
                        ? 'text-red-400'
                        : metrics.fps < 45
                          ? 'text-yellow-400'
                          : 'text-green-400'
                    }
                  >
                    {metrics.fps}
                  </span>
                </div>

                {/* Memory Usage */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Memory</span>
                  <span
                    className={
                      metrics.memoryUsage > 100
                        ? 'text-red-400'
                        : metrics.memoryUsage > 50
                          ? 'text-yellow-400'
                          : 'text-green-400'
                    }
                  >
                    {metrics.memoryUsage}MB
                  </span>
                </div>

                {/* Load Time */}
                {metrics.loadTime > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Load Time</span>
                    <span
                      className={
                        metrics.loadTime > 3000
                          ? 'text-red-400'
                          : metrics.loadTime > 1000
                            ? 'text-yellow-400'
                            : 'text-green-400'
                      }
                    >
                      {formatTime(metrics.loadTime)}
                    </span>
                  </div>
                )}

                {/* Render Time */}
                {metrics.renderTime > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">First Paint</span>
                    <span
                      className={
                        metrics.renderTime > 1500
                          ? 'text-red-400'
                          : metrics.renderTime > 800
                            ? 'text-yellow-400'
                            : 'text-green-400'
                      }
                    >
                      {formatTime(metrics.renderTime)}
                    </span>
                  </div>
                )}

                {/* API Response Times */}
                {Object.keys(metrics.apiResponseTimes).length > 0 && (
                  <div className="border-t border-gray-800 pt-3 mt-3">
                    <div className="text-gray-300 mb-2 text-xs uppercase tracking-wider">
                      API Responses
                    </div>
                    {Object.entries(metrics.apiResponseTimes)
                      .slice(0, 3)
                      .map(([url, time]) => {
                        const shortUrl = url.split('/').pop() || url;
                        return (
                          <div key={url} className="flex justify-between items-center text-xs">
                            <span className="text-gray-400 truncate max-w-[120px]">{shortUrl}</span>
                            <span
                              className={
                                time > 1000
                                  ? 'text-red-400'
                                  : time > 500
                                    ? 'text-yellow-400'
                                    : 'text-green-400'
                              }
                            >
                              {formatTime(time)}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* Errors */}
                {metrics.errorCount > 0 && (
                  <div className="flex justify-between items-center text-red-400">
                    <span>Errors</span>
                    <span>{metrics.errorCount}</span>
                  </div>
                )}

                {/* Warnings */}
                {Object.values(warnings).some(Boolean) && (
                  <div className="border-t border-gray-800 pt-3 mt-3">
                    <div className="text-red-300 mb-2 text-xs uppercase tracking-wider">
                      Warnings
                    </div>
                    <div className="space-y-1 text-xs">
                      {warnings.lowFPS && <div className="text-red-400">⚠ Low FPS detected</div>}
                      {warnings.highMemory && (
                        <div className="text-red-400">⚠ High memory usage</div>
                      )}
                      {warnings.slowAPI && (
                        <div className="text-red-400">⚠ Slow API responses</div>
                      )}
                      {warnings.hasErrors && (
                        <div className="text-red-400">⚠ JavaScript errors detected</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
