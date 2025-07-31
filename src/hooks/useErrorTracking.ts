import React, { useCallback, useEffect } from 'react';
import { trackError, ErrorReport } from '@/lib/errorTracking';

interface UseErrorTrackingOptions {
  componentName?: string;
  userId?: string;
  sessionId?: string;
  tags?: string[];
}

export function useErrorTracking(options: UseErrorTrackingOptions = {}) {
  const { componentName, userId, sessionId, tags = [] } = options;

  const trackComponentError = useCallback((
    error: Error | string,
    metadata?: Record<string, any>,
    additionalTags?: string[]
  ) => {
    const report: ErrorReport = {
      error,
      context: {
        userId,
        sessionId,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      },
      metadata: {
        componentName,
        ...metadata,
      },
      tags: [...tags, ...(additionalTags || []), 'client-side'],
    };

    return trackError(report);
  }, [componentName, userId, sessionId, tags]);

  // Global error handler
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleGlobalError = (event: ErrorEvent) => {
      trackComponentError(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }, ['global-error']);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackComponentError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        {},
        ['unhandled-rejection']
      );
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [trackComponentError]);

  return {
    trackError: trackComponentError,
  };
}

// Higher-order component for automatic error tracking
export function withErrorTracking<P extends object>(
  Component: React.ComponentType<P>,
  options: UseErrorTrackingOptions = {}
) {
  const WrappedComponent = (props: P) => {
    const { trackError } = useErrorTracking(options);

    useEffect(() => {
      // Track component mount
      console.log(`Component ${options.componentName || Component.name} mounted`);
    }, []);

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withErrorTracking(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Error boundary component
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error; resetError: () => void }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error; resetError: () => void }> }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    trackError({
      error,
      context: {
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      },
      metadata: {
        componentStack: errorInfo.componentStack,
      },
      tags: ['error-boundary'],
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Something went wrong</h3>
                <div className="mt-2 text-sm text-gray-500">
                  <p>An error occurred while rendering this component.</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={this.resetError}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 