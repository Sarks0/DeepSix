/**
 * Mission Tracking Utilities
 * Real-time tracking data for non-Mars space missions
 */

export interface MissionData {
  name: string;
  type: 'probe' | 'orbiter' | 'lander' | 'flyby' | 'telescope' | 'rover';
  launchDate: Date;
  status: 'active' | 'extended' | 'completed' | 'lost' | 'en_route';
  missionDurationDays: number;
  missionDurationYears: number;
  currentDistance?: number; // in AU (Astronomical Units)
  currentSpeed?: number; // in km/s
  lastContact?: Date;
  primaryObjective: string;
  location: string; // e.g., "Mars orbit", "Jupiter system", "L2 Lagrange point"
  keyMetric: {
    label: string;
    value: string | number;
    unit?: string;
  };
  achievements?: string[]; // Major mission achievements
}

// Mission launch dates and data
export const MISSION_DATA: Record<string, Omit<MissionData, 'missionDurationDays' | 'missionDurationYears'>> = {
  // Existing missions (updated with new fields)
  voyager1: {
    name: 'Voyager 1',
    type: 'probe',
    launchDate: new Date('1977-09-05T12:56:00Z'),
    status: 'active',
    location: 'Interstellar space',
    currentDistance: 164.7, // AU from Earth (as of 2025)
    currentSpeed: 17.0, // km/s
    primaryObjective: 'Interstellar space exploration',
    keyMetric: {
      label: 'Distance from Earth',
      value: 164.7,
      unit: 'AU'
    },
    achievements: [
      'First spacecraft to enter interstellar space (2012)',
      'Crossed heliopause boundary',
      'Operating for over 47 years'
    ]
  },
  voyager2: {
    name: 'Voyager 2',
    type: 'probe',
    launchDate: new Date('1977-08-20T14:29:00Z'),
    status: 'active',
    location: 'Interstellar space',
    currentDistance: 137.6, // AU from Earth
    currentSpeed: 15.4, // km/s
    primaryObjective: 'Interstellar space exploration',
    keyMetric: {
      label: 'Distance from Earth',
      value: 137.6,
      unit: 'AU'
    },
    achievements: [
      'Second spacecraft to enter interstellar space (2018)',
      'Only spacecraft to visit Uranus and Neptune',
      'Grand Tour of outer planets'
    ]
  },
  parker: {
    name: 'Parker Solar Probe',
    type: 'probe',
    launchDate: new Date('2018-08-12T07:31:00Z'),
    status: 'active',
    location: 'Solar system (Sun proximity)',
    currentDistance: 0.1, // Varies, close to Sun
    currentSpeed: 200, // Maximum speed near Sun
    primaryObjective: 'Study the solar corona',
    keyMetric: {
      label: 'Perihelion Passes',
      value: 18,
      unit: 'completed'
    },
    achievements: [
      'Fastest human-made object ever',
      'Closest approach to the Sun',
      'First spacecraft to "touch" the Sun\'s corona'
    ]
  },
  newhorizons: {
    name: 'New Horizons',
    type: 'probe',
    launchDate: new Date('2006-01-19T19:00:00Z'),
    status: 'extended',
    location: 'Kuiper Belt',
    currentDistance: 58.6, // AU from Earth
    currentSpeed: 14.1, // km/s
    primaryObjective: 'Kuiper Belt exploration',
    keyMetric: {
      label: 'Distance from Earth',
      value: 58.6,
      unit: 'AU'
    },
    achievements: [
      'First detailed images of Pluto (2015)',
      'Flyby of Kuiper Belt object Arrokoth (2019)',
      'Fastest Earth departure speed at launch'
    ]
  },

  // Mars System Missions
  mro: {
    name: 'Mars Reconnaissance Orbiter',
    type: 'orbiter',
    launchDate: new Date('2005-08-12T11:43:00Z'),
    status: 'extended',
    location: 'Mars orbit',
    currentDistance: 1.5, // Variable distance to Mars
    primaryObjective: 'High-resolution Mars surface imaging and climate monitoring',
    keyMetric: {
      label: 'Images Captured',
      value: '500,000+',
      unit: 'images'
    },
    achievements: [
      'Highest resolution images of Mars surface',
      'Discovered recurring slope lineae (possible water flows)',
      'Long-term climate monitoring'
    ]
  },
  maven: {
    name: 'MAVEN',
    type: 'orbiter',
    launchDate: new Date('2013-11-18T18:28:00Z'),
    status: 'extended',
    location: 'Mars orbit',
    currentDistance: 1.5, // Variable distance to Mars
    primaryObjective: 'Study Martian upper atmosphere and atmospheric escape',
    keyMetric: {
      label: 'Atmospheric Measurements',
      value: '9+ years',
      unit: 'of data'
    },
    achievements: [
      'Measured atmospheric escape to space',
      'Discovered Mars aurora phenomena',
      'Tracked solar wind interactions'
    ]
  },
  odyssey: {
    name: 'Mars Odyssey',
    type: 'orbiter',
    launchDate: new Date('2001-04-07T15:02:00Z'),
    status: 'extended',
    location: 'Mars orbit',
    currentDistance: 1.5, // Variable distance to Mars
    primaryObjective: 'Global mapping and water ice detection',
    keyMetric: {
      label: 'Mission Duration',
      value: '23+ years',
      unit: 'active'
    },
    achievements: [
      'Longest-serving Mars mission',
      'Discovered widespread water ice',
      'Communications relay for surface missions'
    ]
  },

  // Space Telescope
  jwst: {
    name: 'James Webb Space Telescope',
    type: 'telescope',
    launchDate: new Date('2021-12-25T12:20:00Z'),
    status: 'active',
    location: 'L2 Lagrange point',
    currentDistance: 0.01, // ~1.5 million km from Earth
    primaryObjective: 'Infrared astronomy and early universe observation',
    keyMetric: {
      label: 'Scientific Images',
      value: '1,000+',
      unit: 'captured'
    },
    achievements: [
      'Deepest infrared images of universe',
      'First direct exoplanet atmosphere analysis',
      'Discovery of earliest galaxies (13+ billion years old)'
    ]
  },

  // Jupiter System
  juno: {
    name: 'Juno',
    type: 'orbiter',
    launchDate: new Date('2011-08-05T16:25:00Z'),
    status: 'extended',
    location: 'Jupiter polar orbit',
    currentDistance: 5.2, // Jupiter distance from Earth varies
    primaryObjective: 'Study Jupiter\'s interior, atmosphere, and magnetosphere',
    keyMetric: {
      label: 'Jupiter Orbits',
      value: '60+',
      unit: 'completed'
    },
    achievements: [
      'First polar orbits of Jupiter',
      'Discovered Jupiter\'s interior structure',
      'Detailed magnetic field mapping'
    ]
  },
  europaclipper: {
    name: 'Europa Clipper',
    type: 'orbiter',
    launchDate: new Date('2024-10-14T16:06:00Z'),
    status: 'en_route',
    location: 'En route to Jupiter',
    currentDistance: 2.0, // En route, approximate
    primaryObjective: 'Study Europa\'s subsurface ocean and habitability',
    keyMetric: {
      label: 'Transit Time',
      value: '5.5 years',
      unit: 'to Jupiter'
    },
    achievements: [
      'Successfully launched on Falcon Heavy',
      'Largest planetary mission spacecraft',
      'Advanced ice-penetrating radar'
    ]
  },

  // Asteroid/Small Body Missions
  lucy: {
    name: 'Lucy',
    type: 'flyby',
    launchDate: new Date('2021-10-16T09:34:00Z'),
    status: 'en_route',
    location: 'En route to Trojan asteroids',
    currentDistance: 2.5, // Approximate current distance
    primaryObjective: 'Study Jupiter\'s Trojan asteroids',
    keyMetric: {
      label: 'Target Asteroids',
      value: '8',
      unit: 'planned visits'
    },
    achievements: [
      'First mission to Jupiter Trojans',
      'Successful solar array deployment',
      'Flyby of asteroid Dinkinesh (2023)'
    ]
  },
  psyche: {
    name: 'Psyche',
    type: 'orbiter',
    launchDate: new Date('2023-10-13T14:19:00Z'),
    status: 'en_route',
    location: 'En route to asteroid Psyche',
    currentDistance: 1.8, // Approximate current distance
    primaryObjective: 'Study metallic asteroid composition',
    keyMetric: {
      label: 'Transit Time',
      value: '6 years',
      unit: 'to Psyche'
    },
    achievements: [
      'First mission to a metallic asteroid',
      'Advanced ion propulsion system',
      'Deep space optical communications test'
    ]
  },
  osirisapex: {
    name: 'OSIRIS-APEX',
    type: 'orbiter',
    launchDate: new Date('2016-09-08T23:05:00Z'), // Original OSIRIS-REx launch
    status: 'en_route',
    location: 'En route to asteroid Apophis',
    currentDistance: 1.2, // Approximate current distance
    primaryObjective: 'Study asteroid Apophis during 2029 close approach',
    keyMetric: {
      label: 'Years to Apophis',
      value: '4',
      unit: 'remaining'
    },
    achievements: [
      'Successful sample return from Bennu (2023)',
      'Extended mission to Apophis',
      'First U.S. asteroid sample return'
    ]
  }
};

