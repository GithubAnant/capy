import { detectFramework } from "./framework.js";
import { buildProjectFacts } from "./project.js";
import { buildComponentDiscoveryPlan } from "./component-discovery.js";
import type { FrameworkInfo, InspectionStep, PreviewBrief, ProjectFacts } from "./types.js";

const SECTION_ORDER = [
  "Foundations",
  "Colors",
  "Icons",
  "Typography",
  "Spacing",
  "Inputs",
  "Actions",
  "Navigation",
  "Data Display",
  "Feedback",
  "Overlays",
  "Components",
  "Feature or Page Sections",
];

export async function buildPreviewBrief(
  projectRoot: string,
  input: {
    task: "build_preview" | "update_preview";
    changedFiles?: string[];
    userGoal?: string;
  }
): Promise<PreviewBrief> {
  const framework = await detectFramework(projectRoot);
  const projectFacts = await buildProjectFacts(projectRoot, framework);
  const discoveryPlan = await buildComponentDiscoveryPlan(projectRoot, projectFacts);
  const warnings = buildWarnings(framework, input.changedFiles, discoveryPlan.missingFamilyGaps);

  return {
    projectFacts,
    inspectionPlan: buildInspectionPlan(projectFacts, discoveryPlan),
    constraints: buildConstraints(framework),
    deliverableSpec: {
      goal:
        input.task === "update_preview"
          ? "Update the existing /preview surface incrementally based on the files or areas that changed."
          : "Create a local /preview route that helps humans and agents inspect the app's real UI system quickly.",
      layout: "bidirectional-scroll",
      allowHorizontalRows: true,
      previewRoute: projectFacts.previewRoute,
      previewEntryFile: projectFacts.previewEntryFile,
      sections: SECTION_ORDER,
      useExistingComponentsFirst: true,
      interactionFeatures: [
        "Allow both vertical and horizontal scrolling when the preview surface benefits from a canvas-like layout.",
        "Display icons used in the app in a dedicated section whenever they can be discovered from the repo.",
        "Render color swatches in a consistent format with 6-character hex labels.",
        "Use a pointer cursor and click-to-copy behavior for color hex values.",
      ],
    },
    updateStrategy: buildUpdateStrategy(input.changedFiles),
    warnings,
    instructions: buildInstructions(projectFacts, input, discoveryPlan.instruction),
  };
}

function buildInspectionPlan(
  projectFacts: ProjectFacts,
  discoveryPlan: Awaited<ReturnType<typeof buildComponentDiscoveryPlan>>
): InspectionStep[] {
  // Build app shell targets dynamically from discovered page dirs
  // Use routing style to suggest the right shell files
  const appShellTargets: string[] = [];
  for (const pageDir of projectFacts.likelyPageDirs) {
    if (projectFacts.routingStyle === "app-router") {
      appShellTargets.push(`${pageDir}/layout.tsx`);
      appShellTargets.push(`${pageDir}/page.tsx`);
    } else if (projectFacts.routingStyle === "pages-router") {
      appShellTargets.push(`${pageDir}/_app.tsx`);
    } else {
      // Unknown or other routing — suggest both
      appShellTargets.push(`${pageDir}/layout.tsx`);
      appShellTargets.push(`${pageDir}/page.tsx`);
      appShellTargets.push(`${pageDir}/_app.tsx`);
    }
  }

  // Deduplicate
  const uniqueShellTargets = Array.from(new Set(appShellTargets));

  return [
    {
      step: 1,
      action: "Read the app shell and routing entry points first",
      targets: uniqueShellTargets.length > 0 ? uniqueShellTargets : projectFacts.likelyPageDirs,
      reason: "Understand the project structure, routing style, and baseline visual language.",
    },
    {
      step: 2,
      action: "Read global styles and theme sources",
      targets: projectFacts.likelyStyleFiles.slice(0, 8),
      reason: "Extract colors, spacing, typography, layout rules, and theme conventions from the real repo.",
    },
    {
      step: 3,
      action: "Traverse discovered component directories",
      targets: discoveryPlan.prioritizedFiles.length > 0
        ? discoveryPlan.prioritizedFiles
        : projectFacts.likelyComponentDirs,
      reason: "Read the actual components discovered by Capy's scan. These are real files with PascalCase exports, not guesses.",
    },
    {
      step: 4,
      action: "Inspect UI/component directories for anything the scan missed",
      targets: projectFacts.likelyComponentDirs.length > 0 ? projectFacts.likelyComponentDirs : projectFacts.likelyUiDirs,
      reason: "The automatic scan catches most components, but manually inspect directories for any non-standard patterns that were missed.",
    },
    {
      step: 5,
      action: "Implement or update the preview route",
      targets: [projectFacts.previewEntryFile],
      reason: "Build a neat, scrollable /preview page that reflects the real app structure.",
    },
  ];
}

