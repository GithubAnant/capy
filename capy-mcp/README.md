# capy-mcp

`capy-mcp` is a stdio MCP server that inspects a React or Next.js repo and returns a structured brief for building or updating a local `/preview` route.

It does not generate the preview page itself. It gives an AI coding agent the repo map, inspection order, constraints, warnings, and target preview file so the agent can implement `/preview` in the host app.

## What it exposes

The server currently registers three MCP tools:

- `get_preview_brief`
- `update_preview`
- `get_design_system`

The tool accepts:

- `task`: `"build_preview"` or `"update_preview"`
- `changedFiles?`: a list of changed files to bias incremental updates
- `userGoal?`: the end-user request so the brief stays aligned with the task

The tool returns structured content with:

- `project_facts`
- `inspection_plan`
- `constraints`
- `deliverable_spec`
- `update_strategy`
- `warnings`
- `instructions`

`get_design_system` writes a stable JSON artifact, by default at `.capy/design-system.json`, and returns a summary plus the artifact contents. This file is meant to be the machine-readable source of truth that later coding sessions can load before making UI changes.

`update_preview` writes `.capy/preview-state.json`, diffs the current repo against the prior snapshot, refreshes `.capy/design-system.json`, and returns an incremental `/preview` update brief. This works even if the repo is not using git.

## Install

```bash
npm install capy-mcp
```

Run it directly:

```bash
npx capy-mcp
```

## MCP config

Example stdio MCP config:

```json
{
  "mcpServers": {
    "capy": {
      "command": "npx",
      "args": ["-y", "capy-mcp"]
    }
  }
}
```

## Library usage

```ts
import {
  buildDesignSystemArtifact,
  buildPreviewBrief,
  buildPreviewStateSnapshot,
  detectFramework,
  runPreviewUpdate,
  writeDesignSystemArtifact,
  writePreviewStateSnapshot,
} from "capy-mcp";

const framework = await detectFramework(process.cwd());
const brief = await buildPreviewBrief(process.cwd(), {
  task: "build_preview",
});
const designSystem = await buildDesignSystemArtifact(process.cwd());
await writeDesignSystemArtifact(process.cwd());
const previewState = await buildPreviewStateSnapshot(process.cwd());
await writePreviewStateSnapshot(process.cwd(), ".capy/preview-state.json", previewState);
const update = await runPreviewUpdate(process.cwd());
```

## Local development

```bash
npm install
npm test
npx capy-mcp
```

## Publish checklist

```bash
npm test
npm publish
```

If `capy-mcp` is not owned by your npm account, rename the package before publishing.
