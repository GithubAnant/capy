import { join, relative } from "path";
import type {
  CapyArtifactState,
  CapyConfig,
  DesignSystem,
  DesignSystemArtifactResult,
} from "./types.js";
import {
  ensureDir,
  fileExists,
  hashContent,
  readText,
  stableStringify,
  toPosixPath,
  writeTextIfChanged,
} from "./files.js";

export interface CapyArtifactPaths {
  artifactsDir: string;
  generatedDir: string;
  designSystemPath: string;
  statePath: string;
  examplesPath: string;
}

export function getArtifactPaths(
  projectRoot: string,
  config: CapyConfig
): CapyArtifactPaths {
  const artifactsDir = join(projectRoot, config.artifactsDir);
  return {
    artifactsDir,
    generatedDir: join(artifactsDir, "generated"),
    designSystemPath: join(artifactsDir, "design-system.json"),
    statePath: join(artifactsDir, "state.json"),
    examplesPath: join(artifactsDir, "examples.ts"),
  };
}

export async function ensureArtifactsStructure(
  projectRoot: string,
  config: CapyConfig
): Promise<CapyArtifactPaths> {
  const paths = getArtifactPaths(projectRoot, config);
  await Promise.all([ensureDir(paths.artifactsDir), ensureDir(paths.generatedDir)]);
  await ensureExamplesTemplate(projectRoot, config);
  return paths;
}

export async function persistDesignSystemArtifact(
  projectRoot: string,
  config: CapyConfig,
  designSystem: DesignSystem
): Promise<DesignSystemArtifactResult> {
  const paths = getArtifactPaths(projectRoot, config);
  await ensureDir(paths.artifactsDir);
  const payload = `${stableStringify(designSystem)}\n`;
  const writeResult = await writeTextIfChanged(paths.designSystemPath, payload);
  return {
    status: writeResult.changed ? "updated" : "unchanged",
    path: paths.designSystemPath,
    summary: {
      colors: designSystem.colors.length,
      typography: designSystem.typography.length,
      spacing: designSystem.spacing.length,
      components: designSystem.components.length,
      cssVariables: designSystem.cssVariables.length,
    },
  };
}

export async function loadArtifactState(
  projectRoot: string,
  config: CapyConfig
): Promise<CapyArtifactState | null> {
  const { statePath } = getArtifactPaths(projectRoot, config);
  const raw = await readText(statePath);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as CapyArtifactState;
  } catch {
    return null;
  }
}

export async function writeArtifactState(
  projectRoot: string,
  config: CapyConfig,
  state: CapyArtifactState
): Promise<void> {
  const { statePath } = getArtifactPaths(projectRoot, config);
  await ensureDir(join(projectRoot, config.artifactsDir));
  await writeTextIfChanged(statePath, `${stableStringify(state)}\n`);
}

export async function ensureExamplesTemplate(
  projectRoot: string,
  config: CapyConfig
): Promise<void> {
  const { examplesPath } = getArtifactPaths(projectRoot, config);
  if (await fileExists(examplesPath)) return;

  const template = `import type { ComponentType, ReactNode } from "react";

export interface CapyExampleEntry {
  props?: Record<string, unknown>;
  disabled?: boolean;
  notes?: string[];
  render?: (Component: ComponentType<any>) => ReactNode;
}

// This file is yours. Capy never overwrites it after the first scaffold.
// Add demo props or custom render wrappers for components that need real-ish data.
export const capyExamples: Record<string, CapyExampleEntry> = {
  // Button: {
  //   props: { children: "Save changes", variant: "primary" },
  // },
};
`;

  await writeTextIfChanged(examplesPath, template);
}

export function buildArtifactIgnorePatterns(
  projectRoot: string,
  config: CapyConfig,
  previewRoutePath?: string
): string[] {
  const base = [
    `${config.artifactsDir}/design-system.json`,
    `${config.artifactsDir}/generated`,
    `${config.artifactsDir}/state.json`,
  ];

  if (!previewRoutePath) {
    return base;
  }

  const relativePreviewPath = toPosixPath(relative(projectRoot, previewRoutePath));
  return [...base, relativePreviewPath];
}

export function buildStateHashes(entries: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(entries).map(([key, value]) => [key, hashContent(value)])
  );
}
