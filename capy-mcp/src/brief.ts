import { detectFramework } from "./framework.js";
import { buildProjectFacts } from "./project.js";
import type {
  DesignGuidance,
  FrameworkInfo,
  InspectionStep,
  PreviewBrief,
  ProjectFacts,
} from "./types.js";

const SECTION_ORDER = [
  "Foundations",
  "Colors",
  "Icons",
  "Typography",
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
  },
): Promise<PreviewBrief> {
  const framework = await detectFramework(projectRoot);
  const projectFacts = await buildProjectFacts(projectRoot, framework, {
    discoverComponents: true,
  });
  const warnings = buildWarnings(framework, input.changedFiles);

  return {
    projectFacts,
    inspectionPlan: buildInspectionPlan(projectFacts),
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
      layoutGuidelines: [
        "Use generous whitespace between sections — at least 4rem (64px) vertical gap between major sections.",
        "Each section should have a clear heading with a subtle horizontal rule or divider.",
        "Limit content width to a comfortable reading measure (max-width around 900–1000px).",
        "Group related specimens with clear visual separation — use cards, bordered containers, or background shading.",
        "Avoid cramming multiple unrelated specimens into a single row; give each specimen room to breathe.",
        "Use consistent padding inside specimen containers (at least 1.5rem / 24px).",
        "Color swatches should be large enough to evaluate (at least 64×64px) with clear labels below.",
        "Typography specimens should show the actual font name, weight, and size metadata alongside the rendered text.",
        "Add a sticky sidebar or top navigation for quick section jumping on large pages.",
        "The overall page should feel like a polished design document, not a dense debug dump.",
      ],
      designGuidance: buildDesignGuidance(),
    },
    updateStrategy: buildUpdateStrategy(input.changedFiles),
    warnings,
    instructions: buildInstructions(projectFacts, input),
  };
}

function buildDesignGuidance(): DesignGuidance {
  return {
    pageStructure: [
      "Sticky header with subtle backdrop blur (backdrop-filter: blur(10–12px)).",
      "Max-width content column ~960px centered.",
      "Anchor IDs on headings with scroll-margin-top:5rem.",
      "Optional left sidebar or top navigation for section jumping.",
    ],

    whitespace: [
      "Section gap: 10-14rem between major sections.",
      "Sub-section gap: 2.5-3rem.",
      "Specimen gap: 1-1.5rem.",
      "Container padding: 1.5-2rem.",
      "Use spacing instead of borders to define structure.",
    ],

    typography: [
      "Section titles: 1.6-1.75rem / 600-700.",
      "Sub-headings: 1rem-1.125rem / 500-600.",
      "Labels: 0.75rem monospace.",
      "Body: 0.9rem / 1.5-1.6.",
    ],

    surfaces: [
      "Avoid default borders on containers.",
      "Use at most 2 surface levels (base + subtle elevated background).",
      "Dark mode base: #070a10, elevated: #0c1118.",
      "Light mode base: #ffffff, elevated: #f5f5f5.",
    ],

    color: [
      "Swatches: 64-80px squares with 8-10px radius.",
      "Responsive auto-fill grid.",
      "Group by semantic role (background, foreground, primary, muted).",
      "Show hex (6-char) in monospace + click-to-copy.",
      "Ensure contrast works in both themes.",
    ],

    specimens: [
      "Render components at natural size.",
      "Use subtle background surfaces instead of bordered cards.",
      "Icons: grid with 40-48px cells.",
      "Limit initial items to ~12, add 'Show all' toggle.",
    ],

    theming: [
      "Support dark and light modes via root class or data attribute.",
      "Add visible toggle in header.",
      "Persist theme in localStorage.",
      "Default to prefers-color-scheme.",
    ],

    interaction: [
      "Color swatches clickable with pointer cursor.",
      "Provide copy feedback (toast or temporary label change).",
      "Hover states subtle (opacity/background shift).",
    ],

    responsive: [
      "Below 768px: single column, reduced spacing (~4rem sections).",
      "Below 640px: collapsible nav.",
      "Horizontal rows: overflow-x auto.",
    ],
  };
}
function buildInspectionPlan(projectFacts: ProjectFacts): InspectionStep[] {
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
      targets:
        uniqueShellTargets.length > 0
          ? uniqueShellTargets
          : projectFacts.likelyPageDirs,
      reason:
        "Understand the project structure, routing style, and baseline visual language.",
    },
    {
      step: 2,
      action: "Read global styles and theme sources",
      targets: projectFacts.likelyStyleFiles.slice(0, 8),
      reason:
        "Extract colors, typography, layout rules, and theme conventions from the real repo.",
    },
    {
      step: 3,
      action: "Discover component files manually in the repository",
      targets:
        projectFacts.likelyComponentDirs.length > 0
          ? projectFacts.likelyComponentDirs
          : [
              "src/components",
              "components",
              "src/ui",
              "ui",
              "src/features",
              "features",
            ],
      reason:
        "The agent should discover component candidates directly in the repo and validate each with real usage before adding preview specimens.",
    },
    {
      step: 4,
      action: "Trace real usage paths for discovered components",
      targets:
        projectFacts.likelyPageDirs.length > 0
          ? projectFacts.likelyPageDirs
          : ["src/app", "src/pages", "app", "pages"],
      reason:
        "For each component family, trace at least one real usage flow from route/page files so preview examples mirror real behavior.",
    },
    {
      step: 5,
      action: "Implement or update the preview route",
      targets: [projectFacts.previewEntryFile],
      reason:
        "Build a neat, scrollable /preview page that reflects the real app structure.",
    },
  ];
}

