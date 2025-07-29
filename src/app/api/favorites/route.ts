import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers, runTransaction } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const userId = user?.id || 'default';

    const favorites = dbHelpers.getUserFavorites.all(userId);
    
    return NextResponse.json({
      success: true,
      data: favorites,
      count: favorites.length
    });

  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { ticker } = await request.json();
    const user = await getCurrentUser(request);
    const userId = user?.id || 'default';

    if (!ticker) {
      return NextResponse.json(
        { error: 'ticker is required' },
        { status: 400 }
      );
    }

    runTransaction(() => {
      dbHelpers.addFavorite.run(userId, ticker);
    });

    return NextResponse.json({
      success: true,
      message: `Added ${ticker} to favorites`
    });

  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker');
    const user = await getCurrentUser(request);
    const userId = user?.id || 'default';

    if (!ticker) {
      return NextResponse.json(
        { error: 'ticker is required' },
        { status: 400 }
      );
    }

    runTransaction(() => {
      dbHelpers.removeFavorite.run(userId, ticker);
    });

    return NextResponse.json({
      success: true,
      message: `Removed ${ticker} from favorites`
    });

  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
} 