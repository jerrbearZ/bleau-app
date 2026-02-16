import { NextResponse } from "next/server";
import { GEMINI_CONFIG } from "@/lib/constants";
import { fetchQuotes } from "@/lib/stocks";

export async function POST(request: Request) {
  try {
    const { symbol } = await request.json();

    if (!symbol || typeof symbol !== "string") {
      return NextResponse.json({ error: "Symbol required" }, { status: 400 });
    }

    const ticker = symbol.toUpperCase().trim();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "AI analysis not configured" },
        { status: 500 }
      );
    }

    // Fetch current quote
    const quotes = await fetchQuotes([ticker]);
    const quote = quotes[0];

    if (!quote) {
      return NextResponse.json(
        { error: `Could not find data for ${ticker}` },
        { status: 404 }
      );
    }

    const prompt = `You are an elite stock analyst. Provide a concise analysis for ${ticker} (${quote.name}).

Current data:
- Price: $${quote.price.toFixed(2)}
- Day change: ${quote.change >= 0 ? "+" : ""}${quote.change.toFixed(2)} (${quote.changePercent.toFixed(2)}%)
- Volume: ${quote.volume.toLocaleString()}
- Market Cap: $${(quote.marketCap / 1e9).toFixed(1)}B
- P/E Ratio: ${quote.peRatio ? quote.peRatio.toFixed(1) : "N/A"}
- 52-week range: $${quote.low52w.toFixed(2)} — $${quote.high52w.toFixed(2)}

Provide in this EXACT format:

**VERDICT:** [BULLISH / BEARISH / NEUTRAL] — one sentence summary

**Bull Case:**
• [point 1]
• [point 2]
• [point 3]

**Bear Case:**
• [point 1]
• [point 2]
• [point 3]

**Key Levels:**
• Support: $X, $Y
• Resistance: $X, $Y

**Catalysts to Watch:**
• [upcoming event 1]
• [upcoming event 2]

**Day Trading Notes:**
• [actionable setup or pattern to watch]

Keep it sharp, data-driven, and actionable. No fluff.`;

    const response = await fetch(
      `${GEMINI_CONFIG.apiBaseUrl}/models/${GEMINI_CONFIG.fallbackModel}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3 },
        }),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "AI analysis failed" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const analysis =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "Analysis unavailable";

    return NextResponse.json({
      symbol: ticker,
      quote,
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Stock analysis error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
