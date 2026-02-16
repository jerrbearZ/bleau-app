import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import StockDashboard from "@/components/StockDashboard";

export const metadata: Metadata = {
  title: "AI Stock Screener — Free Stock Analysis | Bleau",
  description:
    "AI-powered stock screener with real-time quotes, sector analysis, and AI-generated bull/bear cases. Free for day traders and investors.",
};

export default function StocksPage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-gray-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/">
            <Image src="/logo.png" alt="Bleau" width={100} height={40} />
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/transform" className="text-sm text-gray-400 hover:text-black">
              pet portraits
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
            AI Stock Screener
          </p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-black">
            Smarter stock analysis
          </h1>
          <p className="mx-auto max-w-xl text-lg text-gray-400">
            Real-time quotes, sector heat maps, and AI-generated analysis.
            Type any ticker for an instant bull/bear breakdown.
          </p>
        </div>

        <StockDashboard />
      </div>
      <Footer />
    </main>
  );
}
