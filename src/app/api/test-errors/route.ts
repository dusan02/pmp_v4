import { NextRequest, NextResponse } from 'next/server';
import { trackErrorFromRequest } from '@/lib/errorTracking';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { errorType } = body;

    switch (errorType) {
      case 'critical':
        // Simulate a critical database connection error
        trackErrorFromRequest(
          new Error('Database connection failed: Connection timeout after 30 seconds'),
          request,
          { 
            operation: 'database-connection',
            timeout: 30000,
            retries: 3
          },
          ['database', 'connection-timeout']
        );
        return NextResponse.json({ 
          success: false, 
          message: 'Critical error simulated' 
        }, { status: 500 });

      case 'high':
        // Simulate a high severity API rate limit error
        trackErrorFromRequest(
          new Error('API rate limit exceeded: 100 requests per minute limit reached'),
          request,
          { 
            operation: 'api-call',
            endpoint: '/api/prices',
            rateLimit: '100/minute',
            currentRequests: 105
          },
          ['api', 'rate-limit']
        );
        return NextResponse.json({ 
          success: false, 
          message: 'High severity error simulated' 
        }, { status: 429 });

      case 'medium':
        // Simulate a medium severity network timeout
        trackErrorFromRequest(
          new Error('Network timeout: Request to external API timed out after 10 seconds'),
          request,
          { 
            operation: 'external-api-call',
            timeout: 10000,
            endpoint: 'https://api.polygon.io'
          },
          ['network', 'timeout']
        );
        return NextResponse.json({ 
          success: false, 
          message: 'Medium severity error simulated' 
        }, { status: 408 });

      case 'low':
        // Simulate a low severity cache miss
        trackErrorFromRequest(
          new Error('Cache miss: Data not found in Redis cache'),
          request,
          { 
            operation: 'cache-read',
            cacheType: 'redis',
            key: 'stock_data'
          },
          ['cache', 'miss']
        );
        return NextResponse.json({ 
          success: false, 
          message: 'Low severity error simulated' 
        }, { status: 404 });

      case 'multiple':
        // Simulate multiple errors at once
        const errors = [
          {
            error: new Error('Redis connection failed'),
            metadata: { operation: 'redis-connection' },
            tags: ['redis', 'connection'],
            severity: 'critical' as const
          },
          {
            error: new Error('API authentication failed'),
            metadata: { operation: 'api-auth' },
            tags: ['api', 'authentication'],
            severity: 'high' as const
          },
          {
            error: new Error('Invalid user input'),
            metadata: { operation: 'input-validation' },
            tags: ['validation', 'user-input'],
            severity: 'medium' as const
          }
        ];

        errors.forEach(({ error, metadata, tags, severity }) => {
          trackErrorFromRequest(error, request, metadata, tags);
        });

        return NextResponse.json({ 
          success: false, 
          message: 'Multiple errors simulated' 
        }, { status: 500 });

      default:
        return NextResponse.json({ 
          success: false, 
          message: 'Invalid error type. Use: critical, high, medium, low, or multiple' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in test-errors endpoint:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Error testing endpoint available',
    availableErrorTypes: [
      'critical - Database connection failure',
      'high - API rate limit exceeded',
      'medium - Network timeout',
      'low - Cache miss',
      'multiple - Multiple errors at once'
    ],
    usage: 'POST with body: { "errorType": "critical|high|medium|low|multiple" }'
  });
} 