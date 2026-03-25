"use client";

import { useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { ClientPicker } from "@/components/ClientPicker";

import { clients, type Client } from "@/lib/clients";
import { getClientConfig } from "@/lib/client-configs";

function getConfig(client: Client) {
  const config = getClientConfig(client.name);
  if (config) {
    const defaultPath = config.configPaths["all"] || config.configPaths["macOS"] || "settings.json";
    return {
      file: defaultPath,
      code: config.snippet
    };
  }
  
  // Default MCP config for other clients
  return {
    file: "mcp_config.json",
    code: `{
  "mcpServers": {
    "capy": {
      "command": "npx",
      "args": ["-y", "capy-mcp@latest"]
    }
  }
}`,
  };
}

export default function SetupSection() {
  const [selected, setSelected] = useState<Client>(clients[0]);

  const config = getConfig(selected);

  const steps = [
    {
      title: "Configure " + selected.name,
      command: `// ${config.file}\n${config.code}`,
      description: `Add the MCP config to ${selected.name}. Capy runs locally via npx — no global install needed.`,
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
