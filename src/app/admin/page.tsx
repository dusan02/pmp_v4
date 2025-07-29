'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw, Activity, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface BackgroundServiceStatus {
  isRunning: boolean;
  lastUpdate: string;
  updateCount: number;
  errorCount: number;
  nextUpdate: string;
  lastError?: string;
}

interface BackgroundServiceStats {
  isRunning: boolean;
  updateCount: number;
  errorCount: number;
  lastUpdateTime: string;
  config: {
    updateInterval: number;
    batchSize: number;
    maxRetries: number;
    retryDelay: number;
  };
}

export default function AdminPage() {
  const [status, setStatus] = useState<BackgroundServiceStatus | null>(null);
  const [stats, setStats] = useState<BackgroundServiceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/background/status');
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.data.status);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  const controlService = async (action: 'start' | 'stop' | 'force-update') => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/background/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(data.message);
        await fetchStatus(); // Refresh status
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  };

  const formatDuration = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    return `${minutes} minutes`;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Background Service Admin</h1>
      
      {/* Status Message */}
      {message && (
        <div className={`p-4 mb-6 rounded-lg ${
          message.startsWith('Error') 
            ? 'bg-red-100 border border-red-400 text-red-700' 
            : 'bg-green-100 border border-green-400 text-green-700'
        }`}>
          {message}
        </div>
      )}

      {/* Control Panel */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Service Control</h2>
        <div className="flex gap-4">
          <button
            onClick={() => controlService('start')}
            disabled={loading || status?.isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Play size={16} />
            Start Service
          </button>
          
          <button
            onClick={() => controlService('stop')}
            disabled={loading || !status?.isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Pause size={16} />
            Stop Service
          </button>
          
          <button
            onClick={() => controlService('force-update')}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} />
            Force Update
          </button>
        </div>
      </div>

      {/* Service Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Activity size={20} />
            Current Status
          </h2>
          
          {status ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Status:</span>
                <div className="flex items-center gap-2">
                  {status.isRunning ? (
                    <>
                      <CheckCircle size={16} className="text-green-600" />
                      <span className="text-green-600">Running</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={16} className="text-red-600" />
                      <span className="text-red-600">Stopped</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Last Update:</span>
                <span className="text-sm text-gray-600">
                  {formatTime(status.lastUpdate)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Next Update:</span>
                <span className="text-sm text-gray-600">
                  {formatTime(status.nextUpdate)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Update Count:</span>
                <span className="text-sm text-gray-600">{status.updateCount}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Error Count:</span>
                <span className="text-sm text-gray-600">{status.errorCount}</span>
              </div>
              
              {status.lastError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="font-medium text-red-800 mb-1">Last Error:</div>
                  <div className="text-sm text-red-700">{status.lastError}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">Loading status...</div>
          )}
        </div>

        {/* Service Statistics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock size={20} />
            Service Statistics
          </h2>
          
          {stats ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Update Interval:</span>
                <span className="text-sm text-gray-600">
                  {formatDuration(stats.config.updateInterval)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Batch Size:</span>
                <span className="text-sm text-gray-600">{stats.config.batchSize}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Max Retries:</span>
                <span className="text-sm text-gray-600">{stats.config.maxRetries}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Retry Delay:</span>
                <span className="text-sm text-gray-600">
                  {formatDuration(stats.config.retryDelay)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Updates:</span>
                <span className="text-sm text-gray-600">{stats.updateCount}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Errors:</span>
                <span className="text-sm text-gray-600">{stats.errorCount}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Success Rate:</span>
                <span className="text-sm text-gray-600">
                  {stats.updateCount > 0 
                    ? `${Math.round(((stats.updateCount - stats.errorCount) / stats.updateCount) * 100)}%`
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Loading statistics...</div>
          )}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed mx-auto"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh Status
        </button>
      </div>
    </div>
  );
} 