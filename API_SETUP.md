# API Setup Instructions

## Polygon.io API Key Setup

To get live market data, you need to set up a Polygon.io API key:

### 1. Get Free API Key
1. Go to [Polygon.io](https://polygon.io/)
2. Sign up for a free account
3. Get your API key from the dashboard

### 2. Create Environment File
Create a `.env.local` file in the root directory with:

```env
# Polygon.io API Key - Get your free key at https://polygon.io/
POLYGON_API_KEY=your_actual_api_key_here

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Database Configuration
DATABASE_URL=file:./data/premarket.db
```

### 3. Start Redis
Make sure Redis is running:
```bash
docker-compose up -d
```

### 4. Restart Application
Restart the development server:
```bash
npm run dev
```

## Current Status
- ✅ Application is running with demo data
- ❌ Live API data not available (missing API key)
- ✅ All UI features working
- ✅ Logo fallback system working
- ✅ Market indicators working

## Demo Data
The application currently shows realistic demo data for testing purposes. Once you set up the API key, it will automatically switch to live market data. 