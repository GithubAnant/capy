import type { CapyArtifactState, CapyConfig, DesignSystem, DesignSystemArtifactResult } from "./types.js";
export interface CapyArtifactPaths {
    artifactsDir: string;
    generatedDir: string;
    designSystemPath: string;
    statePath: string;
    examplesPath: string;
}
export declare function getArtifactPaths(projectRoot: string, config: CapyConfig): CapyArtifactPaths;
export declare function ensureArtifactsStructure(projectRoot: string, config: CapyConfig): Promise<CapyArtifactPaths>;
export declare function persistDesignSystemArtifact(projectRoot: string, config: CapyConfig, designSystem: DesignSystem): Promise<DesignSystemArtifactResult>;
export declare function loadArtifactState(projectRoot: string, config: CapyConfig): Promise<CapyArtifactState | null>;
export declare function writeArtifactState(projectRoot: string, config: CapyConfig, state: CapyArtifactState): Promise<void>;
export declare function ensureExamplesTemplate(projectRoot: string, config: CapyConfig): Promise<void>;
export declare function buildArtifactIgnorePatterns(projectRoot: string, config: CapyConfig, previewRoutePath?: string): string[];
export declare function buildStateHashes(entries: Record<string, string>): Record<string, string>;
