'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, User, Tag, Filter, Search, RefreshCw, Eye, MessageSquare } from 'lucide-react';
import { ErrorDetails } from '@/lib/errorTracking';

interface ErrorStats {
  total: number;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
  resolved: number;
  unresolved: number;
}

export default function ErrorsPage() {
  const [errors, setErrors] = useState<ErrorDetails[]>([]);
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedError, setSelectedError] = useState<ErrorDetails | null>(null);
  const [filters, setFilters] = useState({
    severity: '',
    resolved: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    limit: 50,
    offset: 0,
    total: 0,
  });

  const severityColors = {
    critical: 'text-red-600 bg-red-50 border-red-200',
    high: 'text-orange-600 bg-orange-50 border-orange-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    low: 'text-blue-600 bg-blue-50 border-blue-200',
  };

  const severityIcons = {
    critical: AlertTriangle,
    high: AlertTriangle,
    medium: Clock,
    low: Tag,
  };

  const loadErrors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
        ...(filters.severity && { severity: filters.severity }),
        ...(filters.resolved && { resolved: filters.resolved }),
      });

      const response = await fetch(`/api/errors?${params}`);
      const data = await response.json();

      if (data.success) {
        setErrors(data.data.errors);
        setStats(data.data.stats);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Failed to load errors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleErrorAction = async (errorId: string, action: 'resolve' | 'assign', data?: any) => {
    try {
      const response = await fetch(`/api/errors/${errorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data }),
      });

      if (response.ok) {
        await loadErrors();
        if (selectedError?.id === errorId) {
          const updatedError = errors.find(e => e.id === errorId);
          setSelectedError(updatedError || null);
        }
      }
    } catch (error) {
      console.error('Failed to update error:', error);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString();
  };

  const formatDuration = (firstSeen: Date, lastSeen: Date) => {
    const diff = new Date(lastSeen).getTime() - new Date(firstSeen).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  useEffect(() => {
    loadErrors();
  }, [filters, pagination.offset]);

  const filteredErrors = errors.filter(error => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        error.message.toLowerCase().includes(searchLower) ||
        error.name.toLowerCase().includes(searchLower) ||
        error.context.url?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Error Monitoring</h1>
          <p className="text-gray-600">Track and manage application errors in real-time</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Errors</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unresolved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.unresolved}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Critical</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.bySeverity.critical || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">High</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.bySeverity.high || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search errors..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <select
              value={filters.severity}
              onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            
            <select
              value={filters.resolved}
              onChange={(e) => setFilters(prev => ({ ...prev, resolved: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="false">Unresolved</option>
              <option value="true">Resolved</option>
            </select>
            
                          <button
                onClick={loadErrors}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <button
                onClick={async () => {
                  try {
                    await fetch('/api/test-errors', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ errorType: 'multiple' })
                    });
                    await loadErrors();
                  } catch (error) {
                    console.error('Failed to test errors:', error);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                Test Errors
              </button>
          </div>
        </div>

        {/* Errors List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Error
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Occurrences
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Seen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredErrors.map((error) => {
                  const IconComponent = severityIcons[error.severity];
                  return (
                    <tr key={error.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <IconComponent className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {error.message}
                            </div>
                            <div className="text-sm text-gray-500">
                              {error.name} • {error.context.url}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${severityColors[error.severity]}`}>
                          {error.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {error.occurrences}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(error.lastSeen)}
                      </td>
                      <td className="px-6 py-4">
                        {error.resolved ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Resolved
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedError(error)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {!error.resolved && (
                            <button
                              onClick={() => handleErrorAction(error.id, 'resolve')}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredErrors.length === 0 && !loading && (
            <div className="text-center py-12">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No errors found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.search || filters.severity || filters.resolved 
                  ? 'Try adjusting your filters.' 
                  : 'Great! No errors to display.'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} errors
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
                disabled={pagination.offset === 0}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
                disabled={pagination.offset + pagination.limit >= pagination.total}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Error Details Modal */}
        {selectedError && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Error Details</h2>
                  <button
                    onClick={() => setSelectedError(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Error Information</h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Message</dt>
                        <dd className="text-sm text-gray-900 mt-1">{selectedError.message}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Type</dt>
                        <dd className="text-sm text-gray-900 mt-1">{selectedError.name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Severity</dt>
                        <dd className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${severityColors[selectedError.severity]}`}>
                            {selectedError.severity}
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Occurrences</dt>
                        <dd className="text-sm text-gray-900 mt-1">{selectedError.occurrences}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Duration</dt>
                        <dd className="text-sm text-gray-900 mt-1">
                          {formatDuration(selectedError.firstSeen, selectedError.lastSeen)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Context</h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">URL</dt>
                        <dd className="text-sm text-gray-900 mt-1 break-all">{selectedError.context.url}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">User Agent</dt>
                        <dd className="text-sm text-gray-900 mt-1 break-all">{selectedError.context.userAgent}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">IP Address</dt>
                        <dd className="text-sm text-gray-900 mt-1">{selectedError.context.ip}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Environment</dt>
                        <dd className="text-sm text-gray-900 mt-1">{selectedError.context.environment}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">First Seen</dt>
                        <dd className="text-sm text-gray-900 mt-1">{formatDate(selectedError.firstSeen)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Last Seen</dt>
                        <dd className="text-sm text-gray-900 mt-1">{formatDate(selectedError.lastSeen)}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
                
                {selectedError.stack && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Stack Trace</h3>
                    <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                      {selectedError.stack}
                    </pre>
                  </div>
                )}
                
                {selectedError.metadata && Object.keys(selectedError.metadata).length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Metadata</h3>
                    <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                      {JSON.stringify(selectedError.metadata, null, 2)}
                    </pre>
                  </div>
                )}
                
                <div className="mt-6 flex space-x-3">
                  {!selectedError.resolved && (
                    <button
                      onClick={() => {
                        handleErrorAction(selectedError.id, 'resolve');
                        setSelectedError(null);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Mark as Resolved
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedError(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 