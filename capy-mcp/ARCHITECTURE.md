# Capy MCP — Architecture & Implementation Doc

## What is Capy?

A locally-run MCP server + CLI that extracts your project's design system (colors, typography, spacing, components, CSS variables) and hands it to AI coding agents as structured context. No cloud, no API keys, no inference costs.

---

## Project Structure

```
capy-mcp/
├── bin/cli.js                  # Entry shim → dist/cli.js
├── package.json                # ESM, TypeScript, npm publishable
├── tsconfig.json               # ES2022, NodeNext modules
├── src/
│   ├── types.ts                # All shared TypeScript types
│   ├── config.ts               # Read/write/default capy.config.json
│   ├── scanner/
│   │   ├── index.ts            # Orchestrator — runs all scanners in parallel
│   │   ├── tailwind.ts         # Tailwind v3 config + v4 @theme extraction
│   │   ├── css-vars.ts         # CSS custom property extraction
│   │   └── components.ts       # Component file discovery (tsx/jsx/vue/svelte)
│   ├── prompt.ts               # Generates markdown instruction prompt for agents
│   ├── preview.ts              # Generates self-contained HTML preview page
│   ├── server.ts               # MCP server (stdio transport, 3 tools)
│   └── cli.ts                  # CLI commands: init, preview, update, scan
└── dist/                       # Compiled JS output
```

---

## Key Files & What They Do

### `src/types.ts`
Defines all shared types: `CapyConfig`, `DesignSystem`, `ColorToken`, `TypographyToken`, `SpacingToken`, `Component`, `CSSVariable`.

### `src/config.ts`
- `getDefaultConfig()` — returns sensible defaults
- `loadConfig(projectRoot)` — reads `capy.config.json`, merges with defaults
- `writeConfig(projectRoot, config)` — writes config to disk

### `src/scanner/index.ts`
Runs all three scanners in parallel via `Promise.all` and merges results into a single `DesignSystem` object.

### `src/scanner/tailwind.ts`
- **Tailwind v3**: Finds `tailwind.config.{js,ts,mjs,cjs}`, dynamically imports it, extracts `theme.colors`, `theme.spacing`, `theme.fontFamily`, `theme.fontSize` (including `extend`)
- **Tailwind v4**: Falls back to scanning CSS files for `@theme { ... }` blocks and extracting CSS variables from them
- Flattens nested objects (e.g., `colors.blue.500` → `blue-500`)

### `src/scanner/css-vars.ts`
- Globs `*.css` files in configured `scanDirs` + project root
- Regex extracts `--var-name: value;` declarations
- Auto-categorizes variables as color/spacing/typography based on name and value patterns
- Skips `@theme` blocks (handled by tailwind scanner)

### `src/scanner/components.ts`
- Globs `*.tsx`, `*.jsx`, `*.vue`, `*.svelte` in `scanDirs`
- Filters out non-components (hooks, utils, types, test files)
- Detects export type (default/named/unknown)
- Checks for JSX presence to confirm it's actually a component

### `src/prompt.ts`
Takes `DesignSystem` + `CapyConfig` and generates a markdown instruction string that tells the agent:
- Which token format to use (Tailwind classes / CSS vars / raw values)
- Component strictness rules (use existing / scaffold new / both)
- Enumerated colors, typography, spacing tokens
- Full component list with file paths

### `src/preview.ts`
Generates a self-contained HTML file with inline CSS/JS. Dark theme. Sections:
- **Colors** — grid of swatches with name/value
- **Typography** — list of font tokens
- **Spacing** — visual bars showing relative scale
- **Components** — list with file paths and export types
- **CSS Variables** — full table with name/value/source file

### `src/server.ts`
MCP server using `@modelcontextprotocol/sdk` with stdio transport. Exposes 3 tools:

| Tool | Purpose |
|------|---------|
| `get_design_system` | Returns JSON design system + instruction prompt |
| `generate_preview` | Writes HTML preview to disk |
| `update` | Updates config + regenerates preview |

### `src/cli.ts`
CLI built with `commander`. Commands:

| Command | What it does |
|---------|-------------|
| `capy init` | Interactive setup → writes `capy.config.json`, prints MCP config snippet |
| `capy preview` | Generates HTML preview page |
| `capy update` | Updates config via flags, regenerates preview |
| `capy scan` | Prints raw design system JSON to stdout |

---

## Dependencies

| Package | Why |
|---------|-----|
| `@modelcontextprotocol/sdk` | MCP protocol server + stdio transport |
| `commander` | CLI framework |
| `chalk` | Terminal colors |
| `glob` | File pattern matching |
| `zod` | Schema validation (required by MCP SDK for tool inputs) |

---

## How It Works End-to-End

1. User runs `capy init` → interactive prompts → `capy.config.json` written
2. User adds MCP server to their agent config (`npx capy-mcp` via stdio)
3. Agent calls `get_design_system` → scanner reads Tailwind config + CSS files + component files → returns structured JSON + instruction prompt
4. Agent writes UI using actual design system values instead of inventing them
5. User can run `capy preview` or have agent call `generate_preview` to get a visual HTML audit page
