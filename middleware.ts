import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Enhanced rate limiter with per-IP tracking and suspicious activity detection
const rateLimitMap = new Map<string, { count: number; resetTime: number; violations: number }>();
const suspiciousIPs = new Map<string, { lastViolation: number; count: number }>();

// Configuration with tiered rate limits
const WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute for general API
const MAX_REQUESTS_INTENSIVE = 30; // 30 requests per minute for data-intensive endpoints
const SUSPICIOUS_THRESHOLD = 3; // Number of violations before temporary ban
const BAN_DURATION_MS = 300000; // 5 minutes ban for suspicious activity

// Intensive endpoints that require stricter rate limiting
const INTENSIVE_ENDPOINTS = [
  '/api/mars-photos',
  '/api/spacecraft',
  '/api/dsn',
];

// Clean up old entries on each request (Edge Runtime compatible)
function cleanupOldEntries() {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < now) {
      rateLimitMap.delete(key);
    }
  }
  // Clean up old suspicious IP records (older than 1 hour)
  for (const [ip, record] of suspiciousIPs.entries()) {
    if (now - record.lastViolation > 3600000) {
      suspiciousIPs.delete(ip);
    }
  }
}

// Extract client IP with proper proxy chain handling
function getClientIP(request: NextRequest): string {
  // Try multiple headers for IP extraction (handles various proxy setups)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare
  const trueClientIP = request.headers.get('true-client-ip'); // Cloudflare Enterprise

  // x-forwarded-for may contain multiple IPs, take the first (original client)
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    return ips[0];
  }

  return cfConnectingIP || trueClientIP || realIP || 'anonymous';
}

// Check if IP is currently banned
function isIPBanned(ip: string): { banned: boolean; retryAfter?: number } {
  const record = suspiciousIPs.get(ip);
  if (!record) return { banned: false };

  const now = Date.now();
  const timeSinceViolation = now - record.lastViolation;

  if (record.count >= SUSPICIOUS_THRESHOLD && timeSinceViolation < BAN_DURATION_MS) {
    return {
      banned: true,
      retryAfter: Math.ceil((BAN_DURATION_MS - timeSinceViolation) / 1000),
    };
  }

  return { banned: false };
}

// Mark IP as suspicious
function markSuspicious(ip: string) {
  const now = Date.now();
  const record = suspiciousIPs.get(ip);

  if (record) {
    record.count++;
    record.lastViolation = now;
  } else {
    suspiciousIPs.set(ip, { lastViolation: now, count: 1 });
  }
}

export function middleware(request: NextRequest) {
  // Clean up old entries periodically
  cleanupOldEntries();

  // Only apply rate limiting to API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Get client IP with enhanced detection
  const ip = getClientIP(request);

  // Check if IP is banned due to suspicious activity
  const banCheck = isIPBanned(ip);
  if (banCheck.banned) {
    return new NextResponse(
      JSON.stringify({
        error: 'Access temporarily restricted',
        message: 'Your IP has been temporarily restricted due to suspicious activity. Please try again later.',
        retryAfter: banCheck.retryAfter,
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': banCheck.retryAfter!.toString(),
        },
      }
    );
  }

  // Determine rate limit based on endpoint type
  const isIntensive = INTENSIVE_ENDPOINTS.some(endpoint =>
    request.nextUrl.pathname.startsWith(endpoint)
  );
  const maxRequests = isIntensive ? MAX_REQUESTS_INTENSIVE : MAX_REQUESTS;

  const identifier = `${ip}-${request.nextUrl.pathname}`;
  const now = Date.now();

  // Get or create rate limit record
  let record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    // Create new record or reset expired one
    record = {
      count: 1,
      resetTime: now + WINDOW_MS,
      violations: record?.violations || 0,
    };
    rateLimitMap.set(identifier, record);
  } else {
    // Increment count
    record.count++;
  }

  // Check if rate limit exceeded
  if (record.count > maxRequests) {
    // Increment violations for suspicious activity tracking
    record.violations++;
    markSuspicious(ip);

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
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': record.resetTime.toString(),
          'Retry-After': retryAfter.toString(),
        },
      }
    );
  }

  // Add rate limit headers to response
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', (maxRequests - record.count).toString());
  response.headers.set('X-RateLimit-Reset', record.resetTime.toString());

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
