import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ImageUploader from "@/components/ImageUploader";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Pet Portrait Studio - Bleau",
  description:
    "Upload a photo of your pet and watch AI bring them to life in stunning portraits — while preserving every unique detail that makes them yours.",
};

export default function TransformPage() {
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
            Pet Portrait Studio
          </p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-black">
            Bring your pet to life
          </h1>
          <p className="mx-auto max-w-xl text-lg text-gray-400">
            Upload a photo and we&apos;ll create a stunning portrait — keeping
            every marking, every feature, everything that makes them yours.
          </p>
        </div>

        <ImageUploader />
      </div>
      <Footer />
    </main>
  );
}
