// Stock data utilities — uses Yahoo Finance v8 chart API (no key required)

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  peRatio: number | null;
  high52w: number;
  low52w: number;
}

export interface SectorInfo {
  name: string;
  emoji: string;
  description: string;
  tickers: string[];
  color: string;
}

export const SECTORS: SectorInfo[] = [
  {
    name: "Data Storage",
    emoji: "💾",
    description: "HDD, SSD, and enterprise storage",
    tickers: ["MU", "WDC", "STX", "PSTG", "NTAP"],
    color: "bg-blue-50 border-blue-200",
  },
  {
    name: "Semiconductors",
    emoji: "🔬",
    description: "Chip design and manufacturing",
    tickers: ["NVDA", "AMD", "AVGO", "QCOM", "INTC"],
    color: "bg-purple-50 border-purple-200",
  },
  {
    name: "AI & Cloud",
    emoji: "🤖",
    description: "AI infrastructure and cloud platforms",
    tickers: ["MSFT", "GOOGL", "AMZN", "META", "PLTR"],
    color: "bg-green-50 border-green-200",
  },
  {
    name: "Mega Cap Tech",
    emoji: "📱",
    description: "The biggest names in tech",
    tickers: ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"],
    color: "bg-orange-50 border-orange-200",
  },
];

// Fetch a single stock quote via Yahoo Finance v8 chart API
async function fetchSingleQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d&includePrePost=false`;
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 300 },
    });

    if (!response.ok) return null;

    const data = await response.json();
    const result = data.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const prevClose = meta.chartPreviousClose || meta.previousClose || 0;
    const price = meta.regularMarketPrice || 0;
    const change = price - prevClose;
    const changePercent = prevClose ? (change / prevClose) * 100 : 0;

    return {
      symbol: meta.symbol || symbol,
      name: meta.shortName || meta.longName || symbol,
      price,
      change,
      changePercent,
      volume: meta.regularMarketVolume || 0,
      marketCap: 0, // Not available in chart API
      peRatio: null,
      high52w: meta.fiftyTwoWeekHigh || 0,
      low52w: meta.fiftyTwoWeekLow || 0,
    };
  } catch {
    return null;
  }
}

// Fetch multiple quotes in parallel
export async function fetchQuotes(symbols: string[]): Promise<StockQuote[]> {
  const results = await Promise.all(symbols.map(fetchSingleQuote));
  return results.filter((r): r is StockQuote => r !== null);
}

// Format helpers
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

export function formatChange(change: number, percent: number): string {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)} (${sign}${percent.toFixed(2)}%)`;
}

export function formatVolume(vol: number): string {
  if (vol >= 1_000_000_000) return `${(vol / 1_000_000_000).toFixed(1)}B`;
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000) return `${(vol / 1_000).toFixed(1)}K`;
  return vol.toString();
}

export function formatMarketCap(cap: number): string {
  if (cap >= 1_000_000_000_000) return `$${(cap / 1_000_000_000_000).toFixed(2)}T`;
  if (cap >= 1_000_000_000) return `$${(cap / 1_000_000_000).toFixed(1)}B`;
  if (cap >= 1_000_000) return `$${(cap / 1_000_000).toFixed(1)}M`;
  return `$${cap}`;
}
