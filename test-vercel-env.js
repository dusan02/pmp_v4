// Test script to check Vercel environment variables
// Run this in your browser console on the Vercel deployment

console.log("🔍 Testing Vercel Environment Variables...");

// Test 1: Check environment variables endpoint
fetch("/api/debug/env")
  .then((response) => response.json())
  .then((data) => {
    console.log("✅ Environment Variables Test:", data);

    if (data.environment.hasApiKey) {
      console.log("✅ API Key is set correctly");
    } else {
      console.log("❌ API Key is NOT set");
      console.log(
        "💡 Please set POLYGON_API_KEY in Vercel environment variables"
      );
    }
  })
  .catch((error) => {
    console.error("❌ Environment test failed:", error);
  });

// Test 2: Check Polygon API
fetch("/api/test-polygon")
  .then((response) => response.json())
  .then((data) => {
    console.log("✅ Polygon API Test:", data);

    if (data.success) {
      console.log("✅ Polygon API is working");
    } else {
      console.log("❌ Polygon API is not working");
    }
  })
  .catch((error) => {
    console.error("❌ Polygon API test failed:", error);
  });

// Test 3: Check cached data
fetch("/api/prices/cached")
  .then((response) => response.json())
  .then((data) => {
    console.log("✅ Cached Data Test:", {
      dataLength: data.data?.length || 0,
      message: data.message,
      cacheStatus: data.cacheStatus,
    });

    if (data.data && data.data.length > 20) {
      console.log("✅ Live data is working (260+ stocks)");
    } else {
      console.log("⚠️ Still showing demo data (20 stocks)");
    }
  })
  .catch((error) => {
    console.error("❌ Cached data test failed:", error);
  });

console.log("📋 Instructions:");
console.log("1. Check the console output above");
console.log("2. If API Key is NOT set, go to Vercel dashboard");
console.log("3. Settings → Environment Variables → Add POLYGON_API_KEY");
console.log("4. Redeploy the application");
