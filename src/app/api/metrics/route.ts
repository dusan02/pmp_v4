import { NextRequest, NextResponse } from 'next/server';
import { getMetrics } from '@/lib/prometheus';

export async function GET(request: NextRequest) {
  try {
    const metrics = await getMetrics();
    
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error getting metrics:', error);
    return NextResponse.json(
      { error: 'Failed to get metrics' },
      { status: 500 }
    );
  }
} 