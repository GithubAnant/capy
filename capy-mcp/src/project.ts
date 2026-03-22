import { glob } from "glob";
import { join } from "path";
import { fileExists, toPosixPath } from "./files.js";
import type { FrameworkInfo, ProjectFacts } from "./types.js";

export async function buildProjectFacts(
  projectRoot: string,
  framework: FrameworkInfo
): Promise<ProjectFacts> {
  const componentDirs = await findExistingDirectories(projectRoot, [
    "src/components",
    "src/ui",
    "src/features",
    "components",
    "ui",
    "features",
  ]);
  const pageDirs = await findExistingDirectories(projectRoot, [
    "src/app",
    "app",
    "src/pages",
    "pages",
    "src/routes",
    "routes",
  ]);
  const styleFiles = await findStyleFiles(projectRoot);

  const likelyUiDirs = Array.from(
    new Set([...componentDirs, ...pageDirs.filter((dir) => !dir.endsWith("/preview"))])
  );

  return {
    framework: framework.kind,
    routingStyle: framework.routingStyle,
    previewRoute: framework.previewRoute,
    previewEntryFile: framework.previewEntryFile,
    packageManager: framework.packageManager,
    likelyComponentDirs: componentDirs,
    likelyStyleFiles: styleFiles,
    likelyPageDirs: pageDirs,
    likelyUiDirs,
  };
}

async function findExistingDirectories(projectRoot: string, candidates: string[]): Promise<string[]> {
  const results: string[] = [];
  for (const candidate of candidates) {
    if (await fileExists(join(projectRoot, candidate))) {
      results.push(candidate);
    }
  }
  return results;
}

async function findStyleFiles(projectRoot: string): Promise<string[]> {
  const files = await glob(["**/*.{css,scss,sass,less}"], {
    cwd: projectRoot,
    nodir: true,
    ignore: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/.capy/**",
      "**/coverage/**",
    ],
  });

  return files
    .map((file) => toPosixPath(file))
    .filter((file) => !file.includes("/preview/"))
    .sort();
}
