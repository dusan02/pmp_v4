const { stockDataCache } = require("../src/lib/cache");

async function testSingleStock() {
  console.log("🔍 Testing single stock fetch...");

  try {
    // Test NVDA specifically
    console.log("\n📊 Testing NVDA...");

    // Get shares
    const { getSharesOutstanding } = require("../src/lib/marketCapUtils");
    const shares = await getSharesOutstanding("NVDA");
    console.log(`Shares: ${shares.toLocaleString()}`);

    // Get previous close
    const { getPreviousClose } = require("../src/lib/marketCapUtils");
    const prevClose = await getPreviousClose("NVDA");
    console.log(`Previous Close: $${prevClose}`);

    // Get current price from snapshot
    const apiKey = "Vi_pMLcusE8RA_SUvkPAmiyziVzlmOoX";
    const snapshotUrl = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/NVDA?apikey=${apiKey}`;
    const response = await fetch(snapshotUrl);
    const snapshotData = await response.json();

    const { getCurrentPrice } = require("../src/lib/marketCapUtils");
    const currentPrice = getCurrentPrice(snapshotData);
    console.log(`Current Price: $${currentPrice}`);

    // Calculate percent change
    const { computePercentChange } = require("../src/lib/marketCapUtils");
    const percentChange = computePercentChange(currentPrice, prevClose);
    console.log(`Percent Change: ${percentChange}%`);

    // Calculate market cap
    const { computeMarketCap } = require("../src/lib/marketCapUtils");
    const marketCap = computeMarketCap(currentPrice, shares);
    console.log(`Market Cap: $${marketCap}B`);

    console.log("\n✅ Single stock test completed!");
  } catch (error) {
    console.error("❌ Error testing single stock:", error);
  }
}

testSingleStock();
