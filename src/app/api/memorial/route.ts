import { NextResponse } from "next/server";
import { validateBlobUrl } from "@/lib/validations";
import { GEMINI_CONFIG } from "@/lib/constants";
import {
  MEMORIAL_STYLE_OPTIONS,
  MEMORIAL_PET_ANALYSIS_PROMPT,
} from "@/lib/memorial-constants";
import type { TransformResponse } from "@/types";

export async function POST(
  request: Request
): Promise<NextResponse<TransformResponse>> {
  try {
    const { imageUrl, style, petName } = await request.json();

    const urlValidation = validateBlobUrl(imageUrl);
    if (!urlValidation.valid) {
      return NextResponse.json({ error: urlValidation.error }, { status: 400 });
    }

    const styleOption = MEMORIAL_STYLE_OPTIONS.find((s) => s.value === style);
    if (!styleOption) {
      return NextResponse.json(
        { error: "Invalid style selected" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API not configured" },
        { status: 500 }
      );
    }

    // Fetch image
    const imageResponse = await fetch(imageUrl, {
      signal: AbortSignal.timeout(15_000),
    });
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch uploaded image" },
        { status: 500 }
      );
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

    // Step 1: Analyze pet identity with memorial-specific prompt
    const analyzeResponse = await fetch(
      `${GEMINI_CONFIG.apiBaseUrl}/models/${GEMINI_CONFIG.fallbackModel}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        signal: AbortSignal.timeout(30_000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { inlineData: { mimeType, data: base64Image } },
                { text: MEMORIAL_PET_ANALYSIS_PROMPT },
              ],
            },
          ],
        }),
      }
    );

    if (!analyzeResponse.ok) {
      return NextResponse.json(
        { error: "Failed to analyze your pet's photo. Please try again." },
        { status: 500 }
      );
    }

    const analyzeData = await analyzeResponse.json();
    const petDescription =
      analyzeData.candidates?.[0]?.content?.parts?.[0]?.text ||
      "A beloved pet";

    // Step 2: Generate memorial portrait
    const nameClause = petName
      ? `The pet's name is ${petName}. `
      : "";

    const generatePrompt = `${styleOption.prompt}

${nameClause}IDENTITY REFERENCE — this is the exact pet to depict:
${petDescription}

CRITICAL INSTRUCTIONS:
- This is a MEMORIAL portrait for someone who has lost their beloved pet
- Every physical detail must match the original photo exactly
- The pet must look healthy, happy, and at peace
- The mood should be comforting, beautiful, and deeply respectful
- Identity accuracy is the absolute #1 priority — this pet was someone's family member
- Create something worthy of being printed, framed, and treasured forever`;

    const generateResponse = await fetch(
      `${GEMINI_CONFIG.apiBaseUrl}/models/${GEMINI_CONFIG.model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        signal: AbortSignal.timeout(60_000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { inlineData: { mimeType, data: base64Image } },
                { text: generatePrompt },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        }),
      }
    );

    if (!generateResponse.ok) {
      return NextResponse.json({
        description: `${petDescription}\n\n*Image generation temporarily unavailable. Please try again in a moment.*`,
        transformedUrl: undefined,
      });
    }

    const generateData = await generateResponse.json();
    const parts = generateData.candidates?.[0]?.content?.parts || [];

    let generatedImageData: string | null = null;
    let generatedMimeType = "image/png";
    let generatedText: string | null = null;

    for (const part of parts) {
      if (part.inlineData?.data) {
        generatedImageData = part.inlineData.data;
        generatedMimeType = part.inlineData.mimeType || "image/png";
      }
      if (part.text) {
        generatedText = part.text;
      }
    }

    if (generatedImageData) {
      const dataUrl = `data:${generatedMimeType};base64,${generatedImageData}`;
      return NextResponse.json({
        transformedUrl: dataUrl,
        description: generatedText || petDescription,
      });
    }

    return NextResponse.json({
      description: generatedText || petDescription,
      transformedUrl: undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Memorial transform error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
