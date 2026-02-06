// Image upload constraints
export const UPLOAD_CONFIG = {
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  maxSizeMB: 10,
  allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"] as const,
  allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
} as const;

// Vercel Blob URL pattern for validation
export const BLOB_URL_PATTERN = ".blob.vercel-storage.com";

// Style options for image transformation
export const STYLE_OPTIONS = [
  { value: "3D Pixar character", label: "3D Pixar" },
  { value: "Studio Ghibli anime style", label: "Studio Ghibli" },
  { value: "oil painting masterpiece", label: "Oil Painting" },
  { value: "cyberpunk neon aesthetic", label: "Cyberpunk" },
  { value: "watercolor illustration", label: "Watercolor" },
  { value: "pop art comic style", label: "Pop Art" },
] as const;

// API endpoints
export const API_ENDPOINTS = {
  upload: "/api/upload",
  transform: "/api/transform",
} as const;

// Gemini API configuration
export const GEMINI_CONFIG = {
  model: "gemini-2.0-flash-exp-image-generation",
  fallbackModel: "gemini-2.0-flash",
  apiBaseUrl: "https://generativelanguage.googleapis.com/v1beta",
} as const;
