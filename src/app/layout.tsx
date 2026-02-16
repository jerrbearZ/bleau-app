import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Bleau - Your AI Concierge",
  description:
    "AI-powered tools: pet portraits, pet & owner portraits, pet memorials, and AI content detection. Beautiful, fast, and free.",
  metadataBase: new URL("https://bleau.ai"),
  openGraph: {
    title: "Bleau - Your AI Concierge",
    description:
      "AI-powered pet portraits, memorial tributes, and content detection. Beautiful, fast, and free.",
    url: "https://bleau.ai",
    siteName: "Bleau",
    images: [
      {
        url: "/logo.png",
        width: 400,
        height: 160,
        alt: "Bleau",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bleau - Your AI Concierge",
    description:
      "AI-powered pet portraits, memorial tributes, and content detection.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
