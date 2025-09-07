/**
 * API Configuration
 * Handles environment variable access for NASA API
 */

export function getApiKey(): string {
  // Get API key from environment variables
  const apiKey = process.env.NEXT_PUBLIC_NASA_API_KEY || process.env.NASA_API_KEY;
  
  if (!apiKey) {
    // Use demo key as fallback (rate limited to 30 requests/hour)
    console.warn('No NASA API key found in environment variables. Using DEMO_KEY with rate limits.');
    return 'DEMO_KEY';
  }
  
  return apiKey;
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}