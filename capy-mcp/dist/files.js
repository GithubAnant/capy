import { mkdir, readFile, stat, writeFile } from "fs/promises";
import { dirname } from "path";
export async function fileExists(path) {
    try {
        await stat(path);
        return true;
    }
    catch {
        return false;
    }
}
export async function readText(path) {
    try {
        return await readFile(path, "utf8");
    }
    catch {
        return null;
    }
}
export async function writeText(path, contents) {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, contents, "utf8");
}
export function toPosixPath(path) {
    return path.replace(/\\/g, "/");
}
