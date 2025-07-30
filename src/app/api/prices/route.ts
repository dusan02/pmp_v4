import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

interface StockData {
  ticker: string;
  preMarketPrice: number;
  closePrice: number;
  percentChange: number;
  marketCapDiff: number;
}

interface PolygonV2Response {
  ticker: {
    ticker: string;
    todaysChangePerc: number;
    todaysChange: number;
    updated: number;
    day: {
      o: number;
      h: number;
      l: number;
      c: number;
      v: number;
      vw: number;
    };
    prevDay: {
      o: number;
      h: number;
      l: number;
      c: number;
      v: number;
      vw: number;
    };
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tickers = searchParams.get('tickers');

    if (!tickers) {
      return NextResponse.json(
        { error: 'Tickers parameter is required' },
        { status: 400 }
      );
    }

    const tickerList = tickers.split(',').map(t => t.trim().toUpperCase());
    const apiKey = process.env.POLYGON_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Polygon API key not configured' },
        { status: 500 }
      );
    }

    const results: StockData[] = [];

    // Process tickers in parallel
    const promises = tickerList.map(async (ticker) => {
      try {
        // Get snapshot data from Polygon.io v2 API
        const snapshotUrl = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}?apikey=${apiKey}`;
        const snapshotResponse = await fetch(snapshotUrl);
        
        if (!snapshotResponse.ok) {
          console.error(`Failed to fetch data for ${ticker}:`, snapshotResponse.statusText);
          return null;
        }

        const snapshotData: PolygonV2Response = await snapshotResponse.json();

        // Calculate values from the v2 API response
        const currentPrice = snapshotData.ticker.day.c; // Current close price
        const prevClose = snapshotData.ticker.prevDay.c; // Previous close
        
        // Calculate percent change manually for accuracy
        const percentChange = ((currentPrice - prevClose) / prevClose) * 100;
        
        // For market cap calculation, use more accurate share counts
        const shareCounts: Record<string, number> = {
          'AAPL': 15400000000,
          'MSFT': 7440000000,
          'GOOGL': 12500000000,
          'AMZN': 10400000000,
          'NVDA': 24400000000, // Updated based on Finviz data
          'META': 2520000000,
          'TSLA': 3180000000,
          'BRK-B': 1400000000,
          'LLY': 950000000,
          'TSM': 5180000000,
          'V': 2100000000,
          'UNH': 920000000,
          'XOM': 3900000000,
          'JNJ': 2400000000,
          'WMT': 8000000000,
          'JPM': 2900000000,
          'PG': 2300000000,
          'MA': 920000000,
          'AVGO': 4700000000,
          'HD': 990000000
        };
        
        const shares = shareCounts[ticker] || 1000000000; // Default fallback
        const marketCapDiff = (currentPrice - prevClose) * shares / 1_000_000_000;

        // Calculate market cap (current price * shares)
        const marketCap = (currentPrice * shares) / 1_000_000_000;

        const stockData = {
          ticker,
          preMarketPrice: Math.round(currentPrice * 100) / 100,
          closePrice: Math.round(prevClose * 100) / 100,
          percentChange: Math.round(percentChange * 100) / 100,
          marketCapDiff: Math.round(marketCapDiff * 100) / 100,
          marketCap: Math.round(marketCap * 100) / 100
        };

        return stockData;

      } catch (error) {
        console.error(`Error processing ${ticker}:`, error);
        return null;
      }
    });

    const stockDataArray = await Promise.all(promises);
    
    // Filter out null results and add to results array
    stockDataArray.forEach(data => {
      if (data) {
        results.push(data);
      }
    });

    return NextResponse.json(results);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 