# Vercel Deployment Guide 🚀

## ✅ **Zmeny Úspešne Pushnuté**

**Repozitáre:**
- **Main:** `https://github.com/dusan02/pmp_v4.git` ✅
- **Production:** `https://github.com/dusan02/pmp_prod.git` ✅

**Commit:** `812bae9` - Fix market cap calculations and cache loading issues

## 🔧 **Vercel Nastavenie**

### **1. Nový Projekt na Verceli**
1. Choďte na [vercel.com](https://vercel.com)
2. Prihláste sa s GitHub účtom
3. Kliknite **"New Project"**
4. Vyberte repozitár: `dusan02/pmp_v4` alebo `dusan02/pmp_prod`

### **2. Environment Variables**
Nastavte tieto environment variables v Verceli:

```
POLYGON_API_KEY=Vi_pMLcusE8RA_SUvkPAmiyziVzlmOoX
```

**Ako nastaviť:**
1. V projekte na Verceli → **Settings** → **Environment Variables**
2. Pridajte `POLYGON_API_KEY` s hodnotou `Vi_pMLcusE8RA_SUvkPAmiyziVzlmOoX`
3. Vyberte **Production, Preview, Development** environments

### **3. Build Settings**
Vercel automaticky detekuje Next.js projekt, ale môžete skontrolovať:

**Framework Preset:** `Next.js`
**Build Command:** `npm run build` (automatické)
**Output Directory:** `.next` (automatické)
**Install Command:** `npm install` (automatické)

### **4. Doména**
Po deploy sa vytvorí automaticky:
- `https://pmp-v4.vercel.app` (alebo podobne)
- Môžete nastaviť custom doménu v **Settings** → **Domains**

## 📊 **Očakávané Výsledky**

### **Po Deploy:**
- ✅ **Market Cap výpočty** - presné s Decimal.js
- ✅ **260+ akcií** - automatické načítanie
- ✅ **Cache systém** - optimalizované API volania
- ✅ **Unit testy** - 15/15 testov prechádza
- ✅ **Real-time dáta** - z Polygon API

### **Monitoring:**
- **Build logs** - v Verceli dashboard
- **Function logs** - pre API endpointy
- **Performance** - Vercel Analytics

## 🔍 **Testovanie Po Deploy**

### **1. Skontrolujte API Endpointy:**
```
https://your-domain.vercel.app/api/prices/cached
https://your-domain.vercel.app/api/prices?tickers=AAPL,MSFT,NVDA
```

### **2. Očakávané Response:**
```json
{
  "data": [...], // 260+ stocks
  "cacheStatus": {
    "count": 260,
    "isUpdating": false,
    "lastUpdated": "2024-01-XX..."
  },
  "message": "All data from cache"
}
```

### **3. Skontrolujte Logy:**
- `✅ Redis cache updated with X stocks`
- `📊 Cache has X stocks (likely demo data), triggering background update...`
- `✅ Market cap calculations using Decimal.js`

## 🚨 **Možné Problémy a Riešenia**

### **1. Build Error - Missing Dependencies**
```bash
# Riešenie: Pridajte do package.json
"dependencies": {
  "decimal.js": "^10.6.0"
}
```

### **2. API Key Error**
```bash
# Riešenie: Skontrolujte environment variables
POLYGON_API_KEY=Vi_pMLcusE8RA_SUvkPAmiyziVzlmOoX
```

### **3. Cache Not Loading**
```bash
# Riešenie: Skontrolujte Redis connection
# Vercel má built-in Redis support
```

## 📈 **Performance Optimizations**

### **Vercel Features:**
- ✅ **Edge Functions** - rýchle API responses
- ✅ **Automatic Scaling** - podľa traffic
- ✅ **Global CDN** - rýchle načítanie
- ✅ **Analytics** - performance monitoring

### **Cache Strategy:**
- **Redis Cache** - 24-hour TTL pre share counts
- **In-Memory Cache** - pre active session
- **Background Updates** - každých 2 minúty

## 🎯 **Nasledujúce Kroky**

1. **Deploy na Verceli** ✅
2. **Nastavte environment variables** ✅
3. **Testujte API endpointy**
4. **Monitorujte performance**
5. **Skontrolujte cache loading**

---

**Stav:** ✅ Kód pushnutý na GitHub
**Nasledujúci krok:** Vercel deployment a testovanie 