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

const stdioViaNpxJson = `{
  "mcpServers": {
    "capy": {
      "command": "npx",
      "args": ["-y", "capy-mcp@latest"]
    }
  }
}`;

/* ------------------------------------------------------------------ */
/*  Per-client configurations                                         */
/* ------------------------------------------------------------------ */

export const clientConfigs: ClientConfig[] = [
  /* ---- Verified agents ------------------------------------------- */
  {
    name: "Claude Desktop",
    configPaths: {
      macOS: "~/Library/Application Support/Claude/claude_desktop_config.json",
      Windows: "%APPDATA%\\\\Claude\\\\claude_desktop_config.json",
    },
    snippet: stdioViaNpxJson,
    format: "json",
  },
  {
    name: "Claude Code",
    cli: "claude mcp add capy -- npx -y capy-mcp@latest",
    configPaths: {
      all: "~/.claude/mcp.json",
    },
    snippet: stdioViaNpxJson,
    format: "json",
    note: "For project-shared MCP config, Claude Code uses .mcp.json in the repo root.",
  },
  {
    name: "Codex",
    cli: "codex mcp add capy -- npx -y capy-mcp@latest",
    configPaths: {
      all: "~/.codex/config.toml",
    },
    snippet: `[mcp_servers.capy]
command = "npx"
args = ["-y", "capy-mcp@latest"]`,
    format: "toml",
  },
  {
    name: "Mistral Vibe",
    configPaths: {
      all: "~/.vibe/config.toml",
    },
    snippet: `[[mcp_servers]]
name = "capy"
transport = "stdio"
command = "npx"
args = ["-y", "capy-mcp@latest"]`,
    format: "toml",
  },
  {
    name: "Copilot CLI",
    configPaths: {
      all: "~/.vscode-server/data/User/mcp.json",
    },
    snippet: `{
  "servers": {
    "capy": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "capy-mcp@latest"]
    }
  }
}`,
    format: "json",
    note: "Make sure Copilot Chat is in Agent mode — MCP tools only work there.",
  },
  {
    name: "Gemini CLI",
    configPaths: {
      all: "~/.gemini/settings.json",
    },
    snippet: stdioViaNpxJson,
    format: "json",
  },
  {
    name: "OpenCode",
    configPaths: {
      all: "~/.config/opencode/opencode.json",
    },
    snippet: `{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "capy": {
      "type": "local",
      "command": ["npx", "-y", "capy-mcp@latest"],
      "enabled": true
    }
  }
}`,
    format: "json",
    note: "For project-local, put opencode.json in your project root.",
  },
  {
    name: "Kimi Code",
    cli: "kimi mcp add --transport stdio capy -- npx -y capy-mcp@latest",
    configPaths: {
      all: "~/.kimi/mcp.json",
    },
    snippet: stdioViaNpxJson,
    format: "json",
  },
  {
    name: "QwenCode",
    configPaths: {
      all: "settings.json",
    },
    snippet: stdioViaNpxJson,
    format: "json",
  },

  /* ---- Verified IDEs --------------------------------------------- */
  {
    name: "Windsurf",
    configPaths: {
      all: "~/.codeium/windsurf/mcp.json",
    },
    snippet: stdioViaNpxJson,
    format: "json",
  },
  {
    name: "Antigravity",
    configPaths: {
      all: "~/.gemini/antigravity/mcp_config.json",
    },
    snippet: stdioViaNpxJson,
    format: "json",
  },
  {
    name: "VS Code",
    configPaths: {
      all: "~/.vscode-server/data/User/mcp.json",
    },
    snippet: `{
  "servers": {
    "capy": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "capy-mcp@latest"]
    }
  }
}`,
    format: "json",
    note: "Access via Command Palette: MCP: Open User Configuration.",
  },
  {
    name: "Cursor",
    configPaths: {
      all: "~/.cursor/mcp.json",
    },
    snippet: stdioViaNpxJson,
    format: "json",
    note: "For per-project config, use .cursor/mcp.json.",
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
      "source": "custom",
      "command": "npx",
      "args": ["-y", "capy-mcp@latest"],
      "env": {}
    }
  }
}`,
    format: "json",
    note: 'The "source": "custom" field is required.',
  },
];

/** Look up config by client name */
export function getClientConfig(name: string): ClientConfig | undefined {
  return clientConfigs.find((c) => c.name === name);
}
