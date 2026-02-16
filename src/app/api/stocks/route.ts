import { NextResponse } from "next/server";
import { fetchQuotes, SECTORS } from "@/lib/stocks";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get("symbols");
  const sector = searchParams.get("sector");

  let tickers: string[] = [];

  if (symbols) {
    tickers = symbols.split(",").map((s) => s.trim().toUpperCase()).slice(0, 20);
  } else if (sector) {
    const sectorInfo = SECTORS.find(
      (s) => s.name.toLowerCase().replace(/\s+/g, "-") === sector
    );
    if (sectorInfo) {
      tickers = sectorInfo.tickers;
    }
  } else {
    // Default: all sector tickers
    tickers = [...new Set(SECTORS.flatMap((s) => s.tickers))];
  }

  if (tickers.length === 0) {
    return NextResponse.json({ quotes: [] });
  }

  const quotes = await fetchQuotes(tickers);
  return NextResponse.json({ quotes });
}
