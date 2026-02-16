// Image upload constraints
export const UPLOAD_CONFIG = {
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  maxSizeMB: 10,
  allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"] as const,
  allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
} as const;

// Vercel Blob URL pattern for validation
export const BLOB_URL_PATTERN = "blob.vercel-storage.com";

// Pet portrait style options
export const STYLE_OPTIONS = [
  {
    value: "realistic-studio",
    label: "Studio Portrait",
    emoji: "📸",
    description: "Professional studio lighting, clean background",
    prompt:
      "Create a professional studio portrait photograph of this exact pet. Use soft, directional studio lighting with a clean, softly blurred neutral background. The pet should look noble and dignified, captured in sharp detail. Maintain every physical detail of the pet exactly — breed, fur color and pattern, markings, eye color, nose color, ear shape, and facial features must be identical to the original photo.",
  },
  {
    value: "action-outdoor",
    label: "Action Shot",
    emoji: "🏃",
    description: "Running through a sunlit meadow",
    prompt:
      "Create a dynamic action photograph of this exact pet running joyfully through a beautiful sunlit meadow filled with wildflowers. Golden hour lighting, motion blur on the grass, the pet looks happy and full of energy with ears flowing. Maintain every physical detail of the pet exactly — breed, fur color and pattern, markings, eye color, nose color, ear shape, and facial features must be identical to the original photo.",
  },
  {
    value: "royal-portrait",
    label: "Royal Portrait",
    emoji: "👑",
    description: "Renaissance painting in royal attire",
    prompt:
      "Create a masterful renaissance-style oil painting portrait of this exact pet dressed in ornate royal attire — a rich velvet robe with gold embroidery, a jeweled crown, and a regal expression. Dark classical background with dramatic chiaroscuro lighting reminiscent of Rembrandt. The pet's face and features must be painted with photographic accuracy. Maintain every physical detail exactly — breed, fur color and pattern, markings, eye color, and facial features must be identical to the original photo.",
  },
  {
    value: "cartoon-pixar",
    label: "Pixar Character",
    emoji: "✨",
    description: "3D animated movie character",
    prompt:
      "Create a high-quality 3D Pixar/Disney-style animated character version of this exact pet. Big, expressive, soulful eyes with light reflections, slightly exaggerated but endearing proportions, warm cinematic lighting, and a friendly heartwarming expression. The character should be unmistakably this specific pet — same breed, fur color, unique markings, and distinctive features must all be clearly preserved in the 3D style.",
  },
  {
    value: "watercolor",
    label: "Watercolor",
    emoji: "🎨",
    description: "Delicate watercolor painting",
    prompt:
      "Create a beautiful, gallery-quality watercolor painting of this exact pet. Use soft, flowing wet-on-wet brushstrokes, gentle color washes that bleed naturally, and leave some white paper showing through for luminosity. The painting should feel delicate, artistic, and emotionally evocative while clearly and accurately depicting this specific pet — same breed, fur color, markings, eye color, and all distinguishing features must be faithfully preserved.",
  },
  {
    value: "superhero",
    label: "Superhero",
    emoji: "🦸",
    description: "Caped crusader on a rooftop",
    prompt:
      "Create an epic, cinematic superhero version of this exact pet wearing a custom-fitted superhero suit with a flowing cape, standing heroically on a skyscraper rooftop with a dramatic city skyline at golden sunset behind them. Wind blowing through their fur, confident powerful stance, lens flare. Maintain every physical detail of the pet exactly — breed, fur color and pattern, markings, eye color, and facial features must be identical to the original photo.",
  },
  {
    value: "cozy-holiday",
    label: "Cozy & Warm",
    emoji: "🧣",
    description: "Curled up by the fireplace",
    prompt:
      "Create a heartwarming, cozy portrait of this exact pet curled up contentedly next to a crackling fireplace, wearing a soft knitted sweater. Warm amber lighting from the fire, a plush blanket nearby, perhaps a mug of cocoa in the scene. The atmosphere should feel like a perfect winter evening. Maintain every physical detail of the pet exactly — breed, fur color and pattern, markings, eye color, ear shape, and facial features must be identical to the original photo.",
  },
  {
    value: "anime-ghibli",
    label: "Studio Ghibli",
    emoji: "🌸",
    description: "Anime style in a magical scene",
    prompt:
      "Create a beautiful Studio Ghibli-style anime illustration of this exact pet in a magical, lush natural scene with soft dappled sunlight filtering through trees, floating particles of light, and rich green foliage. The art style should capture Ghibli's signature warmth, detail, and sense of wonder. The pet should be drawn in anime style but remain clearly and unmistakably recognizable as this specific pet — same breed, fur color, markings, and all distinctive features must be faithfully preserved.",
  },
] as const;

// API endpoints
export const API_ENDPOINTS = {
  upload: "/api/upload",
  transform: "/api/transform",
} as const;

// Gemini API configuration
export const GEMINI_CONFIG = {
  model: "gemini-2.5-flash-image",
  fallbackModel: "gemini-2.0-flash",
  apiBaseUrl: "https://generativelanguage.googleapis.com/v1beta",
} as const;

// Pet identity analysis prompt
export const PET_ANALYSIS_PROMPT = `You are an expert pet photographer and animal identification specialist. Analyze this pet photo with extreme precision for identity preservation in AI art generation.

Describe in exactly 3-4 dense sentences:
1. Species, exact breed (or mix), size, and build
2. Coat: color(s), pattern, length, texture, and any unique markings (spots, patches, stripes, gradients)
3. Face: eye color, nose color/shape, ear shape/position/size, muzzle shape, facial markings or expressions
4. Any distinguishing features: scars, accessories (collar color/type, tags), unusual markings, tail type, or features that make this pet unique

Be photographically precise — this description will be used to ensure AI-generated art looks exactly like this specific pet. Every detail matters.`;
