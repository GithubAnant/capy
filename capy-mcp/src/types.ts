export interface CapyConfig {
  tokenFormat: "tailwind" | "css-vars" | "raw";
  componentStrictness: "existing-first" | "scaffold" | "both";
  outputStyle: "concise" | "verbose" | "strict" | "explorative";
  verbosity: "concise" | "verbose";
  previewPath: string;
  scanDirs: string[];
  version: string;
}

export interface ColorToken {
  name: string;
  value: string;
  source: "tailwind" | "css-var";
}

export interface TypographyToken {
  name: string;
  value: string;
  source: "tailwind" | "css-var";
}

export interface SpacingToken {
  name: string;
  value: string;
  source: "tailwind" | "css-var";
}

export interface Component {
  name: string;
  filePath: string;
  exportType: "default" | "named" | "unknown";
}

export interface CSSVariable {
  name: string;
  value: string;
  file: string;
}

export interface DesignSystem {
  colors: ColorToken[];
  typography: TypographyToken[];
  spacing: SpacingToken[];
  components: Component[];
  cssVariables: CSSVariable[];
}
