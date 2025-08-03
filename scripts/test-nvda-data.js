const apiKey = "Vi_pMLcusE8RA_SUvkPAmiyziVzlmOoX";

async function testNVDA() {
  console.log("🔍 Testing NVDA data from Polygon API...");

  try {
    // Test 1: Previous close
    console.log("\n📊 1. Testing Previous Close...");
    const prevUrl = `https://api.polygon.io/v2/aggs/ticker/NVDA/prev?adjusted=true&apiKey=${apiKey}`;
    const prevResponse = await fetch(prevUrl);
    const prevData = await prevResponse.json();
    console.log("Previous Close Data:", JSON.stringify(prevData, null, 2));

    // Test 2: Snapshot data
    console.log("\n📊 2. Testing Snapshot Data...");
    const snapshotUrl = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/NVDA?apikey=${apiKey}`;
    const snapshotResponse = await fetch(snapshotUrl);
    const snapshotData = await snapshotResponse.json();
    console.log("Snapshot Data:", JSON.stringify(snapshotData, null, 2));

    // Test 3: Shares outstanding
    console.log("\n📊 3. Testing Shares Outstanding...");
    const sharesUrl = `https://api.polygon.io/v3/reference/tickers/NVDA?apiKey=${apiKey}`;
    const sharesResponse = await fetch(sharesUrl);
    const sharesData = await sharesResponse.json();
    console.log("Shares Data:", JSON.stringify(sharesData, null, 2));

    // Test 4: Market status
    console.log("\n📊 4. Testing Market Status...");
    const marketUrl = `https://api.polygon.io/v1/marketstatus/now?apiKey=${apiKey}`;
    const marketResponse = await fetch(marketUrl);
    const marketData = await marketResponse.json();
    console.log("Market Status:", JSON.stringify(marketData, null, 2));

    // Analysis
    console.log("\n📈 ANALYSIS:");
    if (prevData?.results?.[0]?.c) {
      console.log(`Previous Close: $${prevData.results[0].c}`);
    }

    if (snapshotData?.ticker) {
      const ticker = snapshotData.ticker;
      console.log(`Last Trade: $${ticker.lastTrade?.p || "N/A"}`);
      console.log(`Minute Data: $${ticker.min?.c || "N/A"}`);
      console.log(`Day Close: $${ticker.day?.c || "N/A"}`);
      console.log(`Session Type: ${ticker.type || "N/A"}`);
    }

    if (sharesData?.results?.weighted_shares_outstanding) {
      console.log(
        `Shares Outstanding: ${sharesData.results.weighted_shares_outstanding.toLocaleString()}`
      );
    }

    console.log(`Market Status: ${marketData.market || "N/A"}`);
  } catch (error) {
    console.error("❌ Error testing NVDA data:", error);
  }
}

testNVDA();
