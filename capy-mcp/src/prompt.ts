import type { CapyConfig, DesignSystem, FrameworkInfo } from "./types.js";

export function generatePrompt(
  config: CapyConfig,
  ds: DesignSystem,
  context: {
    framework: FrameworkInfo;
    designSystemPath: string;
    route: string;
    previewStatus: "updated" | "unchanged" | "needs_confirmation";
    missingExamples: string[];
  }
): string {
  const lines: string[] = [];

  lines.push("# Design System Context");
  lines.push("");
  lines.push("You MUST use the following design system when writing UI code. Do not invent values.");
  lines.push("");
  lines.push("## Session Checklist");
  lines.push(`1. Read \`${context.designSystemPath}\` before editing UI.`);
  lines.push(`2. Inspect the local preview route at \`${context.route}\` when the framework supports it.`);
  lines.push("3. If a preview specimen is missing data, update `.capy/examples.ts` instead of hardcoding production values.");
  lines.push("4. After changing UI primitives or components, call `update` so the preview + JSON stay fresh.");
  lines.push("");

  lines.push("## Project Runtime");
  lines.push(`Framework: ${context.framework.label}`);
  lines.push(`Preview status: ${context.previewStatus}`);
  if (context.framework.confirmationMessage) {
    lines.push(context.framework.confirmationMessage);
  }
  lines.push("");

  // Token format instruction
  const formatMap = {
    tailwind: "Use Tailwind utility classes (e.g., `bg-primary`, `text-lg`, `p-4`).",
    "css-vars": "Use CSS custom properties (e.g., `var(--color-primary)`, `var(--spacing-4)`).",
    raw: "Use raw values directly (e.g., `#3b82f6`, `1rem`, `16px`).",
  };
  lines.push(`## Token Format`);
  lines.push(formatMap[config.tokenFormat]);
  lines.push("");

  // Component strictness
  const strictMap = {
    "existing-first": "ALWAYS check if an existing component can be used before creating a new one. Only create new components when no existing one fits.",
    scaffold: "Create new components as needed. Existing components are listed for reference but are not mandatory.",
    both: "Prefer existing components when they fit, but feel free to create new ones when it makes sense.",
  };
  lines.push(`## Component Usage`);
  lines.push(strictMap[config.componentStrictness]);
  lines.push("");

  const styleMap = {
    concise: "Respond with short, direct implementation notes.",
    verbose: "Explain implementation decisions and tradeoffs clearly.",
    strict: "Be strict about reusing tokens and existing components before introducing anything new.",
    explorative: "Offer 1-2 well-reasoned UI options, but still stay inside the detected design system.",
  };
  lines.push("## Output Style");
  lines.push(styleMap[config.outputStyle]);
  lines.push("");

  // Colors
  if (ds.colors.length > 0) {
    lines.push("## Colors");
    if (config.verbosity === "verbose") {
      for (const c of ds.colors) {
        lines.push(`- \`${c.name}\`: ${c.value} (${c.source})`);
      }
    } else {
      const grouped = groupBy(ds.colors, (c) => c.source);
      for (const [source, tokens] of Object.entries(grouped)) {
        lines.push(`### ${source}`);
        lines.push(tokens.map((c) => `\`${c.name}\``).join(", "));
      }
    }
    lines.push("");
  }

  // Typography
  if (ds.typography.length > 0) {
    lines.push("## Typography");
    for (const t of ds.typography) {
      lines.push(
        config.verbosity === "verbose"
          ? `- \`${t.name}\`: ${t.value} (${t.source})`
          : `- \`${t.name}\``
      );
    }
    lines.push("");
  }

  // Spacing
  if (ds.spacing.length > 0) {
    lines.push("## Spacing");
    for (const s of ds.spacing) {
      lines.push(
        config.verbosity === "verbose"
          ? `- \`${s.name}\`: ${s.value} (${s.source})`
          : `- \`${s.name}\``
      );
    }
    lines.push("");
  }

  // Components
  if (ds.components.length > 0) {
    lines.push("## Existing Components");
    for (const comp of ds.components) {
      lines.push(`- \`${comp.name}\` — ${comp.filePath} (${comp.exportType} export)`);
    }
    lines.push("");
  }

  // CSS Variables
  if (config.verbosity === "verbose" && ds.cssVariables.length > 0) {
    lines.push("## CSS Variables");
    for (const v of ds.cssVariables) {
      lines.push(`- \`${v.name}\`: ${v.value} (${v.file})`);
    }
    lines.push("");
  }

  if (context.missingExamples.length > 0) {
    lines.push("## Components Waiting For Examples");
    lines.push(
      "These components need demo props or custom render wrappers in `.capy/examples.ts` before the preview can render them reliably:"
    );
    for (const name of context.missingExamples) {
      lines.push(`- \`${name}\``);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function groupBy<T>(arr: T[], fn: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of arr) {
    const key = fn(item);
    (result[key] ??= []).push(item);
  }
  return result;
}
