# Capy
## Product Requirements Document

| | |
|---|---|
| **Version** | 0.1 — Initial Draft |
| **Status** | In Review |
| **Author** | Jo (Anant) |
| **Date** | March 2026 |
| **Type** | Open Source CLI + MCP Server |

---

## 1. Overview

Capy is a locally-run CLI tool and MCP server that extracts your project's design system and hands it to whatever AI coding agent you're using as structured context. The agent stops inventing values and starts writing UI that actually matches your codebase.

One install. Zero inference costs. No cloud dependency. Works with Cursor, Claude Code, Windsurf, and any MCP-compatible agent.

### Problem

AI coding agents write visually inconsistent UI. They invent hex values, ignore existing spacing scales, duplicate components that already exist, and use fonts that aren't in the project. This happens because agents have no structured knowledge of your design system before they write code.

The fix isn't smarter AI. It's better context.

### Solution

Capy exposes three MCP tools the agent can call. The core tool returns a structured JSON payload and a human-readable instruction prompt derived from your actual codebase. The agent reads it before writing any UI. Consistency follows automatically.

### Goals

- Zero inference cost for the core scan and context generation
- Works entirely locally, no cloud account or API key required
- Single npm install, usable immediately via npx
- Compatible with all major MCP-enabled agents out of the box
- Visual preview page the human can audit without touching the terminal

### Non-Goals (v1)

- Team sync or shared config across machines (post-v1 paid feature)
- AI-assisted scanning or inference-based component analysis
- Plugin for Figma or any design tool
- Support for non-local codebases or remote repositories

---

## 2. Architecture

Everything runs on the user's machine. The MCP server is a local Node process connected to the agent via stdio. No network calls are made during normal operation.

```
User Codebase  →  Scanner (fs + regex)  →  JSON Config
JSON Config    →  MCP Server (stdio)    →  AI Agent
JSON Config    →  CLI (generate)        →  HTML Preview Page
```

### Core Components

**Scanner** — Pure Node.js static analysis. No AI. Reads Tailwind config, CSS variables, and component files from disk. Returns a structured JSON object. Runs in parallel across all source types for speed.

**MCP Server** — Thin wrapper over the scanner. Exposes three tools to the agent over stdio. Receives tool calls, runs the appropriate logic, returns the result. No HTTP server, no port, no cloud.

**CLI** — User-facing terminal interface. Handles init, preview generation, and config updates. Entry point for first-time setup and manual operations.

**Config File** — A `capy.config.json` written to the project root at init time. Stores user preferences: output style, token format, component strictness. Read by the MCP server on every tool call to shape the returned prompt.

---

## 3. MCP Tools

### Tool 1 — `generate_preview`
*Called once at setup. Human-facing.*

Scans the codebase and writes a self-contained HTML file to disk. The file is a visual audit of the entire design system: colors, typography, spacing, components, icons, and CSS variables. No server needed to view it, just open in browser.

- **Input:** optional output path (defaults to `./capy-preview.html`)
- **Output:** HTML file written to disk, confirmation message returned
- **Frequency:** once at setup, manually re-run if the design system changes significantly

---

### Tool 2 — `get_design_system`
*Called every coding session. Agent-facing. Most important tool.*

Returns two things: a structured JSON object of the design system, and a human-readable instruction prompt shaped by the user's config preferences. The agent reads both before writing any UI code.

- **Input:** none
- **Output:** JSON design system data + instruction prompt string
- **Frequency:** automatically called by the agent before every UI task

The instruction prompt includes:
- Token format preference (CSS vars vs Tailwind classes vs raw values)
- Component strictness level (use existing only / scaffold new / both)
- Output verbosity (concise / verbose / strict / explorative)
- Enumerated list of existing components and their paths

---

### Tool 3 — `update`
*Called when the design system or preferences change.*

Updates `capy.config.json` with new preferences and regenerates the HTML preview page to reflect the current state. Triggered when something in the codebase has changed or the user wants to switch output style.

