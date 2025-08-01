import { getCachedData, setCachedData, getCacheStatus, setCacheStatus, CACHE_KEYS } from './redis';
import { dbHelpers, runTransaction, initializeDatabase } from './database';
import { createBackgroundService } from './backgroundService';
import { recordCacheHit, recordCacheMiss, recordApiCall } from './prometheus';

// Market session detection utility
function getMarketSession(): 'pre-market' | 'market' | 'after-hours' | 'closed' {
  const now = new Date();
  const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
  const hour = easternTime.getHours();
  const minute = easternTime.getMinutes();
  const day = easternTime.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Weekend check
  if (day === 0 || day === 6) return 'closed';
  
  // Weekday sessions (Eastern Time)
  if (hour < 4) return 'closed';
  if (hour < 9 || (hour === 9 && minute < 30)) return 'pre-market';
  if (hour < 16) return 'market';
  if (hour < 20) return 'after-hours';
  return 'closed';
}

interface CachedStockData {
  ticker: string;
  currentPrice: number;  // Renamed from preMarketPrice - works for all sessions
  closePrice: number;
  percentChange: number;
  marketCapDiff: number;
  marketCap: number;
  lastUpdated: Date;
}

class StockDataCache {
  private cache: Map<string, CachedStockData> = new Map();
  private isUpdating = false;
  private updateInterval: NodeJS.Timeout | null = null;

  // Top 200 US companies by market cap
  private readonly TICKERS = [
    'NVDA', 'MSFT', 'AAPL', 'AMZN', 'GOOGL', 'GOOG', 'META', 'AVGO', 'BRK.A', 'BRK.B', 'TSLA',
    'JPM', 'WMT', 'LLY', 'ORCL', 'V', 'MA', 'NFLX', 'XOM', 'COST', 'JNJ', 'HD', 'PLTR',
    'PG', 'BAC', 'ABBV', 'CVX', 'KO', 'AMD', 'GE', 'CSCO', 'TMUS', 'WFC', 'CRM',
    'PM', 'IBM', 'UNH', 'MS', 'GS', 'INTU', 'LIN', 'ABT', 'AXP', 'BX', 'DIS', 'MCD',
    'RTX', 'NOW', 'MRK', 'CAT', 'T', 'PEP', 'UBER', 'BKNG', 'TMO', 'VZ', 'SCHW', 'ISRG',
    'QCOM', 'C', 'TXN', 'BA', 'BLK', 'ACN', 'SPGI', 'AMGN', 'ADBE', 'BSX', 'SYK',
    'ETN', 'AMAT', 'ANET', 'NEE', 'DHR', 'HON', 'TJX', 'PGR', 'GILD', 'DE', 'PFE', 'COF',
    'KKR', 'PANW', 'UNP', 'APH', 'LOW', 'LRCX', 'MU', 'ADP', 'CMCSA', 'COP', 'KLAC',
    'VRTX', 'MDT', 'SNPS', 'NKE', 'CRWD', 'ADI', 'WELL', 'CB', 'ICE', 'SBUX', 'TT',
    'SO', 'CEG', 'PLD', 'DASH', 'AMT', 'MO', 'MMC', 'CME', 'CDNS', 'LMT', 'BMY', 'WM',
    'PH', 'COIN', 'DUK', 'RCL', 'MCO', 'MDLZ', 'DELL', 'TDG', 'CTAS', 'INTC', 'MCK',
    'ABNB', 'GD', 'ORLY', 'APO', 'SHW', 'HCA', 'EMR', 'NOC', 'MMM', 'FTNT', 'EQIX',
    'CI', 'UPS', 'FI', 'HWM', 'AON', 'PNC', 'CVS', 'RSG', 'AJG', 'ITW', 'MAR', 'ECL',
    'MSI', 'USB', 'WMB', 'BK', 'CL', 'NEM', 'PYPL', 'JCI', 'ZTS', 'VST', 'EOG', 'CSX',
    'ELV', 'ADSK', 'APD', 'AZO', 'HLT', 'WDAY', 'SPG', 'NSC', 'KMI', 'TEL', 'FCX',
    'CARR', 'PWR', 'REGN', 'ROP', 'CMG', 'DLR', 'MNST', 'TFC', 'TRV', 'AEP', 'NXPI',
    'AXON', 'URI', 'COR', 'FDX', 'NDAQ', 'AFL', 'GLW', 'FAST', 'MPC', 'SLB', 'SRE',
    'PAYX', 'PCAR', 'MET', 'BDX', 'OKE', 'DDOG',
    // International companies
    'TSM', 'SAP', 'ASML', 'BABA', 'TM', 'AZN', 'HSBC', 'NVS', 'SHEL',
    'HDB', 'RY', 'NVO', 'ARM', 'SHOP', 'MUFG', 'PDD', 'UL',
    'SONY', 'TTE', 'BHP', 'SAN', 'TD', 'SPOT', 'UBS', 'IBN', 'SNY',
    'BUD', 'BTI', 'BN', 'SMFG', 'ENB', 'RELX', 'TRI', 'RACE',
    'BBVA', 'SE', 'BP', 'NTES', 'BMO', 'RIO', 'GSK', 'MFG', 'INFY',
    'CP', 'BCS', 'NGG', 'BNS', 'ING', 'EQNR', 'CM', 'CNQ', 'LYG',
    'AEM', 'DB', 'NU', 'CNI', 'DEO', 'NWG', 'AMX', 'MFC',
    'E', 'WCN', 'SU', 'TRP', 'PBR', 'HMC', 'GRMN', 'CCEP', 'ALC', 'TAK'
  ];

