import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Docs — Global MCP Config",
  description:
    "Add Capy to any IDE or agent with one config change. Setup guides for Cursor, Claude Code, VS Code, Windsurf, Zed, and more.",
  alternates: {
    canonical: "/docs",
  },
  openGraph: {
    title: "Docs — Global MCP Config | Capy",
    description:
      "Add Capy to any IDE or agent with one config change. Setup guides for Cursor, Claude Code, VS Code, Windsurf, Zed, and more.",
    url: "/docs",
  },
  twitter: {
    title: "Docs — Global MCP Config | Capy",
    description:
      "Add Capy to any IDE or agent with one config change. Setup guides for Cursor, Claude Code, VS Code, Windsurf, Zed, and more.",
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