// Constants for calculations
const MS_PER_DAY = 86400000;
const DAYS_PER_YEAR = 365.25;
const KM_PER_AU = 149597870.7;
const SPEED_OF_LIGHT = 299792.458; // km/s

/**
 * Calculate mission data for a specific spacecraft
 */
export function calculateMissionData(
  missionName: keyof typeof MISSION_DATA,
  currentDate: Date = new Date()
): MissionData {
  const mission = MISSION_DATA[missionName];
  if (!mission) {
    throw new Error(`Unknown mission: ${missionName}`);
  }

  // Calculate mission duration
  const timeSinceLaunch = currentDate.getTime() - mission.launchDate.getTime();
  const missionDurationDays = Math.floor(timeSinceLaunch / MS_PER_DAY);
  const missionDurationYears = timeSinceLaunch / (MS_PER_DAY * DAYS_PER_YEAR);

  // Update distance for Voyager missions (they're constantly moving away)
  if (missionName === 'voyager1' || missionName === 'voyager2') {
    // Approximate distance increase per year
    const distanceIncreasePerYear = mission.currentSpeed! * 31536000 / KM_PER_AU;
    const yearsSince2025 = (currentDate.getFullYear() - 2025) + (currentDate.getMonth() / 12);
    const updatedDistance = mission.currentDistance! + (distanceIncreasePerYear * yearsSince2025);
    
    return {
      ...mission,
      missionDurationDays,
      missionDurationYears: Math.floor(missionDurationYears * 10) / 10,
      currentDistance: Math.round(updatedDistance * 10) / 10,
      keyMetric: {
        label: 'Distance from Earth',
        value: Math.round(updatedDistance * 10) / 10,
        unit: 'AU'
      }
    };
  }

  return {
    ...mission,
    missionDurationDays,
    missionDurationYears: Math.floor(missionDurationYears * 10) / 10
  };
}