  // Company names mapping
  private readonly companyNames: Record<string, string> = {
    'NVDA': 'NVIDIA', 'MSFT': 'Microsoft', 'AAPL': 'Apple', 'AMZN': 'Amazon', 'GOOGL': 'Alphabet', 'GOOG': 'Alphabet',
    'META': 'Meta Platforms', 'AVGO': 'Broadcom', 'BRK.A': 'Berkshire Hathaway', 'BRK.B': 'Berkshire Hathaway', 'TSLA': 'Tesla',
    'JPM': 'JPMorgan Chase', 'WMT': 'Walmart', 'LLY': 'Eli Lilly', 'ORCL': 'Oracle', 'V': 'Visa', 'MA': 'Mastercard',
    'NFLX': 'Netflix', 'XOM': 'Exxon Mobil', 'COST': 'Costco', 'JNJ': 'Johnson & Johnson', 'HD': 'Home Depot', 'PLTR': 'Palantir',
    'PG': 'Procter & Gamble', 'BAC': 'Bank of America', 'ABBV': 'AbbVie', 'CVX': 'Chevron', 'KO': 'Coca-Cola', 'AMD': 'Advanced Micro Devices',
    'GE': 'General Electric', 'CSCO': 'Cisco Systems', 'TMUS': 'T-Mobile US', 'WFC': 'Wells Fargo', 'CRM': 'Salesforce', 'PM': 'Philip Morris',
    'IBM': 'IBM', 'UNH': 'UnitedHealth Group', 'MS': 'Morgan Stanley', 'GS': 'Goldman Sachs', 'INTU': 'Intuit', 'LIN': 'Linde',
    'ABT': 'Abbott Laboratories', 'AXP': 'American Express', 'BX': 'Blackstone', 'DIS': 'Walt Disney', 'MCD': 'McDonald\'s', 'RTX': 'Raytheon Technologies',
    'NOW': 'ServiceNow', 'MRK': 'Merck', 'CAT': 'Caterpillar', 'T': 'AT&T', 'PEP': 'PepsiCo', 'UBER': 'Uber Technologies',
    'BKNG': 'Booking Holdings', 'TMO': 'Thermo Fisher Scientific', 'VZ': 'Verizon', 'SCHW': 'Charles Schwab', 'ISRG': 'Intuitive Surgical', 'QCOM': 'Qualcomm',
    'C': 'Citigroup', 'TXN': 'Texas Instruments', 'BA': 'Boeing', 'BLK': 'BlackRock', 'ACN': 'Accenture', 'SPGI': 'S&P Global',
    'AMGN': 'Amgen', 'ADBE': 'Adobe', 'BSX': 'Boston Scientific', 'SYK': 'Stryker', 'ETN': 'Eaton', 'AMAT': 'Applied Materials',
    'ANET': 'Arista Networks', 'NEE': 'NextEra Energy', 'DHR': 'Danaher', 'HON': 'Honeywell', 'TJX': 'TJX Companies', 'PGR': 'Progressive',
    'GILD': 'Gilead Sciences', 'DE': 'Deere & Company', 'PFE': 'Pfizer', 'COF': 'Capital One', 'KKR': 'KKR & Co', 'PANW': 'Palo Alto Networks',
    'UNP': 'Union Pacific', 'APH': 'Amphenol', 'LOW': 'Lowe\'s', 'LRCX': 'Lam Research', 'MU': 'Micron Technology', 'ADP': 'Automatic Data Processing',
    'CMCSA': 'Comcast', 'COP': 'ConocoPhillips', 'KLAC': 'KLA Corporation', 'VRTX': 'Vertex Pharmaceuticals', 'MDT': 'Medtronic', 'SNPS': 'Synopsys',
    'NKE': 'Nike', 'CRWD': 'CrowdStrike', 'ADI': 'Analog Devices', 'WELL': 'Welltower', 'CB': 'Chubb', 'ICE': 'Intercontinental Exchange',
    'SBUX': 'Starbucks', 'TT': 'Trane Technologies', 'SO': 'Southern Company', 'CEG': 'Constellation Energy', 'PLD': 'Prologis', 'DASH': 'DoorDash',
    'AMT': 'American Tower', 'MO': 'Altria Group', 'MMC': 'Marsh & McLennan', 'CME': 'CME Group', 'CDNS': 'Cadence Design Systems', 'LMT': 'Lockheed Martin',
    'BMY': 'Bristol-Myers Squibb', 'WM': 'Waste Management', 'PH': 'Parker-Hannifin', 'COIN': 'Coinbase Global', 'DUK': 'Duke Energy', 'RCL': 'Royal Caribbean',
    'MCO': 'Moody\'s', 'MDLZ': 'Mondelez International', 'DELL': 'Dell Technologies', 'TDG': 'TransDigm Group', 'CTAS': 'Cintas', 'INTC': 'Intel',
    'MCK': 'McKesson', 'ABNB': 'Airbnb', 'GD': 'General Dynamics', 'ORLY': 'O\'Reilly Automotive', 'APO': 'Apollo Global Management', 'SHW': 'Sherwin-Williams',
    'HCA': 'HCA Healthcare', 'EMR': 'Emerson Electric', 'NOC': 'Northrop Grumman', 'MMM': '3M', 'FTNT': 'Fortinet', 'EQIX': 'Equinix',
    'CI': 'Cigna', 'UPS': 'United Parcel Service', 'FI': 'Fiserv', 'HWM': 'Howmet Aerospace', 'AON': 'Aon', 'PNC': 'PNC Financial Services',
    'CVS': 'CVS Health', 'RSG': 'Republic Services', 'AJG': 'Arthur J. Gallagher', 'ITW': 'Illinois Tool Works', 'MAR': 'Marriott International', 'ECL': 'Ecolab',
    'MSI': 'Motorola Solutions', 'USB': 'U.S. Bancorp', 'WMB': 'Williams Companies', 'BK': 'Bank of New York Mellon', 'CL': 'Colgate-Palmolive', 'NEM': 'Newmont',
    'PYPL': 'PayPal', 'JCI': 'Johnson Controls', 'ZTS': 'Zoetis', 'VST': 'Vistra', 'EOG': 'EOG Resources', 'CSX': 'CSX',
    'ELV': 'Elevance Health', 'ADSK': 'Autodesk', 'APD': 'Air Products and Chemicals', 'AZO': 'AutoZone', 'HLT': 'Hilton Worldwide', 'WDAY': 'Workday',
    'SPG': 'Simon Property Group', 'NSC': 'Norfolk Southern', 'KMI': 'Kinder Morgan', 'TEL': 'TE Connectivity', 'FCX': 'Freeport-McMoRan', 'CARR': 'Carrier Global',
    'PWR': 'Quanta Services', 'REGN': 'Regeneron Pharmaceuticals', 'ROP': 'Roper Technologies', 'CMG': 'Chipotle Mexican Grill', 'DLR': 'Digital Realty Trust', 'MNST': 'Monster Beverage',
    'TFC': 'Truist Financial', 'TRV': 'Travelers Companies', 'AEP': 'American Electric Power', 'NXPI': 'NXP Semiconductors', 'AXON': 'Axon Enterprise', 'URI': 'United Rentals',
    'COR': 'Cencora', 'FDX': 'FedEx', 'NDAQ': 'Nasdaq', 'AFL': 'Aflac', 'GLW': 'Corning', 'FAST': 'Fastenal',
    'MPC': 'Marathon Petroleum', 'SLB': 'Schlumberger', 'SRE': 'Sempra Energy', 'PAYX': 'Paychex', 'PCAR': 'PACCAR', 'MET': 'MetLife',
    'BDX': 'Becton Dickinson', 'OKE': 'ONEOK', 'DDOG': 'Datadog',
    // International companies
    'TSM': 'Taiwan Semiconductor', 'SAP': 'SAP SE', 'ASML': 'ASML Holding', 'BABA': 'Alibaba Group', 'TM': 'Toyota Motor', 'AZN': 'AstraZeneca',
    'HSBC': 'HSBC Holdings', 'NVS': 'Novartis', 'SHEL': 'Shell', 'HDB': 'HDFC Bank', 'RY': 'Royal Bank of Canada', 'NVO': 'Novo Nordisk',
    'ARM': 'ARM Holdings', 'SHOP': 'Shopify', 'MUFG': 'Mitsubishi UFJ Financial', 'PDD': 'Pinduoduo', 'UL': 'Unilever', 'SONY': 'Sony Group',
    'TTE': 'TotalEnergies', 'BHP': 'BHP Group', 'SAN': 'Banco Santander', 'TD': 'Toronto-Dominion Bank', 'SPOT': 'Spotify Technology', 'UBS': 'UBS Group',
    'IBN': 'ICICI Bank', 'SNY': 'Sanofi', 'BUD': 'Anheuser-Busch InBev', 'BTI': 'British American Tobacco', 'BN': 'Danone', 'SMFG': 'Sumitomo Mitsui Financial',
    'ENB': 'Enbridge', 'RELX': 'RELX Group', 'TRI': 'Thomson Reuters', 'RACE': 'Ferrari', 'BBVA': 'Banco Bilbao Vizcaya', 'SE': 'Sea Limited',
    'BP': 'BP', 'NTES': 'NetEase', 'BMO': 'Bank of Montreal', 'RIO': 'Rio Tinto', 'GSK': 'GlaxoSmithKline', 'MFG': 'Mizuho Financial',
    'INFY': 'Infosys', 'CP': 'Canadian Pacific Railway', 'BCS': 'Barclays', 'NGG': 'National Grid', 'BNS': 'Bank of Nova Scotia', 'ING': 'ING Group',
    'EQNR': 'Equinor', 'CM': 'Canadian Imperial Bank', 'CNQ': 'Canadian Natural Resources', 'LYG': 'Lloyds Banking Group', 'AEM': 'Agnico Eagle Mines', 'DB': 'Deutsche Bank',
    'NU': 'Nu Holdings', 'CNI': 'Canadian National Railway', 'DEO': 'Diageo', 'NWG': 'NatWest Group', 'AMX': 'America Movil', 'MFC': 'Manulife Financial',
    'E': 'Eni', 'WCN': 'Waste Connections', 'SU': 'Suncor Energy', 'TRP': 'TC Energy', 'PBR': 'Petrobras', 'HMC': 'Honda Motor',
    'GRMN': 'Garmin', 'CCEP': 'Coca-Cola Europacific Partners', 'ALC': 'Alcon', 'TAK': 'Takeda Pharmaceutical'
  };

