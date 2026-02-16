import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <Image
        src="/logo.png"
        alt="Bleau"
        width={120}
        height={48}
        className="mb-8"
      />
      <span className="mb-4 text-6xl">🐾</span>
      <h1 className="mb-2 text-2xl font-bold text-black">
        Lost in the park
      </h1>
      <p className="mb-8 text-sm text-gray-400">
        This page doesn&apos;t exist. Let&apos;s get you back on the trail.
      </p>
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800"
        >
          Go home
        </Link>
        <Link
          href="/transform"
          className="rounded-2xl border border-gray-200 px-6 py-3 text-sm font-semibold text-black transition-all hover:border-gray-400"
        >
          Try Pet Portraits
        </Link>
      </div>
    </main>
  );
}
