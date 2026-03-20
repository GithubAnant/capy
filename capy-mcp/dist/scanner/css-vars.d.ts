import type { CSSVariable, ColorToken, SpacingToken, TypographyToken } from "../types.js";
interface CSSVarsResult {
    cssVariables: CSSVariable[];
    colors: ColorToken[];
    spacing: SpacingToken[];
    typography: TypographyToken[];
}
export declare function scanCSSVariables(projectRoot: string, scanDirs: string[]): Promise<CSSVarsResult>;
export {};
