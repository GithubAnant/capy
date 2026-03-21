import type { CapyConfig, DesignSystem, PreviewGenerationResult } from "./types.js";
interface GeneratePreviewOptions {
    forceRebuild?: boolean;
}
export declare function generatePreview(projectRoot: string, config: CapyConfig, designSystem: DesignSystem, options?: GeneratePreviewOptions): Promise<PreviewGenerationResult>;
export {};
