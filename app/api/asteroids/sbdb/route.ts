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
    elements: Array<{
      name: string;
      value: string;
      sigma?: string;
      title?: string;
      units?: string | null;
      label?: string;
    }>;
    epoch?: string;
    first_obs?: string;
    last_obs?: string;
    data_arc?: string;
    condition_code?: string;
    moid?: string;
  };
  phys_par?: Array<{
    name: string;
    value: string;
    sigma?: string | null;
    units?: string | null;
    title?: string;
    desc?: string;
    ref?: string;
    notes?: string | null;
  }>;
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
    // Note: close-appr is not a valid parameter for SBDB API
    const sbdbUrl = `https://ssd-api.jpl.nasa.gov/sbdb.api?sstr=${encodeURIComponent(sstr)}&phys-par=true&full-prec=false`;

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

    // Helper function to get value from phys_par array
    const getPhysParam = (name: string): number | null => {
      const param = physPar?.find(p => p.name === name);
      return param?.value ? parseFloat(param.value) : null;
    };

    // Calculate derived values from phys_par array
    const absoluteMagnitude = getPhysParam('H');
    const diameter = getPhysParam('diameter');
    const albedo = getPhysParam('albedo');
    const rotationPeriod = getPhysParam('rot_per');
    const density = getPhysParam('density');

    // Helper function to get orbital element value
    const getOrbitalElement = (name: string): number | null => {
      const element = orbit?.elements?.find(e => e.name === name);
      return element?.value ? parseFloat(element.value) : null;
    };

    // Orbital elements
    const eccentricity = getOrbitalElement('e');
    const semiMajorAxis = getOrbitalElement('a');
    const inclination = getOrbitalElement('i');
    const orbitalPeriod = getOrbitalElement('per');
    const perihelionDistance = getOrbitalElement('q');
    const longitudeAscendingNode = getOrbitalElement('om');
    const argumentPerihelion = getOrbitalElement('w');
    const meanAnomaly = getOrbitalElement('ma');

    // Helper to get string value from phys_par array
    const getPhysParamString = (name: string): string | null => {
      const param = physPar?.find(p => p.name === name);
      return param?.value || null;
    };

    // Classify asteroid type
    const spectralType = getPhysParamString('spec_B') || getPhysParamString('spec_T') || 'Unknown';
    const orbitClass = object.orbit_class?.name || 'Unknown';
    const extent = getPhysParamString('extent');

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
          extent,
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
          perihelionDistance,
          inclination,
          inclinationUnit: 'degrees',
          longitudeAscendingNode,
          argumentPerihelion,
          meanAnomaly,
          orbitalPeriod,
          orbitalPeriodUnit: 'days',
          epoch: orbit?.epoch || null,
          firstObservation: orbit?.first_obs || null,
          lastObservation: orbit?.last_obs || null,
          dataArc: orbit?.data_arc || null,
          orbitUncertainty: orbit?.condition_code || null,
          moid: orbit?.moid ? parseFloat(orbit.moid) : null,
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
