import { NextRequest, NextResponse } from 'next/server';
import { stockDataCache } from '@/lib/cache';

export async function GET(request: NextRequest) {
  console.log('🚀 /api/prices/cached route called at:', new Date().toISOString());
  
  try {
    const { searchParams } = new URL(request.url);
    const tickers = searchParams.get('tickers');
    const refresh = searchParams.get('refresh') === 'true';

    console.log('🔍 Request params:', { tickers, refresh });

    // Hardcoded API key for reliability (avoids environment variable issues)
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
    
    // If cache is empty or has only demo data (20 stocks), trigger background update
    if ((cacheStatus.count === 0 || cacheStatus.count <= 20) && !cacheStatus.isUpdating) {
      console.log(`Cache has ${cacheStatus.count} stocks (likely demo data), triggering background update...`);
      // Don't await - let it run in background
      stockDataCache.updateCache().catch(err => console.error('Background cache update failed:', err));
    } else if (refresh && !cacheStatus.isUpdating) {
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
      
      // If no cached data available or only demo data, return demo data with update message
      if (allStocks.length === 0) {
        return NextResponse.json({
          data: [],
          cacheStatus,
          message: 'Cache is updating in background, please wait...'
        });
      }
      
      // If we have demo data (20 stocks), show message that real data is loading
      const message = allStocks.length <= 20 
        ? 'Loading real data in background... (showing demo data)'
        : refresh ? 'Cache refreshing in background' : 'All data from cache';
      
      return NextResponse.json({
        data: allStocks,
        cacheStatus,
        message
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