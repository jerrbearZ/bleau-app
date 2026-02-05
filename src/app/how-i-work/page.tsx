import Link from "next/link";
import Image from "next/image";

export default function HowIWork() {
  return (
    <main className="min-h-screen bg-white px-6 py-12 md:px-16">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <Link href="/" className="inline-block mb-12">
          <Image src="/logo.png" alt="Bleau" width={120} height={48} />
        </Link>

        {/* Title */}
        <h1 className="text-3xl font-bold text-black mb-8">
          How Bleau Works: A Technical Overview
        </h1>

        {/* Intro */}
        <p className="text-lg text-black/70 mb-8">
          This page explains the architecture behind bleau.ai — how code on a computer becomes a live website.
        </p>

        {/* Pipeline Diagram */}
        <div className="bg-gray-50 rounded-xl p-6 mb-12 font-mono text-sm overflow-x-auto">
          <pre className="text-black/70">
{`[Your Computer] → [GitHub] → [Vercel] → [bleau.ai]
     Code           Repo       Hosting     Live Site`}
          </pre>
        </div>

        {/* The Journey */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6">The Journey (Step by Step)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 pr-4 font-semibold text-black">Step</th>
                  <th className="py-3 pr-4 font-semibold text-black">What We Did</th>
                  <th className="py-3 font-semibold text-black">Why</th>
                </tr>
              </thead>
              <tbody className="text-black/70">
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4">1</td>
                  <td className="py-3 pr-4">Created Next.js project</td>
                  <td className="py-3">Modern framework that builds fast websites</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4">2</td>
                  <td className="py-3 pr-4">Added Tailwind CSS</td>
                  <td className="py-3">Makes styling easy with utility classes</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4">3</td>
                  <td className="py-3 pr-4">Built landing page</td>
                  <td className="py-3">Simple page with centered logo</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4">4</td>
                  <td className="py-3 pr-4">Initialized Git</td>
                  <td className="py-3">Version control - tracks all code changes</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4">5</td>
                  <td className="py-3 pr-4">Created GitHub repo</td>
                  <td className="py-3">Cloud storage for your code</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4">6</td>
                  <td className="py-3 pr-4">Connected to Vercel</td>
                  <td className="py-3">Hosting platform that auto-deploys from GitHub</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4">7</td>
                  <td className="py-3 pr-4">Added custom domain</td>
                  <td className="py-3">Connected bleau.ai via DNS records</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">8</td>
                  <td className="py-3 pr-4">SSL certificate</td>
                  <td className="py-3">Vercel auto-generated HTTPS security</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* File Structure */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6">File Structure Explained</h2>
          <div className="bg-gray-50 rounded-xl p-6 font-mono text-sm overflow-x-auto">
            <pre className="text-black/70">
{`bleau-app/
├── public/                 ← Static files (served as-is)
│   └── logo.png            ← Bleau logo image
│
├── src/                    ← Source code lives here
│   └── app/                ← Next.js "App Router" folder
│       ├── layout.tsx      ← Root layout (wraps ALL pages)
│       ├── page.tsx        ← Homepage (what visitors see at "/")
│       ├── globals.css     ← Global styles (applies everywhere)
│       └── how-i-work/     ← This page you're reading
│           └── page.tsx
│
├── package.json            ← Project config + dependencies list
├── package-lock.json       ← Exact versions of dependencies
├── tsconfig.json           ← TypeScript configuration
├── next.config.ts          ← Next.js configuration
└── .git/                   ← Git repository data (hidden folder)`}
            </pre>
          </div>
        </section>

        {/* Each File's Purpose */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6">Each File&apos;s Purpose</h2>

          <div className="space-y-6">
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-black mb-2">public/logo.png</h3>
              <p className="text-black/70 mb-3">
                Your logo image. Anything in &quot;public/&quot; is accessible directly via URL.
              </p>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                Example: bleau.ai/logo.png
              </code>
            </div>

            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-black mb-2">src/app/layout.tsx</h3>
              <p className="text-black/70 mb-3">
                This wraps EVERY page on your site. Think of it as the &quot;frame&quot; around your content.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-black/70">
{`export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>  {/* pages inserted here */}
    </html>
  );
}`}
                </pre>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-black mb-2">src/app/page.tsx</h3>
              <p className="text-black/70 mb-3">
                This is your homepage - what shows at the root URL &quot;/&quot;.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-black/70">
{`export default function Home() {
  return (
    <main>
      <Image src="/logo.png" ... />  {/* centered logo */}
    </main>
  );
}`}
                </pre>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-black mb-2">src/app/globals.css</h3>
              <p className="text-black/70 mb-3">
                Styles that apply to the entire site.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-black/70">
{`@import "tailwindcss";  /* Loads Tailwind's utility classes */

body {
  background: white;
}`}
                </pre>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-black mb-2">package.json</h3>
              <p className="text-black/70 mb-3">
                Defines what packages your project needs and how to run it.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-black/70">
{`{
  "dependencies": {
    "next": "...",        // The framework
    "react": "...",       // UI library
    "tailwindcss": "..."  // Styling
  },
  "scripts": {
    "dev": "next dev",    // Run locally
    "build": "next build" // Build for production
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* How It All Connects */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6">How It All Connects</h2>
          <div className="bg-gray-50 rounded-xl p-6 font-mono text-sm overflow-x-auto">
            <pre className="text-black/70">
{`┌─────────────────────────────────────────────────────────────────┐
│                        YOUR COMPUTER                             │
│                                                                  │
│  src/app/page.tsx  ──→  "npm run dev"  ──→  localhost:3000      │
│       (code)            (builds site)       (local preview)      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ git push
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          GITHUB                                  │
│                                                                  │
│  github.com/jerrbearZ/bleau-app                                 │
│  (stores your code in the cloud)                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ auto-detects changes
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          VERCEL                                  │
│                                                                  │
│  1. Pulls code from GitHub                                      │
│  2. Runs "npm run build"                                        │
│  3. Deploys to their servers                                    │
│  4. Issues SSL certificate                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ DNS points here
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BLEAU.AI                                 │
│                                                                  │
│  Visitors type bleau.ai → DNS finds Vercel → Vercel serves site │
└─────────────────────────────────────────────────────────────────┘`}
            </pre>
          </div>
        </section>

        {/* The Magic */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6">The Magic: Auto-Deploy</h2>
          <p className="text-black/70 mb-4">
            Now whenever you:
          </p>
          <ol className="list-decimal list-inside text-black/70 mb-4 space-y-1">
            <li>Edit code locally</li>
            <li>Run <code className="bg-gray-100 px-2 py-1 rounded text-sm">git add . && git commit -m &quot;message&quot; && git push</code></li>
          </ol>
          <p className="text-black/70 mb-4">
            Vercel automatically:
          </p>
          <ul className="list-disc list-inside text-black/70 mb-6 space-y-1">
            <li>Detects the change</li>
            <li>Rebuilds your site</li>
            <li>Deploys the new version</li>
          </ul>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <p className="text-blue-900 font-medium">
              Your live site updates in ~30 seconds!
            </p>
          </div>
        </section>

        {/* Back Link */}
        <div className="pt-8 border-t border-gray-200">
          <Link
            href="/"
            className="text-black/50 hover:text-black transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
