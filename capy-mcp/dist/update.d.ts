import type { PreviewUpdateInput, PreviewUpdateResult, PreviewStateSnapshot } from "./types.js";
export declare function runPreviewUpdate(projectRoot: string, input?: PreviewUpdateInput): Promise<PreviewUpdateResult>;
export declare function buildPreviewStateSnapshot(projectRoot: string): Promise<PreviewStateSnapshot>;
export declare function writePreviewStateSnapshot(projectRoot: string, snapshotPath: string, snapshot: PreviewStateSnapshot): Promise<void>;
