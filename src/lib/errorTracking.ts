import { NextRequest } from 'next/server';
import { recordError } from './prometheus';

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  referer?: string;
  ip?: string;
  timestamp: Date;
  environment: 'development' | 'production' | 'test';
  version?: string;
  buildId?: string;
}

export interface ErrorDetails {
  id: string;
  type: 'error' | 'warning' | 'critical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stack?: string;
  name: string;
  code?: string;
  context: ErrorContext;
  metadata?: Record<string, any>;
  tags?: string[];
  fingerprint?: string;
  occurrences: number;
  firstSeen: Date;
  lastSeen: Date;
  resolved?: boolean;
  assignedTo?: string;
  notes?: string;
}

export interface ErrorReport {
  error: Error | string;
  context?: Partial<ErrorContext>;
  metadata?: Record<string, any>;
  tags?: string[];
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

class ErrorTracker {
  private errors: Map<string, ErrorDetails> = new Map();
  private readonly maxErrors = 1000; // Keep last 1000 errors in memory
  private readonly errorQueue: ErrorDetails[] = [];

  constructor() {
    // Clean up old errors periodically
    setInterval(() => this.cleanupOldErrors(), 24 * 60 * 60 * 1000); // Daily cleanup
  }

  private generateErrorId(error: Error | string, context?: Partial<ErrorContext>): string {
    const message = typeof error === 'string' ? error : error.message;
    const stack = typeof error === 'string' ? '' : error.stack || '';
    const url = context?.url || '';
    
    // Create a fingerprint based on error message, stack trace, and URL
    const fingerprint = `${message}:${stack.split('\n')[1] || ''}:${url}`;
    return this.hashString(fingerprint);
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private getErrorSeverity(error: Error | string, context?: Partial<ErrorContext>): 'low' | 'medium' | 'high' | 'critical' {
    const message = typeof error === 'string' ? error : error.message;
    
    // Critical errors
    if (message.includes('Database connection failed') || 
        message.includes('Redis connection failed') ||
        message.includes('Out of memory') ||
        message.includes('ENOMEM')) {
      return 'critical';
    }
    
    // High severity errors
    if (message.includes('API rate limit exceeded') ||
        message.includes('Authentication failed') ||
        message.includes('Authorization denied')) {
      return 'high';
    }
    
    // Medium severity errors
    if (message.includes('Network timeout') ||
        message.includes('Request failed') ||
        message.includes('Cache miss')) {
      return 'medium';
    }
    
    return 'low';
  }

  private createErrorDetails(
    error: Error | string,
    context?: Partial<ErrorContext>,
    metadata?: Record<string, any>,
    tags?: string[],
    severity?: 'low' | 'medium' | 'high' | 'critical'
  ): ErrorDetails {
    const now = new Date();
    const errorId = this.generateErrorId(error, context);
    const message = typeof error === 'string' ? error : error.message;
    const stack = typeof error === 'string' ? undefined : error.stack;
    const name = typeof error === 'string' ? 'StringError' : error.name;
    const code = typeof error === 'string' ? undefined : (error as any).code;

    return {
      id: errorId,
      type: 'error',
      severity: severity || this.getErrorSeverity(error, context),
      message,
      stack,
      name,
      code,
      context: {
        timestamp: now,
        environment: (process.env.NODE_ENV as any) || 'development',
        version: process.env.npm_package_version,
        buildId: process.env.NEXT_BUILD_ID,
        ...context,
      },
      metadata,
      tags,
      fingerprint: errorId,
      occurrences: 1,
      firstSeen: now,
      lastSeen: now,
      resolved: false,
    };
  }

  public trackError(report: ErrorReport): string {
    const errorId = this.generateErrorId(report.error, report.context);
    const existingError = this.errors.get(errorId);

    if (existingError) {
      // Update existing error
      existingError.occurrences += 1;
      existingError.lastSeen = new Date();
      if (report.metadata) {
        existingError.metadata = { ...existingError.metadata, ...report.metadata };
      }
      if (report.tags) {
        existingError.tags = [...new Set([...(existingError.tags || []), ...report.tags])];
      }
    } else {
      // Create new error
      const errorDetails = this.createErrorDetails(
        report.error,
        report.context,
        report.metadata,
        report.tags,
        report.severity
      );
      
      this.errors.set(errorId, errorDetails);
      this.errorQueue.push(errorDetails);
      
      // Keep only the last maxErrors
      if (this.errorQueue.length > this.maxErrors) {
        const oldestError = this.errorQueue.shift();
        if (oldestError) {
          this.errors.delete(oldestError.id);
        }
      }
    }

    // Record in Prometheus
    const severity = existingError?.severity || this.getErrorSeverity(report.error, report.context);
    recordError(severity, report.error instanceof Error ? report.error.name : 'StringError');

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🔴 Error Tracked:', {
        id: errorId,
        message: typeof report.error === 'string' ? report.error : report.error.message,
        severity,
        context: report.context,
        metadata: report.metadata,
      });
    }

