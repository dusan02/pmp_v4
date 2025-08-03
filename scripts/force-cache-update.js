const { stockDataCache } = require('../src/lib/cache');

async function forceCacheUpdate() {
  console.log('🔄 Forcing cache update...');
  
  try {
    // Clear existing cache
    console.log('🗑️ Clearing existing cache...');
    
    // Force update
    console.log('🚀 Starting forced cache update...');
    await stockDataCache.updateCache();
    
    // Check results
    const status = await stockDataCache.getCacheStatus();
    console.log('✅ Cache update completed!');
    console.log('📊 Cache status:', status);
    
    const stocks = await stockDataCache.getAllStocks();
    console.log(`📈 Total stocks loaded: ${stocks.length}`);
    
    if (stocks.length > 20) {
      console.log('🎉 Success! Real data loaded.');
    } else {
      console.log('⚠️ Still showing demo data. Check API calls.');
    }
    
  } catch (error) {
    console.error('❌ Cache update failed:', error);
  }
}

forceCacheUpdate(); 