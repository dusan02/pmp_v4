import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🔍 Testing Polygon API...');
  
  try {
    const apiKey = process.env.POLYGON_API_KEY || 'Vi_pMLcusE8RA_SUvkPAmiyziVzlmOoX';
    
    // Test 1: NVDA snapshot
    console.log('📊 Testing NVDA snapshot...');
    const snapshotUrl = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/NVDA?apikey=${apiKey}`;
    const snapshotResponse = await fetch(snapshotUrl);
    const snapshotData = await snapshotResponse.json();
    
    // Test 2: NVDA previous close
    console.log('📊 Testing NVDA previous close...');
    const prevUrl = `https://api.polygon.io/v2/aggs/ticker/NVDA/prev?adjusted=true&apiKey=${apiKey}`;
    const prevResponse = await fetch(prevUrl);
    const prevData = await prevResponse.json();
    
    // Test 3: NVDA shares
    console.log('📊 Testing NVDA shares...');
    const sharesUrl = `https://api.polygon.io/v3/reference/tickers/NVDA?apiKey=${apiKey}`;
    const sharesResponse = await fetch(sharesUrl);
    const sharesData = await sharesResponse.json();
    
    return NextResponse.json({
      success: true,
      tests: {
        snapshot: {
          status: snapshotResponse.status,
          ok: snapshotResponse.ok,
          data: snapshotData
        },
        previousClose: {
          status: prevResponse.status,
          ok: prevResponse.ok,
          data: prevData
        },
        shares: {
          status: sharesResponse.status,
          ok: sharesResponse.ok,
          data: sharesData
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Polygon API test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Polygon API test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 