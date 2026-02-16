import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Bleau - Your AI Concierge",
  description:
    "AI-powered tools: pet portraits, pet & owner portraits, pet memorials, and AI content detection. Beautiful, fast, and free.",
};

function ToolCard({
  href,
  emoji,
  title,
  description,
  tag,
}: {
  href: string;
  emoji: string;
  title: string;
  description: string;
  tag?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col items-center rounded-3xl border border-gray-100 bg-white p-8 text-center transition-all duration-200 hover:border-gray-300 hover:shadow-lg"
    >
      {tag && (
        <span className="absolute -top-2.5 right-4 rounded-full bg-black px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          {tag}
        </span>
      )}
      <span className="mb-4 text-4xl">{emoji}</span>
      <h2 className="mb-2 text-lg font-bold text-black group-hover:text-gray-700">
        {title}
      </h2>
      <p className="text-sm leading-relaxed text-gray-400">{description}</p>
    </Link>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="flex flex-col items-center px-6 pb-16 pt-20">
        <span className="absolute top-4 right-6 text-xs text-black/20">
          v1.2
        </span>

        <Image
          src="/logo.png"
          alt="Bleau"
          width={160}
          height={64}
          priority
          className="mb-6"
        />

        <h1 className="mb-4 max-w-lg text-center text-4xl font-bold tracking-tight text-black sm:text-5xl">
          AI tools that just work
        </h1>
        <p className="mb-12 max-w-md text-center text-lg text-gray-400">
          Beautiful, fast, and free. No sign-up required.
        </p>

        {/* Tool Cards */}
        <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
          <ToolCard
            href="/transform"
            emoji="🐾"
            title="Pet Portraits"
            description="Upload your pet's photo and transform it into stunning portraits in 8 different styles."
          />
          <ToolCard
            href="/together"
            emoji="🧑‍🤝‍🧑"
            title="Together Portrait"
            description="Upload photos of you and your pet. AI creates a portrait of you both in the same scene."
            tag="New"
          />
          <ToolCard
            href="/memorial"
            emoji="🕊️"
            title="Pet Memorial"
            description="Create a beautiful tribute portrait to honor a beloved companion who's crossed the rainbow bridge."
            tag="New"
          />
          <ToolCard
            href="/multi-pet"
            emoji="🐾🐾"
            title="Multi-Pet Portrait"
            description="Got multiple pets? Upload each one and get a stunning group portrait of the whole crew."
            tag="New"
          />
          <ToolCard
            href="/stocks"
            emoji="📈"
            title="AI Stock Screener"
            description="Real-time quotes, sector analysis, and AI-generated bull/bear cases for any ticker."
            tag="New"
          />
          <ToolCard
            href="/detect"
            emoji="🔍"
            title="Is It AI?"
            description="Paste any URL or text and find out if it was made by a human or a machine."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-gray-50 bg-gray-50/50 px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-8 text-2xl font-bold text-black">
            How it works
          </h2>
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-center">
            <div className="flex flex-col items-center">
              <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                1
              </span>
              <p className="text-sm font-medium text-black">Upload</p>
              <p className="mt-1 text-xs text-gray-400">
                Drop your photo or paste a URL
              </p>
            </div>
            <div className="hidden h-px w-12 bg-gray-200 sm:block" />
            <div className="flex flex-col items-center">
              <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                2
              </span>
              <p className="text-sm font-medium text-black">Choose</p>
              <p className="mt-1 text-xs text-gray-400">
                Pick a style or analysis type
              </p>
            </div>
            <div className="hidden h-px w-12 bg-gray-200 sm:block" />
            <div className="flex flex-col items-center">
              <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                3
              </span>
              <p className="text-sm font-medium text-black">Done</p>
              <p className="mt-1 text-xs text-gray-400">
                Download or share your result
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center">
        <p className="mb-6 text-sm font-medium uppercase tracking-widest text-gray-300">
          Powered by Google Gemini
        </p>
        <div className="flex items-center gap-6">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 hover:shadow-lg"
          >
            View Pricing →
          </Link>
          <Link
            href="/how-i-work"
            className="text-sm font-medium text-black/40 transition-colors hover:text-black"
          >
            How it works
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
