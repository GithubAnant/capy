import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Capy processes your project data locally on your device. No accounts, no login, no data collection. Read our full privacy policy.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy | Capy",
    description:
      "Capy processes your project data locally on your device. No accounts, no login, no data collection.",
    url: "/privacy",
  },
  twitter: {
    title: "Privacy Policy | Capy",
    description:
      "Capy processes your project data locally on your device. No accounts, no login, no data collection.",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
