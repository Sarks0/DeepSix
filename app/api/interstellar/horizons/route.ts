import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const HORIZONS_API_BASE = 'https://ssd.jpl.nasa.gov/api/horizons.api';
const AU_TO_KM = 149597870.7;

// Known interstellar objects with their designations
const INTERSTELLAR_OBJECTS = {
  '3I': {
    designation: '3I/ATLAS',
    altName: 'C/2025 N1',
    type: 'Interstellar Comet',
    discoveryDate: '2025-07',
    status: 'active', // Currently observable
  },
  '2I': {
    designation: '2I/Borisov',
    altName: 'C/2019 Q4',
    type: 'Interstellar Comet',
    discoveryDate: '2019-08',
    status: 'historical', // Passed through, no longer observable
  },
  '1I': {
    designation: '1I/\'Oumuamua',
    altName: 'A/2017 U1',
    type: 'Interstellar Object',
    discoveryDate: '2017-10',
    status: 'historical',
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
    let command = objectParam;
    let objectInfo = INTERSTELLAR_OBJECTS[objectParam as keyof typeof INTERSTELLAR_OBJECTS];

    // If not found in known objects, try using it as a direct designation
    if (!objectInfo && objectParam.includes('/')) {
      command = `'${objectParam}'`;
      // Infer object type from designation pattern
      if (objectParam.startsWith('C/2025')) {
        objectInfo = {
          designation: objectParam,
          altName: '3I/ATLAS',
          type: 'Interstellar Comet',
          discoveryDate: '2025-07',
          status: 'active',
        };
      }
    } else if (objectInfo) {
      // Use alternate name for query (more reliable)
      command = `'${objectInfo.altName}'`;
    }

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

    // Build Horizons API queries
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 86400000);

    // Query 1: OBSERVER ephemeris for position and visual data
    // Use minimal parameters - QUANTITIES may not be supported for some objects
    const observerParams = new URLSearchParams({
      format: 'json',
      COMMAND: command,
      EPHEM_TYPE: 'OBSERVER',
      CENTER: '500@399', // Geocentric
      START_TIME: startTime || now.toISOString().split('T')[0],
      STOP_TIME: stopTime || tomorrow.toISOString().split('T')[0],
      STEP_SIZE: stepSize,
      MAKE_EPHEM: 'YES',
    });

    // Query 2: ELEMENTS for orbital parameters
    const elementsParams = new URLSearchParams({
      format: 'json',
      COMMAND: command,
      EPHEM_TYPE: 'ELEMENTS',
      CENTER: '500@10', // Sun center
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
        alternateName: objectInfo.altName,
        type: objectInfo.type,
        discoveryDate: objectInfo.discoveryDate,
        status: objectInfo.status,
        interstellarOrigin: true,
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
 */
function parseHorizonsResult(
  resultText: string,
  orbitalElements: { eccentricity: number; perihelionDistanceAU: number; inclinationDeg: number; distanceFromSunAU: number } | null
): Partial<InterstellarPosition> | null {
  try {
    // Horizons returns data in a specific text format
    // Look for the ephemeris table ($$SOE to $$EOE markers)
    const soeIndex = resultText.indexOf('$$SOE');
    const eoeIndex = resultText.indexOf('$$EOE');

    if (soeIndex === -1 || eoeIndex === -1) {
      return null;
    }

    const ephemerisBlock = resultText.substring(soeIndex + 5, eoeIndex).trim();
    const lines = ephemerisBlock.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
      return null;
    }

    // Parse first data line (most recent position)
    const dataLine = lines[0].trim();
    console.log('Parsing OBSERVER line:', dataLine);

    // Horizons default OBSERVER format typically includes:
    // Date, R.A._(ICRF), DEC_(ICRF), APmag, S-brt, delta, deldot, ...
    // Format can vary, so we'll parse flexibly

    // Extract timestamp from the beginning of the line
    const dateMatch = dataLine.match(/^\d{4}-\w{3}-\d{2}\s+\d{2}:\d{2}/);
    const timestamp = dateMatch ? new Date(dateMatch[0]).toISOString() : new Date().toISOString();
    console.log('Extracted timestamp:', timestamp);

    // Split by multiple spaces to get columns (Horizons uses column alignment)
    const parts = dataLine.split(/\s{2,}/).filter(p => p.trim());
    console.log('Split into parts:', parts.length, 'columns');

    // Try to extract RA and DEC from the data
    // RA format: HH MM SS.SS or decimal degrees
    // DEC format: +/-DD MM SS.S or decimal degrees
    let ra = 'N/A';
    let dec = 'N/A';
    let magnitude = 99;
    let earthDistance = 0;

    // Look through parts for RA/DEC patterns
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();

      // RA pattern: HH MM SS.SS or similar
      if (/^\d{1,3}\s+\d{2}\s+\d{2}\.\d+$/.test(part) && ra === 'N/A') {
        ra = part;
        console.log('Found RA:', ra);
      }

      // DEC pattern: +/-DD MM SS.S or similar
      if (/^[+-]\d{1,2}\s+\d{2}\s+\d{2}\.\d+$/.test(part) && dec === 'N/A') {
        dec = part;
        console.log('Found DEC:', dec);
      }

      // Magnitude (typically 1-2 digits with decimal, value 0-30)
      const magValue = parseFloat(part);
      if (!isNaN(magValue) && magValue >= 0 && magValue <= 30 && magnitude === 99) {
        magnitude = magValue;
        console.log('Found magnitude:', magnitude);
      }

      // Distance (typically larger decimal, > 0.1 AU)
      const distValue = parseFloat(part);
      if (!isNaN(distValue) && distValue > 0.5 && distValue < 50 && earthDistance === 0) {
        earthDistance = distValue;
        console.log('Found Earth distance:', earthDistance);
      }
    }

    return {
      timestamp,
      position: {
        ra: ra,
        dec: dec,
        distanceFromSunAU: orbitalElements?.distanceFromSunAU || earthDistance,
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
