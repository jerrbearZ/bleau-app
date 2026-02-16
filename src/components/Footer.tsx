import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-50 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-8 sm:flex-row sm:justify-between">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link
            href="/transform"
            className="text-xs text-gray-400 transition-colors hover:text-black"
          >
            🐾 Pet Portraits
          </Link>
          <Link
            href="/together"
            className="text-xs text-gray-400 transition-colors hover:text-black"
          >
            🧑‍🤝‍🧑 Together
          </Link>
          <Link
            href="/memorial"
            className="text-xs text-gray-400 transition-colors hover:text-black"
          >
            🕊️ Memorial
          </Link>
          <Link
            href="/detect"
            className="text-xs text-gray-400 transition-colors hover:text-black"
          >
            🔍 Is It AI?
          </Link>
        </div>
        <p className="text-xs text-gray-300">
          &copy; {new Date().getFullYear()} Bleau &middot; Powered by AI
        </p>
      </div>
    </footer>
  );
}
