import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, withTimeout } from '@/lib/api/error-handler';

export const runtime = 'edge';

interface CADResponse {
  signature: {
    version: string;
    source: string;
  };
  count: string;
  fields: string[];
  data: (string | number)[][];
}

interface CloseApproach {
  date: string;
  dateCalendar: string;
  distance: number;
  distanceAU: number;
  distanceLunar: number;
  distanceKm: number;
  distanceMin: number;
  distanceMax: number;
  velocity: number;
  relativeVelocity: number;
  uncertaintyWindow: string;
  magnitude: number;
  severity: 'extreme' | 'very-close' | 'close' | 'moderate' | 'distant';
  description: string;
}

/**
 * GET /api/asteroids/close-approach
 * Fetches close approach data from NASA CAD (Close Approach Data) API
 *
 * Query Parameters:
 * - des: Object designation (required)
 * - date-min: Minimum date (YYYY-MM-DD, default: today)
 * - date-max: Maximum date (YYYY-MM-DD, default: +25 years)
 * - dist-max: Maximum distance in AU (default: 0.2 AU)
 *
 * Returns past and future close approaches to Earth
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const des = searchParams.get('des');
    if (!des) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing Parameter',
          message: 'The "des" parameter is required (object designation)',
        },
        { status: 400 }
      );
    }

    // Date range: comprehensive view from 2000 to 2050
    const dateMin = searchParams.get('date-min') || '2000-01-01';
    const dateMax = searchParams.get('date-max') || '2050-12-31';
    const distMax = searchParams.get('dist-max') || '0.2'; // 0.2 AU = ~30 million km

    // Build CAD API URL
    const cadUrl = `https://ssd-api.jpl.nasa.gov/cad.api?des=${encodeURIComponent(des)}&date-min=${dateMin}&date-max=${dateMax}&dist-max=${distMax}&sort=date`;

    const fetchCADData = async (): Promise<CADResponse> => {
      const response = await fetch(cadUrl, {
        headers: {
          'User-Agent': 'DeepSix-Asteroid-Tracker',
        },
      });

      if (!response.ok) {
        throw new Error(`CAD API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as CADResponse;
    };

    // Wrap in timeout (10 seconds)
    const cadData = await withTimeout(fetchCADData(), 10000);

    // Parse data arrays into structured objects
    const fieldIndices: { [key: string]: number } = {};
    cadData.fields.forEach((field, index) => {
      fieldIndices[field] = index;
    });

    const approaches: CloseApproach[] = cadData.data.map((record) => {
      const distAU = parseFloat(record[fieldIndices['dist']] as string);
      const distMinAU = parseFloat(record[fieldIndices['dist_min']] as string);
      const distMaxAU = parseFloat(record[fieldIndices['dist_max']] as string);
      const vRel = parseFloat(record[fieldIndices['v_rel']] as string);
      const mag = parseFloat(record[fieldIndices['h']] as string);

      // Convert distances
      const distLunar = distAU * 389.1727; // 1 AU = 389.1727 Lunar Distances
      const distKm = distAU * 149597870.7; // 1 AU = 149,597,870.7 km

      // Determine severity based on distance
      let severity: CloseApproach['severity'];
      let description: string;

      if (distAU < 0.0005) {
        // < 74,799 km (extremely close, inside geostationary orbit)
        severity = 'extreme';
        description = 'EXTREMELY CLOSE - Inside geostationary orbit altitude';
      } else if (distAU < 0.002) {
        // < 299,196 km (very close, well inside lunar orbit)
        severity = 'very-close';
        description = 'Very close approach - Well within lunar orbit';
      } else if (distAU < 0.01) {
        // < 1.5 million km (close)
        severity = 'close';
        description = 'Close approach to Earth';
      } else if (distAU < 0.05) {
        // < 7.5 million km (moderate)
        severity = 'moderate';
        description = 'Moderate approach distance';
      } else {
        severity = 'distant';
        description = 'Distant approach';
      }

      return {
        date: record[fieldIndices['jd']] as string,
        dateCalendar: record[fieldIndices['cd']] as string,
        distance: distAU,
        distanceAU: distAU,
        distanceLunar: distLunar,
        distanceKm: distKm,
        distanceMin: distMinAU,
        distanceMax: distMaxAU,
        velocity: vRel,
        relativeVelocity: vRel,
        uncertaintyWindow: record[fieldIndices['t_sigma_f']] as string,
        magnitude: mag,
        severity,
        description,
      };
    });

    // Separate into past and future
    const now = new Date();
    const futureApproaches = approaches.filter(a => new Date(a.dateCalendar) > now);
    const pastApproaches = approaches.filter(a => new Date(a.dateCalendar) <= now);

    // Find closest approach overall
    const closestApproach = approaches.length > 0
      ? approaches.reduce((prev, curr) => (curr.distance < prev.distance ? curr : prev))
      : null;

    // Find next approach
    const nextApproach = futureApproaches.length > 0 ? futureApproaches[0] : null;

    return NextResponse.json({
      success: true,
      dataSource: 'NASA JPL Close Approach Data API',
      timestamp: new Date().toISOString(),
      version: cadData.signature.version,
      query: {
        designation: des,
        dateMin,
        dateMax,
        maxDistance: `${distMax} AU`,
      },
      summary: {
        total: parseInt(cadData.count),
        future: futureApproaches.length,
        past: pastApproaches.length,
        closestEver: closestApproach,
        nextApproach,
      },
      approaches: {
        future: futureApproaches,
        past: pastApproaches.reverse(), // Most recent first
      },
    });

  } catch (error) {
    if (error instanceof Error && error.message.includes('timed out')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request Timeout',
          message: 'CAD API request timed out. Please try again later.',
        },
        { status: 504 }
      );
    }

    return handleApiError(error, 'CAD API');
  }
}
