// Memorial portrait styles — more emotional and tribute-focused
export const MEMORIAL_STYLE_OPTIONS = [
  {
    value: "rainbow-bridge",
    label: "Rainbow Bridge",
    emoji: "🌈",
    description: "Crossing the rainbow bridge",
    prompt:
      "Create a deeply beautiful and emotionally moving portrait of this exact pet walking peacefully across the Rainbow Bridge — a luminous, ethereal bridge made of soft rainbow light arcing through a golden-lit sky with gentle clouds. The pet looks healthy, happy, and at peace, glancing back with a loving expression. Warm golden light, soft lens flare, heavenly atmosphere. This is a tribute portrait — it should evoke love, peace, and gentle comfort. Photorealistic quality.",
  },
  {
    value: "angel-wings",
    label: "Angel Wings",
    emoji: "👼",
    description: "Your pet as an angel",
    prompt:
      "Create a stunning portrait of this exact pet with beautiful, luminous angel wings made of soft white feathers, surrounded by a gentle golden halo of light. The pet is sitting peacefully in a heavenly garden with soft flowers and warm ethereal lighting. The mood should be peaceful, loving, and comforting — a tribute to a beloved companion. The wings should look natural and majestic. Photorealistic quality with a dreamy, soft-focus background.",
  },
  {
    value: "starlight",
    label: "Among the Stars",
    emoji: "⭐",
    description: "Resting among the stars",
    prompt:
      "Create a breathtaking portrait of this exact pet peacefully resting among the stars in a beautiful cosmic scene. The pet is curled up on a soft cloud-like nebula, surrounded by gently glowing stars, with a deep blue and purple galaxy sky. Bioluminescent particles of light drift around them. The mood is serene, eternal, and beautiful — suggesting the pet is at peace in the cosmos, watching over their family. Photorealistic pet with artistic cosmic background.",
  },
  {
    value: "garden-of-memories",
    label: "Garden of Memories",
    emoji: "🌸",
    description: "In a peaceful eternal garden",
    prompt:
      "Create a serene, emotionally beautiful portrait of this exact pet sitting peacefully in an idyllic garden paradise — lush green grass, blooming flowers of every color, a gentle stream, butterflies, warm golden afternoon sunlight filtering through ancient trees. The pet looks healthy, content, and at peace. The garden should feel like paradise — eternal spring, impossibly beautiful. Photorealistic quality with warm, comforting tones.",
  },
  {
    value: "watercolor-memory",
    label: "Watercolor Memory",
    emoji: "🎨",
    description: "A soft watercolor tribute",
    prompt:
      "Create a deeply moving watercolor painting tribute of this exact pet. Soft, flowing brushstrokes with gentle color washes. The pet is portrayed beautifully with loving attention to detail. Incorporate subtle elements of light — gentle rays, floating particles of golden light — suggesting the pet's spirit and presence. The painting should feel like a treasured memory preserved in art. Warm, soft color palette with slight golden undertones.",
  },
  {
    value: "forever-young",
    label: "Forever Young",
    emoji: "💛",
    description: "Happy and full of life",
    prompt:
      "Create a joyful, vibrant, life-affirming portrait of this exact pet at their happiest — running through a beautiful sunlit field with pure joy, ears flying, tongue out, eyes bright and full of life. Golden hour lighting, vivid colors, a sense of boundless energy and happiness. This portrait celebrates the pet's life and spirit at its most alive. It should make the viewer smile through tears. Photorealistic quality, National Geographic caliber.",
  },
] as const;

export const MEMORIAL_PET_ANALYSIS_PROMPT = `You are creating a memorial tribute portrait for someone who has lost their beloved pet. Analyze this pet photo with extreme care and sensitivity. Every detail matters deeply to the owner.

Describe in 3-4 precise sentences:
1. Species, exact breed (or mix), size, and build — be very specific
2. Coat: every color, pattern, marking, length, and texture detail
3. Face: eye color, nose, ears, expression, any unique facial features
4. Distinguishing features: anything that makes this pet uniquely them — collar, markings, scars, the way they hold their ears, their expression

This description will be used to recreate their beloved pet in a memorial portrait. Accuracy is paramount — this pet was someone's family. Get every detail right.`;
