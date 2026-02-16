// Multi-Pet Portrait Style Options
// Premium feature — requires Pro or credits

export const MULTI_PET_STYLE_OPTIONS = [
  {
    value: "family-portrait",
    label: "Family Portrait",
    emoji: "👨‍👩‍👧‍👦",
    description: "Classic family photo style",
    prompt:
      "Create a professional family portrait photograph featuring all the pets together. They should be posed naturally side by side or arranged in a group, with soft studio lighting and a clean neutral background. Each pet must be accurately depicted with their exact features, coloring, and proportions.",
  },
  {
    value: "adventure-squad",
    label: "Adventure Squad",
    emoji: "🏔️",
    description: "Epic outdoor adventure together",
    prompt:
      "Create an epic adventure scene with all the pets together on a dramatic mountain trail at golden hour. They look like a team of explorers — confident, adventurous, bonded. Cinematic lighting, sweeping landscape. Each pet must be accurately depicted with their exact features, coloring, and proportions.",
  },
  {
    value: "royal-court",
    label: "Royal Court",
    emoji: "🏰",
    description: "Renaissance painting of the whole court",
    prompt:
      "Create a grand renaissance-style oil painting of all the pets as members of a royal court. Each wears era-appropriate finery — robes, crowns, jewels. Dark classical background with dramatic chiaroscuro lighting. Each pet must be painted with photographic accuracy to their real appearance.",
  },
  {
    value: "pixar-gang",
    label: "Pixar Gang",
    emoji: "🎬",
    description: "Animated movie poster",
    prompt:
      "Create a Pixar/Disney movie poster featuring all the pets as animated characters. Big expressive eyes, warm lighting, dynamic composition like they're the stars of their own film. Include a movie-poster-style layout. Each pet must be unmistakably recognizable with their real features translated into 3D animation style.",
  },
  {
    value: "cozy-nap",
    label: "Cozy Nap Pile",
    emoji: "😴",
    description: "All curled up together sleeping",
    prompt:
      "Create a heartwarming scene of all the pets snuggled together in a cozy nap pile on a plush blanket by a fireplace. Warm amber lighting, peaceful expressions, genuine warmth between them. Each pet must be accurately depicted with their exact features, coloring, and proportions.",
  },
  {
    value: "superhero-team",
    label: "Superhero Team",
    emoji: "🦸‍♂️",
    description: "The ultimate pet superhero squad",
    prompt:
      "Create an epic superhero team poster with all the pets as superheroes. Each wears a unique custom suit with flowing capes, standing on a rooftop with dramatic city skyline and sunset. Dynamic poses showing their powers. Each pet must be accurately depicted with their exact features translated into heroic form.",
  },
] as const;

export const MULTI_PET_ANALYSIS_PROMPT = `You are an expert pet photographer. Analyze this group of pet photos. For EACH pet visible, provide a detailed description in this format:

PET 1:
- Species, breed, size
- Coat: colors, pattern, length, markings
- Face: eye color, nose, ears, expression
- Distinguishing features

PET 2:
(same format)

Continue for each pet. Be photographically precise — these descriptions will be used to ensure AI-generated art accurately depicts each specific pet.`;
