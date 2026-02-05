"use server";

import { put } from "@vercel/blob";

export async function uploadImage(formData: FormData) {
  try {
    const file = formData.get("file") as File;

    if (!file) {
      return { error: "No file provided" };
    }

    // Check if blob token is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("BLOB_READ_WRITE_TOKEN is not set");
      return { error: "Storage not configured. Please add BLOB_READ_WRITE_TOKEN to .env.local" };
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return { error: "Invalid file type. Please upload a JPEG, PNG, WebP, or GIF." };
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { error: "File too large. Maximum size is 10MB." };
    }

    console.log("Uploading file:", file.name, "Size:", file.size, "Type:", file.type);

    // Convert file to buffer for upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Vercel Blob
    const blob = await put(file.name, buffer, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: file.type,
    });

    console.log("Upload successful:", blob.url);
    return { url: blob.url };
  } catch (error) {
    console.error("Upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { error: `Failed to upload: ${errorMessage}` };
  }
}
