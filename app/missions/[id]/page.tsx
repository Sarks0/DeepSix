import { RoverPhotoGallery } from '@/components/mission-cards/RoverPhotoGallery';
import { InSightPhotoGallery } from '@/components/mission-cards/InSightPhotoGallery';
import { JWSTPhotoGallery } from '@/components/mission-cards/JWSTPhotoGallery';
import { MissionMilestones } from '@/components/mission-cards/MissionMilestones';
import { MissionDataFeed } from '@/components/mission-data/MissionDataFeed';
import { MissionStatusIndicator } from '@/components/mission-data/MissionStatusIndicator';
import { DiscoveryFeed } from '@/components/mission-data/DiscoveryFeed';
import { LiveSpacecraftData } from '@/components/mission-data/LiveSpacecraftData';

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
    status: 'Extended Mission',
    type: 'Solar Probe',
    launchDate: 'August 12, 2018',
    location: 'Solar Orbit',
    distance: '6.9 million km from Sun (closest approach)',
    description: 'Humanity\'s first mission to "touch" the Sun, flying through the solar corona to unlock the mysteries of our closest star. Completed primary mission with 24 perihelion passes (June 2025) and continuing extended operations through 2030. Named after Eugene Parker who theorized the solar wind.',
    achievements: [
      'Completed primary mission: 24 perihelion passes (June 2025)',
      'First spacecraft to fly through the solar corona (April 2021)',
      'Fastest human-made object: 635,266 km/h (394,736 mph)',
      'Closest approach to the Sun: 3.8 million miles (6.1 million km)',
      'Discovered magnetic switchbacks in solar wind',
      'First direct measurements of the solar wind acceleration zone',
      'Captured first images of Venus\' surface in visible light',
      'Discovered a dust-free zone around the Sun',
      'Funded through 2030 for extended operations',
    ],
    objectives: [
      'Continue studying the solar corona through declining solar cycle phase',
      'Trace the flow of energy that heats the corona and accelerates solar wind',
      'Determine the structure and dynamics of magnetic fields at sources of solar wind',
      'Explore mechanisms that accelerate and transport energetic particles',
      'Study the dust environment near the Sun',
      'Monitor space weather evolution through solar cycle',
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
      '19+ years operational at Mars (October 2025) - Third longest-lived Mars orbiter',
      'Captured over 6.9 million images of Mars surface in stunning detail',
      'Delivered over 473 terabits of data - more than all other Mars missions combined',
      'Discovered recurring slope lineae (possible seasonal water flows)',
      'Mapped mineral composition revealing ancient water activity',
      'Provided landing site analysis for Curiosity, InSight, and Perseverance',
      'Detected subsurface water ice across Mars',
      'Confirmed active avalanches on Martian polar ice caps',
      'Critical communications relay for Mars surface missions',
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
    description: 'NASA\'s mission to understand how Mars lost its atmosphere over billions of years. MAVEN studies the upper atmosphere of Mars and how it interacts with the solar wind, solving the mystery of Mars\' transformation from a warm, wet world to the cold, dry planet we see today. Operating for over 11 years (2025).',
    achievements: [
      '11+ years operational at Mars (2025)',
      'Discovered that Mars loses atmosphere 10 times faster during solar storms',
      'Confirmed that solar wind stripped away Mars\' atmosphere over billions of years',
      'First detection of metal ions in Mars\' upper atmosphere',
      'Discovered aurora activity across Mars\' entire planet',
      'Measured seasonal variations in atmospheric escape',
      'Detected unexpected dust clouds at high altitudes',
      'Provided crucial atmospheric data for InSight landing',
      'Extended mission multiple times due to exceptional performance',
      'Serves as backup communications relay for surface missions',
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
    description: 'NASA\'s longest-serving spacecraft at Mars and the backbone of Mars exploration. Named after Arthur C. Clarke\'s "2001: A Space Odyssey," this remarkable orbiter has been mapping Mars and relaying communications for over 24 years, far exceeding its planned 2-year mission. Currently the record holder for longest continually active spacecraft orbiting another planet.',
    achievements: [
      'Longest-serving spacecraft at Mars (24+ years operational as of 2025)',
      'Record holder for longest planetary orbit - surpassed Pioneer Venus and Mars Express',
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
      'Discovered most distant galaxy ever observed: MOM z14 (280 million years after Big Bang) - 2025',
      'Captured the deepest infrared images of the universe ever taken',
      'Performance exceeding expectations (2025)',
      'First direct spectroscopic analysis of exoplanet atmospheres in unprecedented detail',
      'Discovered water vapor in the atmosphere of rocky exoplanet K2-18 b',
      'Revealed stellar nurseries hidden behind cosmic dust clouds',
      'Observed galaxies from just 280 million years after the Big Bang',
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
  'new-horizons': {
    name: 'New Horizons',
    status: 'Extended Mission',
    type: 'Deep Space Probe',
    launchDate: 'January 19, 2006',
    location: 'Kuiper Belt (62.2 AU from Earth as of September 2025)',
    distance: '9.31 billion km from Earth',
    description: 'First mission to Pluto and continuing exploration of the Kuiper Belt. Extended through 2028-2029 when it exits the Kuiper Belt. Currently traveling at 14.1 km/s, heading deeper into space. Focused on heliophysics studies beginning FY2025.',
    achievements: [
      'First spacecraft to fly by Pluto (July 14, 2015)',
      'Flyby of Kuiper Belt object Arrokoth (2019)',
      'Detected extended Kuiper Belt dust regions (2025)',
      'Operating for 19+ years in deep space',
      'Currently 62.2 AU from Earth (September 2025)',
      'Discovered Pluto\'s complex geology and atmosphere',
      'Found evidence of subsurface ocean on Pluto',
      'Will exit Kuiper Belt in 2028-2029',
    ],
    objectives: [
      'Collect heliophysics data from outer solar system (primary focus FY2025+)',
      'Explore Kuiper Belt environment and dust distribution',
      'Study solar wind interactions at extreme distances',
      'Monitor interstellar boundary conditions',
      'Continue operations until Kuiper Belt exit (2028-2029)',
    ],
    instruments: [
      'LORRI: Long Range Reconnaissance Imager - high-resolution telescopic camera',
      'Ralph: Visible/infrared imaging spectrometer with color and composition mapping',
      'Alice: Ultraviolet imaging spectrometer for atmospheric studies',
      'REX: Radio Science Experiment using communications system',
      'SWAP: Solar Wind Around Pluto - plasma and energetic particle detector',
      'PEPSSI: Pluto Energetic Particle Spectrometer Science Investigation',
      'SDC: Student Dust Counter - detects dust particles',
    ],
  },
  'juno': {
    name: 'Juno',
    status: 'Extended Mission',
    type: 'Jupiter Orbiter',
    launchDate: 'August 5, 2011',
    landingDate: 'July 4, 2016 (Jupiter Orbit Insertion)',
    location: 'Jupiter Polar Orbit',
    distance: '588 million km from Earth (varies)',
    description: 'NASA\'s Jupiter orbiter studying the planet\'s interior structure, atmosphere, and magnetosphere from unique polar orbits. Extended through September 2025 to study Jupiter\'s rings and inner moons. Completed historic close flybys of Ganymede, Europa, and Io.',
    achievements: [
      'First spacecraft in polar orbit around Jupiter',
      'Completed close flyby of Ganymede (June 2021) - closest since Galileo',
      'Completed close flyby of Europa (September 2022) at 352 km',
      'Completed close flybys of Io (December 2023, February 2024)',
      'Discovered Jupiter has a "fuzzy" core, not solid',
      'Mapped Jupiter\'s gravitational and magnetic fields in detail',
      'Found massive cyclones at Jupiter\'s poles',
      'Completed 60+ orbits of Jupiter',
      'Extended mission through September 2025',
    ],
    objectives: [
      'Determine Jupiter\'s interior structure and composition',
      'Map gravitational and magnetic fields',
      'Study atmospheric dynamics and composition',
      'Investigate polar magnetosphere',
      'Search for evidence of water in atmosphere',
      'Study Jupiter\'s rings and inner moons (extended mission)',
    ],
    instruments: [
      'Gravity Science: Uses radio signals to map Jupiter\'s gravity field',
      'JunoCam: Color imager providing spectacular images of Jupiter',
      'JIRAM: Jovian Infrared Auroral Mapper for atmospheric studies',
      'MWR: Microwave Radiometer measuring atmospheric water and ammonia',
      'WAVES: Radio/Plasma Wave Investigation detecting radio and plasma waves',
      'MAG: Magnetometer mapping Jupiter\'s magnetic field',
      'JADE & JEDI: Particle detectors studying Jupiter\'s magnetosphere',
    ],
  },
  'europa-clipper': {
    name: 'Europa Clipper',
    status: 'En Route',
    type: 'Jupiter System Orbiter',
    launchDate: 'October 14, 2024',
    location: 'En Route to Jupiter (Expected Arrival: April 2030)',
    distance: '2+ AU from Earth (increasing)',
    description: 'NASA\'s largest planetary science spacecraft ever built, en route to study Jupiter\'s moon Europa and its subsurface ocean. Successfully completed Mars gravity assist on March 1, 2025. Will perform detailed reconnaissance to assess Europa\'s habitability with 49 planned Europa flybys.',
    achievements: [
      'Successfully launched on Falcon Heavy rocket (October 14, 2024)',
      'Completed Mars gravity assist maneuver (March 1, 2025)',
      'All instruments deploying nominally',
      'Largest planetary mission spacecraft by mass',
      'Advanced ice-penetrating radar system',
      'Solar-powered despite Jupiter\'s distance from Sun',
      'Earth gravity assist scheduled December 3, 2026',
    ],
    objectives: [
      'Characterize Europa\'s ice shell and subsurface ocean',
      'Determine ocean depth and salinity',
      'Study surface composition and geology',
      'Investigate potential plumes of water vapor',
      'Assess habitability potential',
      'Map Europa\'s magnetic field',
    ],
    instruments: [
      'REASON: Radar for Europa Assessment and Sounding - ice-penetrating radar',
      'EIS: Europa Imaging System - wide and narrow angle cameras',
      'E-THEMIS: Europa Thermal Emission Imaging System - infrared camera',
      'ECM: Europa Clipper Magnetometer - magnetic field measurements',
      'PIMS: Plasma Instrument for Magnetic Sounding - ion and electron detector',
      'SUDA: SUrface Dust Analyzer - mass spectrometer for plume particles',
    ],
  },
  'lucy': {
    name: 'Lucy',
    status: 'En Route',
    type: 'Asteroid Flyby Mission',
    launchDate: 'October 16, 2021',
    location: 'En Route to Trojan Asteroids',
    distance: '2.5+ AU from Earth (varies with orbit)',
    description: 'First mission to visit Jupiter\'s Trojan asteroids, ancient remnants from the formation of the solar system. Will visit 8 asteroids over 12 years. Already completed two successful asteroid encounters with targets Dinkinesh and Donaldjohanson.',
    achievements: [
      'Completed flyby of asteroid Dinkinesh (November 2023)',
      'Completed flyby of asteroid Donaldjohanson (April 20, 2025)',
      'Successfully launched and deployed solar arrays',
      'First mission dedicated to Trojan asteroids',
      'Discovered Dinkinesh has a small moon',
      '2 of 8 target asteroids visited',
      'First Jupiter Trojan target Eurybates arrival August 2027',
    ],
    objectives: [
      'Study composition and structure of Trojan asteroids',
      'Understand early solar system formation',
      'Compare different types of primitive bodies',
      'Investigate asteroid density and internal structure',
      'Search for moons around target asteroids',
    ],
    instruments: [
      'L\'LORRI: Lucy Long Range Reconnaissance Imager - high-resolution camera',
      'L\'TES: Lucy Thermal Emission Spectrometer - surface temperature and composition',
      'L\'Ralph: Color imaging and infrared spectroscopy',
      'OTES: OSIRIS-REx Thermal Emission Spectrometer - backup instrument',
      'High Gain Antenna: For precise radio science measurements',
    ],
  },
  'psyche': {
    name: 'Psyche',
    status: 'En Route',
    type: 'Asteroid Orbiter',
    launchDate: 'October 13, 2023',
    location: 'En Route to Asteroid Psyche (Expected Arrival: August 2029)',
    distance: '1.8+ AU from Earth (increasing)',
    description: 'First mission to a metallic asteroid, targeting 16 Psyche - believed to be the exposed core of a protoplanet. Overcame propulsion system issue in May 2025 and resumed full operations. Will study this unique metal-rich world to understand planetary formation. Mars flyby scheduled for May 2026.',
    achievements: [
      'Successfully launched on Falcon Heavy (October 13, 2023)',
      'Resolved propulsion system issue - resumed full operations (June 2025)',
      'First mission to study a metallic asteroid',
      'Deep Space Optical Communications operational',
      'Advanced ion propulsion system',
      'Mars gravity assist scheduled May 2026',
      'On course for August 2029 arrival at Psyche',
    ],
    objectives: [
      'Study metallic asteroid composition and structure',
      'Understand how planetary cores form',
      'Map Psyche\'s surface and interior',
      'Investigate magnetic field remnants',
      'Test new deep space communication technology',
    ],
    instruments: [
      'Multispectral Imager: Color imaging for surface mapping',
      'Gamma Ray and Neutron Spectrometer: Elemental composition analysis',
      'Magnetometer: Detecting ancient magnetic field signatures',
      'Radio Science Investigation: Gravity field mapping',
      'DSOC: Deep Space Optical Communications technology demonstration',
    ],
  },
  'osiris-apex': {
    name: 'OSIRIS-APEX',
    status: 'En Route',
    type: 'Asteroid Rendezvous Mission',
    launchDate: 'September 8, 2016 (as OSIRIS-REx)',
    location: 'En Route to Asteroid Apophis (Expected Arrival: April 2029)',
    distance: '1.2+ AU from Earth (varies)',
    description: 'Extended mission of OSIRIS-REx after successfully returning samples from asteroid Bennu. Now heading to asteroid Apophis to study changes during its close Earth approach in 2029. Successfully survived multiple close solar passes in 2025, coming 25 million miles closer to the Sun than designed.',
    achievements: [
      'Successfully collected samples from asteroid Bennu (2020)',
      'First U.S. asteroid sample return mission (September 2023)',
      'Survived multiple close solar approaches in 2025',
      'Completed close pass 25M miles closer to Sun than designed',
      'Extended mission approved to study Apophis',
      'Will observe Apophis during rare 2029 close Earth approach',
      'Pioneered Touch-And-Go sample collection technique',
    ],
    objectives: [
      'Study asteroid Apophis before, during, and after 2029 Earth flyby',
      'Investigate how close planetary encounters affect asteroids',
      'Map surface composition and structure changes',
      'Study Apophis rotation and shape evolution',
      'Understand tidal effects from Earth\'s gravity',
    ],
    instruments: [
      'OCAMS: OSIRIS-REx Camera Suite - navigation and science imaging',
      'OLA: OSIRIS-REx Laser Altimeter - surface topography mapping',
      'OVIRS: OSIRIS-REx Visible and Infrared Spectrometer',
      'OTES: OSIRIS-REx Thermal Emission Spectrometer',
      'REXIS: Regolith X-ray Imaging Spectrometer',
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
  const isJWST = id === 'james-webb-space-telescope';
  const isEnRoute = mission.status === 'En Route';

  // Missions without live data feeds (Extended missions in data collection mode or en route)
  const hasNoLiveData = isEnRoute || id === 'new-horizons' || id === 'juno';

  // Check if this mission has Horizons API support
  const hasHorizonsSupport = [
    'europa-clipper',
    'lucy',
    'psyche',
    'osiris-apex',
    'juno',
  ].includes(id);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Mission Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {mission.name}
          </h1>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
              mission.status === 'Active'
                ? 'bg-green-500/20 text-green-400'
                : mission.status === 'Extended Mission'
                ? 'bg-blue-500/20 text-blue-400'
                : mission.status === 'En Route'
                ? 'bg-orange-500/20 text-orange-400'
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

      {/* Hero Section - Mission Status Banner - Only for missions with live data */}
      {!hasNoLiveData && (
        <div className="mb-8">
          <MissionStatusIndicator missionId={id} className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-gray-700" />
        </div>
      )}

      {/* Featured Discovery Section - Only for missions with live data */}
      {!hasNoLiveData && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Latest Scientific Discovery
          </h2>
          <DiscoveryFeed missionId={id} maxItems={1} className="bg-gradient-to-br from-purple-900/20 via-gray-900 to-blue-900/20 border-purple-500/30" />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Primary Content - 3 columns */}
        <div className="xl:col-span-3">
          {/* Live Mission Data Grid - Only for missions with live data */}
          {!hasNoLiveData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 items-start">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">
                  Live Mission Data
                </h3>
                <MissionDataFeed missionId={id} />
              </div>

              {/* Communication Status for Deep Space */}
              {(id.includes('voyager') || id === 'parker-solar-probe') ? (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">
                    Deep Space Communication
                  </h3>
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400">Distance from Earth</p>
                      <p className="text-3xl font-mono font-bold text-purple-400">
                        {mission.distance || 'Calculating...'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Signal Travel Time</p>
                      <p className="text-xl font-mono text-blue-400">One-way: ~{id.includes('voyager-1') ? '23' : '18'} hours</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Mission Duration</p>
                      <p className="text-lg font-mono text-green-400">
                        {id.includes('voyager') ? '47+ years' : '6+ years'} operational
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">
                    Recent Discoveries
                  </h3>
                  <DiscoveryFeed missionId={id} maxItems={3} />
                </div>
              )}
            </div>
          )}

          {/* Mission Status - Show status for missions without live data feeds */}
          {hasNoLiveData && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                {isEnRoute ? 'Mission Journey Status' : 'Mission Status'}
              </h2>

              {/* Show static journey info for en route missions, no live data needed */}
              <div className={`rounded-lg p-6 ${
                isEnRoute
                  ? 'bg-gradient-to-r from-orange-900/20 via-gray-900 to-amber-900/20 border border-orange-500/30'
                  : 'bg-gradient-to-r from-blue-900/20 via-gray-900 to-purple-900/20 border border-blue-500/30'
              }`}>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Current Status</p>
                    <p className={`text-lg font-semibold ${isEnRoute ? 'text-orange-400' : 'text-blue-400'}`}>
                      {isEnRoute ? 'En Route to Destination' : 'Extended Mission - Data Collection Mode'}
                    </p>
                  </div>
                  {mission.distance && (
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Approximate Distance from Earth</p>
                      <p className="text-lg font-semibold text-blue-400">{mission.distance}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Mission Progress</p>
                    <p className="text-gray-300">
                      {isEnRoute
                        ? 'Spacecraft is currently in cruise phase, conducting system checks and navigating towards its target. Position data is tracked via NASA JPL Horizons System and updated periodically.'
                        : 'Spacecraft is in extended mission phase, continuing to collect valuable scientific data beyond its primary mission objectives.'
                      }
                    </p>
                  </div>
                  {hasHorizonsSupport && (
                    <div className="pt-2 border-t border-gray-700">
                      <p className="text-xs text-gray-500">
                        💫 Real-time position tracking available via NASA JPL Horizons System
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Photo Gallery for Rovers */}
          {isRover && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                Latest Photos from Mars Surface
              </h2>
              <RoverPhotoGallery rover={id as 'perseverance' | 'curiosity'} limit={12} />
            </div>
          )}

          {/* Photo Gallery for InSight */}
          {isInSight && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                Mission Images from Elysium Planitia
              </h2>
              <InSightPhotoGallery />
            </div>
          )}

          {/* Photo Gallery for James Webb Space Telescope */}
          {isJWST && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                Latest Deep Space Observatory Images
              </h2>
              <JWSTPhotoGallery limit={12} />
            </div>
          )}

          {/* Last Weather Data for InSight */}
          {isInSight && mission.lastData && (
            <div className="bg-gray-900 rounded-lg p-6 mb-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-4">
                Last Recorded Weather Data
              </h2>
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
            <div className="bg-gray-900 rounded-lg p-6 mb-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-4">
                Mission Achievements
              </h2>
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
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">
                Mission Timeline
              </h2>
              <MissionMilestones missionId={id} />
            </div>
          )}

          {/* Mission Objectives */}
          <div className="bg-gray-900 rounded-lg p-6 mb-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4">
              Mission Objectives
            </h2>
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

        {/* Secondary Sidebar - 1 column */}
        <div className="xl:col-span-1">
          {/* Instruments */}
          <div className="bg-gray-900 rounded-lg p-6 mb-6 border border-gray-700 sticky top-4">
            <h3 className="text-xl font-bold mb-4">
              Scientific Instruments
            </h3>
            <ul className="space-y-2 text-sm">
              {mission.instruments.map((instrument, index) => (
                <li key={index} className="text-gray-300 flex items-start">
                  <span className="text-blue-400 mr-2 mt-1">•</span>
                  <span>{instrument}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
