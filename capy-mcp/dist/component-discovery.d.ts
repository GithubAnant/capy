import type { ProjectFacts } from "./types.js";
interface DiscoveredComponent {
    path: string;
    basename: string;
    exports: string[];
    contents: string;
}
export interface ComponentDiscoveryPlan {
    allDiscoveredComponents: DiscoveredComponent[];
    prioritizedFiles: string[];
    discoveredFamilyFacts: string[];
    missingFamilyGaps: string[];
    instruction: string;
}
/**
 * Discover components by scanning the filesystem — no hardcoded family lists.
 *
 * Strategy:
 * 1. Glob for ALL source files within discovered component/UI dirs
 * 2. Extract PascalCase exports from each file
 * 3. Everything with a PascalCase export is a component
 * 4. Classify what we found into loose categories for the agent
 */
export declare function buildComponentDiscoveryPlan(projectRoot: string, projectFacts: ProjectFacts): Promise<ComponentDiscoveryPlan>;
export {};
