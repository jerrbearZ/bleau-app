import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <Image
        src="/logo.png"
        alt="Bleau"
        width={200}
        height={80}
        priority
      />
    </main>
  );
}
