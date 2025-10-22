import { NextRequest, NextResponse } from 'next/server';
import { getApiKey } from '@/lib/api/config';
import { calculateSol, formatSolDisplay, getSolMilestone } from '@/lib/utils/mars-sol';

type RoverName = 'perseverance' | 'curiosity' | 'opportunity' | 'spirit';

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

interface RoverManifest {
  photo_manifest: {
    name: string;
    landing_date: string;
    launch_date: string;
    status: string;
    max_sol: number;
    max_date: string;
    total_photos: number;
    photos: Array<{
      sol: number;
      earth_date: string;
      total_photos: number;
      cameras: string[];
    }>;
  };
}

function isValidRover(rover: string): rover is RoverName {
  return ['perseverance', 'curiosity', 'opportunity', 'spirit'].includes(rover);
}

async function fetchRoverManifest(rover: RoverName, apiKey: string): Promise<RoverManifest | null> {
  try {
    const url = `https://api.nasa.gov/mars-photos/api/v1/manifests/${rover}?api_key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Failed to fetch manifest: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching manifest for ${rover}:`, error);
    return null;
  }
}

async function fetchRoverPhotos(
  rover: RoverName,
  sol: number,
  apiKey: string,
  camera?: string
): Promise<RoverPhoto[]> {
  const cameraParam = camera ? `&camera=${camera}` : '';
  const url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=${sol}&api_key=${apiKey}${cameraParam}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`NASA API error: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    return data.photos || [];
  } catch (error) {
    console.error(`Error fetching photos for ${rover} sol ${sol}:`, error);
    return [];
  }
}

async function fetchLatestPhotos(
  rover: RoverName,
  apiKey: string,
  limit: number = 200
): Promise<RoverPhoto[]> {
  try {
    // First, try the latest_photos endpoint for the most recent photos
    const latestUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/latest_photos?api_key=${apiKey}`;
    console.log(`Fetching latest photos for ${rover} from: ${latestUrl.replace(apiKey, 'API_KEY_HIDDEN')}`);

    const latestResponse = await fetch(latestUrl);

    if (latestResponse.ok) {
      const latestData = await latestResponse.json();
      console.log(`Latest photos response keys for ${rover}:`, Object.keys(latestData));

      // Try both possible response formats: latest_photos or photos
      const photos = latestData.latest_photos || latestData.photos;

      if (photos && photos.length > 0) {
        console.log(`Found ${photos.length} latest photos for ${rover}`);
        // Return the requested number of latest photos
        return photos.slice(0, limit);
      } else {
        console.log(`No photos in latest_photos response for ${rover}`);
      }
    } else {
      console.error(`Latest photos endpoint failed for ${rover}: ${latestResponse.status} ${latestResponse.statusText}`);
    }
  } catch (error) {
    console.error(`Error fetching latest photos for ${rover}:`, error);
  }

  // Fallback: Get manifest and fetch from recent sols
  console.log(`Falling back to manifest-based fetching for ${rover}`);
  const manifest = await fetchRoverManifest(rover, apiKey);
  if (!manifest) {
    console.error(`Failed to fetch manifest for ${rover}`);
    return [];
  }

  console.log(`Manifest fetched for ${rover}: max_sol=${manifest.photo_manifest.max_sol}, total_photos=${manifest.photo_manifest.total_photos}`);

  const recentPhotos: RoverPhoto[] = [];

  // Limit to last 20 sols instead of 100 to avoid rate limiting
  const recentSols = manifest.photo_manifest.photos
    .slice(-20)
    .reverse()
    .filter(p => p.total_photos > 0)  // Only fetch sols that have photos
    .map(p => p.sol);

  console.log(`Fetching from ${recentSols.length} recent sols for ${rover}`);

  // Limit number of API calls to avoid rate limiting
  let apiCallCount = 0;
  const maxApiCalls = 10;

  for (const sol of recentSols) {
    if (recentPhotos.length >= limit || apiCallCount >= maxApiCalls) break;

    const photos = await fetchRoverPhotos(rover, sol, apiKey);
    apiCallCount++;

    if (photos.length > 0) {
      console.log(`Found ${photos.length} photos for ${rover} on sol ${sol}`);
      // Add variety by selecting from different cameras
      const byCamera = new Map<string, RoverPhoto[]>();
      photos.forEach(photo => {
        const cam = photo.camera.name;
        if (!byCamera.has(cam)) {
          byCamera.set(cam, []);
        }
        byCamera.get(cam)!.push(photo);
      });

      // Take one from each camera in rotation
      let added = 0;
      const maxPerSol = Math.min(10, limit - recentPhotos.length);
      while (added < maxPerSol && byCamera.size > 0) {
        for (const [cam, camPhotos] of byCamera) {
          if (camPhotos.length > 0 && added < maxPerSol) {
            recentPhotos.push(camPhotos.shift()!);
            added++;
          }
          if (camPhotos.length === 0) {
            byCamera.delete(cam);
          }
        }
      }
    }
  }

  console.log(`Returning ${recentPhotos.length} photos for ${rover} after ${apiCallCount} API calls`);
  return recentPhotos.slice(0, limit);
}