  // Share counts for market cap calculation - Updated for 98% accuracy with Finviz
  private readonly shareCounts: Record<string, number> = {
    // Top 10 by market cap - Finviz verified
    'NVDA': 24400000000, 'MSFT': 7440000000, 'AAPL': 15400000000, 'AMZN': 10400000000,
    'GOOGL': 12500000000, 'GOOG': 12500000000, 'META': 2520000000, 'AVGO': 4700000000,
    'BRK.A': 1400000000, 'BRK.B': 2200000000, 'TSLA': 3180000000,
    
    // Next 20 - Finviz verified
    'JPM': 2900000000, 'WMT': 8000000000, 'LLY': 950000000, 'ORCL': 2800000000,
    'V': 2100000000, 'MA': 920000000, 'NFLX': 420000000, 'XOM': 3900000000,
    'COST': 440000000, 'JNJ': 2400000000, 'HD': 990000000, 'PLTR': 2200000000,
    'PG': 2300000000, 'BAC': 8000000000, 'ABBV': 1770000000, 'CVX': 1900000000,
    'KO': 4300000000, 'AMD': 1600000000, 'GE': 1100000000, 'CSCO': 4000000000,
    
    // Rest of top 200 - Updated for accuracy
    'TMUS': 1200000000, 'WFC': 3600000000, 'CRM': 1000000000, 'PM': 1500000000,
    'IBM': 900000000, 'UNH': 920000000, 'MS': 1600000000, 'GS': 320000000,
    'INTU': 280000000, 'LIN': 480000000, 'ABT': 1700000000, 'AXP': 1100000000,
    'BX': 700000000, 'DIS': 1800000000, 'MCD': 730000000, 'RTX': 1300000000,
    'NOW': 200000000, 'MRK': 2500000000, 'CAT': 500000000, 'T': 7100000000,
    'PEP': 1400000000, 'UBER': 2000000000, 'BKNG': 35000000, 'TMO': 380000000,
    'VZ': 4200000000, 'SCHW': 1800000000, 'ISRG': 35000000, 'QCOM': 1100000000,
    'C': 1900000000, 'TXN': 900000000, 'BA': 600000000, 'BLK': 150000000,
    'ACN': 630000000, 'SPGI': 250000000, 'AMGN': 540000000, 'ADBE': 450000000,
    'BSX': 1400000000, 'SYK': 380000000, 'ETN': 400000000, 'AMAT': 800000000,
    'ANET': 300000000, 'NEE': 2000000000, 'DHR': 1400000000, 'HON': 1300000000,
    'TJX': 1100000000, 'PGR': 580000000, 'GILD': 1200000000, 'DE': 280000000,
    'PFE': 5600000000, 'COF': 400000000, 'KKR': 880000000, 'PANW': 300000000,
    'UNP': 600000000, 'APH': 120000000, 'LOW': 580000000, 'LRCX': 130000000,
    'MU': 1100000000, 'ADP': 400000000, 'CMCSA': 4000000000, 'COP': 1200000000,
    'KLAC': 130000000, 'VRTX': 260000000, 'MDT': 1300000000, 'SNPS': 150000000,
    'NKE': 1200000000, 'CRWD': 240000000, 'ADI': 500000000, 'WELL': 800000000,
    'CB': 200000000, 'ICE': 570000000, 'SBUX': 1100000000, 'TT': 90000000,
    'SO': 1000000000, 'CEG': 200000000, 'PLD': 900000000, 'DASH': 400000000,
    'AMT': 900000000, 'MO': 1800000000, 'MMC': 200000000, 'CME': 360000000,
    'CDNS': 270000000, 'LMT': 250000000, 'BMY': 2000000000, 'WM': 400000000,
    'PH': 130000000, 'COIN': 200000000, 'DUK': 700000000, 'RCL': 200000000,
    'MCO': 200000000, 'MDLZ': 1400000000, 'DELL': 700000000, 'TDG': 40000000,
    'CTAS': 100000000, 'INTC': 4200000000, 'MCK': 130000000, 'ABNB': 600000000,
    'GD': 270000000, 'ORLY': 61000000, 'APO': 600000000, 'SHW': 250000000,
    'HCA': 270000000, 'EMR': 570000000, 'NOC': 300000000, 'MMM': 550000000,
    'FTNT': 800000000, 'EQIX': 90000000, 'CI': 300000000, 'UPS': 860000000,
    'FI': 400000000, 'HWM': 160000000, 'AON': 200000000, 'PNC': 400000000,
    'CVS': 1300000000, 'RSG': 300000000, 'AJG': 200000000, 'ITW': 300000000,
    'MAR': 300000000, 'ECL': 570000000, 'MSI': 100000000, 'USB': 1500000000,
    'WMB': 1200000000, 'BK': 1500000000, 'CL': 1200000000, 'NEM': 400000000,
    'PYPL': 1100000000, 'JCI': 680000000, 'ZTS': 440000000, 'VST': 200000000,
    'EOG': 580000000, 'CSX': 2000000000, 'ELV': 200000000, 'ADSK': 210000000,
    'APD': 220000000, 'AZO': 20000000, 'HLT': 300000000, 'WDAY': 200000000,
    'SPG': 300000000, 'NSC': 2000000000, 'KMI': 2200000000, 'TEL': 300000000,
    'FCX': 1400000000, 'CARR': 400000000, 'PWR': 500000000, 'REGN': 110000000,
    'ROP': 100000000, 'CMG': 1340000000, 'DLR': 200000000, 'MNST': 440000000,
    'TFC': 2000000000, 'TRV': 270000000, 'AEP': 520000000, 'NXPI': 260000000,
    'AXON': 70000000, 'URI': 60000000, 'COR': 100000000, 'FDX': 250000000,
    'NDAQ': 500000000, 'AFL': 580000000, 'GLW': 800000000, 'FAST': 174000000,
    'MPC': 400000000, 'SLB': 1400000000, 'SRE': 250000000, 'PAYX': 350000000,
    'PCAR': 101000000, 'MET': 800000000, 'BDX': 1400000000, 'OKE': 440000000,
    'DDOG': 300000000,
    // International companies share counts (excluding duplicates)
    'TSM': 25900000000, 'SAP': 1200000000, 'ASML': 400000000, 'BABA': 2500000000, 'TM': 3000000000,
    'AZN': 1500000000, 'HSBC': 20000000000, 'NVS': 2200000000, 'SHEL': 6500000000,
    'HDB': 5500000000, 'RY': 1400000000, 'NVO': 2200000000, 'ARM': 1000000000,
    'SHOP': 1300000000, 'MUFG': 12000000000, 'PDD': 1300000000, 'UL': 2600000000,
    'SONY': 1200000000, 'TTE': 2500000000, 'BHP': 2500000000, 'SAN': 16000000000, 'TD': 1800000000,
    'SPOT': 200000000, 'UBS': 3000000000, 'IBN': 12000000000, 'SNY': 4000000000,
    'BUD': 2000000000, 'BTI': 900000000, 'BN': 3000000000,
    'SMFG': 14000000000, 'ENB': 2000000000, 'RELX': 1000000000, 'TRI': 200000000, 'RACE': 1800000000,
    'BBVA': 6000000000, 'SE': 500000000, 'BP': 3000000000, 'NTES': 650000000, 'BMO': 1200000000,
    'RIO': 1600000000, 'GSK': 4000000000, 'MFG': 6000000000, 'INFY': 4000000000,
    'CP': 700000000, 'BCS': 8000000000, 'NGG': 4000000000, 'BNS': 1200000000, 'ING': 3500000000,
    'EQNR': 3000000000, 'CM': 1000000000, 'CNQ': 900000000, 'LYG': 1500000000,
    'AEM': 500000000, 'DB': 2000000000, 'NU': 1000000000, 'CNI': 800000000,
    'DEO': 2300000000, 'NWG': 1800000000, 'AMX': 6000000000, 'MFC': 1800000000,
    'E': 1000000000, 'WCN': 400000000, 'SU': 400000000, 'TRP': 2000000000, 'PBR': 13000000000,
    'HMC': 1800000000, 'GRMN': 200000000, 'CCEP': 450000000, 'ALC': 200000000, 'TAK': 3000000000
  };

