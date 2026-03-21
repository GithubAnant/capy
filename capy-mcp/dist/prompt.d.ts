import type { CapyConfig, DesignSystem, FrameworkInfo } from "./types.js";
export declare function generatePrompt(config: CapyConfig, ds: DesignSystem, context: {
    framework: FrameworkInfo;
    designSystemPath: string;
    route: string;
    previewStatus: "updated" | "unchanged" | "needs_confirmation";
    missingExamples: string[];
}): string;
