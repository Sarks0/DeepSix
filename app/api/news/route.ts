import { NextRequest, NextResponse } from 'next/server';
import { newsCache } from '@/lib/services/news-cache';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
  image?: string;
}

interface RSSFeed {
  url: string;
  source: string;
  category: string;
}

// NASA RSS feeds to aggregate
const RSS_FEEDS: RSSFeed[] = [
  {
    url: 'https://www.nasa.gov/news-release/feed/',
    source: 'NASA',
    category: 'Breaking News'
  },
  {
    url: 'https://www.nasa.gov/feed/',
    source: 'NASA',
    category: 'General'
  },
  {
    url: 'https://www.nasa.gov/missions/station/feed/',
    source: 'NASA',
    category: 'Space Station'
  },
  {
    url: 'https://www.nasa.gov/missions/artemis/feed/',
    source: 'NASA',
    category: 'Artemis'
  }
];

// Simple XML parser for RSS feeds
function parseRSSFeed(xmlText: string, source: string, category: string): NewsItem[] {
  const items: NewsItem[] = [];
  
  try {
    // Extract items from RSS XML
    const itemMatches = xmlText.match(/<item[^>]*>([\s\S]*?)<\/item>/gi);
    
    if (!itemMatches) return items;

    for (const itemXml of itemMatches.slice(0, 10)) { // Limit to 10 items per feed
      const title = extractXMLContent(itemXml, 'title');
      const description = extractXMLContent(itemXml, 'description');
      const link = extractXMLContent(itemXml, 'link');
      const pubDate = extractXMLContent(itemXml, 'pubDate');
      
      // Try to extract image from description or content
      const imageMatch = itemXml.match(/<img[^>]+src="([^"]+)"/i);
      const image = imageMatch ? imageMatch[1] : undefined;

      if (title && link) {
        items.push({
          id: `${source}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: cleanText(title),
          description: cleanText(description || ''),
          link: link.trim(),
          pubDate: pubDate || new Date().toISOString(),
          source,
          category,
          image
        });
      }
    }
  } catch (error) {
    console.error(`Error parsing RSS feed for ${source}:`, error);
  }

  return items;
}

function extractXMLContent(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

async function fetchRSSFeed(feed: RSSFeed): Promise<NewsItem[]> {
  try {
    console.log(`Fetching RSS feed: ${feed.url}`);
    
    const response = await fetch(feed.url, {
      headers: {
        'User-Agent': 'DeepSix News Aggregator 1.0'
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${feed.url}: ${response.status}`);
      return [];
    }

    const xmlText = await response.text();
    return parseRSSFeed(xmlText, feed.source, feed.category);
    
  } catch (error) {
    console.error(`Error fetching RSS feed ${feed.url}:`, error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const forceRefresh = searchParams.get('refresh') === 'true';

    // Check cache first (unless force refresh is requested)
    if (!forceRefresh) {
      const cachedData = newsCache.get(category || undefined, limit);
      if (cachedData) {
        console.log('Returning cached news data');
        return NextResponse.json(cachedData);
      }
    }

    // Filter feeds by category if specified
    const feedsToFetch = category 
      ? RSS_FEEDS.filter(feed => feed.category.toLowerCase() === category.toLowerCase())
      : RSS_FEEDS;

    console.log(`Fetching ${feedsToFetch.length} RSS feeds...`);

    // Fetch all RSS feeds in parallel
    const feedPromises = feedsToFetch.map(feed => fetchRSSFeed(feed));
    const feedResults = await Promise.all(feedPromises);

    // Combine and sort all news items
    const allNews = feedResults
      .flat()
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, limit);

    const categories = [...new Set(allNews.map(item => item.category))];

    const responseData = {
      news: allNews,
      total: allNews.length,
      categories,
      metadata: {
        sources: feedsToFetch.map(f => f.source),
        fetched_at: new Date().toISOString(),
        feeds_count: feedsToFetch.length,
        cache_duration: '1 hour'
      }
    };

    // Cache the response
    newsCache.set(responseData, category || undefined, limit);

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error in news API:', error);
    
    // Try to return cached data if available, even if it's expired
    const cachedData = newsCache.get(category || undefined, limit);
    if (cachedData) {
      console.log('Returning cached data due to fetch error');
      return NextResponse.json({
        ...cachedData,
        metadata: {
          ...cachedData.metadata,
          warning: 'Using cached data due to fetch error'
        }
      });
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch NASA news',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}