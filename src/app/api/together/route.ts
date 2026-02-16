import { NextResponse } from "next/server";
import { validateBlobUrl } from "@/lib/validations";
import { GEMINI_CONFIG } from "@/lib/constants";
import {
  TOGETHER_STYLE_OPTIONS,
  PERSON_ANALYSIS_PROMPT,
  PET_ANALYSIS_PROMPT_TOGETHER,
} from "@/lib/together-constants";
import type { TransformResponse } from "@/types";

export async function POST(
  request: Request
): Promise<NextResponse<TransformResponse>> {
  try {
    const { personImageUrl, petImageUrl, style } = await request.json();

    // Validate inputs
    const personUrlValidation = validateBlobUrl(personImageUrl);
    if (!personUrlValidation.valid) {
      return NextResponse.json(
        { error: `Person photo: ${personUrlValidation.error}` },
        { status: 400 }
      );
    }

    const petUrlValidation = validateBlobUrl(petImageUrl);
    if (!petUrlValidation.valid) {
      return NextResponse.json(
        { error: `Pet photo: ${petUrlValidation.error}` },
        { status: 400 }
      );
    }

    const styleOption = TOGETHER_STYLE_OPTIONS.find((s) => s.value === style);
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

    // Fetch both images
    const [personResponse, petResponse] = await Promise.all([
      fetch(personImageUrl, { signal: AbortSignal.timeout(15_000) }),
      fetch(petImageUrl, { signal: AbortSignal.timeout(15_000) }),
    ]);

    if (!personResponse.ok || !petResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch one or both images" },
        { status: 500 }
      );
    }

    const [personBuffer, petBuffer] = await Promise.all([
      personResponse.arrayBuffer(),
      petResponse.arrayBuffer(),
    ]);

    const personBase64 = Buffer.from(personBuffer).toString("base64");
    const petBase64 = Buffer.from(petBuffer).toString("base64");
    const personMime =
      personResponse.headers.get("content-type") || "image/jpeg";
    const petMime = petResponse.headers.get("content-type") || "image/jpeg";

    // Step 1: Analyze both subjects in parallel
    const [personAnalysis, petAnalysis] = await Promise.all([
      fetch(
        `${GEMINI_CONFIG.apiBaseUrl}/models/${GEMINI_CONFIG.fallbackModel}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          signal: AbortSignal.timeout(30_000),
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { inlineData: { mimeType: personMime, data: personBase64 } },
                  { text: PERSON_ANALYSIS_PROMPT },
                ],
              },
            ],
          }),
        }
      ),
      fetch(
        `${GEMINI_CONFIG.apiBaseUrl}/models/${GEMINI_CONFIG.fallbackModel}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          signal: AbortSignal.timeout(30_000),
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { inlineData: { mimeType: petMime, data: petBase64 } },
                  { text: PET_ANALYSIS_PROMPT_TOGETHER },
                ],
              },
            ],
          }),
        }
      ),
    ]);

    if (!personAnalysis.ok || !petAnalysis.ok) {
      return NextResponse.json(
        { error: "Failed to analyze one or both photos. Please try again." },
        { status: 500 }
      );
    }

    const [personData, petData] = await Promise.all([
      personAnalysis.json(),
      petAnalysis.json(),
    ]);

    const personDesc =
      personData.candidates?.[0]?.content?.parts?.[0]?.text ||
      "A person in the photo";
    const petDesc =
      petData.candidates?.[0]?.content?.parts?.[0]?.text ||
      "A pet in the photo";

    // Step 2: Generate the combined portrait
    const generatePrompt = `${styleOption.prompt}

PERSON IDENTITY (must match exactly):
${personDesc}

PET IDENTITY (must match exactly):
${petDesc}

CRITICAL INSTRUCTIONS:
- Both the person and pet must be clearly recognizable as the specific individuals from the reference photos
- The person's face, hair, build, and features must be accurate
- The pet's breed, coloring, markings, and features must be accurate
- They should be interacting naturally — genuine warmth and connection between them
- Identity accuracy for BOTH subjects is the #1 priority`;

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
                { inlineData: { mimeType: personMime, data: personBase64 } },
                { inlineData: { mimeType: petMime, data: petBase64 } },
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
      const errorText = await generateResponse.text();
      console.error("Together generation error:", {
        status: generateResponse.status,
        error: errorText,
      });
      return NextResponse.json({
        description: `**Person:** ${personDesc}\n\n**Pet:** ${petDesc}\n\n*Image generation temporarily unavailable. Please try again.*`,
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
        description: generatedText || `${personDesc}\n\n${petDesc}`,
      });
    }

    if (generatedText) {
      return NextResponse.json({
        description: generatedText,
        transformedUrl: undefined,
      });
    }

    return NextResponse.json({
      description: `${personDesc}\n\n${petDesc}`,
      transformedUrl: undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Together transform error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