function buildConstraints(framework: FrameworkInfo): string[] {
  const constraints = [
    "Inspect repo first; do not invent colors, typography, or component APIs.",
    "Prefer real components and validate them through actual usage in pages/routes.",
    "Mirror real usage flows when only hooks/providers exist instead of fabricating UI.",
    "Keep the preview clean, scannable, and aligned with the app’s design language.",
    "Do component discovery manually in-repo — traverse component directories and validate with real usage before showcasing.",
    "Follow design_guidance for layout, spacing, theming, and responsiveness without overusing bordered containers.",
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
    strategies.unshift(
      `Prioritize these changed files: ${changedFiles.join(", ")}`,
    );
  } else {
    strategies.unshift(
      "If changed files are not provided, inspect git diff or the user's latest edits before deciding what to update.",
    );
  }

  return strategies;
}

function buildWarnings(
  framework: FrameworkInfo,
  changedFiles?: string[],
): string[] {
  const warnings: string[] = [];

  if (framework.confirmationMessage) {
    warnings.push(framework.confirmationMessage);
  }

  if (!changedFiles || changedFiles.length === 0) {
    warnings.push(
      "No changedFiles were provided. The agent should inspect git diff or recent edits when performing update_preview.",
    );
  }

  warnings.push(
    "IMPORTANT: Add .capy/ and the created preview route/page files (e.g. app/preview/, pages/preview.tsx) to .gitignore so they are not committed to the repository.",
  );

  return warnings;
}

function buildInstructions(
  projectFacts: ProjectFacts,
  input: { task: "build_preview" | "update_preview"; userGoal?: string },
): string {
  const lead =
    input.task === "update_preview"
      ? "Update the existing /preview route incrementally."
      : "Create the /preview route from scratch.";

  const userGoal = input.userGoal ? ` User goal: ${input.userGoal}.` : "";

  return `${lead}${userGoal} Read the app shell first, then global styles, then discover component candidates manually by traversing component/UI directories and validating real usage from route/page files. After that, implement ${projectFacts.previewEntryFile} as a clean preview surface that supports both vertical and horizontal scanning when useful, includes a dedicated icon section when icons can be discovered, and renders colors as consistent swatches with 6-character hex labels plus click-to-copy behavior using a pointer cursor. Follow the design_guidance specifications in deliverable_spec for card styles, typography, and specimen rendering patterns. Specifically, leave 10rem to 14rem of vertical space between major sections so section endings and the next section heading are clearly separated. IMPORTANT: After creating files, add the .capy/ folder and the created preview page files (e.g. ${projectFacts.previewEntryFile}) to .gitignore so they are not committed to the repository.`;
}
