---
name: capy-mcp
description: Use Capy MCP tools to inspect a repo's UI structure before building or updating a /preview page, component catalog, or design-system artifact. Trigger when the user asks to build a preview, audit a design system, catalog components, or refresh the design-system artifact.
---

# Capy MCP — Agent Skill

Capy is an MCP server that inspects a repo's UI structure and returns a structured brief telling you exactly how to build or update a `/preview` page. It does NOT generate code — you do. Capy gives you the map, rules, and target.

## When to Use

- User asks to build or update a `/preview` page or component catalog
- User asks to audit, inspect, or catalog the design system
- User asks to refresh or build the `.capy/design-system.json` artifact
- Before any significant UI work, to understand the repo's structure first

## Available MCP Tools

### `get_preview_brief`

**Call this FIRST** before any UI preview, design-system, component-catalog, or style-audit task.

Returns:

- `project_facts` — framework, routing style, preview route/file, component dirs, style files, page dirs
- `inspection_plan` — ordered steps with file targets to read before coding
- `constraints` — rules you must follow
- `deliverable_spec` — exact spec for the `/preview` page (layout, sections, interaction features)
- `update_strategy` — how to handle incremental updates
- `instructions` — natural-language instructions to follow

Input:

```
task: "build_preview" | "update_preview"
changedFiles?: string[]   # files changed since last pass
userGoal?: string         # user's request for alignment
```

### `update_preview`

Call this after UI edits to detect incremental changes and get an update-focused brief.

Returns changed files, whether a baseline was created, and a full preview update brief.

Input:

```
snapshotPath?: string        # default: ".capy/preview-state.json"
designSystemPath?: string    # default: ".capy/design-system.json"
changedFiles?: string[]      # manual override
userGoal?: string
```

### `get_design_system`

Call this when you need a durable machine-readable design-system artifact (`.capy/design-system.json`).

Returns framework info, component count, CSS variable count, component dirs, style files, and discovered component families.

Input:

```
artifactPath?: string    # default: ".capy/design-system.json"
mode: "build" | "update"
changedFiles?: string[]
userGoal?: string
```

## Workflow

1. **Always call `get_preview_brief` first** — it tells you what to inspect
2. **Follow the `inspection_plan`** — read the files it lists, in order
3. **Respect `constraints`** — these are hard rules
4. **Build according to `deliverable_spec`** — layout, sections, interaction features
5. **After edits, call `update_preview`** — to detect what changed and get incremental guidance
6. **Use `get_design_system`** when you need a persistent artifact for future sessions

## Key Principles

- Capy detects: Next App Router, Next Pages Router, React Router, plain React
- The preview uses a `bidirectional-scroll` layout with horizontal rows allowed
- Always use existing components first before creating new ones
- The design-system artifact at `.capy/design-system.json` is the source of truth for tokens and components
