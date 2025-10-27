import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, withTimeout } from '@/lib/api/error-handler';

export const runtime = 'edge';

interface NHATSResponse {
  signature?: {
    version: string;
    source: string;
  };
  des?: string;
  fullname?: string;
  h?: string;
  size?: number;
  min_size?: string;
  max_size?: string;
  min_dv?: {
    dv: string;
    dur: number;
  };
  min_dv_traj?: {
    launch: string;
    dur_total: number;
    dur_out: number;
    dur_ret: number;
    dur_at: number;
    dv_total: string;
    c3: string;
    v_dep_earth: string;
    v_arr_earth: string;
    vrel_arr_neo: string;
    vrel_dep_neo: string;
  };
  min_dur?: {
    dv: string;
    dur: number;
  };
  min_dur_traj?: {
    launch: string;
    dur_total: number;
    dur_out: number;
    dur_ret: number;
    dur_at: number;
    dv_total: string;
  };
  n_via_traj?: number;
  obs_start?: string;
  obs_end?: string;
  obs_mag?: string;
  error?: string;
}

/**
 * GET /api/asteroids/mission-accessibility
 * Checks if a specific asteroid is accessible for human missions using NASA NHATS API
 *
 * Query Parameters:
 * - des: Object designation (required)
 *
 * Returns mission accessibility data if object is in NHATS database,
 * or "not accessible" status if not found
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

    // Query NHATS API for specific object
    const nhatsUrl = `https://ssd-api.jpl.nasa.gov/nhats.api?des=${encodeURIComponent(des)}`;

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

    // Check if object was found in NHATS database
    if (nhatsData.error) {
      return NextResponse.json({
        success: true,
        dataSource: 'NASA NHATS (Near-Earth Object Human Space Flight Accessible Targets Study)',
        timestamp: new Date().toISOString(),
        accessible: false,
        designation: des,
        message: 'This asteroid is not currently classified as accessible for human missions.',
        status: 'Not Accessible',
      });
    }

    // Object is in NHATS database - extract mission data
    const minDvDelta = parseFloat(nhatsData.min_dv?.dv || '0');

    // Determine accessibility level based on delta-V
    let accessibilityLevel: string;
    let accessibilityColor: string;
    let accessibilityDescription: string;

    if (minDvDelta < 5) {
      accessibilityLevel = 'Highly Accessible';
      accessibilityColor = 'green';
      accessibilityDescription = 'Excellent target for human missions with low propulsion requirements.';
    } else if (minDvDelta < 7) {
      accessibilityLevel = 'Accessible';
      accessibilityColor = 'blue';
      accessibilityDescription = 'Feasible target for human missions with moderate propulsion requirements.';
    } else if (minDvDelta < 10) {
      accessibilityLevel = 'Challenging';
      accessibilityColor = 'yellow';
      accessibilityDescription = 'Challenging but possible target requiring significant propulsion.';
    } else {
      accessibilityLevel = 'Very Challenging';
      accessibilityColor = 'orange';
      accessibilityDescription = 'Very challenging target requiring advanced propulsion systems.';
    }

    // Determine mission type based on duration
    const duration = nhatsData.min_dv?.dur || 0;
    let missionType: string;
    if (duration < 180) {
      missionType = 'Short-duration mission (< 6 months)';
    } else if (duration < 365) {
      missionType = 'Medium-duration mission (6-12 months)';
    } else if (duration < 730) {
      missionType = 'Long-duration mission (1-2 years)';
    } else {
      missionType = 'Extended mission (> 2 years)';
    }

    return NextResponse.json({
      success: true,
      dataSource: 'NASA NHATS (Near-Earth Object Human Space Flight Accessible Targets Study)',
      timestamp: new Date().toISOString(),
      accessible: true,
      designation: nhatsData.des,
      fullName: nhatsData.fullname,
      mission: {
        accessibilityLevel,
        accessibilityColor,
        accessibilityDescription,
        missionType,
        minimumDeltaV: {
          value: minDvDelta,
          duration: nhatsData.min_dv?.dur || 0,
          trajectory: nhatsData.min_dv_traj ? {
            launchDate: nhatsData.min_dv_traj.launch,
            totalDuration: nhatsData.min_dv_traj.dur_total,
            outboundDuration: nhatsData.min_dv_traj.dur_out,
            returnDuration: nhatsData.min_dv_traj.dur_ret,
            stayTime: nhatsData.min_dv_traj.dur_at,
            deltaV: parseFloat(nhatsData.min_dv_traj.dv_total),
            c3Energy: parseFloat(nhatsData.min_dv_traj.c3),
            departureVelocity: parseFloat(nhatsData.min_dv_traj.v_dep_earth),
            arrivalVelocity: parseFloat(nhatsData.min_dv_traj.v_arr_earth),
          } : null,
        },
        shortestDuration: {
          value: nhatsData.min_dur?.dur || 0,
          deltaV: parseFloat(nhatsData.min_dur?.dv || '0'),
          trajectory: nhatsData.min_dur_traj ? {
            launchDate: nhatsData.min_dur_traj.launch,
            totalDuration: nhatsData.min_dur_traj.dur_total,
            outboundDuration: nhatsData.min_dur_traj.dur_out,
            returnDuration: nhatsData.min_dur_traj.dur_ret,
            stayTime: nhatsData.min_dur_traj.dur_at,
            deltaV: parseFloat(nhatsData.min_dur_traj.dv_total),
          } : null,
        },
        viableTrajectories: nhatsData.n_via_traj || 0,
      },
      physicalProperties: {
        estimatedSize: nhatsData.size || null,
        minSize: nhatsData.min_size ? parseFloat(nhatsData.min_size) : null,
        maxSize: nhatsData.max_size ? parseFloat(nhatsData.max_size) : null,
        absoluteMagnitude: nhatsData.h ? parseFloat(nhatsData.h) : null,
      },
      observation: {
        nextWindow: {
          start: nhatsData.obs_start || null,
          end: nhatsData.obs_end || null,
          magnitude: nhatsData.obs_mag ? parseFloat(nhatsData.obs_mag) : null,
        },
      },
      status: accessibilityLevel,
    });

  } catch (error) {
    if (error instanceof Error && error.message.includes('timed out')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request Timeout',
          message: 'NHATS API request timed out. Please try again later.',
        },
        { status: 504 }
      );
    }

    return handleApiError(error, 'NHATS API');
  }
}
