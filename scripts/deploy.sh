#!/bin/bash

# Deploy script for cream.fun
set -e

echo "🚀 Starting deployment process..."

# Get current version info
VERSION=$(node -e "console.log(require('../src/lib/version.ts').APP_VERSION)")
BUILD_NUMBER=$(node -e "console.log(require('../src/lib/version.ts').BUILD_NUMBER)")
GIT_COMMIT=$(git rev-parse --short HEAD)

echo "📦 Version: $VERSION"
echo "🔢 Build: $BUILD_NUMBER"
echo "📝 Commit: $GIT_COMMIT"

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Warning: Not on main branch (current: $CURRENT_BRANCH)"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Staging changes..."
    git add .
    git commit -m "feat: deploy v$VERSION ($BUILD_NUMBER) - $GIT_COMMIT

- Complete risk validation system
- Real-time market data integration
- Balance panel with deposit/withdraw
- Trade history with CSV export
- WebSocket integration for live updates
- Comprehensive diagnostics system"
fi

# Push to origin
echo "📤 Pushing to origin..."
git push origin main

# Check if Vercel CLI is available
if command -v vercel &> /dev/null; then
    echo "🌐 Deploying to Vercel..."
    vercel --prod
    echo "✅ Deployment complete!"
    echo "🔗 Check your Vercel dashboard for deployment status"
else
    echo "⚠️  Vercel CLI not found. Please deploy manually via Vercel dashboard"
fi

echo "🎉 Deployment process completed!"
echo "📊 Version: v$VERSION ($BUILD_NUMBER)"
echo "🔗 Commit: $GIT_COMMIT"
echo "⏰ Time: $(date)"

