import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import TogetherUploader from "@/components/TogetherUploader";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Pet & Owner Portrait - Bleau",
  description:
    "Upload photos of you and your pet, and AI will create a stunning portrait of you together in any style.",
};

export default function TogetherPage() {
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
            Together Portrait
          </p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-black">
            You &amp; your pet, together
          </h1>
          <p className="mx-auto max-w-xl text-lg text-gray-400">
            Upload a photo of yourself and one of your pet. AI will create a
            stunning portrait of you both — keeping every detail that makes
            you, you.
          </p>
        </div>

        <TogetherUploader />
      </div>
      <Footer />
    </main>
  );
}
