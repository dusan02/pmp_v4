import { NextRequest, NextResponse } from 'next/server';
import { errorTracker, trackErrorFromRequest, ErrorReport } from '@/lib/errorTracking';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { error, context, metadata, tags, severity }: ErrorReport = body;

    if (!error) {
      return NextResponse.json(
        { error: 'Error message is required' },
        { status: 400 }
      );
    }

    const errorId = trackErrorFromRequest(error, request, metadata, tags);

    return NextResponse.json({
      success: true,
      errorId,
      message: 'Error tracked successfully',
    });
  } catch (error) {
    console.error('Error tracking API error:', error);
    return NextResponse.json(
      { error: 'Failed to track error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity') as 'low' | 'medium' | 'high' | 'critical' | undefined;
    const resolved = searchParams.get('resolved') === 'true' ? true : 
                    searchParams.get('resolved') === 'false' ? false : undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const errors = errorTracker.getErrors({
      severity,
      resolved,
      limit,
      offset,
    });

    const stats = errorTracker.getErrorStats();

    return NextResponse.json({
      success: true,
      data: {
        errors,
        stats,
        pagination: {
          limit,
          offset,
          total: stats.total,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching errors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch errors' },
      { status: 500 }
    );
  }
} 