import type { PreviewBrief } from "./types.js";
export declare function buildPreviewBrief(projectRoot: string, input: {
    task: "build_preview" | "update_preview";
    changedFiles?: string[];
    userGoal?: string;
}): Promise<PreviewBrief>;
