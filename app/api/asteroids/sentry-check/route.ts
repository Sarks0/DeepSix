import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, withTimeout } from '@/lib/api/error-handler';

export const runtime = 'edge';

interface SentryResponse {
  signature: {
    version: string;
    source: string;
  };
  data?: SentryImpact[];
  summary?: SentrySummary;
}

interface SentryImpact {
  date: string;
  ip: string;
  ts: string;
  ps: string;
  energy: string;
}

interface SentrySummary {
  des: string;
  fullname?: string;
  ip: string;
  ps_cum: string;
  ps_max: string;
  ts_max: string;
  last_obs: string;
  n_imp: number;
  h?: string;
  v_inf: string;
  diameter: string;
}

/**
 * GET /api/asteroids/sentry-check
 * Checks if a specific asteroid is monitored by NASA Sentry system
 *
 * Query Parameters:
 * - des: Object designation (required)
 *
 * Returns impact risk assessment if object is in Sentry database,
 * or "not monitored" status if not found
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

    // Query Sentry API for specific object
    const sentryUrl = `https://ssd-api.jpl.nasa.gov/sentry.api?des=${encodeURIComponent(des)}`;

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

    // Check if object was found in Sentry database
    // When querying for a specific object, the API returns a summary object
    if (!sentryData.summary) {
      return NextResponse.json({
        success: true,
        dataSource: 'NASA Sentry System (JPL)',
        timestamp: new Date().toISOString(),
        monitored: false,
        designation: des,
        message: 'This asteroid is not currently monitored for impact risk by the Sentry system.',
        status: 'No Hazard Detected',
      });
    }

    // Object is in Sentry database - extract risk data from summary
    const obj = sentryData.summary;

    // Parse numeric values from strings
    const ip = parseFloat(obj.ip);
    const ts_max = parseInt(obj.ts_max);
    const ps_cum = parseFloat(obj.ps_cum);
    const ps_max = parseFloat(obj.ps_max);

    // Calculate human-readable impact odds
    const impactOdds = ip > 0
      ? `1 in ${Math.round(1 / ip).toLocaleString()}`
      : 'Less than 1 in 100 million';

    // Determine hazard level based on Torino Scale
    let hazardLevel: string;
    let hazardColor: string;
    let hazardDescription: string;

    if (ts_max === 0) {
      hazardLevel = 'No Hazard';
      hazardColor = 'white';
      hazardDescription = 'The likelihood of a collision is zero, or well below the chance of a random impact.';
    } else if (ts_max === 1) {
      hazardLevel = 'Normal';
      hazardColor = 'green';
      hazardDescription = 'Routine discovery with pass near Earth predicted. Actual collision extremely unlikely.';
    } else if (ts_max <= 4) {
      hazardLevel = 'Meriting Attention';
      hazardColor = 'yellow';
      hazardDescription = 'Close encounter meriting attention by astronomers. Tracking and calculations ongoing.';
    } else if (ts_max <= 7) {
      hazardLevel = 'Threatening';
      hazardColor = 'orange';
      hazardDescription = 'Close encounter with significant threat of impact. Government attention warranted.';
    } else {
      hazardLevel = 'Certain Collision';
      hazardColor = 'red';
      hazardDescription = 'Collision is certain, capable of causing localized or regional devastation.';
    }

    // Palermo Scale interpretation
    let palermoInterpretation: string;
    if (ps_cum < -2) {
      palermoInterpretation = 'Events of this level are of no likely consequence.';
    } else if (ps_cum < 0) {
      palermoInterpretation = 'Merits careful monitoring. Less concern than background hazard.';
    } else {
      palermoInterpretation = 'Threat requires contingency planning. Above background level.';
    }

    return NextResponse.json({
      success: true,
      dataSource: 'NASA Sentry System (JPL)',
      timestamp: new Date().toISOString(),
      monitored: true,
      designation: obj.des,
      fullName: obj.fullname || obj.des,
      risk: {
        impactProbability: ip,
        impactOdds,
        torinoScale: ts_max,
        palermoScale: ps_cum,
        palermoScaleMax: ps_max,
        numberOfImpacts: obj.n_imp,
        hazardLevel,
        hazardColor,
        hazardDescription,
        palermoInterpretation,
      },
      observation: {
        lastObserved: obj.last_obs,
        absoluteMagnitude: obj.h ? parseFloat(obj.h) : null,
      },
      status: hazardLevel,
      summary: {
        monitored: true,
        riskLevel: ts_max > 0 ? 'Elevated' : 'Minimal',
        requiresAttention: ts_max > 1,
        probability: ip,
      },
    });

  } catch (error) {
    // If object not found or API error, assume not monitored
    if (error instanceof Error &&
        (error.message.includes('404') ||
         error.message.includes('not found') ||
         error.message.includes('No object found'))) {
      return NextResponse.json({
        success: true,
        dataSource: 'NASA Sentry System (JPL)',
        timestamp: new Date().toISOString(),
        monitored: false,
        message: 'This asteroid is not currently monitored for impact risk by the Sentry system.',
        status: 'No Hazard Detected',
      });
    }

    if (error instanceof Error && error.message.includes('timed out')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request Timeout',
          message: 'Sentry API request timed out. Please try again later.',
        },
        { status: 504 }
      );
    }

    return handleApiError(error, 'Sentry API');
  }
}