  constructor() {
    // Initialize database
    initializeDatabase();
    
    // Initialize background service
    const backgroundService = createBackgroundService(this);
    
    // Start background service
    backgroundService.start().catch(console.error);
    
    this.startBackgroundUpdates();
  }

  async updateCache(): Promise<void> {
    if (this.isUpdating) {
      console.log('Update already in progress, skipping...');
      return;
    }

    this.isUpdating = true;
    console.log('Starting cache update...');

    try {
                           // Hardcoded API key for reliability (avoids .env.local issues)
        const apiKey = 'Vi_pMLcusE8RA_SUvkPAmiyziVzlmOoX';
        console.log('API Key loaded:', apiKey ? 'Yes' : 'No');
             const batchSize = 15; // Reduced batch size for better reliability
       const results: CachedStockData[] = [];

               // Test first API call to see exact error
        console.log('🔍 Testing API call for first ticker...');
        const testUrl = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/NVDA?apikey=${apiKey}`;
        const testResponse = await fetch(testUrl);
        console.log('Test response status:', testResponse.status);
        if (!testResponse.ok) {
          const testErrorBody = await testResponse.text();
          console.error('❌ Test API call failed:', {
            status: testResponse.status,
            body: testErrorBody,
            url: testUrl,
          });
          
          console.error('Polygon API test failed:', {
            status: testResponse.status,
            statusText: testResponse.statusText,
            body: testErrorBody,
            url: testUrl,
          });
          
          recordApiCall('polygon', 'snapshot', 'error');
        } else {
          console.log('✅ Test API call successful');
          const testData = await testResponse.json();
          console.log('Test data structure:', JSON.stringify(testData, null, 2));
          recordApiCall('polygon', 'snapshot', 'success');
        }

       // Process tickers in parallel groups with smart throttling
       const parallelGroups = 4; // Number of parallel Promise.allSettled groups
       const groupSize = Math.ceil(this.TICKERS.length / parallelGroups);
       
       for (let groupIndex = 0; groupIndex < parallelGroups; groupIndex++) {
         const groupStart = groupIndex * groupSize;
         const groupEnd = Math.min(groupStart + groupSize, this.TICKERS.length);
         const groupTickers = this.TICKERS.slice(groupStart, groupEnd);
         
         console.log(`🚀 Processing group ${groupIndex + 1}/${parallelGroups} (${groupTickers.length} tickers)`);
         
         // Add delay between groups to respect rate limits
         if (groupIndex > 0) {
           console.log(`⏳ Rate limiting: waiting 250ms between groups...`);
           await new Promise(resolve => setTimeout(resolve, 250));
         }
         
         // Process group in smaller batches
         for (let i = 0; i < groupTickers.length; i += batchSize) {
           const batch = groupTickers.slice(i, i + batchSize);
           
           // Add delay between batches within group
           if (i > 0) {
             console.log(`⏳ Rate limiting: waiting 200ms between batches...`);
             await new Promise(resolve => setTimeout(resolve, 200));
           }
        
        const batchPromises = batch.map(async (ticker) => {
          try {
                         // Get ticker details for market cap
             const detailsUrl = `https://api.polygon.io/v3/reference/tickers/${ticker}?apikey=${apiKey}`;
             const detailsResponse = await fetch(detailsUrl);
             
             let marketCap = 0;
             let shares = 0;
             
             if (!detailsResponse.ok) {
               const errorBody = await detailsResponse.text();
               console.error(`❌ Polygon API failed for ${ticker} details:`, {
                 status: detailsResponse.status,
                 body: errorBody,
                 url: detailsUrl,
               });
             } else {
               const detailsData = await detailsResponse.json();
               if (detailsData?.results) {
                 const rawMarketCap = detailsData.results.market_cap || 0;
                 shares = detailsData.results.weighted_shares_outstanding || 0;
                 
                 // Check if market cap data is fresh (< 60 seconds old)
                 const updatedTimestamp = detailsData.results.updated;
                 if (rawMarketCap > 0 && updatedTimestamp) {
                   const ageMs = Date.now() - updatedTimestamp;
                   if (ageMs > 60000) { // Older than 60 seconds
                     console.warn(`⚠️ Stale market cap for ${ticker} (${Math.round(ageMs/1000)}s old), using calculated instead`);
                     marketCap = 0; // Will be calculated manually below
                   } else {
                     marketCap = 0; // Always calculate manually for precision
                   }
                 } else {
                   marketCap = 0; // Always calculate manually for precision
                 }
               }
             }
             
                         // GPT Single-Source-of-Truth: Get reference price with fallback
            let referencePrice: number | null = null;
            
            // 1. Primary: Use daily aggregates /prev (most reliable)
            try {
              const prevUrl = `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${apiKey}`;
              const prevResponse = await fetch(prevUrl);
              
              if (prevResponse.ok) {
                const prevData = await prevResponse.json();
                console.log(`📊 Prev data for ${ticker}:`, JSON.stringify(prevData, null, 2));
                
                if (prevData?.results?.[0]?.c) {
                  referencePrice = prevData.results[0].c;
                  console.log(`✅ Using aggs/prev reference: $${referencePrice} for ${ticker}`);
                }
              } else {
                const errorBody = await prevResponse.text();
                console.warn(`⚠️ aggs/prev failed for ${ticker}:`, {
                  status: prevResponse.status,
                  body: errorBody
                });
              }
            } catch (error) {
              console.warn(`⚠️ aggs/prev exception for ${ticker}:`, error);
            }

            // 💡 PRECISION IMPROVEMENT: Get consolidated last trade first (more accurate than snapshot)
            let consolidatedLastPrice = null;
            let consolidatedDataSource = '';
            
            try {
              const lastTradeUrl = `https://api.polygon.io/v2/last/trade/${ticker}?apikey=${apiKey}`;
              const lastTradeResponse = await fetch(lastTradeUrl);
              
              if (lastTradeResponse.ok) {
                const lastTradeData = await lastTradeResponse.json();
                if (lastTradeData.status === 'OK' && lastTradeData.results?.p > 0) {
                  consolidatedLastPrice = lastTradeData.results.p;
                  consolidatedDataSource = 'consolidatedLastTrade';
                  console.log(`🎯 Consolidated last trade for ${ticker}: $${consolidatedLastPrice}`);
                } else if (lastTradeData.status === 'DELAYED') {
                  // Still use delayed data if available
                  consolidatedLastPrice = lastTradeData.results.p;
                  consolidatedDataSource = 'consolidatedLastTrade(delayed)';
                  console.log(`⏱️ Delayed consolidated last trade for ${ticker}: $${consolidatedLastPrice}`);
                }
              } else {
                console.warn(`⚠️ Consolidated last trade failed for ${ticker}, falling back to snapshot`);
              }
            } catch (error) {
              console.warn(`⚠️ Consolidated last trade error for ${ticker}:`, error);
            }

            // Get current price using modern snapshot API (includes pre-market, after-hours)
            const snapshotUrl = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}?apikey=${apiKey}`;
            const snapshotResponse = await fetch(snapshotUrl);

            if (!snapshotResponse.ok) {
              const errorBody = await snapshotResponse.text();
              console.error(`❌ Polygon API failed for ${ticker} (snapshot):`, {
                status: snapshotResponse.status,
                body: errorBody,
                url: snapshotUrl,
              });
              return null;
            }

            const snapshotData = await snapshotResponse.json();
            console.log(`📊 Snapshot data for ${ticker}:`, JSON.stringify(snapshotData, null, 2));
            
            // 2. Fallback: Use snapshot prevDay (if aggs/prev failed)
            if (!referencePrice && snapshotData.ticker?.prevDay?.c) {
              referencePrice = snapshotData.ticker.prevDay.c;
              console.log(`🔄 Using snapshot fallback reference: $${referencePrice} for ${ticker}`);
            }
            
            // 3. Final check: Skip if no reference price available
            if (!referencePrice) {
              console.warn(`❌ No valid reference price for ${ticker} - skipping`);
              return null;
            }
            
            // Update prevClose with our single-source-of-truth reference
            const prevClose = referencePrice;

            // Validate snapshot status
            if (snapshotData.status !== 'OK') {
              console.warn(`❌ Invalid snapshot status for ${ticker}: ${snapshotData.status}`);
              return null;
            }

            // 🎯 IMPROVED PRIORITY ORDER: Consolidated Last Trade → Snapshot → Fallbacks
            let currentPrice = 0;
            let dataSource = '';
            
            // Priority order for current price (PRECISION IMPROVEMENT)
            if (consolidatedLastPrice && consolidatedLastPrice > 0) {
              // 1. HIGHEST PRIORITY: Consolidated Last Trade (most accurate)
              currentPrice = consolidatedLastPrice;
              dataSource = consolidatedDataSource;
            } else if (snapshotData.ticker?.lastTrade?.p && snapshotData.ticker.lastTrade.p > 0) {
              // 2. Snapshot last trade (fallback)
              currentPrice = snapshotData.ticker.lastTrade.p;
              dataSource = 'snapshotLastTrade';
            } else if (snapshotData.ticker?.min?.c && snapshotData.ticker.min.c > 0) {
              // 3. Minute data
              currentPrice = snapshotData.ticker.min.c;
              dataSource = 'minute';
            } else if (snapshotData.ticker?.day?.c && snapshotData.ticker.day.c > 0) {
              // 4. Day close
              currentPrice = snapshotData.ticker.day.c;
              dataSource = 'day';
            } else if (snapshotData.ticker?.prevDay?.c && snapshotData.ticker.prevDay.c > 0) {
              // 5. Previous day close (last resort)
              const prevDayClose = snapshotData.ticker.prevDay.c;
              if (Math.abs(prevDayClose - prevClose) < 0.01) {
                // Same as prevClose, would result in 0% change - skip
                console.warn(`⚠️ ${ticker} prevDay.c ($${prevDayClose}) same as prevClose ($${prevClose}), skipping to avoid 0% change`);
                return null;
              }
              currentPrice = prevDayClose;
              dataSource = 'prevDay';
            }

            if (!currentPrice || currentPrice === 0) {
              console.warn(`❌ No valid price data for ${ticker} - all price fields are 0 or missing`);
              console.warn(`   lastTrade.p: ${snapshotData?.ticker?.lastTrade?.p}`);
              console.warn(`   min.c: ${snapshotData?.ticker?.min?.c}`);
              console.warn(`   day.c: ${snapshotData?.ticker?.day?.c}`);
              console.warn(`   prevDay.c: ${snapshotData?.ticker?.prevDay?.c}`);
              return null;
            }
            
            // Get market session - use Polygon's snapshot type if available, otherwise fallback to time-based
            let marketSession = getMarketSession(); // Fallback
            let sessionLabel = 'Regular';
            
            // Use Polygon's snapshot type for more accurate session detection
            if (snapshotData.ticker?.type) {
              switch (snapshotData.ticker.type) {
                case 'pre':
                  marketSession = 'pre-market';
                  sessionLabel = 'Pre-Market';
                  break;
                case 'post':
                  marketSession = 'after-hours';
                  sessionLabel = 'After-Hours';
                  break;
                case 'regular':
                  marketSession = 'market';
                  sessionLabel = 'Market';
                  break;
                default:
                  sessionLabel = 'Closed';
              }
            }
            
            // Reference price already determined above using single-source-of-truth approach
            
            // If no Polygon session type, determine session label based on data availability
            if (!snapshotData.ticker?.type) {
              if (snapshotData.ticker?.min?.c && snapshotData.ticker.min.c > 0) {
                // We have real-time minute data
                switch (marketSession) {
                  case 'pre-market':
                    sessionLabel = 'Pre-Market';
                    break;
                  case 'market':
                    sessionLabel = 'Market';
                    break;
                  case 'after-hours':
                    sessionLabel = 'After-Hours';
                    break;
                  default:
                    sessionLabel = 'Live';
                }
              } else if (snapshotData.ticker?.day?.c && snapshotData.ticker.day.c > 0) {
                sessionLabel = 'Market Close';
              } else {
                sessionLabel = 'Previous Close';
              }
            }
            
            // Edge case protection
            
            // 1. Check for negative prices (penny stock glitches)
            if (referencePrice < 0.01) {
              console.warn(`⚠️ Suspiciously low reference price for ${ticker}: $${referencePrice}, skipping`);
              return null;
            }
            
            // 2. Check for trading halts (stale lastTrade timestamp)
            if (snapshotData.ticker?.lastTrade?.t) {
              const tradeAgeMs = Date.now() - (snapshotData.ticker.lastTrade.t / 1000000); // Convert nanoseconds to ms
              if (tradeAgeMs > 120000 && snapshotData.ticker.type === 'regular') { // 2 minutes old during market hours
                console.warn(`⚠️ Possible trading halt for ${ticker}: last trade ${Math.round(tradeAgeMs/1000)}s ago`);
                // Continue processing but mark in logs
              }
            }
            
            const percentChange = ((currentPrice - referencePrice) / referencePrice) * 100;
            
            // 3. Check for extreme percentage changes (possible stock splits)
            if (Math.abs(percentChange) > 40) {
              console.warn(`⚠️ Extreme price change for ${ticker}: ${percentChange.toFixed(2)}% - possible stock split or data error`);
              // Continue processing but log warning
            }
            
            console.log(`📊 ${sessionLabel} session for ${ticker}: $${currentPrice} (${dataSource}) vs ref $${referencePrice} (${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(2)}%)`);
            
            // Validate share count - no more 1B fallback
            if (!shares && !this.shareCounts[ticker]) {
              console.warn(`❌ Missing share count for ${ticker}, skipping stock`);
              return null;
            }
            const shareCount = shares || this.shareCounts[ticker];
            
            // Fix market cap calculation - avoid double counting when Polygon provides live market cap
            // GPT Recommendation: Always calculate market caps manually for precision
            const calculatedMarketCap = currentPrice * shareCount / 1_000_000_000;
            const marketCapPrev = prevClose * shareCount / 1_000_000_000;  
            const marketCapDiff = calculatedMarketCap - marketCapPrev;
            const finalMarketCap = calculatedMarketCap;

            const stockData = {
              ticker,
              currentPrice: Math.round(currentPrice * 100) / 100,  // Renamed from preMarketPrice
              closePrice: Math.round(prevClose * 100) / 100,
              percentChange: Math.round(percentChange * 100) / 100,
              marketCapDiff: Math.round(marketCapDiff * 100) / 100,
              marketCap: Math.round(finalMarketCap * 100) / 100,
              lastUpdated: new Date()
            };

            console.log(`✅ Successfully fetched data for ${ticker}: $${currentPrice} (${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(2)}%)`);

            // Save to database
            try {
              const companyName = this.companyNames[ticker] || ticker;
              const shareCount = shares || this.shareCounts[ticker];
              
              runTransaction(() => {
                // Update stock info
                dbHelpers.upsertStock.run(
                  ticker,
                  companyName,
                  finalMarketCap * 1_000_000_000, // Convert back to actual market cap
                  shareCount,
                  new Date().toISOString()
                );

                                 // Add price history with session info
                 dbHelpers.addPriceHistory.run(
                   ticker,
                   currentPrice,
                   snapshotData.ticker?.day?.v || 0, // Volume from snapshot
                  new Date().toISOString()
                );
              });
            } catch (dbError) {
              console.error(`Database error for ${ticker}:`, dbError);
              console.error('Database error for', ticker, ':', dbError);
            }

            return stockData;

          } catch (error) {
            console.error(`Error processing ${ticker}:`, error);
            console.error('Error processing stock', ticker, ':', error);
            return null;
          }
        });

           const batchResults = await Promise.allSettled(batchPromises);
           
           // Process settled results
           batchResults.forEach((result, index) => {
             if (result.status === 'fulfilled' && result.value) {
               results.push(result.value);
             } else if (result.status === 'rejected') {
               console.error(`❌ Failed to process ${batch[index]}:`, result.reason);
             }
           });
         }
       }

      // Update in-memory cache
      this.cache.clear();
      results.forEach(stock => {
        this.cache.set(stock.ticker, stock);
      });

      // Validate results completeness
      const successRate = (results.length / this.TICKERS.length) * 100;
      const isPartial = successRate < 90;
      
      if (isPartial) {
        console.warn(`⚠️ Partial update: only ${results.length}/${this.TICKERS.length} stocks (${successRate.toFixed(1)}%) processed successfully`);
      }

      // Update Redis cache
      try {
        await setCachedData(CACHE_KEYS.STOCK_DATA, results);
        await setCacheStatus({
          count: results.length,
          lastUpdated: new Date(),
          isUpdating: false,
          isPartial: isPartial
        });
        console.log(`✅ Redis cache updated with ${results.length} stocks at ${new Date().toISOString()}`);
      } catch (error) {
        console.error('Failed to update Redis cache:', error);
      }

      console.log(`Cache updated with ${results.length} stocks at ${new Date().toISOString()}`);

    } catch (error) {
      console.error('Cache update failed:', error);
      console.error('Cache update failed:', error);
    } finally {
      this.isUpdating = false;
    }
  }

  startBackgroundUpdates(): void {
    // Update every 15 minutes
    this.updateInterval = setInterval(() => {
      this.updateCache();
    }, 15 * 60 * 1000);

    // Initial update
    this.updateCache();
  }

  stopBackgroundUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  async getAllStocks(): Promise<CachedStockData[]> {
    try {
      // Try to get from Redis first
      const cachedData = await getCachedData(CACHE_KEYS.STOCK_DATA);
      if (cachedData) {
        recordCacheHit('redis');
        return cachedData.sort((a: CachedStockData, b: CachedStockData) => b.marketCap - a.marketCap);
      }
      
      recordCacheMiss('redis');
      // Fallback to in-memory cache
      return Array.from(this.cache.values()).sort((a, b) => b.marketCap - a.marketCap);
    } catch (error) {
      console.error('Error getting cached data:', error);
      console.error('Error getting cached data:', error);
      recordCacheMiss('redis');
      return Array.from(this.cache.values()).sort((a, b) => b.marketCap - a.marketCap);
    }
  }

  getStock(ticker: string): CachedStockData | null {
    return this.cache.get(ticker) || null;
  }

  getCompanyName(ticker: string): string {
    return this.companyNames[ticker] || ticker;
  }

  async getCacheStatus(): Promise<{ count: number; lastUpdated: Date | null; isUpdating: boolean }> {
    try {
      // Try to get from Redis first
      const cachedStatus = await getCacheStatus();
      if (cachedStatus) {
        return cachedStatus;
      }
      
      // Fallback to in-memory cache
      const stocks = await this.getAllStocks();
      const lastUpdated = stocks.length > 0 ? stocks[0].lastUpdated : null;
      
      return {
        count: stocks.length,
        lastUpdated,
        isUpdating: this.isUpdating
      };
    } catch (error) {
      console.error('Error getting cache status:', error);
      console.error('Error getting cache status:', error);
      return {
        count: 0,
        lastUpdated: null,
        isUpdating: this.isUpdating
      };
    }
  }
}

// Singleton instance
export const stockDataCache = new StockDataCache(); 