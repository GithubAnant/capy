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

export const metadata: Metadata = {
  title: "capy",
  description: "capy landing page",
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
      </head>
      <body className="min-h-full flex flex-col">
        <SmoothScroll />
        {children}
        <Databuddy clientId="8ad3841f-8f63-4fea-96c4-fde9ee8c223c" />
      </body>
    </html>
  );
}
