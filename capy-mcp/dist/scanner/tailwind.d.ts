import type { ColorToken, SpacingToken, TypographyToken } from "../types.js";
interface TailwindResult {
    colors: ColorToken[];
    spacing: SpacingToken[];
    typography: TypographyToken[];
}
export declare function scanTailwind(projectRoot: string): Promise<TailwindResult>;
export {};
