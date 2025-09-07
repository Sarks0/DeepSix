import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Configuration
const WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < now) {
      rateLimitMap.delete(key);
    }
  }
}, 60000);

export function middleware(request: NextRequest) {
  // Only apply rate limiting to API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Get client identifier
  const ip =
    request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';

  const identifier = `${ip}-${request.nextUrl.pathname}`;
  const now = Date.now();

  // Get or create rate limit record
  let record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    // Create new record or reset expired one
    record = {
      count: 1,
      resetTime: now + WINDOW_MS,
    };
    rateLimitMap.set(identifier, record);
  } else {
    // Increment count
    record.count++;
  }

  // Check if rate limit exceeded
  if (record.count > MAX_REQUESTS) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);

    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': record.resetTime.toString(),
          'Retry-After': retryAfter.toString(),
        },
      }
    );
  }

  // Add rate limit headers to response
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', MAX_REQUESTS.toString());
  response.headers.set('X-RateLimit-Remaining', (MAX_REQUESTS - record.count).toString());
  response.headers.set('X-RateLimit-Reset', record.resetTime.toString());

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
