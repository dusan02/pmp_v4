import Decimal from 'decimal.js';

// Cache for share counts (24-hour TTL)
const shareCountCache = new Map<string, { shares: number; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Cache for previous close (24-hour TTL)
const prevCloseCache = new Map<string, { prevClose: number; timestamp: number }>();

/**
 * Get market status from Polygon API
 */
export async function getMarketStatus(): Promise<{ market: string; serverTime: string }> {
  try {
    const apiKey = process.env.POLYGON_API_KEY;
    if (!apiKey) {
      throw new Error('Polygon API key not configured');
    }

    const url = `https://api.polygon.io/v1/marketstatus/now?apiKey=${apiKey}`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      market: data.market,
      serverTime: data.serverTime
    };

  } catch (error) {
    console.error('❌ Error fetching market status:', error);
    // Default to closed if API fails
    return { market: 'closed', serverTime: new Date().toISOString() };
  }
}

/**
 * Fetch share count from Polygon API with caching
 */
export async function getSharesOutstanding(ticker: string): Promise<number> {
  const now = Date.now();
  const cached = shareCountCache.get(ticker);
  
  // Return cached value if still valid (24-hour cache)
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    console.log(`📊 Using cached shares for ${ticker}: ${cached.shares.toLocaleString()}`);
    return cached.shares;
  }

  try {
    const apiKey = process.env.POLYGON_API_KEY;
    if (!apiKey) {
      throw new Error('Polygon API key not configured');
    }

    const url = `https://api.polygon.io/v3/reference/tickers/${ticker}?apiKey=${apiKey}`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.results?.weighted_shares_outstanding) {
      throw new Error(`No weighted_shares_outstanding found for ${ticker}`);
    }

    const shares = data.results.weighted_shares_outstanding;
    
    // Cache the result for 24 hours
    shareCountCache.set(ticker, { shares, timestamp: now });
    
    console.log(`✅ Fetched shares for ${ticker}: ${shares.toLocaleString()}`);
    return shares;

  } catch (error) {
    console.error(`❌ Error fetching shares for ${ticker}:`, error);
    
    // Return cached value even if expired as fallback
    if (cached) {
      console.warn(`⚠️ Using expired cached shares for ${ticker}: ${cached.shares.toLocaleString()}`);
      return cached.shares;
    }
    
    throw error;
  }
}

/**
 * Get previous close from Polygon aggregates with adjusted=true and 24-hour cache
 */
