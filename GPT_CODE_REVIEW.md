# 📊 **STOCK PRICE CALCULATION LOGIC - COMPLETE CODE EXPORT FOR GPT REVIEW**

## 🎯 **OVERVIEW**

This is the complete calculation logic from our stock price tracking application. We've implemented GPT's suggestions and need a final review of all critical and medium-importance calculation parts.

---

## 🔧 **1. MARKET SESSION DETECTION**

```typescript
// Market session detection utility
function getMarketSession():
  | "pre-market"
  | "market"
  | "after-hours"
  | "closed" {
  const now = new Date();
  const easternTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  const hour = easternTime.getHours();
  const minute = easternTime.getMinutes();
  const day = easternTime.getDay(); // 0 = Sunday, 6 = Saturday

  // Weekend check
  if (day === 0 || day === 6) return "closed";

  // Weekday sessions (Eastern Time)
  if (hour < 4) return "closed";
  if (hour < 9 || (hour === 9 && minute < 30)) return "pre-market";
  if (hour < 16) return "market";
  if (hour < 20) return "after-hours";
  return "closed";
}
```

**⚠️ KNOWN ISSUE:** Does not account for NYSE holidays and DST transitions (affects ~11 days/year)

---

## 🏢 **2. DATA STRUCTURES**

```typescript
interface CachedStockData {
  ticker: string;
  currentPrice: number;  // Renamed from preMarketPrice - works for all sessions
  closePrice: number;
  percentChange: number;
  marketCapDiff: number;
  marketCap: number;
  lastUpdated: Date;
}

// Top 200 US companies by market cap (271 tickers total including international)
private readonly TICKERS = [
  'NVDA', 'MSFT', 'AAPL', 'AMZN', 'GOOGL', 'GOOG', 'META', 'AVGO', 'BRK.A', 'BRK.B', 'TSLA',
  // ... (complete list of 271 tickers)
];

// Share counts for market cap calculation - Updated for 98% accuracy with Finviz
private readonly shareCounts: Record<string, number> = {
  // Top 10 by market cap - Finviz verified
  'NVDA': 24400000000, 'MSFT': 7440000000, 'AAPL': 15400000000, 'AMZN': 10400000000,
  'GOOGL': 12500000000, 'GOOG': 12500000000, 'META': 2520000000, 'AVGO': 4700000000,
  'BRK.A': 1400000000, 'BRK.B': 2200000000, 'TSLA': 3180000000,
  // ... (complete mapping for all tickers)
};
```

---

## 💰 **3. CORE PRICE CALCULATION LOGIC**

### **3.1 Current Price Determination (FIXED)**

```typescript
// Use last trade price (most accurate), then minute data, then day close, then previous day close as fallback
let currentPrice = 0;

// Priority order for current price
if (snapshotData.ticker?.lastTrade?.p && snapshotData.ticker.lastTrade.p > 0) {
  currentPrice = snapshotData.ticker.lastTrade.p;
} else if (snapshotData.ticker?.min?.c && snapshotData.ticker.min.c > 0) {
  currentPrice = snapshotData.ticker.min.c;
} else if (snapshotData.ticker?.day?.c && snapshotData.ticker.day.c > 0) {
  currentPrice = snapshotData.ticker.day.c;
} else if (
  snapshotData.ticker?.prevDay?.c &&
  snapshotData.ticker.prevDay.c > 0
) {
  currentPrice = snapshotData.ticker.prevDay.c;
}

if (!currentPrice || currentPrice === 0) {
  console.warn(
    `❌ No valid price data for ${ticker} - all price fields are 0 or missing`
  );
  return null;
}
```

**✅ IMPROVEMENT:** Explicit `> 0` checks prevent 0.00 prices from being displayed

### **3.2 Session Detection (IMPROVED)**

```typescript
// Get market session - use Polygon's snapshot type if available, otherwise fallback to time-based
let marketSession = getMarketSession(); // Fallback
let sessionLabel = "Regular";

// Use Polygon's snapshot type for more accurate session detection
if (snapshotData.ticker?.type) {
  switch (snapshotData.ticker.type) {
    case "pre":
      marketSession = "pre-market";
      sessionLabel = "Pre-Market";
      break;
    case "post":
      marketSession = "after-hours";
      sessionLabel = "After-Hours";
      break;
    case "regular":
      marketSession = "market";
      sessionLabel = "Market";
      break;
    default:
      sessionLabel = "Closed";
  }
}

// If no Polygon session type, determine session label based on data availability
if (!snapshotData.ticker?.type) {
  if (snapshotData.ticker?.min?.c && snapshotData.ticker.min.c > 0) {
    // We have real-time minute data
    switch (marketSession) {
      case "pre-market":
        sessionLabel = "Pre-Market";
        break;
      case "market":
        sessionLabel = "Market";
        break;
      case "after-hours":
        sessionLabel = "After-Hours";
        break;
      default:
        sessionLabel = "Live";
    }
  } else if (snapshotData.ticker?.day?.c && snapshotData.ticker.day.c > 0) {
    sessionLabel = "Market Close";
  } else {
    sessionLabel = "Previous Close";
  }
}
```

