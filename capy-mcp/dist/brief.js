import { detectFramework } from "./framework.js";
import { buildProjectFacts } from "./project.js";
import { buildComponentDiscoveryPlan } from "./component-discovery.js";
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
    "Feature or Page Sections",
];
export async function buildPreviewBrief(projectRoot, input) {
    const framework = await detectFramework(projectRoot);
    const projectFacts = await buildProjectFacts(projectRoot, framework);
    const discoveryPlan = await buildComponentDiscoveryPlan(projectRoot, projectFacts);
    const warnings = buildWarnings(framework, input.changedFiles, discoveryPlan.missingFamilyGaps);
    return {
        projectFacts,
        inspectionPlan: buildInspectionPlan(projectFacts, discoveryPlan),
        constraints: buildConstraints(framework),
        deliverableSpec: {
            goal: input.task === "update_preview"
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
function buildInspectionPlan(projectFacts, discoveryPlan) {
    const appShellTargets = uniqueCompact([
        firstMatching(projectFacts.likelyPageDirs, "src/app")
            ? "src/app/layout.tsx"
            : undefined,
        firstMatching(projectFacts.likelyPageDirs, "src/app")
            ? "src/app/page.tsx"
            : undefined,
        firstMatching(projectFacts.likelyPageDirs, "app") ? "app/layout.tsx" : undefined,
        firstMatching(projectFacts.likelyPageDirs, "app") ? "app/page.tsx" : undefined,
        firstMatching(projectFacts.likelyPageDirs, "src/pages") ? "src/pages/_app.tsx" : undefined,
        firstMatching(projectFacts.likelyPageDirs, "pages") ? "pages/_app.tsx" : undefined,
    ]);
    return [
        {
            step: 1,
            action: "Read the app shell and routing entry points first",
            targets: appShellTargets.length > 0 ? appShellTargets : projectFacts.likelyPageDirs,
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
            action: "Search for real UI primitives, overlays, and feedback patterns",
            targets: discoveryPlan.searchStepTargets,
            reason: "Capy's first pass is only a starting point. Search for real components and usage examples before building /preview.",
        },
        {
            step: 4,
            action: "Inspect UI/component directories",
            targets: projectFacts.likelyComponentDirs.length > 0 ? projectFacts.likelyComponentDirs : projectFacts.likelyUiDirs,
            reason: "Find existing primitives, composites, and sections before inventing new preview-only UI.",
        },
        {
            step: 5,
            action: "Implement or update the preview route",
            targets: [projectFacts.previewEntryFile],
            reason: "Build a neat, scrollable /preview page that reflects the real app structure.",
        },
    ];
}
function buildConstraints(framework) {
    const constraints = [
        "Do not invent colors, spacing, typography, or component APIs before inspecting the repo files listed in inspection_plan.",
        "Build a preview page that can support both vertical and horizontal scanning where useful.",
        "Use horizontal specimen rows only when they make scanning easier.",
        "Prefer existing components over creating preview-only components.",
        "Do not stop after Capy's first-pass scan. Search the repo for real buttons, inputs, selects, tabs, cards, badges, dialogs, popovers, tooltips, dropdowns, toasts/snackbars, alerts, skeletons, and loading or empty states before marking a preview section complete.",
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
function buildUpdateStrategy(changedFiles) {
    const strategies = [
        "When updating, inspect changed files first and revise only affected preview sections where possible.",
        "If a changed file affects shared foundations, then update every preview section that depends on those foundations.",
        "Do not rebuild the entire preview page unless the current structure is no longer representative of the app.",
    ];
    if (changedFiles && changedFiles.length > 0) {
        strategies.unshift(`Prioritize these changed files: ${changedFiles.join(", ")}`);
    }
    else {
        strategies.unshift("If changed files are not provided, inspect git diff or the user's latest edits before deciding what to update.");
    }
    return strategies;
}
function buildWarnings(framework, changedFiles, discoveryGaps = []) {
    const warnings = [];
    if (framework.confirmationMessage) {
        warnings.push(framework.confirmationMessage);
    }
    if (!changedFiles || changedFiles.length === 0) {
        warnings.push("No changedFiles were provided. The agent should inspect git diff or recent edits when performing update_preview.");
    }
    warnings.push(...discoveryGaps);
    return warnings;
}
function buildInstructions(projectFacts, input, discoveryInstruction) {
    const lead = input.task === "update_preview"
        ? "Update the existing /preview route incrementally."
        : "Create the /preview route from scratch.";
    const userGoal = input.userGoal ? ` User goal: ${input.userGoal}.` : "";
    return `${lead}${userGoal} Read the app shell first, then global styles, then search for real component families and usage examples, then inspect component directories. After that, implement ${projectFacts.previewEntryFile} as a clean preview surface that supports both vertical and horizontal scanning when useful, includes a dedicated icon section when icons can be discovered, and renders colors as consistent swatches with 6-character hex labels plus click-to-copy behavior using a pointer cursor. ${discoveryInstruction}`;
}
function uniqueCompact(values) {
    return Array.from(new Set(values.filter(Boolean)));
}
function firstMatching(values, needle) {
    return values.find((value) => value === needle);
}
