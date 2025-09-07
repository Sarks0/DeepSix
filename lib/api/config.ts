/**
 * API Configuration
 * Handles environment variable access for NASA API
 */

export function getApiKey(): string {
  // Get API key from environment variables
  const apiKey = process.env.NEXT_PUBLIC_NASA_API_KEY;
  
  if (!apiKey) {
    console.warn('No NASA API key found, using DEMO_KEY');
    return 'DEMO_KEY';
  }
  
  return apiKey;
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}
