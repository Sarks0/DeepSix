import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, withTimeout } from '@/lib/api/error-handler';

export const runtime = 'edge';

interface MissionDesignResponse {
  signature: {
    version: string;
    source: string;
  };
  object?: {
    des: string;
    fullname: string;
    spkid: string;
    class: string;
    data_arc?: string;
  };
  missions?: Mission[];
  count?: string;
}

interface Mission {
  cd: string; // Launch date (calendar)
  ca: string; // Arrival date (calendar)
  mjd0: number; // Launch MJD
  mjdf: number; // Arrival MJD
  tof: number; // Time of flight (days)
  vinf: number; // Launch V-infinity (km/s)
  c3: number; // Launch energy (km²/s²)
  dv: number; // Delta-V (km/s)
  phase: number; // Phase angle at arrival (degrees)
  dist: number; // Earth distance at arrival (AU)
  elong: number; // Solar elongation (degrees)
  dec: number; // Declination (degrees)
  approach: number; // Approach angle (degrees)
  // Enriched properties
  launchDate?: string;
  arrivalDate?: string;
  durationDays?: number;
  durationYears?: string;
  launchVelocity?: number;
  launchEnergy?: number;
  totalDeltaV?: number;
  missionComplexity?: string;
  launchWindow?: string;
}

