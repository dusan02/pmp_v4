'use client';

import React, { useState, useEffect } from 'react';
import { useSortableData, SortKey } from '@/hooks/useSortableData';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { getLogoUrl } from '@/lib/getLogoUrl';
import { formatBillions } from '@/lib/format';

interface StockData {
  ticker: string;
  preMarketPrice: number;
  percentChange: number;
  marketCapDiff: number;
  marketCap: number;
}

export default function HomePage() {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  const mockStocks: StockData[] = [
    { ticker: 'AAPL', preMarketPrice: 150.25, percentChange: 1.18, marketCapDiff: 2.5, marketCap: 3500 },
    { ticker: 'MSFT', preMarketPrice: 320.75, percentChange: 0.80, marketCapDiff: 1.8, marketCap: 3200 },
    { ticker: 'GOOGL', preMarketPrice: 2750.00, percentChange: 1.08, marketCapDiff: 3.2, marketCap: 2800 },
    { ticker: 'AMZN', preMarketPrice: 135.80, percentChange: 1.19, marketCapDiff: 2.1, marketCap: 1800 },
    { ticker: 'NVDA', preMarketPrice: 450.25, percentChange: 1.00, marketCapDiff: 4.5, marketCap: 1200 },
    { ticker: 'META', preMarketPrice: 380.50, percentChange: 1.41, marketCapDiff: 2.8, marketCap: 1100 },
    { ticker: 'TSLA', preMarketPrice: 245.75, percentChange: 1.51, marketCapDiff: 3.6, marketCap: 800 },
    { ticker: 'BRK', preMarketPrice: 365.20, percentChange: 0.66, marketCapDiff: 1.2, marketCap: 900 },
    { ticker: 'LLY', preMarketPrice: 890.50, percentChange: 0.60, marketCapDiff: 1.8, marketCap: 700 },
    { ticker: 'TSM', preMarketPrice: 125.80, percentChange: 1.04, marketCapDiff: 2.3, marketCap: 600 },
    { ticker: 'V', preMarketPrice: 280.40, percentChange: 0.54, marketCapDiff: 1.5, marketCap: 550 },
    { ticker: 'UNH', preMarketPrice: 520.30, percentChange: 0.31, marketCapDiff: 1.1, marketCap: 500 },
    { ticker: 'XOM', preMarketPrice: 105.60, percentChange: 0.76, marketCapDiff: 1.9, marketCap: 450 },
    { ticker: 'JNJ', preMarketPrice: 165.20, percentChange: 0.43, marketCapDiff: 1.3, marketCap: 400 },
    { ticker: 'WMT', preMarketPrice: 68.90, percentChange: 0.73, marketCapDiff: 2.2, marketCap: 520 },
    { ticker: 'JPM', preMarketPrice: 185.30, percentChange: 0.60, marketCapDiff: 2.8, marketCap: 480 },
    { ticker: 'PG', preMarketPrice: 155.80, percentChange: 0.58, marketCapDiff: 1.7, marketCap: 380 },
    { ticker: 'MA', preMarketPrice: 420.50, percentChange: 0.53, marketCapDiff: 2.1, marketCap: 350 },
    { ticker: 'AVGO', preMarketPrice: 890.20, percentChange: 0.52, marketCapDiff: 1.4, marketCap: 320 },
    { ticker: 'HD', preMarketPrice: 380.40, percentChange: 0.40, marketCapDiff: 1.6, marketCap: 300 }
  ];

  // Sortable data hooks
  const { sorted: allStocksSorted, sortKey: allSortKey, ascending: allAscending, requestSort: requestAllSort } = 
    useSortableData(stockData, "marketCap", false);

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('premarket-favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    
    // Set initial data
    setStockData(mockStocks);
  }, []);

  const fetchStockData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/prices');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setStockData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Fallback to mock data
      setStockData(mockStocks);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (ticker: string) => {
    const newFavorites = favorites.includes(ticker)
      ? favorites.filter(t => t !== ticker)
      : [...favorites, ticker];
    
    setFavorites(newFavorites);
    localStorage.setItem('premarket-favorites', JSON.stringify(newFavorites));
  };

  const favoriteStocks = stockData.filter(stock => favorites.includes(stock.ticker));
  const { sorted: favoriteStocksSorted, sortKey: favSortKey, ascending: favAscending, requestSort: requestFavSort } = 
    useSortableData(favoriteStocks, "marketCap", false);

  const renderSortIcon = (key: SortKey, currentSortKey: SortKey, ascending: boolean) => {
    if (key === currentSortKey) {
      return ascending ? <ChevronUp size={14} className="inline ml-1" /> : <ChevronDown size={14} className="inline ml-1" />;
    }
    return null;
  };

  return (
    <div className="container">
      <div className="header">
        <h1 className="brand-heading">
          <span className="brand-dark">Pre</span>
          <span className="brand-gradient">Market</span>
          <span className="brand-dark">Price</span><span className="brand-dark">.com</span>
        </h1>
        <p>Pre-market percentage changes and market cap differences for S&P 500 companies</p>
        <button onClick={fetchStockData} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
          <br />
          <small>Showing demo data for testing purposes.</small>
        </div>
      )}

      {favoriteStocks.length > 0 && (
        <section className="favorites">
          <h2 data-icon="⭐">Favorites</h2>
          <table>
            <thead>
              <tr>
                <th>Logo</th>
                <th onClick={() => requestFavSort("ticker" as SortKey)} className="sortable">
                  Ticker
                  {renderSortIcon("ticker", favSortKey, favAscending)}
                </th>
                <th onClick={() => requestFavSort("marketCap" as SortKey)} className="sortable">
                  Market Cap&nbsp;(B)
                  {renderSortIcon("marketCap", favSortKey, favAscending)}
                </th>
                <th onClick={() => requestFavSort("preMarketPrice" as SortKey)} className="sortable">
                  Pre-Market Price
                  {renderSortIcon("preMarketPrice", favSortKey, favAscending)}
                </th>
                <th onClick={() => requestFavSort("percentChange" as SortKey)} className="sortable">
                  % Change
                  {renderSortIcon("percentChange", favSortKey, favAscending)}
                </th>
                <th onClick={() => requestFavSort("marketCapDiff" as SortKey)} className="sortable">
                  Market Cap Diff (B)
                  {renderSortIcon("marketCapDiff", favSortKey, favAscending)}
                </th>
                <th>Favorite</th>
              </tr>
            </thead>
            <tbody>
              {favoriteStocksSorted.map((stock) => (
                <tr key={stock.ticker}>
                  <td>
                    <img
                      src={getLogoUrl(stock.ticker)}
                      alt={`${stock.ticker} logo`}
                      className="company-logo"
                      onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                    />
                  </td>
                  <td><strong>{stock.ticker}</strong></td>
                  <td>{formatBillions(stock.marketCap)}</td>
                  <td>${stock.preMarketPrice?.toFixed(2) || '0.00'}</td>
                  <td className={stock.percentChange >= 0 ? 'positive' : 'negative'}>
                    {stock.percentChange >= 0 ? '+' : ''}{stock.percentChange?.toFixed(2) || '0.00'}%
                  </td>
                  <td>{stock.marketCapDiff >= 0 ? '+' : ''}${stock.marketCapDiff?.toFixed(2) || '0.00'}B</td>
                  <td>
                    <button 
                      className="favorite-btn" 
                      onClick={() => toggleFavorite(stock.ticker)}
                      title="Remove from favorites"
                    >
                      ⭐
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="all-stocks">
        <h2 data-icon="📊">All Stocks</h2>
        <table>
          <thead>
            <tr>
              <th>Logo</th>
              <th onClick={() => requestAllSort("ticker" as SortKey)} className="sortable">
                Ticker
                {renderSortIcon("ticker", allSortKey, allAscending)}
              </th>
              <th onClick={() => requestAllSort("marketCap" as SortKey)} className="sortable">
                Market Cap&nbsp;(B)
                {renderSortIcon("marketCap", allSortKey, allAscending)}
              </th>
              <th onClick={() => requestAllSort("preMarketPrice" as SortKey)} className="sortable">
                Pre-Market Price
                {renderSortIcon("preMarketPrice", allSortKey, allAscending)}
              </th>
              <th onClick={() => requestAllSort("percentChange" as SortKey)} className="sortable">
                % Change
                {renderSortIcon("percentChange", allSortKey, allAscending)}
              </th>
              <th onClick={() => requestAllSort("marketCapDiff" as SortKey)} className="sortable">
                Market Cap Diff (B)
                {renderSortIcon("marketCapDiff", allSortKey, allAscending)}
              </th>
              <th>Favorite</th>
            </tr>
          </thead>
          <tbody>
            {allStocksSorted.map((stock) => {
              const isFavorite = favorites.includes(stock.ticker);
              return (
                <tr key={stock.ticker}>
                  <td>
                    <img
                      src={getLogoUrl(stock.ticker)}
                      alt={`${stock.ticker} logo`}
                      className="company-logo"
                      onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                    />
                  </td>
                  <td><strong>{stock.ticker}</strong></td>
                  <td>{formatBillions(stock.marketCap)}</td>
                  <td>${stock.preMarketPrice?.toFixed(2) || '0.00'}</td>
                  <td className={stock.percentChange >= 0 ? 'positive' : 'negative'}>
                    {stock.percentChange >= 0 ? '+' : ''}{stock.percentChange?.toFixed(2) || '0.00'}%
                  </td>
                  <td>{stock.marketCapDiff >= 0 ? '+' : ''}${stock.marketCapDiff?.toFixed(2) || '0.00'}B</td>
                  <td>
                    <button 
                      className="favorite-btn" 
                      onClick={() => toggleFavorite(stock.ticker)}
                      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {isFavorite ? '⭐' : '☆'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <div className="footer">
        <p>Data provided by Polygon.io • Powered by Next.js</p>
        <p>
          <a
            href="https://kiddobank.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit Kiddobank.com
          </a>
        </p>
      </div>
    </div>
  );
} 