// Watermark utility for free-tier portraits
// Adds a subtle "bleau.ai" watermark to generated images

/**
 * Adds a watermark to a base64 image using Canvas API (client-side)
 * Returns a new base64 data URL with the watermark applied
 */
export async function addWatermark(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(dataUrl); // fallback: return original
        return;
      }

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Watermark config
      const fontSize = Math.max(14, Math.floor(img.width / 30));
      const padding = Math.floor(fontSize * 0.8);

      ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";

      // Semi-transparent white text with subtle shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
      ctx.fillText(
        "bleau.ai",
        canvas.width - padding,
        canvas.height - padding
      );

      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = () => resolve(dataUrl); // fallback
    img.src = dataUrl;
  });
}

/**
 * Check if watermark should be applied (free tier)
 */
export function shouldWatermark(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem("bleau_usage");
    if (!raw) return true;
    const data = JSON.parse(raw);
    return !data.isPro;
  } catch {
    return true;
  }
}
