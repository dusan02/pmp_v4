'use client';

import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Eye, Filter, RefreshCw, Activity } from 'lucide-react';

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: string;
  ip: string;
  endpoint: string;
  userAgent?: string;
  details?: any;
}

interface SecurityStats {
  total: number;
  rateLimitExceeded: number;
  invalidApiKey: number;
  suspiciousActivity: number;
  authFailure: number;
}

export default function SecurityPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    ip: '',
    limit: '50'
  });

  const fetchSecurityEvents = async () => {
    if (!apiKey.trim()) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.ip) params.append('ip', filters.ip);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await fetch(`/api/security/events?${params}`, {
        headers: {
          'X-API-Key': apiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.data.events);
        
        // Calculate stats
        const eventTypes = data.data.events.reduce((acc: any, event: SecurityEvent) => {
          acc[event.type] = (acc[event.type] || 0) + 1;
          return acc;
        }, {});

        setStats({
          total: data.data.total,
          rateLimitExceeded: eventTypes.rate_limit_exceeded || 0,
          invalidApiKey: eventTypes.invalid_api_key || 0,
          suspiciousActivity: eventTypes.suspicious_activity || 0,
          authFailure: eventTypes.auth_failure || 0,
        });
      } else {
        console.error('Failed to fetch security events');
      }
    } catch (error) {
      console.error('Error fetching security events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (apiKey) {
      fetchSecurityEvents();
      const interval = setInterval(fetchSecurityEvents, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [apiKey, filters]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'rate_limit_exceeded': return 'text-orange-600 bg-orange-100';
      case 'invalid_api_key': return 'text-red-600 bg-red-100';
      case 'suspicious_activity': return 'text-yellow-600 bg-yellow-100';
      case 'auth_failure': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'rate_limit_exceeded': return <Activity size={16} />;
      case 'invalid_api_key': return <Shield size={16} />;
      case 'suspicious_activity': return <AlertTriangle size={16} />;
      case 'auth_failure': return <Eye size={16} />;
      default: return <Activity size={16} />;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Shield size={32} className="text-blue-600" />
        Security Monitoring
      </h1>

      {/* API Key Input */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Authentication</h2>
        <div className="flex gap-4">
          <input
            type="password"
            placeholder="Enter API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={fetchSecurityEvents}
            disabled={!apiKey.trim() || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Loading...' : 'Load Events'}
          </button>
        </div>
      </div>

      {/* Security Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Events</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.rateLimitExceeded}</div>
            <div className="text-sm text-gray-600">Rate Limit Exceeded</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-red-600">{stats.invalidApiKey}</div>
            <div className="text-sm text-gray-600">Invalid API Keys</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.suspiciousActivity}</div>
            <div className="text-sm text-gray-600">Suspicious Activity</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.authFailure}</div>
            <div className="text-sm text-gray-600">Auth Failures</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Filter size={20} />
          Filters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Event Types</option>
            <option value="rate_limit_exceeded">Rate Limit Exceeded</option>
            <option value="invalid_api_key">Invalid API Key</option>
            <option value="suspicious_activity">Suspicious Activity</option>
            <option value="auth_failure">Auth Failure</option>
          </select>
          
          <input
            type="text"
            placeholder="Filter by IP"
            value={filters.ip}
            onChange={(e) => setFilters({ ...filters, ip: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <select
            value={filters.limit}
            onChange={(e) => setFilters({ ...filters, limit: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="25">25 Events</option>
            <option value="50">50 Events</option>
            <option value="100">100 Events</option>
          </select>
        </div>
      </div>

      {/* Security Events Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Security Events</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw size={32} className="animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Loading security events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center">
            <Shield size={32} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No security events found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Endpoint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Agent
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                        {getEventIcon(event.type)}
                        {event.type.replace(/_/g, ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTimestamp(event.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {event.ip}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={event.endpoint}>
                        {event.endpoint}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={event.userAgent || 'N/A'}>
                        {event.userAgent || 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 