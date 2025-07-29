# PreMarketPrice.com

Aplikácia pre zobrazenie pre-market dát akcií S&P 500 spoločností s kompaktným dizajnom.

## Funkcie

- 📊 Zobrazenie pre-market percentuálnych zmien
- 💰 Rozdiely v trhovej kapitalizácii
- ⭐ Systém obľúbených akcií
- 🔄 Možnosť obnovenia dát
- 📱 Responzívny dizajn
- 🎨 Kompaktný vzhľad pre efektívne využitie priestoru

## Technológie

- **Frontend**: Next.js 15.4.4, React 19.1.0
- **Styling**: CSS s CSS Variables (podpora dark/light mode)
- **Icons**: Lucide React
- **Data**: Mock dáta + API endpoint pre Polygon.io
- **Port**: 3002

## Inštalácia

1. **Klonovanie repozitára**:

   ```bash
   git clone <repository-url>
   cd PreMarketPrice
   ```

2. **Inštalácia závislostí**:

   ```bash
   npm install
   ```

3. **Spustenie vývojového servera**:

   ```bash
   npm run dev
   ```

4. **Otvorenie aplikácie**:
   Otvorte prehliadač a prejdite na `http://localhost:3002`

## Štruktúra projektu

```
src/
├── app/
│   ├── api/
│   │   ├── history/route.ts
│   │   └── prices/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── FavoriteCard.tsx
│   ├── StockTable.tsx
│   └── ThemeToggle.tsx
├── hooks/
│   ├── useSortableData.ts
│   └── useSortableTable.ts
└── lib/
    ├── format.ts
    ├── getLogoUrl.ts
    └── prisma.ts
```

## Konfigurácia

### Port

Aplikácia beží na porte 3002. Ak chcete zmeniť port, upravte `package.json`:

```json
{
  "scripts": {
    "dev": "next dev --turbopack -p 3002"
  }
}
```

### API kľúče

Pre reálne dáta potrebujete Polygon.io API kľúč. Vytvorte `.env.local` súbor:

```env
POLYGON_API_KEY=your_api_key_here
```

## Používanie

1. **Zobrazenie dát**: Aplikácia automaticky zobrazuje mock dáta
2. **Obnovenie dát**: Kliknite na "Refresh Data" pre načítanie nových dát
3. **Obľúbené**: Kliknite na hviezdičku pre pridanie/odstránenie z obľúbených
4. **Zoradenie**: Kliknite na hlavičky stĺpcov pre zoradenie

## Zálohovanie

### Git (Odporúčané)

```bash
# Vytvorenie commit
git add .
git commit -m "Update: description of changes"

# Push na remote repository
git push origin main
```

### Manuálna záloha

Skopírujte celý priečinok projektu na bezpečné miesto.

## Riešenie problémov

### Port už je obsadený

```bash
# Skontrola obsadených portov
netstat -ano | findstr :3002

# Zmena portu v package.json
"dev": "next dev --turbopack -p 3003"
```

### Modul not found chyby

```bash
# Reštartovanie servera
npm run dev

# Preinštalovanie závislostí
npm install
```

## Verzie

- **v0.1.0**: Počiatočná verzia s kompaktným dizajnom
- Port: 3002
- Kompaktné logá (24px)
- Optimalizované rozostupy

## Licencia

MIT License
