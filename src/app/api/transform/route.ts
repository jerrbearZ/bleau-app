import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { imageUrl, style } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set");
      return NextResponse.json(
        { error: "Gemini API not configured" },
        { status: 500 }
      );
    }

    console.log("Transforming image:", imageUrl, "Style:", style);

    // Fetch the image and convert to base64
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

    console.log("Image fetched, size:", imageBuffer.byteLength, "type:", mimeType);

    const prompt = `You are an art transformation expert. Analyze this image and describe in vivid detail how it would look if transformed into a ${style}.

Describe:
1. The overall visual style and aesthetic
2. Color palette changes
3. Texture and artistic techniques that would be applied
4. Specific elements and how they would be stylized
5. The mood and atmosphere of the transformed image

Be creative and descriptive, painting a picture with your words.`;

    // Use REST API directly instead of SDK
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error("Gemini API error:", errorData);
      return NextResponse.json(
        { error: `Gemini API error: ${geminiResponse.status}` },
        { status: 500 }
      );
    }

    const data = await geminiResponse.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No description generated";

    console.log("Transform success, description length:", text.length);

    return NextResponse.json({
      description: text,
      transformedUrl: null,
    });
  } catch (error) {
    console.error("Transform error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
