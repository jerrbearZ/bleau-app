import Link from "next/link";
import Image from "next/image";

export default function HowIWork() {
  return (
    <main className="min-h-screen bg-white px-6 py-12 md:px-16">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <Link href="/" className="inline-block mb-12">
          <Image src="/logo.png" alt="Bleau" width={120} height={48} />
        </Link>

        {/* Title */}
        <h1 className="text-3xl font-bold text-black mb-4">
          How I Work
        </h1>

        <p className="text-lg text-black/70 mb-12">
          A behind-the-scenes look at how bleau.ai is built, deployed, and connected to AI.
        </p>

        {/* Part Links */}
        <div className="space-y-6">
          <Link
            href="/how-i-work/publishing-a-website"
            className="block border border-gray-200 rounded-xl p-8 hover:border-gray-400 transition-colors group"
          >
            <p className="text-sm font-medium text-black/40 uppercase tracking-wide mb-2">
              Part 1
            </p>
            <h2 className="text-2xl font-bold text-black mb-3 group-hover:text-blue-600 transition-colors">
              Publishing a Website
            </h2>
            <p className="text-black/70">
              How code on a computer becomes a live website — from Next.js to GitHub to Vercel to bleau.ai.
            </p>
          </Link>

          <Link
            href="/how-i-work/connecting-to-gemini"
            className="block border border-gray-200 rounded-xl p-8 hover:border-gray-400 transition-colors group"
          >
            <p className="text-sm font-medium text-black/40 uppercase tracking-wide mb-2">
              Part 2
            </p>
            <h2 className="text-2xl font-bold text-black mb-3 group-hover:text-blue-600 transition-colors">
              Connecting to Gemini
            </h2>
            <p className="text-black/70">
              How the image transformer works — uploading to Vercel Blob, analyzing with Gemini, and generating AI art.
            </p>
          </Link>
        </div>

        {/* Back Link */}
        <div className="pt-8 mt-12 border-t border-gray-200">
          <Link
            href="/"
            className="text-black/50 hover:text-black transition-colors"
          >
            &larr; Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
