// TypeScript declarations for Cloudflare environment bindings
interface CloudflareEnv {
  // Environment variables
  NASA_API_KEY: string;
  NEXT_PUBLIC_NASA_API_KEY?: string;
  NEXT_PUBLIC_APP_URL?: string;
  
  // Optional KV namespace for caching
  __NEXT_ON_PAGES__KV_SUSPENSE_CACHE?: KVNamespace;
}

// Extend ProcessEnv for local development
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NASA_API_KEY?: string;
      NEXT_PUBLIC_NASA_API_KEY?: string;
      NEXT_PUBLIC_APP_URL?: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}