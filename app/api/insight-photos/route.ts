import { NextRequest, NextResponse } from 'next/server';
import { nasaMediaAPI } from '@/lib/api/nasa-media';
import { NASAAPIError } from '@/lib/types/nasa-api';
import { handleApiError, retryWithBackoff } from '@/lib/api/error-handler';

// Removed edge runtime for Cloudflare compatibility

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Search for InSight-related images with retry logic
    const searchResults = await retryWithBackoff(async () => {
      return await nasaMediaAPI.getMissionContent({
        mission: 'insight',
        mediaType: 'image',
        limit: limit,
        includeAssets: true,
      });
    });

    // If mission-specific search doesn't return enough results, try broader search terms
    let allImages = searchResults;
    if (allImages.length < limit) {
      const additionalSearches = [
        'InSight lander',
        'Elysium Planitia',
        'Mars InSight',
        'InSight seismometer',
        'InSight solar panels',
        'Mars interior exploration',
      ];

      for (const searchTerm of additionalSearches) {
        if (allImages.length >= limit) break;

        try {
          const additionalResults = await retryWithBackoff(async () => {
            return await nasaMediaAPI.searchMedia({
              q: searchTerm,
              media_type: 'image',
              page_size: Math.max(10, limit - allImages.length),
              includeAssets: true,
            });
          });

          // Filter out duplicates based on NASA ID
          const existingIds = new Set(allImages.map((img) => img.id));
          const newImages = additionalResults.items.filter((img) => !existingIds.has(img.id));
          allImages = [...allImages, ...newImages];
        } catch (error) {
          // console.warn(`Failed to search for "${searchTerm}":`, error);
        }
      }
    }

    // Sort by date (newest first) and paginate
    const sortedImages = allImages
      .sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
      .slice((page - 1) * limit, page * limit);

    // Transform data for the frontend component
    const transformedImages = sortedImages.map((image) => ({
      id: image.id,
      title: image.title,
      description: image.description,
      date_created: image.dateCreated,
      keywords: image.keywords,
      center: image.center,
      photographer: image.photographer,
      location: image.location,
      // Use the best available image URL
      image_url:
        image.assets.large ||
        image.assets.medium ||
        image.assets.original ||
        image.assets.small ||
        image.links.preview ||
        '',
      // Provide thumbnail for faster loading
      thumbnail_url:
        image.assets.small ||
        image.assets.medium ||
        image.links.preview ||
        image.assets.large ||
        '',
      nasa_id: image.id,
      media_type: image.mediaType,
      assets: {
        preview: image.assets.preview,
        small: image.assets.small,
        medium: image.assets.medium,
        large: image.assets.large,
        original: image.assets.original,
      },
    }));

    return NextResponse.json({
      success: true,
      data: {
        photos: transformedImages,
        total: allImages.length,
        page: page,
        limit: limit,
        hasMore: allImages.length >= limit,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    // console.error('Error fetching InSight photos:', error);

    // Handle NASA API errors specifically, then fall back to centralized handling
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
    return handleApiError(error, 'InSight Photos API');
  }
}

// Optional: Add caching headers
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600', // 30min cache, 1hr stale
    },
  });
}
