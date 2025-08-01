# Environment Setup Instructions

## Pre získanie živých dát potrebujete nastaviť Polygon.io API kľúč:

### 1. Získajte bezplatný API kľúč
1. Choďte na [Polygon.io](https://polygon.io/)
2. Zaregistrujte sa pre bezplatný účet
3. Získajte váš API kľúč z dashboardu

### 2. Vytvorte .env.local súbor
Vytvorte súbor `.env.local` v koreňovom adresári s týmto obsahom:

```env
# Polygon.io API Key - Získajte bezplatný kľúč na https://polygon.io/
POLYGON_API_KEY=your_actual_api_key_here

# Redis Configuration (voliteľné - aplikácia funguje aj bez Redis)
REDIS_URL=redis://localhost:6379

# Database Configuration
DATABASE_URL=file:./data/premarket.db

# Next.js Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### 3. Reštartujte aplikáciu
Po vytvorení `.env.local` súboru reštartujte development server:
```bash
npm run dev
```

## Aktuálny stav
- ✅ Aplikácia beží s demo dátami
- ❌ Živé API dáta nie sú dostupné (chýba API kľúč)
- ✅ Všetky UI funkcie fungujú
- ✅ Logo fallback systém funguje
- ✅ Market indikátory fungujú

## Demo dáta
Aplikácia momentálne zobrazuje realistické demo dáta na testovacie účely. Po nastavení API kľúča sa automaticky prepne na živé trhové dáta. 