// Pricing and usage configuration for Bleau
// Free tier: 3 generations per day (no sign-up)
// Pro: $9.99/mo unlimited OR $2.99 per 10 credits pack

export const PRICING = {
  free: {
    dailyLimit: 3,
    label: "Free",
    description: "3 portraits per day",
  },
  pro: {
    monthlyPrice: 999, // cents
    label: "Pro",
    description: "Unlimited portraits",
    features: [
      "Unlimited portrait generations",
      "All styles unlocked",
      "HD downloads (2x resolution)",
      "Priority generation speed",
      "No watermark",
      "Commercial usage rights",
    ],
  },
  credits: {
    packSize: 10,
    packPrice: 299, // cents
    label: "Credit Pack",
    description: "10 portraits for $2.99",
  },
} as const;

// Usage tracking via localStorage (anonymous, no auth needed initially)
const STORAGE_KEY = "bleau_usage";

interface UsageData {
  date: string; // YYYY-MM-DD
  count: number;
  isPro: boolean;
  credits: number;
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getUsage(): UsageData {
  if (typeof window === "undefined") {
    return { date: getToday(), count: 0, isPro: false, credits: 0 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: getToday(), count: 0, isPro: false, credits: 0 };
    const data: UsageData = JSON.parse(raw);
    // Reset daily count if new day
    if (data.date !== getToday()) {
      data.date = getToday();
      data.count = 0;
      saveUsage(data);
    }
    return data;
  } catch {
    return { date: getToday(), count: 0, isPro: false, credits: 0 };
  }
}

function saveUsage(data: UsageData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function canGenerate(): { allowed: boolean; remaining: number; reason?: string } {
  const usage = getUsage();
  
  if (usage.isPro) {
    return { allowed: true, remaining: Infinity };
  }
  
  if (usage.credits > 0) {
    return { allowed: true, remaining: usage.credits };
  }
  
  const remaining = PRICING.free.dailyLimit - usage.count;
  if (remaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      reason: "You've used all 3 free portraits today. Upgrade to Pro for unlimited, or grab a credit pack.",
    };
  }
  
  return { allowed: true, remaining };
}

export function recordGeneration(): void {
  const usage = getUsage();
  
  if (usage.isPro) return; // Pro users don't consume anything
  
  if (usage.credits > 0) {
    usage.credits -= 1;
  } else {
    usage.count += 1;
  }
  
  saveUsage(usage);
}

export function getRemainingInfo(): { text: string; urgent: boolean } {
  const { remaining } = canGenerate();
  const usage = getUsage();
  
  if (usage.isPro) return { text: "Pro — unlimited", urgent: false };
  if (usage.credits > 0) return { text: `${usage.credits} credits remaining`, urgent: usage.credits <= 2 };
  if (remaining === Infinity) return { text: "Unlimited", urgent: false };
  if (remaining <= 0) return { text: "No free portraits left today", urgent: true };
  if (remaining === 1) return { text: "1 free portrait left today", urgent: true };
  return { text: `${remaining} free portraits left today`, urgent: false };
}

export function setPro(isPro: boolean): void {
  const usage = getUsage();
  usage.isPro = isPro;
  saveUsage(usage);
}

export function addCredits(amount: number): void {
  const usage = getUsage();
  usage.credits += amount;
  saveUsage(usage);
}
