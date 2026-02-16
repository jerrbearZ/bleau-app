import { NextResponse } from "next/server";
import { validateBlobUrl } from "@/lib/validations";
import { GEMINI_CONFIG } from "@/lib/constants";
import {
  MULTI_PET_STYLE_OPTIONS,
  MULTI_PET_ANALYSIS_PROMPT,
} from "@/lib/multi-pet-constants";
import type { TransformResponse } from "@/types";

export async function POST(
  request: Request
): Promise<NextResponse<TransformResponse>> {
  try {
    const { petImageUrls, style } = await request.json();

    // Validate: need 2-5 pet images
    if (
      !Array.isArray(petImageUrls) ||
      petImageUrls.length < 2 ||
      petImageUrls.length > 5
    ) {
      return NextResponse.json(
        { error: "Please upload 2-5 pet photos" },
        { status: 400 }
      );
    }

    for (const url of petImageUrls) {
      const validation = validateBlobUrl(url);
      if (!validation.valid) {
        return NextResponse.json(
          { error: `Invalid image: ${validation.error}` },
          { status: 400 }
        );
      }
    }

    const styleOption = MULTI_PET_STYLE_OPTIONS.find((s) => s.value === style);
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

    // Fetch all images in parallel
    const imageResponses = await Promise.all(
      petImageUrls.map((url: string) =>
        fetch(url, { signal: AbortSignal.timeout(15_000) })
      )
    );

    if (imageResponses.some((r) => !r.ok)) {
      return NextResponse.json(
        { error: "Failed to fetch one or more images" },
        { status: 500 }
      );
    }

    const imageBuffers = await Promise.all(
      imageResponses.map((r) => r.arrayBuffer())
    );

    const imageData = imageBuffers.map((buf, i) => ({
      base64: Buffer.from(buf).toString("base64"),
      mime: imageResponses[i].headers.get("content-type") || "image/jpeg",
    }));

    // Step 1: Analyze all pets
    const analysisParts = [
      ...imageData.map((img) => ({
        inlineData: { mimeType: img.mime, data: img.base64 },
      })),
      { text: MULTI_PET_ANALYSIS_PROMPT },
    ];

    const analysisResponse = await fetch(
      `${GEMINI_CONFIG.apiBaseUrl}/models/${GEMINI_CONFIG.fallbackModel}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        signal: AbortSignal.timeout(30_000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: analysisParts }],
        }),
      }
    );

    if (!analysisResponse.ok) {
      return NextResponse.json(
        { error: "Failed to analyze pet photos. Please try again." },
        { status: 500 }
      );
    }

    const analysisData = await analysisResponse.json();
    const petDescriptions =
      analysisData.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Multiple pets in the photos";

    // Step 2: Generate combined portrait
    const generatePrompt = `${styleOption.prompt}

PET IDENTITIES (each must be accurately depicted):
${petDescriptions}

CRITICAL INSTRUCTIONS:
- Every pet must appear in the final image
- Each pet's breed, coloring, markings, and features must match their reference photo exactly
- Pets should be interacting naturally with each other
- The composition should feel balanced with all pets visible
- Identity accuracy for ALL pets is the #1 priority`;

    const generateParts = [
      ...imageData.map((img) => ({
        inlineData: { mimeType: img.mime, data: img.base64 },
      })),
      { text: generatePrompt },
    ];

    const generateResponse = await fetch(
      `${GEMINI_CONFIG.apiBaseUrl}/models/${GEMINI_CONFIG.model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        signal: AbortSignal.timeout(90_000), // Longer timeout for multi-pet
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: generateParts }],
          generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
        }),
      }
    );

    if (!generateResponse.ok) {
      return NextResponse.json({
        description: `${petDescriptions}\n\n*Image generation temporarily unavailable. Please try again.*`,
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
        description: generatedText || petDescriptions,
      });
    }

    return NextResponse.json({
      description: generatedText || petDescriptions,
      transformedUrl: undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Multi-pet transform error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
