import { NextRequest, NextResponse } from 'next/server';
import { getApiKey } from '@/lib/api/config';
import { calculateSol, formatSolDisplay, getSolMilestone } from '@/lib/utils/mars-sol';

type RoverName = 'perseverance' | 'curiosity' | 'opportunity' | 'spirit';

// Server-side cache with aggressive TTL to conserve API calls
// Cache for 6 hours to dramatically reduce NASA API usage
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
const serverCache = new Map<string, { data: any; timestamp: number; expiresAt: number }>();

// Track API calls to monitor usage
let apiCallCount = 0;
let lastResetTime = Date.now();

function getCacheKey(rover: RoverName, params: URLSearchParams): string {
  const sol = params.get('sol');
  const earthDate = params.get('earth_date');
  const camera = params.get('camera');
  const limit = params.get('limit') || '50';
  const latest = params.get('latest') || 'false';

  return `${rover}-${sol || 'null'}-${earthDate || 'null'}-${camera || 'null'}-${limit}-${latest}`;
}

function getFromCache<T>(key: string): T | null {
  const cached = serverCache.get(key);
  if (!cached) return null;

  const now = Date.now();
  if (now > cached.expiresAt) {
    serverCache.delete(key);
    return null;
  }

  console.log(`✓ Cache HIT for ${key} (expires in ${Math.round((cached.expiresAt - now) / 1000 / 60)} minutes)`);
  return cached.data as T;
}

function setCache<T>(key: string, data: T): void {
  const now = Date.now();
  serverCache.set(key, {
    data,
    timestamp: now,
    expiresAt: now + CACHE_TTL
  });
  console.log(`✓ Cached ${key} for ${CACHE_TTL / 1000 / 60} minutes`);
}

function trackApiCall(): void {
  const now = Date.now();
  // Reset counter every hour
  if (now - lastResetTime > 60 * 60 * 1000) {
    console.log(`📊 API Usage Stats: ${apiCallCount} calls in last hour`);
    apiCallCount = 0;
    lastResetTime = now;
  }
  apiCallCount++;
}

interface RoverPhoto {
  id: number;
  sol: number;
  camera: {
    id: number;
    name: string;
    rover_id: number;
    full_name: string;
  };
  img_src: string;
  earth_date: string;
  rover: {
    id: number;
    name: string;
    landing_date: string;
    launch_date: string;
    status: string;
    max_sol?: number;
    max_date?: string;
    total_photos?: number;
  };
}

// Mars.nasa.gov RSS API interfaces (Perseverance)
interface MarsRSSImage {
  sol: number;
  imageid: string;
  camera: {
    instrument: string;
    filter_name: string;
  };
  image_files: {
    small: string;
    medium: string;
    large: string;
    full_res: string;
  };
  date_taken_utc: string;
  date_taken_mars: string;
  caption?: string;
}

interface MarsRSSResponse {
  images: MarsRSSImage[];
}

// NASA Images API interfaces (Curiosity, Opportunity, Spirit)
interface NASAImageItem {
  href: string;
  data: Array<{
    nasa_id: string;
    title: string;
    description: string;
    date_created: string;
    keywords?: string[];
    media_type: string;
  }>;
  links: Array<{
    href: string;
    rel: string;
    render: string;
  }>;
}

interface NASAImagesResponse {
  collection: {
    items: NASAImageItem[];
  };
}

function isValidRover(rover: string): rover is RoverName {
  return ['perseverance', 'curiosity', 'opportunity', 'spirit'].includes(rover);
}

// Helper function to extract sol number from text
function extractSolFromText(text: string): number {
  const solMatch = text.match(/sol[:\s]+(\d+)/i);
  if (solMatch) {
    return parseInt(solMatch[1], 10);
  }
  // Try date-based estimation for older images
  return 0;
}

