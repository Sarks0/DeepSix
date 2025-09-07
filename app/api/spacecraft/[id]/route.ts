import { NextRequest, NextResponse } from 'next/server';
import { getSpacecraftPosition, calculateCommunicationDelay } from '@/lib/api/spacecraft-positions';
import {
  handleApiError,
  FALLBACK_DATA,
  validateSpacecraftId,
  getAvailableSpacecraftIds,
  withTimeout,
} from '@/lib/api/error-handler';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params for Next.js compatibility
    const resolvedParams = await params;

    // Input validation
    if (!resolvedParams || !resolvedParams.id) {
      return NextResponse.json(
        {
          error: 'Invalid Request',
          message: 'Spacecraft ID is required',
          availableSpacecraft: getAvailableSpacecraftIds(),
          success: false,
        },
        { status: 400 }
      );
    }

    const validation = validateSpacecraftId(resolvedParams.id);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Invalid Spacecraft ID',
          message: validation.error,
          availableSpacecraft: getAvailableSpacecraftIds(),
          success: false,
        },
        { status: 400 }
      );
    }

    const spacecraftId = resolvedParams.id.toLowerCase().trim();

    // Wrap spacecraft data retrieval in timeout
    const positionData = await withTimeout(
      Promise.resolve(getSpacecraftPosition(spacecraftId)),
      5000 // 5 second timeout for individual spacecraft
    );

    if (!positionData) {
      // Check if we have fallback data for this spacecraft
      const fallbackData =
        FALLBACK_DATA.spacecraft[spacecraftId as keyof typeof FALLBACK_DATA.spacecraft];
      if (fallbackData) {
        return NextResponse.json(
          {
            ...fallbackData,
            distanceFromEarth: fallbackData.distance.km,
            distanceFromSun: fallbackData.distance.km * 1.05,
            success: false,
          },
          { status: 503 }
        );
      }

      // Spacecraft ID not found in our data
      return NextResponse.json(
        {
          error: 'Spacecraft Not Found',
          message: `Spacecraft '${spacecraftId}' is not currently tracked in our system.`,
          availableSpacecraft: getAvailableSpacecraftIds(),
          success: false,
        },
        { status: 404 }
      );
    }

    // Safe calculation of round trip communication delay
    const calculateSafeRoundTrip = (lightTime: string, au: number): string => {
      try {
        // First try using calculateCommunicationDelay function
        const calculated = calculateCommunicationDelay(au * 2);
        if (calculated && calculated !== 'Unknown') {
          return calculated;
        }

        // Fallback to manual parsing
        if (lightTime.includes('hours')) {
          const hours = parseFloat(lightTime.replace(/[^\d.]/g, ''));
          if (!isNaN(hours)) {
            return `${(hours * 2).toFixed(2)} hours`;
          }
        } else if (lightTime.includes('minutes')) {
          const minutes = parseFloat(lightTime.replace(/[^\d.]/g, ''));
          if (!isNaN(minutes)) {
            return `${(minutes * 2).toFixed(0)} minutes`;
          }
        }
        return 'Unable to calculate';
      } catch {
        return 'Unable to calculate';
      }
    };

    // Format response for compatibility with existing code
    const response = {
      id: spacecraftId,
      name: positionData.name || spacecraftId.replace('-', ' ').toUpperCase(),
      timestamp: positionData.lastUpdate || new Date().toISOString(),
      position: positionData.position || { x: 0, y: 0, z: 0 },
      distance: positionData.distance || { km: 0, au: 0, lightTime: 'Unknown' },
      velocity: positionData.velocity || { kms: 0, kmh: 0 },
      coordinates: positionData.coordinates || { lat: 0, lon: 0 },
      distanceFromEarth: positionData.distance?.km || 0,
      distanceFromSun: (positionData.distance?.km || 0) * 1.05, // Approximate
      communicationDelay: {
        oneWay: positionData.distance?.lightTime || 'Unknown',
        roundTrip: calculateSafeRoundTrip(
          positionData.distance?.lightTime || 'Unknown',
          positionData.distance?.au || 0
        ),
        formatted: {
          oneWay: positionData.distance?.lightTime || 'Unknown',
          roundTrip: calculateSafeRoundTrip(
            positionData.distance?.lightTime || 'Unknown',
            positionData.distance?.au || 0
          ),
        },
      },
      dataSource: positionData.dataSource || 'Unknown',
      _realData: true,
      success: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    // Handle timeout errors specifically
    if (error instanceof Error && error.message.includes('timed out')) {
      try {
        const resolvedParams = await params;
        const fallbackData =
          FALLBACK_DATA.spacecraft[
            resolvedParams.id?.toLowerCase() as keyof typeof FALLBACK_DATA.spacecraft
          ];
        if (fallbackData) {
          return NextResponse.json(
            {
              ...fallbackData,
              distanceFromEarth: fallbackData.distance.km,
              distanceFromSun: fallbackData.distance.km * 1.05,
              error: 'Request Timeout',
              message: 'Request timed out, showing cached data',
              success: false,
            },
            { status: 504 }
          );
        }
      } catch {
        // If we can't resolve params, continue to general error handling
      }
    }

    // Use centralized error handling
    let errorContext = 'Spacecraft API - unknown';
    try {
      const resolvedParams = await params;
      errorContext = `Spacecraft API - ${resolvedParams?.id || 'unknown'}`;
    } catch {
      // Use default context if params can't be resolved
    }
    return handleApiError(error, errorContext);
  }
}