export async function getPreviousClose(ticker: string): Promise<number> {
  const now = Date.now();
  const cached = prevCloseCache.get(ticker);
  
  // Return cached value if still valid (24-hour cache until midnight ET)
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    console.log(`📊 Using cached prevClose for ${ticker}: $${cached.prevClose}`);
    return cached.prevClose;
  }

  try {
    const apiKey = process.env.POLYGON_API_KEY;
    if (!apiKey) {
      throw new Error('Polygon API key not configured');
    }

    // Use /v2/aggs/prev?adjusted=true as single source of truth
    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${apiKey}`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data?.results?.[0]?.c) {
      throw new Error(`No previous close found for ${ticker}`);
    }

    const prevClose = data.results[0].c;
    
    // Cache the result for 24 hours
    prevCloseCache.set(ticker, { prevClose, timestamp: now });
    
    console.log(`✅ Fetched prevClose for ${ticker}: $${prevClose}`);
    return prevClose;

  } catch (error) {
    console.error(`❌ Error fetching previous close for ${ticker}:`, error);
    
    // Return cached value even if expired as fallback
    if (cached) {
      console.warn(`⚠️ Using expired cached prevClose for ${ticker}: $${cached.prevClose}`);
      return cached.prevClose;
    }
    
    throw error;
  }
}

/**
 * Get current price from Polygon snapshot data - ONLY lastTrade.p
 */
export function getCurrentPrice(snapshotData: any): number {
  // STRICT: Only use lastTrade.p, no fallbacks
  if (snapshotData?.ticker?.lastTrade?.p && snapshotData.ticker.lastTrade.p > 0) {
    return snapshotData.ticker.lastTrade.p;
  }
  
  throw new Error('No valid lastTrade.p found in snapshot data');
}

/**
 * Compute market cap in billions USD using Decimal.js for precision
 */
export function computeMarketCap(price: number, shares: number): number {
  try {
    const result = new Decimal(price)
      .mul(shares)
      .div(1_000_000_000) // Convert to billions
      .toNumber();
    
    return Math.round(result * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Error computing market cap:', error);
    throw error;
  }
}

/**
 * Compute market cap difference in billions USD using Decimal.js for precision
 */
export function computeMarketCapDiff(currentPrice: number, prevClose: number, shares: number): number {
  try {
    const result = new Decimal(currentPrice)
      .minus(prevClose)
      .mul(shares)
      .div(1_000_000_000) // Convert to billions
      .toNumber();
    
    return Math.round(result * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Error computing market cap diff:', error);
    throw error;
  }
}

/**
 * Compute percent change using Decimal.js for precision
 */
export function computePercentChange(currentPrice: number, prevClose: number): number {
  try {
    const result = new Decimal(currentPrice)
      .minus(prevClose)
      .div(prevClose)
      .times(100)
      .toNumber();
    
    return Math.round(result * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Error computing percent change:', error);
    throw error;
  }
}

/**
 * Validate price data for extreme changes (possible splits)
 */
export function validatePriceChange(currentPrice: number, prevClose: number): void {
  const percentChange = Math.abs((currentPrice - prevClose) / prevClose) * 100;
  
  if (percentChange > 40) {
    console.warn(`⚠️ Extreme price change detected: ${percentChange.toFixed(2)}% - possible stock split or data error`);
  }
  
  if (currentPrice < 0.01 || prevClose < 0.01) {
    throw new Error('Suspiciously low price detected - possible data error');
  }
}

/**
 * Log detailed calculation data for debugging
 */
export function logCalculationData(ticker: string, currentPrice: number, prevClose: number, shares: number, marketCap: number, marketCapDiff: number, percentChange: number): void {
  console.log(`📊 ${ticker} Calculation Details:`);
  console.log(`   Current Price: $${currentPrice}`);
  console.log(`   Previous Close: $${prevClose}`);
  console.log(`   Shares Outstanding: ${shares.toLocaleString()}`);
  console.log(`   Market Cap: $${marketCap}B`);
  console.log(`   Market Cap Diff: $${marketCapDiff}B`);
  console.log(`   Percent Change: ${percentChange >= 0 ? '+' : ''}${percentChange}%`);
  console.log(`   Formula: ($${currentPrice} - $${prevClose}) × ${shares.toLocaleString()} ÷ 1,000,000,000 = $${marketCapDiff}B`);
}

/**
 * Clear all caches (useful for testing)
 */
export function clearAllCaches(): void {
  shareCountCache.clear();
  prevCloseCache.clear();
  console.log('🧹 All caches cleared');
}

/**
 * Get cache status for debugging
 */
export function getCacheStatus(): { 
  shareCounts: { size: number; entries: Array<{ ticker: string; shares: number; age: number }> };
  prevCloses: { size: number; entries: Array<{ ticker: string; prevClose: number; age: number }> };
} {
  const now = Date.now();
  
  const shareEntries = Array.from(shareCountCache.entries()).map(([ticker, data]) => ({
    ticker,
    shares: data.shares,
    age: Math.round((now - data.timestamp) / 1000 / 60) // Age in minutes
  }));
  
  const prevCloseEntries = Array.from(prevCloseCache.entries()).map(([ticker, data]) => ({
    ticker,
    prevClose: data.prevClose,
    age: Math.round((now - data.timestamp) / 1000 / 60) // Age in minutes
  }));
  
  return {
    shareCounts: {
      size: shareCountCache.size,
      entries: shareEntries
    },
    prevCloses: {
      size: prevCloseCache.size,
      entries: prevCloseEntries
    }
  };
} 