// Get rover metadata
function getRoverMetadata(rover: RoverName): {
  id: number;
  name: string;
  landing_date: string;
  launch_date: string;
  status: string;
} {
  const roverData = {
    perseverance: {
      id: 5,
      name: 'Perseverance',
      landing_date: '2021-02-18',
      launch_date: '2020-07-30',
      status: 'active'
    },
    curiosity: {
      id: 5,
      name: 'Curiosity',
      landing_date: '2012-08-06',
      launch_date: '2011-11-26',
      status: 'active'
    },
    opportunity: {
      id: 6,
      name: 'Opportunity',
      landing_date: '2004-01-25',
      launch_date: '2003-07-07',
      status: 'complete'
    },
    spirit: {
      id: 7,
      name: 'Spirit',
      landing_date: '2004-01-04',
      launch_date: '2003-06-10',
      status: 'complete'
    }
  };

  return roverData[rover];
}

/**
 * Fetch latest photos for Perseverance or Curiosity using Mars.nasa.gov RSS API
 * This provides raw rover camera images directly from the mission
 * Perseverance: category=mars2020
 * Curiosity: category=msl (Mars Science Laboratory)
 */
async function fetchRoverPhotosFromRSS(rover: RoverName, limit: number = 50): Promise<RoverPhoto[]> {
  const cacheKey = `${rover}-rss-${limit}`;
  const cached = getFromCache<RoverPhoto[]>(cacheKey);
  if (cached) return cached;

  // Map rover names to RSS API categories
  const categoryMap: Record<string, string> = {
    'perseverance': 'mars2020',
    'curiosity': 'msl'
  };

  const category = categoryMap[rover];
  if (!category) {
    console.log(`No RSS feed available for ${rover}`);
    return [];
  }

  try {
    trackApiCall();
    const url = `https://mars.nasa.gov/rss/api/?feed=raw_images&category=${category}&feedtype=json&num=${limit}`;
    console.log(`🔍 [${rover.toUpperCase()}] Fetching from Mars.nasa.gov RSS API`);
    console.log(`📍 URL: ${url}`);

    const response = await fetch(url);
    console.log(`📡 [${rover.toUpperCase()}] Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      console.error(`❌ [${rover.toUpperCase()}] Mars RSS API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text().catch(() => 'Unable to read error response');
      console.error(`❌ [${rover.toUpperCase()}] Error body:`, errorText.substring(0, 200));
      return [];
    }

    const data: MarsRSSResponse = await response.json();
    console.log(`📊 [${rover.toUpperCase()}] Response received:`, {
      hasImages: !!data.images,
      imageCount: data.images?.length || 0,
      responseKeys: Object.keys(data)
    });

    if (!data.images || data.images.length === 0) {
      console.warn(`⚠️  [${rover.toUpperCase()}] RSS API returned no images`);
      console.log(`📋 [${rover.toUpperCase()}] Full response:`, JSON.stringify(data).substring(0, 500));
      return [];
    }

    const roverMetadata = getRoverMetadata(rover);

    // Transform RSS format to RoverPhoto format
    const photos: RoverPhoto[] = data.images.map((img, index) => ({
      id: parseInt(img.imageid.replace(/[^\d]/g, '').slice(0, 10)) || index,
      sol: img.sol,
      camera: {
        id: index,
        name: img.camera.instrument,
        rover_id: roverMetadata.id,
        full_name: `${img.camera.instrument} - ${img.camera.filter_name}`
      },
      img_src: img.image_files.large || img.image_files.medium,
      earth_date: img.date_taken_utc.split('T')[0],
      rover: roverMetadata
    }));

    console.log(`✅ [${rover.toUpperCase()}] Successfully fetched ${photos.length} photos from RSS API`);
    if (photos.length > 0) {
      console.log(`📸 [${rover.toUpperCase()}] Sample photo: Sol ${photos[0].sol}, Camera: ${photos[0].camera.name}`);
    }

    setCache(cacheKey, photos);
    return photos;
  } catch (error) {
    console.error(`💥 [${rover.toUpperCase()}] Exception fetching from RSS API:`, error);
    console.error(`💥 [${rover.toUpperCase()}] Error details:`, {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack?.substring(0, 300) : undefined
    });
    return [];
  }
}

