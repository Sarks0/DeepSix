/**
 * API Configuration for Cloudflare Pages Edge Runtime
 * Handles environment variable access in both local and Cloudflare environments
 */

export function getApiKey(): string {
  // Try multiple sources for the API key
  // 1. NASA_API_KEY - Cloudflare Pages secret
  // 2. NEXT_PUBLIC_NASA_API_KEY - Local development
  // 3. DEMO_KEY - Fallback for testing
  
  if (typeof process !== 'undefined' && process.env) {
    const apiKey = process.env.NASA_API_KEY || process.env.NEXT_PUBLIC_NASA_API_KEY;
    if (apiKey) return apiKey;
  }
  
  // Fallback to DEMO_KEY if no API key is found
  console.warn('No NASA API key found, using DEMO_KEY');
  return 'DEMO_KEY';
}

export function getAppUrl(): string {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NEXT_PUBLIC_APP_URL || 'https://deepsix.io';
  }
  return 'https://deepsix.io';
}

// Export as constants that are resolved at build time
export const NASA_API_KEY = getApiKey();
export const APP_URL = getAppUrl();
