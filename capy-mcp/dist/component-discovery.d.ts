import type { ProjectFacts } from "./types.js";
export interface ComponentDiscoveryPlan {
    searchStepTargets: string[];
    prioritizedFiles: string[];
    discoveredFamilyFacts: string[];
    missingFamilyGaps: string[];
    instruction: string;
}
export declare function buildComponentDiscoveryPlan(projectRoot: string, projectFacts: ProjectFacts): Promise<ComponentDiscoveryPlan>;
