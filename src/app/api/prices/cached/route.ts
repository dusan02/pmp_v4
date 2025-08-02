import { NextRequest, NextResponse } from 'next/server';
import { stockDataCache } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tickers = searchParams.get('tickers');
    const refresh = searchParams.get('refresh') === 'true';

    // Hardcoded API key for reliability (avoids .env.local issues)
    const apiKey = 'Vi_pMLcusE8RA_SUvkPAmiyziVzlmOoX';
    console.log('🔍 API Key loaded:', apiKey ? 'Yes' : 'No');
    
    // Test API call to see what's happening
    console.log('🔍 Testing Polygon API call...');
    try {
      const testUrl = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/AAPL?apikey=${apiKey}`;
      const testResponse = await fetch(testUrl);
      console.log('🔍 Test API response status:', testResponse.status);
      if (!testResponse.ok) {
        const errorBody = await testResponse.text();
        console.error('❌ Test API call failed:', {
          status: testResponse.status,
          body: errorBody,
          url: testUrl
        });
      } else {
        console.log('✅ Test API call successful');
      }
    } catch (error) {
      console.error('❌ Test API call exception:', error);
    }

    // Get current cache status
    const cacheStatus = await stockDataCache.getCacheStatus();
    
    // If cache is empty, trigger background update but return immediately with mock data
    if (cacheStatus.count === 0) {
      console.log('Cache is empty, triggering background update...');
      // Don't await - let it run in background
      stockDataCache.updateCache().catch(err => console.error('Background cache update failed:', err));
    } else if (refresh) {
      console.log('Refresh requested, updating cache in background...');
      // Don't await - let it run in background for refresh requests too
      stockDataCache.updateCache().catch(err => console.error('Background cache refresh failed:', err));
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
      
      // If no cached data available, return empty array (frontend will use mock data)
      if (allStocks.length === 0) {
        return NextResponse.json({
          data: [],
          cacheStatus,
          message: 'Cache is updating in background, please wait...'
        });
      }
      
      return NextResponse.json({
        data: allStocks,
        cacheStatus,
        message: refresh ? 'Cache refreshing in background' : 'All data from cache'
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