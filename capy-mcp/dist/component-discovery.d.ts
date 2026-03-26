import type { ProjectFacts } from "./types.js";
interface DiscoveredComponent {
    path: string;
    basename: string;
    exports: string[];
}
export interface ComponentDiscoveryPlan {
    allDiscoveredComponents: DiscoveredComponent[];
    prioritizedFiles: string[];
    discoveredFamilyFacts: string[];
    missingFamilyGaps: string[];
    instruction: string;
}
export declare function buildComponentDiscoveryPlan(projectRoot: string, projectFacts: ProjectFacts): Promise<ComponentDiscoveryPlan>;
export {};
