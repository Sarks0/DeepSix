/**
 * Mission Tracking Utilities
 * Real-time tracking data for non-Mars space missions
 */

export interface MissionData {
  name: string;
  type: 'probe' | 'orbiter' | 'lander' | 'flyby';
  launchDate: Date;
  status: 'active' | 'extended' | 'completed' | 'lost';
  missionDurationDays: number;
  missionDurationYears: number;
  currentDistance?: number; // in AU (Astronomical Units)
  currentSpeed?: number; // in km/s
  lastContact?: Date;
  primaryObjective: string;
  keyMetric: {
    label: string;
    value: string | number;
    unit?: string;
  };
}

// Mission launch dates and data
export const MISSION_DATA: Record<string, Omit<MissionData, 'missionDurationDays' | 'missionDurationYears'>> = {
  voyager1: {
    name: 'Voyager 1',
    type: 'probe',
    launchDate: new Date('1977-09-05T12:56:00Z'),
    status: 'active',
    currentDistance: 164.7, // AU from Earth (as of 2025)
    currentSpeed: 17.0, // km/s
    primaryObjective: 'Interstellar space exploration',
    keyMetric: {
      label: 'Distance from Earth',
      value: 164.7,
      unit: 'AU'
    }
  },
  voyager2: {
    name: 'Voyager 2',
    type: 'probe',
    launchDate: new Date('1977-08-20T14:29:00Z'),
    status: 'active',
    currentDistance: 137.6, // AU from Earth
    currentSpeed: 15.4, // km/s
    primaryObjective: 'Interstellar space exploration',
    keyMetric: {
      label: 'Distance from Earth',
      value: 137.6,
      unit: 'AU'
    }
  },
  parker: {
    name: 'Parker Solar Probe',
    type: 'probe',
    launchDate: new Date('2018-08-12T07:31:00Z'),
    status: 'active',
    currentDistance: 0.1, // Varies, close to Sun
    currentSpeed: 200, // Maximum speed near Sun
    primaryObjective: 'Study the solar corona',
    keyMetric: {
      label: 'Perihelion Passes',
      value: 18,
      unit: 'completed'
    }
  },
  newhorizons: {
    name: 'New Horizons',
    type: 'probe',
    launchDate: new Date('2006-01-19T19:00:00Z'),
    status: 'extended',
    currentDistance: 58.6, // AU from Earth
    currentSpeed: 14.1, // km/s
    primaryObjective: 'Kuiper Belt exploration',
    keyMetric: {
      label: 'Distance from Earth',
      value: 58.6,
      unit: 'AU'
    }
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