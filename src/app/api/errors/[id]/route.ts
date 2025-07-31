import { NextRequest, NextResponse } from 'next/server';
import { errorTracker } from '@/lib/errorTracking';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const error = errorTracker.getErrorById(params.id);

    if (!error) {
      return NextResponse.json(
        { error: 'Error not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: error,
    });
  } catch (error) {
    console.error('Error fetching error details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch error details' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action, notes, assignedTo } = body;

    let success = false;

    switch (action) {
      case 'resolve':
        success = errorTracker.markErrorResolved(params.id, notes);
        break;
      case 'assign':
        if (!assignedTo) {
          return NextResponse.json(
            { error: 'assignedTo is required for assign action' },
            { status: 400 }
          );
        }
        success = errorTracker.assignError(params.id, assignedTo);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "resolve" or "assign"' },
          { status: 400 }
        );
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Error not found' },
        { status: 404 }
      );
    }

    const updatedError = errorTracker.getErrorById(params.id);

    return NextResponse.json({
      success: true,
      data: updatedError,
      message: `Error ${action}ed successfully`,
    });
  } catch (error) {
    console.error('Error updating error:', error);
    return NextResponse.json(
      { error: 'Failed to update error' },
      { status: 500 }
    );
  }
} 