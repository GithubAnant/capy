"use client";

import DocsNavbar from "@/components/layout/DocsNavbar";
import { useState } from "react";
import Image from "next/image";
import { CopyButton } from "@/components/CopyButton";
import { clients } from "@/lib/clients";
import { getClientConfig, type ClientConfig } from "@/lib/client-configs";

const docsClients = clients;

const osOptions = ["macOS", "Windows", "Linux"] as const;
type OS = (typeof osOptions)[number];

function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="overflow-hidden rounded-lg bg-[#171615]">
      {label && (
        <div className="border-b border-white/5 px-4 py-2">
          <span className="font-mono text-[0.72rem] text-[#858585]">{label}</span>
        </div>
      )}
      <div className="relative px-4 py-3">
        <pre className="overflow-x-auto text-[0.8rem] leading-relaxed text-[#E8E0D6]">
          <code>{code}</code>
        </pre>
        <div className="absolute right-3 top-3">
          <CopyButton text={code} />
        </div>
      </div>
    </div>
  );
}

function getOpenCommand(path: string, os: OS | "all"): string {
  const resolvedOS = os === "all" ? "macOS" : os;
  const opener =
    resolvedOS === "Windows"
      ? "start"
      : resolvedOS === "Linux"
        ? "xdg-open"
        : "open";
  return `${opener} ${path}`;
}

function ConfigPanel({ config }: { config: ClientConfig }) {
  const pathKeys = Object.keys(config.configPaths);
  const hasMultiOS = pathKeys.length > 1 || !pathKeys.includes("all");

  // Determine which OS tabs are relevant
  const availableOS = hasMultiOS
    ? osOptions.filter((os) => os in config.configPaths)
    : [];

  const [selectedOS, setSelectedOS] = useState<OS>(availableOS[0] ?? "macOS");

  const configPath = hasMultiOS
    ? config.configPaths[selectedOS] ?? Object.values(config.configPaths)[0]
    : config.configPaths["all"];

  const openCommand = configPath
    ? getOpenCommand(configPath, hasMultiOS ? selectedOS : "all")
    : null;

  return (
    <div className="flex flex-col gap-6">
      {/* CLI one-liner */}
      {config.cli && (
        <div>
          <h3 className="mb-2 text-[0.85rem] font-medium text-[#F0F0F3]">Quick setup</h3>
          <p className="mb-3 text-[0.8rem] text-[#858585]">
            Run this single command to add Capy globally:
          </p>
          <CodeBlock code={config.cli} />
        </div>
      )}

      {/* Manual config — stepped layout */}
      <div>
        <h3 className="mb-4 text-[0.85rem] font-medium text-[#F0F0F3]">
          {config.cli ? "Or add manually" : "Config file"}
        </h3>

        {/* OS tabs */}
        {availableOS.length > 1 && (
          <div className="mb-5 inline-flex rounded-md bg-[#171615] p-0.5">
            {availableOS.map((os) => (
              <button
                key={os}
                type="button"
                onClick={() => setSelectedOS(os)}
                className={`cursor-pointer rounded-md px-3 py-1.5 font-mono text-[0.72rem] font-medium transition-colors ${
                  selectedOS === os
                    ? "bg-white text-black"
                    : "text-[#858585] hover:text-[#F0F0F3]"
                }`}
              >
                {os}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-5">
          {/* Step 1 — Open config file */}
          <div className="flex gap-3">
            <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-white/10 font-mono text-[0.65rem] font-semibold text-[#F0F0F3]">
              1
            </span>
            <div className="min-w-0 flex-1">
              <p className="mb-2 text-[0.8rem] text-[#858585]">
                Open{" "}
                <code className="rounded bg-[#171615] px-1.5 py-0.5 font-mono text-[0.75rem] text-[#E8E0D6]">
                  {configPath}
                </code>
              </p>
              {openCommand && (
                <div className="flex items-center gap-2 rounded-lg bg-[#171615] px-3 py-2">
                  <span className="font-mono text-[0.72rem] text-[#858585]">$</span>
                  <code className="flex-1 overflow-x-auto font-mono text-[0.75rem] text-[#E8E0D6]">
                    {openCommand}
                  </code>
                  <CopyButton text={openCommand} />
                </div>
              )}
            </div>
          </div>

          {/* Step 2 — Paste snippet */}
          <div className="flex gap-3">
            <span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-white/10 font-mono text-[0.65rem] font-semibold text-[#F0F0F3]">
              2
            </span>
            <div className="min-w-0 flex-1">
              <p className="mb-2 text-[0.8rem] text-[#858585]">
                Paste this into the file
              </p>
              <CodeBlock code={config.snippet} label={config.format.toUpperCase()} />
            </div>
          </div>
        </div>
      </div>

      {/* Note */}
      {config.note && (
        <p className="mt-1 text-[0.8rem] leading-relaxed text-[#858585]">
          {config.note}
        </p>
      )}
    </div>
  );
}

export default function DocsPage() {
  const [selectedName, setSelectedName] = useState<string>(docsClients[0].name);
  const config = getClientConfig(selectedName);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black">
      <DocsNavbar />

      <main className="relative z-10 mx-auto flex w-full max-w-270 flex-col px-4 pb-20 pt-14 md:px-6">
        <p className="mb-3 text-[0.78rem] text-[#858585]">{"// Documentation"}</p>
        <h1 className="font-display text-[1.85rem] font-medium leading-[1.04] text-[#F0F0F3] md:text-[3.15rem]">
          Global MCP Config
        </h1>
        <p className="mt-4 max-w-2xl text-[0.95rem] leading-normal text-[#858585]">
          Add Capy to any IDE or agent with one config change. Pick your client below, copy the snippet, and you&apos;re set.
        </p>

        {/* Client grid */}
        <div className="mt-10 flex flex-wrap gap-2">
          {docsClients.map((client) => (
            <button
              key={client.name}
              type="button"
              onClick={() => setSelectedName(client.name)}
              className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[0.82rem] font-medium transition-all ${
                selectedName === client.name
                  ? "bg-[#171615] text-[#F0F0F3] ring-1 ring-white/20"
                  : "bg-[#171615]/50 text-[#858585] hover:bg-[#171615] hover:text-[#F0F0F3]"
              }`}
            >
              <Image
                src={client.icon}
                alt={client.name}
                width={20}
                height={20}
                className={client.iconClass ?? "h-5 w-5"}
              />
              {client.name}
            </button>
          ))}
        </div>

        {/* Config panel */}
        {config && (
          <div className="mt-8 rounded-xl border border-white/5 bg-[#0A0A09] p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              {(() => {
                const client = docsClients.find((c) => c.name === selectedName);
                return client ? (
                  <Image
                    src={client.icon}
                    alt={client.name}
                    width={28}
                    height={28}
                    className={client.iconClass ?? "h-7 w-7"}
                  />
                ) : null;
              })()}
              <h2 className="font-display text-[1.3rem] font-medium text-[#F0F0F3]">
                {selectedName}
              </h2>
            </div>

            <ConfigPanel key={selectedName} config={config} />
          </div>
        )}
      </main>
    </div>
  );
}
