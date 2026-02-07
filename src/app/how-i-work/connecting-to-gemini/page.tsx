import Link from "next/link";
import Image from "next/image";

export default function ConnectingToGemini() {
  return (
    <main className="min-h-screen bg-white px-6 py-12 md:px-16">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <Link href="/" className="inline-block mb-12">
          <Image src="/logo.png" alt="Bleau" width={120} height={48} />
        </Link>

        {/* Title */}
        <p className="text-sm font-medium text-black/40 uppercase tracking-wide mb-2">
          Part 2
        </p>
        <h1 className="text-3xl font-bold text-black mb-8">
          Connecting to Gemini
        </h1>

        {/* Intro */}
        <p className="text-lg text-black/70 mb-8">
          This page explains how the image transformer works — how an uploaded photo gets turned into AI-generated art using Google&apos;s Gemini API.
        </p>

        {/* Pipeline Diagram */}
        <div className="bg-gray-50 rounded-xl p-6 mb-12 font-mono text-sm overflow-x-auto">
          <pre className="text-black/70">
{`[Upload Image] → [Vercel Blob] → [Gemini Analyze] → [Gemini Generate] → [AI Art]
   Browser         Storage          Describe image      Create new image     Result`}
          </pre>
        </div>

        {/* The Three Services */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6">The Three Services</h2>
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-black mb-2">Vercel Blob</h3>
              <p className="text-black/70">
                Cloud storage for uploaded images. When you drop an image onto bleau.ai, it gets sent to Vercel Blob and stored with a public URL. This URL is what we send to Gemini.
              </p>
            </div>
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-black mb-2">Gemini 2.0 Flash (Analysis)</h3>
              <p className="text-black/70">
                Google&apos;s fast vision model. It looks at the uploaded image and writes a detailed description — subjects, colors, composition, lighting — everything an artist would need to recreate it.
              </p>
            </div>
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-black mb-2">Gemini 2.5 Flash (Image Generation)</h3>
              <p className="text-black/70">
                Google&apos;s image generation model. It takes the description plus your chosen style (e.g. &quot;Studio Ghibli&quot;) and generates a brand new image in that style.
              </p>
            </div>
          </div>
        </section>

        {/* Step by Step */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6">Step by Step</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 pr-4 font-semibold text-black">Step</th>
                  <th className="py-3 pr-4 font-semibold text-black">What Happens</th>
                  <th className="py-3 font-semibold text-black">Where</th>
                </tr>
              </thead>
              <tbody className="text-black/70">
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4">1</td>
                  <td className="py-3 pr-4">User drops an image onto the page</td>
                  <td className="py-3">Browser (ImageUploader component)</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4">2</td>
                  <td className="py-3 pr-4">Image uploads to Vercel Blob storage</td>
                  <td className="py-3">API route: /api/upload</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4">3</td>
                  <td className="py-3 pr-4">User picks a style and clicks Transform</td>
                  <td className="py-3">Browser</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4">4</td>
                  <td className="py-3 pr-4">Server fetches image, encodes it as base64</td>
                  <td className="py-3">API route: /api/transform</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4">5</td>
                  <td className="py-3 pr-4">Gemini 2.0 Flash analyzes the image</td>
                  <td className="py-3">Google Gemini API</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 pr-4">6</td>
                  <td className="py-3 pr-4">Gemini 2.5 Flash generates new art from description + style</td>
                  <td className="py-3">Google Gemini API</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">7</td>
                  <td className="py-3 pr-4">Generated image sent back and displayed</td>
                  <td className="py-3">Browser</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Architecture Diagram */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6">How It All Connects</h2>
          <div className="bg-gray-50 rounded-xl p-6 font-mono text-sm overflow-x-auto">
            <pre className="text-black/70">
{`┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                  │
│                                                                  │
│  ImageUploader component                                        │
│  1. Drag & drop image                                           │
│  2. XHR upload with progress bar                                │
│  3. Select style → click Transform                              │
└─────────────────────────────────────────────────────────────────┘
          │ POST /api/upload              │ POST /api/transform
          ▼                               ▼
┌──────────────────────────┐  ┌────────────────────────────────────┐
│      /api/upload         │  │         /api/transform             │
│                          │  │                                    │
│  Validates file          │  │  1. Fetches image from Blob URL   │
│  Uploads to Vercel Blob  │  │  2. Encodes as base64             │
│  Returns public URL      │  │  3. Sends to Gemini for analysis  │
└──────────────────────────┘  │  4. Sends to Gemini for generation│
          │                   │  5. Returns generated image        │
          ▼                   └────────────────────────────────────┘
┌──────────────────────────┐            │           │
│     VERCEL BLOB          │            ▼           ▼
│                          │  ┌──────────────┐ ┌─────────────────┐
│  Stores uploaded images  │  │ Gemini 2.0   │ │ Gemini 2.5      │
│  with public URLs        │  │ Flash        │ │ Flash           │
│                          │  │              │ │                 │
│  blob.vercel-storage.com │  │ "Describe    │ │ "Generate this  │
│                          │  │  this image" │ │  in Ghibli      │
└──────────────────────────┘  │              │ │  style"         │
                              └──────────────┘ └─────────────────┘`}
            </pre>
          </div>
        </section>

        {/* File Structure for Transform */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6">Files That Make It Work</h2>
          <div className="bg-gray-50 rounded-xl p-6 font-mono text-sm overflow-x-auto">
            <pre className="text-black/70">
{`src/
├── app/
│   ├── transform/
│   │   └── page.tsx            ← The transform page UI
│   └── api/
│       ├── upload/
│       │   └── route.ts        ← Handles file → Vercel Blob
│       └── transform/
│           └── route.ts        ← Handles Blob → Gemini → AI art
│
├── components/
│   └── ImageUploader.tsx       ← Drag & drop, progress bar, display
│
├── lib/
│   ├── constants.ts            ← API endpoints, Gemini config, styles
│   └── validations.ts          ← File size/type checks, URL validation
│
└── types/
    └── index.ts                ← TypeScript types for state & API`}
            </pre>
          </div>
        </section>

        {/* The Two API Calls to Gemini */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6">The Two Gemini API Calls</h2>

          <div className="space-y-6">
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-black mb-2">Call 1: Analyze the Image</h3>
              <p className="text-black/70 mb-3">
                We send the uploaded image to Gemini 2.0 Flash and ask it to describe the image in detail — like telling an artist what to paint.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-black/70">
{`POST /models/gemini-2.0-flash:generateContent

{
  "contents": [{
    "parts": [
      { "inlineData": { "mimeType": "image/jpeg", "data": "<base64>" } },
      { "text": "Describe this image in detail for an artist..." }
    ]
  }]
}`}
                </pre>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-black mb-2">Call 2: Generate New Art</h3>
              <p className="text-black/70 mb-3">
                We take the description from Call 1, combine it with the user&apos;s chosen style, and send it to Gemini 2.5 Flash to generate a new image.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-black/70">
{`POST /models/gemini-2.5-flash-image:generateContent

{
  "contents": [{
    "parts": [{
      "text": "Create an image in Studio Ghibli style: <description>"
    }]
  }],
  "generationConfig": {
    "responseModalities": ["TEXT", "IMAGE"]
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Why Two Steps */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6">Why Two Steps?</h2>
          <p className="text-black/70 mb-4">
            The image generation model can&apos;t directly &quot;see&quot; an uploaded image and restyle it. Instead, we use a two-step approach:
          </p>
          <ol className="list-decimal list-inside text-black/70 mb-6 space-y-2">
            <li><strong>Analyze</strong> — A vision model describes what&apos;s in the image</li>
            <li><strong>Generate</strong> — An image model creates something new from that description + your chosen style</li>
          </ol>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <p className="text-blue-900 font-medium">
              This is like showing a photo to one artist and having them describe it to another artist who paints in a completely different style.
            </p>
          </div>
        </section>

        {/* Navigation */}
        <div className="pt-8 border-t border-gray-200 flex items-center justify-between">
          <Link
            href="/how-i-work/publishing-a-website"
            className="text-black/50 hover:text-black transition-colors"
          >
            &larr; Part 1: Publishing a Website
          </Link>
          <Link
            href="/how-i-work"
            className="text-black/50 hover:text-black transition-colors"
          >
            How I Work &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
