import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, withTimeout } from '@/lib/api/error-handler';

export const runtime = 'edge';

interface FireballResponse {
  signature: {
    version: string;
    source: string;
  };
  count: string;
  fields: string[];
  data: (string | null)[][];
}

/**
 * GET /api/asteroids/fireball
 * Fetches fireball (meteor) detection data from NASA's Fireball API
 *
 * Fireballs are bright meteors detected by U.S. Government sensors
 * and NOAA GOES satellite lightning mappers as they enter Earth's atmosphere.
 *
 * Query parameters:
 * - limit: Number of results (default 50)
 * - date-min: Start date YYYY-MM-DD (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') || '50';
    const dateMin = searchParams.get('date-min');

    // Build Fireball API URL
    let fireballUrl = `https://ssd-api.jpl.nasa.gov/fireball.api?limit=${limit}`;
    if (dateMin) {
      fireballUrl += `&date-min=${dateMin}`;
    }

    const fetchFireballData = async (): Promise<FireballResponse> => {
      const response = await fetch(fireballUrl, {
        headers: {
          'User-Agent': 'DeepSix-Asteroid-Tracker',
        },
      });

      if (!response.ok) {
        throw new Error(`Fireball API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as FireballResponse;
    };

    // Wrap in timeout (10 seconds)
    const fireballData = await withTimeout(fetchFireballData(), 10000);

    // Transform the array data into structured objects
    const enrichedData = fireballData.data.map((row) => {
      // Parse coordinates with direction
      const latValue = parseFloat(row[3] || '0');
      const latDir = row[4] || 'N';
      const lonValue = parseFloat(row[5] || '0');
      const lonDir = row[6] || 'E';

      // Convert to standard lat/lon (-90 to 90, -180 to 180)
      const latitude = latDir === 'S' ? -latValue : latValue;
      const longitude = lonDir === 'W' ? -lonValue : lonValue;

      const energy = parseFloat(row[1] || '0');
      const altitude = row[7] ? parseFloat(row[7]) : null;
      const velocity = row[8] ? parseFloat(row[8]) : null;

      return {
        date: row[0],
        energy, // kilotons TNT equivalent
        impactEnergy: row[2] ? parseFloat(row[2]) : null,
        latitude,
        longitude,
        altitude, // km
        velocity, // km/s
        // Calculate size category based on energy
        sizeCategory: energy > 50 ? 'Large' :
                      energy > 10 ? 'Medium' :
                      energy > 1 ? 'Small' : 'Very Small',
        // Energy comparison
        energyComparison: energy > 15 ? 'Hiroshima-scale' :
                          energy > 5 ? 'Large explosion' :
                          energy > 1 ? 'Small explosion' : 'Minor event',
        // Calculate estimated diameter (very rough estimate)
        estimatedDiameter: Math.round(Math.pow(energy, 1/3) * 2), // meters
      };
    });

    // Sort by date (most recent first)
    const sortedData = enrichedData.sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // Calculate statistics
    const totalEnergy = sortedData.reduce((sum, f) => sum + f.energy, 0);
    const largestImpact = sortedData.reduce((max, f) =>
      f.energy > max.energy ? f : max
    , sortedData[0]);

    return NextResponse.json({
      success: true,
      dataSource: 'NASA Fireball Detection System (CNEOS)',
      timestamp: new Date().toISOString(),
      count: parseInt(fireballData.count),
      fireballs: sortedData,
      summary: {
        total: parseInt(fireballData.count),
        totalEnergy: Math.round(totalEnergy * 10) / 10, // kilotons
        largestImpact: {
          date: largestImpact.date,
          energy: largestImpact.energy,
          location: `${Math.abs(largestImpact.latitude).toFixed(1)}°${largestImpact.latitude >= 0 ? 'N' : 'S'}, ${Math.abs(largestImpact.longitude).toFixed(1)}°${largestImpact.longitude >= 0 ? 'E' : 'W'}`,
        },
        large: sortedData.filter(f => f.sizeCategory === 'Large').length,
        medium: sortedData.filter(f => f.sizeCategory === 'Medium').length,
        small: sortedData.filter(f => f.sizeCategory === 'Small').length,
      },
    });

  } catch (error) {
    // Fallback data in case API fails
    if (error instanceof Error && error.message.includes('timed out')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request Timeout',
          message: 'Fireball API request timed out. Please try again later.',
          dataSource: 'Fallback Data',
          timestamp: new Date().toISOString(),
          count: 0,
          fireballs: [],
          summary: {
            total: 0,
            totalEnergy: 0,
            largestImpact: null,
            large: 0,
            medium: 0,
            small: 0,
          },
        },
        { status: 504 }
      );
    }

    return handleApiError(error, 'Fireball API');
  }
}
