import { NextResponse } from "next/server";
import { validateBlobUrl, validateStyle } from "@/lib/validations";
import { STYLE_OPTIONS, GEMINI_CONFIG, PET_ANALYSIS_PROMPT } from "@/lib/constants";
import type { TransformResponse } from "@/types";

export async function POST(
  request: Request
): Promise<NextResponse<TransformResponse>> {
  try {
    const { imageUrl, style } = await request.json();

    // Validate inputs
    const urlValidation = validateBlobUrl(imageUrl);
    if (!urlValidation.valid) {
      return NextResponse.json({ error: urlValidation.error }, { status: 400 });
    }

    const styleValidation = validateStyle(style, STYLE_OPTIONS);
    if (!styleValidation.valid) {
      return NextResponse.json(
        { error: styleValidation.error },
        { status: 400 }
      );
    }

    const styleOption = STYLE_OPTIONS.find((s) => s.value === style);
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

    // Step 1: Fetch and encode the original image
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

    // Step 2: Analyze the pet's identity in precise detail
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
                {
                  inlineData: {
                    mimeType,
                    data: base64Image,
                  },
                },
                {
                  text: PET_ANALYSIS_PROMPT,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!analyzeResponse.ok) {
      const errorText = await analyzeResponse.text();
      console.error("Pet analysis error:", {
        status: analyzeResponse.status,
        error: errorText,
      });
      return NextResponse.json(
        { error: "Failed to analyze your pet's photo. Please try again." },
        { status: 500 }
      );
    }

    const analyzeData = await analyzeResponse.json();
    const petDescription =
      analyzeData.candidates?.[0]?.content?.parts?.[0]?.text ||
      "A pet in the photo";

    // Step 3: Generate portrait with original image + identity-preserving prompt
    // Passing the original image alongside the prompt gives Gemini a visual
    // reference, dramatically improving identity consistency
    const generatePrompt = `${styleOption.prompt}

IDENTITY REFERENCE — this is the exact pet you must depict:
${petDescription}

CRITICAL INSTRUCTIONS:
- The generated image must depict this EXACT pet, not a generic animal
- Do NOT change the breed, fur color, markings, eye color, or any distinguishing features
- The pet must be immediately recognizable as the same individual from the reference photo
- Identity accuracy is the #1 priority, artistic style is #2`;

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
                {
                  inlineData: {
                    mimeType,
                    data: base64Image,
                  },
                },
                {
                  text: generatePrompt,
                },
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
      console.error("Pet generation error:", {
        status: generateResponse.status,
        error: errorText,
      });
      // Graceful fallback — return the analysis so the user sees something
      return NextResponse.json({
        description: `**Your pet:** ${petDescription}\n\n*Image generation is temporarily unavailable. Please try again in a moment.*`,
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

    if (generatedText) {
      return NextResponse.json({
        description: generatedText,
        transformedUrl: undefined,
      });
    }

    return NextResponse.json({
      description: petDescription,
      transformedUrl: undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Transform error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
