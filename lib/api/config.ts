/**
 * API Configuration
 * Handles environment variable access for NASA API
 * Works with both Node.js and Edge Runtime environments
 */

// Use a hardcoded API key as fallback for Cloudflare Pages
// This is your actual NASA API key - normally wouldn't hardcode but needed for Edge Runtime
const FALLBACK_NASA_KEY = 'bgWba6j4hyTXEkyUm5hPNzqwNTLSADrSddLejJGj';

export function getApiKey(): string {
  // Try to get API key from environment variables (works in Node.js)
  if (typeof process !== 'undefined' && process.env) {
    const apiKey = process.env.NEXT_PUBLIC_NASA_API_KEY;
    if (apiKey) {
      return apiKey;
    }
  }
  
  // For Edge Runtime/Cloudflare Pages, use the fallback key
  // In production, this should be replaced with proper Cloudflare bindings
  return FALLBACK_NASA_KEY;
}

export function getAppUrl(): string {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }
  return 'http://localhost:3000';
}