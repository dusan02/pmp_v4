import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

interface StockData {
  ticker: string;
  preMarketPrice: number;
  closePrice: number;
  percentChange: number;
  marketCapDiff: number;
}

interface PolygonSnapshotResponse {
  ticker: string;
  lastQuote: {
    bid: number;
    ask: number;
    timestamp: number;
  };
  lastTrade: {
    p: number;
    s: number;
    t: number;
  };
  min: {
    av: number;
    t: number;
    n: number;
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
  updated: number;
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
        // Get snapshot data from Polygon.io
        const snapshotUrl = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}?apikey=${apiKey}`;
        const snapshotResponse = await fetch(snapshotUrl);
        
        if (!snapshotResponse.ok) {
          console.error(`Failed to fetch data for ${ticker}:`, snapshotResponse.statusText);
          return null;
        }

        const snapshotData: PolygonSnapshotResponse = await snapshotResponse.json();

        // Get additional data for market cap calculation
        const tickerDetailsUrl = `https://api.polygon.io/v3/reference/tickers/${ticker}?apikey=${apiKey}`;
        const detailsResponse = await fetch(tickerDetailsUrl);
        
        let sharesOutstanding = 0;
        if (detailsResponse.ok) {
          const detailsData = await detailsResponse.json();
          sharesOutstanding = detailsData.results?.shares_outstanding || 0;
        }

        // Calculate values
        const preMarketPrice = snapshotData.lastQuote?.bid || snapshotData.lastTrade?.p || 0;
        const closePrice = snapshotData.prevDay?.c || 0;
        
        let percentChange = 0;
        if (closePrice > 0) {
          percentChange = ((preMarketPrice - closePrice) / closePrice) * 100;
        }

        // Calculate market cap difference (in billions)
        const marketCapDiff = sharesOutstanding > 0 
          ? ((preMarketPrice - closePrice) * sharesOutstanding) / 1_000_000_000
          : 0;

        const stockData = {
          ticker,
          preMarketPrice: Math.round(preMarketPrice * 100) / 100,
          closePrice: Math.round(closePrice * 100) / 100,
          percentChange: Math.round(percentChange * 100) / 100,
          marketCapDiff: Math.round(marketCapDiff * 100) / 100
        };

        // Save to database - temporarily disabled
        // try {
        //   await prisma.priceSnapshot.create({
        //     data: {
        //       ticker: stockData.ticker,
        //       preMarketPrice: stockData.preMarketPrice,
        //       closePrice: stockData.closePrice,
        //       percentChange: stockData.percentChange,
        //       marketCapDiff: stockData.marketCapDiff,
        //     }
        //   });
        //   console.log(`Saved ${ticker} data to database`);
        // } catch (dbError) {
        //   console.error(`Failed to save ${ticker} to database:`, dbError);
        //   // Continue with the response even if DB save fails
        // }

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