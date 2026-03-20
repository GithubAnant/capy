import type { CapyConfig } from "./types.js";
export declare function getDefaultConfig(): CapyConfig;
export declare function loadConfig(projectRoot: string): Promise<CapyConfig>;
export declare function writeConfig(projectRoot: string, config: CapyConfig): Promise<void>;
