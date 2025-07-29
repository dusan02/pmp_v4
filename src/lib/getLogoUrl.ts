/**
 * Pre daný ticker vráti URL na logo z Clearbitu.
 * Ak ticker v mape chýba, použije _DEFAULT doménu.
 */
const tickerDomains: Record<string, string> = {
  AAPL: "apple.com",
  MSFT: "microsoft.com",
  GOOGL: "google.com",
  AMZN: "amazon.com",
  NVDA: "nvidia.com",
  META: "facebook.com",
  TSLA: "tesla.com",
  BRK:  "berkshirehathaway.com",
  LLY:  "lilly.com",
  TSM:  "tsmc.com",
  V:    "visa.com",
  UNH:  "unitedhealthgroup.com",
  XOM:  "exxonmobil.com",
  JNJ:  "jnj.com",
  WMT:  "walmart.com",
  JPM:  "jpmorganchase.com",
  PG:   "pg.com",
  MA:   "mastercard.com",
  AVGO: "broadcom.com",
  HD:   "homedepot.com",
  _DEFAULT: "nyse.com",
};

export function getLogoUrl(ticker: string): string {
  const domain = tickerDomains[ticker] ?? tickerDomains._DEFAULT;
  return `https://logo.clearbit.com/${domain}`;
} 