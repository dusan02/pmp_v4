# Vercel Environment Variables Setup 🔧

## Problém
Aplikácia zobrazuje demo dáta namiesto živých dát, pretože `POLYGON_API_KEY` nie je nastavený v Vercel environment variables.

## Riešenie

### 1. Nastavenie Environment Variables na Verceli

1. **Choďte na Vercel Dashboard:**
   - Otvorte [vercel.com](https://vercel.com)
   - Prihláste sa do vášho účtu
   - Vyberte projekt `pmp-prod-c14b`

2. **Nastavte Environment Variables:**
   - Kliknite na **Settings** v projekte
   - Vyberte **Environment Variables**
   - Kliknite **Add New**
   - Nastavte:
     - **Name:** `POLYGON_API_KEY`
     - **Value:** `Vi_pMLcusE8RA_SUvkPAmiyziVzlmOoX`
     - **Environment:** Vyberte všetky (Production, Preview, Development)

3. **Redeploy aplikácie:**
   - Po nastavení environment variables kliknite **Redeploy** v sekcii **Deployments**

### 2. Overenie nastavenia

Po redeploy môžete overiť, či environment variables fungujú:

1. **Test API endpoint:**
   ```
   https://pmp-prod-c14b.vercel.app/api/debug/env
   ```

2. **Očakávaný response:**
   ```json
   {
     "success": true,
     "environment": {
       "polygonApiKey": "Set",
       "nodeEnv": "production",
       "vercelEnv": "production",
       "hasApiKey": true,
       "apiKeyLength": 32
     },
     "message": "Environment variables checked"
   }
   ```

### 3. Test Polygon API

Po nastavení environment variables testujte Polygon API:

```
https://pmp-prod-c14b.vercel.app/api/test-polygon
```

### 4. Očakávané zmeny

Po správnom nastavení by ste mali vidieť:

- ✅ **Živé dáta** namiesto demo dát
- ✅ **260+ akcií** namiesto 20
- ✅ **Skutočné ceny** z Polygon API
- ✅ **Aktualizácie každých 2 minúty**

### 5. Troubleshooting

Ak problém pretrváva:

1. **Skontrolujte Vercel logs:**
   - V Vercel dashboard → **Functions** → **View Function Logs**

2. **Overte API key:**
   - Skontrolujte, či je API key platný na [Polygon.io](https://polygon.io/)

3. **Testujte lokálne:**
   - Vytvorte `.env.local` súbor s rovnakým API key
   - Spustite `npm run dev`

## Stav po oprave

- ✅ **Environment variables** správne nastavené
- ✅ **API key** dostupný v aplikácii
- ✅ **Live data** z Polygon API
- ✅ **Cache systém** funguje správne
- ✅ **Background updates** každých 2 minúty 