function buildConstraints(framework: FrameworkInfo): string[] {
  const constraints = [
    "Do not invent colors, spacing, typography, or component APIs before inspecting the repo files listed in inspection_plan.",
    "Build a preview page that can support both vertical and horizontal scanning where useful.",
    "Use horizontal specimen rows only when they make scanning easier.",
    "Prefer existing components over creating preview-only components.",
    "Traverse all component directories found by Capy. Every file with a PascalCase export is a component candidate. Read real usage examples before marking a preview section complete.",
    "When you only find hooks, providers, or usage patterns, trace one real usage example and mirror that flow in /preview instead of inventing a fake component.",
    "If a component family is not present in the repo, label it as absent rather than fabricating a preview-only substitute.",
    "Keep the page neat, easy to scan, and aligned with the app's current design language.",
    "Include an icon inventory when the repo exposes app icons clearly enough to catalogue them.",
    "Show colors in a uniform swatch format with normalized 6-character hex labels and click-to-copy affordance.",
  ];

  if (framework.needsConfirmation && framework.confirmationMessage) {
    constraints.push(framework.confirmationMessage);
  }

  return constraints;
}

function buildUpdateStrategy(changedFiles?: string[]): string[] {
  const strategies = [
    "When updating, inspect changed files first and revise only affected preview sections where possible.",
    "If a changed file affects shared foundations, then update every preview section that depends on those foundations.",
    "Do not rebuild the entire preview page unless the current structure is no longer representative of the app.",
  ];

  if (changedFiles && changedFiles.length > 0) {
    strategies.unshift(`Prioritize these changed files: ${changedFiles.join(", ")}`);
  } else {
    strategies.unshift(
      "If changed files are not provided, inspect git diff or the user's latest edits before deciding what to update."
    );
  }

  return strategies;
}

function buildWarnings(
  framework: FrameworkInfo,
  changedFiles?: string[],
  discoveryGaps: string[] = []
): string[] {
  const warnings: string[] = [];

  if (framework.confirmationMessage) {
    warnings.push(framework.confirmationMessage);
  }

  if (!changedFiles || changedFiles.length === 0) {
    warnings.push(
      "No changedFiles were provided. The agent should inspect git diff or recent edits when performing update_preview."
    );
  }

  warnings.push(...discoveryGaps);

  warnings.push(
    "IMPORTANT: Add .capy/ and the created preview route/page files (e.g. app/preview/, pages/preview.tsx) to .gitignore so they are not committed to the repository."
  );

  return warnings;
}

function buildInstructions(
  projectFacts: ProjectFacts,
  input: { task: "build_preview" | "update_preview"; userGoal?: string },
  discoveryInstruction: string
): string {
  const lead =
    input.task === "update_preview"
      ? "Update the existing /preview route incrementally."
      : "Create the /preview route from scratch.";

  const userGoal = input.userGoal ? ` User goal: ${input.userGoal}.` : "";

  return `${lead}${userGoal} Read the app shell first, then global styles, then traverse all discovered component directories. After that, implement ${projectFacts.previewEntryFile} as a clean preview surface that supports both vertical and horizontal scanning when useful, includes a dedicated icon section when icons can be discovered, and renders colors as consistent swatches with 6-character hex labels plus click-to-copy behavior using a pointer cursor. ${discoveryInstruction} IMPORTANT: After creating files, add the .capy/ folder and the created preview page files (e.g. ${projectFacts.previewEntryFile}) to .gitignore so they are not committed to the repository.`;
}
