"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, X } from "lucide-react";
import { getRemainingInfo, canGenerate } from "@/lib/pricing";

export default function UsageBanner() {
  const [info, setInfo] = useState<{ text: string; urgent: boolean } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setInfo(getRemainingInfo());
  }, []);

  if (!info || dismissed) return null;

  const { allowed } = canGenerate();

  // Don't show if user has plenty left and isn't urgent
  if (!info.urgent && allowed) return null;

  return (
    <div
      className={`mx-auto mb-6 flex max-w-5xl items-center justify-between rounded-2xl px-4 py-3 ${
        info.urgent
          ? "border border-amber-200 bg-amber-50"
          : "border border-gray-100 bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-sm">
          {info.urgent ? "⚡" : "✨"}
        </span>
        <p className={`text-sm ${info.urgent ? "text-amber-800" : "text-gray-600"}`}>
          {info.text}
          {info.urgent && !allowed && (
            <>
              {" "}
              <Link
                href="/pricing"
                className="font-semibold underline decoration-amber-400 underline-offset-2 hover:text-amber-900"
              >
                Upgrade for unlimited
              </Link>
            </>
          )}
          {info.urgent && allowed && (
            <>
              {" · "}
              <Link
                href="/pricing"
                className="font-medium underline decoration-gray-300 underline-offset-2 hover:text-black"
              >
                Get more
              </Link>
            </>
          )}
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-gray-400 hover:text-gray-600"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
