/**
 * API Configuration
 * Handles environment variable access for NASA API with security validation
 */

// Track API key usage for monitoring
const apiKeyUsage = {
  isDemo: false,
  usageCount: 0,
  lastChecked: Date.now(),
};

/**
 * Validates that an API key appears to be in the correct format
 * NASA API keys are typically 40 character alphanumeric strings
 */
function validateApiKeyFormat(key: string): boolean {
  if (key === 'DEMO_KEY') return true;

  // NASA API keys are typically 40 characters, alphanumeric
  const apiKeyPattern = /^[a-zA-Z0-9]{40}$/;
  return apiKeyPattern.test(key);
}

/**
 * Detect if API key might be exposed in client-side code
 * This checks for common mistake of using NEXT_PUBLIC_ prefix
 */
function checkForKeyExposure(): void {
  if (process.env.NEXT_PUBLIC_NASA_API_KEY) {
    const errorMessage =
      '🚨 CRITICAL SECURITY ERROR: NASA_API_KEY is exposed via NEXT_PUBLIC_ prefix!\n' +
      'This key WILL BE VISIBLE in the client bundle and can be stolen.\n' +
      'IMMEDIATE ACTION REQUIRED:\n' +
      '1. Remove NEXT_PUBLIC_NASA_API_KEY from environment variables\n' +
      '2. Use NASA_API_KEY instead (server-side only)\n' +
      '3. Regenerate your NASA API key at https://api.nasa.gov\n' +
      '4. All NASA API calls MUST go through Next.js API routes (app/api/*)';

    console.error(errorMessage);

    // In production, throw an error to prevent deployment with exposed keys
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SECURITY: NASA API key exposed via NEXT_PUBLIC_ prefix');
    }
  }
}

/**
 * Get NASA API key with security validation
 */
export function getApiKey(): string {
  // Check for potential security issues
  checkForKeyExposure();

  // Only use server-side API key (never NEXT_PUBLIC_)
  const apiKey = process.env.NASA_API_KEY;

  if (!apiKey) {
    // Use demo key as fallback (rate limited to 30 requests/hour)
    if (!apiKeyUsage.isDemo) {
      console.warn(
        '⚠️  No NASA API key found in environment variables.\n' +
        'Using DEMO_KEY with strict rate limits (30 requests/hour).\n' +
        'Set NASA_API_KEY environment variable (server-side only).\n' +
        'Get a free API key at https://api.nasa.gov for better performance.\n' +
        'IMPORTANT: Never use NEXT_PUBLIC_NASA_API_KEY as it exposes the key to clients.'
      );
      apiKeyUsage.isDemo = true;
    }
    return 'DEMO_KEY';
  }

  // Validate API key format
  if (!validateApiKeyFormat(apiKey)) {
    console.error(
      '⚠️  Invalid API key format detected.\n' +
      'NASA API keys should be 40 character alphanumeric strings.\n' +
      'Falling back to DEMO_KEY.'
    );
    return 'DEMO_KEY';
  }

  // Track usage for monitoring
  apiKeyUsage.usageCount++;

  // Log reminder about rate limits periodically
  const now = Date.now();
  if (now - apiKeyUsage.lastChecked > 3600000) { // Every hour
    apiKeyUsage.lastChecked = now;
    if (process.env.NODE_ENV === 'development') {
      console.log(`ℹ️  NASA API usage: ${apiKeyUsage.usageCount} requests since startup`);
    }
  }

  return apiKey;
}

/**
 * Get application URL with validation
 */
export function getAppUrl(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Validate URL format
  try {
    new URL(appUrl);
    return appUrl;
  } catch {
    console.warn('⚠️  Invalid NEXT_PUBLIC_APP_URL format, using default');
    return 'http://localhost:3000';
  }
}

/**
 * Check if running in production environment
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Get API key usage statistics (for monitoring)
 */
export function getApiKeyStats() {
  return {
    ...apiKeyUsage,
    isValid: apiKeyUsage.isDemo ? false : validateApiKeyFormat(process.env.NASA_API_KEY || ''),
  };
}