import { RoverPhotoGallery } from '@/components/mission-cards/RoverPhotoGallery';
import { InSightPhotoGallery } from '@/components/mission-cards/InSightPhotoGallery';
import { MissionMilestones } from '@/components/mission-cards/MissionMilestones';

// Dynamic page for mission details

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
      'Humanity\'s most distant spacecraft and first human-made object to enter interstellar space. After revolutionary flybys of Jupiter and Saturn, Voyager 1 continues its eternal journey carrying the Golden Record - a message from Earth to the cosmos.',
    achievements: [
      'First spacecraft to enter interstellar space (August 25, 2012)',
      'Most distant human-made object from Earth',
      'Discovered active volcanoes on Io (Jupiter\'s moon) - first beyond Earth',
      'Discovered Jupiter\'s complex ring system',
      'Detailed images of Saturn\'s rings revealing intricate structure',
      'First close-up images of Titan showing thick atmosphere',
      'Operating for over 47 years - longest operating spacecraft',
      'Traveled over 25 billion kilometers from Earth',
      'Confirmed the heliopause boundary at 121 AU from the Sun',
    ],
    objectives: [
      'Complete the Grand Tour of the outer planets',
      'Study Jupiter and Saturn systems in detail',
      'Investigate the boundary of the solar system',
      'Explore the interstellar medium',
      'Carry humanity\'s message via the Golden Record',
      'Study cosmic rays and magnetic fields in interstellar space',
      'Continue transmitting data as long as power permits (until ~2025)',
    ],
    instruments: [
      'Cosmic Ray Subsystem (CRS): Measures high-energy particles',
      'Low-Energy Charged Particle (LECP): Detects ions and electrons',
      'Magnetometer (MAG): Measures magnetic field strength and direction',
      'Plasma Wave System (PWS): Detects plasma wave emissions',
      'Cameras (disabled): Took over 67,000 images including the famous "Pale Blue Dot"',
      'Golden Record: 12-inch gold-plated copper disk with sounds and images from Earth',
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
      'The only spacecraft to visit all four giant planets - Jupiter, Saturn, Uranus, and Neptune. Voyager 2 provided humanity\'s first and only close-up look at the ice giants and entered interstellar space in 2018, continuing its epic journey of discovery.',
    achievements: [
      'Only spacecraft to visit Uranus (1986) and Neptune (1989)',
      'Entered interstellar space (November 5, 2018)',
      'Discovered 11 new moons: 3 at Jupiter, 4 at Saturn, 2 at Uranus, 2 at Neptune',
      'First detailed images of Neptune\'s Great Dark Spot',
      'Discovered active geysers on Neptune\'s moon Triton',
      'Revealed Uranus\' unusual tilted magnetic field',
      'Discovered Neptune\'s rings and unusual magnetic field',
      'First to detect lightning on Jupiter and Saturn',
      'Confirmed Europa has a subsurface ocean',
      'Operating continuously for over 47 years',
    ],
    objectives: [
      'Complete the Grand Tour visiting all four giant planets',
      'First reconnaissance of Uranus and Neptune systems',
      'Study the ice giants\' atmospheres, rings, and moons',
      'Investigate the outer boundary of the solar system',
      'Explore interstellar space from a different region than Voyager 1',
      'Compare interstellar medium data with Voyager 1 findings',
      'Continue operations until power depletion (~2025)',
    ],
    instruments: [
      'Imaging Science System (ISS): Twin cameras for detailed planetary photography',
      'Cosmic Ray Subsystem (CRS): Studies high-energy particles',
      'Plasma Science (PLS): Measures solar wind and planetary magnetospheres',
      'Low-Energy Charged Particle (LECP): Analyzes ions and electrons',
      'Magnetometer (MAG): Maps magnetic fields',
      'Infrared Interferometer Spectrometer (IRIS): Analyzed atmospheric composition',
      'Photopolarimeter System (PPS): Studied atmospheric particles',
      'Planetary Radio Astronomy (PRA): Detected radio emissions from planets',
      'Ultraviolet Spectrometer (UVS): Studied atmospheric composition',
      'Golden Record: Identical to Voyager 1, carrying Earth\'s message to the cosmos',
    ],
  },
  'parker-solar-probe': {
    name: 'Parker Solar Probe',
    status: 'Active',
    type: 'Solar Probe',
    launchDate: 'August 12, 2018',
    location: 'Solar Orbit',
    distance: '6.9 million km from Sun (closest approach)',
    description: 'Humanity\'s first mission to "touch" the Sun, flying through the solar corona to unlock the mysteries of our closest star. Named after Eugene Parker who theorized the solar wind.',
    achievements: [
      'First spacecraft to fly through the solar corona (April 2021)',
      'Fastest human-made object: 635,266 km/h (394,736 mph)',
      'Closest approach to the Sun: 6.9 million km (4.3 million miles)',
      'Discovered magnetic switchbacks in solar wind',
      'First direct measurements of the solar wind acceleration zone',
      'Captured first images of Venus\' surface in visible light',
      'Discovered a dust-free zone around the Sun',
      'Measured the solar wind slowing down as it leaves the Sun',
    ],
    objectives: [
      'Trace the flow of energy that heats the corona and accelerates solar wind',
      'Determine the structure and dynamics of magnetic fields at sources of solar wind',
      'Explore mechanisms that accelerate and transport energetic particles',
      'Study the dust environment near the Sun',
      'Revolutionize our understanding of the Sun and its effects on space weather',
    ],
    instruments: [
      'FIELDS: Measures electric and magnetic fields, radio waves, and plasma density',
      'WISPR: Wide-field Imager for Solar Probe - captures images of solar wind structures',
      'ISʘIS: Integrated Science Investigation of the Sun - measures energetic particles',
      'SWEAP: Solar Wind Electrons Alphas and Protons - counts particles and measures properties',
      'Heat Shield: 11.43 cm thick carbon-composite shield protecting instruments from 1,377°C heat',
    ],
  },
  'mars-reconnaissance-orbiter': {
    name: 'Mars Reconnaissance Orbiter',
    status: 'Active',
    type: 'Mars Orbiter',
    launchDate: 'August 12, 2005',
    landingDate: 'March 10, 2006',
    location: 'Mars Orbit',
    description: 'NASA\'s most powerful and longest-serving Mars orbiter, providing high-resolution imaging and detailed surface analysis for nearly two decades. MRO has fundamentally changed our understanding of Mars through unprecedented detail.',
    achievements: [
      'Longest-serving active Mars orbiter (19+ years operational)',
      'Captured over 6.9 million images of Mars surface in stunning detail',
      'Delivered over 473 terabits of data - more than all other Mars missions combined',
      'Discovered recurring slope lineae (possible seasonal water flows)',
      'Mapped mineral composition revealing ancient water activity',
      'Provided landing site analysis for Curiosity, InSight, and Perseverance',
      'Detected subsurface water ice across Mars',
      'Confirmed active avalanches on Martian polar ice caps',
      'Served as primary communications relay for Mars surface missions',
    ],
    objectives: [
      'Search for evidence of past or present water activity on Mars',
      'Map Mars surface composition and mineralogy in unprecedented detail',
      'Study Mars climate and seasonal changes',
      'Provide high-resolution imaging for future mission planning',
      'Serve as communications relay for surface missions',
      'Monitor daily weather patterns and atmospheric conditions',
    ],
    instruments: [
      'HiRISE: High Resolution Imaging Science Experiment - captures images at 30cm resolution',
      'CRISM: Compact Reconnaissance Imaging Spectrometer for Mars - mineral analysis',
      'MCS: Mars Climate Sounder - atmospheric temperature and humidity profiles',
      'MARCI: Mars Color Imager - daily global weather maps',
      'SHARAD: Shallow Subsurface Radar - detects underground ice and rock layers',
      'CTX: Context Camera - wide-angle imaging for regional mapping',
    ],
  },
  'maven': {
    name: 'MAVEN (Mars Atmosphere and Volatile Evolution)',
    status: 'Active',
    type: 'Mars Orbiter',
    launchDate: 'November 18, 2013',
    landingDate: 'September 22, 2014',
    location: 'Mars Orbit',
    description: 'NASA\'s mission to understand how Mars lost its atmosphere over billions of years. MAVEN studies the upper atmosphere of Mars and how it interacts with the solar wind, solving the mystery of Mars\' transformation from a warm, wet world to the cold, dry planet we see today.',
    achievements: [
      'Discovered that Mars loses atmosphere 10 times faster during solar storms',
      'Confirmed that solar wind stripped away Mars\' atmosphere over billions of years',
      'First detection of metal ions in Mars\' upper atmosphere',
      'Discovered aurora activity across Mars\' entire planet',
      'Measured seasonal variations in atmospheric escape',
      'Detected unexpected dust clouds at high altitudes',
      'Provided crucial atmospheric data for InSight landing',
      'Extended mission multiple times due to exceptional performance',
      'Served as backup communications relay for surface missions',
    ],
    objectives: [
      'Determine the role of atmospheric loss in changing Mars\' climate',
      'Study the current state and composition of Mars\' upper atmosphere',
      'Understand how solar wind and radiation affect atmospheric escape',
      'Measure the rate at which atmosphere is lost to space today',
      'Investigate the history of water and habitability on Mars',
      'Characterize seasonal and solar cycle variations in the atmosphere',
    ],
    instruments: [
      'NGIMS: Neutral Gas and Ion Mass Spectrometer - analyzes atmospheric composition',
      'IUVS: Imaging Ultraviolet Spectrograph - measures atmospheric structure and composition',
      'LPW: Langmuir Probe and Waves - measures plasma density and electric fields',
      'MAG: Magnetometer - detects magnetic field variations',
      'SEP: Solar Energetic Particle detector - monitors solar particle radiation',
      'SWIA: Solar Wind Ion Analyzer - measures solar wind interactions',
      'SWEA: Solar Wind Electron Analyzer - detects electron populations',
      'STATIC: Supra-Thermal and Thermal Ion Composition - analyzes ion escape',
    ],
  },
  'mars-odyssey': {
    name: '2001 Mars Odyssey',
    status: 'Active',
    type: 'Mars Orbiter',
    launchDate: 'April 7, 2001',
    landingDate: 'October 24, 2001',
    location: 'Mars Orbit',
    description: 'NASA\'s longest-serving spacecraft at Mars and the backbone of Mars exploration. Named after Arthur C. Clarke\'s "2001: A Space Odyssey," this remarkable orbiter has been mapping Mars and relaying communications for over 23 years, far exceeding its planned 2-year mission.',
    achievements: [
      'Longest-serving spacecraft at Mars (23+ years operational)',
      'First global map of chemical elements on Mars surface',
      'Discovered vast water ice deposits in Martian soil near both poles',
      'Primary communications relay for all Mars surface missions since 2004',
      'Mapped over 85% of Mars surface with thermal infrared imaging',
      'Detected underground water ice extending to lower latitudes',
      'Identified the most radiation-safe landing sites for future human missions',
      'Monitored seasonal changes in water vapor and dust storms',
      'Enabled successful operations of Spirit, Opportunity, Phoenix, Curiosity, InSight, and Perseverance',
    ],
    objectives: [
      'Map the composition of Mars surface and identify water-related minerals',
      'Detect water ice in the shallow subsurface across Mars',
      'Study radiation environment to assess hazards for future human exploration',
      'Create detailed thermal and visible light images of Mars surface',
      'Serve as communications relay between Earth and Mars surface missions',
      'Monitor seasonal and long-term changes in Mars atmosphere and climate',
    ],
    instruments: [
      'THEMIS: Thermal Emission Imaging System - infrared and visible imaging',
      'GRS: Gamma Ray Spectrometer - detects chemical elements including water',
      'MARIE: Mars Radiation Environment Experiment - measures radiation levels',
      'UHF Antenna: Ultra High Frequency communications relay system',
      'Neutron Spectrometer: Part of GRS, specifically detects subsurface water ice',
      'High Gain Antenna: Primary Earth communications and relay operations',
    ],
  },
  'james-webb-space-telescope': {
    name: 'James Webb Space Telescope',
    status: 'Active',
    type: 'Space Observatory',
    launchDate: 'December 25, 2021',
    landingDate: 'January 24, 2022',
    location: 'L2 Lagrange Point',
    distance: '1.5 million km from Earth',
    description: 'The most powerful space telescope ever built and the premier observatory of the next decade. JWST peers deeper into space and further back in time than any telescope before, revolutionizing our understanding of the universe from the first galaxies to nearby exoplanets.',
    achievements: [
      'Captured the deepest infrared images of the universe ever taken',
      'Detected the most distant galaxy ever observed (JADES-GS-z13-0, 13.4 billion years old)',
      'First direct spectroscopic analysis of exoplanet atmospheres in unprecedented detail',
      'Discovered water vapor in the atmosphere of rocky exoplanet K2-18 b',
      'Revealed stellar nurseries hidden behind cosmic dust clouds',
      'Observed galaxies that formed just 400 million years after the Big Bang',
      'Detected complex organic molecules in distant galaxies',
      'Captured detailed images of star formation in nearby galaxies',
      'Analyzed atmospheric composition of multiple exoplanets simultaneously',
    ],
    objectives: [
      'Study the formation of the first stars and galaxies in the early universe',
      'Investigate the assembly and evolution of galaxies over cosmic time',
      'Understand the birth of stars and planetary systems',
      'Characterize exoplanet atmospheres and search for signs of habitability',
      'Explore objects within our own solar system from Mars to Kuiper Belt',
      'Test and refine our understanding of dark matter and dark energy',
    ],
    instruments: [
      'NIRCam: Near Infrared Camera - primary imaging instrument for wavelengths 0.6-5 micrometers',
      'NIRSpec: Near Infrared Spectrograph - spectroscopy of up to 100 objects simultaneously',
      'MIRI: Mid-Infrared Instrument - imaging and spectroscopy at 5-28 micrometers',
      'FGS/NIRISS: Fine Guidance Sensor/Near Infrared Imager and Slitless Spectrograph',
      'Primary Mirror: 6.5-meter segmented mirror with 18 hexagonal segments',
      'Sunshield: Five-layer shield the size of a tennis court protecting instruments',
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

          {/* Mission Timeline for Voyager and Parker */}
          {(id.includes('voyager') || id === 'parker-solar-probe') && (
            <MissionMilestones missionId={id} />
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
