import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import MultiPetUploader from "@/components/MultiPetUploader";
import UsageBanner from "@/components/UsageBanner";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Multi-Pet Group Portrait - Bleau",
  description:
    "Upload photos of all your pets and AI will create a stunning group portrait — every pet accurately depicted together in one scene.",
};

export default function MultiPetPage() {
  return (
    <main className="min-h-screen bg-white">
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
              href="/pricing"
              className="text-sm text-gray-400 transition-colors hover:text-black"
            >
              pricing
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-gray-400">
            Multi-Pet Portrait
          </p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-black">
            The whole crew, one portrait
          </h1>
          <p className="mx-auto max-w-xl text-lg text-gray-400">
            Upload photos of each pet individually (2-5 pets). AI will compose
            them into one stunning group portrait, preserving every detail.
          </p>
        </div>

        <UsageBanner />
        <MultiPetUploader />
      </div>
      <Footer />
    </main>
  );
}
