import type { Metadata } from "next";
import { Inter, Inter_Tight, Geist_Mono } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";
import { Databuddy } from "@databuddy/sdk/react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const interDisplay = Inter_Tight({
  variable: "--font-inter-display",
  subsets: ["latin"],
});

const siteUrl = "https://capy.anants.studio";

export const metadata: Metadata = {
  title: {
    default: "Capy",
    template: "%s | Capy",
  },
  description:
    "Capy helps you turn any repo into a design system with a polished preview page. Instantly generate component catalogs, style guides, and live previews from your codebase.",
  keywords: [
    "capy",
    "AI code editor",
    "code editor",
    "AI coding",
    "MCP",
    "developer tools",
    "precision coding",
    "AI-powered editor",
  ],
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Capy",
    title: "Capy — Design System Generator",
    description:
      "Capy helps you turn any repo into a design system with a polished preview page. Instantly generate component catalogs, style guides, and live previews.",
    images: [
      {
        url: `${siteUrl}/capy.svg`,
        width: 1200,
        height: 630,
        alt: "Capy Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Capy — Design System Generator",
    description:
      "Capy helps you turn any repo into a design system with a polished preview page. Instantly generate component catalogs, style guides, and live previews.",
    site: "@anant_hq",
    creator: "@anant_hq",
    images: [`${siteUrl}/capy.svg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
    <html
      lang="en"
      className={`${inter.variable} ${interDisplay.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          src="https://cdn.databuddy.cc/databuddy.js"
          data-client-id="8ad3841f-8f63-4fea-96c4-fde9ee8c223c"
          crossOrigin="anonymous"
          async
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Capy",
              description:
                "Capy helps you turn any repo into a design system with a polished preview page. Instantly generate component catalogs, style guides, and live previews.",
              url: siteUrl,
              applicationCategory: "DeveloperApplication",
              operatingSystem: "macOS",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              author: {
                "@type": "Person",
                name: "Anant",
                url: "https://anants.studio",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SmoothScroll />
        {children}
        <Databuddy clientId="8ad3841f-8f63-4fea-96c4-fde9ee8c223c" />
      </body>
    </html>
  );
}
