import { readFile } from "fs/promises";
import { glob } from "glob";
import { basename, relative } from "path";
export async function scanComponents(projectRoot, scanDirs) {
    const patterns = scanDirs.map((dir) => `${dir}/**/*.{tsx,jsx,vue,svelte}`);
    const files = await glob(patterns, {
        cwd: projectRoot,
        absolute: true,
        ignore: [
            "**/node_modules/**",
            "**/dist/**",
            "**/build/**",
            "**/*.test.*",
            "**/*.spec.*",
            "**/*.stories.*",
        ],
    });
    const components = [];
    for (const file of files) {
        const content = await readFile(file, "utf-8");
        const relPath = relative(projectRoot, file);
        const fileName = basename(file).replace(/\.\w+$/, "");
        // Skip non-component files (utils, hooks, types, etc.)
        if (/^(use[A-Z]|index|types|utils|helpers|constants)/.test(fileName)) {
            // index files might be re-exports, check for JSX
            if (fileName === "index" && !hasJSX(content))
                continue;
            if (fileName !== "index")
                continue;
        }
        let exportType = "unknown";
        if (/export\s+default\s/.test(content)) {
            exportType = "default";
        }
        else if (/export\s+(function|const|class)\s/.test(content)) {
            exportType = "named";
        }
        // Only include files that contain JSX/template
        if (hasJSX(content) || file.endsWith(".vue") || file.endsWith(".svelte")) {
            components.push({
                name: fileName,
                filePath: relPath,
                exportType,
            });
        }
    }
    return components;
}
function hasJSX(content) {
    // Check for JSX return patterns
    return /return\s*\(?\s*</.test(content) || /<[A-Z][\w.]*/.test(content);
}
