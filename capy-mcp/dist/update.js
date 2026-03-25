import { createHash } from "crypto";
import { glob } from "glob";
import { join } from "path";
import { buildPreviewBrief } from "./brief.js";
import { writeDesignSystemArtifact } from "./design-system.js";
import { readText, toPosixPath, writeText } from "./files.js";
const DEFAULT_SNAPSHOT_PATH = ".capy/preview-state.json";
const DEFAULT_DESIGN_SYSTEM_PATH = ".capy/design-system.json";
export async function runPreviewUpdate(projectRoot, input = {}) {
    const snapshotPath = input.snapshotPath ?? DEFAULT_SNAPSHOT_PATH;
    const designSystemPath = input.designSystemPath ?? DEFAULT_DESIGN_SYSTEM_PATH;
    const usedManualChangedFiles = Array.isArray(input.changedFiles);
    const diffResult = usedManualChangedFiles
        ? {
            baselineCreated: false,
            changedFiles: uniqueSorted(input.changedFiles ?? []),
            snapshot: await buildPreviewStateSnapshot(projectRoot),
        }
        : await detectChangedFilesFromSnapshot(projectRoot, snapshotPath);
    const previewBrief = await buildPreviewBrief(projectRoot, {
        task: "update_preview",
        changedFiles: diffResult.changedFiles,
        userGoal: input.userGoal,
    });
    const designSystem = await writeDesignSystemArtifact(projectRoot, {
        artifactPath: designSystemPath,
        mode: "update",
        changedFiles: diffResult.changedFiles,
        userGoal: input.userGoal,
    });
    await writePreviewStateSnapshot(projectRoot, snapshotPath, diffResult.snapshot);
    const warnings = [];
    if (diffResult.baselineCreated) {
        warnings.unshift("No prior preview-state snapshot was found. Capy created a baseline snapshot, so this run cannot infer incremental changes automatically.");
    }
    if (usedManualChangedFiles) {
        warnings.unshift("Using caller-provided changedFiles instead of auto-detected snapshot diffs.");
    }
    return {
        snapshotPath,
        designSystemPath,
        changedFiles: diffResult.changedFiles,
        baselineCreated: diffResult.baselineCreated,
        usedManualChangedFiles,
        previewBrief,
        designSystem,
        warnings,
    };
}
export async function buildPreviewStateSnapshot(projectRoot) {
    const trackedFiles = await glob(["**/*.{ts,tsx,js,jsx,css,scss,sass,less,vue,svelte}"], {
        cwd: projectRoot,
        nodir: true,
        ignore: [
            "**/node_modules/**",
            "**/.next/**",
            "**/dist/**",
            "**/build/**",
            "**/coverage/**",
            "**/.git/**",
            "**/.capy/**",
        ],
    });
    const fileHashes = {};
    for (const file of trackedFiles.map((item) => toPosixPath(item)).sort()) {
        const contents = await readText(join(projectRoot, file));
        if (contents === null)
            continue;
        fileHashes[file] = createHash("sha1").update(contents).digest("hex");
    }
    return {
        generatedAt: new Date().toISOString(),
        trackedFiles: fileHashes,
    };
}
export async function writePreviewStateSnapshot(projectRoot, snapshotPath, snapshot) {
    await writeText(join(projectRoot, snapshotPath), `${JSON.stringify(snapshot, null, 2)}\n`);
}
async function detectChangedFilesFromSnapshot(projectRoot, snapshotPath) {
    const snapshot = await buildPreviewStateSnapshot(projectRoot);
    const previous = await readSnapshot(projectRoot, snapshotPath);
    if (!previous) {
        return {
            baselineCreated: true,
            changedFiles: [],
            snapshot,
        };
    }
    const changedFiles = new Set();
    const previousFiles = previous.trackedFiles;
    const currentFiles = snapshot.trackedFiles;
    for (const [path, hash] of Object.entries(currentFiles)) {
        if (previousFiles[path] !== hash) {
            changedFiles.add(path);
        }
    }
    for (const path of Object.keys(previousFiles)) {
        if (!(path in currentFiles)) {
            changedFiles.add(path);
        }
    }
    return {
        baselineCreated: false,
        changedFiles: Array.from(changedFiles).sort(),
        snapshot,
    };
}
async function readSnapshot(projectRoot, snapshotPath) {
    const raw = await readText(join(projectRoot, snapshotPath));
    if (!raw)
        return null;
    try {
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
function uniqueSorted(values) {
    return Array.from(new Set(values)).sort();
}
