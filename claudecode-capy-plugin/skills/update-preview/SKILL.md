---
name: update-preview
description: Incrementally update the existing /preview page after code changes. Use when the preview page already exists and needs to reflect recent modifications.
---

# Incremental Preview Refresh

You are updating an existing `/preview` page to reflect recent code changes.

## Steps

1. **Get the update brief.** Call the MCP tool:
   ```
   mcp__capy-mcp__update_preview({ userGoal: "<user's request if any>" })
   ```

2. **Read only changed files.** The brief returns a diff of what changed since the last snapshot. Read only those files — do not re-read the entire codebase.

3. **Make targeted edits.** Update the existing preview page with surgical edits:
   - Add sections for new components
   - Update sections for modified components
   - Remove sections for deleted components
   - **Never rewrite the entire preview file** — use the Edit tool for precise changes

4. **Report results.** Summarize what changed: sections added, updated, or removed.
