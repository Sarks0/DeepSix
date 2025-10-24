/**
 * Mars Sol Calculation Utilities
 * Handles conversion between Earth dates and Mars sols for rover missions
 */

export interface SolData {
  rover: string;
  currentSol: number;
  earthDate: Date;
  landingDate: Date;
  missionDurationSols: number;
  missionDurationEarthDays: number;
  solProgress: number; // Percentage of current sol completed (0-100)
  marsLocalSolarTime: string;
  season: 'spring' | 'summer' | 'fall' | 'winter';
}

export interface RoverLandingData {
  name: string;
  landingDate: Date;
  landingCoordinates: {
    latitude: number;
    longitude: number;
  };
  timezone: number; // Mars timezone offset in hours
}

// Rover landing dates and coordinates
export const ROVER_DATA: Record<string, RoverLandingData> = {
  perseverance: {
    name: 'Perseverance',
    landingDate: new Date('2021-02-18T20:55:00Z'), // February 18, 2021
    landingCoordinates: {
      latitude: 18.4447,
      longitude: 77.4508
    },
    timezone: 0 // Mars Coordinated Time
  },
  curiosity: {
    name: 'Curiosity',
    landingDate: new Date('2012-08-06T05:17:57Z'), // August 6, 2012
    landingCoordinates: {
      latitude: -4.5895,
      longitude: 137.4417
    },
    timezone: 0
  },
  opportunity: {
    name: 'Opportunity',
    landingDate: new Date('2004-01-25T05:05:00Z'), // January 25, 2004
    landingCoordinates: {
      latitude: -1.9462,
      longitude: -5.5270
    },
    timezone: 0
  },
  spirit: {
    name: 'Spirit',
    landingDate: new Date('2004-01-04T04:35:00Z'), // January 4, 2004
    landingCoordinates: {
      latitude: -14.5692,
      longitude: 175.4729
    },
    timezone: 0
  }
};

// Mars constants
const MARS_SOL_DURATION_MS = 88775244; // 24h 39m 35.244s in milliseconds
const EARTH_DAY_MS = 86400000; // 24 hours in milliseconds
const MARS_YEAR_SOLS = 668.6; // Mars year in sols
const MARS_YEAR_EARTH_DAYS = 687; // Mars year in Earth days

/**
 * Calculate the current sol for a Mars rover
 */
export function calculateSol(
  roverName: keyof typeof ROVER_DATA,
  currentDate: Date = new Date()
): SolData {
  const rover = ROVER_DATA[roverName];
  if (!rover) {
    throw new Error(`Unknown rover: ${roverName}`);
  }

  // Calculate time since landing
  const timeSinceLanding = currentDate.getTime() - rover.landingDate.getTime();
  
  // Calculate sol number (sol 0 is landing day)
  const currentSol = Math.floor(timeSinceLanding / MARS_SOL_DURATION_MS);
  
  // Calculate mission duration in Earth days
  const missionDurationEarthDays = Math.floor(timeSinceLanding / EARTH_DAY_MS);
  
  // Calculate sol progress (percentage of current sol completed)
  const solStartTime = rover.landingDate.getTime() + (currentSol * MARS_SOL_DURATION_MS);
  const timeSinceSolStart = currentDate.getTime() - solStartTime;
  const solProgress = Math.min(100, Math.max(0, (timeSinceSolStart / MARS_SOL_DURATION_MS) * 100));
  
  // Calculate Mars Local Solar Time (approximate)
  const marsHours = (timeSinceSolStart / MARS_SOL_DURATION_MS) * 24;
  const marsLocalHours = Math.floor(marsHours);
  const marsLocalMinutes = Math.floor((marsHours - marsLocalHours) * 60);
  const marsLocalSolarTime = `${String(marsLocalHours).padStart(2, '0')}:${String(marsLocalMinutes).padStart(2, '0')}`;
  
  // Calculate Martian season (approximate based on Ls - solar longitude)
  const season = getMartianSeason(currentSol);
  
  return {
    rover: rover.name,
    currentSol,
    earthDate: currentDate,
    landingDate: rover.landingDate,
    missionDurationSols: currentSol,
    missionDurationEarthDays,
    solProgress,
    marsLocalSolarTime,
    season
  };
}

/**
 * Get the Martian season based on sol number
 * This is a simplified approximation
 */
function getMartianSeason(sol: number): 'spring' | 'summer' | 'fall' | 'winter' {
  const solInYear = sol % MARS_YEAR_SOLS;
  const seasonLength = MARS_YEAR_SOLS / 4;
  
  if (solInYear < seasonLength) return 'spring';
  if (solInYear < seasonLength * 2) return 'summer';
  if (solInYear < seasonLength * 3) return 'fall';
  return 'winter';
}

/**
 * Convert Earth date to sol for a specific rover
 */
export function earthDateToSol(
  roverName: keyof typeof ROVER_DATA,
  earthDate: Date
): number {
  const rover = ROVER_DATA[roverName];
  if (!rover) {
    throw new Error(`Unknown rover: ${roverName}`);
  }
  
  const timeSinceLanding = earthDate.getTime() - rover.landingDate.getTime();
  return Math.floor(timeSinceLanding / MARS_SOL_DURATION_MS);
}

/**
 * Convert sol to approximate Earth date for a specific rover
 */
export function solToEarthDate(
  roverName: keyof typeof ROVER_DATA,
  sol: number
): Date {
  const rover = ROVER_DATA[roverName];
  if (!rover) {
    throw new Error(`Unknown rover: ${roverName}`);
  }
  
  const millisecondsSinceLanding = sol * MARS_SOL_DURATION_MS;
  return new Date(rover.landingDate.getTime() + millisecondsSinceLanding);
}

/**
 * Format sol data for display
 */
export function formatSolDisplay(solData: SolData): {
  solText: string;
  durationText: string;
  timeText: string;
  progressText: string;
} {
  return {
    solText: `Sol ${solData.currentSol}`,
    durationText: `${solData.missionDurationEarthDays} Earth days`,
    timeText: `${solData.marsLocalSolarTime} MLST`,
    progressText: `${Math.round(solData.solProgress)}% of sol complete`
  };
}

/**
 * Get milestone text for significant sols
 */
export function getSolMilestone(sol: number): string | null {
  if (sol === 100) return '100 Sols on Mars!';
  if (sol === 365) return 'One Earth Year on Mars!';
  if (sol === 500) return '500 Sols Milestone!';
  if (sol === 668) return 'One Martian Year!';
  if (sol === 1000) return '1000 Sols on Mars!';
  if (sol % 1000 === 0 && sol > 1000) return `${sol} Sols Milestone!`;
  if (sol % 500 === 0 && sol > 500) return `${sol} Sols on Mars!`;
  return null;
}