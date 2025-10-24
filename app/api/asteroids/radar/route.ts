import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, withTimeout } from '@/lib/api/error-handler';

export const runtime = 'edge';

interface RadarResponse {
  signature: {
    version: string;
    source: string;
  };
  count: string;
  fields: string[];
  data: (string | number | null)[][];
  coords?: {
    [key: string]: {
      lon: number;
      lat: number;
      alt: number;
    };
  };
}

interface RadarObservation {
  designation: string;
  epoch: string;
  value: number;
  sigma: number;
  units: string;
  frequency: number;
  receiver: number;
  transmitter: number;
  bouncePoint: string;
  fullName?: string;
  observer?: string;
  notes?: string;
  reference?: string;
  modified?: string;
}

/**
 * GET /api/asteroids/radar
 * Fetches radar astrometry data for small bodies from NASA JPL
 *
 * Query Parameters:
 * - des: Object designation (e.g., "433", "2004 VB")
 * - spk: SPK-ID (e.g., 2000433)
 * - kind: Object type filter (a=asteroid, c=comet, etc.)
 * - fullname: Include full object names
 * - observer: Include observer names
 * - notes: Include measurement notes
 * - ref: Include publication references
 * - coords: Include station coordinates
 *
 * Radar data includes delay/Doppler measurements used for:
 * - Precise shape models
 * - Rotation rates
 * - Surface characteristics
 * - Binary asteroid detection
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const des = searchParams.get('des');
    const spk = searchParams.get('spk');
    const kind = searchParams.get('kind');
    const fullname = searchParams.get('fullname') === 'true';
    const observer = searchParams.get('observer') === 'true';
    const notes = searchParams.get('notes') === 'true';
    const ref = searchParams.get('ref') === 'true';
    const coords = searchParams.get('coords') === 'true';

    // Build query string
    const queryParams = new URLSearchParams();
    if (des) queryParams.append('des', des);
    if (spk) queryParams.append('spk', spk);
    if (kind) queryParams.append('kind', kind);
    if (fullname) queryParams.append('fullname', '1');
    if (observer) queryParams.append('observer', '1');
    if (notes) queryParams.append('notes', '1');
    if (ref) queryParams.append('ref', '1');
    if (coords) queryParams.append('coords', '1');

    const radarUrl = `https://ssd-api.jpl.nasa.gov/sb_radar.api${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const fetchRadarData = async (): Promise<RadarResponse> => {
      const response = await fetch(radarUrl, {
        headers: {
          'User-Agent': 'DeepSix-Asteroid-Tracker',
        },
      });

      if (!response.ok) {
        throw new Error(`Radar API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as RadarResponse;
    };

    // Wrap in timeout (15 seconds - radar data can be large)
    const radarData = await withTimeout(fetchRadarData(), 15000);

    // Transform array-based data into structured objects
    const fieldIndices: { [key: string]: number } = {};
    radarData.fields.forEach((field, index) => {
      fieldIndices[field] = index;
    });

    const observations: RadarObservation[] = radarData.data.map((record) => {
      const obs: RadarObservation = {
        designation: record[fieldIndices['des']] as string,
        epoch: record[fieldIndices['epoch']] as string,
        value: record[fieldIndices['value']] as number,
        sigma: record[fieldIndices['sigma']] as number,
        units: record[fieldIndices['units']] as string,
        frequency: record[fieldIndices['freq']] as number,
        receiver: record[fieldIndices['rcvr']] as number,
        transmitter: record[fieldIndices['xmit']] as number,
        bouncePoint: record[fieldIndices['bp']] as string,
      };

      // Add optional fields if present
      if (fieldIndices['fullname'] !== undefined) {
        obs.fullName = record[fieldIndices['fullname']] as string;
      }
      if (fieldIndices['observer'] !== undefined) {
        obs.observer = record[fieldIndices['observer']] as string;
      }
      if (fieldIndices['notes'] !== undefined) {
        obs.notes = record[fieldIndices['notes']] as string;
      }
      if (fieldIndices['ref'] !== undefined) {
        obs.reference = record[fieldIndices['ref']] as string;
      }
      if (fieldIndices['modified'] !== undefined) {
        obs.modified = record[fieldIndices['modified']] as string;
      }

      return obs;
    });

    // Get station names for readability
    const getStationName = (code: number): string => {
      const stations: { [key: number]: string } = {
        '-1': 'Arecibo',
        '-2': 'Haystack',
        '-9': 'Green Bank',
        '-13': 'Goldstone DSS-13',
        '-14': 'Goldstone DSS-14',
        '-25': 'Goldstone DSS-25',
        '-38': 'Evpatoria',
        '-73': 'EISCAT Tromso',
      };
      return stations[code] || `Station ${code}`;
    };

    // Enrich observations with human-readable station names
    const enrichedObservations = observations.map((obs) => ({
      ...obs,
      receiverName: getStationName(obs.receiver),
      transmitterName: getStationName(obs.transmitter),
      measurementType: obs.units === 'us' ? 'Delay (Time)' : 'Doppler (Frequency)',
    }));

    // Group by object if multiple objects returned
    const objectGroups: { [key: string]: typeof enrichedObservations } = {};
    enrichedObservations.forEach((obs) => {
      const key = obs.fullName || obs.designation;
      if (!objectGroups[key]) {
        objectGroups[key] = [];
      }
      objectGroups[key].push(obs);
    });

    return NextResponse.json({
      success: true,
      dataSource: 'NASA JPL SB Radar API',
      timestamp: new Date().toISOString(),
      version: radarData.signature.version,
      totalObservations: parseInt(radarData.count),
      objects: Object.keys(objectGroups).length,
      observations: enrichedObservations,
      groupedByObject: objectGroups,
      stationCoordinates: radarData.coords || null,
      query: {
        designation: des,
        spkId: spk,
        kind: kind,
      },
    });

  } catch (error) {
    // Fallback response for errors
    if (error instanceof Error && error.message.includes('timed out')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request Timeout',
          message: 'Radar API request timed out. Please try again later.',
          dataSource: 'NASA JPL SB Radar API',
          timestamp: new Date().toISOString(),
          totalObservations: 0,
          observations: [],
        },
        { status: 504 }
      );
    }

    return handleApiError(error, 'SB Radar API');
  }
}
