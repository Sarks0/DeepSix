'use client';

import { motion } from 'framer-motion';
import { HelpTooltip } from './Tooltip';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  helpText?: string;
  icon?: React.ReactNode;
  color?: 'cyan' | 'blue' | 'purple' | 'pink' | 'green' | 'yellow' | 'red' | 'gray';
  trend?: {
    value: number;
    label: string;
  };
  delay?: number;
}

export function StatCard({
  label,
  value,
  unit,
  helpText,
  icon,
  color = 'cyan',
  trend,
  delay = 0,
}: StatCardProps) {
  const colorClasses = {
    cyan: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400',
    blue: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
    pink: 'from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-400',
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400',
    yellow: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-400',
    red: 'from-red-500/20 to-orange-500/20 border-red-500/30 text-red-400',
    gray: 'from-gray-700/20 to-gray-600/20 border-gray-600/30 text-gray-300',
  };

  const trendColor = trend && trend.value > 0 ? 'text-green-400' : trend && trend.value < 0 ? 'text-red-400' : 'text-gray-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-sm rounded-lg border p-4 relative overflow-hidden`}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative">
        {/* Header with label and help */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon && <div className="text-xl">{icon}</div>}
            <p className="text-gray-400 text-sm font-medium">{label}</p>
            {helpText && <HelpTooltip content={helpText} />}
          </div>
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-1">
          <p className={`text-3xl font-bold ${colorClasses[color].split(' ').pop()}`}>
            {value}
          </p>
          {unit && <span className="text-gray-500 text-sm ml-1">{unit}</span>}
        </div>

        {/* Trend indicator */}
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-xs ${trendColor}`}>
            <span>{trend.value > 0 ? '↑' : trend.value < 0 ? '↓' : '→'}</span>
            <span>{Math.abs(trend.value)}</span>
            <span className="text-gray-500">{trend.label}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Compact variant for smaller spaces
interface CompactStatProps {
  label: string;
  value: string | number;
  helpText?: string;
}

export function CompactStat({ label, value, helpText }: CompactStatProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-1.5">
        <span className="text-gray-400 text-sm">{label}</span>
        {helpText && <HelpTooltip content={helpText} />}
      </div>
      <span className="text-white font-semibold">{value}</span>
    </div>
  );
}
