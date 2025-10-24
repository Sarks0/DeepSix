# Vercel Deployment Guide

## 🔐 CRITICAL SECURITY NOTICE

**NEVER use `NEXT_PUBLIC_NASA_API_KEY`** - This prefix exposes your API key in the client-side JavaScript bundle where anyone can steal it.

✅ **CORRECT:** Use `NASA_API_KEY` (server-side only)
❌ **WRONG:** `NEXT_PUBLIC_NASA_API_KEY` (exposed to clients)

All NASA API calls must go through Next.js API routes (`app/api/*`) which run server-side and keep your key secure.

---

## Quick Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/stellar-navigator)

## Manual Deployment Steps

### 1. Prerequisites
- GitHub account
- Vercel account (free at vercel.com)
- NASA API key (free at api.nasa.gov)

### 2. Deploy to Vercel

#### Option A: Deploy via GitHub (Recommended)
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables (see below)
6. Click "Deploy"

#### Option B: Deploy via CLI
```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy
vercel

# Follow the prompts
```

### 3. Environment Variables

In your Vercel dashboard, add these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `NASA_API_KEY` | Your NASA API key | Get from https://api.nasa.gov/ (server-side only, recommended) |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL | e.g., https://your-app.vercel.app |

**Security Note:** Use `NASA_API_KEY` (without `NEXT_PUBLIC_` prefix) to keep your API key secure on the server-side. The `NEXT_PUBLIC_` prefix exposes variables in the client bundle, which is a security risk. API routes can access server-side environment variables via `process.env.NASA_API_KEY`.

#### How to add environment variables in Vercel:
1. Go to your project dashboard
2. Click "Settings" tab
3. Click "Environment Variables" in the left sidebar
4. Add each variable with its value
5. Ensure they're available for Production, Preview, and Development
6. **Important:** Do NOT use `NEXT_PUBLIC_` prefix for the NASA API key

### 4. Configuration Details

The project includes `vercel.json` with:
- Optimized build settings for Next.js
- API function timeout configurations (10 seconds)
- Security headers
- Caching headers for API routes

### 5. Post-Deployment

After deployment:
1. Test all API endpoints are working
2. Verify NASA data is loading
3. Check 3D visualizations render correctly
4. Test on mobile devices

### 6. Troubleshooting

#### API data not loading?
- Verify `NASA_API_KEY` is set correctly (server-side only, without NEXT_PUBLIC_ prefix)
- Check the Vercel function logs for errors
- Ensure API routes are accessible (test /api/spacecraft, /api/apod, etc.)

#### Build failing?
- Ensure all dependencies are in package.json
- Check build logs in Vercel dashboard

#### Performance issues?
- Vercel automatically optimizes Next.js apps
- API responses are cached for 60 seconds
- Images are optimized automatically

### 7. Custom Domain (Optional)

To add a custom domain:
1. Go to Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions

## Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Add your NASA API key to .env.local
# Use NASA_API_KEY=your_key_here (NOT NEXT_PUBLIC_NASA_API_KEY)

# Run development server
npm run dev
```

**`.env.local` example:**
```
NASA_API_KEY=your_nasa_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Features Enabled on Vercel

- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Image optimization
- ✅ API route caching
- ✅ Automatic deployments from GitHub
- ✅ Preview deployments for PRs
- ✅ Web Analytics (optional)
- ✅ Speed Insights (optional)

## Support

For deployment issues:
- Check [Vercel documentation](https://vercel.com/docs)
- Review [Next.js deployment guide](https://nextjs.org/docs/deployment)
- Check function logs in Vercel dashboard