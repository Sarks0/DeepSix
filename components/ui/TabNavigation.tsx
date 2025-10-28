'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export interface Tab {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
  helpText?: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
}

export function TabNavigation({ tabs, defaultTab, onChange, variant = 'default' }: TabNavigationProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  if (variant === 'pills') {
    return (
      <div className="flex flex-wrap gap-2 p-1 bg-gray-800/30 rounded-lg border border-gray-700/50">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`relative px-4 py-2 rounded-md text-sm font-medium transition-all ${
                isActive
                  ? 'text-white bg-cyan-500/20 border border-cyan-500/50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              <span className="flex items-center gap-2">
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-xs ${
                      isActive ? 'bg-cyan-500/30 text-cyan-300' : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'underline') {
    return (
      <div className="border-b border-gray-800">
        <div className="flex gap-6">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`relative pb-3 text-sm font-medium transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  {tab.icon && <span>{tab.icon}</span>}
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="px-1.5 py-0.5 rounded-full text-xs bg-gray-700 text-gray-400">
                      {tab.count}
                    </span>
                  )}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Default variant - cards
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`relative p-4 rounded-lg border transition-all ${
              isActive
                ? 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/20'
                : 'bg-gray-800/30 border-gray-700/50 hover:border-gray-600 hover:bg-gray-800/50'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabBackground"
                className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-lg"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}

            <div className="relative">
              {tab.icon && <div className="text-2xl mb-2">{tab.icon}</div>}
              <p className={`font-semibold ${isActive ? 'text-cyan-400' : 'text-white'}`}>
                {tab.label}
              </p>
              {tab.count !== undefined && (
                <p className={`text-sm mt-1 ${isActive ? 'text-cyan-300' : 'text-gray-400'}`}>
                  {tab.count} {tab.count === 1 ? 'mission' : 'missions'}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// Hook to use with TabNavigation
export function useTabState(defaultTab: string) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return {
    activeTab,
    setActiveTab,
    isActive: (tabId: string) => activeTab === tabId,
  };
}
