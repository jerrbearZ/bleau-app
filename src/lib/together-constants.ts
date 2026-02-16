// Pet + Owner portrait style options
export const TOGETHER_STYLE_OPTIONS = [
  {
    value: "studio-portrait",
    label: "Studio Portrait",
    emoji: "📸",
    description: "Professional photo together",
    prompt:
      "Create a warm, professional studio portrait photograph of this person and their pet together. Soft studio lighting, clean blurred background. The person is holding or sitting beside their pet, both looking happy and connected. Natural, authentic poses.",
  },
  {
    value: "renaissance",
    label: "Renaissance",
    emoji: "🎨",
    description: "Classical oil painting",
    prompt:
      "Create a grand renaissance-style oil painting of this person and their pet together as nobility. Both dressed in period-appropriate royal attire, dramatic chiaroscuro lighting, rich colors, painted with museum-quality detail. Majestic and timeless.",
  },
  {
    value: "pixar-duo",
    label: "Pixar Duo",
    emoji: "✨",
    description: "3D animated movie characters",
    prompt:
      "Create a 3D Pixar/Disney-style animated scene of this person and their pet together as animated characters. Both have big expressive eyes, endearing proportions, warm cinematic lighting. They look like the main characters of a heartwarming animated film.",
  },
  {
    value: "adventure",
    label: "Adventure",
    emoji: "🏔️",
    description: "Epic outdoor adventure",
    prompt:
      "Create an epic adventure photograph of this person and their pet together on a mountain summit at golden hour. Dramatic landscape, wind in their hair/fur, a sense of accomplishment and companionship. National Geographic quality.",
  },
  {
    value: "anime-duo",
    label: "Anime",
    emoji: "🌸",
    description: "Studio Ghibli style",
    prompt:
      "Create a beautiful Studio Ghibli-style anime illustration of this person and their pet together in a magical forest scene with dappled sunlight, floating particles of light, and lush greenery. Warm, whimsical, and full of wonder. Ghibli's signature art style.",
  },
  {
    value: "holiday-card",
    label: "Holiday Card",
    emoji: "🎄",
    description: "Festive greeting card",
    prompt:
      "Create a beautiful holiday greeting card featuring this person and their pet together. Cozy winter scene with snowflakes, warm lighting, matching sweaters or scarves, a festive tree in the background. Heartwarming and ready to send to family.",
  },
] as const;

export const PERSON_ANALYSIS_PROMPT = `Describe this person's physical appearance in precise detail for identity preservation in AI art:
1. Gender, approximate age, ethnicity
2. Hair: color, length, style, texture
3. Face: eye color, facial structure, nose shape, lip shape, eyebrows, any facial hair
4. Build: height estimate, body type
5. Distinguishing features: glasses, freckles, dimples, scars, piercings, tattoos
6. Current outfit (for reference)
Keep to 2-3 sentences. Be photographically precise.`;

export const PET_ANALYSIS_PROMPT_TOGETHER = `Describe this pet's appearance in precise detail for identity preservation in AI art:
1. Species, exact breed (or mix), size
2. Coat: color(s), pattern, length, texture, unique markings
3. Face: eye color, nose color, ear shape, facial markings
4. Distinguishing features: collar, tags, scars, unusual features
Keep to 2-3 sentences. Be photographically precise.`;
