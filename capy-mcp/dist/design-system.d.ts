import type { DesignSystemArtifact, DesignSystemBuildInput } from "./types.js";
export declare function buildDesignSystemArtifact(projectRoot: string, input?: DesignSystemBuildInput): Promise<DesignSystemArtifact>;
export declare function writeDesignSystemArtifact(projectRoot: string, input?: DesignSystemBuildInput): Promise<DesignSystemArtifact>;
