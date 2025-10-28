'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { HelpTooltip } from './Tooltip';

interface CollapsibleSectionProps {
  title: string;
  description?: string;
  helpText?: string;
  icon?: React.ReactNode;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  onToggle?: (isExpanded: boolean) => void;
  storageKey?: string; // For remembering state in localStorage
  badge?: string | number;
  badgeColor?: 'cyan' | 'blue' | 'purple' | 'pink' | 'green' | 'yellow' | 'red' | 'gray';
}

export function CollapsibleSection({
  title,
  description,
  helpText,
  icon,
  defaultExpanded = true,
  children,
  onToggle,
  storageKey,
  badge,
  badgeColor = 'cyan',
}: CollapsibleSectionProps) {
  // Load initial state from localStorage if storageKey provided
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== 'undefined' && storageKey) {
      const stored = localStorage.getItem(storageKey);
      return stored !== null ? stored === 'true' : defaultExpanded;
    }
    return defaultExpanded;
  });

  // Save to localStorage when state changes
  useEffect(() => {
    if (typeof window !== 'undefined' && storageKey) {
      localStorage.setItem(storageKey, String(isExpanded));
    }
  }, [isExpanded, storageKey]);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggle?.(newState);
  };

  const badgeColors = {
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    pink: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800">
      {/* Header - Always visible, clickable */}
      <button
        onClick={handleToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors rounded-t-lg group"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          {icon && <div className="text-2xl">{icon}</div>}

          {/* Title and description */}
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                {title}
              </h2>
              {helpText && <HelpTooltip content={helpText} />}
              {badge !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${badgeColors[badgeColor]}`}>
                  {badge}
                </span>
              )}
            </div>
            {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
          </div>
        </div>

        {/* Expand/collapse indicator */}
        <div className="flex-shrink-0 ml-4">
          {isExpanded ? (
            <ChevronUpIcon className="w-6 h-6 text-gray-400 group-hover:text-cyan-400 transition-colors" />
          ) : (
            <ChevronDownIcon className="w-6 h-6 text-gray-400 group-hover:text-cyan-400 transition-colors" />
          )}
        </div>
      </button>

      {/* Content - Collapsible */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 py-4 border-t border-gray-800">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Lightweight variant for nested/smaller sections
interface MiniCollapsibleProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function MiniCollapsible({ title, children, defaultExpanded = false }: MiniCollapsibleProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-gray-700/50 rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-800/20 transition-colors text-sm"
      >
        <span className="text-gray-300 font-medium">{title}</span>
        {isExpanded ? (
          <ChevronUpIcon className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 text-gray-500" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 border-t border-gray-700/50 text-sm">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
