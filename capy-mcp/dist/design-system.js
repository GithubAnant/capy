import { glob } from "glob";
import { basename, join } from "path";
import { buildComponentDiscoveryPlan } from "./component-discovery.js";
import { readText, toPosixPath, writeText } from "./files.js";
import { detectFramework } from "./framework.js";
import { buildProjectFacts } from "./project.js";
const DEFAULT_ARTIFACT_PATH = ".capy/design-system.json";
export async function buildDesignSystemArtifact(projectRoot, input = {}) {
    const framework = await detectFramework(projectRoot);
    const projectFacts = await buildProjectFacts(projectRoot, framework);
    const discoveryPlan = await buildComponentDiscoveryPlan(projectRoot, projectFacts);
    const cssVariables = await collectCssVariables(projectRoot, projectFacts.likelyStyleFiles);
    const components = await collectComponents(projectRoot, projectFacts);
    const artifactPath = input.artifactPath ?? DEFAULT_ARTIFACT_PATH;
    return {
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
            discoveredFamilies: discoveryPlan.discoveredFamilyFacts,
        },
        tokens: {
            cssVariables,
            themeSourceFiles: projectFacts.likelyStyleFiles,
        },
        components: {
            count: components.length,
            items: components,
        },
    };
}
export async function writeDesignSystemArtifact(projectRoot, input = {}) {
    const artifact = await buildDesignSystemArtifact(projectRoot, input);
    const artifactFile = join(projectRoot, artifact.artifact.artifactPath);
    await writeText(artifactFile, `${JSON.stringify(artifact, null, 2)}\n`);
    return artifact;
}
async function collectCssVariables(projectRoot, styleFiles) {
    const variables = [];
    for (const relativePath of styleFiles) {
        const fileContents = await readText(join(projectRoot, relativePath));
        if (!fileContents)
            continue;
        const regex = /--([A-Za-z0-9-_]+)\s*:\s*([^;}{]+);/g;
        let match;
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
async function collectComponents(projectRoot, projectFacts) {
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
    const componentRecords = await Promise.all(files
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
        };
    }));
    return componentRecords;
}
function extractExports(contents) {
    const exports = new Set();
    const patterns = [
        /export\s+function\s+([A-Z][A-Za-z0-9_]*)/g,
        /export\s+const\s+([A-Z][A-Za-z0-9_]*)/g,
        /export\s+class\s+([A-Z][A-Za-z0-9_]*)/g,
        /export\s+default\s+function\s+([A-Z][A-Za-z0-9_]*)/g,
    ];
    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(contents)) !== null) {
            exports.add(match[1]);
        }
    }
    return Array.from(exports);
}
function classifyComponentKind(relativePath) {
    if (relativePath.includes("/features/"))
        return "feature";
    if (relativePath.includes("/ui/"))
        return "primitive";
    if (relativePath.includes("/components/"))
        return "component";
    return "unknown";
}
function classifyCssVariable(name) {
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
function lineNumberAt(contents, index) {
    return contents.slice(0, index).split("\n").length;
}
