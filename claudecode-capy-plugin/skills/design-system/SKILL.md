---
name: design-system
description: Extract and persist a machine-readable design-system JSON artifact for the repo. Use when the user wants to catalog design tokens, components, and CSS variables.
---

# Build Design System Artifact

You are extracting the repo's design system into a structured JSON artifact.

## Steps

1. **Build the artifact.** Call the MCP tool:
   ```
   mcp__capy-mcp__get_design_system({ mode: "build", userGoal: "<user's request if any>" })
   ```
   Use `mode: "update"` instead if the user mentions updating or refreshing an existing artifact.

2. **Report results.** Summarize what was extracted:
   - Number of components found
   - Number of CSS variables / design tokens
   - Any warnings or issues noted
   - Path where the artifact was written

3. **Suggest next step.** Let the user know they can run `/capy:preview` to build a preview page using this design system.
