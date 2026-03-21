"use client";

import { useState, useRef, useEffect } from "react";

const clients = [
  { name: "Claude Code", category: "agent" },
  { name: "Codex", category: "agent" },
  { name: "OpenCode", category: "agent" },
  { name: "Kimi Code", category: "agent" },
  { name: "Gemini CLI", category: "agent" },
  { name: "QwenCode", category: "agent" },
  { name: "VS Code", category: "ide" },
  { name: "Cursor", category: "ide" },
  { name: "Antigravity", category: "ide" },
  { name: "Zed", category: "ide" },
  { name: "Windsurf", category: "ide" },
];

type Client = (typeof clients)[number];

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

export default function SetupSection() {
  const [selected, setSelected] = useState(clients[0]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const config = getConfig(selected);

  const steps = [
    {
      title: "Install Capy",
      command: "npm install -g capy",
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

        {/* Client picker */}
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#171615] px-4 py-2.5 text-[0.85rem] font-medium text-[#F0F0F3] transition-colors hover:bg-white/10"
          >
            {selected.name}
            <svg
              className={`h-4 w-4 text-[#858585] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl bg-[#1c1b1a] py-1 shadow-2xl ring-1 ring-white/10">
              <p className="px-3 pb-1 pt-2 text-[0.7rem] font-medium uppercase tracking-wider text-[#585858]">
                Agents
              </p>
              {clients
                .filter((c) => c.category === "agent")
                .map((client) => (
                  <button
                    key={client.name}
                    type="button"
                    onClick={() => {
                      setSelected(client);
                      setOpen(false);
                    }}
                    className={`flex w-full cursor-pointer items-center px-3 py-2 text-left text-[0.85rem] transition-colors hover:bg-white/5 ${
                      selected.name === client.name ? "text-[#F0F0F3]" : "text-[#858585]"
                    }`}
                  >
                    {client.name}
                    {selected.name === client.name && (
                      <svg className="ml-auto h-4 w-4 text-[#C4B5FD]" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}

              <div className="mx-3 my-1 border-t border-white/5" />

              <p className="px-3 pb-1 pt-2 text-[0.7rem] font-medium uppercase tracking-wider text-[#585858]">
                IDEs
              </p>
              {clients
                .filter((c) => c.category === "ide")
                .map((client) => (
                  <button
                    key={client.name}
                    type="button"
                    onClick={() => {
                      setSelected(client);
                      setOpen(false);
                    }}
                    className={`flex w-full cursor-pointer items-center px-3 py-2 text-left text-[0.85rem] transition-colors hover:bg-white/5 ${
                      selected.name === client.name ? "text-[#F0F0F3]" : "text-[#858585]"
                    }`}
                  >
                    {client.name}
                    {selected.name === client.name && (
                      <svg className="ml-auto h-4 w-4 text-[#C4B5FD]" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-6 md:flex-row">
        {steps.map((step, i) => (
          <div
            key={step.title}
            className="flex flex-1 flex-col rounded-xl bg-[#171615] p-6"
          >
            <span className="mb-4 font-mono text-[0.75rem] font-medium text-[#858585]">
              step {i + 1}.
            </span>
            <h3 className="mb-3 text-[1.05rem] font-medium text-[#F0F0F3]">
              {step.title}
            </h3>
            <div className="mb-4 overflow-x-auto rounded-lg bg-black/50 px-4 py-3">
              <pre className="text-[0.8rem] leading-relaxed text-[#C4B5FD]">
                <code>{step.command}</code>
              </pre>
            </div>
            <p className="mt-auto text-[0.82rem] leading-[1.6] text-[#858585]">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
