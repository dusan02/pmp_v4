# PreMarketPrice.com

Moderná webová aplikácia pre zobrazenie pre-market percentuálnych zmien a rozdielov trhovej kapitalizácie pre S&P 500 spoločnosti.

## 🚀 Funkcie

- **Pre-market dáta** - Zobrazenie predtrhových cien a zmien
- **Favority** - Uloženie obľúbených akcií do localStorage
- **Moderný dizajn** - Responzívny UI s dark mode podporou
- **Real-time dáta** - Aktualizácia cez Polygon.io API
- **Responzívnosť** - Optimalizované pre mobile a desktop

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript
- **Styling**: CSS Variables, Modern CSS Grid/Flexbox
- **API**: Polygon.io pre akciové dáta
- **Database**: PostgreSQL s Prisma ORM
- **Deployment**: Vercel/Railway ready

## 📁 Štruktúra projektu

```
PreMarketPrice/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── prices/
│   │   │       └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── lib/
│       └── prisma.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── export.html          # Standalone HTML verzia
├── style.css           # Moderný CSS pre standalone verziu
├── docker-compose.yml
└── package.json
```

## 🚀 Rýchly štart

### 1. Standalone HTML verzia (najrýchlejší spôsob)

```bash
# Otvori export.html v prehliadači
open export.html
```

### 2. Next.js verzia

```bash
# Inštalácia závislostí
npm install

# Spustenie development servera
npm run dev

# Otvoriť http://localhost:3000
```

### 3. S databázou

```bash
# Spustenie PostgreSQL cez Docker
docker-compose up -d db

# Nastavenie databázy
npx prisma migrate dev
npx prisma db seed

# Spustenie aplikácie
npm run dev
```

## 🔧 Konfigurácia

### Environment Variables

Vytvorte `.env.local` súbor:

```env
# Polygon.io API Key
POLYGON_API_KEY=your_api_key_here

# Database URL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/premarketprice"
```

### Polygon.io API

1. Zaregistrujte sa na [polygon.io](https://polygon.io)
2. Získajte API key
3. Pridajte do `.env.local`

## 🎨 Dizajn

### Light Mode

- Svetlé pozadie (`#f7f8fa`)
- Biela plocha (`#ffffff`)
- Modré primárne farby

### Dark Mode

- Automatické prepínanie podľa systémových nastavení
- Tmavé pozadie (`#0f172a`)
- Svetlý text (`#f1f5f9`)

### Responzívnosť

- Mobile-first prístup
- Optimalizované pre všetky zariadenia
- Flexibilné tabuľky

## 📊 API Endpoints

### GET /api/prices

Získa pre-market dáta pre S&P 500 spoločnosti.

**Response:**

```json
[
  {
    "ticker": "AAPL",
    "preMarketPrice": 150.25,
    "closePrice": 148.5,
    "percentChange": 1.18,
    "marketCapDiff": 2.5
  }
]
```

## 🗄️ Databáza

### Schema

```prisma
model PriceSnapshot {
  id            String   @id @default(cuid())
  ticker        String
  preMarketPrice Float
  closePrice    Float
  percentChange Float
  marketCapDiff Float
  createdAt     DateTime @default(now())
}
```

## 🚀 Deployment

### Vercel

```bash
npm run build
vercel --prod
```

### Railway

```bash
railway up
```

## 📝 Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Database
npm run db:studio    # Prisma Studio
npm run db:seed      # Seed data
npm run db:migrate   # Run migrations

# Linting
npm run lint
```

## 🔮 Budúce funkcie

- [ ] Triedenie a filtrovanie
- [ ] CSV export
- [ ] Notifikácie
- [ ] Pro verzia
- [ ] Affiliate odkazy
- [ ] Pokročilé grafy

## 🤝 Príspevky

1. Fork projektu
2. Vytvorte feature branch
3. Commit zmeny
4. Push do branch
5. Otvorte Pull Request

## 📄 Licencia

MIT License - pozri [LICENSE](LICENSE) súbor.

## 🔗 Odkazy

- [Polygon.io API](https://polygon.io/docs/)
- [Next.js Dokumentácia](https://nextjs.org/docs)
- [Prisma Dokumentácia](https://www.prisma.io/docs)
- [Kiddobank.com](https://kiddobank.com)

---

**Vytvorené s ❤️ pre sledovanie pre-market dát**
