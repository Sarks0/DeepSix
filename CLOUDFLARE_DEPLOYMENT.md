# Cloudflare Pages Deployment Guide for DeepSix

## Prerequisites
✅ Cloudflare account with Pages access
✅ NASA API key from https://api.nasa.gov/
✅ Git repository connected to Cloudflare Pages

## Local Testing

### 1. Set your NASA API key locally
```bash
# Copy the example env file
cp .env.example .env.local

# Edit .env.local and add your NASA API key
NEXT_PUBLIC_NASA_API_KEY=your_actual_nasa_api_key_here
```

### 2. Build for Cloudflare
```bash
npm run build:cloudflare
```

### 3. Preview locally with Wrangler
```bash
npm run preview:cloudflare
```

Visit http://localhost:8788 to test the deployment locally.

## Cloudflare Pages Deployment

### Option 1: Deploy via Git Integration (Recommended)

1. **Connect your repository to Cloudflare Pages**
   - Go to Cloudflare Dashboard > Pages
   - Click "Create a project"
   - Connect your GitHub/GitLab repository

2. **Configure build settings**
   ```
   Framework preset: Next.js
   Build command: npx @cloudflare/next-on-pages@1
   Build output directory: .vercel/output/static
   ```

3. **Set environment variables in Cloudflare Dashboard**
   - Go to Settings > Environment variables
   - Add these variables for BOTH Production and Preview:
     ```
     NASA_API_KEY = your_actual_nasa_api_key
     NEXT_PUBLIC_NASA_API_KEY = your_actual_nasa_api_key
     NEXT_PUBLIC_APP_URL = https://your-project.pages.dev
     NODE_VERSION = 18
     ```

4. **Configure compatibility settings**
   - Go to Settings > Functions
   - Add compatibility flag: `nodejs_compat`
   - Set compatibility date: `2024-09-06` or later

5. **Deploy**
   - Push to your main branch
   - Cloudflare will automatically build and deploy

### Option 2: Direct Upload with Wrangler CLI

1. **Build the project**
   ```bash
   npm run build:cloudflare
   ```

2. **Deploy with Wrangler**
   ```bash
   # First time - create the project
   npx wrangler pages project create deepsix-dashboard

   # Deploy
   npx wrangler pages deploy .vercel/output/static \
     --project-name=deepsix-dashboard \
     --compatibility-flag=nodejs_compat
   ```

3. **Set secrets via Wrangler**
   ```bash
   npx wrangler pages secret put NASA_API_KEY --project-name=deepsix-dashboard
   # Enter your API key when prompted
   
   npx wrangler pages secret put NEXT_PUBLIC_NASA_API_KEY --project-name=deepsix-dashboard
   # Enter your API key again
   ```

## Troubleshooting

### API Key Not Working?

1. **Verify environment variables are set correctly**
   - In Cloudflare Dashboard, check Settings > Environment variables
   - Ensure both `NASA_API_KEY` and `NEXT_PUBLIC_NASA_API_KEY` are set
   - Variables should be set for BOTH Production and Preview environments

2. **Check build logs**
   - Look for any build errors in Cloudflare Pages > Deployments
   - Ensure the build command is: `npx @cloudflare/next-on-pages@1`

3. **Verify Edge Runtime**
   - All API routes should have `export const runtime = 'edge';`
   - This is already configured in the codebase

4. **Test with DEMO_KEY first**
   - NASA provides a DEMO_KEY for testing (rate limited)
   - Set `NASA_API_KEY=DEMO_KEY` to verify the setup works

### Common Issues

- **"Module not found" errors**: Ensure `nodejs_compat` flag is enabled
- **API returns 403**: Check if NASA API key is valid and not rate-limited
- **Blank data on production**: Verify environment variables are set for Production
- **Build fails**: Check Node version is set to 18 or higher

## Using Cloudflare Tunnels for Testing (Optional)

If you want to test your local development with a public URL:

1. **Install cloudflared**
   ```bash
   # macOS
   brew install cloudflared
   
   # Linux
   wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
   sudo dpkg -i cloudflared-linux-amd64.deb
   ```

2. **Create a tunnel**
   ```bash
   # Start your dev server
   npm run dev
   
   # In another terminal, create tunnel
   cloudflared tunnel --url http://localhost:3000
   ```

3. **Access via public URL**
   - Cloudflared will provide a temporary public URL
   - Use this to test OAuth callbacks, webhooks, etc.

## Monitoring

After deployment:
1. Check Analytics in Cloudflare Dashboard
2. Monitor Web Analytics for performance
3. Review Functions logs for API errors
4. Set up error alerting if needed

## Support

- Cloudflare Pages docs: https://developers.cloudflare.com/pages/
- Next.js on Cloudflare: https://developers.cloudflare.com/pages/framework-guides/nextjs/
- NASA API docs: https://api.nasa.gov/