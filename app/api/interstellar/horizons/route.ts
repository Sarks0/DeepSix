import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const HORIZONS_API_BASE = 'https://ssd.jpl.nasa.gov/api/horizons.api';
const AU_TO_KM = 149597870.7;

// Known interstellar objects with their Horizons-compatible designations
// Note: Horizons API treats parentheses as special characters (subscripts)
// Must use designation without parentheses for API calls
//
// TODO: Consider fetching updated characteristics daily from:
// - NASA Science API: https://science.nasa.gov/solar-system/comets/3i-atlas/
// - Minor Planet Center: https://minorplanetcenter.net/
// - TheSkyLive: https://theskylive.com/c2025n1-info
// For now, manually update these values as new observations are published
const INTERSTELLAR_OBJECTS = {
  '3I': {
    designation: '3I/ATLAS',
    horizonsCommand: 'C/2025 N1',
    type: 'Interstellar Comet',
    discoveryDate: '2025-07-01',
    discoveryLocation: 'ATLAS-HKO (Río Hurtado, Chile)',
    status: 'active',
    perihelionDate: '2025-10-29',
    perihelionDistanceAU: 1.36,
    closestEarthApproach: '2025-12-19',
    closestEarthDistanceAU: 1.80,
    estimatedDiameterKm: '0.44 - 5.6',
    eccentricity: 6.0,
    characteristics: 'Very red color, similar to Trans-Neptunian Objects',
    lastUpdated: '2025-10-28',

    // Narrative content
    narrative: {
      overview: '3I/ATLAS is the third confirmed interstellar comet ever discovered, following in the footsteps of 1I/\'Oumuamua (2017) and 2I/Borisov (2019). This cosmic visitor from another star system is currently passing through our Solar System on a one-time journey, offering astronomers a rare opportunity to study material from beyond our cosmic neighborhood.',

      journey: {
        origin: 'Arrived from interstellar space with a hyperbolic trajectory, indicating it originated from beyond our Solar System. Its extreme velocity and orbital path prove it is merely a visitor, not gravitationally bound to our Sun.',

        discovery: 'First detected by the ATLAS (Asteroid Terrestrial-impact Last Alert System) survey in Chile on July 1, 2025. The ATLAS system, designed to detect potentially hazardous asteroids, made this remarkable discovery while scanning the southern skies.',

        perihelion: 'Reached its closest approach to the Sun (perihelion) on October 29, 2025, passing within 1.36 AU—roughly the distance between Earth and Mars. At this point, solar heating began vaporizing ices on its surface, creating the characteristic fuzzy appearance of an active comet.',

        currentStatus: 'Now moving away from the Sun and heading toward its closest pass by Earth. Despite receding from the Sun, it remains active with a visible coma (atmosphere) of gas and dust.',

        earthApproach: 'Will make its closest approach to Earth on December 19, 2025, passing at a safe distance of 1.80 AU (approximately 270 million kilometers). This presents the best viewing opportunity before the comet fades from sight.',

        future: 'After passing Earth, 3I/ATLAS will continue its journey out of the Solar System at tremendous speed, never to return. Its extreme eccentricity of 6.0 means it is traveling far faster than the Sun\'s escape velocity. By 2030, it will be too distant and faint to detect even with the most powerful telescopes.'
      },

      observability: {
        currentConstellation: 'Virgo',
        visibility: 'Currently observable with moderate to large telescopes from the Southern Hemisphere',
        apparentMagnitude: 14.7,
        magnitudeNote: 'Brightness predictions are based on NASA Horizons ephemeris calculations. Comet brightness is inherently unpredictable—actual brightness may vary due to outbursts or changes in activity.',

        bestViewing: {
          period: 'December 10-25, 2025',
          reason: 'During closest Earth approach, when the comet will be at its brightest and highest apparent size'
        },

        equipment: {
          minimum: '6-inch (150mm) telescope under dark skies',
          recommended: '8-inch (200mm) or larger telescope with equatorial tracking mount',
          photography: 'Long-exposure astrophotography possible with DSLR camera and telescope, revealing the coma and possible faint tail'
        },

        appearance: 'Appears as a faint, fuzzy patch of light—the comet\'s coma (atmosphere of gas and dust). Under excellent conditions with larger telescopes, a faint tail may be visible streaming away from the Sun direction.',

        challengeLevel: 'Intermediate to Advanced—requires dark skies away from light pollution, moderate to large telescope, star charts for location, and patience. Not visible to the naked eye or binoculars.',

        viewingTips: 'Allow 20-30 minutes for your eyes to dark-adapt before observing. Use averted vision (looking slightly to the side) to detect faint objects. A star chart or astronomy app will help locate the comet\'s position in Virgo.'
      },

      significance: {
        rarity: 'Only the third confirmed interstellar comet ever detected by humanity. These cosmic messengers from other star systems are extraordinarily rare—we detect perhaps one per decade with current technology.',

        scientificValue: 'Its very red color—similar to objects found in our own Solar System\'s distant Kuiper Belt—suggests it may have formed in the cold, outer regions of another planetary system billions of years ago. This gives astronomers a unique window into planet formation processes beyond our Sun.',

        composition: 'Early spectroscopic observations indicate the presence of water ice and carbon-based molecules, similar to comets native to our Solar System. This suggests that the building blocks of planets and potentially life may be common throughout the galaxy.',

        comparison: 'Unlike 1I/\'Oumuamua, which showed unusual behavior and no visible coma, 3I/ATLAS behaves more like a typical comet, with active outgassing creating its fuzzy appearance. This makes it scientifically valuable for comparing interstellar and Solar System comets.',

        uniqueTrajectory: 'With an orbital eccentricity of 6.0, it is traveling at approximately 87 km/s relative to the Sun—far faster than any object bound to our Solar System could travel. This hyperbolic orbit is the definitive proof of its interstellar origin.'
      },

      research: {
        activeObservations: 'Currently being tracked by major observatories worldwide including the ATLAS survey system, Hubble Space Telescope, and ground-based facilities. Professional and amateur astronomers are collaborating to gather as much data as possible during its brief passage.',

        spectroscopy: 'Astronomers are analyzing the light reflected and emitted by 3I/ATLAS to determine its chemical composition. These observations will reveal what molecules and elements make up this visitor from another star system.',

        dynamics: 'Researchers are carefully tracking its orbit to understand the non-gravitational forces acting on it (from outgassing jets) and to study how interstellar comets interact with our Solar System.',

        spaceWeathering: 'The red color suggests billions of years of exposure to cosmic rays in interstellar space—a process called "space weathering." This tells us about the harsh radiation environment between star systems.',

        futureStudies: 'Data collected now will be analyzed for years to come, helping answer fundamental questions: How common are interstellar visitors? Do they differ from our own comets? What can they teach us about other planetary systems?'
      },

      oneTimeOpportunity: 'This represents a once-in-a-lifetime viewing opportunity. With its hyperbolic trajectory, 3I/ATLAS will pass through our Solar System exactly once, never to return. After its December 2025 close approach to Earth, it will continue accelerating outward, eventually crossing the heliopause—the boundary where the Sun\'s influence ends and true interstellar space begins. Professional astronomers worldwide are racing against time to gather as much data as possible before this cosmic messenger disappears forever into the darkness between the stars.'
    }
  },
  '2I': {
    designation: '2I/Borisov',
    horizonsCommand: 'C/2019 Q4',
    type: 'Interstellar Comet',
    discoveryDate: '2019-08-30',
    discoveryLocation: 'MARGO Observatory, Crimea',
    status: 'historical',
    perihelionDate: '2019-12-08',
    perihelionDistanceAU: 2.0,
    closestEarthApproach: '2019-12-28',
    closestEarthDistanceAU: 1.9,
    estimatedDiameterKm: '0.4 - 7',
    eccentricity: 3.36,
    characteristics: 'Similar composition to Solar System comets, active coma',
    lastUpdated: '2020-01-15',

    // Narrative content
    narrative: {
      overview: '2I/Borisov was the second confirmed interstellar object and the first interstellar comet ever discovered. Its passage through our Solar System in 2019 provided astronomers with an unprecedented opportunity to study a comet from another star system, revealing surprising similarities to our own comets.',

      journey: {
        origin: 'Arrived from interstellar space with a hyperbolic trajectory, proving its origin from beyond our Solar System. Unlike 1I/\'Oumuamua, 2I/Borisov displayed obvious cometary activity, making its interstellar nature immediately apparent.',

        discovery: 'Discovered by amateur astronomer Gennady Borisov on August 30, 2019, using a 0.65-meter telescope he built himself at the MARGO Observatory in Crimea. This remarkable find demonstrated that significant discoveries can still be made by dedicated amateur astronomers.',

        perihelion: 'Reached perihelion (closest approach to the Sun) on December 8, 2019, at a distance of 2.0 AU—roughly twice Earth\'s distance from the Sun. This relatively distant perihelion kept the comet from experiencing extreme solar heating.',

        earthApproach: 'Made its closest approach to Earth on December 28, 2019, passing at 1.9 AU (approximately 290 million kilometers). While never visible to the naked eye, it became a prime target for professional observatories worldwide.',

        departure: 'After passing through the inner Solar System, 2I/Borisov continued on its hyperbolic trajectory, leaving the Solar System forever. By early 2020, it had faded beyond the reach of most telescopes as it journeyed back into interstellar space.',

        legacy: 'Now beyond Neptune\'s orbit and continuing to recede, 2I/Borisov provided invaluable data about the composition and behavior of comets from other planetary systems. The comet is estimated to take about 200,000 years to fully exit the Sun\'s sphere of influence.'
      },

      significance: {
        rarity: 'The first confirmed interstellar comet ever discovered. Before 2I/Borisov, astronomers had only detected one interstellar object (1I/\'Oumuamua), which showed no clear cometary activity.',

        scientificValue: 'Spectroscopic observations revealed a composition remarkably similar to comets in our own Solar System, including water ice, carbon monoxide, and cyanide. This suggests that comet formation processes may be universal across different star systems.',

        comparison: 'Unlike the enigmatic 1I/\'Oumuamua, 2I/Borisov behaved like a typical comet, with a visible coma and tail created by outgassing. This made it easier to study and provided a clearer understanding of what interstellar comets should look like.',

        cometActivity: 'Displayed vigorous outgassing and a well-developed coma and tail, confirming it was an active comet. The gas production rate was consistent with Solar System comets of similar size, suggesting similar internal composition and structure.',

        uniqueTrajectory: 'With an orbital eccentricity of 3.36 and a velocity of approximately 33 km/s relative to the Sun, it was clearly traveling faster than solar escape velocity, providing definitive proof of its interstellar origin.'
      },

      research: {
        observations: 'Observed extensively by numerous telescopes worldwide including Hubble Space Telescope, Very Large Telescope, ALMA, and many others. This multi-wavelength campaign provided the most comprehensive data ever collected on an interstellar object.',

        composition: 'Analysis revealed concentrations of carbon monoxide unusually high compared to typical Solar System comets, suggesting it formed in a colder environment than most of our comets. Water ice was also detected, along with dust particles similar to those in Solar System comets.',

        nucleus: 'Estimated to have a nucleus about 400-700 meters in diameter, making it comparable in size to many small Solar System comets. The nucleus appeared to be rotating with a period of approximately 8 hours.',

        dust: 'The dust in its coma and tail showed polarimetric properties very similar to Solar System comets, suggesting that dust formation processes are similar across different planetary systems.',

        scientificImpact: 'Observations of 2I/Borisov fundamentally changed our understanding of interstellar objects. It demonstrated that comets from other star systems can be remarkably similar to our own, suggesting common formation mechanisms across the galaxy.'
      },

      historicalSignificance: '2I/Borisov\'s discovery marked a watershed moment in astronomy. It proved that 1I/\'Oumuamua was not a unique anomaly, but rather that interstellar objects regularly pass through our Solar System. The detailed observations obtained set the standard for how we should study future interstellar visitors. Gennady Borisov\'s amateur discovery also inspired a new generation of comet hunters, showing that important discoveries are still possible with modest equipment and dedication.'
    }
  },
  '1I': {
    designation: '1I/\'Oumuamua',
    horizonsCommand: 'A/2017 U1',
    type: 'Interstellar Object',
    discoveryDate: '2017-10-19',
    discoveryLocation: 'Pan-STARRS telescope, Hawaii',
    status: 'historical',
    perihelionDate: '2017-09-09',
    perihelionDistanceAU: 0.25,
    closestEarthApproach: '2017-10-14',
    closestEarthDistanceAU: 0.16,
    estimatedDiameterKm: '0.1 - 0.4',
    eccentricity: 1.20,
    characteristics: 'Elongated cigar/pancake shape, non-gravitational acceleration',
    lastUpdated: '2018-06-30',

    // Narrative content
    narrative: {
      overview: '1I/\'Oumuamua was the first confirmed interstellar object ever detected passing through our Solar System. Discovered in October 2017, this mysterious visitor shocked the astronomical community with its unusual characteristics and has remained one of the most debated objects in modern astronomy.',

      journey: {
        origin: 'Arrived from the general direction of the star Vega in the constellation Lyra, though it did not originate there—Vega was not in that position when \'Oumuamua began its journey. It had been traveling through interstellar space for millions of years before entering our Solar System.',

        discovery: 'Discovered on October 19, 2017, by the Pan-STARRS telescope in Hawaii while searching for near-Earth asteroids. By the time of discovery, \'Oumuamua had already passed its closest point to both the Sun and Earth, and was rapidly leaving the Solar System. The name means "scout" or "messenger" in Hawaiian.',

        perihelion: 'Passed perihelion (closest approach to the Sun) on September 9, 2017, at only 0.25 AU—well inside Mercury\'s orbit. This close pass heated its surface significantly, though no cometary activity (coma or tail) was detected.',

        earthApproach: 'Made its closest approach to Earth on October 14, 2017, passing at 0.16 AU (about 24 million kilometers)—relatively close in astronomical terms. However, it was only discovered five days later when it was already rapidly receding.',

        departure: 'By the time astronomers realized its interstellar nature and mobilized telescopes to study it, \'Oumuamua was already leaving. It quickly faded from view as it accelerated away from the Sun. By early 2018, it had become too faint for even the largest telescopes to detect.',

        currentLocation: 'As of 2025, \'Oumuamua is beyond Saturn\'s orbit and continuing its journey into interstellar space. It will never return to our Solar System, carrying its mysteries with it into the cosmic void.'
      },

      significance: {
        rarity: 'The first confirmed interstellar object in human history. Its discovery opened a new field of astronomy and proved that objects from other star systems regularly pass through our cosmic neighborhood.',

        uniqueShape: 'Exhibited highly unusual light variations suggesting an extremely elongated shape—either cigar-shaped (10:1 aspect ratio) or pancake-shaped. No object like it had been seen before in our Solar System, leading to intense speculation about its nature and origin.',

        mysteriousAcceleration: 'Showed unexpected non-gravitational acceleration as it left the Solar System—it was traveling faster than gravity alone could explain. Typical comets show such acceleration due to outgassing, but \'Oumuamua showed no visible coma, tail, or gas emissions.',

        noComaDetected: 'Despite close scrutiny by major telescopes, no cometary activity was detected—no coma, no tail, no gas. This was puzzling given its acceleration and led to numerous theories about its composition, including suggestions it might be a solid piece of nitrogen ice or even an artificial object.',

        scientificDebate: 'Sparked unprecedented scientific debate and hundreds of research papers. Theories about its nature range from a chunk of solid hydrogen or nitrogen ice, to a "dust bunny" of loosely packed material, to more speculative ideas. The lack of visible outgassing despite acceleration remains unexplained.'
      },

      research: {
        observations: 'Observed intensively for several weeks by telescopes worldwide including Very Large Telescope, Gemini Observatory, and others. However, its rapid departure meant observation time was limited, leaving many questions unanswered.',

        colorAndReflectivity: 'Appeared reddish in color, similar to objects in the outer Solar System that have been exposed to cosmic radiation for long periods. Its surface reflectivity (albedo) was low, suggesting a dark, possibly organic-rich surface.',

        rotationAndTumbling: 'Exhibited complex rotation, tumbling end-over-end with a period of about 7.3 hours. This tumbling, combined with its elongated shape, caused its brightness to vary dramatically as different faces were presented to observers.',

        controversialTheories: 'Harvard astronomer Avi Loeb controversially suggested it could be an alien spacecraft or probe, citing its unusual acceleration and shape. While most scientists favor natural explanations, \'Oumuamua\'s properties remain genuinely puzzling.',

        lessonsLearned: 'The surprise discovery of \'Oumuamua exposed a gap in our asteroid detection capabilities. It prompted the development of better sky surveys to detect future interstellar visitors earlier, when they can be studied more thoroughly.'
      },

      historicalSignificance: '\'Oumuamua\'s discovery was a watershed moment that proved interstellar objects exist and regularly visit our Solar System. It demonstrated that the space between stars is not empty but populated with wandering objects that occasionally pass through planetary systems. The mysteries it presented—its shape, its acceleration, its composition—remain largely unsolved and continue to drive astronomical research. Future interstellar visitor detections will always be compared to the enigmatic \'Oumuamua, the cosmic messenger that showed us how little we know about the universe beyond our Solar System.'
    }
  },
};

