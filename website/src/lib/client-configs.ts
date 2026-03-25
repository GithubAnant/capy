export type ConfigFormat = "json" | "toml";

export interface ClientConfig {
  /** Display name — must match clients.ts */
  name: string;
  /** One-liner CLI command to add Capy globally (if the client supports it) */
  cli?: string;
  /** Config file paths, keyed by OS. Use "all" when every OS shares one path. */
  configPaths: Record<string, string>;
  /** The JSON or TOML snippet to paste into the config file */
  snippet: string;
  /** Snippet language */
  format: ConfigFormat;
  /** Optional help text shown below the snippet */
  note?: string;
}

/* ------------------------------------------------------------------ */
/*  Shared snippet fragments                                          */
/* ------------------------------------------------------------------ */

const stdJson = `{
  "mcpServers": {
    "capy": {
      "command": "capy",
      "args": ["start"]
    }
  }
}`;

const vscodeJson = `{
  "mcp": {
    "servers": {
      "capy": {
        "command": "capy",
        "args": ["start"]
      }
    }
  }
}`;

/* ------------------------------------------------------------------ */
/*  Per-client configurations                                         */
/* ------------------------------------------------------------------ */

export const clientConfigs: ClientConfig[] = [
  /* ---- Agents ---------------------------------------------------- */
  {
    name: "Claude Code",
    cli: "claude mcp add capy -- capy start",
    configPaths: {
      all: "~/.claude/settings.json",
    },
    snippet: stdJson,
    format: "json",
  },
  {
    name: "Claude Desktop",
    configPaths: {
      macOS: "~/Library/Application Support/Claude/claude_desktop_config.json",
      Windows: "%APPDATA%\\Claude\\claude_desktop_config.json",
    },
    snippet: stdJson,
    format: "json",
    note: "Restart Claude Desktop after editing the config file.",
  },
  {
    name: "Cline",
    configPaths: {
      all: "Configured via the Cline extension UI in VS Code.",
    },
    snippet: stdJson,
    format: "json",
    note: "Open the Cline sidebar → MCP Servers → Add Server, then paste the config.",
  },
  {
    name: "Codex",
    cli: "codex --mcp-config mcp.json",
    configPaths: {
      all: "~/.codex/mcp.json",
    },
    snippet: stdJson,
    format: "json",
  },
  {
    name: "Copilot CLI",
    configPaths: {
      all: "~/.github-copilot/mcp.json",
    },
    snippet: stdJson,
    format: "json",
  },
  {
    name: "Gemini CLI",
    cli: "gemini --mcp capy -- capy start",
    configPaths: {
      all: "~/.gemini/settings.json",
    },
    snippet: `{
  "mcpServers": {
    "capy": {
      "command": "capy",
      "args": ["start"]
    }
  }
}`,
    format: "json",
  },
  {
    name: "Mistral CLI",
    configPaths: {
      all: "~/.mistral/mcp.json",
    },
    snippet: stdJson,
    format: "json",
  },
  {
    name: "OpenCode",
    configPaths: {
      all: "~/.config/opencode/config.toml",
    },
    snippet: `[mcp.capy]
command = "capy"
args = ["start"]`,
    format: "toml",
  },
  {
    name: "Kimi Code",
    configPaths: {
      all: "~/.kimi/mcp.json",
    },
    snippet: stdJson,
    format: "json",
  },
  {
    name: "QwenCode",
    configPaths: {
      all: "~/.qwen/mcp.json",
    },
    snippet: stdJson,
    format: "json",
  },

  /* ---- IDEs ------------------------------------------------------ */
  {
    name: "VS Code",
    configPaths: {
      macOS: "~/Library/Application Support/Code/User/settings.json",
      Windows: "%APPDATA%\\Code\\User\\settings.json",
      Linux: "~/.config/Code/User/settings.json",
    },
    snippet: vscodeJson,
    format: "json",
    note: "This adds Capy globally. For per-project config, use .vscode/settings.json instead.",
  },
  {
    name: "Cursor",
    configPaths: {
      macOS: "~/Library/Application Support/Cursor/User/globalStorage/cursor-mcp.json",
      Windows: "%APPDATA%\\Cursor\\User\\globalStorage\\cursor-mcp.json",
      Linux: "~/.config/Cursor/User/globalStorage/cursor-mcp.json",
    },
    snippet: stdJson,
    format: "json",
  },
  {
    name: "Antigravity",
    configPaths: {
      all: "Configured via Settings → MCP in the Antigravity app.",
    },
    snippet: stdJson,
    format: "json",
    note: "Paste this into the MCP configuration panel.",
  },
  {
    name: "Zed",
    configPaths: {
      macOS: "~/.config/zed/settings.json",
      Linux: "~/.config/zed/settings.json",
    },
    snippet: `{
  "context_servers": {
    "capy": {
      "command": {
        "path": "capy",
        "args": ["start"]
      }
    }
  }
}`,
    format: "json",
  },
  {
    name: "Windsurf",
    configPaths: {
      macOS: "~/.codeium/windsurf/mcp_config.json",
      Windows: "%APPDATA%\\.codeium\\windsurf\\mcp_config.json",
      Linux: "~/.codeium/windsurf/mcp_config.json",
    },
    snippet: stdJson,
    format: "json",
  },
];

/** Look up config by client name */
export function getClientConfig(name: string): ClientConfig | undefined {
  return clientConfigs.find((c) => c.name === name);
}
