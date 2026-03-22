# Capy MCP — Architecture & Implementation Doc

## What it is now

Capy is now an **MCP-only repo inspection server**.

It does **not** generate a preview page itself.
It does **not** try to render components or parse every design token in the repo perfectly.

Its job is smaller and cleaner:

- detect the framework
- map the likely UI/style/page structure of the repo
- return a strict brief for the AI agent
- write a durable design-system JSON artifact for later sessions
- tell the agent how to inspect the repo before building `/preview`

The AI agent does the heavy lifting.
Capy gives the agent the map, the rules, and the target.

---

## Project Structure

```text
capy-mcp/
├── package.json                # Package metadata for the MCP server
├── package-lock.json           # Exact dependency lockfile
├── tsconfig.json               # TypeScript build config
├── src/
│   ├── brief.ts                # Builds the structured /preview brief
│   ├── design-system.ts        # Builds and writes the design-system JSON artifact
│   ├── files.ts                # Small filesystem helpers
│   ├── framework.ts            # Detects Next/React routing style and preview path
│   ├── project.ts              # Shared project-facts discovery helpers
│   ├── server.ts               # MCP server entrypoint and tool registration
│   └── types.ts                # Shared TypeScript types
├── test/
│   ├── brief.test.mjs          # End-to-end tests for preview-brief output
│   └── design-system.test.mjs  # End-to-end tests for design-system artifact output
└── dist/                       # Built JS output shipped by the package
```

---

## Runtime Model

The server exposes three tools:

- `get_preview_brief`
- `update_preview`
- `get_design_system`

`get_preview_brief` takes a small input:

- whether the task is `build_preview` or `update_preview`
- optional `changedFiles`
- optional `userGoal`

It returns structured output with:

- `project_facts`
- `inspection_plan`
- `constraints`
- `deliverable_spec`
- `update_strategy`
- `warnings`
- `instructions`

This is returned both as:

- `structuredContent` for machine-readable use
- `content[0].text` as JSON text for host compatibility

`get_design_system` writes `.capy/design-system.json` by default and returns:

- artifact path
- framework and preview facts
- component and CSS-variable counts
- source files
- warnings
- summary

`update_preview` writes `.capy/preview-state.json` by default, diffs the repo against the last snapshot, refreshes `.capy/design-system.json`, and returns an incremental preview brief. This works even when the repo has no git history.

---

## File Tour

### `src/server.ts`

This is the MCP front door.

It:

- creates the `McpServer`
- registers `get_preview_brief`, `update_preview`, and `get_design_system`
- calls `buildPreviewBrief(...)` for preview guidance
- calls `runPreviewUpdate(...)` for snapshot-driven incremental updates
- calls `writeDesignSystemArtifact(...)` for the persistent JSON artifact
- returns results in MCP `structuredContent`

Important note:
the server now uses `registerTool(...)` instead of the older deprecated `tool(...)` helper.

### `src/brief.ts`

This is the core brain of the product.

It builds the preview brief by:

1. detecting the framework
2. finding likely component directories
3. finding likely page directories
4. finding likely style files
5. assembling the inspection steps
6. assembling constraints and update strategy
7. generating the final natural-language instruction string

This file contains the main product logic now.

### `src/design-system.ts`

This file builds the durable `.capy/design-system.json` artifact.

It:

1. reuses framework and project-facts detection
2. scans style files for CSS variables
3. inventories likely components from the repo
4. copies preview guidance into the artifact
5. writes a stable JSON file for later sessions

### `src/update.ts`

This file handles incremental preview updates without depending on git.

It:

1. builds a hash snapshot of tracked UI files
2. compares that snapshot with the prior `.capy/preview-state.json`
3. finds changed, added, or removed files
4. refreshes `.capy/design-system.json`
5. returns an update-focused preview brief

### `src/framework.ts`

This file answers:

- Is this Next App Router?
- Next Pages Router?
- React Router?
- React with no router?
- Unknown?

It also decides the best preview target path, for example:

- `src/app/preview/page.tsx`
- `app/preview/page.tsx`
- `src/pages/preview.tsx`
- `src/routes/preview.tsx`

It does not create those files.
It only tells the agent where the preview should go.

### `src/files.ts`

This is a tiny helper file.

It currently does four things:

- check whether a file or directory exists
- read a file safely
- write a file safely after creating parent directories
- normalize file paths to forward-slash format

This file is intentionally small now.

### `src/types.ts`

This holds the shared shapes for:

- framework detection
- project facts
- inspection steps
- deliverable spec
- final preview brief
- design-system artifact

If the server output changes, this file should be updated first.

### `test/brief.test.mjs`

This is the current safety net.

It creates temporary fake repos and checks that:

- Next App Router repos map to `src/app/preview/page.tsx`
- React repos without routing raise the right warning
- `update_preview` carries changed files into the update guidance

These tests verify the product contract from the outside.

### `test/design-system.test.mjs`

This test file verifies that:

