import { basename, join } from "path";
import { glob } from "glob";
import { readText, toPosixPath } from "./files.js";
export async function buildComponentDiscoveryPlan(projectRoot, projectFacts) {
    const components = await scanForComponents(projectRoot, projectFacts);
    return {
        allDiscoveredComponents: components,
        prioritizedFiles: components.map((component) => component.path).slice(0, 12),
        discoveredFamilyFacts: buildDiscoveryFacts(components),
        missingFamilyGaps: components.length === 0
            ? [
                "No component candidates were discovered from known component/UI directories. Manually inspect src/components, components, src/ui, and src/features.",
            ]
            : [],
        instruction: buildInstruction(components),
    };
}
async function scanForComponents(projectRoot, projectFacts) {
    const searchDirs = Array.from(new Set([...projectFacts.likelyComponentDirs, ...projectFacts.likelyUiDirs]));
    if (searchDirs.length === 0) {
        return [];
    }
    const patterns = searchDirs.map((dir) => `${dir}/**/*.{ts,tsx,js,jsx}`);
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
            "**/.git/**",
            "**/.capy/**",
            "**/preview/**",
        ],
    });
    const discovered = [];
    for (const file of files.map((entry) => toPosixPath(entry)).sort()) {
        const contents = await readText(join(projectRoot, file));
        if (!contents)
            continue;
        const exports = extractExportCandidates(contents);
        if (exports.length === 0)
            continue;
        discovered.push({
            path: file,
            basename: basename(file).replace(/\.[^.]+$/, ""),
            exports,
        });
    }
    return discovered;
}
function extractExportCandidates(contents) {
    const names = new Set();
    const patterns = [
        /export\s+function\s+([A-Z][A-Za-z0-9_]*)/g,
        /export\s+const\s+([A-Z][A-Za-z0-9_]*)/g,
        /export\s+class\s+([A-Z][A-Za-z0-9_]*)/g,
        /export\s+default\s+function\s+([A-Z][A-Za-z0-9_]*)/g,
    ];
    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(contents)) !== null) {
            names.add(match[1]);
        }
    }
    return Array.from(names);
}
function buildDiscoveryFacts(components) {
    const byDir = new Map();
    for (const component of components) {
        const slash = component.path.lastIndexOf("/");
        const dir = slash === -1 ? "." : component.path.slice(0, slash);
        const existing = byDir.get(dir) ?? [];
        existing.push(component.exports[0] ?? component.basename);
        byDir.set(dir, existing);
    }
    return Array.from(byDir.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([dir, names]) => {
        const sample = names.slice(0, 5).join(", ");
        const more = names.length > 5 ? ` and ${names.length - 5} more` : "";
        return `${dir}/: ${sample}${more}.`;
    });
}
function buildInstruction(components) {
    if (components.length === 0) {
        return "Do component discovery manually in-repo. Traverse component/UI directories, treat PascalCase exports as candidates, and validate each candidate with at least one real usage path before adding it to /preview.";
    }
    const starters = components.slice(0, 6).map((component) => component.path).join(", ");
    return `Traverse component/UI directories and validate real usage before adding specimens. Start with ${starters}.`;
}