/**
 * Fetch photos for Curiosity, Opportunity, or Spirit using NASA Images API
 * Since the Mars Photos API is retired, we use curated mission photos
 */
async function fetchRoverPhotosFromImagesAPI(
  rover: RoverName,
  limit: number = 50
): Promise<RoverPhoto[]> {
  const cacheKey = `${rover}-images-api-${limit}`;
  const cached = getFromCache<RoverPhoto[]>(cacheKey);
  if (cached) return cached;

  try {
    trackApiCall();
    // Query for recent rover images
    const roverName = rover.charAt(0).toUpperCase() + rover.slice(1);
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 2; // Last 2 years of images

    const url = `https://images-api.nasa.gov/search?q=${rover}+rover+mars+raw&media_type=image&year_start=${startYear}`;
    console.log(`Fetching ${roverName} photos from NASA Images API`);

    const response = await fetch(url);
    if (!response.ok) {
      console.error(`NASA Images API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data: NASAImagesResponse = await response.json();
    const roverMetadata = getRoverMetadata(rover);

    // Transform Images API format to RoverPhoto format
    const photos: RoverPhoto[] = data.collection.items
      .slice(0, limit)
      .map((item, index) => {
        const itemData = item.data[0];
        const imageLink = item.links?.find(l => l.rel === 'preview' || l.render === 'image');

        // Extract sol from description or title
        const sol = extractSolFromText(itemData.description || itemData.title || '');

        return {
          id: parseInt(itemData.nasa_id.replace(/[^\d]/g, '')) || index,
          sol: sol,
          camera: {
            id: index,
            name: 'MISSION',
            rover_id: roverMetadata.id,
            full_name: 'Mission Camera'
          },
          img_src: imageLink?.href || '',
          earth_date: itemData.date_created.split('T')[0],
          rover: roverMetadata
        };
      })
      .filter(photo => photo.img_src); // Only include photos with valid image URLs

    console.log(`✓ Fetched ${photos.length} ${roverName} photos from Images API`);
    setCache(cacheKey, photos);
    return photos;
  } catch (error) {
    console.error(`Error fetching ${rover} photos from Images API:`, error);
    return [];
  }
}

/**
 * Main function to fetch latest photos based on rover type
 */
async function fetchLatestPhotos(
  rover: RoverName,
  limit: number = 50
): Promise<RoverPhoto[]> {
  if (rover === 'perseverance' || rover === 'curiosity') {
    // Use Mars.nasa.gov RSS API for raw rover images
    // Perseverance and Curiosity have active RSS feeds
    console.log(`🚀 [${rover.toUpperCase()}] Attempting to fetch from RSS API...`);
    const rssPhotos = await fetchRoverPhotosFromRSS(rover, limit);

    // Fallback to NASA Images API if RSS fails for Curiosity
    // (Perseverance RSS is more reliable, so no fallback needed)
    if (rssPhotos.length === 0 && rover === 'curiosity') {
      console.warn(`⚠️  [CURIOSITY] RSS API returned no photos, falling back to NASA Images API`);
      const fallbackPhotos = await fetchRoverPhotosFromImagesAPI(rover, limit);
      if (fallbackPhotos.length > 0) {
        console.log(`✅ [CURIOSITY] Fallback successful: ${fallbackPhotos.length} photos from Images API`);
      }
      return fallbackPhotos;
    }

    return rssPhotos;
  } else {
    // Use NASA Images API for curated mission photos for legacy rovers
    // (Mars Photos API retired October 8, 2025)
    return fetchRoverPhotosFromImagesAPI(rover, limit);
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ rover: string }> }
) {
  try {
    const { rover } = await context.params;
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const latest = searchParams.get('latest') === 'true';

    // Validate rover name
    if (!isValidRover(rover)) {
      return NextResponse.json(
        {
          error: `Invalid rover name. Must be one of: perseverance, curiosity, opportunity, spirit`,
        },
        { status: 400 }
      );
    }

    // Check top-level response cache to dramatically reduce API usage
    const responseCacheKey = getCacheKey(rover, searchParams);
    const cachedResponse = getFromCache<any>(responseCacheKey);
    if (cachedResponse) {
      console.log(`⚡ Returning cached response for ${rover} (API calls saved!)`);
      const headers = new Headers();
      headers.set('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=43200'); // 6 hours cache
      headers.set('X-Cache', 'HIT');
      return NextResponse.json(cachedResponse, { headers });
    }

    let photos: RoverPhoto[] = [];
    let metadata: any = {
      type: 'latest',
      api_source: 'Unknown', // Will be updated based on actual source used
      note: ''
    };

    // Fetch latest photos (only mode supported now)
    photos = await fetchLatestPhotos(rover, limit);

    // Update metadata based on which source was used
    if (photos.length > 0) {
      // Determine which API was used based on rover and success
      if (rover === 'perseverance') {
        metadata.api_source = 'Mars.nasa.gov RSS API';
        metadata.note = 'Raw rover camera images from Mars.nasa.gov RSS feed (Mars 2020 mission)';
      } else if (rover === 'curiosity') {
        // Check if we're using RSS or fallback (we'll log this in fetchLatestPhotos)
        metadata.api_source = 'Mars.nasa.gov RSS API or NASA Images API (fallback)';
        metadata.note = 'Attempting RSS feed first, falling back to NASA Images API if needed';
      } else {
        metadata.api_source = 'NASA Images API';
        metadata.note = 'The NASA Mars Photos API was retired on October 8, 2025. Showing curated mission photos from NASA Images API.';
      }
    } else {
      metadata.api_source = (rover === 'perseverance' || rover === 'curiosity')
        ? 'Mars.nasa.gov RSS API'
        : 'NASA Images API';
      metadata.note = 'No photos available from any source';
    }

    // Add sol tracking data
    try {
      const solData = calculateSol(rover, new Date());
      const solDisplay = formatSolDisplay(solData);
      const milestone = getSolMilestone(solData.currentSol);

      metadata.sol_tracking = {
        current_sol: solData.currentSol,
        mission_duration_earth_days: solData.missionDurationEarthDays,
        mission_duration_sols: solData.missionDurationSols,
        sol_progress: solData.solProgress,
        mars_local_solar_time: solData.marsLocalSolarTime,
        season: solData.season,
        landing_date: solData.landingDate,
        display: solDisplay,
        milestone: milestone
      };

      // Add rover info
      metadata.rover_info = {
        ...getRoverMetadata(rover),
        current_sol: solData.currentSol
      };
    } catch (error) {
      console.error(`Error calculating sol data for ${rover}:`, error);
    }

    // Add warning if no photos found
    if (photos.length === 0) {
      console.warn(`No photos found for ${rover}.`);
      metadata.warning = `No photos available. ${
        (rover === 'perseverance' || rover === 'curiosity')
          ? 'The Mars.nasa.gov RSS API may be temporarily unavailable.'
          : 'Limited photos available from NASA Images API for legacy rovers.'
      }`;
    }

    // Log API usage stats
    console.log(`📊 Current API usage: ${apiCallCount} calls in last hour`);

    // Prepare response
    const responseData = {
      photos,
      success: photos.length > 0,
      total: photos.length,
      rover,
      metadata,
      cached_until: new Date(Date.now() + CACHE_TTL).toISOString(),
      api_calls_this_hour: apiCallCount
    };

    // Cache the entire response
    setCache(responseCacheKey, responseData);

    // Add cache headers for extended caching (6 hours)
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=43200'); // 6 hours cache, 12 hours stale
    headers.set('X-Cache', 'MISS');

    return NextResponse.json(responseData, { headers });

  } catch (error: any) {
    console.error('Mars photos API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch Mars rover photos',
        details: error.message,
        note: 'The NASA Mars Photos API was retired on October 8, 2025. This endpoint now uses alternative data sources.'
      },
      { status: 500 }
    );
  }
}
