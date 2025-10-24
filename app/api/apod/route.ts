import { NextRequest, NextResponse } from 'next/server';
import { getApiKey } from '@/lib/api/config';
import { handleApiError } from '@/lib/api/error-handler';
import { NASAAPIError } from '@/lib/types/nasa-api';

/**
 * GET /api/apod
 * Returns NASA's Astronomy Picture of the Day
 *
 * Query Parameters:
 * - date: YYYY-MM-DD format (optional, defaults to today)
 * - count: Random number of images (optional, 1-100)
 * - start_date: YYYY-MM-DD format (optional)
 * - end_date: YYYY-MM-DD format (optional)
 * - thumbs: Return thumbnail URL for videos (optional, boolean)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const count = searchParams.get('count');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const thumbs = searchParams.get('thumbs') === 'true';

    // Build NASA API URL
    const apiKey = getApiKey();
    const baseUrl = 'https://api.nasa.gov/planetary/apod';
    const params = new URLSearchParams({ api_key: apiKey });

    if (date) params.append('date', date);
    if (count) params.append('count', count);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (thumbs) params.append('thumbs', 'true');

    const url = `${baseUrl}?${params.toString()}`;

    // Fetch from NASA API
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new NASAAPIError(
        `APOD API Error: ${response.status} ${response.statusText} - ${errorText}`,
        response.status,
        '/planetary/apod'
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching APOD:', error);

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
    return handleApiError(error, 'APOD API');
  }
}

// Cache configuration - APOD changes daily
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      // Cache for 12 hours with 6 hour stale-while-revalidate
      // APOD updates once per day at midnight UTC
      'Cache-Control': 'public, s-maxage=43200, stale-while-revalidate=21600',
    },
  });
}
