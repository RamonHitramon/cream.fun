# 🚀 Deployment Guide

## GitHub Setup

### 1. Create Repository
1. Go to [github.com](https://github.com)
2. Click **"New repository"**
3. Fill in:
   - **Repository name**: `cream-fun-v1`
   - **Description**: `Advanced Trading Platform with Hyperliquid integration`
   - **Visibility**: `Public`
   - **Initialize**: Leave unchecked (we have existing code)
4. Click **"Create repository"**

### 2. Push Code
```bash
# Update remote URL with your actual repository
git remote set-url origin https://github.com/YOUR_USERNAME/cream-fun-v1.git

# Push to GitHub
git push -u origin main
```

## Vercel Deployment

### 1. Connect GitHub
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"New Project"**
4. Import your `cream-fun-v1` repository

### 2. Configure Project
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### 3. Environment Variables
No environment variables needed for basic functionality.

### 4. Deploy
Click **"Deploy"** and wait for build completion.

## Post-Deployment

### 1. Custom Domain (Optional)
- Go to Project Settings → Domains
- Add custom domain if needed

### 2. Environment Variables (Future)
If you need to add environment variables later:
- Go to Project Settings → Environment Variables
- Add any required API keys or configuration

### 3. Automatic Deployments
- Every push to `main` branch will trigger automatic deployment
- Preview deployments for pull requests

## Troubleshooting

### Build Errors
- Check that all dependencies are in `package.json`
- Verify Node.js version compatibility (18+)
- Check build logs in Vercel dashboard

### API Issues
- Verify `/api/markets` endpoint works locally
- Check CORS configuration in `vercel.json`
- Monitor function execution time limits

### Performance
- Images are automatically optimized by Vercel
- Static assets are cached at edge
- API responses cached for 60 seconds

## Monitoring

### Vercel Analytics
- Enable in Project Settings
- Monitor performance metrics
- Track user behavior

### Error Tracking
- Vercel automatically tracks build and runtime errors
- Check Function Logs for API issues
- Monitor Core Web Vitals

---

Your site will be live at: `https://your-project-name.vercel.app`
