import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white">
      <Image
        src="/logo.png"
        alt="Bleau"
        width={200}
        height={80}
        priority
      />
      <Link
        href="/how-i-work"
        className="mt-8 text-sm font-medium text-black/50 transition-colors hover:text-black"
      >
        how i work
      </Link>
    </main>
  );
}
