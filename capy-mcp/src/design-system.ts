import { glob } from "glob";
import { basename, join } from "path";
import { buildPreviewBrief } from "./brief.js";
import { buildComponentDiscoveryPlan } from "./component-discovery.js";
import { readText, toPosixPath, writeText } from "./files.js";
import { detectFramework } from "./framework.js";
import { buildProjectFacts } from "./project.js";
import type {
  ComponentRecord,
  CssVariableRecord,
  DesignSystemArtifact,
  DesignSystemBuildInput,
  ProjectFacts,
} from "./types.js";

const DEFAULT_ARTIFACT_PATH = ".capy/design-system.json";

export async function buildDesignSystemArtifact(
  projectRoot: string,
  input: DesignSystemBuildInput = {}
): Promise<DesignSystemArtifact> {
  const framework = await detectFramework(projectRoot);
  const projectFacts = await buildProjectFacts(projectRoot, framework);
  const discoveryPlan = await buildComponentDiscoveryPlan(projectRoot, projectFacts);
  const previewBrief = await buildPreviewBrief(projectRoot, {
    task: input.mode === "update" ? "update_preview" : "build_preview",
    changedFiles: input.changedFiles,
    userGoal: input.userGoal,
  });
  const cssVariables = await collectCssVariables(projectRoot, projectFacts.likelyStyleFiles);
  const components = await collectComponents(projectRoot, projectFacts);
  const readFirst = buildReadFirst(previewBrief, components, discoveryPlan.prioritizedFiles);
  const bridges = await buildUsageBridges(projectRoot, projectFacts.likelyStyleFiles, components);
  const gaps = buildGapNotes(projectFacts, components, cssVariables, discoveryPlan.missingFamilyGaps);
  const artifactPath = input.artifactPath ?? DEFAULT_ARTIFACT_PATH;

  return {
    forAgent: {
      intent:
        input.mode === "update"
          ? "Update /preview incrementally. Read the files below first, then touch only the sections affected by the changed files unless shared foundations changed."
          : "Build or refine /preview. Read the files below first, then mirror the repo's existing UI language instead of inventing a new one.",
      readFirst,
      facts: buildAgentFacts(projectFacts, components, cssVariables, discoveryPlan.discoveredFamilyFacts),
      bridges,
      gaps,
      updateHints: previewBrief.updateStrategy,
    },
    artifact: {
      generatedAt: new Date().toISOString(),
      mode: input.mode ?? "build",
      artifactPath,
      changedFiles: input.changedFiles ?? [],
    },
    repo: {
      framework: framework.kind,
      routingStyle: framework.routingStyle,
      previewRoute: framework.previewRoute,
      previewEntryFile: framework.previewEntryFile,
      packageManager: framework.packageManager,
    },
    scan: {
      componentDirs: projectFacts.likelyComponentDirs,
      pageDirs: projectFacts.likelyPageDirs,
      styleFiles: projectFacts.likelyStyleFiles,
      uiDirs: projectFacts.likelyUiDirs,
    },
    tokens: {
      cssVariables,
      themeSourceFiles: projectFacts.likelyStyleFiles,
    },
    components: {
      count: components.length,
      items: components,
    },
    preview: {
      route: projectFacts.previewRoute,
      entryFile: projectFacts.previewEntryFile,
      sections: previewBrief.deliverableSpec.sections,
      updateStrategy: previewBrief.updateStrategy,
    },
  };
}

export async function writeDesignSystemArtifact(
  projectRoot: string,
  input: DesignSystemBuildInput = {}
): Promise<DesignSystemArtifact> {
  const artifact = await buildDesignSystemArtifact(projectRoot, input);
  const artifactFile = join(projectRoot, artifact.artifact.artifactPath);
  await writeText(artifactFile, `${JSON.stringify(artifact, null, 2)}\n`);
  return artifact;
}

