import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';

// Enable default metrics collection
collectDefaultMetrics({ register });

// Application Metrics
export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

// Business Metrics
export const stockUpdatesTotal = new Counter({
  name: 'stock_updates_total',
  help: 'Total number of stock updates',
  labelNames: ['status'],
});

export const cacheHitsTotal = new Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_type'],
});

export const cacheMissesTotal = new Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_type'],
});

export const apiCallsTotal = new Counter({
  name: 'api_calls_total',
  help: 'Total number of API calls to external services',
  labelNames: ['service', 'endpoint', 'status'],
});

// System Metrics
export const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
});

export const memoryUsage = new Gauge({
  name: 'memory_usage_bytes',
  help: 'Memory usage in bytes',
  labelNames: ['type'],
});

export const cpuUsage = new Gauge({
  name: 'cpu_usage_percent',
  help: 'CPU usage percentage',
});

// Background Service Metrics
export const backgroundServiceStatus = new Gauge({
  name: 'background_service_status',
  help: 'Background service status (1 = running, 0 = stopped)',
});

export const backgroundUpdateDuration = new Histogram({
  name: 'background_update_duration_seconds',
  help: 'Background update duration in seconds',
  buckets: [1, 5, 10, 30, 60],
});

export const backgroundUpdateErrors = new Counter({
  name: 'background_update_errors_total',
  help: 'Total number of background update errors',
});

// User Activity Metrics
export const userFavoritesTotal = new Counter({
  name: 'user_favorites_total',
  help: 'Total number of user favorite actions',
  labelNames: ['action'], // 'add' or 'remove'
});

export const activeUsers = new Gauge({
  name: 'active_users',
  help: 'Number of active users',
});

// Security Metrics
export const securityEventsTotal = new Counter({
  name: 'security_events_total',
  help: 'Total number of security events',
  labelNames: ['event_type'],
});

export const rateLimitExceeded = new Counter({
  name: 'rate_limit_exceeded_total',
  help: 'Total number of rate limit violations',
  labelNames: ['endpoint'],
});

// Error Tracking Metrics
export const errorsTotal = new Counter({
  name: 'errors_total',
  help: 'Total number of errors tracked',
  labelNames: ['severity', 'type'],
});

export const errorOccurrences = new Counter({
  name: 'error_occurrences_total',
  help: 'Total number of error occurrences',
  labelNames: ['error_id', 'severity'],
});

export const errorResolutionTime = new Histogram({
  name: 'error_resolution_time_seconds',
  help: 'Time taken to resolve errors',
  labelNames: ['severity'],
  buckets: [60, 300, 900, 1800, 3600, 7200, 14400, 28800], // 1min to 8hours
});

// Helper functions
export function recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
  httpRequestTotal.inc({ method, route, status_code: statusCode.toString() });
  httpRequestDuration.observe({ method, route }, duration);
}

export function recordStockUpdate(status: 'success' | 'error') {
  stockUpdatesTotal.inc({ status });
}

export function recordCacheHit(cacheType: 'redis' | 'memory') {
  cacheHitsTotal.inc({ cache_type: cacheType });
}

export function recordCacheMiss(cacheType: 'redis' | 'memory') {
  cacheMissesTotal.inc({ cache_type: cacheType });
}

export function recordApiCall(service: string, endpoint: string, status: 'success' | 'error') {
  apiCallsTotal.inc({ service, endpoint, status });
}

export function updateBackgroundServiceStatus(isRunning: boolean) {
  backgroundServiceStatus.set(isRunning ? 1 : 0);
}

export function recordBackgroundUpdate(duration: number) {
  backgroundUpdateDuration.observe(duration);
}

export function recordBackgroundError() {
  backgroundUpdateErrors.inc();
}

export function recordUserFavorite(action: 'add' | 'remove') {
  userFavoritesTotal.inc({ action });
}

export function recordSecurityEvent(eventType: string) {
  securityEventsTotal.inc({ event_type: eventType });
}

export function recordRateLimitExceeded(endpoint: string) {
  rateLimitExceeded.inc({ endpoint });
}

export function recordError(severity: string, type: string) {
  errorsTotal.inc({ severity, type });
}

export function recordErrorOccurrence(errorId: string, severity: string) {
  errorOccurrences.inc({ error_id: errorId, severity });
}

export function recordErrorResolution(severity: string, resolutionTime: number) {
  errorResolutionTime.observe({ severity }, resolutionTime);
}

// Get metrics as string
export async function getMetrics(): Promise<string> {
  return register.metrics();
}

// Get metrics as JSON
export async function getMetricsJson(): Promise<any> {
  return register.getMetricsAsJSON();
} 