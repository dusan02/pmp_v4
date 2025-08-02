import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Check if we're in a serverless environment (Vercel)
const isServerless = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

// Database file path
const dbPath = path.join(process.cwd(), 'data', 'premarket.db');

// Initialize database only if not in serverless environment
let db: any = null;

if (!isServerless) {
  try {
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Initialize database
    db = new Database(dbPath);
    console.log('✅ Database initialized at:', dbPath);
  } catch (error) {
    console.log('⚠️ Database not available, using in-memory storage');
    db = null;
  }
} else {
  console.log('⚠️ Serverless environment detected, using in-memory storage');
  db = null;
}

// Enable WAL mode for better performance (only if database exists)
if (db) {
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

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_price_history_ticker_timestamp ON price_history(ticker, timestamp);
    CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
    CREATE INDEX IF NOT EXISTS idx_price_history_timestamp ON price_history(timestamp);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
  `);
}

// In-memory storage for serverless environments
const inMemoryStorage = {
  stocks: new Map(),
  priceHistory: new Map(),
  userFavorites: new Map(),
  cacheStatus: new Map()
};

// Database helper functions
export const dbHelpers = {
  // Stock management
  upsertStock: db ? db.prepare(`
    INSERT INTO stocks (ticker, company_name, market_cap, shares_outstanding, last_updated)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(ticker) DO UPDATE SET
      company_name = excluded.company_name,
      market_cap = excluded.market_cap,
      shares_outstanding = excluded.shares_outstanding,
      last_updated = excluded.last_updated
  `) : {
    run: (ticker: string, companyName: string, marketCap: number, sharesOutstanding: number, lastUpdated: string) => {
      inMemoryStorage.stocks.set(ticker, { ticker, companyName, marketCap, sharesOutstanding, lastUpdated });
    }
  },

  getStock: db ? db.prepare('SELECT * FROM stocks WHERE ticker = ?') : {
    get: (ticker: string) => inMemoryStorage.stocks.get(ticker) || null
  },
  
  getAllStocks: db ? db.prepare('SELECT * FROM stocks ORDER BY market_cap DESC') : {
    all: () => Array.from(inMemoryStorage.stocks.values()).sort((a, b) => b.marketCap - a.marketCap)
  },

  // Price history
  addPriceHistory: db ? db.prepare(`
    INSERT INTO price_history (ticker, price, volume, timestamp)
    VALUES (?, ?, ?, ?)
  `) : {
    run: (ticker: string, price: number, volume: number, timestamp: string) => {
      const key = `${ticker}_${timestamp}`;
      inMemoryStorage.priceHistory.set(key, { ticker, price, volume, timestamp });
    }
  },

  getPriceHistory: db ? db.prepare(`
    SELECT * FROM price_history 
    WHERE ticker = ? 
    ORDER BY timestamp DESC 
    LIMIT ?
  `) : {
    all: (ticker: string, limit: number) => {
      return Array.from(inMemoryStorage.priceHistory.values())
        .filter(entry => entry.ticker === ticker)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    }
  },

  getPriceHistoryRange: db ? db.prepare(`
    SELECT * FROM price_history 
    WHERE ticker = ? 
    AND timestamp BETWEEN ? AND ?
    ORDER BY timestamp DESC
  `) : {
    all: (ticker: string, startDate: string, endDate: string) => {
      return Array.from(inMemoryStorage.priceHistory.values())
        .filter(entry => entry.ticker === ticker)
        .filter(entry => {
          const entryDate = new Date(entry.timestamp);
          const start = new Date(startDate);
          const end = new Date(endDate);
          return entryDate >= start && entryDate <= end;
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  },

  // User favorites
  addFavorite: db ? db.prepare(`
    INSERT INTO user_favorites (user_id, ticker)
    VALUES (?, ?)
    ON CONFLICT(user_id, ticker) DO NOTHING
  `) : {
    run: (userId: string, ticker: string) => {
      const key = `${userId}_${ticker}`;
      inMemoryStorage.userFavorites.set(key, { userId, ticker, addedAt: new Date().toISOString() });
    }
  },

  removeFavorite: db ? db.prepare(`
    DELETE FROM user_favorites 
    WHERE user_id = ? AND ticker = ?
  `) : {
    run: (userId: string, ticker: string) => {
      const key = `${userId}_${ticker}`;
      inMemoryStorage.userFavorites.delete(key);
    }
  },

  getFavorites: db ? db.prepare(`
    SELECT ticker FROM user_favorites 
    WHERE user_id = ?
  `) : {
    all: (userId: string) => {
      return Array.from(inMemoryStorage.userFavorites.values())
        .filter(fav => fav.userId === userId)
        .map(fav => ({ ticker: fav.ticker }));
    }
  },

  // Analytics functions
  getTopGainers: db ? db.prepare(`
    SELECT ticker, company_name, market_cap, 
           (SELECT price FROM price_history WHERE ticker = stocks.ticker ORDER BY timestamp DESC LIMIT 1) as current_price,
           (SELECT price FROM price_history WHERE ticker = stocks.ticker ORDER BY timestamp DESC LIMIT 1 OFFSET 1) as previous_price
    FROM stocks 
    WHERE EXISTS (SELECT 1 FROM price_history WHERE ticker = stocks.ticker)
    ORDER BY ((current_price - previous_price) / previous_price * 100) DESC
    LIMIT 10
  `) : {
    all: () => {
      // Mock data for in-memory storage
      return [
        { ticker: 'AAPL', company_name: 'Apple Inc.', market_cap: 3000000000000, current_price: 150.0, previous_price: 145.0 },
        { ticker: 'MSFT', company_name: 'Microsoft Corp.', market_cap: 2800000000000, current_price: 320.0, previous_price: 315.0 },
        { ticker: 'GOOGL', company_name: 'Alphabet Inc.', market_cap: 1800000000000, current_price: 140.0, previous_price: 138.0 }
      ];
    }
  },

  getTopLosers: db ? db.prepare(`
    SELECT ticker, company_name, market_cap,
           (SELECT price FROM price_history WHERE ticker = stocks.ticker ORDER BY timestamp DESC LIMIT 1) as current_price,
           (SELECT price FROM price_history WHERE ticker = stocks.ticker ORDER BY timestamp DESC LIMIT 1 OFFSET 1) as previous_price
    FROM stocks 
    WHERE EXISTS (SELECT 1 FROM price_history WHERE ticker = stocks.ticker)
    ORDER BY ((current_price - previous_price) / previous_price * 100) ASC
    LIMIT 10
  `) : {
    all: () => {
      // Mock data for in-memory storage
      return [
        { ticker: 'TSLA', company_name: 'Tesla Inc.', market_cap: 800000000000, current_price: 200.0, previous_price: 210.0 },
        { ticker: 'NFLX', company_name: 'Netflix Inc.', market_cap: 250000000000, current_price: 450.0, previous_price: 460.0 },
        { ticker: 'META', company_name: 'Meta Platforms Inc.', market_cap: 900000000000, current_price: 300.0, previous_price: 305.0 }
      ];
    }
  },

  getUserFavorites: db ? db.prepare(`
    SELECT ticker FROM user_favorites 
    WHERE user_id = ?
  `) : {
    all: (userId: string) => {
      return Array.from(inMemoryStorage.userFavorites.values())
        .filter(fav => fav.userId === userId)
        .map(fav => ({ ticker: fav.ticker }));
    }
  },

  // Cache status
  setCacheStatus: db ? db.prepare(`
    INSERT INTO cache_status (key, value, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = excluded.updated_at
  `) : {
    run: (key: string, value: string, updatedAt: string) => {
      inMemoryStorage.cacheStatus.set(key, { value, updatedAt });
    }
  },

  getCacheStatus: db ? db.prepare(`
    SELECT value FROM cache_status WHERE key = ?
  `) : {
    get: (key: string) => {
      const entry = inMemoryStorage.cacheStatus.get(key);
      return entry ? { value: entry.value } : null;
    }
  },

  // User management
  createUser: db ? db.prepare(`
    INSERT INTO users (id, email, password_hash, name)
    VALUES (?, ?, ?, ?)
  `) : {
    run: (id: string, email: string, passwordHash: string, name: string) => {
      inMemoryStorage.users.set(id, { id, email, passwordHash, name, createdAt: new Date().toISOString() });
    }
  },

  getUserByEmail: db ? db.prepare(`
    SELECT * FROM users WHERE email = ?
  `) : {
    get: (email: string) => {
      return Array.from(inMemoryStorage.users.values()).find(user => user.email === email) || null;
    }
  },

  // Session management
  createSession: db ? db.prepare(`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (?, ?, ?)
  `) : {
    run: (id: string, userId: string, expiresAt: string) => {
      inMemoryStorage.sessions.set(id, { id, userId, expiresAt, createdAt: new Date().toISOString() });
    }
  },

  getSession: db ? db.prepare(`
    SELECT * FROM sessions WHERE id = ? AND expires_at > datetime('now')
  `) : {
    get: (id: string) => {
      const session = inMemoryStorage.sessions.get(id);
      if (session && new Date(session.expiresAt) > new Date()) {
        return session;
      }
      return null;
    }
  },

  deleteSession: db ? db.prepare(`
    DELETE FROM sessions WHERE id = ?
  `) : {
    run: (id: string) => {
      inMemoryStorage.sessions.delete(id);
    }
  },

  // Cleanup expired sessions
  cleanupSessions: db ? db.prepare(`
    DELETE FROM sessions WHERE expires_at <= datetime('now')
  `) : {
    run: () => {
      const now = new Date();
      for (const [id, session] of inMemoryStorage.sessions.entries()) {
        if (new Date(session.expiresAt) <= now) {
          inMemoryStorage.sessions.delete(id);
        }
      }
    }
  }
};

// Transaction support
export function runTransaction<T>(fn: () => T): T {
  if (db) {
    return db.transaction(fn)();
  } else {
    // In-memory transactions are just function calls
    return fn();
  }
}

// Initialize database
export function initializeDatabase() {
  if (db) {
    console.log('✅ Database initialized at:', dbPath);
  } else {
    console.log('⚠️ Using in-memory storage for serverless environment');
  }
}

// Cleanup function
export function closeDatabase() {
  if (db) {
    db.close();
    console.log('✅ Database closed');
  }
}

export default db; 