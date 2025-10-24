import { NextRequest, NextResponse } from 'next/server';
import { getApiKey } from '@/lib/api/config';
import { handleApiError, withTimeout } from '@/lib/api/error-handler';

export const runtime = 'edge';

interface CloseApproachData {
  close_approach_date: string;
  close_approach_date_full: string;
  relative_velocity: {
    kilometers_per_second: string;
    kilometers_per_hour: string;
    miles_per_hour: string;
  };
  miss_distance: {
    astronomical: string;
    lunar: string;
    kilometers: string;
    miles: string;
  };
  orbiting_body: string;
}

interface NeoWsObject {
  id: string;
  name: string;
  absolute_magnitude_h: number;
  estimated_diameter: {
    kilometers: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
    meters: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: CloseApproachData[];
  nasa_jpl_url: string;
}

interface NeoWsResponse {
  links: {
    next?: string;
    prev?: string;
    self: string;
  };
  element_count: number;
  near_earth_objects: {
    [date: string]: NeoWsObject[];
  };
}

/**
 * GET /api/asteroids/neows
 * Fetches near-Earth asteroid close approach data from NASA NeoWs API
 *
 * Query parameters:
 * - start_date: YYYY-MM-DD format (optional, defaults to today)
 * - end_date: YYYY-MM-DD format (optional, defaults to +7 days)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Date handling: default to today and +7 days
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const startDate = searchParams.get('start_date') || today.toISOString().split('T')[0];
    const endDate = searchParams.get('end_date') || nextWeek.toISOString().split('T')[0];

    // Build NASA NeoWs API URL
    const apiKey = getApiKey();
    const baseUrl = 'https://api.nasa.gov/neo/rest/v1/feed';
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      api_key: apiKey,
    });

    const url = `${baseUrl}?${params.toString()}`;

    const fetchNeoWsData = async (): Promise<NeoWsResponse> => {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'DeepSix-Asteroid-Tracker',
        },
      });

      if (!response.ok) {
        throw new Error(`NeoWs API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as NeoWsResponse;
    };

    // Wrap in timeout (10 seconds)
    const neowsData = await withTimeout(fetchNeoWsData(), 10000);

    // Flatten and enrich the data
    const allAsteroids: any[] = [];
    Object.entries(neowsData.near_earth_objects).forEach(([date, asteroids]) => {
      asteroids.forEach((asteroid) => {
        const approach = asteroid.close_approach_data[0]; // Get first/closest approach

        allAsteroids.push({
          id: asteroid.id,
          name: asteroid.name,
          absoluteMagnitude: asteroid.absolute_magnitude_h,
          diameterKm: {
            min: asteroid.estimated_diameter.kilometers.estimated_diameter_min,
            max: asteroid.estimated_diameter.kilometers.estimated_diameter_max,
            avg: (asteroid.estimated_diameter.kilometers.estimated_diameter_min +
                  asteroid.estimated_diameter.kilometers.estimated_diameter_max) / 2,
          },
          diameterMeters: {
            min: Math.round(asteroid.estimated_diameter.meters.estimated_diameter_min),
            max: Math.round(asteroid.estimated_diameter.meters.estimated_diameter_max),
            avg: Math.round((asteroid.estimated_diameter.meters.estimated_diameter_min +
                             asteroid.estimated_diameter.meters.estimated_diameter_max) / 2),
          },
          isPotentiallyHazardous: asteroid.is_potentially_hazardous_asteroid,
          closeApproachDate: approach.close_approach_date,
          closeApproachDateFull: approach.close_approach_date_full,
          relativeVelocity: {
            kmPerSecond: parseFloat(approach.relative_velocity.kilometers_per_second),
            kmPerHour: parseFloat(approach.relative_velocity.kilometers_per_hour),
          },
          missDistance: {
            astronomical: parseFloat(approach.miss_distance.astronomical),
            lunar: parseFloat(approach.miss_distance.lunar),
            kilometers: parseFloat(approach.miss_distance.kilometers),
          },
          // Calculate size category
          sizeCategory: asteroid.estimated_diameter.meters.estimated_diameter_max > 1000 ? 'Very Large' :
                        asteroid.estimated_diameter.meters.estimated_diameter_max > 500 ? 'Large' :
                        asteroid.estimated_diameter.meters.estimated_diameter_max > 100 ? 'Medium' :
                        asteroid.estimated_diameter.meters.estimated_diameter_max > 25 ? 'Small' : 'Very Small',
          // Hazard indicator
          hazardLevel: asteroid.is_potentially_hazardous_asteroid ? 'Potentially Hazardous' : 'Safe',
          hazardColor: asteroid.is_potentially_hazardous_asteroid ? 'orange' : 'green',
          nasaJplUrl: asteroid.nasa_jpl_url,
        });
      });
    });

    // Sort by close approach date, then by distance
    const sortedAsteroids = allAsteroids.sort((a, b) => {
      const dateCompare = new Date(a.closeApproachDate).getTime() - new Date(b.closeApproachDate).getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.missDistance.kilometers - b.missDistance.kilometers;
    });

    return NextResponse.json({
      success: true,
      dataSource: 'NASA NeoWs API',
      timestamp: new Date().toISOString(),
      dateRange: {
        start: startDate,
        end: endDate,
      },
      totalCount: neowsData.element_count,
      asteroids: sortedAsteroids,
      summary: {
        total: neowsData.element_count,
        potentiallyHazardous: sortedAsteroids.filter(a => a.isPotentiallyHazardous).length,
        safe: sortedAsteroids.filter(a => !a.isPotentiallyHazardous).length,
        closestApproach: sortedAsteroids[0] || null,
        largestDiameter: Math.max(...sortedAsteroids.map(a => a.diameterMeters.max)),
      },
    });

  } catch (error) {
    // Fallback data in case API fails
    if (error instanceof Error && error.message.includes('timed out')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request Timeout',
          message: 'NeoWs API request timed out. Please try again later.',
          dataSource: 'Fallback Data',
          timestamp: new Date().toISOString(),
          totalCount: 0,
          asteroids: [],
          summary: {
            total: 0,
            potentiallyHazardous: 0,
            safe: 0,
            closestApproach: null,
            largestDiameter: 0,
          },
        },
        { status: 504 }
      );
    }

    return handleApiError(error, 'NeoWs API');
  }
}
