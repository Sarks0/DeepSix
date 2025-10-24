import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, withTimeout } from '@/lib/api/error-handler';

export const runtime = 'edge';

interface SBDBResponse {
  signature: {
    version: string;
    source: string;
  };
  object: {
    des: string;
    fullname?: string;
    orbit_class?: {
      name: string;
      code: string;
    };
    pha?: boolean;
    neo?: boolean;
  };
  orbit?: {
    elements: {
      e: string;    // Eccentricity
      a: string;    // Semi-major axis (AU)
      q: string;    // Perihelion distance (AU)
      i: string;    // Inclination (deg)
      om: string;   // Longitude of ascending node (deg)
      w: string;    // Argument of perihelion (deg)
      ma: string;   // Mean anomaly (deg)
      per: string;  // Orbital period (days)
    };
    epoch?: string;
  };
  phys_par?: {
    H?: string;           // Absolute magnitude
    diameter?: string;    // Diameter (km)
    extent?: string;      // Tri-axial dimensions
    albedo?: string;      // Geometric albedo
    rot_per?: string;     // Rotation period (hours)
    GM?: string;          // Standard gravitational parameter
    density?: string;     // Bulk density (g/cm^3)
    spec_B?: string;      // Spectral taxonomic type (SMASSII)
    spec_T?: string;      // Spectral taxonomic type (Tholen)
  };
}

