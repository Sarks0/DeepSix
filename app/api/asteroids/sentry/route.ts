import { NextResponse } from 'next/server';
import { handleApiError, withTimeout } from '@/lib/api/error-handler';

export const runtime = 'edge';

interface SentryObject {
  des: string;
  fullname?: string;
  ip: number;
  ps_cum: number;
  ts_max: number;
  last_obs: string;
  n_imp: number;
  h?: number;
}

interface SentryResponse {
  signature: {
    version: string;
    source: string;
  };
  count: string;
  data: SentryObject[];
}

/**
 * GET /api/asteroids/sentry
 * Fetches asteroid impact monitoring data from NASA Sentry system
 *
 * Sentry monitors ~1,900 Near-Earth Asteroids for potential Earth impacts
 * over the next 100 years using the Impact Pseudo-Observation (IOBS) method.
 */
export async function GET() {
  try {
    // Fetch from NASA Sentry API (Mode S - all objects)
    const sentryUrl = 'https://ssd-api.jpl.nasa.gov/sentry.api';

    const fetchSentryData = async (): Promise<SentryResponse> => {
      const response = await fetch(sentryUrl, {
        headers: {
          'User-Agent': 'DeepSix-Asteroid-Tracker',
        },
      });

      if (!response.ok) {
        throw new Error(`Sentry API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as SentryResponse;
    };

    // Wrap in timeout (10 seconds)
    const sentryData = await withTimeout(fetchSentryData(), 10000);

    // Transform and enrich the data
    const enrichedData = sentryData.data.map((obj) => ({
      designation: obj.des,
      fullName: obj.fullname || `Asteroid ${obj.des}`,
      impactProbability: obj.ip,
      palermoScale: obj.ps_cum,
      torinoScale: obj.ts_max,
      lastObservation: obj.last_obs,
      numberOfImpacts: obj.n_imp,
      absoluteMagnitude: obj.h,
      // Calculate impact odds in readable format
      impactOdds: obj.ip > 0 ? `1 in ${Math.round(1 / obj.ip).toLocaleString()}` : 'Minimal',
      // Determine hazard level based on Torino Scale
      hazardLevel: obj.ts_max === 0 ? 'No Hazard' :
                    obj.ts_max === 1 ? 'Normal' :
                    obj.ts_max <= 4 ? 'Meriting Attention' :
                    obj.ts_max <= 7 ? 'Threatening' : 'Certain Collision',
      // Color coding for UI
      hazardColor: obj.ts_max === 0 ? 'white' :
                    obj.ts_max === 1 ? 'green' :
                    obj.ts_max <= 4 ? 'yellow' :
                    obj.ts_max <= 7 ? 'orange' : 'red',
    }));

    // Sort by impact probability (highest first)
    const sortedData = enrichedData.sort((a, b) => b.impactProbability - a.impactProbability);

    return NextResponse.json({
      success: true,
      dataSource: 'NASA Sentry System (JPL)',
      timestamp: new Date().toISOString(),
      totalObjects: parseInt(sentryData.count),
      version: sentryData.signature.version,
      objects: sortedData,
      summary: {
        total: parseInt(sentryData.count),
        torinoGreaterThanZero: sortedData.filter(o => o.torinoScale > 0).length,
        highestProbability: sortedData[0]?.fullName || 'None',
        highestProbabilityValue: sortedData[0]?.impactProbability || 0,
      },
    });

  } catch (error) {
    // Fallback data in case API fails
    if (error instanceof Error && error.message.includes('timed out')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request Timeout',
          message: 'Sentry API request timed out. Please try again later.',
          dataSource: 'Fallback Data',
          timestamp: new Date().toISOString(),
          totalObjects: 1900,
          objects: [],
          summary: {
            total: 1900,
            torinoGreaterThanZero: 0,
            highestProbability: 'Data temporarily unavailable',
            highestProbabilityValue: 0,
          },
        },
        { status: 504 }
      );
    }

    return handleApiError(error, 'Sentry API');
  }
}
