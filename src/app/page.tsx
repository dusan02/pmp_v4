'use client';

import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Download, Table } from 'lucide-react';
import { useSortableData } from '@/hooks/useSortableData';
import { formatBillions } from '@/lib/format';
import { getLogoUrl } from '@/lib/getLogoUrl';

interface StockData {
  ticker: string;
  preMarketPrice: number;
  percentChange: number;
  marketCapDiff: number;
  marketCap: number;
}

type SortKey = 'ticker' | 'marketCap' | 'preMarketPrice' | 'percentChange' | 'marketCapDiff';

export default function HomePage() {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');


  // Mock data for demonstration
  const mockStocks: StockData[] = [
    { ticker: 'NVDA', preMarketPrice: 176.36, percentChange: -0.22, marketCapDiff: -9.52, marketCap: 4231 },
    { ticker: 'MSFT', preMarketPrice: 512.09, percentChange: -0.08, marketCapDiff: -3.06, marketCap: 3818 },
    { ticker: 'AAPL', preMarketPrice: 212.14, percentChange: -0.89, marketCapDiff: -28.60, marketCap: 3194 },
    { ticker: 'AMZN', preMarketPrice: 231.47, percentChange: -0.57, marketCapDiff: -14.01, marketCap: 2457 },
    { ticker: 'GOOGL', preMarketPrice: 195.13, percentChange: 1.32, marketCapDiff: 14.84, marketCap: 2336 },
    { ticker: 'META', preMarketPrice: 709.81, percentChange: -1.09, marketCapDiff: -16.98, marketCap: 1792 },
    { ticker: 'AVGO', preMarketPrice: 298.67, percentChange: 1.48, marketCapDiff: 20.55, marketCap: 1365 },
    { ticker: 'BRK-B', preMarketPrice: 380.40, percentChange: 0.40, marketCapDiff: 1.6, marketCap: 300 }
  ];

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('premarket-favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    
    // Fetch real data on startup
    fetchStockData(false);
  }, []);

  const fetchStockData = async (refresh = false) => {
    setLoading(true);
    setError(null);

    try {
      // Use cached API endpoint
      const response = await fetch(`/api/prices/cached?refresh=${refresh}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const result = await response.json();
      setStockData(result.data);
      
      // Log cache status
      if (result.cacheStatus) {
        console.log('Cache status:', result.cacheStatus);
      }
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
  
  // Company name mapping for search
  const getCompanyName = (ticker: string): string => {
    const companyNames: Record<string, string> = {
      'NVDA': 'NVIDIA', 'MSFT': 'Microsoft', 'AAPL': 'Apple', 'AMZN': 'Amazon', 'GOOGL': 'Alphabet', 'GOOG': 'Alphabet',
      'META': 'Meta', 'AVGO': 'Broadcom', 'BRK.A': 'Berkshire Hathaway', 'TSLA': 'Tesla', 'JPM': 'JPMorgan Chase',
      'WMT': 'Walmart', 'LLY': 'Eli Lilly', 'ORCL': 'Oracle', 'V': 'Visa', 'MA': 'Mastercard', 'NFLX': 'Netflix',
      'XOM': 'ExxonMobil', 'COST': 'Costco', 'JNJ': 'Johnson & Johnson', 'HD': 'Home Depot', 'PLTR': 'Palantir',
      'PG': 'Procter & Gamble', 'BAC': 'Bank of America', 'ABBV': 'AbbVie', 'CVX': 'Chevron', 'KO': 'Coca-Cola',
      'AMD': 'Advanced Micro Devices', 'GE': 'General Electric', 'CSCO': 'Cisco', 'TMUS': 'T-Mobile', 'WFC': 'Wells Fargo',
      'CRM': 'Salesforce', 'PM': 'Philip Morris', 'IBM': 'IBM', 'UNH': 'UnitedHealth', 'MS': 'Morgan Stanley',
      'GS': 'Goldman Sachs', 'INTU': 'Intuit', 'LIN': 'Linde', 'ABT': 'Abbott', 'AXP': 'American Express',
      'BX': 'Blackstone', 'DIS': 'Disney', 'MCD': 'McDonald\'s', 'RTX': 'Raytheon', 'NOW': 'ServiceNow',
      'MRK': 'Merck', 'CAT': 'Caterpillar', 'T': 'AT&T', 'PEP': 'PepsiCo', 'UBER': 'Uber', 'BKNG': 'Booking',
      'TMO': 'Thermo Fisher', 'VZ': 'Verizon', 'SCHW': 'Charles Schwab', 'ISRG': 'Intuitive Surgical',
      'QCOM': 'Qualcomm', 'C': 'Citigroup', 'TXN': 'Texas Instruments', 'BA': 'Boeing', 'BLK': 'BlackRock',
      'GEV': 'GE Vernova', 'ACN': 'Accenture', 'SPGI': 'S&P Global', 'AMGN': 'Amgen', 'ADBE': 'Adobe',
      'BSX': 'Boston Scientific', 'SYK': 'Stryker', 'ETN': 'Eaton', 'AMAT': 'Applied Materials', 'ANET': 'Arista Networks',
      'NEE': 'NextEra Energy', 'DHR': 'Danaher', 'HON': 'Honeywell', 'TJX': 'TJX Companies', 'PGR': 'Progressive',
      'GILD': 'Gilead Sciences', 'DE': 'Deere', 'PFE': 'Pfizer', 'COF': 'Capital One', 'KKR': 'KKR',
      'PANW': 'Palo Alto Networks', 'UNP': 'Union Pacific', 'APH': 'Amphenol', 'LOW': 'Lowe\'s', 'LRCX': 'Lam Research',
      'MU': 'Micron Technology', 'ADP': 'Automatic Data Processing', 'CMCSA': 'Comcast', 'COP': 'ConocoPhillips',
      'KLAC': 'KLA Corporation', 'VRTX': 'Vertex Pharmaceuticals', 'MDT': 'Medtronic', 'SNPS': 'Synopsys',
      'NKE': 'Nike', 'CRWD': 'CrowdStrike', 'ADI': 'Analog Devices', 'WELL': 'Welltower', 'CB': 'Chubb',
      'ICE': 'Intercontinental Exchange', 'SBUX': 'Starbucks', 'TT': 'Trane Technologies', 'SO': 'Southern Company',
      'CEG': 'Constellation Energy', 'PLD': 'Prologis', 'DASH': 'DoorDash', 'AMT': 'American Tower',
      'MO': 'Altria', 'MMC': 'Marsh & McLennan', 'CME': 'CME Group', 'CDNS': 'Cadence Design Systems',
      'LMT': 'Lockheed Martin', 'BMY': 'Bristol-Myers Squibb', 'WM': 'Waste Management', 'PH': 'Parker-Hannifin',
      'COIN': 'Coinbase', 'DUK': 'Duke Energy', 'RCL': 'Royal Caribbean', 'MCO': 'Moody\'s', 'MDLZ': 'Mondelez',
      'DELL': 'Dell Technologies', 'TDG': 'TransDigm', 'CTAS': 'Cintas', 'INTC': 'Intel', 'MCK': 'McKesson',
      'ABNB': 'Airbnb', 'GD': 'General Dynamics', 'ORLY': 'O\'Reilly Automotive', 'APO': 'Apollo Global Management',
      'SHW': 'Sherwin-Williams', 'HCA': 'HCA Healthcare', 'EMR': 'Emerson Electric', 'NOC': 'Northrop Grumman',
      'MMM': '3M', 'FTNT': 'Fortinet', 'EQIX': 'Equinix', 'CI': 'Cigna', 'UPS': 'United Parcel Service',
      'FI': 'Fiserv', 'HWM': 'Howmet Aerospace', 'AON': 'Aon', 'PNC': 'PNC Financial', 'CVS': 'CVS Health',
      'RSG': 'Republic Services', 'AJG': 'Arthur J. Gallagher', 'ITW': 'Illinois Tool Works', 'MAR': 'Marriott',
      'ECL': 'Ecolab', 'MSI': 'Motorola Solutions', 'USB': 'U.S. Bancorp', 'WMB': 'Williams Companies',
      'BK': 'Bank of New York Mellon', 'CL': 'Colgate-Palmolive', 'NEM': 'Newmont', 'PYPL': 'PayPal',
      'JCI': 'Johnson Controls', 'ZTS': 'Zoetis', 'VST': 'Vistra', 'EOG': 'EOG Resources', 'CSX': 'CSX',
      'ELV': 'Elevance Health', 'ADSK': 'Autodesk', 'APD': 'Air Products', 'AZO': 'AutoZone', 'HLT': 'Hilton',
      'WDAY': 'Workday', 'SPG': 'Simon Property Group', 'NSC': 'Norfolk Southern', 'KMI': 'Kinder Morgan',
      'TEL': 'TE Connectivity', 'FCX': 'Freeport-McMoRan', 'CARR': 'Carrier Global', 'PWR': 'Quanta Services',
      'REGN': 'Regeneron Pharmaceuticals', 'ROP': 'Roper Technologies', 'CMG': 'Chipotle Mexican Grill',
      'DLR': 'Digital Realty Trust', 'MNST': 'Monster Beverage', 'TFC': 'Truist Financial', 'TRV': 'Travelers',
      'AEP': 'American Electric Power', 'NXPI': 'NXP Semiconductors', 'AXON': 'Axon Enterprise', 'URI': 'United Rentals',
      'COR': 'Cencora', 'FDX': 'FedEx', 'NDAQ': 'Nasdaq', 'AFL': 'Aflac', 'GLW': 'Corning', 'FAST': 'Fastenal',
      'MPC': 'Marathon Petroleum', 'SLB': 'Schlumberger', 'SRE': 'Sempra Energy', 'PAYX': 'Paychex',
      'PCAR': 'PACCAR', 'MET': 'MetLife', 'BDX': 'Becton Dickinson', 'OKE': 'ONEOK', 'DDOG': 'Datadog'
    };
    return companyNames[ticker] || ticker;
  };

  // Filter by search term
  const filteredStocks = stockData.filter(stock => 
    stock.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCompanyName(stock.ticker).toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const { sorted: favoriteStocksSorted, sortKey: favSortKey, ascending: favAscending, requestSort: requestFavSort } = 
    useSortableData(favoriteStocks, "marketCap", false);
  const { sorted: allStocksSorted, sortKey: allSortKey, ascending: allAscending, requestSort: requestAllSort } = 
    useSortableData(filteredStocks, "marketCap", false);



  const renderSortIcon = (key: SortKey, currentSortKey: SortKey, ascending: boolean) => {
    if (key === currentSortKey) {
      return ascending ? <ChevronUp size={14} className="inline ml-1" /> : <ChevronDown size={14} className="inline ml-1" />;
    }
    return null;
  };

  const exportToCSV = () => {
    const headers = ['Ticker', 'Company', 'Market Cap (B)', 'Current Price ($)', '% Change', 'Market Cap Diff (B $)'];
    const csvContent = [
      headers.join(','),
      ...allStocksSorted.map(stock => [
        stock.ticker,
        getCompanyName(stock.ticker),
        stock.marketCap,
        stock.preMarketPrice?.toFixed(2) || '0.00',
        stock.percentChange?.toFixed(2) || '0.00',
        stock.marketCapDiff?.toFixed(2) || '0.00'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `premarket-stocks-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container">
      <div className="header">
        <h1 className="brand-heading">
          <span className="brand-dark">Pre</span>
          <span className="brand-gradient">Market</span>
          <span className="brand-dark">Price</span><span className="brand-dark">.com</span>
        </h1>
        <p>Track real-time pre-market movements of the top 200 largest companies traded in the US. Monitor percentage changes, market cap fluctuations, and build your personalized watchlist.</p>
        <div className="header-actions">
          <button onClick={() => fetchStockData(false)} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
          <button onClick={exportToCSV} className="export-btn">
            <Table size={16} />
            Export CSV
          </button>
        </div>
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
              <th>Company Name</th>
              <th onClick={() => requestFavSort("marketCap" as SortKey)} className="sortable">
                Market Cap&nbsp;(B)
                {renderSortIcon("marketCap", favSortKey, favAscending)}
              </th>
              <th onClick={() => requestFavSort("preMarketPrice" as SortKey)} className="sortable">
                Current Price ($)
                {renderSortIcon("preMarketPrice", favSortKey, favAscending)}
              </th>
              <th onClick={() => requestFavSort("percentChange" as SortKey)} className="sortable">
                % Change
                {renderSortIcon("percentChange", favSortKey, favAscending)}
              </th>
              <th onClick={() => requestFavSort("marketCapDiff" as SortKey)} className="sortable">
                Market Cap Diff (B $)
                {renderSortIcon("marketCapDiff", favSortKey, favAscending)}
              </th>
              <th>Favorites</th>
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
                      onError={(e) => { 
                        (e.target as HTMLImageElement).style.display = 'none';
                        const placeholder = document.createElement('div');
                        placeholder.className = 'company-logo-placeholder';
                        placeholder.textContent = stock.ticker;
                        (e.target as HTMLImageElement).parentNode?.appendChild(placeholder);
                      }}
                    />
                  </td>
                  <td><strong>{stock.ticker}</strong></td>
                  <td className="company-name">{getCompanyName(stock.ticker)}</td>
                  <td>{formatBillions(stock.marketCap)}</td>
                  <td>{stock.preMarketPrice?.toFixed(2) || '0.00'}</td>
                  <td className={stock.percentChange >= 0 ? 'positive' : 'negative'}>
                    {stock.percentChange >= 0 ? '+' : ''}{stock.percentChange?.toFixed(2) || '0.00'}%
                  </td>
                  <td className={stock.marketCapDiff >= 0 ? 'positive' : 'negative'}>
                    {stock.marketCapDiff >= 0 ? '+' : ''}{stock.marketCapDiff?.toFixed(2) || '0.00'}
                  </td>
                  <td>
                    <button 
                      className={`favorite-btn ${favorites.includes(stock.ticker) ? 'favorited' : ''}`}
                      onClick={() => toggleFavorite(stock.ticker)}
                      title={favorites.includes(stock.ticker) ? "Remove from favorites" : "Add to favorites"}
                    >
                      {favorites.includes(stock.ticker) ? '★' : '☆'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="all-stocks">
        <div className="section-header">
          <h2 data-icon="📊">All Stocks</h2>
          <div className="search-container">
            <input
              type="text"
              placeholder="Find company"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>



        <table>
          <thead>
            <tr>
              <th>Logo</th>
              <th onClick={() => requestAllSort("ticker" as SortKey)} className="sortable">
                Ticker
                {renderSortIcon("ticker", allSortKey, allAscending)}
              </th>
              <th>Company Name</th>
              <th onClick={() => requestAllSort("marketCap" as SortKey)} className="sortable">
                Market Cap&nbsp;(B)
                {renderSortIcon("marketCap", allSortKey, allAscending)}
              </th>
              <th onClick={() => requestAllSort("preMarketPrice" as SortKey)} className="sortable">
                Current Price ($)
                {renderSortIcon("preMarketPrice", allSortKey, allAscending)}
              </th>
              <th onClick={() => requestAllSort("percentChange" as SortKey)} className="sortable">
                % Change
                {renderSortIcon("percentChange", allSortKey, allAscending)}
              </th>
              <th onClick={() => requestAllSort("marketCapDiff" as SortKey)} className="sortable">
                Market Cap Diff (B $)
                {renderSortIcon("marketCapDiff", allSortKey, allAscending)}
              </th>
              <th>Favorites</th>
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
                      onError={(e) => { 
                        (e.target as HTMLImageElement).style.display = 'none';
                        const placeholder = document.createElement('div');
                        placeholder.className = 'company-logo-placeholder';
                        placeholder.textContent = stock.ticker;
                        (e.target as HTMLImageElement).parentNode?.appendChild(placeholder);
                      }}
                    />
                  </td>
                  <td><strong>{stock.ticker}</strong></td>
                  <td className="company-name">{getCompanyName(stock.ticker)}</td>
                  <td>{formatBillions(stock.marketCap)}</td>
                  <td>{stock.preMarketPrice?.toFixed(2) || '0.00'}</td>
                  <td className={stock.percentChange >= 0 ? 'positive' : 'negative'}>
                    {stock.percentChange >= 0 ? '+' : ''}{stock.percentChange?.toFixed(2) || '0.00'}%
                  </td>
                  <td className={stock.marketCapDiff >= 0 ? 'positive' : 'negative'}>
                    {stock.marketCapDiff >= 0 ? '+' : ''}{stock.marketCapDiff?.toFixed(2) || '0.00'}
                  </td>
                  <td>
                    <button 
                      className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
                      onClick={() => toggleFavorite(stock.ticker)}
                      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {isFavorite ? '★' : '☆'}
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