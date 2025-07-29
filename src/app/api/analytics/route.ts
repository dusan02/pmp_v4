import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    let data: any = {};

    if (type === 'all' || type === 'gainers') {
      data.topGainers = dbHelpers.getTopGainers.all();
    }

    if (type === 'all' || type === 'losers') {
      data.topLosers = dbHelpers.getTopLosers.all();
    }

    // Get overall stats
    const totalStocks = dbHelpers.getAllStocks.all().length;
    const totalFavorites = dbHelpers.getUserFavorites.all('default').length;

    data.stats = {
      totalStocks,
      totalFavorites,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
} 