async function collectCssVariables(
  projectRoot: string,
  styleFiles: string[]
): Promise<CssVariableRecord[]> {
  const variables: CssVariableRecord[] = [];

  for (const relativePath of styleFiles) {
    const fileContents = await readText(join(projectRoot, relativePath));
    if (!fileContents) continue;

    const regex = /--([A-Za-z0-9-_]+)\s*:\s*([^;}{]+);/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(fileContents)) !== null) {
      variables.push({
        name: `--${match[1]}`,
        value: match[2].trim(),
        category: classifyCssVariable(match[1]),
        file: relativePath,
        line: lineNumberAt(fileContents, match.index),
      });
    }
  }

  return variables;
}

async function collectComponents(
  projectRoot: string,
  projectFacts: ProjectFacts
): Promise<ComponentRecord[]> {
  if (projectFacts.likelyComponentDirs.length === 0) {
    return [];
  }

  const patterns = projectFacts.likelyComponentDirs.map((dir) => `${dir}/**/*.{tsx,jsx,ts,js}`);
  const files = await glob(patterns, {
    cwd: projectRoot,
    nodir: true,
    ignore: [
      "**/*.test.*",
      "**/*.spec.*",
      "**/*.stories.*",
      "**/*.story.*",
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/preview/**",
    ],
  });

  const componentRecords = await Promise.all(
    files
      .map((file) => toPosixPath(file))
      .sort()
      .map(async (relativePath) => {
        const contents = await readText(join(projectRoot, relativePath));
        const exports = contents ? extractExports(contents) : [];
        const fallbackName = basename(relativePath).replace(/\.[^.]+$/, "");

        return {
          name: exports[0] ?? fallbackName,
          path: relativePath,
          exports,
          kind: classifyComponentKind(relativePath),
        } satisfies ComponentRecord;
      })
  );

  return componentRecords;
}

function extractExports(contents: string): string[] {
  const exports = new Set<string>();
  const patterns = [
    /export\s+function\s+([A-Z][A-Za-z0-9_]*)/g,
    /export\s+const\s+([A-Z][A-Za-z0-9_]*)/g,
    /export\s+class\s+([A-Z][A-Za-z0-9_]*)/g,
    /export\s+default\s+function\s+([A-Z][A-Za-z0-9_]*)/g,
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(contents)) !== null) {
      exports.add(match[1]);
    }
  }

  return Array.from(exports);
}

function classifyComponentKind(relativePath: string): ComponentRecord["kind"] {
  if (relativePath.includes("/features/")) return "feature";
  if (relativePath.includes("/ui/")) return "primitive";
  if (relativePath.includes("/components/")) return "component";
  return "unknown";
}

function classifyCssVariable(name: string): CssVariableRecord["category"] {
  if (/(color|bg|text|border|surface|accent|primary|secondary|foreground)/i.test(name)) {
    return "color";
  }
  if (/(font|type|text|leading|tracking|heading|body)/i.test(name)) {
    return "typography";
  }
  if (/(space|spacing|gap|radius|shadow|size|width|height)/i.test(name)) {
    return "layout";
  }
  return "other";
}

function lineNumberAt(contents: string, index: number): number {
  return contents.slice(0, index).split("\n").length;
}

function buildReadFirst(
  previewBrief: Awaited<ReturnType<typeof buildPreviewBrief>>,
  components: ComponentRecord[],
  prioritizedFiles: string[]
): DesignSystemArtifact["forAgent"]["readFirst"] {
  const seen = new Set<string>();
  const readFirst: DesignSystemArtifact["forAgent"]["readFirst"] = [];
  const firstComponentByDir = new Map<string, string>();

  for (const component of components) {
    const slashIndex = component.path.lastIndexOf("/");
    if (slashIndex === -1) continue;
    const directory = component.path.slice(0, slashIndex);
    if (!firstComponentByDir.has(directory)) {
      firstComponentByDir.set(directory, component.path);
    }
  }

  for (const step of previewBrief.inspectionPlan.slice(0, 2)) {
    for (const target of step.targets) {
      if (!looksLikeProjectPath(target)) continue;
      const normalizedTarget = firstComponentByDir.get(target) ?? target;
      if (seen.has(normalizedTarget)) continue;
      seen.add(normalizedTarget);
      readFirst.push({
        path: normalizedTarget,
        reason: step.reason,
      });
      if (readFirst.length >= 8) {
        return readFirst;
      }
    }
  }

  for (const prioritizedFile of prioritizedFiles) {
    if (seen.has(prioritizedFile)) continue;
    seen.add(prioritizedFile);
    readFirst.push({
      path: prioritizedFile,
      reason: "Likely reusable primitive or usage example. Read this before inventing preview-only specimens.",
    });
    if (readFirst.length >= 8) {
      return readFirst;
    }
  }

  for (const step of previewBrief.inspectionPlan.slice(2)) {
    for (const target of step.targets) {
      if (!looksLikeProjectPath(target)) continue;
      const normalizedTarget = firstComponentByDir.get(target) ?? target;
      if (seen.has(normalizedTarget)) continue;
      seen.add(normalizedTarget);
      readFirst.push({
        path: normalizedTarget,
        reason: step.reason,
      });
      if (readFirst.length >= 8) {
        return readFirst;
      }
    }
  }

  return readFirst;
}

function buildAgentFacts(
  projectFacts: ProjectFacts,
  components: ComponentRecord[],
  cssVariables: CssVariableRecord[],
  discoveredFamilyFacts: string[]
): string[] {
  return [
    `Use ${projectFacts.framework} conventions.`,
    `Implement /preview at ${projectFacts.previewEntryFile}.`,
    "Use repo-relative paths only.",
    `Found ${components.length} component candidates and ${cssVariables.length} CSS variables.`,
    ...discoveredFamilyFacts,
  ];
}

function buildGapNotes(
  projectFacts: ProjectFacts,
  components: ComponentRecord[],
  cssVariables: CssVariableRecord[],
  discoveryGaps: string[]
): string[] {
  const gaps: string[] = [...discoveryGaps];

  if (components.length === 0) {
    gaps.push(
      "No components were detected. Grep src/components, src/ui, src/features, components, ui, or features before assuming the app has no reusable UI."
    );
  }

  if (cssVariables.length === 0 && projectFacts.likelyStyleFiles.length > 0) {
    gaps.push(
      `No CSS variables were detected. Read ${projectFacts.likelyStyleFiles[0]} directly and look for literal classes, theme config, or inline color tokens.`
    );
  }

  if (projectFacts.likelyStyleFiles.length === 0) {
    gaps.push("No global style files were detected. Inspect app shell files and component code directly for layout and color usage.");
  }

  return gaps;
}

async function buildUsageBridges(
  projectRoot: string,
  styleFiles: string[],
  components: ComponentRecord[]
): Promise<string[]> {
  const bridges: string[] = [];

  for (const relativePath of styleFiles) {
    const fileContents = await readText(join(projectRoot, relativePath));
    if (!fileContents) continue;

    if (fileContents.includes("hsl(var(--")) {
      bridges.push(`Theme tokens are bridged through hsl(var(--...)) in ${relativePath}.`);
      break;
    }
  }

  const hexByFile = await collectHexLiterals(projectRoot, components);
  for (const [path, hexValues] of hexByFile.slice(0, 3)) {
    bridges.push(`Literal accents also appear in ${path}: ${hexValues.join(", ")}.`);
  }

  return bridges;
}

async function collectHexLiterals(
  projectRoot: string,
  components: ComponentRecord[]
): Promise<Array<[string, string[]]>> {
  const matches: Array<[string, string[]]> = [];

  for (const component of components) {
    const contents = await readText(join(projectRoot, component.path));
    if (!contents) continue;

    const hexMatches = Array.from(contents.matchAll(/#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g))
      .map((match) => normalizeHex(match[0]))
      .filter((value, index, values) => values.indexOf(value) === index);

    if (hexMatches.length > 0) {
      matches.push([component.path, hexMatches.slice(0, 4)]);
    }
  }

  return matches;
}

function normalizeHex(hex: string): string {
  const normalized = hex.replace("#", "").toUpperCase();
  if (normalized.length === 3) {
    return `#${normalized
      .split("")
      .map((char) => `${char}${char}`)
      .join("")}`;
  }
  return `#${normalized}`;
}

function looksLikeProjectPath(target: string): boolean {
  return target.includes("/") || /^[A-Za-z0-9._-]+\.(?:tsx|ts|jsx|js|css|scss|sass|less)$/.test(target);
}
