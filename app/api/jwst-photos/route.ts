import { NextRequest, NextResponse } from 'next/server';

interface JWSTPhoto {
  id: string;
  title: string;
  description: string;
  img_src: string;
  date: string;
  keywords: string[];
  center: string;
}

interface NASAImageAPIItem {
  href: string;
  data: Array<{
    title: string;
    description?: string;
    date_created: string;
    keywords?: string[];
    media_type: string;
    nasa_id: string;
    center: string;
  }>;
  links?: Array<{
    href: string;
    rel: string;
    render?: string;
  }>;
}

interface NASAImageAPIResponse {
  collection: {
    version: string;
    href: string;
    items: NASAImageAPIItem[];
    metadata: {
      total_hits: number;
    };
  };
}

function processJWSTPhotos(items: NASAImageAPIItem[]): JWSTPhoto[] {
  return items
    .filter(item => 
      item.links && 
      item.links.length > 0 && 
      item.data[0]?.media_type === 'image' &&
      (item.data[0]?.title?.toLowerCase().includes('webb') ||
       item.data[0]?.keywords?.some(k => k.toLowerCase().includes('webb')) ||
       item.data[0]?.keywords?.some(k => k.toLowerCase().includes('jwst')))
    )
    .map(item => ({
      id: item.data[0].nasa_id,
      title: item.data[0].title,
      description: item.data[0].description || 'James Webb Space Telescope observation',
      img_src: item.links?.[0]?.href || '',
      date: item.data[0].date_created,
      keywords: item.data[0].keywords || [],
      center: item.data[0].center
    }))
    .filter(photo => photo.img_src) // Only include photos with valid image sources
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by newest first
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const limit = parseInt(searchParams.get('limit') || '50');
    const latest = searchParams.get('latest') === 'true';
    
    // Build search parameters for NASA Images API
    const nasaSearchParams = new URLSearchParams({
      q: 'James Webb Space Telescope OR JWST',
      media_type: 'image',
      year_start: '2022', // JWST started operations in 2022
      page_size: Math.min(limit * 2, 100).toString() // Get more than requested for better filtering
    });

    const apiUrl = `https://images-api.nasa.gov/search?${nasaSearchParams}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'DeepSix-Dashboard/1.0',
      },
    });

    if (!response.ok) {
      console.error('NASA Images API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `NASA Images API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data: NASAImageAPIResponse = await response.json();
    
    if (!data.collection?.items) {
      return NextResponse.json(
        { error: 'No images found in NASA API response' },
        { status: 404 }
      );
    }

    const processedPhotos = processJWSTPhotos(data.collection.items);
    
    if (processedPhotos.length === 0) {
      return NextResponse.json(
        { error: 'No James Webb Space Telescope images found' },
        { status: 404 }
      );
    }

    // Limit the results
    const limitedPhotos = processedPhotos.slice(0, limit);

    return NextResponse.json({
      photos: limitedPhotos,
      total: limitedPhotos.length,
      metadata: {
        source: 'NASA Images API',
        query_limit: limit,
        api_total_hits: data.collection.metadata?.total_hits || 0,
        filtered_count: processedPhotos.length
      }
    });

  } catch (error) {
    console.error('Error fetching JWST photos:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch James Webb Space Telescope images',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}