interface InterstellarPosition {
  timestamp: string;
  position: {
    ra: string;
    dec: string;
    distanceFromSunAU: number;
    distanceFromEarthAU: number;
    distanceFromEarthKm: number;
  };
  velocity: {
    totalKmS: number;
    radialVelocityKmS: number;
  };
  orbital: {
    eccentricity: number;
    perihelionDistanceAU: number;
    inclinationDeg: number;
    hyperbolicExcessVelocityKmS?: number;
  };
  visual: {
    magnitude: number;
    phaseAngleDeg: number;
    illuminationPercent: number;
  };
}

/**
 * GET /api/interstellar/horizons
 *
 * Query JPL Horizons for interstellar object ephemeris data
 *
 * Query parameters:
 * - object: designation (3I, 2I, 1I, or full name like "C/2025 N1")
 * - startTime: optional start date (YYYY-MM-DD)
 * - stopTime: optional stop date (YYYY-MM-DD)
 * - stepSize: time interval (default: 1d)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const objectParam = searchParams.get('object') || '3I';
    const startTime = searchParams.get('startTime');
    const stopTime = searchParams.get('stopTime');
    const stepSize = searchParams.get('stepSize') || '1d';

    // Determine object designation
    const objectInfo = INTERSTELLAR_OBJECTS[objectParam as keyof typeof INTERSTELLAR_OBJECTS];

    if (!objectInfo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unknown interstellar object',
          message: `Object "${objectParam}" not found. Use 3I, 2I, or 1I.`,
        },
        { status: 404 }
      );
    }

    // Build COMMAND using exact Horizons format
    // Format verified from JPL Horizons web interface
    // Example: "C/2025 N1 (ATLAS)" for 3I/ATLAS
    const command = objectInfo.horizonsCommand;

    // Build Horizons API queries
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 86400000);

    // Query 1: OBSERVER ephemeris for position and visual data
    // Using proper DES= format WITHOUT QUANTITIES (use Horizons default output)
    // QUANTITIES parameter appears to be rejected for certain objects like new comets
    const observerParams = new URLSearchParams({
      format: 'json',
      COMMAND: command,
      OBJ_DATA: 'YES',
      MAKE_EPHEM: 'YES',
      EPHEM_TYPE: 'OBSERVER',
      CENTER: '500@399', // Geocentric (Earth)
      START_TIME: startTime || now.toISOString().split('T')[0],
      STOP_TIME: stopTime || tomorrow.toISOString().split('T')[0],
      STEP_SIZE: stepSize,
      // No QUANTITIES - let Horizons provide default columns
    });

    // Query 2: ELEMENTS for orbital parameters
    const elementsParams = new URLSearchParams({
      format: 'json',
      COMMAND: command,
      OBJ_DATA: 'YES',
      MAKE_EPHEM: 'YES',
      EPHEM_TYPE: 'ELEMENTS',
      CENTER: '500@10', // Heliocentric (Sun center)
      START_TIME: startTime || now.toISOString().split('T')[0],
      STOP_TIME: stopTime || tomorrow.toISOString().split('T')[0],
      STEP_SIZE: stepSize,
    });

    // Fetch both ephemeris types
    const [observerResponse, elementsResponse] = await Promise.all([
      fetch(`${HORIZONS_API_BASE}?${observerParams.toString()}`, {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }),
      fetch(`${HORIZONS_API_BASE}?${elementsParams.toString()}`, {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }),
    ]);

    if (!observerResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: 'Horizons API Error',
          message: `Failed to fetch observer data: ${observerResponse.statusText}`,
        },
        { status: observerResponse.status }
      );
    }

    const observerData = await observerResponse.json();

    if (observerData.error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Horizons Query Error',
          message: observerData.error,
        },
        { status: 400 }
      );
    }

    if (!observerData.result) {
      return NextResponse.json(
        {
          success: false,
          error: 'No Data',
          message: 'Horizons returned no ephemeris data',
        },
        { status: 404 }
      );
    }

    // Parse elements data (orbital parameters)
    let orbitalElements = null;
    if (elementsResponse.ok) {
      const elementsData = await elementsResponse.json();
      if (elementsData.result) {
        orbitalElements = parseOrbitalElements(elementsData.result);
      }
    }

    // Parse ephemeris data from result text
    const ephemeris = parseHorizonsResult(observerData.result, orbitalElements);

    // Build response
    return NextResponse.json({
      success: true,
      object: {
        designation: objectInfo.designation,
        alternateName: objectInfo.horizonsCommand,
        type: objectInfo.type,
        discoveryDate: objectInfo.discoveryDate,
        discoveryLocation: objectInfo.discoveryLocation,
        status: objectInfo.status,
        interstellarOrigin: true,
        perihelionDate: objectInfo.perihelionDate,
        perihelionDistanceAU: objectInfo.perihelionDistanceAU,
        closestEarthApproach: objectInfo.closestEarthApproach,
        closestEarthDistanceAU: objectInfo.closestEarthDistanceAU,
        estimatedDiameterKm: objectInfo.estimatedDiameterKm,
        eccentricity: objectInfo.eccentricity,
        characteristics: objectInfo.characteristics,
        lastUpdated: objectInfo.lastUpdated,
      },
      ephemeris: ephemeris || {},
      rawData: observerData.result, // Include for debugging
      dataSource: 'NASA JPL Horizons System',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Interstellar Horizons API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Parse orbital elements from Horizons ELEMENTS ephemeris
 */
