import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { DOG_BREEDS, CAT_BREEDS } from "@/lib/breeds";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "AI Pet Portraits by Breed — Dogs & Cats | Bleau",
  description:
    "Create AI portraits for any breed. Golden Retrievers, Siamese cats, Huskies, Persians, and 35+ more breeds. Upload your pet's photo and get stunning art.",
};

function BreedCard({ slug, name, emoji, description }: { slug: string; name: string; emoji: string; description: string }) {
  return (
    <Link
      href={`/breeds/${slug}`}
      className="group flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:border-gray-300 hover:shadow-md"
    >
      <span className="text-2xl">{emoji}</span>
      <div>
        <h3 className="font-semibold text-black group-hover:text-gray-700">
          {name}
        </h3>
        <p className="mt-0.5 text-xs text-gray-400 line-clamp-2">
          {description}
        </p>
      </div>
    </Link>
  );
}

export default function BreedsPage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-gray-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/">
            <Image src="/logo.png" alt="Bleau" width={100} height={40} />
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/transform" className="text-sm text-gray-400 hover:text-black">
              create portrait
            </Link>
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-black">
              pricing
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-gray-400">
            Browse by Breed
          </p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-black">
            AI portraits for every breed
          </h1>
          <p className="mx-auto max-w-xl text-lg text-gray-400">
            Find your pet&apos;s breed and see the best portrait styles,
            tips, and examples. Every breed has unique features our AI
            preserves.
          </p>
        </div>

        {/* Dogs */}
        <div className="mb-16">
          <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-black">
            🐕 Dog Breeds
            <span className="text-sm font-normal text-gray-400">
              ({DOG_BREEDS.length} breeds)
            </span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DOG_BREEDS.map((breed) => (
              <BreedCard key={breed.slug} {...breed} />
            ))}
          </div>
        </div>

        {/* Cats */}
        <div className="mb-16">
          <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-black">
            🐱 Cat Breeds
            <span className="text-sm font-normal text-gray-400">
              ({CAT_BREEDS.length} breeds)
            </span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CAT_BREEDS.map((breed) => (
              <BreedCard key={breed.slug} {...breed} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-3xl border border-gray-100 bg-gray-50/50 p-8 text-center">
          <h2 className="mb-3 text-xl font-bold text-black">
            Don&apos;t see your breed? No problem.
          </h2>
          <p className="mb-6 text-sm text-gray-400">
            Our AI works with every breed, mix, and species. Just upload a
            photo and it figures out the rest.
          </p>
          <Link
            href="/transform"
            className="inline-flex items-center gap-2 rounded-2xl bg-black px-8 py-3.5 text-sm font-semibold text-white hover:bg-gray-800 hover:shadow-lg"
          >
            Upload Any Pet Photo →
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
