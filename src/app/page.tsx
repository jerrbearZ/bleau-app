import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bleau - Your AI Concierge",
  description:
    "AI-powered tools: transform your pet photos into stunning portraits, detect AI-generated content, and more.",
};

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-white">
      <span className="absolute top-4 right-4 text-xs text-black/25">
        v1.0 — 2026-02-15
      </span>

      <div className="mb-10 flex items-center gap-8">
        <Link
          href="/transform"
          className="group text-center transition-all hover:scale-105"
        >
          <span className="mb-1 block text-2xl">🐾</span>
          <span className="text-sm font-medium text-black/40 transition-colors group-hover:text-black">
            pet portraits
          </span>
        </Link>
        <Link
          href="/detect"
          className="group text-center transition-all hover:scale-105"
        >
          <span className="mb-1 block text-2xl">🔍</span>
          <span className="text-sm font-medium text-black/40 transition-colors group-hover:text-black">
            is it AI?
          </span>
        </Link>
      </div>

      <Image src="/logo.png" alt="Bleau" width={200} height={80} priority />

      <Link
        href="/how-i-work"
        className="mt-10 text-sm font-medium text-black/30 transition-colors hover:text-black"
      >
        how i work
      </Link>
    </main>
  );
}
