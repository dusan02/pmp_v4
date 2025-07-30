// Security events management
const securityEvents: Array<{
  id: string;
  timestamp: string;
  type: string;
  ip: string;
  endpoint: string;
  userAgent?: string;
  details?: any;
}> = [];

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

export function getSecurityEvents(limit: number = 100, type?: string, ip?: string) {
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
  return filteredEvents
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
} 