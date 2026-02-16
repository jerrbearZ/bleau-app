"use client";

import { useState } from "react";
import { Check, Sparkles, Zap } from "lucide-react";
import { PRICING } from "@/lib/pricing";

export default function PricingCards() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (plan: "pro" | "credits") => {
    setLoading(plan);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Checkout unavailable — coming soon!");
      }
    } catch {
      alert("Checkout coming soon! We're setting up payments.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Free */}
      <div className="rounded-3xl border border-gray-100 bg-white p-8">
        <p className="mb-1 text-sm font-medium uppercase tracking-widest text-gray-400">
          Free
        </p>
        <div className="mb-1 flex items-baseline gap-1">
          <span className="text-4xl font-bold text-black">$0</span>
        </div>
        <p className="mb-6 text-sm text-gray-400">
          {PRICING.free.description}
        </p>
        <ul className="mb-8 space-y-3">
          <li className="flex items-center gap-2 text-sm text-gray-600">
            <Check className="h-4 w-4 text-gray-400" />3 portraits per day
          </li>
          <li className="flex items-center gap-2 text-sm text-gray-600">
            <Check className="h-4 w-4 text-gray-400" />
            All portrait types
          </li>
          <li className="flex items-center gap-2 text-sm text-gray-600">
            <Check className="h-4 w-4 text-gray-400" />
            Standard resolution
          </li>
          <li className="flex items-center gap-2 text-sm text-gray-600">
            <Check className="h-4 w-4 text-gray-400" />
            Personal use
          </li>
        </ul>
        <p className="text-center text-sm font-medium text-gray-400">
          Current plan
        </p>
      </div>

      {/* Pro — Highlighted */}
      <div className="relative rounded-3xl border-2 border-black bg-black p-8 text-white shadow-2xl">
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black">
          Most Popular
        </span>
        <p className="mb-1 text-sm font-medium uppercase tracking-widest text-white/50">
          Pro
        </p>
        <div className="mb-1 flex items-baseline gap-1">
          <span className="text-4xl font-bold text-white">$9.99</span>
          <span className="text-sm text-white/50">/month</span>
        </div>
        <p className="mb-6 text-sm text-white/50">
          {PRICING.pro.description}
        </p>
        <ul className="mb-8 space-y-3">
          {PRICING.pro.features.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2 text-sm text-white/80"
            >
              <Check className="h-4 w-4 text-white/60" />
              {feature}
            </li>
          ))}
        </ul>
        <button
          onClick={() => handleCheckout("pro")}
          disabled={loading !== null}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-black transition-all hover:bg-gray-100 disabled:opacity-50"
        >
          {loading === "pro" ? (
            "Redirecting..."
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Upgrade to Pro
            </>
          )}
        </button>
      </div>

      {/* Credits */}
      <div className="rounded-3xl border border-gray-100 bg-white p-8">
        <p className="mb-1 text-sm font-medium uppercase tracking-widest text-gray-400">
          Credit Pack
        </p>
        <div className="mb-1 flex items-baseline gap-1">
          <span className="text-4xl font-bold text-black">$2.99</span>
        </div>
        <p className="mb-6 text-sm text-gray-400">
          {PRICING.credits.description}
        </p>
        <ul className="mb-8 space-y-3">
          <li className="flex items-center gap-2 text-sm text-gray-600">
            <Check className="h-4 w-4 text-gray-400" />
            10 portrait credits
          </li>
          <li className="flex items-center gap-2 text-sm text-gray-600">
            <Check className="h-4 w-4 text-gray-400" />
            Never expire
          </li>
          <li className="flex items-center gap-2 text-sm text-gray-600">
            <Check className="h-4 w-4 text-gray-400" />
            All portrait types
          </li>
          <li className="flex items-center gap-2 text-sm text-gray-600">
            <Check className="h-4 w-4 text-gray-400" />
            Standard resolution
          </li>
        </ul>
        <button
          onClick={() => handleCheckout("credits")}
          disabled={loading !== null}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-black bg-white px-6 py-3.5 text-sm font-semibold text-black transition-all hover:bg-gray-50 disabled:opacity-50"
        >
          {loading === "credits" ? (
            "Redirecting..."
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Buy Credits
            </>
          )}
        </button>
      </div>
    </div>
  );
}
