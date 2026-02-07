import { NextResponse } from "next/server";
import { validateBlobUrl, validateStyle } from "@/lib/validations";
import { STYLE_OPTIONS, GEMINI_CONFIG } from "@/lib/constants";
import type { TransformResponse } from "@/types";

export async function POST(request: Request): Promise<NextResponse<TransformResponse>> {
  try {
    const { imageUrl, style } = await request.json();

    // Validate inputs
    const urlValidation = validateBlobUrl(imageUrl);
    if (!urlValidation.valid) {
      return NextResponse.json({ error: urlValidation.error }, { status: 400 });
    }

    const styleValidation = validateStyle(style, STYLE_OPTIONS);
    if (!styleValidation.valid) {
      return NextResponse.json({ error: styleValidation.error }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API not configured" },
        { status: 500 }
      );
    }

    // Step 1: Fetch and encode the original image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch uploaded image" },
        { status: 500 }
      );
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

    // Step 2: Use Gemini to analyze the image and get a description
    const analyzeResponse = await fetch(
      `${GEMINI_CONFIG.apiBaseUrl}/models/${GEMINI_CONFIG.fallbackModel}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Image,
                  },
                },
                {
                  text: `Describe this image in detail for an artist to recreate it. Include:
- Main subject(s) and their poses/positions
- Background elements
- Colors and lighting
- Composition and framing
- Any text or notable details
Keep the description concise but complete (2-3 sentences).`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!analyzeResponse.ok) {
      const errorText = await analyzeResponse.text();
      return NextResponse.json(
        { error: `Image analysis failed: ${analyzeResponse.status}` },
        { status: 500 }
      );
    }

    const analyzeData = await analyzeResponse.json();
    const imageDescription =
      analyzeData.candidates?.[0]?.content?.parts?.[0]?.text ||
      "A detailed image";

    // Step 3: Generate new image using image generation model
    const generatePrompt = `Create an image in ${style} style: ${imageDescription}. Make it highly detailed and artistic.`;

    const generateResponse = await fetch(
      `${GEMINI_CONFIG.apiBaseUrl}/models/${GEMINI_CONFIG.model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: generatePrompt,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["image", "text"],
          },
        }),
      }
    );

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      // Fallback: Return just the description if image generation fails
      return NextResponse.json({
        description: `**Style: ${style}**\n\n${imageDescription}\n\n*Image generation is currently unavailable. Here's how your image would look:*\n\nImagine this scene transformed with ${style} aesthetics, featuring stylized elements, characteristic color palettes, and artistic techniques typical of this style.`,
        transformedUrl: undefined,
      });
    }

    const generateData = await generateResponse.json();

    // Find image and text parts in the response
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
      // We got a generated image - convert to data URL
      const dataUrl = `data:${generatedMimeType};base64,${generatedImageData}`;

      return NextResponse.json({
        transformedUrl: dataUrl,
        description: generatedText || imageDescription,
      });
    } else if (generatedText) {
      // Got text only
      return NextResponse.json({
        description: generatedText,
        transformedUrl: undefined,
      });
    }

    return NextResponse.json({
      description: imageDescription,
      transformedUrl: undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
