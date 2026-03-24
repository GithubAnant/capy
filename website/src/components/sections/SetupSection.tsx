"use client";

import { useState, useRef, useEffect } from "react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="shrink-0 cursor-pointer p-1 text-[#858585] transition-colors hover:text-[#F0F0F3]"
      title="Copy"
    >
      {copied ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      )}
    </button>
  );
}

import { ClientPicker } from "@/components/ClientPicker";

import { clients, type Client } from "@/lib/clients";

function getConfig(client: Client) {
  const name = client.name;

  if (name === "Claude Code") {
    return {
      file: ".claude/settings.json",
      code: `{
  "mcpServers": {
    "capy": {
      "command": "capy",
      "args": ["start"]
    }
  }
}`,
    };
  }

  if (name === "VS Code" || name === "Cursor" || name === "Windsurf") {
    return {
      file: ".vscode/settings.json",
      code: `{
  "mcp": {
    "servers": {
      "capy": {
        "command": "capy",
        "args": ["start"]
      }
    }
  }
}`,
    };
  }

  if (name === "Zed") {
    return {
      file: "settings.json",
      code: `{
  "context_servers": {
    "capy": {
      "command": {
        "path": "capy",
        "args": ["start"]
      }
    }
  }
}`,
    };
  }

  // Default MCP config for other clients
  return {
    file: "mcp_config.json",
    code: `{
  "mcpServers": {
    "capy": {
      "command": "capy",
      "args": ["start"]
    }
  }
}`,
  };
}

const packageManagers = ["npm", "pnpm", "bun"] as const;

export default function SetupSection() {
  const [selected, setSelected] = useState<Client>(clients[0]);
  const [pm, setPm] = useState<(typeof packageManagers)[number]>("npm");

  const config = getConfig(selected);

  const steps = [
    {
      title: "Install Capy",
      command: pm === "bun" ? "bun add -g capy" : `${pm} install -g capy`,
      description: "Install the Capy MCP server globally with a single command.",
    },
    {
      title: "Start the server",
      command: "capy start",
      description: "Launch the local MCP server. It runs in the background and listens for connections.",
    },
    {
      title: "Connect your client",
      command: `// ${config.file}\n${config.code}`,
      description: `Add the MCP config to ${selected.name} and start coding.`,
    },
  ];

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
          {/* Client picker */}
          <ClientPicker selected={selected} onSelect={setSelected} />
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-0">
        {steps.map((step, i) => (
          <div key={step.title} className="flex gap-5">
            {/* Left: step number + vertical line */}
            <div className="flex flex-col items-center">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#171615] font-mono text-[0.75rem] font-medium text-[#F0F0F3]">
                {i + 1}
              </span>
              {i < steps.length - 1 && (
                <div className="w-px flex-1 bg-white/10" />
              )}
            </div>

            {/* Right: content */}
            <div className={`pb-10 ${i === steps.length - 1 ? "pb-0" : ""}`}>
              <h3 className="mt-1 text-[1.05rem] font-medium text-[#F0F0F3]">
                {step.title}
              </h3>
              <p className="mt-1.5 text-[0.82rem] leading-[1.6] text-[#858585]">
                {step.description}
              </p>
              <div className="mt-3 overflow-hidden rounded-lg bg-[#171615]">
                {i === 0 && (
                  <div className="border-b border-white/5 px-4 py-2.5">
                    <div className="inline-flex rounded-md bg-black/30 p-0.5">
                      {packageManagers.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPm(p)}
                          className={`cursor-pointer rounded-md px-2.5 py-1 font-mono text-[0.72rem] font-medium transition-colors ${
                            pm === p ? "bg-white text-black" : "text-[#858585] hover:text-[#F0F0F3]"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="relative px-4 py-3">
                  <pre className="overflow-x-auto text-[0.8rem] leading-relaxed text-[#E8E0D6]">
                    <code>{step.command}</code>
                  </pre>
                  <div className="absolute right-3 top-3">
                    <CopyButton text={step.command} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
