import { NextRequest, NextResponse } from 'next/server';
import { getBackgroundService } from '@/lib/backgroundService';

export async function GET(request: NextRequest) {
  try {
    const service = getBackgroundService();
    
    if (!service) {
      return NextResponse.json({
        success: false,
        error: 'Background service not initialized'
      }, { status: 404 });
    }

    const status = await service.getStatus();
    const stats = service.getStats();

    return NextResponse.json({
      success: true,
      data: {
        status,
        stats
      }
    });

  } catch (error) {
    console.error('Error getting background service status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get background service status'
    }, { status: 500 });
  }
} 