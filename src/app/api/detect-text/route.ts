import { NextResponse } from "next/server";
import { GEMINI_CONFIG } from "@/lib/constants";
import {
  DETECT_CONFIG,
  TEXT_ANALYSIS_PROMPT,
  type DetectResult,
  type Verdict,
} from "@/lib/detect-constants";

// Parse Gemini's response
function parseGeminiJson(text: string): Record<string, unknown> | null {
  try {
    return JSON.parse(text);
  } catch {
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch {
        /* fall through */
      }
    }
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        /* fall through */
      }
    }
    return null;
  }
}

function sanitizeVerdict(raw: string): Verdict {
  const valid: Verdict[] = [
    "AI_GENERATED",
    "LIKELY_AI",
    "UNCERTAIN",
    "LIKELY_REAL",
    "REAL",
  ];
  const upper = (raw || "").toUpperCase().replace(/\s+/g, "_");
  return valid.includes(upper as Verdict) ? (upper as Verdict) : "UNCERTAIN";
}

export async function POST(
  request: Request
): Promise<NextResponse<DetectResult>> {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string" || text.trim().length < 50) {
      return NextResponse.json(
        {
          verdict: "UNCERTAIN",
          confidence: 0,
          summary: "Not enough text",
          indicators: [],
          explanation: "",
          contentType: "text",
          sourceUrl: "",
          error: "Please provide at least 50 characters of text to analyze.",
        },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          verdict: "UNCERTAIN",
          confidence: 0,
          summary: "Service unavailable",
          indicators: [],
          explanation: "",
          contentType: "text",
          sourceUrl: "",
          error: "Gemini API not configured",
        },
        { status: 500 }
      );
    }

    const textToAnalyze = text.trim().slice(0, DETECT_CONFIG.maxTextLength);

    const response = await fetch(
      `${GEMINI_CONFIG.apiBaseUrl}/models/${GEMINI_CONFIG.fallbackModel}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        signal: AbortSignal.timeout(45_000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${TEXT_ANALYSIS_PROMPT}\n\n---\n\nTEXT TO ANALYZE:\n\n${textToAnalyze}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini text analysis error:", {
        status: response.status,
        error: errorText,
      });
      return NextResponse.json(
        {
          verdict: "UNCERTAIN",
          confidence: 0,
          summary: "Analysis failed",
          indicators: [],
          explanation: "",
          contentType: "text",
          sourceUrl: "",
          error: "Failed to analyze text. Please try again.",
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    const resultText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const parsed = parseGeminiJson(resultText);

    if (!parsed) {
      return NextResponse.json({
        verdict: "UNCERTAIN",
        confidence: 0,
        summary: "Could not complete analysis",
        indicators: [],
        explanation: resultText || "Failed to parse results",
        contentType: "text",
        sourceUrl: "",
      });
    }

    return NextResponse.json({
      verdict: sanitizeVerdict(parsed.verdict as string),
      confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 50)),
      summary: (parsed.summary as string) || "Analysis complete",
      indicators: Array.isArray(parsed.indicators) ? parsed.indicators : [],
      explanation: (parsed.explanation as string) || "",
      contentType: "text",
      sourceUrl: "",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Detect-text error:", message);
    return NextResponse.json(
      {
        verdict: "UNCERTAIN" as Verdict,
        confidence: 0,
        summary: "Analysis failed",
        indicators: [],
        explanation: "",
        contentType: "text" as const,
        sourceUrl: "",
        error: message,
      },
      { status: 500 }
    );
  }
}