- CSS variables are captured into the artifact
- components are inventoried
- `.capy/design-system.json` is written to disk

### `test/update.test.mjs`

This test file verifies that:

- Capy creates a baseline snapshot when no prior state exists
- later runs detect changed files without git
- the design-system artifact is refreshed with the detected changed files

---

## MCP Tool Contract

### Tool Name

`get_preview_brief`

### What it is for

The agent should call this before writing or updating a `/preview` page.

### Input

```ts
{
  task: "build_preview" | "update_preview";
  changedFiles?: string[];
  userGoal?: string;
}
```

### Tool Name

`get_design_system`

### What it is for

The agent should call this when it needs a stable machine-readable UI artifact for future sessions or broader UI edits.

### Input

```ts
{
  artifactPath?: string;
  mode?: "build" | "update";
  changedFiles?: string[];
  userGoal?: string;
}
```

### Tool Name

`update_preview`

### What it is for

The agent should call this after UI edits so Capy can detect incremental changes and tell the agent what parts of `/preview` need to be appended or refreshed.

### Input

```ts
{
  snapshotPath?: string;
  designSystemPath?: string;
  changedFiles?: string[];
  userGoal?: string;
}
```

### Output

```ts
{
  project_facts: {
    framework: "next-app-router" | "next-pages-router" | "react-router" | "react-no-router" | "unknown";
    routing_style: "app-router" | "pages-router" | "react-router" | "none" | "unknown";
    preview_route: string;
    preview_entry_file: string;
    package_manager: "npm" | "pnpm" | "yarn" | "bun";
    likely_component_dirs: string[];
    likely_style_files: string[];
    likely_page_dirs: string[];
    likely_ui_dirs: string[];
  };
  inspection_plan: Array<{
    step: number;
    action: string;
    targets: string[];
    reason: string;
  }>;
  constraints: string[];
  deliverable_spec: {
    goal: string;
    layout: "bidirectional-scroll";
    allow_horizontal_rows: boolean;
    preview_route: string;
    preview_entry_file: string;
    sections: string[];
    use_existing_components_first: boolean;
    interaction_features: string[];
  };
  update_strategy: string[];
  warnings: string[];
  instructions: string;
}
```

---

## How it works end-to-end

1. User asks an AI agent to build or update `/preview`, or refresh the design-system artifact.
2. The agent discovers `get_preview_brief`, `update_preview`, and `get_design_system` via MCP.
3. The agent calls one or both tools.
4. Capy inspects the repo shallowly, diffs against its last snapshot when needed, and writes the JSON artifacts.
5. The agent reads the listed files, `.capy/design-system.json`, or `.capy/preview-state.json`.
6. The agent writes the actual `/preview` implementation inside the app.

Capy does not generate the preview code itself.

---

## Why this architecture is better

The earlier version tried to:

- parse tokens deeply
- infer component props
- generate preview UI code
- own rendering behavior

That made the tool brittle and ugly.

The new version is intentionally narrower:

- deterministic repo facts from Capy
- implementation intelligence from the AI agent

This is a much better split of responsibilities.

---

## Kid-Level Codebase Tour (Append Here Forever)

This section is the "explain it like I am 10" map for the whole `capy-mcp` codebase.
Future updates should append new notes here instead of creating a separate doc.

### Big idea

Imagine Capy is a guide standing at the entrance of a huge building.

It does not build the new room for you.
It does not decorate the room either.

Instead, it says:

- "Here is the kind of building this is."
- "Here are the rooms you should check first."
- "Here is where the new preview room should go."
- "Here are the rules you must follow while building it."

That is what Capy does now.

### Top-level files

#### `package.json`

This is the package label.
It tells npm what the project is, how to build it, and which libraries it depends on.

#### `package-lock.json`

This is the dependency receipt.
It locks exact package versions so installs stay stable.

#### `tsconfig.json`

This tells TypeScript how to compile the project.

### `src/`

#### `src/server.ts`

This is the receptionist.
It waits for MCP clients, exposes the tool, and hands back the final structured result.

#### `src/brief.ts`

This is the planner.
It looks at the repo and writes the smart checklist the AI agent should follow.

#### `src/framework.ts`

This is the "what kind of app is this?" detective.
It figures out whether the project looks like Next.js or React and where `/preview` should probably live.

#### `src/files.ts`

This is the helper that does simple file chores.
It checks if things exist, reads files, and cleans up path formatting.

#### `src/types.ts`

This is the label maker.
It defines the shapes of the important data so the rest of the code stays consistent.

### `test/`

#### `test/brief.test.mjs`

This is the practice arena.
It creates fake apps and checks whether Capy gives sensible repo briefs.

### `dist/`

This is the packed suitcase.
It is the built output that actually gets shipped by the package.
Do not hand-edit it.

### Important reminder for future work

- If you add a new source file, append it to this doc.
- If you change the MCP tool contract, update this doc.
- Do not make a second technical doc for this package.
- Keep appending here.
