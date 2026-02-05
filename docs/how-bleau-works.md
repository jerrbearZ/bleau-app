# How Bleau Works: A Technical Overview

This document explains the architecture behind bleau.ai — how code on a computer becomes a live website.

## What We Accomplished

```
[Your Computer] → [GitHub] → [Vercel] → [bleau.ai]
     Code           Repo       Hosting     Live Site
```

We built a **deployment pipeline** - a system where code on your computer automatically becomes a live website.

---

## The Journey (Step by Step)

| Step | What We Did | Why |
|------|-------------|-----|
| 1 | Created Next.js project | Modern framework that builds fast websites |
| 2 | Added Tailwind CSS | Makes styling easy with utility classes |
| 3 | Built landing page | Simple page with your centered logo |
| 4 | Initialized Git | Version control - tracks all code changes |
| 5 | Created GitHub repo | Cloud storage for your code |
| 6 | Connected to Vercel | Hosting platform that auto-deploys from GitHub |
| 7 | Added custom domain | Connected bleau.ai via DNS records |
| 8 | SSL certificate | Vercel auto-generated HTTPS security |

---

## File Structure Explained

```
bleau-app/
├── public/                 ← Static files (served as-is)
│   └── logo.png            ← Your Bleau logo image
│
├── src/                    ← Source code lives here
│   └── app/                ← Next.js "App Router" folder
│       ├── layout.tsx      ← Root layout (wraps ALL pages)
│       ├── page.tsx        ← Homepage (what visitors see at "/")
│       ├── globals.css     ← Global styles (applies everywhere)
│       └── how-i-work/     ← The "how i work" page
│           └── page.tsx
│
├── package.json            ← Project config + dependencies list
├── package-lock.json       ← Exact versions of dependencies
├── tsconfig.json           ← TypeScript configuration
├── next.config.ts          ← Next.js configuration
├── tailwind.config.ts      ← Tailwind CSS configuration
└── .git/                   ← Git repository data (hidden folder)
```

---

## Each File's Purpose

### `public/logo.png`
Your logo image. Anything in "public/" is accessible directly via URL.
Example: bleau.ai/logo.png

### `src/app/layout.tsx`
```tsx
// This wraps EVERY page on your site
// Think of it as the "frame" around your content

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>  {/* ← pages get inserted here */}
    </html>
  );
}
```
**Purpose:** Sets up the HTML structure, fonts, and metadata that apply to ALL pages.

### `src/app/page.tsx`
```tsx
// This is your homepage - what shows at "/"

export default function Home() {
  return (
    <main>
      <Image src="/logo.png" ... />  {/* ← Your centered logo */}
    </main>
  );
}
```
**Purpose:** The actual content visitors see when they go to bleau.ai.

### `src/app/globals.css`
```css
/* Styles that apply to the entire site */
@import "tailwindcss";  /* ← Loads Tailwind's utility classes */

body {
  background: white;
}
```
**Purpose:** Global styling rules.

### `package.json`
```json
{
  "name": "bleau-app",
  "dependencies": {
    "next": "...",        // The framework
    "react": "...",       // UI library
    "tailwindcss": "...", // Styling
    "lucide-react": "..." // Icons (for later)
  },
  "scripts": {
    "dev": "next dev",    // Run locally
    "build": "next build" // Build for production
  }
}
```
**Purpose:** Defines what packages your project needs and how to run it.

---

## How It All Connects

```
┌─────────────────────────────────────────────────────────────────┐
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
└─────────────────────────────────────────────────────────────────┘
```

---

## The Magic: Auto-Deploy

Now whenever you:
1. Edit code locally
2. Run `git add . && git commit -m "message" && git push`

Vercel automatically:
- Detects the change
- Rebuilds your site
- Deploys the new version

**Your live site updates in ~30 seconds!**
