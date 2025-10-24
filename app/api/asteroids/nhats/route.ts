import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, withTimeout } from '@/lib/api/error-handler';

export const runtime = 'edge';

interface NHATSObject {
  des: string;
  fullname?: string;
  min_dv?: number;
  min_dur?: number;
  h?: number;
  min_size?: number;
  max_size?: number;
  occ?: number;
}

interface NHATSResponse {
  signature: {
    version: string;
    source: string;
  };
  count: number;
  data: NHATSObject[];
}

/**
 * GET /api/asteroids/nhats
 * Fetches mission-accessible asteroid data from NASA NHATS system
 *
 * NHATS identifies Near-Earth Objects that are most accessible for
 * future human space missions based on delta-v, duration, and size.
 *
 * Query parameters:
 * - delta-v: Maximum delta-v filter (km/s) - default 12
 * - dur: Maximum duration filter (days) - default 400
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const deltaV = searchParams.get('delta-v') || '12'; // Default: 12 km/s (considered accessible)
    const duration = searchParams.get('dur') || '400'; // Default: 400 days

    // Build NHATS API URL with filters
    const nhatsUrl = `https://ssd-api.jpl.nasa.gov/nhats.api?delta-v=${deltaV}&dur=${duration}`;

    const fetchNHATSData = async (): Promise<NHATSResponse> => {
      const response = await fetch(nhatsUrl, {
        headers: {
          'User-Agent': 'DeepSix-Asteroid-Tracker',
        },
      });

      if (!response.ok) {
        throw new Error(`NHATS API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as NHATSResponse;
    };

    // Wrap in timeout (10 seconds)
    const nhatsData = await withTimeout(fetchNHATSData(), 10000);

    // Transform and enrich the data
    const enrichedData = nhatsData.data.map((obj) => ({
      designation: obj.des,
      fullName: obj.fullname || `Asteroid ${obj.des}`,
      minDeltaV: obj.min_dv,
      minDuration: obj.min_dur,
      absoluteMagnitude: obj.h,
      minSize: obj.min_size,
      maxSize: obj.max_size,
      opportunities: obj.occ,
      // Calculate accessibility rating (lower delta-v = better)
      accessibilityRating: obj.min_dv ?
        (obj.min_dv < 4 ? 'Excellent' :
         obj.min_dv < 7 ? 'Good' :
         obj.min_dv < 10 ? 'Moderate' : 'Challenging') : 'Unknown',
      // Estimate diameter range in meters
      diameterRange: obj.min_size && obj.max_size ?
        `${Math.round(obj.min_size)}m - ${Math.round(obj.max_size)}m` : 'Unknown',
      // Mission duration description
      durationDescription: obj.min_dur ?
        (obj.min_dur < 180 ? 'Short mission' :
         obj.min_dur < 300 ? 'Medium mission' : 'Long mission') : 'Unknown',
    }));

    // Sort by delta-v (most accessible first)
    const sortedData = enrichedData.sort((a, b) => {
      if (!a.minDeltaV) return 1;
      if (!b.minDeltaV) return -1;
      return a.minDeltaV - b.minDeltaV;
    });

    return NextResponse.json({
      success: true,
      dataSource: 'NASA NHATS System (JPL)',
      timestamp: new Date().toISOString(),
      totalObjects: nhatsData.count,
      version: nhatsData.signature.version,
      filters: {
        maxDeltaV: parseFloat(deltaV),
        maxDuration: parseInt(duration),
      },
      objects: sortedData,
      summary: {
        total: nhatsData.count,
        excellent: sortedData.filter(o => o.accessibilityRating === 'Excellent').length,
        good: sortedData.filter(o => o.accessibilityRating === 'Good').length,
        moderate: sortedData.filter(o => o.accessibilityRating === 'Moderate').length,
        mostAccessible: sortedData[0]?.fullName || 'None',
        lowestDeltaV: sortedData[0]?.minDeltaV || 0,
      },
    });

  } catch (error) {
    // Fallback data in case API fails
    if (error instanceof Error && error.message.includes('timed out')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request Timeout',
          message: 'NHATS API request timed out. Please try again later.',
          dataSource: 'Fallback Data',
          timestamp: new Date().toISOString(),
          totalObjects: 0,
          filters: {
            maxDeltaV: 12,
            maxDuration: 400,
          },
          objects: [],
          summary: {
            total: 0,
            excellent: 0,
            good: 0,
            moderate: 0,
            mostAccessible: 'Data temporarily unavailable',
            lowestDeltaV: 0,
          },
        },
        { status: 504 }
      );
    }

    return handleApiError(error, 'NHATS API');
  }
}