    return errorId;
  }

  public getErrors(filters?: {
    severity?: 'low' | 'medium' | 'high' | 'critical';
    resolved?: boolean;
    limit?: number;
    offset?: number;
  }): ErrorDetails[] {
    let errors = Array.from(this.errors.values());

    if (filters?.severity) {
      errors = errors.filter(error => error.severity === filters.severity);
    }

    if (filters?.resolved !== undefined) {
      errors = errors.filter(error => error.resolved === filters.resolved);
    }

    // Sort by last seen (most recent first)
    errors.sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime());

    if (filters?.offset) {
      errors = errors.slice(filters.offset);
    }

    if (filters?.limit) {
      errors = errors.slice(0, filters.limit);
    }

    return errors;
  }

  public getErrorById(id: string): ErrorDetails | undefined {
    return this.errors.get(id);
  }

  public markErrorResolved(id: string, notes?: string): boolean {
    const error = this.errors.get(id);
    if (error) {
      error.resolved = true;
      error.notes = notes;
      return true;
    }
    return false;
  }

  public assignError(id: string, assignedTo: string): boolean {
    const error = this.errors.get(id);
    if (error) {
      error.assignedTo = assignedTo;
      return true;
    }
    return false;
  }

  public getErrorStats(): {
    total: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
    resolved: number;
    unresolved: number;
  } {
    const errors = Array.from(this.errors.values());
    
    const bySeverity = errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byType = errors.reduce((acc, error) => {
      acc[error.name] = (acc[error.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: errors.length,
      bySeverity,
      byType,
      resolved: errors.filter(e => e.resolved).length,
      unresolved: errors.filter(e => !e.resolved).length,
    };
  }

  private cleanupOldErrors(): void {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const errorsToRemove: string[] = [];

    for (const [id, error] of this.errors.entries()) {
      if (error.lastSeen < thirtyDaysAgo && error.resolved) {
        errorsToRemove.push(id);
      }
    }

    errorsToRemove.forEach(id => {
      this.errors.delete(id);
    });

    if (errorsToRemove.length > 0) {
      console.log(`🧹 Cleaned up ${errorsToRemove.length} old resolved errors`);
    }
  }

  public getRecentErrors(hours: number = 24): ErrorDetails[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return Array.from(this.errors.values()).filter(error => error.lastSeen > cutoff);
  }
}

// Global error tracker instance
export const errorTracker = new ErrorTracker();

// Convenience functions
export function trackError(report: ErrorReport): string {
  return errorTracker.trackError(report);
}

export function trackErrorFromRequest(
  error: Error | string,
  request: NextRequest,
  metadata?: Record<string, any>,
  tags?: string[]
): string {
  const context: Partial<ErrorContext> = {
    userAgent: request.headers.get('user-agent') || undefined,
    url: request.url,
    referer: request.headers.get('referer') || undefined,
    ip: request.headers.get('x-forwarded-for') || 
        request.headers.get('x-real-ip') || 
        'unknown',
  };

  return trackError({
    error,
    context,
    metadata,
    tags,
  });
}

// Error boundary for React components
export function withErrorBoundary<T extends React.ComponentType<any>>(
  Component: T,
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
): T {
  return Component;
}

// Async error wrapper
export function withErrorTracking<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: Partial<ErrorContext>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      trackError({
        error: error instanceof Error ? error : String(error),
        context,
        metadata: { args: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)) },
        tags: ['async-function'],
      });
      throw error;
    }
  };
} 