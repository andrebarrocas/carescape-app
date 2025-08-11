# Deployment Guide for Carespace App

## Overview
This guide will help you deploy the Carespace app to Vercel with a custom subdomain of bauhaus-seas.eu.

## Prerequisites
1. GitHub account
2. Vercel account (free)
3. Access to bauhaus-seas.eu DNS settings
4. PostgreSQL database (can use free services like Supabase, Neon, or Railway)

## Step 1: Prepare Your Code
1. Make sure all changes are committed to your GitHub repository
2. Ensure your app builds locally: `npm run build`

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Configure the following settings:
   - Framework Preset: Next.js
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

### Option B: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts to configure your project
```

## Step 3: Configure Environment Variables
In your Vercel project dashboard, go to Settings > Environment Variables and add:

### Required Variables:
- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_SECRET`: A random secret string (generate with: `openssl rand -base64 32`)
- `NEXTAUTH_URL`: `https://your-subdomain.bauhaus-seas.eu`

### Optional Variables (if using these services):
- `GOOGLE_AI_API_KEY`: For Google AI features
- `OPENAI_API_KEY`: For OpenAI features
- `NEXT_PUBLIC_MAPBOX_TOKEN`: For map functionality
- `SUPABASE_*`: If using Supabase

## Step 4: Set Up Custom Domain

### In Vercel:
1. Go to your project dashboard
2. Click "Settings" > "Domains"
3. Add your custom domain: `your-subdomain.bauhaus-seas.eu`
4. Vercel will provide DNS records to configure

### In Your DNS Provider (for bauhaus-seas.eu):
Add these DNS records:
- **Type**: CNAME
- **Name**: `your-subdomain` (or whatever subdomain you want)
- **Value**: `cname.vercel-dns.com`
- **TTL**: 3600 (or default)

## Step 5: Database Setup
You'll need a PostgreSQL database. Free options:

### Supabase (Recommended):
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your connection string from Settings > Database
4. Run migrations: `npx prisma db push`

### Neon:
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Get your connection string
4. Run migrations: `npx prisma db push`

## Step 6: Verify Deployment
1. Check your app at `https://your-subdomain.bauhaus-seas.eu`
2. Test all major functionality
3. Check Vercel logs for any errors

## Step 7: Set Up Automatic Deployments
1. In Vercel, go to Settings > Git
2. Enable automatic deployments from your main branch
3. Every push to main will trigger a new deployment

## Troubleshooting

### Common Issues:
1. **Build Failures**: Check Vercel build logs
2. **Database Connection**: Verify DATABASE_URL is correct
3. **Environment Variables**: Ensure all required vars are set
4. **DNS Issues**: DNS changes can take up to 48 hours to propagate

### Useful Commands:
```bash
# Check build locally
npm run build

# Check Prisma schema
npx prisma generate

# Run database migrations
npx prisma db push

# Check Vercel deployment status
vercel ls
```

## Cost
- **Vercel**: Free tier includes:
  - 100GB bandwidth/month
  - 100 serverless function executions/day
  - Custom domains
  - Automatic HTTPS
  - Global CDN

## Support
- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Next.js Documentation: [nextjs.org/docs](https://nextjs.org/docs)
- Prisma Documentation: [prisma.io/docs](https://prisma.io/docs)

## Next Steps After Deployment
1. Set up monitoring and analytics
2. Configure backup strategies for your database
3. Set up CI/CD pipelines if needed
4. Consider upgrading to paid plans for production use
