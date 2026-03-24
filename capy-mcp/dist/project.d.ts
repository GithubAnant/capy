import type { FrameworkInfo, ProjectFacts } from "./types.js";
/**
 * Build project facts by actually scanning the filesystem instead of
 * checking a hardcoded list of candidate directories.
 *
 * Strategy: glob for all source files, read their exports, then classify
 * directories by what they contain rather than what they're named.
 */
export declare function buildProjectFacts(projectRoot: string, framework: FrameworkInfo): Promise<ProjectFacts>;
