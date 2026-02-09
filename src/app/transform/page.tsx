import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import ImageUploader from "@/components/ImageUploader";

export const metadata: Metadata = {
  title: "Image Transformer - Bleau",
  description: "Upload an image and transform it into different artistic styles using AI.",
};

export default function TransformPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo.png" alt="Bleau" width={100} height={40} />
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/how-i-work"
              className="text-sm text-gray-500 hover:text-black transition-colors"
            >
              how i work
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-black mb-4">
            Image Transformer
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Upload an image and transform it into different artistic styles using AI.
          </p>
        </div>

        <ImageUploader />
      </div>
    </main>
  );
}
