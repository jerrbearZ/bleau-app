"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  RefreshCw,
  X,
} from "lucide-react";
import { SECTORS } from "@/lib/stocks";
import type { StockQuote } from "@/lib/stocks";

function formatPrice(p: number) {
  return `$${p.toFixed(2)}`;
}
function formatVol(v: number) {
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return String(v);
}
function formatCap(c: number) {
  if (c >= 1e12) return `$${(c / 1e12).toFixed(2)}T`;
  if (c >= 1e9) return `$${(c / 1e9).toFixed(1)}B`;
  return `$${(c / 1e6).toFixed(0)}M`;
}

function QuoteRow({ q }: { q: StockQuote }) {
  const isUp = q.change >= 0;
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 transition-all hover:border-gray-300 hover:shadow-sm">
      <div className="flex items-center gap-3">
        <div>
          <p className="text-sm font-bold text-black">{q.symbol}</p>
          <p className="text-[10px] text-gray-400 truncate max-w-[120px]">
            {q.name}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-sm font-semibold text-black">{formatPrice(q.price)}</p>
          <p
            className={`text-xs font-medium ${
              isUp ? "text-green-600" : q.change < 0 ? "text-red-600" : "text-gray-400"
            }`}
          >
            {isUp ? "+" : ""}
            {q.change.toFixed(2)} ({isUp ? "+" : ""}
            {q.changePercent.toFixed(2)}%)
          </p>
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-[10px] text-gray-400">Vol</p>
          <p className="text-xs text-gray-600">{formatVol(q.volume)}</p>
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-[10px] text-gray-400">MCap</p>
          <p className="text-xs text-gray-600">{formatCap(q.marketCap)}</p>
        </div>
        {isUp ? (
          <TrendingUp className="h-4 w-4 text-green-500" />
        ) : q.change < 0 ? (
          <TrendingDown className="h-4 w-4 text-red-500" />
        ) : (
          <Minus className="h-4 w-4 text-gray-300" />
        )}
      </div>
    </div>
  );
}

export default function StockDashboard() {
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTicker, setSearchTicker] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    symbol: string;
    analysis: string;
    quote: StockQuote;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSector, setActiveSector] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const allTickers = [...new Set(SECTORS.flatMap((s) => s.tickers))];
      const res = await fetch(`/api/stocks?symbols=${allTickers.join(",")}`);
      const data = await res.json();
      setQuotes(data.quotes || []);
    } catch {
      setError("Failed to load stock data");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAnalyze = useCallback(
    async (symbol?: string) => {
      const ticker = (symbol || searchTicker).trim().toUpperCase();
      if (!ticker) return;

      setAnalyzing(true);
      setAnalysis(null);
      setError(null);

      try {
        const res = await fetch("/api/stocks/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbol: ticker }),
        });
        const data = await res.json();

        if (data.error) {
          setError(data.error);
        } else {
          setAnalysis(data);
        }
      } catch {
        setError("Analysis failed");
      }
      setAnalyzing(false);
    },
    [searchTicker]
  );

  const sectorQuotes = (tickers: string[]) =>
    tickers
      .map((t) => quotes.find((q) => q.symbol === t))
      .filter(Boolean) as StockQuote[];

  const displaySectors = activeSector
    ? SECTORS.filter((s) => s.name === activeSector)
    : SECTORS;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      {/* Search + Analyze */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            value={searchTicker}
            onChange={(e) => setSearchTicker(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            placeholder="Enter ticker (e.g. MU, NVDA, AAPL)"
            className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-black outline-none transition-all focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>
        <button
          onClick={() => handleAnalyze()}
          disabled={analyzing || !searchTicker.trim()}
          className="inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-50"
        >
          {analyzing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Analyze
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* AI Analysis Result */}
      {analysis && (
        <div className="rounded-3xl border border-gray-200 bg-gray-50/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-black">
                {analysis.symbol} — AI Analysis
              </h3>
              <p className="text-xs text-gray-400">
                {analysis.quote.name} · {formatPrice(analysis.quote.price)}
              </p>
            </div>
            <button
              onClick={() => setAnalysis(null)}
              className="text-gray-400 hover:text-black"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="prose prose-sm max-w-none text-gray-700">
            {analysis.analysis.split("\n").map((line, i) => {
              if (line.startsWith("**") && line.endsWith("**")) {
                return (
                  <p key={i} className="mt-4 mb-1 font-bold text-black">
                    {line.replace(/\*\*/g, "")}
                  </p>
                );
              }
              if (line.startsWith("•")) {
                return (
                  <p key={i} className="ml-4 text-sm">
                    {line}
                  </p>
                );
              }
              if (line.trim()) {
                return (
                  <p key={i} className="text-sm">
                    {line.replace(/\*\*/g, "")}
                  </p>
                );
              }
              return null;
            })}
          </div>
          <p className="mt-4 text-[10px] text-gray-300">
            AI-generated analysis — not financial advice. Do your own research.
          </p>
        </div>
      )}

      {/* Sector Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSector(null)}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
            !activeSector
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All Sectors
        </button>
        {SECTORS.map((s) => (
          <button
            key={s.name}
            onClick={() =>
              setActiveSector(activeSector === s.name ? null : s.name)
            }
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              activeSector === s.name
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s.emoji} {s.name}
          </button>
        ))}
        <button
          onClick={fetchData}
          disabled={loading}
          className="ml-auto inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-200"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Sector Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
        </div>
      ) : (
        <div className="space-y-8">
          {displaySectors.map((sector) => {
            const sq = sectorQuotes(sector.tickers);
            if (sq.length === 0) return null;

            const avgChange =
              sq.reduce((sum, q) => sum + q.changePercent, 0) / sq.length;

            return (
              <div key={sector.name}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-black">
                    {sector.emoji} {sector.name}
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                        avgChange >= 0
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {avgChange >= 0 ? "+" : ""}
                      {avgChange.toFixed(2)}%
                    </span>
                  </h2>
                  <p className="text-xs text-gray-400">{sector.description}</p>
                </div>
                <div className="space-y-2">
                  {sq.map((q) => (
                    <button
                      key={q.symbol}
                      onClick={() => {
                        setSearchTicker(q.symbol);
                        handleAnalyze(q.symbol);
                      }}
                      className="w-full text-left"
                    >
                      <QuoteRow q={q} />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-center text-[10px] text-gray-300">
        Data provided by Yahoo Finance. AI analysis by Google Gemini. Not
        financial advice. Delayed quotes — do not use for live trading
        decisions.
      </p>
    </div>
  );
}
