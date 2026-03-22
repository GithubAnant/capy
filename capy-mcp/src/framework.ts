import { join } from "path";
import type { FrameworkInfo } from "./types.js";
import { fileExists, readText } from "./files.js";

interface PackageJsonLike {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  packageManager?: string;
}

export async function detectFramework(projectRoot: string): Promise<FrameworkInfo> {
  const packageJson = await loadPackageJson(projectRoot);
  const deps = {
    ...packageJson?.dependencies,
    ...packageJson?.devDependencies,
  };

  const hasNext = Boolean(deps.next);
  const hasReact = Boolean(deps.react);
  const hasReactRouter = Boolean(deps["react-router-dom"]);

  const srcAppDir = join(projectRoot, "src/app");
  const appDir = join(projectRoot, "app");
  const srcPagesDir = join(projectRoot, "src/pages");
  const pagesDir = join(projectRoot, "pages");

  if (hasNext && (await fileExists(srcAppDir))) {
    return {
      kind: "next-app-router",
      label: "Next.js App Router",
      routingStyle: "app-router",
      previewRoute: "/preview",
      previewEntryFile: "src/app/preview/page.tsx",
      packageManager: detectPackageManager(packageJson?.packageManager),
      needsConfirmation: false,
    };
  }

  if (hasNext && (await fileExists(appDir))) {
    return {
      kind: "next-app-router",
      label: "Next.js App Router",
      routingStyle: "app-router",
      previewRoute: "/preview",
      previewEntryFile: "app/preview/page.tsx",
      packageManager: detectPackageManager(packageJson?.packageManager),
      needsConfirmation: false,
    };
  }

  if (hasNext && (await fileExists(srcPagesDir))) {
    return {
      kind: "next-pages-router",
      label: "Next.js Pages Router",
      routingStyle: "pages-router",
      previewRoute: "/preview",
      previewEntryFile: "src/pages/preview.tsx",
      packageManager: detectPackageManager(packageJson?.packageManager),
      needsConfirmation: false,
    };
  }

  if (hasNext && (await fileExists(pagesDir))) {
    return {
      kind: "next-pages-router",
      label: "Next.js Pages Router",
      routingStyle: "pages-router",
      previewRoute: "/preview",
      previewEntryFile: "pages/preview.tsx",
      packageManager: detectPackageManager(packageJson?.packageManager),
      needsConfirmation: false,
    };
  }

  if (hasReact && hasReactRouter) {
    return {
      kind: "react-router",
      label: "React + React Router",
      routingStyle: "react-router",
      previewRoute: "/preview",
      previewEntryFile: "src/routes/preview.tsx",
      packageManager: detectPackageManager(packageJson?.packageManager),
      needsConfirmation: false,
    };
  }

  if (hasReact) {
    return {
      kind: "react-no-router",
      label: "React without router",
      routingStyle: "none",
      previewRoute: "/preview",
      previewEntryFile: "src/routes/preview.tsx",
      packageManager: detectPackageManager(packageJson?.packageManager),
      needsConfirmation: true,
      confirmationMessage:
        "This repo looks like React without react-router-dom. The agent should confirm router setup before implementing /preview.",
    };
  }

  return {
    kind: "unknown",
    label: "Unknown framework",
    routingStyle: "unknown",
    previewRoute: "/preview",
    previewEntryFile: "preview-entry-file-unknown",
    packageManager: detectPackageManager(packageJson?.packageManager),
    needsConfirmation: true,
    confirmationMessage:
      "Framework detection was inconclusive. The agent should inspect routing manually before building /preview.",
  };
}

async function loadPackageJson(projectRoot: string): Promise<PackageJsonLike | null> {
  const raw = await readText(join(projectRoot, "package.json"));
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PackageJsonLike;
  } catch {
    return null;
  }
}

function detectPackageManager(packageManager?: string): FrameworkInfo["packageManager"] {
  if (!packageManager) return "npm";
  if (packageManager.startsWith("pnpm")) return "pnpm";
  if (packageManager.startsWith("yarn")) return "yarn";
  if (packageManager.startsWith("bun")) return "bun";
  return "npm";
}
