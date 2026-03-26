"use client";

import Image from "next/image";
import { useState } from "react";
import { ClientPicker } from "@/components/ClientPicker";
import { CopyButton } from "@/components/CopyButton";
import { PricingFreeCard } from "@/components/PricingFreeCard";
import { PricingWhyFreeCard } from "@/components/PricingWhyFreeCard";
import FAQSection from "@/components/sections/FAQSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import HeroPreview from "@/components/sections/HeroPreview";
import HeroSection from "@/components/sections/HeroSection";
import SetupSection from "@/components/sections/SetupSection";
import { clients } from "@/lib/clients";

type SnapshotToken = {
  name: string;
  value: string;
  category: string;
  file: string;
  line: number;
};

type SnapshotComponent = {
  name: string;
  path: string;
};

export type PreviewSnapshot = {
  artifact?: {
    generatedAt?: string;
    artifactPath?: string;
  };
  repo?: {
    framework?: string;
    routingStyle?: string;
    previewRoute?: string;
    previewEntryFile?: string;
  };
  scan?: {
    discoveredFamilies?: string[];
  };
  tokens?: {
    cssVariables?: SnapshotToken[];
  };
  components?: {
    count?: number;
    items?: SnapshotComponent[];
  };
};

const sections = [
  { id: "foundations", label: "Foundations" },
  { id: "typography", label: "Typography" },
  { id: "icons", label: "Icons" },
  { id: "inputs-actions", label: "Inputs + Actions" },
  { id: "components", label: "Components" },
  { id: "page-sections", label: "Page Sections" },
] as const;

const palette = [
  { name: "Background", variable: "--background", hex: "#070A10", note: "Base page canvas" },
  { name: "Foreground", variable: "--foreground", hex: "#F0F0F3", note: "Primary text and accents" },
  { name: "Muted", variable: "--muted", hex: "#858585", note: "Secondary copy and labels" },
  { name: "Panel", variable: "--panel", hex: "#101620", note: "Raised surfaces from global tokens" },
  { name: "Card Surface", variable: "component", hex: "#171615", note: "Primary section card fill" },
  { name: "Warm Mono", variable: "component", hex: "#E8E0D6", note: "Code and utility highlights" },
] as const;

const typeSamples = [
  {
    label: "Display",
    className: "font-display text-[2.4rem] leading-[0.95] md:text-[3.4rem]",
    meta: "Inter Tight, variable --font-display",
    sample: "Capy keeps the UI exact.",
  },
  {
    label: "Body",
    className: "text-[1rem] leading-[1.7]",
    meta: "Inter, variable --font-sans",
    sample: "Dark editorial UI with quiet contrast, muted copy, and compact controls.",
  },
  {
    label: "Mono",
    className: "font-mono text-[0.92rem] leading-[1.7]",
    meta: "Geist Mono, variable --font-mono",
    sample: "npx -y capy-mcp@latest",
  },
] as const;

const actionButtons = [
  {
    label: "Primary",
    className:
      "rounded-sm bg-[#F0F0F3] px-3.5 py-1.5 text-[0.82rem] font-medium text-black transition-all duration-300 hover:bg-[#d4d4d4]",
  },
  {
    label: "Secondary",
    className:
      "rounded-sm px-3.5 py-1.5 text-[0.82rem] font-medium text-[#F0F0F3] transition-all duration-300 hover:bg-[#3a3a3a]",
  },
  {
    label: "Subtle",
    className:
      "rounded-lg bg-white/8 px-3.5 py-2 text-[0.8rem] font-medium text-[#858585] transition-all hover:bg-white/12 hover:text-[#F0F0F3]",
  },
] as const;

