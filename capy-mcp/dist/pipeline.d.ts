import { scan } from "./scanner/index.js";
import type { CapyConfig, DesignSystemArtifactResult, PreviewGenerationResult, UpdateResult } from "./types.js";
export declare function getDesignSystemContext(projectRoot: string): Promise<{
    config: CapyConfig;
    designSystem: Awaited<ReturnType<typeof scan>>;
    designSystemArtifact: DesignSystemArtifactResult;
    preview: PreviewGenerationResult;
    prompt: string;
}>;
export declare function updateProjectArtifacts(projectRoot: string, updates: Partial<CapyConfig>, options?: {
    forceRebuild?: boolean;
}): Promise<UpdateResult>;
