"use client";

import { useState, useCallback } from "react";
import { Share2, Check, Link } from "lucide-react";

interface ShareButtonProps {
  imageUrl: string;
  title?: string;
  text?: string;
  className?: string;
  variant?: "overlay" | "inline";
}

export default function ShareButton({
  imageUrl,
  title = "Check out my AI portrait from Bleau",
  text = "Made with bleau.ai — free AI portraits",
  className = "",
  variant = "overlay",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    // Try Web Share API first (mobile-friendly)
    if (navigator.share) {
      try {
        // If it's a data URL, convert to blob for sharing
        if (imageUrl.startsWith("data:")) {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const file = new File([blob], "bleau-portrait.png", {
            type: "image/png",
          });

          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({
              title,
              text,
              files: [file],
            });
            return;
          }
        }

        // Fallback: share URL only
        await navigator.share({
          title,
          text,
          url: "https://bleau.ai",
        });
        return;
      } catch (err) {
        // User cancelled or share failed — fall through to clipboard
        if ((err as Error)?.name === "AbortError") return;
      }
    }

    // Fallback: copy link to clipboard
    try {
      await navigator.clipboard.writeText("https://bleau.ai");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Last resort
    }
  }, [imageUrl, title, text]);

  if (variant === "overlay") {
    return (
      <button
        onClick={handleShare}
        className={`inline-flex items-center gap-1.5 rounded-xl bg-white/80 px-3 py-2 text-xs font-medium text-black backdrop-blur-sm transition-all hover:bg-white ${className}`}
      >
        {copied ? (
          <>
            <Check className="h-3 w-3" />
            Copied!
          </>
        ) : (
          <>
            <Share2 className="h-3 w-3" />
            Share
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center gap-1 text-xs font-medium text-black transition-colors hover:text-gray-600 ${className}`}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          Link copied!
        </>
      ) : (
        <>
          <Share2 className="h-3.5 w-3.5" />
          Share
        </>
      )}
    </button>
  );
}
