import type { DesignSystem } from "../types.js";
import { scanComponents } from "./components.js";
import { scanCSSVariables } from "./css-vars.js";
import { scanTailwind } from "./tailwind.js";

export async function scan(
  projectRoot: string,
  scanDirs: string[]
): Promise<DesignSystem> {
  const [tailwind, cssVars, components] = await Promise.all([
    scanTailwind(projectRoot),
    scanCSSVariables(projectRoot, scanDirs),
    scanComponents(projectRoot, scanDirs),
  ]);

  return {
    colors: [...tailwind.colors, ...cssVars.colors],
    typography: [...tailwind.typography, ...cssVars.typography],
    spacing: [...tailwind.spacing, ...cssVars.spacing],
    components,
    cssVariables: cssVars.cssVariables,
  };
}
