// Stock data utilities — uses Yahoo Finance API (no key required)

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

// Fetch stock quotes from Yahoo Finance
export async function fetchQuotes(symbols: string[]): Promise<StockQuote[]> {
  const query = symbols.join(",");
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${query}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  if (!response.ok) {
    console.error("Yahoo Finance error:", response.status);
    return [];
  }

  const data = await response.json();
  const results = data.quoteResponse?.result || [];

  return results.map((q: Record<string, unknown>) => ({
    symbol: q.symbol as string,
    name: (q.shortName || q.longName || q.symbol) as string,
    price: (q.regularMarketPrice as number) || 0,
    change: (q.regularMarketChange as number) || 0,
    changePercent: (q.regularMarketChangePercent as number) || 0,
    volume: (q.regularMarketVolume as number) || 0,
    marketCap: (q.marketCap as number) || 0,
    peRatio: (q.trailingPE as number) || null,
    high52w: (q.fiftyTwoWeekHigh as number) || 0,
    low52w: (q.fiftyTwoWeekLow as number) || 0,
  }));
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
