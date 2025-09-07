import { RoverPhotoGallery } from '@/components/mission-cards/RoverPhotoGallery';
import { InSightPhotoGallery } from '@/components/mission-cards/InSightPhotoGallery';

// Disable Edge Runtime for this page due to async_hooks compatibility issue
// export const runtime = 'edge';

// Mission data (static for now, can be fetched from API later)
interface MissionData {
  name: string;
  status: string;
  type: string;
  launchDate: string;
  landingDate?: string;
  endDate?: string;
  location: string;
  distance?: string;
  description: string;
  missionEndReason?: string;
  achievements?: string[];
  objectives: string[];
  instruments: string[];
  lastData?: {
    sol: string;
    date: string;
    temperature: { min: number; max: number; avg: number };
    pressure: { min: number; max: number; avg: number };
    windSpeed: { min: number; max: number; avg: number };
    season: string;
  };
}

const missions: Record<string, MissionData> = {
  perseverance: {
    name: 'Mars Perseverance Rover',
    status: 'Active',
    type: 'Mars Rover',
    launchDate: 'July 30, 2020',
    landingDate: 'February 18, 2021',
    location: 'Jezero Crater, Mars',
    description:
      'Searching for signs of ancient microbial life and collecting rock samples for future return to Earth.',
    objectives: [
      'Search for signs of ancient microbial life',
      'Collect rock and soil samples for future return',
      'Test oxygen production from Martian atmosphere',
      'Fly the Ingenuity helicopter',
    ],
    instruments: [
      'Mastcam-Z: Panoramic and stereoscopic imaging',
      'SuperCam: Remote analysis of rocks',
      'PIXL: X-ray fluorescence for elemental analysis',
      'SHERLOC: UV Raman spectroscopy',
      'MOXIE: Oxygen generation experiment',
    ],
  },
  curiosity: {
    name: 'Mars Curiosity Rover',
    status: 'Active',
    type: 'Mars Rover',
    launchDate: 'November 26, 2011',
    landingDate: 'August 6, 2012',
    location: 'Gale Crater, Mars',
    description:
      'Exploring Mars to assess whether the planet ever had an environment able to support microbial life.',
    objectives: [
      'Determine if Mars ever had life',
      'Study Martian climate and geology',
      'Prepare for human exploration',
    ],
    instruments: [
      'ChemCam: Laser-induced breakdown spectroscopy',
      'SAM: Sample Analysis at Mars',
      'RAD: Radiation Assessment Detector',
      'DAN: Dynamic Albedo of Neutrons',
    ],
  },
  insight: {
    name: 'Mars InSight Lander',
    status: 'Mission Ended',
    type: 'Mars Lander',
    launchDate: 'May 5, 2018',
    landingDate: 'November 26, 2018',
    endDate: 'December 15, 2022',
    location: 'Elysium Planitia, Mars',
    description:
      'Interior Exploration using Seismic Investigations, Geodesy and Heat Transport. First mission to study Mars&apos; deep interior.',
    missionEndReason:
      'The mission ended after gradually losing power due to dust accumulation on its solar panels. NASA declared the mission over on December 21, 2022, after two consecutive failed communication attempts.',
    achievements: [
      'Detected over 1,300 marsquakes, revealing Mars is seismically active',
      "Measured the size of Mars' core (radius: ~1,830 km)",
      'Discovered Mars&apos; crust is thinner than expected (20-37 km)',
      'Recorded the largest marsquake ever detected (magnitude 5)',
      'Provided daily weather reports for 1,410 sols (Mars days)',
      'Proved Mars has a liquid outer core',
    ],
    objectives: [
      "Study Mars' interior structure and composition",
      'Measure seismic activity (marsquakes)',
      'Monitor weather and climate patterns',
      'Determine heat flow from Mars&apos; interior',
    ],
    instruments: [
      'SEIS: Seismic Experiment for Interior Structure',
      'HP³: Heat Flow and Physical Properties Package (mole)',
      'RISE: Rotation and Interior Structure Experiment',
      'APSS: Auxiliary Payload Sensor Suite (weather station)',
      'IDC: Instrument Deployment Camera',
      'ICC: Instrument Context Camera',
    ],
    lastData: {
      sol: '1410',
      date: 'December 15, 2022',
      temperature: { min: -101, max: -20, avg: -60 },
      pressure: { min: 721, max: 747, avg: 734 },
      windSpeed: { min: 0.2, max: 9.8, avg: 4.3 },
      season: 'Northern Winter',
    },
  },
  'voyager-1': {
    name: 'Voyager 1',
    status: 'Active',
    type: 'Deep Space Probe',
    launchDate: 'September 5, 1977',
    location: 'Interstellar Space',
    distance: '25.1 billion km from Earth',
    description:
      'Humanity&apos;s most distant spacecraft, exploring interstellar space and carrying the Golden Record.',
    objectives: [
      'Study the outer Solar System',
      'Explore interstellar space',
      'Carry humanity&apos;s message to the stars',
    ],
    instruments: [
      'Cosmic Ray Subsystem',
      'Low-Energy Charged Particles',
      'Magnetometer',
      'Plasma Wave System',
    ],
  },
  'voyager-2': {
    name: 'Voyager 2',
    status: 'Active',
    type: 'Deep Space Probe',
    launchDate: 'August 20, 1977',
    location: 'Interstellar Space',
    distance: '20.9 billion km from Earth',
    description:
      'The only spacecraft to visit all four giant planets, now exploring interstellar space.',
    objectives: [
      'Grand Tour of the Solar System',
      'Study Jupiter, Saturn, Uranus, and Neptune',
      'Explore interstellar medium',
    ],
    instruments: [
      'Imaging Science System',
      'Plasma Science Experiment',
      'Infrared Interferometer Spectrometer',
      'Photopolarimeter System',
    ],
  },
  'parker-solar-probe': {
    name: 'Parker Solar Probe',
    status: 'Active',
    type: 'Solar Probe',
    launchDate: 'August 12, 2018',
    location: 'Solar Orbit',
    description: 'Touching the Sun to study the solar corona and solar wind.',
    objectives: [
      'Trace energy flow in the corona',
      'Understand solar wind acceleration',
      'Explore magnetic fields near the Sun',
      'Study solar energetic particles',
    ],
    instruments: [
      'FIELDS: Electromagnetic fields investigation',
      'WISPR: Wide-field Imager',
      'ISʘIS: Integrated Science Investigation of the Sun',
      'SWEAP: Solar Wind Electrons Alphas and Protons',
    ],
  },
};