/**
 * GET /api/asteroids/sbdb
 * Fetches detailed asteroid data from NASA Small-Body Database
 *
 * The SBDB contains comprehensive data on 1+ million asteroids and comets,
 * including orbital parameters, physical characteristics, and discovery info.
 *
 * Query parameters:
 * - sstr: Object designation or name (required)
 * - full-prec: Full precision output (optional, default false)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sstr = searchParams.get('sstr');

    if (!sstr) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing Parameter',
          message: 'The "sstr" parameter is required (object designation or name)',
        },
        { status: 400 }
      );
    }

    // Build SBDB API URL
    const sbdbUrl = `https://ssd-api.jpl.nasa.gov/sbdb.api?sstr=${encodeURIComponent(sstr)}&phys-par=true&close-appr=true&full-prec=false`;

    const fetchSBDBData = async (): Promise<SBDBResponse> => {
      const response = await fetch(sbdbUrl, {
        headers: {
          'User-Agent': 'DeepSix-Asteroid-Tracker',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SBDB API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data as SBDBResponse;
    };

    // Wrap in timeout (10 seconds)
    const sbdbData = await withTimeout(fetchSBDBData(), 10000);

    // Check if object was found
    if (!sbdbData.object) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: `No asteroid found with designation "${sstr}"`,
        },
        { status: 404 }
      );
    }

    // Extract and enrich data
    const object = sbdbData.object;
    const orbit = sbdbData.orbit;
    const physPar = sbdbData.phys_par;

    // Calculate derived values
    const absoluteMagnitude = physPar?.H ? parseFloat(physPar.H) : null;
    const diameter = physPar?.diameter ? parseFloat(physPar.diameter) : null;
    const albedo = physPar?.albedo ? parseFloat(physPar.albedo) : null;
    const rotationPeriod = physPar?.rot_per ? parseFloat(physPar.rot_per) : null;
    const density = physPar?.density ? parseFloat(physPar.density) : null;

    // Orbital elements
    const eccentricity = orbit?.elements.e ? parseFloat(orbit.elements.e) : null;
    const semiMajorAxis = orbit?.elements.a ? parseFloat(orbit.elements.a) : null;
    const inclination = orbit?.elements.i ? parseFloat(orbit.elements.i) : null;
    const orbitalPeriod = orbit?.elements.per ? parseFloat(orbit.elements.per) : null;

    // Classify asteroid type
    const spectralType = physPar?.spec_B || physPar?.spec_T || 'Unknown';
    const orbitClass = object.orbit_class?.name || 'Unknown';

    // Size category
    let sizeCategory = 'Unknown';
    if (diameter) {
      if (diameter < 0.1) sizeCategory = 'Very Small';
      else if (diameter < 1) sizeCategory = 'Small';
      else if (diameter < 10) sizeCategory = 'Medium';
      else if (diameter < 100) sizeCategory = 'Large';
      else sizeCategory = 'Very Large';
    } else if (absoluteMagnitude) {
      // Estimate size from absolute magnitude
      // H < 18 = Large (>1km), H 18-22 = Medium (140m-1km), H > 22 = Small (<140m)
      if (absoluteMagnitude < 18) sizeCategory = 'Large';
      else if (absoluteMagnitude < 22) sizeCategory = 'Medium';
      else sizeCategory = 'Small';
    }

    // Hazard assessment
    const isPHA = object.pha === true;
    const isNEO = object.neo === true;
    const hazardLevel = isPHA ? 'Potentially Hazardous' :
                       isNEO ? 'Near-Earth Object' :
                       'Non-hazardous';

    return NextResponse.json({
      success: true,
      dataSource: 'NASA JPL Small-Body Database',
      timestamp: new Date().toISOString(),
      asteroid: {
        // Identification
        designation: object.des,
        fullName: object.fullname || object.des,

        // Classification
        orbitClass,
        spectralType,
        isPHA,
        isNEO,
        hazardLevel,
        sizeCategory,

        // Physical properties
        physicalProperties: {
          absoluteMagnitude,
          diameter,
          diameterUnit: 'km',
          extent: physPar?.extent || null,
          albedo,
          rotationPeriod,
          rotationUnit: 'hours',
          density,
          densityUnit: 'g/cm³',
          mass: null, // Calculated if GM available
        },

        // Orbital elements
        orbitalElements: {
          eccentricity,
          semiMajorAxis,
          semiMajorAxisUnit: 'AU',
          perihelionDistance: orbit?.elements.q ? parseFloat(orbit.elements.q) : null,
          inclination,
          inclinationUnit: 'degrees',
          longitudeAscendingNode: orbit?.elements.om ? parseFloat(orbit.elements.om) : null,
          argumentPerihelion: orbit?.elements.w ? parseFloat(orbit.elements.w) : null,
          meanAnomaly: orbit?.elements.ma ? parseFloat(orbit.elements.ma) : null,
          orbitalPeriod,
          orbitalPeriodUnit: 'days',
          epoch: orbit?.epoch || null,
        },

        // Descriptions
        descriptions: {
          orbitDescription: getOrbitDescription(orbitClass),
          sizeDescription: getSizeDescription(sizeCategory, diameter),
          spectralDescription: getSpectralDescription(spectralType),
        },
      },
    });

  } catch (error) {
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('timed out')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Request Timeout',
            message: 'SBDB API request timed out. Please try again later.',
          },
          { status: 504 }
        );
      }

      if (error.message.includes('404') || error.message.includes('Not Found')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Not Found',
            message: 'Asteroid not found in database',
          },
          { status: 404 }
        );
      }
    }

    return handleApiError(error, 'SBDB API');
  }
}

// Helper functions for descriptions
function getOrbitDescription(orbitClass: string): string {
  const descriptions: Record<string, string> = {
    'Apollo': 'Earth-crossing orbit with semi-major axis greater than Earth\'s',
    'Aten': 'Earth-crossing orbit with semi-major axis less than Earth\'s',
    'Amor': 'Earth-approaching orbit from outside Earth\'s orbit',
    'Atira': 'Orbits entirely within Earth\'s orbit',
    'Main Belt': 'Located in the main asteroid belt between Mars and Jupiter',
    'Jupiter Trojan': 'Shares Jupiter\'s orbit at Lagrange points',
    'Centaur': 'Orbits between Jupiter and Neptune',
    'Trans-Neptunian Object': 'Orbits beyond Neptune',
  };

  return descriptions[orbitClass] || `Classified as ${orbitClass}`;
}

function getSizeDescription(category: string, diameter: number | null): string {
  if (diameter) {
    if (diameter < 0.001) return `Extremely small, about ${(diameter * 1000).toFixed(1)} meters across`;
    if (diameter < 0.1) return `Very small asteroid, ${(diameter * 1000).toFixed(0)} meters in diameter`;
    if (diameter < 1) return `Small asteroid, ${(diameter * 1000).toFixed(0)} meters across`;
    if (diameter < 10) return `Medium-sized asteroid, ${diameter.toFixed(1)} km in diameter`;
    if (diameter < 100) return `Large asteroid, ${diameter.toFixed(1)} km across`;
    return `Very large asteroid, ${diameter.toFixed(0)} km in diameter`;
  }

  return category === 'Unknown' ? 'Size not well constrained' : `Estimated ${category.toLowerCase()} size`;
}

function getSpectralDescription(spectralType: string): string {
  const descriptions: Record<string, string> = {
    'C': 'Carbonaceous - dark surface, primitive composition',
    'S': 'Silicaceous - stony, composed of silicate minerals and metals',
    'M': 'Metallic - high metal content, possibly iron-nickel',
    'X': 'Unknown composition - moderate albedo',
    'E': 'Enstatite - rare, composed mostly of enstatite',
    'V': 'Vestoid - basaltic surface, likely from asteroid Vesta',
    'A': 'Almost pure olivine',
    'Q': 'Ordinary chondrite-like composition',
    'R': 'Olivine and pyroxene rich',
    'D': 'Low albedo, organic-rich',
    'T': 'Moderate reddish spectra',
  };

  const firstLetter = spectralType.charAt(0).toUpperCase();
  return descriptions[firstLetter] || `Spectral type ${spectralType}`;
}
