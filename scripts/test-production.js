const PRODUCTION_URL = "https://pmp-prod-cl4b.vercel.app";

async function testProduction() {
  console.log("🔍 Testing production server...");

  try {
    // Test 1: Check current cache status
    console.log("\n📊 1. Checking cache status...");
    const statusResponse = await fetch(`${PRODUCTION_URL}/api/prices/cached`);
    const statusData = await statusResponse.json();
    console.log("Cache Status:", {
      count: statusData.cacheStatus?.count,
      isUpdating: statusData.cacheStatus?.isUpdating,
      message: statusData.message,
    });

    // Test 2: Force cache update
    console.log("\n🔄 2. Forcing cache update...");
    const updateResponse = await fetch(
      `${PRODUCTION_URL}/api/cache/force-update`,
      {
        method: "POST",
      }
    );
    const updateData = await updateResponse.json();
    console.log("Force Update Result:", {
      success: updateData.success,
      stockCount: updateData.stockCount,
      isRealData: updateData.isRealData,
      nvdaData: updateData.nvdaData,
      message: updateData.message,
    });

    // Test 3: Check NVDA specifically
    console.log("\n📈 3. Checking NVDA data...");
    const nvdaResponse = await fetch(
      `${PRODUCTION_URL}/api/prices/cached?tickers=NVDA`
    );
    const nvdaData = await nvdaResponse.json();
    if (nvdaData.data && nvdaData.data.length > 0) {
      const nvda = nvdaData.data[0];
      console.log("NVDA Data:", {
        ticker: nvda.ticker,
        currentPrice: nvda.currentPrice,
        percentChange: nvda.percentChange,
        marketCap: nvda.marketCap,
      });
    } else {
      console.log("No NVDA data found");
    }

    console.log("\n✅ Production test completed!");
  } catch (error) {
    console.error("❌ Error testing production:", error);
  }
}

testProduction();