export default async function MissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mission = missions[id];

  if (!mission) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Mission Not Found</h1>
        <p className="text-gray-400">The requested mission could not be found.</p>
      </div>
    );
  }

  const isRover = id === 'perseverance' || id === 'curiosity';
  const isInSight = id === 'insight';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Mission Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {mission.name}
          </h1>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              mission.status === 'Active'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-gray-500/20 text-gray-400'
            }`}
          >
            {mission.status}
          </span>
        </div>

        <p className="text-xl text-gray-300 mb-4">{mission.description}</p>

        {/* Mission End Notice for InSight */}
        {mission.missionEndReason && (
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Mission Conclusion</h3>
            <p className="text-gray-400">{mission.missionEndReason}</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900 rounded-lg p-3">
            <p className="text-sm text-gray-400">Type</p>
            <p className="font-semibold">{mission.type}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-3">
            <p className="text-sm text-gray-400">Launch Date</p>
            <p className="font-semibold">{mission.launchDate}</p>
          </div>
          {mission.landingDate && (
            <div className="bg-gray-900 rounded-lg p-3">
              <p className="text-sm text-gray-400">Landing Date</p>
              <p className="font-semibold">{mission.landingDate}</p>
            </div>
          )}
          {mission.endDate && (
            <div className="bg-gray-900 rounded-lg p-3">
              <p className="text-sm text-gray-400">End Date</p>
              <p className="font-semibold">{mission.endDate}</p>
            </div>
          )}
          <div className="bg-gray-900 rounded-lg p-3">
            <p className="text-sm text-gray-400">Location</p>
            <p className="font-semibold">{mission.location}</p>
          </div>
        </div>
      </div>

      {/* Mission Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Photo Gallery for Rovers */}
          {isRover && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Latest Photos from Mars</h2>
              <RoverPhotoGallery rover={id as 'perseverance' | 'curiosity'} limit={12} />
            </div>
          )}

          {/* Photo Gallery for InSight */}
          {isInSight && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Mission Images from Elysium Planitia</h2>
              <InSightPhotoGallery />
            </div>
          )}

          {/* Last Weather Data for InSight */}
          {isInSight && mission.lastData && (
            <div className="bg-gray-900 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Last Recorded Weather Data</h2>
              <p className="text-sm text-gray-400 mb-4">
                Sol {mission.lastData.sol} • {mission.lastData.date}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-800 rounded p-3">
                  <p className="text-xs text-gray-400 uppercase mb-1">Temperature</p>
                  <p className="text-lg font-mono text-white">
                    {mission.lastData.temperature.avg}°C
                  </p>
                  <p className="text-xs text-gray-500">
                    Min: {mission.lastData.temperature.min}°C / Max:{' '}
                    {mission.lastData.temperature.max}°C
                  </p>
                </div>
                <div className="bg-gray-800 rounded p-3">
                  <p className="text-xs text-gray-400 uppercase mb-1">Pressure</p>
                  <p className="text-lg font-mono text-white">{mission.lastData.pressure.avg} Pa</p>
                  <p className="text-xs text-gray-500">
                    {((mission.lastData.pressure.avg / 101325) * 100).toFixed(2)}% of Earth
                  </p>
                </div>
                <div className="bg-gray-800 rounded p-3">
                  <p className="text-xs text-gray-400 uppercase mb-1">Wind Speed</p>
                  <p className="text-lg font-mono text-white">
                    {mission.lastData.windSpeed.avg} m/s
                  </p>
                  <p className="text-xs text-gray-500">Max: {mission.lastData.windSpeed.max} m/s</p>
                </div>
              </div>

              <p className="text-xs text-gray-500">Season: {mission.lastData.season}</p>
            </div>
          )}

          {/* Mission Achievements for InSight */}
          {mission.achievements && (
            <div className="bg-gray-900 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Mission Achievements</h2>
              <ul className="space-y-2">
                {mission.achievements.map((achievement, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span className="text-gray-300">{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mission Objectives */}
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Mission Objectives</h2>
            <ul className="space-y-2">
              {mission.objectives.map((objective, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-400 mr-2">▸</span>
                  <span className="text-gray-300">{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Instruments */}
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Scientific Instruments</h3>
            <ul className="space-y-2 text-sm">
              {mission.instruments.map((instrument, index) => (
                <li key={index} className="text-gray-300">
                  • {instrument}
                </li>
              ))}
            </ul>
          </div>

          {/* Communication Delay for Deep Space */}
          {(id.includes('voyager') || id === 'parker-solar-probe') && (
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Communication Status</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Distance from Earth</p>
                  <p className="text-2xl font-mono font-bold text-purple-400">
                    {mission.distance || 'Calculating...'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Signal Travel Time</p>
                  <p className="text-lg font-mono text-blue-400">One-way: ~23 hours</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
