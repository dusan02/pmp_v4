import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/security';

// In-memory security events store (should use database in production)
const securityEvents: Array<{
  id: string;
  timestamp: string;
  type: string;
  ip: string;
  endpoint: string;
  userAgent?: string;
  details?: any;
}> = [];

export async function GET(request: NextRequest) {
  // Validate API key
  const validation = validateRequest(request);
  if (!validation.isValid) {
    return NextResponse.json({
      success: false,
      error: 'Unauthorized - Invalid or missing API key'
    }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const type = searchParams.get('type');
    const ip = searchParams.get('ip');

    let filteredEvents = [...securityEvents];

    // Filter by type if specified
    if (type) {
      filteredEvents = filteredEvents.filter(event => event.type === type);
    }

    // Filter by IP if specified
    if (ip) {
      filteredEvents = filteredEvents.filter(event => event.ip === ip);
    }

    // Sort by timestamp (newest first) and limit results
    const sortedEvents = filteredEvents
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      data: {
        events: sortedEvents,
        total: filteredEvents.length,
        limit,
        filters: { type, ip }
      }
    });

  } catch (error) {
    console.error('Error fetching security events:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch security events'
    }, { status: 500 });
  }
}

// Function to add security events (called from security.ts)
export function addSecurityEvent(event: {
  type: string;
  ip: string;
  endpoint: string;
  userAgent?: string;
  details?: any;
}) {
  const securityEvent = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...event
  };

  securityEvents.push(securityEvent);

  // Keep only last 1000 events to prevent memory issues
  if (securityEvents.length > 1000) {
    securityEvents.splice(0, securityEvents.length - 1000);
  }

  return securityEvent;
} 