- **Input:** partial config object with fields to update
- **Output:** updated config written to disk, preview page regenerated, confirmation returned
- **Frequency:** occasional, user-triggered

---

## 4. Config Schema

Stored in `capy.config.json` at the project root. Created during init, updated via the update tool or CLI.

```json
{
  "outputStyle": "concise",
  "tokenFormat": "tailwind",
  "componentStrictness": "existing-first",
  "verbosity": "concise",
  "previewPath": "./capy-preview.html",
  "scanDirs": ["src/components", "src/styles"],
  "version": "1"
}
```

### Config Options

| Field | Options | Description |
|---|---|---|
| `tokenFormat` | tailwind / css-vars / raw | How the agent should reference design tokens in generated code |
| `componentStrictness` | existing-first / scaffold / both | Whether agent uses existing components, creates new ones, or both |
| `outputStyle` | concise / verbose / strict / explorative | How the agent explains its decisions while writing UI |
| `verbosity` | concise / verbose | Length and detail of the instruction prompt returned |
| `scanDirs` | array of paths | Directories to scan for components and styles |

---

## 5. Tech Stack

### Package
- TypeScript + Node.js
- Distributed via npm
- Entry via `npx capy`

### MCP Layer
- `@modelcontextprotocol/sdk`
- Transport: stdio (local only)
- No HTTP server

### Scanner
- `fs` + `glob` for file reading
- Regex for CSS variable extraction
- `require()` eval for Tailwind config

### CLI
- `commander` or `yargs`
- `chalk` for terminal output
- Prompts for interactive init

### Preview Page
- Self-contained HTML written to disk
- No framework, no build step
- Inline CSS + vanilla JS

### Website
- Next.js on Cloudflare Pages
- Free tier, static export
- Style picker with live output demos
- Hosted at `capy.anants.studio`

---

## 6. User Flow

### First Time Setup

1. User runs `npx capy init` in their project root
2. CLI asks preference questions interactively (token format, component strictness, output style)
3. `capy.config.json` written to project root
4. User adds MCP server config to their agent (one copy-paste, shown in terminal)
5. User tells agent to call `generate_preview` — HTML file written to disk
6. User opens preview page in browser, audits their design system
7. Setup complete

### Every Coding Session

1. User asks agent to build or modify UI
2. Agent automatically calls `get_design_system`
3. MCP server reads config, returns JSON + instruction prompt
4. Agent writes consistent UI using actual design system values
5. User never has to think about it

### Updating Preferences or Design System

1. User tells agent preferences have changed, or design system was updated
2. Agent calls `update` tool with new config fields
3. Config written to disk, preview page regenerated
4. Next `get_design_system` call reflects the new state

---

## 7. Distribution + Monetization

### v1 — Free and Open Source

The entire v1 is free, open source, MIT licensed. Published to npm. GitHub is the primary distribution channel. Goal is traction, stars, and developer trust.

- Zero hosting costs (everything runs locally)
- Zero inference costs (no AI in the pipeline)
- Website on Cloudflare Pages free tier

### Post-v1 — Paid Features

Once traction exists, introduce team features that require a server.

- **Team sync:** shared `capy.config.json` across a team via Cloudflare Workers + D1
- **Dashboard:** web UI to manage config without touching the terminal
- **Multi-project:** manage design systems across multiple repos from one place

The core local tool stays free forever. Paid is additive, not gated.

---

## 8. Milestones

| Phase | Milestone | Deliverables |
|---|---|---|
| M1 | Core Scanner | scanner.ts working for Tailwind + CSS vars + component list |
| M2 | MCP Server | All three tools exposed via stdio, testable with Claude Code |
| M3 | CLI | init, preview, update commands working end to end |
| M4 | Preview Page | Self-contained HTML with full design system audit view |
| M5 | npm Publish | Package live, `npx capy init` works from scratch |
| M6 | Website | Landing page with style picker and live output demos at capy.anants.studio |