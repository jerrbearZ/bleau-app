import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bleau - Your AI Concierge",
  description: "Transform your images into AI-generated art with Bleau.",
};

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-white">
      <span className="absolute top-4 right-4 text-xs text-black/25">
        v0.8 — 2026-02-07
      </span>
      <Link
        href="/transform"
        className="mb-8 text-sm font-medium text-black/50 transition-colors hover:text-black"
      >
        what i can do
      </Link>
      <Image
        src="/logo.png"
        alt="Bleau"
        width={200}
        height={80}
        priority
      />
      <Link
        href="/how-i-work"
        className="mt-8 text-sm font-medium text-black/50 transition-colors hover:text-black"
      >
        how i work
      </Link>
    </main>
  );
}
