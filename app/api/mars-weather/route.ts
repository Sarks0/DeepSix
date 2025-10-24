import { NextRequest, NextResponse } from 'next/server';
import { marsWeatherAPI } from '@/lib/api/mars-weather';
import { handleApiError } from '@/lib/api/error-handler';
import { NASAAPIError } from '@/lib/types/nasa-api';

/**
 * GET /api/mars-weather
 * Returns Mars weather data from InSight lander (historical data)
 *
 * Note: InSight mission ended December 2022, this returns historical data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '7');
    const sol = searchParams.get('sol');

    // If requesting a specific sol
    if (sol) {
      const solData = await marsWeatherAPI.getWeatherForSol(sol);

      if (!solData) {
        return NextResponse.json(
          {
            success: false,
            error: 'Sol not found',
            message: `No weather data available for sol ${sol}`,
            timestamp: new Date().toISOString(),
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          sol: sol,
          weather: solData,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Get recent sols
    const recentSols = await marsWeatherAPI.getRecentSols(limit);

    // Get processed weather data
    const weatherData = await marsWeatherAPI.getLatestWeather();
    const processedData = marsWeatherAPI.processWeatherData(weatherData);

    // Get statistics
    let stats = null;
    try {
      stats = await marsWeatherAPI.getWeatherStats();
    } catch (error) {
      // Stats are optional, don't fail the request
      console.warn('Failed to fetch weather stats:', error);
    }

    return NextResponse.json({
      success: true,
      data: {
        recentSols: processedData.slice(0, limit),
        rawSols: recentSols,
        statistics: stats,
        missionInfo: marsWeatherAPI.getSolToEarthDateInfo(),
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error fetching Mars weather:', error);

    // Handle NASA API errors specifically
    if (error instanceof NASAAPIError) {
      return NextResponse.json(
        {
          success: false,
          error: 'NASA API Error',
          message: error.message,
          status: error.statusCode,
          timestamp: new Date().toISOString(),
        },
        { status: error.statusCode || 500 }
      );
    }

    // Use centralized error handling for other errors
    return handleApiError(error, 'Mars Weather API');
  }
}

// Cache configuration
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800', // 1hr cache, 30min stale
    },
  });
}
