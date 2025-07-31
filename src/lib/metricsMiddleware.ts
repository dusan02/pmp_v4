import { NextRequest, NextResponse } from 'next/server';
import { recordHttpRequest } from './prometheus';

export function metricsMiddleware(request: NextRequest, response: NextResponse) {
  const startTime = Date.now();
  
  // Get request details
  const method = request.method;
  const url = new URL(request.url);
  const route = url.pathname;
  const statusCode = response.status;
  
  // Calculate duration
  const duration = (Date.now() - startTime) / 1000; // Convert to seconds
  
  // Record metrics
  recordHttpRequest(method, route, statusCode, duration);
  
  return response;
}

// Middleware wrapper for API routes
export function withMetrics(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const startTime = Date.now();
    
    try {
      const response = await handler(request, ...args);
      
      // Record metrics
      const method = request.method;
      const url = new URL(request.url);
      const route = url.pathname;
      const statusCode = response?.status || 200;
      const duration = (Date.now() - startTime) / 1000;
      
      recordHttpRequest(method, route, statusCode, duration);
      
      return response;
    } catch (error) {
      // Record error metrics
      const method = request.method;
      const url = new URL(request.url);
      const route = url.pathname;
      const duration = (Date.now() - startTime) / 1000;
      
      recordHttpRequest(method, route, 500, duration);
      
      throw error;
    }
  };
} 