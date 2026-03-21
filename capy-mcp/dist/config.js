import { readFile, writeFile } from "fs/promises";
import { join } from "path";
const CONFIG_FILE = "capy.config.json";
export function getDefaultConfig() {
    return {
        tokenFormat: "tailwind",
        componentStrictness: "existing-first",
        outputStyle: "concise",
        verbosity: "concise",
        previewPath: "./capy-preview.html",
        previewRoute: "/preview",
        previewLayout: "hybrid",
        artifactsDir: ".capy",
        scanDirs: ["src"],
        version: "2",
    };
}
export async function loadConfig(projectRoot) {
    const configPath = join(projectRoot, CONFIG_FILE);
    try {
        const raw = await readFile(configPath, "utf-8");
        return { ...getDefaultConfig(), ...JSON.parse(raw) };
    }
    catch {
        return getDefaultConfig();
    }
}
export async function writeConfig(projectRoot, config) {
    const configPath = join(projectRoot, CONFIG_FILE);
    await writeFile(configPath, JSON.stringify(config, null, 2) + "\n");
}
