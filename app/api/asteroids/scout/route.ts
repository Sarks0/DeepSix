import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, withTimeout } from '@/lib/api/error-handler';

export const runtime = 'edge';

interface ScoutResponse {
  signature: {
    version: string;
    source: string;
  };
  count: number;
  data: Array<{
    tdes: string;           // Temporary designation
    fullname?: string;      // Full name if available
    nobs: number;           // Number of observations
    arc: number;            // Arc duration (hours)
    H: number | null;       // Absolute magnitude
    'n<22': number;         // Number of VI solutions with H < 22
    'n_imp': number;        // Number of impact solutions
    ip: number | null;      // Impact probability (cumulative)
    ps_cum: number | null;  // Cumulative Palermo Scale
    ps_max: number | null;  // Maximum Palermo Scale
    rate: string;           // NEO rating (1-10)
    unc: string;            // Uncertainty code
    lastrun: string;        // Last run timestamp
    ca_dist: number | null; // Close approach distance (AU)
    v_inf: number | null;   // Velocity at infinity (km/s)
  }>;
}

/**
 * GET /api/asteroids/scout
 * Fetches recently discovered asteroids from NASA Scout system
 *
 * Scout tracks newly discovered near-Earth objects even before they're
 * confirmed, providing real-time trajectory analysis and hazard assessment.
 *
 * Query parameters:
 * - tdes: Specific object temporary designation (optional)
 *
 * Without parameters, returns Mode S (Summary) - all currently tracked objects
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tdes = searchParams.get('tdes');

    // Build Scout API URL
    let scoutUrl = 'https://ssd-api.jpl.nasa.gov/scout.api';
    if (tdes) {
      scoutUrl += `?tdes=${encodeURIComponent(tdes)}`;
    }

    const fetchScoutData = async (): Promise<ScoutResponse> => {
      const response = await fetch(scoutUrl, {
        headers: {
          'User-Agent': 'DeepSix-Asteroid-Tracker',
        },
      });

      if (!response.ok) {
        throw new Error(`Scout API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as ScoutResponse;
    };

    // Wrap in timeout (10 seconds)
    const scoutData = await withTimeout(fetchScoutData(), 10000);

    // If no data, return empty result
    if (!scoutData.data || scoutData.data.length === 0) {
      return NextResponse.json({
        success: true,
        dataSource: 'NASA Scout System (CNEOS)',
        timestamp: new Date().toISOString(),
        count: 0,
        objects: [],
        summary: {
          total: 0,
          withImpactSolutions: 0,
          highPriority: 0,
          recentlyAdded: 0,
        },
      });
    }

    // Transform and enrich Scout data
    const enrichedObjects = scoutData.data.map((obj) => {
      const neoRating = parseInt(obj.rate) || 0;
      const arcHours = obj.arc || 0;
      const arcDays = arcHours / 24;
      const impactProbability = obj.ip || 0;
      const hasImpactSolutions = obj.n_imp > 0;

      // Status based on rating and impact solutions
      let status = 'Tracking';
      let statusColor = 'gray';
      if (hasImpactSolutions && impactProbability > 0) {
        status = 'Analyzing Impact Risk';
        statusColor = 'orange';
      } else if (neoRating >= 7) {
        status = 'High Priority';
        statusColor = 'red';
      } else if (neoRating >= 4) {
        status = 'Under Analysis';
        statusColor = 'yellow';
      }

      // Uncertainty description
      const uncertaintyDesc = getUncertaintyDescription(obj.unc);

      // Recent discovery flag (within last 24 hours of observation)
      const isRecent = arcHours < 48;

      return {
        designation: obj.tdes,
        fullName: obj.fullname || obj.tdes,
        numberOfObservations: obj.nobs,
        arcHours: arcHours,
        arcDays: arcDays.toFixed(1),
        absoluteMagnitude: obj.H,
        neoRating,
        uncertainty: obj.unc,
        uncertaintyDescription: uncertaintyDesc,
        impactSolutions: obj.n_imp,
        impactProbability,
        impactOdds: impactProbability > 0 ? `1 in ${Math.round(1 / impactProbability).toLocaleString()}` : 'None',
        palermoCumulative: obj.ps_cum,
        palermoMax: obj.ps_max,
        lastRun: obj.lastrun,
        closeApproachDistance: obj.ca_dist,
        velocity: obj.v_inf,
        status,
        statusColor,
        isRecent,
        hasImpactRisk: hasImpactSolutions && impactProbability > 0,
      };
    });

    // Sort by NEO rating (highest first), then by recency
    const sortedObjects = enrichedObjects.sort((a, b) => {
      if (a.neoRating !== b.neoRating) {
        return b.neoRating - a.neoRating;
      }
      return b.arcHours - a.arcHours; // More recent first
    });

    // Calculate summary statistics
    const summary = {
      total: scoutData.count,
      withImpactSolutions: sortedObjects.filter(o => o.impactSolutions > 0).length,
      highPriority: sortedObjects.filter(o => o.neoRating >= 7).length,
      recentlyAdded: sortedObjects.filter(o => o.isRecent).length,
    };

    return NextResponse.json({
      success: true,
      dataSource: 'NASA Scout System (CNEOS)',
      timestamp: new Date().toISOString(),
      count: scoutData.count,
      objects: sortedObjects,
      summary,
    });

  } catch (error) {
    // Fallback for errors
    if (error instanceof Error && error.message.includes('timed out')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request Timeout',
          message: 'Scout API request timed out. Please try again later.',
          dataSource: 'Fallback Data',
          timestamp: new Date().toISOString(),
          count: 0,
          objects: [],
          summary: {
            total: 0,
            withImpactSolutions: 0,
            highPriority: 0,
            recentlyAdded: 0,
          },
        },
        { status: 504 }
      );
    }

    return handleApiError(error, 'Scout API');
  }
}

// Helper function for uncertainty descriptions
function getUncertaintyDescription(unc: string): string {
  const code = unc.charAt(0);
  const descriptions: Record<string, string> = {
    '0': 'Extremely uncertain',
    '1': 'Very uncertain',
    '2': 'Uncertain',
    '3': 'Moderately uncertain',
    '4': 'Fair certainty',
    '5': 'Good certainty',
    '6': 'Very good certainty',
    '7': 'High certainty',
    '8': 'Very high certainty',
    '9': 'Extremely precise',
  };

  return descriptions[code] || 'Unknown';
}
