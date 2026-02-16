// AI Detection analysis prompts and configuration

export const DETECT_CONFIG = {
  // Max characters to extract from a webpage for text analysis
  maxTextLength: 8000,
  // Timeout for fetching URLs
  fetchTimeoutMs: 15_000,
  // Supported image MIME types
  imageMimeTypes: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
  ],
} as const;

export const IMAGE_ANALYSIS_PROMPT = `You are an expert forensic image analyst specializing in detecting AI-generated images. Analyze this image carefully and determine whether it was created by AI or is a genuine photograph/human-created artwork.

Examine the following forensic indicators:

**AI Generation Artifacts:**
- Hands, fingers, teeth — count them, check for deformities or impossible anatomy
- Text in the image — is it garbled, nonsensical, or inconsistent?
- Skin texture — is it unnaturally smooth, waxy, or plastic-looking?
- Hair — does it merge into the background, have impossible physics, or look like painted strands?
- Eyes — are reflections consistent between both eyes? Are pupils symmetrical?
- Background — are there morphing objects, inconsistent architecture, or melting/warping elements?
- Symmetry — is the image eerily perfect or has uncanny valley quality?
- Lighting — are shadows consistent with a single light source? Any impossible lighting?
- Edges — are there blurring or blending artifacts where objects meet backgrounds?
- Repetitive patterns — tiling or repeating textures that suggest diffusion model artifacts?
- Resolution consistency — are some areas sharper than others without depth-of-field justification?

**Signs of Authentic Photography:**
- Natural imperfections (dust, grain, minor blur, lens distortion)
- Consistent EXIF-style characteristics (depth of field, motion blur, lens flare)
- Natural skin pores, wrinkles, asymmetry
- Consistent physics and anatomy
- Environmental coherence

Respond in EXACTLY this JSON format (no markdown, no code blocks, just raw JSON):
{
  "verdict": "AI_GENERATED" | "LIKELY_AI" | "UNCERTAIN" | "LIKELY_REAL" | "REAL",
  "confidence": <number 0-100>,
  "summary": "<one sentence verdict>",
  "indicators": [
    {
      "category": "<category name>",
      "finding": "<what you observed>",
      "signal": "ai" | "real" | "neutral"
    }
  ],
  "explanation": "<2-3 sentence detailed explanation of your reasoning>"
}`;

export const TEXT_ANALYSIS_PROMPT = `You are an expert linguist and AI text detection specialist. Analyze the following text and determine whether it was written by AI or by a human.

Examine the following indicators:

**AI Writing Patterns:**
- Overly uniform sentence structure and paragraph length
- Excessive hedging language ("It's important to note that...", "It's worth mentioning...")
- Generic, safe, and non-committal tone
- Perfect grammar with no colloquialisms, typos, or informal language
- Repetitive transitional phrases ("Furthermore", "Moreover", "Additionally")
- Lists and bullet points where a human would write flowing prose
- Lack of personal anecdotes, specific experiences, or genuine opinion
- "As an AI language model" or similar tells (obvious but check)
- Unnaturally comprehensive coverage of a topic (tries to cover everything)
- Emoji or punctuation patterns typical of LLM outputs
- Sycophantic or overly agreeable tone
- Suspiciously well-structured with clear intro/body/conclusion

**Human Writing Patterns:**
- Irregular sentence lengths and structure variety
- Personal voice, opinions, humor, sarcasm, emotion
- Minor grammatical imperfections, colloquial language
- Specific personal experiences or niche knowledge
- Unexpected tangents or stream-of-consciousness elements
- Cultural references, slang, or regional language
- Genuine expertise shown through nuanced takes, not just surface coverage
- Contradictions or evolving thoughts within the piece

Respond in EXACTLY this JSON format (no markdown, no code blocks, just raw JSON):
{
  "verdict": "AI_GENERATED" | "LIKELY_AI" | "UNCERTAIN" | "LIKELY_REAL" | "REAL",
  "confidence": <number 0-100>,
  "summary": "<one sentence verdict>",
  "indicators": [
    {
      "category": "<category name>",
      "finding": "<what you observed>",
      "signal": "ai" | "real" | "neutral"
    }
  ],
  "explanation": "<2-3 sentence detailed explanation of your reasoning>"
}`;

export const MIXED_CONTENT_PROMPT = `You are analyzing a webpage that contains both text and images. I will provide the extracted text content. Analyze the TEXT only for AI generation indicators.

${TEXT_ANALYSIS_PROMPT}`;

// Verdict display configuration
export const VERDICT_CONFIG = {
  AI_GENERATED: {
    label: "AI Generated",
    color: "red",
    emoji: "🤖",
    bgClass: "bg-red-50 border-red-200",
    textClass: "text-red-700",
    barClass: "bg-red-500",
  },
  LIKELY_AI: {
    label: "Likely AI",
    color: "orange",
    emoji: "🤔",
    bgClass: "bg-orange-50 border-orange-200",
    textClass: "text-orange-700",
    barClass: "bg-orange-500",
  },
  UNCERTAIN: {
    label: "Uncertain",
    color: "yellow",
    emoji: "❓",
    bgClass: "bg-yellow-50 border-yellow-200",
    textClass: "text-yellow-700",
    barClass: "bg-yellow-500",
  },
  LIKELY_REAL: {
    label: "Likely Real",
    color: "blue",
    emoji: "👍",
    bgClass: "bg-blue-50 border-blue-200",
    textClass: "text-blue-700",
    barClass: "bg-blue-500",
  },
  REAL: {
    label: "Real / Human",
    color: "green",
    emoji: "✅",
    bgClass: "bg-green-50 border-green-200",
    textClass: "text-green-700",
    barClass: "bg-green-500",
  },
} as const;

export type Verdict = keyof typeof VERDICT_CONFIG;

export interface DetectIndicator {
  category: string;
  finding: string;
  signal: "ai" | "real" | "neutral";
}

export interface DetectResult {
  verdict: Verdict;
  confidence: number;
  summary: string;
  indicators: DetectIndicator[];
  explanation: string;
  contentType: "image" | "text" | "mixed";
  sourceUrl: string;
  error?: string;
}
