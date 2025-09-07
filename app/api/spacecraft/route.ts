import { NextResponse } from 'next/server';
import { getSpacecraftPosition } from '@/lib/api/spacecraft-positions';
import { handleApiError, FALLBACK_DATA, withTimeout } from '@/lib/api/error-handler';

const SPACECRAFT_LIST = ['voyager-1', 'voyager-2', 'new-horizons', 'parker-solar-probe'];

export async function GET() {
  try {
    // Wrap in timeout for Edge Runtime compatibility
    const results = await withTimeout(
      Promise.resolve(
        SPACECRAFT_LIST.map((spacecraftId) => {
          try {
            const positionData = getSpacecraftPosition(spacecraftId);

            if (!positionData) {
              // Return fallback data if position data is unavailable
              const fallbackData =
                FALLBACK_DATA.spacecraft[spacecraftId as keyof typeof FALLBACK_DATA.spacecraft];
              if (fallbackData) {
                return {
                  ...fallbackData,
                  distanceFromEarth: fallbackData.distance.km,
                  distanceFromSun: fallbackData.distance.km * 1.05,
                  success: false,
                };
              }
              return null;
            }

            // Calculate round trip communication delay more reliably
            const calculateRoundTrip = (lightTime: string): string => {
              try {
                if (lightTime.includes('hours')) {
                  const hours = parseFloat(lightTime.replace(' hours', ''));
                  return `${(hours * 2).toFixed(2)} hours`;
                } else if (lightTime.includes('minutes')) {
                  const minutes = parseFloat(lightTime.replace(' minutes', ''));
                  return `${(minutes * 2).toFixed(0)} minutes`;
                }
                return 'Unknown';
              } catch {
                return 'Unknown';
              }
            };

            // Format response for compatibility
            return {
              id: spacecraftId,
              name: positionData.name,
              timestamp: positionData.lastUpdate,
              position: positionData.position,
              distance: positionData.distance,
              velocity: positionData.velocity,
              coordinates: positionData.coordinates,
              distanceFromEarth: positionData.distance.km,
              distanceFromSun: positionData.distance.km * 1.05, // Approximate
              communicationDelay: {
                oneWay: positionData.distance.lightTime,
                roundTrip: calculateRoundTrip(positionData.distance.lightTime),
                formatted: {
                  oneWay: positionData.distance.lightTime,
                  roundTrip: calculateRoundTrip(positionData.distance.lightTime),
                },
              },
              dataSource: positionData.dataSource,
              _realData: true,
              success: true,
            };
          } catch (spacecraftError) {
            // Handle individual spacecraft errors
            const fallbackData =
              FALLBACK_DATA.spacecraft[spacecraftId as keyof typeof FALLBACK_DATA.spacecraft];
            if (fallbackData) {
              return {
                ...fallbackData,
                distanceFromEarth: fallbackData.distance.km,
                distanceFromSun: fallbackData.distance.km * 1.05,
                success: false,
                error: 'Individual spacecraft data unavailable',
              };
            }
            return null;
          }
        })
      ),
      8000 // 8 second timeout
    );

    const validResults = results.filter((r) => r !== null);

    // Ensure we have at least some data
    if (validResults.length === 0) {
      return NextResponse.json(
        {
          error: 'No spacecraft data available',
          message: 'All spacecraft data sources are currently unavailable. Please try again later.',
          spacecraft: [],
          timestamp: new Date().toISOString(),
          count: 0,
          success: false,
        },
        { status: 503 }
      );
    }

    // Sort by distance from Earth (handle potential undefined values)
    validResults.sort((a, b) => {
      const aDistance = a.distanceFromEarth || 0;
      const bDistance = b.distanceFromEarth || 0;
      return aDistance - bDistance;
    });

    return NextResponse.json({
      spacecraft: validResults,
      timestamp: new Date().toISOString(),
      count: validResults.length,
      success: true,
    });
  } catch (error) {
    // Use centralized error handling
    return handleApiError(error, 'Spacecraft List API');
  }
}
