import { readFile } from "fs/promises";
import { glob } from "glob";
import { resolve } from "path";
import { pathToFileURL } from "url";
function flattenObject(obj, prefix = "") {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        const path = prefix ? `${prefix}-${key}` : key;
        if (typeof value === "string") {
            result[path] = value;
        }
        else if (typeof value === "object" && value !== null) {
            Object.assign(result, flattenObject(value, path));
        }
    }
    return result;
}
export async function scanTailwind(projectRoot) {
    const result = { colors: [], spacing: [], typography: [] };
    const configFiles = await glob("tailwind.config.{js,ts,mjs,cjs}", {
        cwd: projectRoot,
        absolute: true,
    });
    if (configFiles.length === 0) {
        // Try v4: check for @theme in CSS files
        return scanTailwindV4(projectRoot, result);
    }
    const configPath = configFiles[0];
    try {
        let config;
        if (configPath.endsWith(".ts")) {
            // For TS configs, read the file and try to extract the object
            const content = await readFile(configPath, "utf-8");
            config = extractConfigFromSource(content);
        }
        else {
            // For JS configs, use dynamic import
            const fileUrl = pathToFileURL(resolve(configPath)).href;
            const mod = await import(fileUrl);
            config = mod.default || mod;
        }
        const theme = (config.theme || {});
        const extend = (theme.extend || {});
        // Colors
        const colors = {
            ...(flattenObject((theme.colors || {}))),
            ...(flattenObject((extend.colors || {}))),
        };
        for (const [name, value] of Object.entries(colors)) {
            result.colors.push({ name, value, source: "tailwind" });
        }
        // Spacing
        const spacing = {
            ...(flattenObject((theme.spacing || {}))),
            ...(flattenObject((extend.spacing || {}))),
        };
        for (const [name, value] of Object.entries(spacing)) {
            result.spacing.push({ name, value, source: "tailwind" });
        }
        // Typography (fontFamily, fontSize)
        const fontFamily = {
            ...(flattenObject((theme.fontFamily || {}))),
            ...(flattenObject((extend.fontFamily || {}))),
        };
        for (const [name, value] of Object.entries(fontFamily)) {
            const val = Array.isArray(value) ? value.join(", ") : value;
            result.typography.push({ name: `font-${name}`, value: String(val), source: "tailwind" });
        }
        const fontSize = {
            ...(flattenObject((theme.fontSize || {}))),
            ...(flattenObject((extend.fontSize || {}))),
        };
        for (const [name, value] of Object.entries(fontSize)) {
            result.typography.push({ name: `text-${name}`, value, source: "tailwind" });
        }
    }
    catch {
        // Config couldn't be parsed, return empty
    }
    return result;
}
async function scanTailwindV4(projectRoot, result) {
    // Tailwind v4 uses @theme in CSS files
    const cssFiles = await glob("**/*.css", {
        cwd: projectRoot,
        absolute: true,
        ignore: ["**/node_modules/**", "**/dist/**", "**/build/**"],
    });
    for (const file of cssFiles) {
        const content = await readFile(file, "utf-8");
        // Match @theme { ... } blocks
        const themeMatch = content.match(/@theme\s*\{([^}]+)\}/g);
        if (!themeMatch)
            continue;
        for (const block of themeMatch) {
            const inner = block.replace(/@theme\s*\{/, "").replace(/\}$/, "");
            const varRegex = /--([\w-]+)\s*:\s*([^;]+);/g;
            let match;
            while ((match = varRegex.exec(inner)) !== null) {
                const [, name, value] = match;
                const trimmed = value.trim();
                if (name.startsWith("color") || trimmed.startsWith("#") || trimmed.startsWith("rgb") || trimmed.startsWith("hsl") || trimmed.startsWith("oklch")) {
                    result.colors.push({ name: name, value: trimmed, source: "tailwind" });
                }
                else if (name.startsWith("spacing") || name.startsWith("size")) {
                    result.spacing.push({ name: name, value: trimmed, source: "tailwind" });
                }
                else if (name.startsWith("font") || name.startsWith("text") || name.startsWith("leading") || name.startsWith("tracking")) {
                    result.typography.push({ name: name, value: trimmed, source: "tailwind" });
                }
            }
        }
    }
    return result;
}
function extractConfigFromSource(content) {
    // Basic extraction: find the object literal in the default export
    // This won't work for complex configs but handles simple ones
    const match = content.match(/export\s+default\s+(\{[\s\S]*\})/);
    if (match) {
        try {
            // Very naive: try JSON-ish parse (won't work for function values)
            const cleaned = match[1]
                .replace(/\/\/.*$/gm, "")
                .replace(/,\s*([}\]])/g, "$1");
            return JSON.parse(cleaned);
        }
        catch {
            return {};
        }
    }
    return {};
}
