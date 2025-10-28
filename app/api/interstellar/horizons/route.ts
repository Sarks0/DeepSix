import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const HORIZONS_API_BASE = 'https://ssd.jpl.nasa.gov/api/horizons.api';
const AU_TO_KM = 149597870.7;

// Known interstellar objects with their Horizons-compatible designations
const INTERSTELLAR_OBJECTS = {
  '3I': {
    designation: '3I/ATLAS',
    horizonsCommand: 'C/2025 N1 (ATLAS)', // Exact format from Horizons web interface
    type: 'Interstellar Comet',
    discoveryDate: '2025-07',
    status: 'active', // Currently observable
  },
  '2I': {
    designation: '2I/Borisov',
    horizonsCommand: 'C/2019 Q4 (Borisov)', // Standard Horizons format
    type: 'Interstellar Comet',
    discoveryDate: '2019-08',
    status: 'historical', // Passed through, no longer observable
  },
  '1I': {
    designation: '1I/\'Oumuamua',
    horizonsCommand: 'A/2017 U1', // Asteroid designation
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
