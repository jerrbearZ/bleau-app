import { UPLOAD_CONFIG, BLOB_URL_PATTERN } from "./constants";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate file for upload
 */
export function validateFile(file: File): ValidationResult {
  // Check if file exists
  if (!file || !file.name) {
    return { valid: false, error: "No file provided" };
  }

  // Check file type
  if (!UPLOAD_CONFIG.allowedTypes.includes(file.type as typeof UPLOAD_CONFIG.allowedTypes[number])) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${UPLOAD_CONFIG.allowedExtensions.join(", ")}`,
    };
  }

  // Check file size
  if (file.size > UPLOAD_CONFIG.maxSizeBytes) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${UPLOAD_CONFIG.maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Validate that a URL is from our Vercel Blob storage (prevents SSRF)
 */
export function validateBlobUrl(url: string): ValidationResult {
  if (!url) {
    return { valid: false, error: "No URL provided" };
  }

  try {
    const parsedUrl = new URL(url);

    // Must be HTTPS
    if (parsedUrl.protocol !== "https:") {
      return { valid: false, error: "URL must use HTTPS" };
    }

    // Must be from Vercel Blob storage (exact domain or subdomain)
    if (
      parsedUrl.hostname !== BLOB_URL_PATTERN &&
      !parsedUrl.hostname.endsWith(`.${BLOB_URL_PATTERN}`)
    ) {
      return { valid: false, error: "Invalid image source" };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}

/**
 * Validate style option
 */
export function validateStyle(style: string, validStyles: readonly { value: string }[]): ValidationResult {
  if (!style) {
    return { valid: false, error: "No style selected" };
  }

  const isValid = validStyles.some((s) => s.value === style);
  if (!isValid) {
    return { valid: false, error: "Invalid style option" };
  }

  return { valid: true };
}
