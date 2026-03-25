# MCP Config Verification Gaps

This file lists clients/providers that were not included in `/docs` MCP snippets because globally scoped config details could not be fully verified from authoritative, current documentation during this pass.

## Not fully verifiable right now

- Cursor
  - Gap: Could not reliably confirm current global MCP config file path and exact schema from official docs endpoints during this pass.
- Windsurf
  - Gap: Could not reliably confirm current global MCP config file path and exact schema from official docs endpoints during this pass.
- Mistral CLI
  - Gap: Public docs found were for Mistral Code product/IDE workflows, not a clearly documented standalone CLI global MCP config schema.
- Kimi Code
  - Gap: Could not find authoritative public docs that clearly define global MCP config path and schema.
- QwenCode
  - Gap: Could not find authoritative public docs that clearly define global MCP config path and schema.
- Antigravity
  - Gap: Could not find authoritative public docs that clearly define global MCP config path and schema.
- Cline
  - Gap: Cline is typically configured through the VS Code extension UI/workspace flow; a stable, documented global file path/schema suitable for this page was not confirmed in this verification pass.
- Claude Desktop
  - Gap: Claude Desktop per-platform config paths can differ by distribution/version; this pass prioritized Claude Code and did not complete a full current path-matrix verification suitable for a strict "pinpoint accurate" global section.

## What this means for `/docs`

- `/docs` now includes only clients with verified global MCP config instructions and snippets.
- Unverified clients are intentionally excluded from live snippets to avoid publishing stale or incorrect paths/schemas.
