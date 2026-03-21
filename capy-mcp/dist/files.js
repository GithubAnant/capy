import { createHash } from "crypto";
import { mkdir, readFile, stat, writeFile } from "fs/promises";
import { dirname, relative } from "path";
export async function fileExists(path) {
    try {
        await stat(path);
        return true;
    }
    catch {
        return false;
    }
}
export async function ensureDir(path) {
    await mkdir(path, { recursive: true });
}
export async function readText(path) {
    try {
        return await readFile(path, "utf8");
    }
    catch {
        return null;
    }
}
export async function writeTextIfChanged(path, nextContent) {
    const current = await readText(path);
    if (current === nextContent) {
        return { path, changed: false, created: false };
    }
    await ensureDir(dirname(path));
    await writeFile(path, nextContent);
    return { path, changed: true, created: current === null };
}
export async function appendGitignorePatterns(projectRoot, patterns) {
    const gitignorePath = `${projectRoot}/.gitignore`;
    const current = (await readText(gitignorePath)) ?? "";
    const lines = new Set(current
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean));
    let changed = false;
    for (const pattern of patterns) {
        if (!lines.has(pattern)) {
            lines.add(pattern);
            changed = true;
        }
    }
    if (!changed) {
        return { path: gitignorePath, changed: false, created: current.length === 0 };
    }
    const next = `${Array.from(lines).sort().join("\n")}\n`;
    await writeFile(gitignorePath, next);
    return {
        path: gitignorePath,
        changed: true,
        created: current.length === 0,
    };
}
export function hashContent(value) {
    return createHash("sha256").update(value).digest("hex");
}
export function stableStringify(value) {
    return JSON.stringify(sortValue(value), null, 2);
}
function sortValue(value) {
    if (Array.isArray(value)) {
        return value.map(sortValue);
    }
    if (value && typeof value === "object") {
        return Object.fromEntries(Object.entries(value)
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([key, nested]) => [key, sortValue(nested)]));
    }
    return value;
}
export function toPosixPath(path) {
    return path.replace(/\\/g, "/");
}
export function relativeImportPath(fromDir, toFile) {
    const raw = toPosixPath(relative(fromDir, toFile));
    const withoutExt = raw.replace(/\.(tsx|ts|jsx|js)$/, "");
    return withoutExt.startsWith(".") ? withoutExt : `./${withoutExt}`;
}