/**
 * Calculate communication delay based on distance
 */
export function calculateCommunicationDelay(distanceAU: number): {
  delaySeconds: number;
  delayMinutes: number;
  delayHours: number;
  formattedDelay: string;
} {
  const distanceKm = distanceAU * KM_PER_AU;
  const delaySeconds = Math.round(distanceKm / SPEED_OF_LIGHT);
  const delayMinutes = Math.floor(delaySeconds / 60);
  const delayHours = Math.floor(delayMinutes / 60);
  
  let formattedDelay: string;
  if (delayHours > 0) {
    const remainingMinutes = delayMinutes % 60;
    formattedDelay = `${delayHours}h ${remainingMinutes}m`;
  } else if (delayMinutes > 0) {
    const remainingSeconds = delaySeconds % 60;
    formattedDelay = `${delayMinutes}m ${remainingSeconds}s`;
  } else {
    formattedDelay = `${delaySeconds}s`;
  }

  return {
    delaySeconds,
    delayMinutes,
    delayHours,
    formattedDelay
  };
}

/**
 * Format mission data for display
 */
export function formatMissionDisplay(missionData: MissionData): {
  durationText: string;
  distanceText: string;
  speedText: string;
  statusText: string;
  communicationDelay?: string;
} {
  const years = Math.floor(missionData.missionDurationYears);
  const months = Math.floor((missionData.missionDurationYears % 1) * 12);
  
  let durationText = '';
  if (years > 0) {
    durationText = `${years} year${years !== 1 ? 's' : ''}`;
    if (months > 0) {
      durationText += ` ${months} month${months !== 1 ? 's' : ''}`;
    }
  } else {
    durationText = `${missionData.missionDurationDays} days`;
  }

  const distanceText = missionData.currentDistance 
    ? `${missionData.currentDistance} AU`
    : 'Variable';

  const speedText = missionData.currentSpeed
    ? `${missionData.currentSpeed} km/s`
    : 'Variable';

  const statusText = missionData.status === 'active' 
    ? 'Active Mission'
    : missionData.status === 'extended'
    ? 'Extended Mission'
    : missionData.status === 'en_route'
    ? 'En Route'
    : missionData.status === 'completed'
    ? 'Mission Complete'
    : missionData.status;

  let communicationDelay;
  if (missionData.currentDistance) {
    const delay = calculateCommunicationDelay(missionData.currentDistance);
    communicationDelay = delay.formattedDelay;
  }

  return {
    durationText,
    distanceText,
    speedText,
    statusText,
    communicationDelay
  };
}

/**
 * Get mission milestones
 */
export function getMissionMilestone(missionName: string, missionData: MissionData): string | null {
  const years = Math.floor(missionData.missionDurationYears);
  
  // Voyager milestones
  if (missionName.includes('voyager')) {
    if (years === 40) return '40 Years in Space! 🚀';
    if (years === 45) return '45 Years of Exploration! ⭐';
    if (years === 50) return 'Half a Century in Space! 🎉';
    if (missionData.currentDistance && missionData.currentDistance > 150) {
      return 'Beyond 150 AU! 🌌';
    }
    if (missionData.currentDistance && missionData.currentDistance > 200) {
      return 'Interstellar Pioneer! 🌟';
    }
  }

  // Parker Solar Probe milestones
  if (missionName === 'parker') {
    if (missionData.keyMetric.value === 10) return '10 Solar Encounters! ☀️';
    if (missionData.keyMetric.value === 20) return '20 Perihelion Passes! 🔥';
    if (missionData.keyMetric.value === 24) return 'Mission Complete! 🏆';
  }

  // New Horizons milestones
  if (missionName === 'newhorizons') {
    if (missionData.currentDistance && missionData.currentDistance > 50) {
      return '50 AU from Earth! 🛸';
    }
    if (missionData.currentDistance && missionData.currentDistance > 60) {
      return 'Deep in the Kuiper Belt! ❄️';
    }
  }

  // Generic milestones
  if (years % 10 === 0 && years > 0) {
    return `${years} Years of Discovery! 🎊`;
  }

  return null;
}