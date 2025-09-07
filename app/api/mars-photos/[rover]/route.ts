import { NextRequest, NextResponse } from 'next/server';
import { getNasaApiKey } from '@/lib/api/cloudflare-env';

export const runtime = 'edge';

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
  };
}

// Known good sols for fallback
const FALLBACK_SOLS: Record<RoverName, number[]> = {
  perseverance: [900, 800, 700, 600, 500, 400, 300, 200, 100],
  curiosity: [3000, 2500, 2000, 1500, 1000, 500, 100],
  opportunity: [5000, 4000, 3000, 2000, 1000],
  spirit: [2000, 1500, 1000, 500, 100],
};

function isValidRover(rover: string): rover is RoverName {
  return ['perseverance', 'curiosity', 'opportunity', 'spirit'].includes(rover);
}

async function fetchRoverPhotos(
  rover: RoverName,
  sol: number,
  apiKey: string
): Promise<RoverPhoto[]> {
  const url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=${sol}&api_key=${apiKey}`;
  
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

async function getLatestPhotos(
  rover: RoverName,
  limit: number,
  apiKey: string
): Promise<RoverPhoto[]> {
  // Try to get recent photos by checking last few sols
  const fallbackSols = FALLBACK_SOLS[rover] || [1000, 500, 100];
  
  for (const sol of fallbackSols) {
    const photos = await fetchRoverPhotos(rover, sol, apiKey);
    if (photos.length > 0) {
      return photos.slice(0, limit);
    }
  }
  
  // If no photos found, try sol 1
  const photos = await fetchRoverPhotos(rover, 1, apiKey);
  return photos.slice(0, limit);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ rover: string }> }
) {
  try {
    const { rover } = await context.params;
    const { searchParams } = new URL(request.url);
    const sol = searchParams.get('sol') ? parseInt(searchParams.get('sol')!) : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;

    // Validate rover name
    if (!isValidRover(rover)) {
      return NextResponse.json(
        {
          error: `Invalid rover name. Must be one of: perseverance, curiosity, opportunity, spirit`,
        },
        { status: 400 }
      );
    }

    // Get API key from environment (works with both local and Cloudflare)
    const apiKey = getNasaApiKey();

    let photos: RoverPhoto[];

    if (sol !== undefined) {
      // Fetch specific sol
      photos = await fetchRoverPhotos(rover, sol, apiKey);
      photos = photos.slice(0, limit);
    } else {
      // Fetch latest available photos
      photos = await getLatestPhotos(rover, limit, apiKey);
    }

    return NextResponse.json({
      photos,
      success: true,
      total: photos.length,
      rover,
      sol: sol || 'latest',
    });
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