import { NextRequest, NextResponse } from 'next/server';
import { stockDataCache } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tickers = searchParams.get('tickers');
    const refresh = searchParams.get('refresh') === 'true';

    // Check if API key is configured
    const apiKey = process.env.POLYGON_API_KEY;
    if (!apiKey) {
      console.error('POLYGON_API_KEY not found in environment variables');
      return NextResponse.json(
        { 
          error: 'API key not configured',
          message: 'Please set up your Polygon.io API key in .env.local file. See ENV_SETUP.md for instructions.',
          data: []
        },
        { status: 500 }
      );
    }

    // Always trigger cache update if no data exists
    const cacheStatus = await stockDataCache.getCacheStatus();
    if (cacheStatus.count === 0 || refresh) {
      console.log('Cache is empty or refresh requested, updating...');
      await stockDataCache.updateCache();
    }

    if (tickers) {
      // Return specific tickers
      const tickerList = tickers.split(',').map(t => t.trim().toUpperCase());
      const results = tickerList
        .map(ticker => stockDataCache.getStock(ticker))
        .filter(Boolean);

      return NextResponse.json({
        data: results,
        cacheStatus,
        message: refresh ? 'Cache refreshed and data returned' : 'Data from cache'
      });
    } else {
      // Return all stocks
      const allStocks = await stockDataCache.getAllStocks();
      
      return NextResponse.json({
        data: allStocks,
        cacheStatus,
        message: refresh ? 'Cache refreshed and all data returned' : 'All data from cache'
      });
    }

  } catch (error) {
    console.error('Cached API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 