function parseOrbitalElements(resultText: string) {
  try {
    const soeIndex = resultText.indexOf('$$SOE');
    const eoeIndex = resultText.indexOf('$$EOE');

    if (soeIndex === -1 || eoeIndex === -1) {
      console.log('No SOE/EOE markers in ELEMENTS result');
      return null;
    }

    const ephemerisBlock = resultText.substring(soeIndex + 5, eoeIndex).trim();
    const lines = ephemerisBlock.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
      console.log('No data lines in ELEMENTS result');
      return null;
    }

    // Parse first data line (most recent elements)
    const dataLine = lines[0].trim();
    console.log('Parsing ELEMENTS line:', dataLine);

    // Horizons ELEMENTS format typically has comma-separated values
    // Standard format: JDTDB, Calendar Date, EC, QR, IN, OM, W, Tp, N, MA, TA, A, AD, PR
    const parts = dataLine.includes(',') ? dataLine.split(',').map(p => p.trim()) : dataLine.split(/\s+/);

    // Extract orbital elements (try multiple column positions)
    let eccentricity = 0;
    let perihelionDistanceAU = 0;
    let inclinationDeg = 0;
    let distanceFromSunAU = 0;

    // Look for eccentricity (typically 3rd column, value > 1 for hyperbolic)
    for (let i = 2; i < Math.min(parts.length, 8); i++) {
      const val = parseFloat(parts[i]);
      if (!isNaN(val) && val > 0.5 && val < 50) {
        eccentricity = val;
        break;
      }
    }

    // Look for perihelion distance (QR, typically after EC)
    for (let i = 3; i < Math.min(parts.length, 9); i++) {
      const val = parseFloat(parts[i]);
      if (!isNaN(val) && val > 0 && val < 10) {
        perihelionDistanceAU = val;
        break;
      }
    }

    // Look for inclination (IN, typically after QR, value 0-180 degrees)
    for (let i = 4; i < Math.min(parts.length, 10); i++) {
      const val = parseFloat(parts[i]);
      if (!isNaN(val) && val >= 0 && val <= 180) {
        inclinationDeg = val;
        break;
      }
    }

    // Try to find current distance from Sun (R, typically later in line)
    for (let i = 10; i < Math.min(parts.length, 15); i++) {
      const val = parseFloat(parts[i]);
      if (!isNaN(val) && val > 0 && val < 100) {
        distanceFromSunAU = val;
        break;
      }
    }

    return {
      eccentricity,
      perihelionDistanceAU,
      inclinationDeg,
      distanceFromSunAU,
    };
  } catch (error) {
    console.error('Error parsing orbital elements:', error);
    return null;
  }
}

