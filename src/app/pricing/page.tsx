import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import PricingCards from "@/components/PricingCards";

export const metadata: Metadata = {
  title: "Pricing - Bleau",
  description:
    "Get unlimited AI pet portraits with Bleau Pro, or grab a credit pack. Start free with 3 portraits per day.",
};

export default function PricingPage() {
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
              href="/together"
              className="text-sm text-gray-400 transition-colors hover:text-black"
            >
              together
            </Link>
            <Link
              href="/detect"
              className="text-sm text-gray-400 transition-colors hover:text-black"
            >
              is it AI?
            </Link>
          </nav>
        </div>
      </header>

      {/* Pricing Content */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-gray-400">
            Pricing
          </p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-black">
            Create without limits
          </h1>
          <p className="mx-auto max-w-xl text-lg text-gray-400">
            Start free with 3 portraits per day. Upgrade when you fall in love
            with what AI can do for your pet.
          </p>
        </div>

        <PricingCards />

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="mb-8 text-center text-2xl font-bold text-black">
            Questions
          </h2>
          <div className="mx-auto max-w-2xl space-y-6">
            <div>
              <h3 className="mb-2 font-semibold text-black">
                What counts as a portrait?
              </h3>
              <p className="text-sm text-gray-500">
                Each generation counts as one portrait — whether it&apos;s a pet
                portrait, together portrait, or memorial. Regenerating a portrait
                with the same photo also counts.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-black">
                Do credits expire?
              </h3>
              <p className="text-sm text-gray-500">
                No. Credits never expire. Use them whenever you want.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-black">
                Can I use portraits commercially?
              </h3>
              <p className="text-sm text-gray-500">
                Free tier portraits are for personal use. Pro subscribers get
                full commercial usage rights — print them, sell them, use them
                for your business.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-black">
                What&apos;s HD resolution?
              </h3>
              <p className="text-sm text-gray-500">
                Free portraits are generated at standard resolution. Pro
                portraits are 2x resolution — perfect for printing on canvas,
                mugs, or phone cases.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-black">
                Can I cancel anytime?
              </h3>
              <p className="text-sm text-gray-500">
                Yes. Cancel your Pro subscription anytime — no questions asked.
                You keep access until the end of your billing period.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
