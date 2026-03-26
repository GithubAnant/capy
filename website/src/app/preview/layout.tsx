import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preview — Design System",
  description:
    "Capy design system preview. Explore colors, typography, icons, and UI components used across the Capy website.",
  alternates: {
    canonical: "/preview",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
