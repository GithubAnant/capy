"use client";

import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { ClientPicker } from "@/components/ClientPicker";

import { clients, type Client } from "@/lib/clients";
import { getClientConfig, type ClientConfig } from "@/lib/client-configs";

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
  // Determine the shell command to open the file based on OS
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

      {/* Config file */}
      <div>
        <h3 className="mb-2 text-[0.85rem] font-medium text-[#F0F0F3]">
          {config.cli ? "Or add manually" : "Config file"}
        </h3>

        {/* OS tabs */}
        {availableOS.length > 1 && (
          <div className="mb-3 inline-flex rounded-md bg-[#171615] p-0.5">
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

        {/* File path */}
        <p className="mb-3 text-[0.8rem] text-[#858585]">
          Add to{" "}
          <code className="rounded bg-[#171615] px-1.5 py-0.5 font-mono text-[0.75rem] text-[#E8E0D6]">
            {configPath}
          </code>
        </p>

        {/* Open file command */}
        {openCommand && (
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-[#171615] px-3 py-2">
            <span className="font-mono text-[0.72rem] text-[#858585]">$</span>
            <code className="flex-1 font-mono text-[0.75rem] text-[#E8E0D6]">
              {openCommand}
            </code>
            <CopyButton text={openCommand} />
          </div>
        )}

        {/* Snippet */}
        <CodeBlock code={config.snippet} label={config.format.toUpperCase()} />
      </div>

      {/* Note */}
      {config.note && (
        <p className="text-[0.8rem] leading-relaxed text-[#858585]">
          {config.note}
        </p>
      )}
    </div>
  );
}

export default function SetupSection() {
  const [selected, setSelected] = useState<Client>(clients[0]);
  const config = getClientConfig(selected.name);

  return (
    <section id="setup">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-3 text-[0.78rem] text-[#858585]">{"// Setup"}</p>
          <h2 className="font-display text-[1.57rem] font-normal leading-[1.1] text-[#F0F0F3] md:text-[2.35rem]">
            Up and running. <span className="text-[#858585]">In under a minute.</span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <ClientPicker selected={selected} onSelect={setSelected} />
        </div>
      </div>

      {config && (
        <div className="mt-10 rounded-xl border border-white/5 bg-[#0A0A09] p-6 md:p-8">
          <ConfigPanel key={selected.name} config={config} />
        </div>
      )}
    </section>
  );
}
