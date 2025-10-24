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

// Maximum XML size to prevent ReDoS attacks (5MB)
const MAX_XML_SIZE = 5 * 1024 * 1024;

// Simple XML parser for RSS feeds (ReDoS-safe implementation)
function parseRSSFeed(xmlText: string, source: string, category: string): NewsItem[] {
  const items: NewsItem[] = [];

  try {
    // Security: Validate XML size before parsing
    if (xmlText.length > MAX_XML_SIZE) {
      console.error(`RSS feed too large: ${xmlText.length} bytes (max: ${MAX_XML_SIZE})`);
      return items;
    }

    // Security: Use safer string operations instead of complex regex
    const itemStrings = extractItemBlocks(xmlText);

    if (itemStrings.length === 0) return items;

    for (const itemXml of itemStrings.slice(0, 10)) { // Limit to 10 items per feed
      const title = extractXMLContent(itemXml, 'title');
      const description = extractXMLContent(itemXml, 'description');
      const link = extractXMLContent(itemXml, 'link');
      const pubDate = extractXMLContent(itemXml, 'pubDate');

      // Try to extract image from description or content (safer approach)
      const image = extractImageUrl(itemXml);

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

// Security: Extract XML items without ReDoS-vulnerable regex
function extractItemBlocks(xml: string): string[] {
  const items: string[] = [];
  let searchStart = 0;
  const maxItems = 20; // Hard limit for safety

  while (items.length < maxItems) {
    const itemStart = xml.indexOf('<item', searchStart);
    if (itemStart === -1) break;

    const itemEnd = xml.indexOf('</item>', itemStart);
    if (itemEnd === -1) break;

    items.push(xml.substring(itemStart, itemEnd + 7)); // Include closing tag
    searchStart = itemEnd + 7;
  }

  return items;
}

// Security: Extract image URL without complex regex
function extractImageUrl(xml: string): string | undefined {
  const imgStart = xml.indexOf('<img');
  if (imgStart === -1) return undefined;

  const imgEnd = xml.indexOf('>', imgStart);
  if (imgEnd === -1) return undefined;

  const imgTag = xml.substring(imgStart, imgEnd);
  const srcStart = imgTag.indexOf('src="');
  if (srcStart === -1) return undefined;

  const srcValueStart = srcStart + 5;
  const srcEnd = imgTag.indexOf('"', srcValueStart);
  if (srcEnd === -1) return undefined;

  return imgTag.substring(srcValueStart, srcEnd);
}

// Security: Extract XML content without ReDoS-vulnerable regex
function extractXMLContent(xml: string, tag: string): string {
  // Use simpler, non-backtracking string operations
  const startTag = `<${tag}`;
  const endTag = `</${tag}>`;

  const startIdx = xml.indexOf(startTag);
  if (startIdx === -1) return '';

  const contentStart = xml.indexOf('>', startIdx) + 1;
  const endIdx = xml.indexOf(endTag, contentStart);

  if (endIdx === -1) return '';

  return xml.substring(contentStart, endIdx).trim();
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

// Security: Validate RSS feed URLs to prevent SSRF
function isValidRSSFeedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    // Whitelist allowed protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      console.warn(`Invalid protocol: ${parsed.protocol}`);
      return false;
    }

    // Blacklist private IP ranges and cloud metadata endpoints
    const hostname = parsed.hostname.toLowerCase();
    const privateIpPatterns = [
      /^127\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^192\.168\./,
      /^169\.254\./, // AWS metadata
      /^localhost$/i,
      /^0\.0\.0\.0$/,
      /^\[::1\]$/,
      /^\[::\]$/
    ];

    if (privateIpPatterns.some(pattern => pattern.test(hostname))) {
      console.warn(`Blocked private IP/localhost: ${hostname}`);
      return false;
    }

    // Whitelist allowed domains
    const allowedDomains = [
      'nasa.gov',
      'jpl.nasa.gov',
      'esawebb.org'
    ];

    if (!allowedDomains.some(domain => hostname.endsWith(domain))) {
      console.warn(`Domain not whitelisted: ${hostname}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`URL parsing error: ${error}`);
    return false;
  }
}

async function fetchRSSFeed(feed: RSSFeed): Promise<NewsItem[]> {
  try {
    // Security: Validate URL before fetching
    if (!isValidRSSFeedUrl(feed.url)) {
      console.error(`Invalid RSS feed URL: ${feed.url}`);
      return [];
    }

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

    // Security: Validate XML size
    if (xmlText.length > MAX_XML_SIZE) {
      console.error(`RSS feed too large: ${xmlText.length} bytes`);
      return [];
    }

    return parseRSSFeed(xmlText, feed.source, feed.category);

  } catch (error) {
    console.error(`Error fetching RSS feed ${feed.url}:`, error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '50');
  const forceRefresh = searchParams.get('refresh') === 'true';

  try {

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