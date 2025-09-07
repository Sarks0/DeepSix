'use client';

import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const RocketIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M12 2L4 7V12L12 22L20 12V7L12 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 22V16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 8V2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 12H20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ProbeIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    <path d="M12 2V9M12 15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M22 12H15M9 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M19 5L15 9M9 15L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M5 5L9 9M15 15L19 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const RoverIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect
      x="6"
      y="10"
      width="12"
      height="8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="8" cy="20" r="2" stroke="currentColor" strokeWidth="2" />
    <circle cx="16" cy="20" r="2" stroke="currentColor" strokeWidth="2" />
    <path
      d="M12 10V6M10 6L12 4L14 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M6 14H18" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
  </svg>
);

export const SolarIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle
      cx="12"
      cy="12"
      r="5"
      fill="currentColor"
      fillOpacity="0.2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M12 1V5M12 19V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M4.22 4.22L7.05 7.05M16.95 16.95L19.78 19.78"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path d="M1 12H5M19 12H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M4.22 19.78L7.05 16.95M16.95 7.05L19.78 4.22"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const PlanetIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <ellipse
      cx="12"
      cy="12"
      rx="9"
      ry="3"
      stroke="currentColor"
      strokeWidth="2"
      strokeOpacity="0.5"
    />
    <path
      d="M3 12C3 12 6 14 12 14C18 14 21 12 21 12"
      stroke="currentColor"
      strokeWidth="1"
      strokeOpacity="0.3"
    />
  </svg>
);

export const OrbitIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <ellipse
      cx="12"
      cy="12"
      rx="10"
      ry="4"
      stroke="currentColor"
      strokeWidth="2"
      strokeOpacity="0.3"
      transform="rotate(-45 12 12)"
    />
    <ellipse
      cx="12"
      cy="12"
      rx="10"
      ry="4"
      stroke="currentColor"
      strokeWidth="2"
      strokeOpacity="0.3"
      transform="rotate(45 12 12)"
    />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <circle cx="18" cy="8" r="1" fill="currentColor" />
    <circle cx="6" cy="16" r="1" fill="currentColor" />
  </svg>
);

export const SatelliteIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="9" y="9" width="6" height="6" stroke="currentColor" strokeWidth="2" />
    <path d="M3 9H9M15 9H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 3V9M12 15V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <rect
      x="2"
      y="7"
      width="4"
      height="4"
      fill="currentColor"
      fillOpacity="0.3"
      stroke="currentColor"
      strokeWidth="1"
    />
    <rect
      x="18"
      y="7"
      width="4"
      height="4"
      fill="currentColor"
      fillOpacity="0.3"
      stroke="currentColor"
      strokeWidth="1"
    />
  </svg>
);
