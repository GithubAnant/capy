export const clients = [
  { name: "Claude Code", category: "agent", icon: "/icons/claude-code.svg" },
  { name: "Claude", category: "agent", icon: "/icons/claude.svg" },
  { name: "Cline", category: "agent", icon: "/icons/cline.svg" },
  { name: "Codex", category: "agent", icon: "/icons/codex.svg" },
  { name: "Conductor", category: "agent", icon: "/icons/conductor.svg", iconClass: "h-5 w-5" },
  { name: "Copilot CLI", category: "agent", icon: "/icons/copilot-cli.svg" },
  { name: "Gemini CLI", category: "agent", icon: "/icons/gemini-cli.svg" },
  { name: "Mistral CLI", category: "agent", icon: "/icons/mistral-cli.svg" },
  { name: "OpenCode", category: "agent", icon: "/icons/opencode.svg" },
  { name: "Kimi Code", category: "agent", icon: undefined },
  { name: "QwenCode", category: "agent", icon: "/icons/qwen.svg" },
  { name: "VS Code", category: "ide", icon: "/icons/vscode.svg" },
  { name: "Cursor", category: "ide", icon: "/icons/cursor.svg" },
  { name: "Antigravity", category: "ide", icon: "/icons/antigravity.svg" },
  { name: "Zed", category: "ide", icon: "/icons/zed.svg" },
  { name: "Windsurf", category: "ide", icon: "/icons/windsurf.svg", iconClass: "h-5 w-5" },
] as const;

export type Client = (typeof clients)[number];
