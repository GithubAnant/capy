# Contributing

Thanks for taking the time to improve Capy.

This repository contains multiple packages:

- `website` for the marketing site and docs
- `capy-mcp` for the MCP server
- `opencode-capy-plugin` for the OpenCode integration
- `claudecode-capy-plugin` for Claude Code skills and prompts
- `docs` and repo-level references for architecture and support material

## What to contribute

- Bug fixes
- Copy and content improvements
- UI and layout refinements
- Accessibility fixes
- Performance and maintainability improvements
- Documentation updates
- Package-level fixes in the MCP server or plugins

## Repo layout

- Run website work from `website/`.
- Run MCP server work from `capy-mcp/`.
- Run OpenCode plugin work from `opencode-capy-plugin/`.
- Review repo-wide docs in `README.md`, `docs/`, `tools.md`, and `demo-prompts.md` before making changes that affect multiple packages.

## Local setup

Install dependencies in the package you are working on, then use that package’s scripts.

Website:

- `npm run dev`
- `npm run lint`
- `npm run build`

MCP server:

- `npm run build`
- `npm test`

OpenCode plugin:

- `npm run build`
- `npm run dev`

## Before you open a PR

- Make the smallest change that solves the problem.
- Keep changes scoped to the package or docs they affect.
- Run the relevant build, lint, or test commands for every package you touch.
- For UI changes, verify the affected page on both desktop and mobile and include screenshots or a short screen recording.
- Update related docs if your change affects setup, usage, or behavior.

## Code style

- Use TypeScript where the package already uses it.
- Follow the existing conventions in the package you are changing.
- Prefer clear, composable modules over large monolithic ones.
- Avoid introducing new dependencies unless they materially reduce complexity or unblock the change.

## Pull requests

Please include:

- A short description of the change
- The reason for the change
- The packages you changed
- Any screenshots for visual updates
- Notes about follow-up work, if anything is intentionally left out

If your PR changes behavior in more than one package, call that out clearly so reviewers can validate it quickly.

## Issues

When filing an issue, include:

- What you expected to happen
- What actually happened
- Steps to reproduce
- The package affected
- Browser and device details if the issue is visual or interactive

## Notes

- Keep contributions focused and easy to review.
- If you are unsure about a large change, open an issue first and outline the proposed approach.