async function getPhotosByDateRange(
  rover: RoverName,
  startDate: string,
  endDate: string,
  apiKey: string,
  limit: number = 50
): Promise<RoverPhoto[]> {
  // Fetch photos between two Earth dates
  const url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?earth_date=${startDate}&api_key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return (data.photos || []).slice(0, limit);
  } catch (error) {
    console.error(`Error fetching photos by date for ${rover}:`, error);
    return [];
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
    const sol = searchParams.get('sol') ? parseInt(searchParams.get('sol')!) : undefined;
    const earthDate = searchParams.get('earth_date');
    const camera = searchParams.get('camera');
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

    // Get API key from environment
    const apiKey = getApiKey();

    let photos: RoverPhoto[] = [];
    let metadata: any = {};

    if (latest || (!sol && !earthDate)) {
      // Fetch latest photos (default behavior)
      photos = await fetchLatestPhotos(rover, apiKey, limit);
      metadata.type = 'latest';
    } else if (earthDate) {
      // Fetch by Earth date
      photos = await getPhotosByDateRange(rover, earthDate, earthDate, apiKey, limit);
      metadata.type = 'earth_date';
      metadata.earth_date = earthDate;
    } else if (sol !== undefined) {
      // Fetch specific sol
      photos = await fetchRoverPhotos(rover, sol, apiKey, camera || undefined);
      photos = photos.slice(0, limit);
      metadata.type = 'sol';
      metadata.sol = sol;
    }

    // Get manifest data for additional info
    const manifest = await fetchRoverManifest(rover, apiKey);
    if (manifest) {
      metadata.rover_info = {
        max_sol: manifest.photo_manifest.max_sol,
        max_date: manifest.photo_manifest.max_date,
        total_photos: manifest.photo_manifest.total_photos,
        status: manifest.photo_manifest.status
      };
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
    } catch (error) {
      console.error(`Error calculating sol data for ${rover}:`, error);
    }

    // Add warning if no photos found
    if (photos.length === 0) {
      console.warn(`No photos found for ${rover}. This could be due to:`);
      console.warn(`- NASA API rate limiting (DEMO_KEY limit: 30 requests/hour)`);
      console.warn(`- API endpoint issues`);
      console.warn(`- Invalid API key configuration`);
      metadata.warning = 'No photos available. Check server logs for details.';
    }

    // Add cache headers for extended caching (5 days)
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=432000, stale-while-revalidate=864000'); // 5 days cache, 10 days stale

    return NextResponse.json({
      photos,
      success: photos.length > 0,
      total: photos.length,
      rover,
      metadata,
      cached_until: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days
    }, { headers });
    
  } catch (error: any) {
    console.error('Mars photos API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch Mars rover photos',
        details: error.message
      },
      { status: 500 }
    );
  }
}