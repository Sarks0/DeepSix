/**
 * Environment variable handling for Cloudflare Pages Edge Runtime
 * Simplified approach without runtime imports
 */

const FALLBACK_NASA_KEY = 'DEMO_KEY';

/**
 * Get NASA API key from environment
 * Works in both local development and Cloudflare Pages deployment
 */
export function getNasaApiKey(): string {
  // In Edge Runtime, environment variables are available through process.env
  // Cloudflare Pages injects them at build time
  if (typeof process !== 'undefined' && process.env) {
    const apiKey = process.env.NEXT_PUBLIC_NASA_API_KEY || process.env.NASA_API_KEY;
    if (apiKey && apiKey !== 'undefined') {
      return apiKey;
    }
  }
  
  // Use hardcoded fallback as last resort
  // This ensures the app works even if env vars aren't properly configured
  return FALLBACK_NASA_KEY;
}