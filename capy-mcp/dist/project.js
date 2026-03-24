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
export async function buildProjectFacts(projectRoot, framework) {
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
    // Scan files for PascalCase exports to find component directories
    const componentDirs = await findComponentDirs(projectRoot, normalized);
    // Find page/route directories by looking for routing markers
    const pageDirs = findPageDirs(normalized);
    // Find style files — already dynamic via glob
    const styleFiles = await findStyleFiles(projectRoot);
    // UI dirs = union of component + page dirs
    const likelyUiDirs = Array.from(new Set([...componentDirs, ...pageDirs.filter((dir) => !dir.endsWith("/preview"))]));
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
 * Find component directories by scanning source files for PascalCase exports.
 * A directory is a "component dir" if it contains ≥1 file with a PascalCase export.
 * We deduplicate to the shallowest ancestor that qualifies.
 */
async function findComponentDirs(projectRoot, sourceFiles) {
    const dirComponentCount = new Map();
    for (const file of sourceFiles) {
        // Skip files at the root level (no directory)
        if (!file.includes("/"))
            continue;
        const ext = file.split(".").pop() ?? "";
        // Only check .tsx and .jsx files — those are almost always components
        // Also check .ts/.js but require a PascalCase filename as extra signal
        const isTsxJsx = ext === "tsx" || ext === "jsx";
        const fileName = basename(file).replace(/\.[^.]+$/, "");
        const isPascalFileName = /^[A-Z][a-zA-Z0-9]*$/.test(fileName);
        if (!isTsxJsx && !isPascalFileName)
            continue;
        const contents = await readText(`${projectRoot}/${file}`);
        if (!contents)
            continue;
        if (hasPascalCaseExport(contents)) {
            const dir = dirname(file);
            dirComponentCount.set(dir, (dirComponentCount.get(dir) ?? 0) + 1);
        }
    }
    if (dirComponentCount.size === 0)
        return [];
    // Collect all dirs that have components
    const allDirs = Array.from(dirComponentCount.keys()).sort();
    // Deduplicate: if both "src/components" and "src/components/sections" exist,
    // keep the parent "src/components" (the child is already covered by glob patterns).
    // But also keep the child if the parent has 0 direct components (e.g. parent is
    // just an organizer directory).
    const roots = deduplicateToRoots(allDirs);
    return roots;
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
