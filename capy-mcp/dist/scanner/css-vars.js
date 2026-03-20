import { readFile } from "fs/promises";
import { glob } from "glob";
import { relative } from "path";
export async function scanCSSVariables(projectRoot, scanDirs) {
    const result = {
        cssVariables: [],
        colors: [],
        spacing: [],
        typography: [],
    };
    const patterns = scanDirs.map((dir) => `${dir}/**/*.css`);
    const files = await glob(patterns, {
        cwd: projectRoot,
        absolute: true,
        ignore: ["**/node_modules/**", "**/dist/**", "**/build/**"],
    });
    // Also check root-level CSS files
    const rootCSS = await glob("*.css", {
        cwd: projectRoot,
        absolute: true,
    });
    files.push(...rootCSS);
    const varRegex = /--([\w-]+)\s*:\s*([^;]+);/g;
    for (const file of files) {
        const content = await readFile(file, "utf-8");
        // Skip @theme blocks (handled by tailwind scanner)
        const cleaned = content.replace(/@theme\s*\{[^}]*\}/g, "");
        let match;
        while ((match = varRegex.exec(cleaned)) !== null) {
            const [, name, rawValue] = match;
            const value = rawValue.trim();
            const relFile = relative(projectRoot, file);
            result.cssVariables.push({ name: `--${name}`, value, file: relFile });
            // Categorize
            if (isColor(name, value)) {
                result.colors.push({ name: `--${name}`, value, source: "css-var" });
            }
            else if (isSpacing(name, value)) {
                result.spacing.push({ name: `--${name}`, value, source: "css-var" });
            }
            else if (isTypography(name)) {
                result.typography.push({ name: `--${name}`, value, source: "css-var" });
            }
        }
    }
    return result;
}
function isColor(name, value) {
    const colorNames = ["color", "bg", "border", "shadow", "fill", "stroke"];
    if (colorNames.some((n) => name.includes(n)))
        return true;
    if (/^#[0-9a-f]{3,8}$/i.test(value))
        return true;
    if (/^(rgb|hsl|oklch)\(/.test(value))
        return true;
    return false;
}
function isSpacing(name, value) {
    const spacingNames = ["spacing", "gap", "margin", "padding", "size", "width", "height", "radius"];
    if (spacingNames.some((n) => name.includes(n)))
        return true;
    if (/^\d+(\.\d+)?(px|rem|em)$/.test(value))
        return true;
    return false;
}
function isTypography(name) {
    const typoNames = ["font", "text", "leading", "tracking", "line-height", "letter-spacing"];
    return typoNames.some((n) => name.includes(n));
}
