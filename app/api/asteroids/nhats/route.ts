import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, withTimeout } from '@/lib/api/error-handler';

export const runtime = 'edge';

// Note: NHATS API returns nested structures, using 'any' for flexibility
interface NHATSResponse {
  signature: {
    version: string;
    source: string;
  };
  data: any[];
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
export async function GET(_request: NextRequest) {
  try {
    // Call NHATS API without parameters to get all data
    const nhatsUrl = 'https://ssd-api.jpl.nasa.gov/nhats.api';

    const fetchNHATSData = async () => {
      const response = await fetch(nhatsUrl, {
        headers: {
          'User-Agent': 'DeepSix-Asteroid-Tracker',
        },
      });

      if (!response.ok) {
        throw new Error(`NHATS API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    };

    // Wrap in timeout (10 seconds)
    const nhatsData = await withTimeout(fetchNHATSData(), 10000);

    // Transform and enrich the data
    // Note: NHATS API returns nested structures for min_dv and min_dur
    const enrichedData = nhatsData.data.map((obj: any) => {
      const minDeltaV = typeof obj.min_dv === 'object' ? parseFloat(obj.min_dv.dv) : obj.min_dv;
      const minDuration = typeof obj.min_dur === 'object' ? parseFloat(obj.min_dur.dur) : obj.min_dur;
      const minSize = obj.min_size ? parseFloat(obj.min_size) : null;
      const maxSize = obj.max_size ? parseFloat(obj.max_size) : null;

      return {
        designation: obj.des,
        fullName: obj.fullname ? obj.fullname.trim() : `Asteroid ${obj.des}`,
        minDeltaV,
        minDuration,
        absoluteMagnitude: obj.h ? parseFloat(obj.h) : null,
        minSize,
        maxSize,
        opportunities: obj.occ ? parseInt(obj.occ) : 0,
        // Calculate accessibility rating (lower delta-v = better)
        accessibilityRating: minDeltaV ?
          (minDeltaV < 4 ? 'Excellent' :
           minDeltaV < 7 ? 'Good' :
           minDeltaV < 10 ? 'Moderate' : 'Challenging') : 'Unknown',
        // Estimate diameter range in meters
        diameterRange: minSize && maxSize ?
          `${Math.round(minSize)}m - ${Math.round(maxSize)}m` : 'Unknown',
        // Mission duration description
        durationDescription: minDuration ?
          (minDuration < 180 ? 'Short mission' :
           minDuration < 300 ? 'Medium mission' : 'Long mission') : 'Unknown',
      };
    });

    // Sort by delta-v (most accessible first)
    const sortedData = enrichedData.sort((a: any, b: any) => {
      if (!a.minDeltaV) return 1;
      if (!b.minDeltaV) return -1;
      return a.minDeltaV - b.minDeltaV;
    });

    return NextResponse.json({
      success: true,
      dataSource: 'NASA NHATS System (JPL)',
      timestamp: new Date().toISOString(),
      totalObjects: nhatsData.data.length,
      version: nhatsData.signature.version,
      objects: sortedData,
      summary: {
        total: nhatsData.data.length,
        excellent: sortedData.filter((o: any) => o.accessibilityRating === 'Excellent').length,
        good: sortedData.filter((o: any) => o.accessibilityRating === 'Good').length,
        moderate: sortedData.filter((o: any) => o.accessibilityRating === 'Moderate').length,
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