/**
 * GET /api/asteroids/mission-design
 * Provides small-body mission design calculations from NASA JPL
 *
 * Query Parameters:
 * Mode Q (Query - specific object):
 * - des: Object designation (e.g., "2012 TC4")
 * - spk: SPK-ID (e.g., 2000433)
 * - sstr: Search string
 *
 * Mode A (Accessible - list of accessible bodies):
 * - mode: Set to "accessible"
 * - crit: Sorting criterion (1-6, default: 1)
 *   1 = min departure V-infinity
 *   2 = min arrival V-infinity
 *   3 = min total delta-V
 *   4 = min time of flight
 *   5 = min stay time
 *   6 = min (time of flight + delta-V)
 * - lim: Results limit (default: 50, max: 200)
 * - year: Launch year or range (e.g., "2025" or "2025-2030")
 *
 * Returns mission trajectory data including:
 * - Launch and arrival dates
 * - V-infinity (departure speed relative to Earth)
 * - Delta-V requirements
 * - Time of flight
 * - Geometric parameters (phase angle, elongation, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Determine mode
    const mode = searchParams.get('mode');
    const des = searchParams.get('des');
    const spk = searchParams.get('spk');
    const sstr = searchParams.get('sstr');

    // Build query string based on mode
    const queryParams = new URLSearchParams();

    if (mode === 'accessible') {
      // Mode A: Accessible bodies
      const crit = searchParams.get('crit') || '1';
      const lim = searchParams.get('lim') || '50';
      const year = searchParams.get('year') || new Date().getFullYear().toString();

      queryParams.append('crit', crit);
      queryParams.append('lim', lim);
      queryParams.append('year', year);
    } else {
      // Mode Q: Specific object query
      if (!des && !spk && !sstr) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing Required Parameter',
            message: 'Please provide des, spk, or sstr parameter for object identification, or use mode=accessible for accessible bodies list.',
          },
          { status: 400 }
        );
      }

      if (des) queryParams.append('des', des);
      if (spk) queryParams.append('spk', spk);
      if (sstr) queryParams.append('sstr', sstr);
    }

    const missionUrl = `https://ssd-api.jpl.nasa.gov/mdesign.api?${queryParams.toString()}`;

    const fetchMissionData = async (): Promise<MissionDesignResponse> => {
      const response = await fetch(missionUrl, {
        headers: {
          'User-Agent': 'DeepSix-Asteroid-Tracker',
        },
      });

      if (!response.ok) {
        throw new Error(`Mission Design API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as MissionDesignResponse;
    };

    // Wrap in timeout (20 seconds - trajectory calculations can be complex)
    const missionData = await withTimeout(fetchMissionData(), 20000);

    // Handle potential warnings or errors in response
    if ('message' in missionData && typeof missionData.message === 'string') {
      if (missionData.message.includes('not found') || missionData.message.includes('no matches')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Object Not Found',
            message: 'No mission design data available for this object. It may not be in the database or may not have computed missions.',
          },
          { status: 404 }
        );
      }
    }

    // Parse accessible mode response (fields + data arrays)
    let missions: Mission[] = [];
    if ('fields' in missionData && 'data' in missionData && Array.isArray(missionData.data)) {
      const fieldIndices: { [key: string]: number } = {};
      (missionData.fields as string[]).forEach((field, index) => {
        fieldIndices[field] = index;
      });

      missions = (missionData.data as (string | number)[][]).map((record) => ({
        cd: record[fieldIndices['date0']] as string,
        ca: record[fieldIndices['datef']] as string,
        mjd0: record[fieldIndices['MJD0']] as number,
        mjdf: record[fieldIndices['MJDF']] as number,
        tof: record[fieldIndices['tof']] as number,
        vinf: record[fieldIndices['vinf_dep']] as number,
        c3: record[fieldIndices['c3_dep']] as number,
        dv: record[fieldIndices['dv_tot']] as number,
        phase: 0, // Not provided in accessible mode
        dist: 0, // Not provided in accessible mode
        elong: 0, // Not provided in accessible mode
        dec: 0, // Not provided in accessible mode
        approach: 0, // Not provided in accessible mode
        launchDate: record[fieldIndices['date0']] as string,
        arrivalDate: record[fieldIndices['datef']] as string,
        durationDays: record[fieldIndices['tof']] as number,
        durationYears: ((record[fieldIndices['tof']] as number) / 365.25).toFixed(2),
        launchVelocity: record[fieldIndices['vinf_dep']] as number,
        launchEnergy: record[fieldIndices['c3_dep']] as number,
        totalDeltaV: record[fieldIndices['dv_tot']] as number,
        missionComplexity: getMissionComplexity(record[fieldIndices['dv_tot']] as number, record[fieldIndices['tof']] as number),
        launchWindow: getSeasonFromDate(record[fieldIndices['date0']] as string),
      }));
    }

    // Enrich mission data with human-readable information (for mode Q)
    const enrichedMissions = missionData.missions?.map((mission) => ({
      ...mission,
      launchDate: mission.cd,
      arrivalDate: mission.ca,
      durationDays: mission.tof,
      durationYears: (mission.tof / 365.25).toFixed(2),
      launchVelocity: mission.vinf,
      launchEnergy: mission.c3,
      totalDeltaV: mission.dv,
      missionComplexity: getMissionComplexity(mission.dv, mission.tof),
      launchWindow: getSeasonFromDate(mission.cd),
    }));

    // Use parsed missions from accessible mode, or enriched missions from mode Q
    const finalMissions = missions.length > 0 ? missions : (enrichedMissions || []);

    return NextResponse.json({
      success: true,
      dataSource: 'NASA JPL Mission Design API',
      timestamp: new Date().toISOString(),
      version: missionData.signature?.version,
      mode: mode === 'accessible' ? 'Accessible Bodies' : 'Object Query',
      object: missionData.object ? {
        designation: missionData.object.des,
        fullName: missionData.object.fullname,
        spkId: missionData.object.spkid,
        orbitClass: missionData.object.class,
        dataArc: missionData.object.data_arc,
      } : null,
      totalMissions: missionData.count ? parseInt(missionData.count) : finalMissions.length,
      missions: finalMissions,
      summary: finalMissions.length > 0 ? {
        lowestDeltaV: Math.min(...finalMissions.map(m => m.totalDeltaV || m.dv)),
        shortestDuration: Math.min(...finalMissions.map(m => m.durationDays || m.tof)),
        earliestLaunch: finalMissions[0].launchDate || finalMissions[0].cd,
      } : null,
    });

  } catch (error) {
    // Fallback response for errors
    if (error instanceof Error && error.message.includes('timed out')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request Timeout',
          message: 'Mission Design API request timed out. These calculations can take a while. Please try again.',
          dataSource: 'NASA JPL Mission Design API',
          timestamp: new Date().toISOString(),
          missions: [],
        },
        { status: 504 }
      );
    }

    return handleApiError(error, 'Mission Design API');
  }
}

/**
 * Determine mission complexity based on delta-V and duration
 */
function getMissionComplexity(deltaV: number, durationDays: number): string {
  const durationYears = durationDays / 365.25;

  // Simple heuristic for mission complexity
  if (deltaV < 8 && durationYears < 1.5) return 'Easy';
  if (deltaV < 10 && durationYears < 2) return 'Moderate';
  if (deltaV < 12 && durationYears < 3) return 'Challenging';
  return 'Very Difficult';
}

/**
 * Get season from date string
 */
function getSeasonFromDate(dateString: string): string {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;

  if (month >= 3 && month <= 5) return 'Spring';
  if (month >= 6 && month <= 8) return 'Summer';
  if (month >= 9 && month <= 11) return 'Fall';
  return 'Winter';
}
