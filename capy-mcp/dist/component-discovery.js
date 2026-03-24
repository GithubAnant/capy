import { basename, join } from "path";
import { glob } from "glob";
import { readText, toPosixPath } from "./files.js";
/**
 * Discover components by scanning the filesystem — no hardcoded family lists.
 *
 * Strategy:
 * 1. Glob for ALL source files within discovered component/UI dirs
 * 2. Extract PascalCase exports from each file
 * 3. Everything with a PascalCase export is a component
 * 4. Classify what we found into loose categories for the agent
 */
export async function buildComponentDiscoveryPlan(projectRoot, projectFacts) {
    const components = await scanForComponents(projectRoot, projectFacts);
    // Group components into loose categories for the agent's benefit
    const prioritizedFiles = components.map((c) => c.path).slice(0, 12);
    const discoveredFamilyFacts = buildDiscoveryFacts(components);
    const missingFamilyGaps = buildGaps(components);
    const instruction = buildInstruction(components, prioritizedFiles);
    return {
        allDiscoveredComponents: components,
        prioritizedFiles,
        discoveredFamilyFacts,
        missingFamilyGaps,
        instruction,
    };
}
/**
 * Scan the project for all files that export PascalCase identifiers.
 * Uses the dynamically-discovered component dirs from project.ts,
 * falls back to a broad scan if none were found.
 */
async function scanForComponents(projectRoot, projectFacts) {
    // Build glob patterns from discovered dirs
    const searchDirs = new Set([
        ...projectFacts.likelyComponentDirs,
        ...projectFacts.likelyUiDirs,
    ]);
    let patterns;
    if (searchDirs.size > 0) {
        patterns = Array.from(searchDirs).map((dir) => `${dir}/**/*.{ts,tsx,js,jsx}`);
    }
    else {
        // Fallback: scan everything if no dirs were discovered
        patterns = ["**/*.{ts,tsx,js,jsx}"];
    }
    const sourceFiles = await glob(patterns, {
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
    const components = [];
    for (const file of sourceFiles.map((f) => toPosixPath(f)).sort()) {
        const contents = (await readText(join(projectRoot, file))) ?? "";
        const exports = extractExportCandidates(contents);
        // A file is a component if it has at least one PascalCase export
        if (exports.length > 0) {
            components.push({
                path: file,
                basename: basename(file).replace(/\.[^.]+$/, ""),
                exports,
                contents,
            });
        }
    }
    return components;
}
/**
 * Build discovery facts — a short summary of what was found, organized
 * by directory structure rather than hardcoded families.
 */
function buildDiscoveryFacts(components) {
    if (components.length === 0)
        return [];
    // Group by directory
    const byDir = new Map();
    for (const comp of components) {
        const slashIndex = comp.path.lastIndexOf("/");
        const dir = slashIndex === -1 ? "." : comp.path.slice(0, slashIndex);
        if (!byDir.has(dir))
            byDir.set(dir, []);
        byDir.get(dir).push(comp.exports[0] ?? comp.basename);
    }
    const facts = [];
    for (const [dir, names] of byDir) {
        const listed = names.slice(0, 5).join(", ");
        const suffix = names.length > 5 ? ` and ${names.length - 5} more` : "";
        facts.push(`${dir}/: ${listed}${suffix}.`);
    }
    return facts.slice(0, 8);
}
/**
 * Build gap notes — only warn about genuinely concerning gaps,
 * not prescriptive "you should have inputs" type warnings.
 */
function buildGaps(components) {
    const gaps = [];
    if (components.length === 0) {
        gaps.push("No components were discovered. The scanner found no files with PascalCase exports in the project. You should manually search src/, components/, ui/, features/, lib/, or similar directories to find UI code.");
    }
    return gaps;
}
/**
 * Build the instruction string for the agent — tell it how to traverse
 * and find things rather than listing specific things to look for.
 */
function buildInstruction(components, prioritizedFiles) {
    const traversalGuide = "Traverse the repo's component directories. Every file that exports a PascalCase identifier is a component. Read real usage of each component before building /preview sections. If a component looks like a page section, group it under 'Feature or Page Sections'. If it is a small reusable primitive, group it under the appropriate UI category.";
    const usageGuide = "Use actual component files and real usage examples. If you only find hooks or providers, trace one real usage path and mirror that behavior in /preview instead of inventing a fake specimen.";
    const placementGuide = "Place every component you find into the preview layout based on its actual role. If something does not fit a standard category, create a section for it. Do not invent components that don't exist in the repo, and do not omit components that do.";
    if (prioritizedFiles.length === 0) {
        return `${traversalGuide} ${usageGuide} ${placementGuide}`;
    }
    return `${traversalGuide} Start with ${prioritizedFiles.slice(0, 6).join(", ")}. ${usageGuide} ${placementGuide}`;
}
function extractExportCandidates(contents) {
    const exportNames = new Set();
    const patterns = [
        /export\s+function\s+([A-Z][A-Za-z0-9_]*)/g,
        /export\s+const\s+([A-Z][A-Za-z0-9_]*)/g,
        /export\s+class\s+([A-Z][A-Za-z0-9_]*)/g,
        /export\s+default\s+function\s+([A-Z][A-Za-z0-9_]*)/g,
    ];
    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(contents)) !== null) {
            exportNames.add(match[1]);
        }
    }
    return Array.from(exportNames);
}
