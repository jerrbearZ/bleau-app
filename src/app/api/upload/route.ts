import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("BLOB_READ_WRITE_TOKEN is not set");
      return NextResponse.json(
        { error: "Storage not configured" },
        { status: 500 }
      );
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a JPEG, PNG, WebP, or GIF." },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    console.log("Uploading:", file.name, file.size, file.type);

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    console.log("Upload success:", blob.url);
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
