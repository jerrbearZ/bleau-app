import { NextResponse } from "next/server";
import { GEMINI_CONFIG } from "@/lib/constants";
import {
  DETECT_CONFIG,
  IMAGE_ANALYSIS_PROMPT,
  TEXT_ANALYSIS_PROMPT,
  type DetectResult,
  type Verdict,
} from "@/lib/detect-constants";

// Simple HTML to text extraction
function extractTextFromHtml(html: string): string {
  // Remove script and style tags and their content
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, " ");
  // Decode common HTML entities
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
  // Collapse whitespace
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

// Determine if a URL points to an image
function isImageUrl(url: string, contentType: string | null): boolean {
  if (contentType) {
    return DETECT_CONFIG.imageMimeTypes.some((t) => contentType.startsWith(t));
  }
  // Fallback: check URL extension
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
  return ["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(ext || "");
}

// Parse Gemini's response — handle both clean JSON and markdown-wrapped JSON
function parseGeminiJson(text: string): Record<string, unknown> | null {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // Try extracting from markdown code block
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch {
        // fall through
      }
    }
    // Try finding JSON object in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // fall through
      }
    }
    return null;
  }
}

// Validate and sanitize the verdict
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

// Call Gemini with either image or text
async function analyzeWithGemini(
  apiKey: string,
  parts: Array<Record<string, unknown>>
): Promise<string> {
  const response = await fetch(
    `${GEMINI_CONFIG.apiBaseUrl}/models/${GEMINI_CONFIG.fallbackModel}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      signal: AbortSignal.timeout(45_000),
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.1, // Low temperature for analytical accuracy
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini analysis error:", {
      status: response.status,
      error: errorText,
    });
    throw new Error(`Analysis failed: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export async function POST(
  request: Request
): Promise<NextResponse<DetectResult>> {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        {
          verdict: "UNCERTAIN",
          confidence: 0,
          summary: "No URL provided",
          indicators: [],
          explanation: "",
          contentType: "text",
          sourceUrl: "",
          error: "Please provide a valid URL",
        },
        { status: 400 }
      );
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      return NextResponse.json(
        {
          verdict: "UNCERTAIN",
          confidence: 0,
          summary: "Invalid URL",
          indicators: [],
          explanation: "",
          contentType: "text",
          sourceUrl: url,
          error: "Please provide a valid HTTP or HTTPS URL",
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
          sourceUrl: url,
          error: "Gemini API not configured",
        },
        { status: 500 }
      );
    }

    // Fetch the URL
    const fetchResponse = await fetch(url, {
      signal: AbortSignal.timeout(DETECT_CONFIG.fetchTimeoutMs),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Bleau/1.0; +https://bleau.ai)",
      },
    });

    if (!fetchResponse.ok) {
      return NextResponse.json(
        {
          verdict: "UNCERTAIN",
          confidence: 0,
          summary: "Could not fetch URL",
          indicators: [],
          explanation: "",
          contentType: "text",
          sourceUrl: url,
          error: `Failed to fetch URL (${fetchResponse.status}). The site may be blocking automated access.`,
        },
        { status: 422 }
      );
    }

    const contentType = fetchResponse.headers.get("content-type");

    // Route: Image analysis
    if (isImageUrl(url, contentType)) {
      const imageBuffer = await fetchResponse.arrayBuffer();

      // Check size (max 20MB for images)
      if (imageBuffer.byteLength > 20 * 1024 * 1024) {
        return NextResponse.json(
          {
            verdict: "UNCERTAIN",
            confidence: 0,
            summary: "Image too large",
            indicators: [],
            explanation: "",
            contentType: "image",
            sourceUrl: url,
            error: "Image exceeds 20MB limit",
          },
          { status: 400 }
        );
      }

      const base64Image = Buffer.from(imageBuffer).toString("base64");
      const mimeType = contentType?.split(";")[0] || "image/jpeg";

      const resultText = await analyzeWithGemini(process.env.GEMINI_API_KEY, [
        {
          inlineData: {
            mimeType,
            data: base64Image,
          },
        },
        { text: IMAGE_ANALYSIS_PROMPT },
      ]);

      const parsed = parseGeminiJson(resultText);

      if (!parsed) {
        return NextResponse.json({
          verdict: "UNCERTAIN",
          confidence: 0,
          summary: "Analysis could not be completed",
          indicators: [],
          explanation: resultText || "Failed to parse analysis results",
          contentType: "image",
          sourceUrl: url,
        });
      }

      return NextResponse.json({
        verdict: sanitizeVerdict(parsed.verdict as string),
        confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 50)),
        summary: (parsed.summary as string) || "Analysis complete",
        indicators: Array.isArray(parsed.indicators) ? parsed.indicators : [],
        explanation: (parsed.explanation as string) || "",
        contentType: "image",
        sourceUrl: url,
      });
    }

    // Route: Text / HTML analysis
    const html = await fetchResponse.text();
    const extractedText = extractTextFromHtml(html);

    if (extractedText.length < 50) {
      return NextResponse.json(
        {
          verdict: "UNCERTAIN",
          confidence: 0,
          summary: "Not enough text content to analyze",
          indicators: [],
          explanation: "",
          contentType: "text",
          sourceUrl: url,
          error:
            "The page doesn't contain enough readable text for analysis. Try pasting a direct link to an article or text content.",
        },
        { status: 422 }
      );
    }

    // Truncate to max length
    const textToAnalyze = extractedText.slice(
      0,
      DETECT_CONFIG.maxTextLength
    );

    const resultText = await analyzeWithGemini(process.env.GEMINI_API_KEY, [
      {
        text: `${TEXT_ANALYSIS_PROMPT}\n\n---\n\nTEXT TO ANALYZE:\n\n${textToAnalyze}`,
      },
    ]);

    const parsed = parseGeminiJson(resultText);

    if (!parsed) {
      return NextResponse.json({
        verdict: "UNCERTAIN",
        confidence: 0,
        summary: "Analysis could not be completed",
        indicators: [],
        explanation: resultText || "Failed to parse analysis results",
        contentType: "text",
        sourceUrl: url,
      });
    }

    return NextResponse.json({
      verdict: sanitizeVerdict(parsed.verdict as string),
      confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 50)),
      summary: (parsed.summary as string) || "Analysis complete",
      indicators: Array.isArray(parsed.indicators) ? parsed.indicators : [],
      explanation: (parsed.explanation as string) || "",
      contentType: "text",
      sourceUrl: url,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Detect error:", message);
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
