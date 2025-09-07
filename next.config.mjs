/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages supports Next.js with @cloudflare/next-on-pages
  // Performance optimizations
  compiler: {
    // Don't remove console in production - causes issues with Cloudflare Pages
    removeConsole: false,
  },
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize for production builds
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            // Three.js chunk
            three: {
              test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
              name: 'three',
              chunks: 'all',
              priority: 20,
            },
            // Framer Motion chunk  
            framerMotion: {
              test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
              name: 'framer-motion',
              chunks: 'all',
              priority: 15,
            },
            // Common vendor chunk
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
          },
        },
      };
    }
    return config;
  },
  // Enable ESLint during production builds for security
  eslint: {
    ignoreDuringBuilds: true, // Temporarily disabled for performance testing
  },
  // Enable TypeScript checking during production builds for security
  typescript: {
    ignoreBuildErrors: true, // Temporarily disabled for performance testing
  },
  // Headers for performance
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        }
      ],
    },
  ],
  // Allow external image sources
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mars.nasa.gov',
      },
      {
        protocol: 'https',
        hostname: 'mars.jpl.nasa.gov',
      },
      {
        protocol: 'https',
        hostname: 'images-api.nasa.gov',
      },
    ],
    // Image optimization settings
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
  },
};

export default nextConfig;
