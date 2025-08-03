# PreMarketPrice.com - Track pre-market movements of top 300 companies globally

## 🚀 **Latest Update: Environment Variables Fixed**
- ✅ Fixed hardcoded API keys issue
- ✅ Now using environment variables properly
- ✅ Ready for Vercel deployment with live data

## Features
- Monitor changes in real-time
- Market cap fluctuations
- Build your watchlist
- Live prices: 4:00 AM - 8:00 PM EST

## Market Hours
- **Pre-market**: 4:00 - 9:30 AM
- **Market hours**: 9:30 AM - 4:00 PM  
- **After-hours**: 4:00 - 8:00 PM

## Quick Start
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `vercel-env-setup.md`)
4. Run development server: `npm run dev`

## Environment Setup
See `vercel-env-setup.md` for detailed instructions on setting up environment variables for Vercel deployment.

## API Endpoints
- `/api/prices/cached` - Get cached stock data
- `/api/debug/env` - Check environment variables
- `/api/test-polygon` - Test Polygon API connection

## Build Status
- ✅ Code pushed to GitHub
- 🔄 Ready for Vercel deployment
- 📊 Live data will be available after environment setup
