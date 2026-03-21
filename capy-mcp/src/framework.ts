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
      route: "/preview",
      routeDir: join(srcAppDir, "preview"),
      routeFile: join(srcAppDir, "preview/page.tsx"),
      previewImportPrefix: "../../../",
      needsConfirmation: false,
      packageManager: detectPackageManager(packageJson?.packageManager),
    };
  }

  if (hasNext && (await fileExists(appDir))) {
    return {
      kind: "next-app-router",
      label: "Next.js App Router",
      route: "/preview",
      routeDir: join(appDir, "preview"),
      routeFile: join(appDir, "preview/page.tsx"),
      previewImportPrefix: "../../",
      needsConfirmation: false,
      packageManager: detectPackageManager(packageJson?.packageManager),
    };
  }

  if (hasNext && (await fileExists(srcPagesDir))) {
    return {
      kind: "next-pages-router",
      label: "Next.js Pages Router",
      route: "/preview",
      routeDir: join(srcPagesDir),
      routeFile: join(srcPagesDir, "preview.tsx"),
      previewImportPrefix: "../../",
      needsConfirmation: false,
      packageManager: detectPackageManager(packageJson?.packageManager),
    };
  }

  if (hasNext && (await fileExists(pagesDir))) {
    return {
      kind: "next-pages-router",
      label: "Next.js Pages Router",
      route: "/preview",
      routeDir: join(pagesDir),
      routeFile: join(pagesDir, "preview.tsx"),
      previewImportPrefix: "../",
      needsConfirmation: false,
      packageManager: detectPackageManager(packageJson?.packageManager),
    };
  }

  if (hasReact && hasReactRouter) {
    return {
      kind: "react-router",
      label: "React + React Router",
      route: "/preview",
      needsConfirmation: false,
      packageManager: detectPackageManager(packageJson?.packageManager),
    };
  }

  if (hasReact) {
    return {
      kind: "react-no-router",
      label: "React without router",
      route: "/preview",
      needsConfirmation: true,
      confirmationMessage:
        "React Router is required to mount /preview. Confirm adding react-router-dom before generating the route.",
      packageManager: detectPackageManager(packageJson?.packageManager),
    };
  }

  return {
    kind: "unknown",
    label: "Unknown framework",
    route: "/preview",
    needsConfirmation: true,
    confirmationMessage:
      "Capy currently generates live /preview routes for Next.js and React projects. Framework detection failed for this repo.",
    packageManager: detectPackageManager(packageJson?.packageManager),
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