function SectionHeading({
  id,
  eyebrow,
  title,
  description,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div id={id} className="scroll-mt-24">
      <p className="text-[0.72rem] uppercase tracking-[0.24em] text-[#858585]">{eyebrow}</p>
      <div className="mt-4 flex items-center gap-4">
        <h2 className="font-display text-[1.75rem] leading-none text-[#F0F0F3] md:text-[2.15rem]">
          {title}
        </h2>
        <div className="h-px flex-1 bg-white/10" />
      </div>
      <p className="mt-3 max-w-2xl text-[0.92rem] leading-[1.65] text-[#858585]">{description}</p>
    </div>
  );
}

function Surface({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-3xl border border-white/8 bg-black/50 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] md:p-8 ${className}`}>
      {children}
    </div>
  );
}

function ColorSwatch({
  name,
  variable,
  hex,
  note,
}: {
  name: string;
  variable: string;
  hex: string;
  note: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(hex);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      }}
      className="cursor-pointer rounded-[1.15rem] bg-white/3 p-3 text-left transition-transform duration-200 hover:-translate-y-0.5"
    >
      <div
        className="h-20 rounded-[0.9rem] border border-white/10"
        style={{ backgroundColor: hex }}
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.88rem] font-medium text-[#F0F0F3]">{name}</p>
          <p className="mt-1 font-mono text-[0.72rem] text-[#858585]">{variable}</p>
        </div>
        <span className="font-mono text-[0.72rem] text-[#F0F0F3]">{copied ? "COPIED" : hex}</span>
      </div>
      <p className="mt-2 text-[0.8rem] leading-normal text-[#858585]">{note}</p>
    </button>
  );
}

export default function PreviewClient({
  snapshot,
}: {
  snapshot: PreviewSnapshot | null;
}) {
  const [selectedClient, setSelectedClient] = useState<typeof clients[number]>(clients[0]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#111111] text-[var(--foreground)]">

      <header className="sticky top-0 z-30 bg-[#111111]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div>
            <p className="text-[0.72rem] uppercase tracking-[0.24em] text-[var(--muted)]">Capy Preview</p>
            <h1 className="mt-2 font-display text-[1.35rem] leading-none text-[var(--foreground)] md:text-[1.7rem]">
              Clean system surface for the current site
            </h1>
          </div>
          <nav className="hidden flex-wrap justify-end gap-5 lg:flex">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="text-[0.88rem] text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
              >
                {section.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-24 px-4 pb-28 pt-10 md:px-6 md:pt-14">
        <Surface className="overflow-hidden">
          <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-end">
            <div>
              <p className="text-[0.75rem] uppercase tracking-[0.22em] text-[#858585]">Route /preview</p>
              <h2 className="mt-4 max-w-3xl font-display text-[2.3rem] leading-[0.95] md:text-[3.8rem]">
                The site’s actual UI, reorganized as a readable inspection document.
              </h2>
              <p className="mt-4 max-w-2xl text-[0.96rem] leading-[1.7] text-[#858585]">
                This page uses the Capy MCP preview brief plus the generated design-system artifact, then renders the
                repo&apos;s real tokens, assets, and components in a cleaner sequence than the landing page.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.25rem] bg-white/4 p-4">
                <p className="font-mono text-[0.72rem] text-[#858585]">Framework</p>
                <p className="mt-2 text-[1rem] text-[#F0F0F3]">{snapshot?.repo?.framework ?? "next-app-router"}</p>
              </div>
              <div className="rounded-[1.25rem] bg-white/4 p-4">
                <p className="font-mono text-[0.72rem] text-[#858585]">Components</p>
                <p className="mt-2 text-[1rem] text-[#F0F0F3]">{snapshot?.components?.count ?? 0}</p>
              </div>
              <div className="rounded-[1.25rem] bg-white/4 p-4">
                <p className="font-mono text-[0.72rem] text-[#858585]">Artifact</p>
                <p className="mt-2 break-all text-[0.92rem] text-[#F0F0F3]">
                  {snapshot?.artifact?.artifactPath ?? ".capy/design-system.json"}
                </p>
              </div>
              <div className="rounded-[1.25rem] bg-white/4 p-4">
                <p className="font-mono text-[0.72rem] text-[#858585]">Generated</p>
                <p className="mt-2 text-[0.92rem] text-[#F0F0F3]">
                  {snapshot?.artifact?.generatedAt
                    ? new Date(snapshot.artifact.generatedAt).toLocaleString()
                    : "Unavailable"}
                </p>
              </div>
            </div>
          </div>
        </Surface>

        <section className="flex flex-col gap-8" style={{ marginTop: "14rem" }}>
          <SectionHeading
            id="mcp-output"
            eyebrow="Capy MCP"
            title="Generated output driving this page"
            description="This is the MCP snapshot available in the repo after running Capy. The preview reads from the design-system artifact at render time and uses the brief’s route contract."
          />
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <Surface>
              <p className="font-mono text-[0.74rem] text-[#858585]">Discovered families</p>
              <div className="mt-4 space-y-3">
                {(snapshot?.scan?.discoveredFamilies ?? []).map((family) => (
                  <div key={family} className="rounded-xl bg-white/3 px-4 py-3 text-[0.9rem] leading-[1.6] text-[#F0F0F3]">
                    {family}
                  </div>
                ))}
              </div>
            </Surface>
            <Surface>
              <p className="font-mono text-[0.74rem] text-[#858585]">Key MCP fields</p>
              <div className="mt-4 space-y-3 font-mono text-[0.78rem] text-[#E8E0D6]">
                <div className="rounded-xl bg-[#171615] px-4 py-3">
                  previewRoute: {snapshot?.repo?.previewRoute ?? "/preview"}
                </div>
                <div className="rounded-xl bg-[#171615] px-4 py-3">
                  previewEntryFile: {snapshot?.repo?.previewEntryFile ?? "src/app/preview/page.tsx"}
                </div>
                <div className="rounded-xl bg-[#171615] px-4 py-3">
                  routingStyle: {snapshot?.repo?.routingStyle ?? "app-router"}
                </div>
                <div className="rounded-xl bg-[#171615] px-4 py-3">
                  cssVariables: {snapshot?.tokens?.cssVariables?.length ?? 0}
                </div>
              </div>
            </Surface>
          </div>
        </section>

        <section className="flex flex-col gap-8" style={{ marginTop: "14rem" }}>
          <SectionHeading
            id="foundations"
            eyebrow="Foundations"
            title="Color system"
            description="The landing page is mostly raw hex values over a dark base. This section makes that palette explicit and copyable without inventing new tokens."
          />
          <Surface>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {palette.map((color) => (
                <ColorSwatch key={color.hex} {...color} />
              ))}
            </div>
          </Surface>
        </section>

        <section className="flex flex-col gap-8" style={{ marginTop: "14rem" }}>
          <SectionHeading
            id="typography"
            eyebrow="Typography"
            title="Font roles and scale"
            description="The site uses one tight display face, one neutral body face, and a restrained mono utility layer. Showing them side by side makes the hierarchy clearer than the live homepage."
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {typeSamples.map((sample) => (
              <Surface key={sample.label}>
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[#858585]">{sample.label}</p>
                <p className={`mt-5 ${sample.className}`}>{sample.sample}</p>
                <p className="mt-5 text-[0.84rem] text-[#858585]">{sample.meta}</p>
              </Surface>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-8" style={{ marginTop: "14rem" }}>
          <SectionHeading
            id="icons"
            eyebrow="Assets"
            title="Client and brand icons"
            description="Capy requested a dedicated icon section when icons can be discovered. These are the actual public assets and client logos already used in docs and setup flows."
          />
          <Surface>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              <div className="rounded-[1.2rem] bg-white/3 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/4">
                  <Image src="/capy.svg" alt="Capy" width={28} height={28} />
                </div>
                <p className="mt-4 text-[0.88rem] text-[#F0F0F3]">Capy mark</p>
                <p className="mt-1 font-mono text-[0.72rem] text-[#858585]">/public/capy.svg</p>
              </div>
              {clients.map((client) => (
                <div key={client.name} className="rounded-[1.2rem] bg-white/[
                0.03] p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/4">
                    <Image
                      src={client.icon}
                      alt={client.name}
                      width={28}
                      height={28}
                      className={client.iconClass ?? "h-7 w-7"}
                    />
                  </div>
                  <p className="mt-4 text-[0.88rem] text-[#F0F0F3]">{client.name}</p>
                  <p className="mt-1 font-mono text-[0.72rem] text-[#858585]">{client.category}</p>
                </div>
              ))}
            </div>
          </Surface>
        </section>

        <section className="flex flex-col gap-8" style={{ marginTop: "14rem" }}>
          <SectionHeading
            id="inputs-actions"
            eyebrow="Primitives"
            title="Inputs and actions"
            description="The repo has very few standalone primitives, so this section focuses on the ones that actually exist: the client picker, the copy affordance, and the current button treatments."
          />
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Surface>
              <p className="font-mono text-[0.74rem] text-[#858585]">ClientPicker</p>
              <div className="mt-5 flex items-start">
                <ClientPicker selected={selectedClient} onSelect={setSelectedClient} />
              </div>
              <p className="mt-4 text-[0.84rem] leading-[1.6] text-[#858585]">
                Shared between setup flows and docs, with agent and IDE grouping built into the dropdown.
              </p>
            </Surface>
            <Surface>
              <p className="font-mono text-[0.74rem] text-[#858585]">Buttons + Copy</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {actionButtons.map((button) => (
                  <button key={button.label} type="button" className={button.className}>
                    {button.label}
                  </button>
                ))}
                <div className="rounded-lg bg-[#171615] p-2">
                  <CopyButton text="npx -y capy-mcp@latest" />
                </div>
              </div>
              <div className="mt-6 rounded-[1.1rem] bg-[#171615] px-4 py-3">
                <p className="font-mono text-[0.75rem] text-[#E8E0D6]">codex mcp add capy -- npx -y capy-mcp@latest</p>
              </div>
            </Surface>
          </div>
        </section>

        <section className="flex flex-col gap-8" style={{ marginTop: "14rem" }}>
          <SectionHeading
            id="components"
            eyebrow="Components"
            title="Reusable cards"
            description="These are the most self-contained presentational components in the repo, so they work well as an at-a-glance specimen row."
          />
          <div className="overflow-x-auto pb-2">
            <div className="flex min-w-max gap-6">
              <div className="w-85 shrink-0">
                <PricingFreeCard />
              </div>
              <div className="w-95 shrink-0">
                <PricingWhyFreeCard />
              </div>
              <Surface className="w-75 shrink-0 bg-[#0E121A]">
                <p className="font-mono text-[0.72rem] text-[#858585]">MCP inventory</p>
                <p className="mt-4 font-display text-[1.7rem] leading-[1.05] text-[#F0F0F3]">
                  {snapshot?.components?.count ?? 0} components surfaced
                </p>
                <div className="mt-5 space-y-2 text-[0.84rem] text-[#858585]">
                  {(snapshot?.components?.items ?? []).slice(0, 6).map((component) => (
                    <div key={component.path} className="rounded-lg bg-white/4 px-3 py-2">
                      {component.name}
                    </div>
                  ))}
                </div>
              </Surface>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-8" style={{ marginTop: "14rem" }}>
          <SectionHeading
            id="page-sections"
            eyebrow="Live Sections"
            title="Real route content"
            description="These are the actual exported sections from the landing page, placed in a calmer reading order so you can inspect behavior and composition without the full homepage chrome."
          />
          <div className="space-y-10">
            <Surface>
              <HeroSection />
            </Surface>
            <Surface className="overflow-hidden p-0">
              <HeroPreview />
            </Surface>
            <Surface>
              <FeaturesSection />
            </Surface>
            <Surface>
              <SetupSection />
            </Surface>
            <Surface>
              <FAQSection />
            </Surface>
          </div>
        </section>
      </main>
    </div>
  );
}
