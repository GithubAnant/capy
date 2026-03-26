export const clients = [
  { name: "Claude Code", category: "agent", icon: "/icons/claude-code.svg", iconClass: undefined },
  { name: "Claude Desktop", category: "agent", icon: "/icons/claude.svg", iconClass: undefined },
  { name: "Codex", category: "agent", icon: "/icons/codex.svg", iconClass: undefined },
  { name: "Copilot CLI", category: "agent", icon: "/icons/copilot-cli.svg", iconClass: undefined },
  { name: "Gemini CLI", category: "agent", icon: "/icons/gemini-cli.svg", iconClass: undefined },
  { name: "Mistral Vibe", category: "agent", icon: "/icons/mistral-cli.svg", iconClass: undefined },
  { name: "OpenCode", category: "agent", icon: "/icons/opencode.svg", iconClass: undefined },
  { name: "Kimi Code", category: "agent", icon: "/icons/kimi-code.svg", iconClass: undefined },
  { name: "QwenCode", category: "agent", icon: "/icons/qwen.svg", iconClass: undefined },
  { name: "VS Code", category: "ide", icon: "/icons/vscode.svg", iconClass: undefined },
  { name: "Cursor", category: "ide", icon: "/icons/cursor.svg", iconClass: undefined },
  { name: "Antigravity", category: "ide", icon: "/icons/antigravity.svg", iconClass: undefined },
  { name: "Zed", category: "ide", icon: "/icons/zed.svg", iconClass: undefined },
  { name: "Windsurf", category: "ide", icon: "/icons/windsurf.svg", iconClass: "h-5 w-5" },
] as const;

export type Client = (typeof clients)[number];
