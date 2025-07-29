import Database from 'better-sqlite3';
import path from 'path';

// Database file path
const dbPath = path.join(process.cwd(), 'data', 'premarket.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS stocks (
    ticker TEXT PRIMARY KEY,
    company_name TEXT,
    market_cap REAL,
    shares_outstanding INTEGER,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker TEXT NOT NULL,
    price REAL NOT NULL,
    volume INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticker) REFERENCES stocks(ticker)
  );

  CREATE TABLE IF NOT EXISTS user_favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    ticker TEXT NOT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticker) REFERENCES stocks(ticker),
    UNIQUE(user_id, ticker)
  );

  CREATE TABLE IF NOT EXISTS cache_status (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Indexes for better performance
  CREATE INDEX IF NOT EXISTS idx_price_history_ticker_timestamp ON price_history(ticker, timestamp);
  CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
  CREATE INDEX IF NOT EXISTS idx_price_history_timestamp ON price_history(timestamp);
`);

// Database helper functions
export const dbHelpers = {
  // Stock management
  upsertStock: db.prepare(`
    INSERT INTO stocks (ticker, company_name, market_cap, shares_outstanding, last_updated)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(ticker) DO UPDATE SET
      company_name = excluded.company_name,
      market_cap = excluded.market_cap,
      shares_outstanding = excluded.shares_outstanding,
      last_updated = excluded.last_updated
  `),

  getStock: db.prepare('SELECT * FROM stocks WHERE ticker = ?'),
  getAllStocks: db.prepare('SELECT * FROM stocks ORDER BY market_cap DESC'),

  // Price history
  addPriceHistory: db.prepare(`
    INSERT INTO price_history (ticker, price, volume, timestamp)
    VALUES (?, ?, ?, ?)
  `),

  getPriceHistory: db.prepare(`
    SELECT * FROM price_history 
    WHERE ticker = ? 
    ORDER BY timestamp DESC 
    LIMIT ?
  `),

  getPriceHistoryRange: db.prepare(`
    SELECT * FROM price_history 
    WHERE ticker = ? AND timestamp BETWEEN ? AND ?
    ORDER BY timestamp ASC
  `),

  // User favorites
  addFavorite: db.prepare(`
    INSERT OR IGNORE INTO user_favorites (user_id, ticker)
    VALUES (?, ?)
  `),

  removeFavorite: db.prepare(`
    DELETE FROM user_favorites 
    WHERE user_id = ? AND ticker = ?
  `),

  getUserFavorites: db.prepare(`
    SELECT f.*, s.company_name, s.market_cap
    FROM user_favorites f
    JOIN stocks s ON f.ticker = s.ticker
    WHERE f.user_id = ?
    ORDER BY f.added_at DESC
  `),

  // Cache status
  updateCacheStatus: db.prepare(`
    INSERT OR REPLACE INTO cache_status (key, value, updated_at)
    VALUES (?, ?, ?)
  `),

  getCacheStatus: db.prepare('SELECT * FROM cache_status WHERE key = ?'),

  // Analytics
  getTopGainers: db.prepare(`
    SELECT 
      p1.ticker,
      p1.price as current_price,
      p2.price as previous_price,
      ((p1.price - p2.price) / p2.price * 100) as percent_change
    FROM price_history p1
    JOIN price_history p2 ON p1.ticker = p2.ticker
    WHERE p1.timestamp = (SELECT MAX(timestamp) FROM price_history WHERE ticker = p1.ticker)
    AND p2.timestamp = (
      SELECT MAX(timestamp) FROM price_history 
      WHERE ticker = p1.ticker AND timestamp < p1.timestamp
    )
    ORDER BY percent_change DESC
    LIMIT 10
  `),

  getTopLosers: db.prepare(`
    SELECT 
      p1.ticker,
      p1.price as current_price,
      p2.price as previous_price,
      ((p1.price - p2.price) / p2.price * 100) as percent_change
    FROM price_history p1
    JOIN price_history p2 ON p1.ticker = p2.ticker
    WHERE p1.timestamp = (SELECT MAX(timestamp) FROM price_history WHERE ticker = p1.ticker)
    AND p2.timestamp = (
      SELECT MAX(timestamp) FROM price_history 
      WHERE ticker = p1.ticker AND timestamp < p1.timestamp
    )
    ORDER BY percent_change ASC
    LIMIT 10
  `),

  // Cleanup old data (keep last 30 days)
  cleanupOldData: db.prepare(`
    DELETE FROM price_history 
    WHERE timestamp < datetime('now', '-30 days')
  `)
};

// Transaction wrapper
export function runTransaction<T>(fn: () => T): T {
  const transaction = db.transaction(fn);
  return transaction();
}

// Database initialization
export function initializeDatabase() {
  console.log('✅ Database initialized at:', dbPath);
  
  // Run cleanup every day
  setInterval(() => {
    try {
      dbHelpers.cleanupOldData.run();
      console.log('🧹 Cleaned up old price history data');
    } catch (error) {
      console.error('Error cleaning up old data:', error);
    }
  }, 24 * 60 * 60 * 1000); // 24 hours
}

// Export database instance for direct access if needed
export default db; 