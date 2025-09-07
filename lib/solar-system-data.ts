// Solar System Data - Accurate orbital mechanics and celestial body properties

export interface PlanetData {
  name: string;
  radius: number; // in Earth radii
  distance: number; // average distance from Sun in AU
  color: string; // placeholder color
  rotationSpeed: number; // rotation speed multiplier
  orbitalSpeed: number; // orbital speed multiplier
  tilt: number; // axial tilt in degrees
  hasRings: boolean;
  moons?: number;
}

export interface SpacecraftData {
  name: string;
  type: 'rover' | 'probe' | 'orbiter';
  status: 'active' | 'inactive' | 'lost';
  location: {
    planet?: string;
    position?: [number, number, number]; // x, y, z coordinates
    distance?: number; // distance from Sun in AU for deep space probes
  };
  launchDate: string;
  mission: string;
  color: string;
}

// Accurate planet data based on NASA specifications
export const PLANETS: PlanetData[] = [
  {
    name: 'Mercury',
    radius: 0.383,
    distance: 0.39,
    color: '#8C7853',
    rotationSpeed: 0.017,
    orbitalSpeed: 4.15,
    tilt: 0.03,
    hasRings: false,
  },
  {
    name: 'Venus',
    radius: 0.949,
    distance: 0.72,
    color: '#FFC649',
    rotationSpeed: -0.004, // retrograde rotation
    orbitalSpeed: 1.62,
    tilt: 177.4,
    hasRings: false,
  },
  {
    name: 'Earth',
    radius: 1.0,
    distance: 1.0,
    color: '#6B93D6',
    rotationSpeed: 1.0,
    orbitalSpeed: 1.0,
    tilt: 23.5,
    hasRings: false,
    moons: 1,
  },
  {
    name: 'Mars',
    radius: 0.532,
    distance: 1.52,
    color: '#CD5C5C',
    rotationSpeed: 0.97,
    orbitalSpeed: 0.53,
    tilt: 25.2,
    hasRings: false,
    moons: 2,
  },
  {
    name: 'Jupiter',
    radius: 11.21,
    distance: 5.2,
    color: '#D8CA9D',
    rotationSpeed: 2.4,
    orbitalSpeed: 0.08,
    tilt: 3.1,
    hasRings: true,
    moons: 95,
  },
  {
    name: 'Saturn',
    radius: 9.45,
    distance: 9.58,
    color: '#FAD5A5',
    rotationSpeed: 2.2,
    orbitalSpeed: 0.03,
    tilt: 26.7,
    hasRings: true,
    moons: 146,
  },
  {
    name: 'Uranus',
    radius: 4.01,
    distance: 19.2,
    color: '#4FD0E3',
    rotationSpeed: 1.4,
    orbitalSpeed: 0.01,
    tilt: 97.8,
    hasRings: true,
    moons: 27,
  },
  {
    name: 'Neptune',
    radius: 3.88,
    distance: 30.05,
    color: '#4B70DD',
    rotationSpeed: 1.5,
    orbitalSpeed: 0.006,
    tilt: 28.3,
    hasRings: true,
    moons: 16,
  },
];

// Active and historical spacecraft data
export const SPACECRAFT: SpacecraftData[] = [
  {
    name: 'Perseverance',
    type: 'rover',
    status: 'active',
    location: { planet: 'Mars' },
    launchDate: '2020-07-30',
    mission: 'Mars 2020',
    color: '#FF6B35',
  },
  {
    name: 'Curiosity',
    type: 'rover',
    status: 'active',
    location: { planet: 'Mars' },
    launchDate: '2011-11-26',
    mission: 'Mars Science Laboratory',
    color: '#FF9500',
  },
  {
    name: 'Voyager 1',
    type: 'probe',
    status: 'active',
    location: { distance: 159.0 }, // approximately 159 AU from Sun
    launchDate: '1977-09-05',
    mission: 'Voyager Program',
    color: '#00D4FF',
  },
  {
    name: 'Voyager 2',
    type: 'probe',
    status: 'active',
    location: { distance: 132.0 }, // approximately 132 AU from Sun
    launchDate: '1977-08-20',
    mission: 'Voyager Program',
    color: '#0099CC',
  },
  {
    name: 'Parker Solar Probe',
    type: 'probe',
    status: 'active',
    location: { distance: 0.046 }, // highly elliptical orbit, closest approach
    launchDate: '2018-08-12',
    mission: 'Parker Solar Probe',
    color: '#FFD700',
  },
  {
    name: 'New Horizons',
    type: 'probe',
    status: 'active',
    location: { distance: 54.0 }, // beyond Pluto
    launchDate: '2006-01-19',
    mission: 'New Horizons',
    color: '#9966CC',
  },
];

// Utility functions for orbital calculations
export const calculateOrbitalPosition = (
  distance: number,
  time: number,
  speed: number,
  offset: number = 0
): [number, number, number] => {
  const angle = (time * speed + offset) * 0.01;
  const x = Math.cos(angle) * distance * 10; // scale factor for visibility
  const z = Math.sin(angle) * distance * 10;
  return [x, 0, z];
};

export const calculatePlanetScale = (radius: number, minSize: number = 0.1): number => {
  // Logarithmic scaling for better visualization
  return Math.max(minSize, Math.log(radius + 1) * 0.5);
};

// Performance optimization levels
export const PERFORMANCE_LEVELS = {
  HIGH: {
    starCount: 5000,
    planetDetail: 64,
    enableShadows: true,
    antialiasing: true,
  },
  MEDIUM: {
    starCount: 2000,
    planetDetail: 32,
    enableShadows: true,
    antialiasing: false,
  },
  LOW: {
    starCount: 1000,
    planetDetail: 16,
    enableShadows: false,
    antialiasing: false,
  },
} as const;

export type PerformanceLevel = keyof typeof PERFORMANCE_LEVELS;
