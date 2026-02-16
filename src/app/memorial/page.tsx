import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import MemorialUploader from "@/components/MemorialUploader";
import UsageBanner from "@/components/UsageBanner";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Pet Memorial - Bleau",
  description:
    "Create a beautiful AI-generated memorial portrait to honor your beloved pet. A tribute they deserve.",
};

export default function MemorialPage() {
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
              href="/detect"
              className="text-sm text-gray-400 transition-colors hover:text-black"
            >
              is it AI?
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
            Pet Memorial
          </p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-black">
            A tribute they deserve
          </h1>
          <p className="mx-auto max-w-xl text-lg text-gray-400">
            Upload a photo of your beloved companion and we&apos;ll create a
            beautiful memorial portrait — preserving every detail that made
            them who they were.
          </p>
        </div>

        <UsageBanner />
        <MemorialUploader />
      </div>
      <Footer />
    </main>
  );
}
