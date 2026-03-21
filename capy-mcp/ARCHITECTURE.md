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

---

## Kid-Level Codebase Tour (Append Here Forever)

This section is the "explain it like I am 10" map for the whole `capy-mcp` codebase.
Future updates should append new notes here instead of creating a separate doc.

### Big idea

Imagine Capy is a very organized robot helper.

- First, it walks around your project and writes down what colors, spacing, text sizes, and components it can find.
- Then, it saves those notes in a neat JSON notebook.
- Then, if your app is a Next.js app, it builds a local-only `/preview` room where you can walk around and inspect all the design pieces on a big scrollable canvas.
- If some component is too complicated to show, Capy leaves a note saying "please give me fake demo props in `.capy/examples.ts`."

### Top-level files

#### `package.json`
This is the lunchbox label for the project.
It says the package name, the version, which commands exist (`build`, `test`), and which helper libraries Capy needs to do its work.

#### `package-lock.json`
This is the exact grocery receipt.
It remembers the precise dependency versions so installs stay repeatable.

#### `tsconfig.json`
This tells TypeScript how to think.
It says where the source files live, where the built files should go, and how strict the type checking should be.

#### `prd.md`
This is the wish list.
It explains what the product is supposed to become and why it exists.

#### `ARCHITECTURE.md`
This file.
It explains how the machine is put together, and this new section is the long-term notebook for future maintainers.

### `bin/`

#### `bin/cli.js`
This is the tiny front door for the terminal command.
It just points Node to the built CLI code in `dist/`.

### `src/`

#### `src/types.ts`
This is the box of labels.
It defines the shapes of the important data:

- config values
- design-system tokens
- component metadata
- framework detection results
- preview generation results
- update results

When the rest of the code agrees on these labels, fewer bugs sneak in.

#### `src/config.ts`
This is the settings drawer.
It knows the default Capy settings and how to read or write `capy.config.json`.

Important defaults now include:

- preview route: `/preview`
- preview layout mode
- artifact folder: `.capy`

#### `src/files.ts`
This is the careful file helper.
It does boring-but-important chores:

- make folders
- read files safely
- write files only when content changed
- append gitignore entries
- make stable JSON strings
- build relative import paths

This file is a big reason Capy can be incremental instead of noisy.

#### `src/framework.ts`
This is the "what kind of app is this?" detective.
It looks at `package.json` and folders like `src/app` or `pages` and decides whether the project looks like:

- Next.js App Router
- Next.js Pages Router
- React with React Router
- React without a router
- unknown

That answer decides whether Capy can build a live `/preview` route right away or must ask for confirmation first.

#### `src/artifacts.ts`
This is the shelf manager for `.capy/`.
It knows where Capy should place:

- `.capy/design-system.json`
- `.capy/examples.ts`
- `.capy/state.json`
- `.capy/generated/*`

It also creates the starter `examples.ts` file the first time, but then leaves it alone because that file belongs to the user.

#### `src/prompt.ts`
This is the note Capy hands to the AI coding agent.
It says things like:

- which token style to use
- whether to prefer existing components
- where the design-system JSON lives
- when to inspect `/preview`
- which components still need example props

So this file is less about "finding" things and more about "explaining the rules clearly."

#### `src/pipeline.ts`
This is the main conveyor belt.
It stitches the whole workflow together.

It has two big jobs:

1. `getDesignSystemContext`
   This scans the project, writes the JSON artifact if needed, refreshes preview artifacts, and builds the prompt.

2. `updateProjectArtifacts`
   This applies config updates, rescans the project, refreshes the JSON artifact, and refreshes preview files incrementally.

If you want to understand the app at a high level, this is one of the best files to read.

#### `src/preview.ts`
This is the preview factory.
It does the heavy lifting for the `/preview` experience.

Its jobs are:

- detect what preview strategy is possible for the current framework
- build the preview data model
- decide which components can auto-render
- decide which ones need examples
- generate the client preview page module
- generate the component registry module
- generate the actual route entry file for Next.js
- save incremental state so the next run can avoid unnecessary rewrites

The preview is now **not** a standalone HTML export anymore.
Instead, for supported frameworks, Capy creates a local-only route and keeps the generated pieces in `.capy/generated/`.

#### `src/server.ts`
This is the MCP telephone operator.
It exposes three tools over stdio:

- `get_design_system`
- `generate_preview`
- `update`

Each tool now returns structured JSON text instead of vague plain strings, so an AI agent can understand what happened more reliably.

#### `src/cli.ts`
This is the human-facing terminal remote control.
It gives commands like:

- `capy init`
- `capy preview`
- `capy update`
- `capy scan`

It now uses the same shared pipeline as the MCP server, which keeps behavior consistent.

#### `src/scanner/index.ts`
This is the team captain for scanning.
It runs multiple scanners in parallel and merges their findings into one design-system object.

#### `src/scanner/tailwind.ts`
This is the Tailwind token hunter.
It can read:

- old-style `tailwind.config.*`
- newer Tailwind v4 `@theme` CSS blocks

It extracts colors, spacing, and typography tokens.

#### `src/scanner/css-vars.ts`
This is the CSS custom property hunter.
It looks for things like `--color-primary` and sorts them into buckets like color, spacing, and typography when possible.

#### `src/scanner/components.ts`
This is the component hunter.
It looks through component files and writes down:

- component name
- file path
- export type
- import name
- whether the file is a client component
- whether required props were detected

It also ignores Capy's own generated preview files, so Capy does not accidentally scan itself and create a loop.

### `test/`

#### `test/pipeline.test.mjs`
This is the safety teacher.
It builds fake sample projects in temporary folders and checks that:

- Next.js projects get preview artifacts
- running update twice stays incremental
- React projects without a router ask for confirmation

These tests are important because they check behavior from the outside, like a real user would experience it.

### `dist/`

The `dist/` folder is the robot's packed suitcase.
It is generated output from TypeScript and should not be hand-edited.

Most files here are one-to-one built copies of files in `src/`:

- `dist/server.js` comes from `src/server.ts`
- `dist/cli.js` comes from `src/cli.ts`
- `dist/config.js` comes from `src/config.ts`
- `dist/prompt.js` comes from `src/prompt.ts`
- `dist/preview.js` comes from `src/preview.ts`
- `dist/pipeline.js` comes from `src/pipeline.ts`
- `dist/framework.js` comes from `src/framework.ts`
- `dist/files.js` comes from `src/files.ts`
- `dist/artifacts.js` comes from `src/artifacts.ts`
- `dist/scanner/*` comes from `src/scanner/*`
- `*.d.ts` files are type declaration copies so TypeScript users can understand the package

### How the pieces talk to each other

Here is the simple story:

1. A human or AI calls the CLI or MCP tool.
2. `pipeline.ts` loads config and runs the scanners.
3. `artifacts.ts` writes the design-system JSON if it changed.
4. `preview.ts` decides whether a live preview route can be generated.
5. `files.ts` makes sure only changed files are rewritten.
6. `prompt.ts` writes the little rulebook for the AI agent.
7. `server.ts` or `cli.ts` returns the result back to whoever asked.

### What to remember before changing code here

- If you add a new long-lived artifact, explain it in this section.
- If you add a new source file, append it here too.
- If you change how preview generation works, update both the technical section above and this kid-level section.
- Do not create a brand new documentation file for this purpose. Keep appending here.
