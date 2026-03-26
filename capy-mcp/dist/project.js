import { basename, dirname } from "path";
import { glob } from "glob";
import { readText, toPosixPath } from "./files.js";
/**
 * Build project facts by actually scanning the filesystem instead of
 * checking a hardcoded list of candidate directories.
 *
 * Strategy: glob for all source files, read their exports, then classify
 * directories by what they contain rather than what they're named.
 */
export async function buildProjectFacts(projectRoot, framework, options = {}) {
    const sourceFiles = await glob(["**/*.{ts,tsx,js,jsx}"], {
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
            "**/.git/**",
            "**/.capy/**",
            "**/preview/**",
        ],
    });
    const normalized = sourceFiles.map((f) => toPosixPath(f));
    // Find page/route directories FIRST — we need these to exclude from component dirs
    const pageDirs = findPageDirs(normalized);
    // Scan files for PascalCase exports to find component directories
    // Exclude page dirs so route files don't inflate the component list
    const componentDirs = options.discoverComponents === false
        ? []
        : await findComponentDirs(projectRoot, normalized, pageDirs);
    // Find style files — already dynamic via glob
    const styleFiles = await findStyleFiles(projectRoot);
    // UI dirs = component dirs only (page dirs are routes, not reusable UI)
    const likelyUiDirs = Array.from(new Set([...componentDirs]));
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
/**
 * Find component directories by scanning .tsx/.jsx source files for
 * PascalCase exports that look like React components.
 *
 * Key rules:
 * - Only .tsx/.jsx files qualify (plain .ts/.js are utilities, not components)
 * - Files must contain JSX or React signals (not just any PascalCase export)
 * - Page/route directories are excluded (those are routes, not reusable UI)
 */
async function findComponentDirs(projectRoot, sourceFiles, pageDirs) {
    const dirComponentCount = new Map();
    for (const file of sourceFiles) {
        // Skip files at the root level (no directory)
        if (!file.includes("/"))
            continue;
        // Skip files inside page/route dirs — those are routes, not components
        const dir = dirname(file);
        if (isInsidePageDir(dir, pageDirs))
            continue;
        const ext = file.split(".").pop() ?? "";
        // ONLY check .tsx and .jsx files — plain .ts/.js are utilities/hooks/config
        if (ext !== "tsx" && ext !== "jsx")
            continue;
        // Skip common non-component page/route files by name
        const fileName = basename(file).replace(/\.[^.]+$/, "");
        if (isRouteFileName(fileName))
            continue;
        const contents = await readText(`${projectRoot}/${file}`);
        if (!contents)
            continue;
        // For .tsx/.jsx files, a PascalCase export is sufficient signal —
        // the file extension itself indicates component intent
        if (hasPascalCaseExport(contents)) {
            dirComponentCount.set(dir, (dirComponentCount.get(dir) ?? 0) + 1);
        }
    }
    if (dirComponentCount.size === 0)
        return [];
    const allDirs = Array.from(dirComponentCount.keys()).sort();
    return deduplicateToRoots(allDirs);
}
/**
 * Given a sorted list of directory paths, return the root-most directories.
 * "src/components/sections" is dropped if "src/components" is in the list.
 */
function deduplicateToRoots(sortedDirs) {
    const roots = [];
    for (const dir of sortedDirs) {
        const isChildOfExisting = roots.some((root) => dir.startsWith(root + "/"));
        if (!isChildOfExisting) {
            roots.push(dir);
        }
    }
    return roots;
}
/**
 * Find page/route directories by looking for routing convention markers
 * in the actual files instead of checking hardcoded paths.
 */
function findPageDirs(sourceFiles) {
    const pageDirSet = new Set();
    // Routing markers that indicate a directory is a page directory
    const routingMarkers = [
        "layout.tsx", "layout.ts", "layout.jsx", "layout.js",
        "page.tsx", "page.ts", "page.jsx", "page.js",
        "_app.tsx", "_app.ts", "_app.jsx", "_app.js",
        "_document.tsx", "_document.ts",
        "+page.svelte", "+layout.svelte",
    ];
    for (const file of sourceFiles) {
        const fileName = basename(file);
        if (routingMarkers.includes(fileName)) {
            const dir = dirname(file);
            // We want the top-level routing root, not every nested route
            // e.g. for "src/app/blog/page.tsx" we want "src/app"
            pageDirSet.add(dir);
        }
    }
    if (pageDirSet.size === 0)
        return [];
    // Find the root-level page dirs (e.g. "src/app" covers "src/app/blog")
    const sorted = Array.from(pageDirSet).sort();
    return deduplicateToRoots(sorted);
}
/**
 * Check if file contents contain a PascalCase export (function, const, or class).
 */
function hasPascalCaseExport(contents) {
    return /export\s+(?:default\s+)?(?:function|const|class)\s+[A-Z][A-Za-z0-9_]*/.test(contents);
}
/**
 * Check if a file looks like a React component (contains JSX or React imports).
 * This prevents pure utility files with PascalCase class exports from being
 * treated as components.
 */
function looksLikeComponent(contents) {
    // Contains JSX-like syntax: <Component, <div, <>, etc.
    if (/<[A-Za-z][A-Za-z0-9.]*[\s/>]/.test(contents))
        return true;
    if (/<>/.test(contents))
        return true;
    // Imports React or uses React APIs
    if (/from\s+['"]react['"]/.test(contents))
        return true;
    if (/React\.createElement/.test(contents))
        return true;
    return false;
}
/**
 * Check if a directory is inside (or equal to) any of the known page dirs.
 */
function isInsidePageDir(dir, pageDirs) {
    return pageDirs.some((pageDir) => dir === pageDir || dir.startsWith(pageDir + "/"));
}
/**
 * Common route/page filenames that should not be treated as components.
 */
function isRouteFileName(name) {
    const routeNames = new Set([
        "layout", "page", "loading", "error", "not-found",
        "template", "default", "route", "middleware",
        "_app", "_document", "_error",
    ]);
    return routeNames.has(name);
}
async function findStyleFiles(projectRoot) {
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
