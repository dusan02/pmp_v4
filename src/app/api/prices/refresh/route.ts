import { NextRequest, NextResponse } from 'next/server';
import { stockDataCache } from '@/lib/cache';

export async function POST(request: NextRequest) {
  try {
    const cacheStatus = stockDataCache.getCacheStatus();
    
    // Check if update is already in progress
    if (cacheStatus.isUpdating) {
      return NextResponse.json({
        message: 'Cache update already in progress',
        cacheStatus
      }, { status: 202 });
    }

    // Start background update
    stockDataCache.updateCache();

    return NextResponse.json({
      message: 'Cache update started',
      cacheStatus
    });

  } catch (error) {
    console.error('Refresh API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const cacheStatus = stockDataCache.getCacheStatus();
    
    return NextResponse.json({
      cacheStatus,
      message: 'Cache status retrieved'
    });

  } catch (error) {
    console.error('Cache Status API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 