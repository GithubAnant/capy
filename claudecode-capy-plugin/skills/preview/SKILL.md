---
name: preview
description: Build the full /preview page for the current repo. Use when the user wants to create a component catalog or preview page from scratch.
---

# Build Preview Page

You are building a complete `/preview` page for the current repository.

## Steps

1. **Get the brief.** Call the MCP tool:
   ```
   mcp__capy-mcp__get_preview_brief({ task: "build_preview", userGoal: "<user's request if any>" })
   ```

2. **Inspect the codebase.** Execute every step in the returned `inspection_plan`:
   - Read all target files listed in the plan
   - Note existing components, styles, and layout patterns

3. **Follow constraints exactly.** The brief includes a `constraints` object — obey every rule (frameworks, styling approach, file locations, do/don't lists).

4. **Build the preview page.** Create or overwrite the file at `deliverable_spec.preview_entry_file`:
   - Reuse existing components from the repo before creating new ones
   - Implement **all** sections listed in the spec
   - Match the repo's existing code style and conventions
   - Follow any `layout_guidelines` from the brief

5. **Persist the design system.** After building the preview, call:
   ```
   mcp__capy-mcp__get_design_system({ mode: "build", userGoal: "Persist design system after preview build" })
   ```

6. **Report results.** Summarize what was built: file path, sections implemented, components reused vs created.
