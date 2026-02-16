import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ALL_BREEDS, getBreedBySlug } from "@/lib/breeds";
import { STYLE_OPTIONS } from "@/lib/constants";
import Footer from "@/components/Footer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ALL_BREEDS.map((breed) => ({ slug: breed.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const breed = getBreedBySlug(slug);
  if (!breed) return {};

  const title = `AI ${breed.name} Portraits — Free ${breed.name} Art | Bleau`;
  const description = `Create stunning AI portraits of your ${breed.name}. Upload a photo and transform your ${breed.type === "dog" ? "pup" : "kitty"} into beautiful art — 8 styles, identity-preserving, free to try.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://bleau.ai/breeds/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function BreedPage({ params }: PageProps) {
  const { slug } = await params;
  const breed = getBreedBySlug(slug);
  if (!breed) notFound();

  const recommendedStyles = breed.popularStyles
    .map((sv) => STYLE_OPTIONS.find((s) => s.value === sv))
    .filter(Boolean);

  const petType = breed.type === "dog" ? "dog" : "cat";
  const petTypePlural = breed.type === "dog" ? "dogs" : "cats";

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
              href="/breeds"
              className="text-sm text-gray-400 transition-colors hover:text-black"
            >
              all breeds
            </Link>
            <Link
              href="/transform"
              className="text-sm text-gray-400 transition-colors hover:text-black"
            >
              create portrait
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

      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Breadcrumbs */}
        <nav className="mb-8 text-sm text-gray-400">
          <Link href="/" className="hover:text-black">
            Home
          </Link>
          {" / "}
          <Link href="/breeds" className="hover:text-black">
            Breeds
          </Link>
          {" / "}
          <span className="text-black">{breed.name}</span>
        </nav>

        {/* Hero */}
        <div className="mb-12">
          <span className="mb-4 block text-5xl">{breed.emoji}</span>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-black">
            AI {breed.name} Portraits
          </h1>
          <p className="max-w-xl text-lg text-gray-400">{breed.description}</p>
        </div>

        {/* CTA */}
        <div className="mb-16 rounded-3xl border border-gray-100 bg-gray-50/50 p-8 text-center">
          <h2 className="mb-3 text-xl font-bold text-black">
            Create your {breed.name}&apos;s portrait now
          </h2>
          <p className="mb-6 text-sm text-gray-400">
            Upload a photo of your {breed.name} and choose from 8 stunning
            styles. Free — no sign-up required.
          </p>
          <Link
            href="/transform"
            className="inline-flex items-center gap-2 rounded-2xl bg-black px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-gray-800 hover:shadow-lg"
          >
            Upload Your {breed.name}&apos;s Photo →
          </Link>
        </div>

        {/* Breed Traits */}
        <div className="mb-12">
          <h2 className="mb-4 text-2xl font-bold text-black">
            What makes {breed.name} portraits special
          </h2>
          <p className="mb-6 text-gray-500">
            Our AI is trained to recognize and preserve the distinctive features
            that make every {breed.name} unique:
          </p>
          <div className="grid grid-cols-2 gap-3">
            {breed.traits.map((trait) => (
              <div
                key={trait}
                className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3"
              >
                <span className="text-sm">✓</span>
                <span className="text-sm font-medium capitalize text-gray-700">
                  {trait}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Styles */}
        <div className="mb-12">
          <h2 className="mb-4 text-2xl font-bold text-black">
            Best styles for {breed.name} {petTypePlural}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {recommendedStyles.map(
              (style) =>
                style && (
                  <Link
                    key={style.value}
                    href="/transform"
                    className="group rounded-2xl border border-gray-100 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-md"
                  >
                    <span className="mb-2 block text-2xl">{style.emoji}</span>
                    <h3 className="mb-1 font-semibold text-black group-hover:text-gray-700">
                      {style.label}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {style.description}
                    </p>
                  </Link>
                )
            )}
          </div>
        </div>

        {/* FAQ / SEO Content */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-black">
            {breed.name} Portrait FAQ
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 font-semibold text-black">
                How does AI create {breed.name} portraits?
              </h3>
              <p className="text-sm text-gray-500">
                Our AI first analyzes your {breed.name}&apos;s unique features —{" "}
                {breed.traits.slice(0, 2).join(", ")}, and more. Then it
                generates a portrait in your chosen style while preserving every
                detail that makes your {petType} recognizable. The result is a
                stunning, one-of-a-kind artwork.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-black">
                What kind of photo works best for {breed.name}{" "}
                {petTypePlural}?
              </h3>
              <p className="text-sm text-gray-500">
                Clear, well-lit photos where your {breed.name}&apos;s face is
                visible work best. Natural light is ideal. The AI needs to see
                your {petType}&apos;s{" "}
                {breed.traits.slice(0, 2).join(" and ")} clearly. Avoid blurry
                photos or ones where the {petType} is too far away.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-black">
                Is it free to create {breed.name} portraits?
              </h3>
              <p className="text-sm text-gray-500">
                Yes! You get 3 free portraits per day. For unlimited HD
                portraits with no watermark, check out our{" "}
                <Link
                  href="/pricing"
                  className="font-medium text-black underline"
                >
                  Pro plan
                </Link>
                .
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-black">
                Can I print my {breed.name} portrait?
              </h3>
              <p className="text-sm text-gray-500">
                Absolutely! Pro portraits are generated at high resolution,
                perfect for printing on canvas, mugs, phone cases, and more.
                Many {breed.name} owners frame their AI portraits — they make
                amazing gifts too.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <Link
            href="/transform"
            className="inline-flex items-center gap-2 rounded-2xl bg-black px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-gray-800 hover:shadow-lg"
          >
            Create Your {breed.name} Portrait — Free →
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