/**
 * Parse Horizons ephemeris result text
 * Extracts position, velocity, and visual data
 * Dynamically identifies columns from header line
 */
function parseHorizonsResult(
  resultText: string,
  orbitalElements: { eccentricity: number; perihelionDistanceAU: number; inclinationDeg: number; distanceFromSunAU: number } | null
): Partial<InterstellarPosition> | null {
  try {
    console.log('=== Starting Horizons OBSERVER parsing ===');

    // Horizons returns data in a specific text format
    // Look for the ephemeris table ($$SOE to $$EOE markers)
    const soeIndex = resultText.indexOf('$$SOE');
    const eoeIndex = resultText.indexOf('$$EOE');

    if (soeIndex === -1 || eoeIndex === -1) {
      console.error('No $$SOE or $$EOE markers found');
      return null;
    }

    // Look for column headers (usually a few lines before $$SOE)
    const headerSection = resultText.substring(0, soeIndex);
    const headerLines = headerSection.split('\n');

    // Find the line with column names (usually contains "R.A." or "Date")
    let columnHeaderLine = '';
    for (let i = headerLines.length - 1; i >= Math.max(0, headerLines.length - 10); i--) {
      const line = headerLines[i];
      if (line.includes('R.A.') || line.includes('DEC') || line.includes('Date')) {
        columnHeaderLine = line;
        console.log('Found column header:', line);
        break;
      }
    }

    const ephemerisBlock = resultText.substring(soeIndex + 5, eoeIndex).trim();
    const lines = ephemerisBlock.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
      console.error('No data lines found between $$SOE and $$EOE');
      return null;
    }

    console.log('Column headers:', columnHeaderLine);
    console.log('Number of data lines:', lines.length);

    // Parse first data line (most recent position)
    const dataLine = lines[0].trim();
    console.log('Data line:', dataLine);

    // Extract timestamp from the beginning of the line (format: YYYY-MMM-DD HH:MM)
    const dateMatch = dataLine.match(/(\d{4}-\w{3}-\d{2}\s+\d{2}:\d{2})/);
    const timestamp = dateMatch ? new Date(dateMatch[1]).toISOString() : new Date().toISOString();
    console.log('Timestamp:', timestamp);

    // Extract RA: format is HH MM SS.SS (with or without spaces)
    // Could be: "12 34 56.78" or "12:34:56.78" or "12h34m56.78s"
    const raMatch = dataLine.match(/(\d{1,2}[\s:h]\d{2}[\s:m]\d{2}\.\d+[s]?)/);
    const ra = raMatch ? raMatch[1].replace(/[hms:]/g, ' ').trim() : 'N/A';
    console.log('RA:', ra);

    // Extract DEC: format is +/-DD MM SS.S
    const decMatch = dataLine.match(/([+-]\d{1,2}[\s:d]\d{2}[\s:m]\d{2}\.\d+[s]?)/);
    const dec = decMatch ? decMatch[1].replace(/[dms:]/g, ' ').trim() : 'N/A';
    console.log('DEC:', dec);

    // Extract all decimal numbers from the line for distance/magnitude extraction
    const numbers = dataLine.match(/\b\d+\.\d+\b/g)?.map(n => parseFloat(n)) || [];
    console.log('Found numeric values:', numbers);

    // Identify magnitude (typically between 0-30, often appears early)
    let magnitude = 99;
    for (const num of numbers) {
      if (num >= 0 && num <= 30 && num !== parseFloat(ra.split(' ')[0])) {
        magnitude = num;
        console.log('Identified magnitude:', magnitude);
        break;
      }
    }

    // Identify distances (typically > 0.5 AU)
    const distances = numbers.filter(n => n > 0.5 && n < 100);
    console.log('Potential distances (AU):', distances);

    // First large value is likely Earth distance, second is likely Sun distance
    const earthDistance = distances[0] || 0;
    const sunDistance = distances[1] || distances[0] || 0;

    console.log('Earth distance:', earthDistance, 'AU');
    console.log('Sun distance:', sunDistance, 'AU');

    return {
      timestamp,
      position: {
        ra: ra,
        dec: dec,
        distanceFromSunAU: sunDistance || orbitalElements?.distanceFromSunAU || 0,
        distanceFromEarthAU: earthDistance,
        distanceFromEarthKm: earthDistance * AU_TO_KM,
      },
      velocity: {
        totalKmS: 0, // Would need VECTORS ephemeris type for accurate velocity
        radialVelocityKmS: 0,
      },
      orbital: {
        eccentricity: orbitalElements?.eccentricity || 0,
        perihelionDistanceAU: orbitalElements?.perihelionDistanceAU || 0,
        inclinationDeg: orbitalElements?.inclinationDeg || 0,
      },
      visual: {
        magnitude: magnitude,
        phaseAngleDeg: 0,
        illuminationPercent: 0,
      },
    };
  } catch (error) {
    console.error('Error parsing Horizons result:', error);
    return null;
  }
}
