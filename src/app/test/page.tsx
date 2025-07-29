'use client';

import { useState } from 'react';

export default function TestPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const testAPI = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/prices?tickers=AAPL,MSFT,NVDA');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">API Test Page</h1>
      
      <button
        onClick={testAPI}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Test API'}
      </button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {data.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Results:</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Ticker</th>
                  <th className="border border-gray-300 px-4 py-2">Pre-Market Price</th>
                  <th className="border border-gray-300 px-4 py-2">Close Price</th>
                  <th className="border border-gray-300 px-4 py-2">% Change</th>
                  <th className="border border-gray-300 px-4 py-2">Market Cap Diff (B)</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2 font-bold">{item.ticker}</td>
                    <td className="border border-gray-300 px-4 py-2">${item.preMarketPrice}</td>
                    <td className="border border-gray-300 px-4 py-2">${item.closePrice}</td>
                    <td className={`border border-gray-300 px-4 py-2 ${item.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.percentChange >= 0 ? '+' : ''}{item.percentChange}%
                    </td>
                    <td className={`border border-gray-300 px-4 py-2 ${item.marketCapDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.marketCapDiff >= 0 ? '+' : ''}${item.marketCapDiff}B
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 