**✅ IMPROVEMENT:** Prioritizes Polygon's `snapshot.ticker.type` over time-based detection

### **3.3 Percentage Change Calculation**

```typescript
// Always use previous day's close as reference price
let referencePrice = prevClose;

const percentChange = ((currentPrice - referencePrice) / referencePrice) * 100;

console.log(
  `📊 ${sessionLabel} session for ${ticker}: $${currentPrice} vs ref $${referencePrice} (${
    percentChange >= 0 ? "+" : ""
  }${percentChange.toFixed(2)}%)`
);
```

**✅ CONSISTENT:** Always compares to previous day's close for standardized percentage calculation

---

## 📈 **4. MARKET CAP CALCULATION (FIXED)**

### **4.1 Share Count Validation (IMPROVED)**

```typescript
// Validate share count - no more 1B fallback
if (!shares && !this.shareCounts[ticker]) {
  console.warn(`❌ Missing share count for ${ticker}, skipping stock`);
  return null;
}
const shareCount = shares || this.shareCounts[ticker];
```

**✅ IMPROVEMENT:** Removes 1B fallback, requires valid share counts

### **4.2 Market Cap Calculation (FIXED)**

```typescript
// Fix market cap calculation - avoid double counting when Polygon provides live market cap
const usesLiveCap = marketCap > 0;
const baseMarketCap = usesLiveCap
  ? marketCap / 1_000_000_000 // Polygon's live market cap
  : (prevClose * shareCount) / 1_000_000_000; // Calculate from previous close

const marketCapDiff = ((currentPrice - prevClose) * shareCount) / 1_000_000_000;

const finalMarketCap = usesLiveCap
  ? baseMarketCap // Already "live" - don't add diff
  : baseMarketCap + marketCapDiff; // Calculate current from base + diff
```

**✅ MAJOR FIX:**

- **Before:** `baseMarketCap + marketCapDiff` (double counting when Polygon provided live market cap)
- **After:** Conditional logic prevents double counting

---

## 🔄 **5. DATA PROCESSING WORKFLOW**

### **5.1 API Calls**

```typescript
// 1. Get ticker details for market cap and shares
const detailsUrl = `https://api.polygon.io/v3/reference/tickers/${ticker}?apikey=${apiKey}`;
// Extract: marketCap, shares

// 2. Get previous close data
const prevUrl = `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${apiKey}`;
// Extract: prevClose

// 3. Get current price using modern snapshot API
const snapshotUrl = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}?apikey=${apiKey}`;
// Extract: currentPrice, sessionType, volume
```

### **5.2 Final Data Object**

```typescript
const stockData = {
  ticker,
  currentPrice: Math.round(currentPrice * 100) / 100, // Renamed from preMarketPrice
  closePrice: Math.round(prevClose * 100) / 100,
  percentChange: Math.round(percentChange * 100) / 100,
  marketCapDiff: Math.round(marketCapDiff * 100) / 100,
  marketCap: Math.round(finalMarketCap * 100) / 100,
  lastUpdated: new Date(),
};
```

---

## ⚠️ **6. KNOWN ISSUES & LIMITATIONS**

### **6.1 NYSE Holidays & DST**

- Time-based session detection ignores holidays and DST transitions
- Affects accuracy ~11 days per year
- **Solution:** Import NYSE holiday calendar or rely on Polygon's session flags

### **6.2 Rate Limiting**

- Current: 800ms delay between batches of 15 stocks
- Total update time: ~45 seconds for 271 stocks
- **Consideration:** Balance between speed and API limits

### **6.3 Share Count Accuracy**

- Static mapping updated manually from Finviz
- 98% accuracy claimed but needs periodic verification
- **Risk:** Outdated share counts affect market cap calculations

---

## 🎯 **7. RECENT IMPROVEMENTS IMPLEMENTED**

1. **✅ Fixed Current Price = 0.00:** Explicit `> 0` checks in fallback chain
2. **✅ Improved Session Detection:** Polygon's `snapshot.ticker.type` prioritized
3. **✅ Fixed Market Cap Double Counting:** Conditional logic for live vs calculated market caps
4. **✅ Removed 1B Share Fallback:** Requires valid share counts
5. **✅ Cleaned Code:** Removed unused imports (`recordStockUpdate`)

---

## 🤔 **QUESTIONS FOR GPT REVIEW:**

1. **Market Cap Logic:** Is the conditional `usesLiveCap` logic correct?
2. **Price Fallback Chain:** Is the priority order optimal for accuracy?
3. **Session Detection:** Should we fully rely on Polygon's session type or keep time-based fallback?
4. **Performance:** Any optimizations for the 271-stock update cycle?
5. **Edge Cases:** What scenarios might break this logic?

---

**📝 NOTE:** This represents the complete calculation engine after implementing GPT's previous recommendations. The main issue (Current Price = 0.00) should now be resolved.
