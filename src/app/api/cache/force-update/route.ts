import { NextResponse } from 'next/server';
import { stockDataCache } from '@/lib/cache';

export async function POST() {
  console.log('🔄 Force cache update requested at:', new Date().toISOString());
  
  try {
    // Get current status
    const beforeStatus = await stockDataCache.getCacheStatus();
    console.log('📊 Before update - Cache status:', beforeStatus);
    
    // Force cache update
    console.log('🚀 Starting forced cache update...');
    await stockDataCache.updateCache();
    
    // Get updated status
    const afterStatus = await stockDataCache.getCacheStatus();
    console.log('📊 After update - Cache status:', afterStatus);
    
    // Get sample data
    const stocks = await stockDataCache.getAllStocks();
    console.log(`📈 Total stocks loaded: ${stocks.length}`);
    
    return NextResponse.json({
      success: true,
      message: `Cache updated successfully! Loaded ${stocks.length} stocks.`,
      beforeStatus,
      afterStatus,
      stockCount: stocks.length,
      isRealData: stocks.length > 20,
      sampleStocks: stocks.slice(0, 5).map(s => ({
        ticker: s.ticker,
        currentPrice: s.currentPrice,
        percentChange: s.percentChange
      }))
    });
    
  } catch (error) {
    console.error('❌ Force cache update failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Cache update failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 