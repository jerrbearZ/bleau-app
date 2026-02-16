import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import URLAnalyzer from "@/components/URLAnalyzer";

export const metadata: Metadata = {
  title: "Is It AI? - Bleau",
  description:
    "Paste any URL and find out if the content was created by AI. Analyzes images for visual artifacts and text for AI writing patterns.",
};

export default function DetectPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/">
            <Image src="/logo.png" alt="Bleau" width={100} height={40} />
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/transform"
              className="text-sm text-gray-400 transition-colors hover:text-black"
            >
              pet portraits
            </Link>
            <Link
              href="/how-i-work"
              className="text-sm text-gray-400 transition-colors hover:text-black"
            >
              how i work
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-gray-400">
            AI Content Detector
          </p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-black">
            Is it AI?
          </h1>
          <p className="mx-auto max-w-xl text-lg text-gray-400">
            Paste a link to any image or article and we&apos;ll tell you
            whether it was made by a human or a machine.
          </p>
        </div>

        <URLAnalyzer />
      </div>
    </main>
  );
}
