export interface CapyConfig {
    tokenFormat: "tailwind" | "css-vars" | "raw";
    componentStrictness: "existing-first" | "scaffold" | "both";
    outputStyle: "concise" | "verbose" | "strict" | "explorative";
    verbosity: "concise" | "verbose";
    previewPath: string;
    previewRoute: string;
    previewLayout: "hybrid" | "page-first" | "feature-first" | "component-library";
    artifactsDir: string;
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
    importName?: string;
    requiredProps: string[];
    canRenderWithoutProps: boolean;
    isClientComponent: boolean;
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
export type FrameworkKind = "next-app-router" | "next-pages-router" | "react-router" | "react-no-router" | "unknown";
export interface FrameworkInfo {
    kind: FrameworkKind;
    label: string;
    route: string;
    routeDir?: string;
    routeFile?: string;
    previewImportPrefix?: string;
    needsConfirmation: boolean;
    confirmationMessage?: string;
    packageManager?: "npm" | "pnpm" | "yarn" | "bun";
}
export interface CapyArtifactState {
    version: string;
    framework: FrameworkKind;
    route: string;
    layout: CapyConfig["previewLayout"];
    generatedAt: string;
    hashes: Record<string, string>;
    warnings: string[];
    missingExamples: string[];
}
export interface PreviewRenderableComponent {
    name: string;
    filePath: string;
    exportType: Component["exportType"];
    importName?: string;
    requiredProps: string[];
    renderMode: "auto" | "example" | "placeholder";
    notes: string[];
    importPath?: string;
    exampleProps: Record<string, unknown>;
}
export interface PreviewBoard {
    id: string;
    title: string;
    kind: "foundations" | "components" | "components-meta";
    x: number;
    y: number;
    width: number;
    height: number;
    componentIds: string[];
}
export interface PreviewData {
    meta: {
        generatedAt: string;
        framework: FrameworkKind;
        route: string;
        layout: CapyConfig["previewLayout"];
        warnings: string[];
    };
    foundations: Pick<DesignSystem, "colors" | "typography" | "spacing" | "cssVariables">;
    components: PreviewRenderableComponent[];
    boards: PreviewBoard[];
}
export interface ArtifactWriteResult {
    path: string;
    changed: boolean;
    created: boolean;
}
export interface DesignSystemArtifactResult {
    status: "updated" | "unchanged";
    path: string;
    summary: {
        colors: number;
        typography: number;
        spacing: number;
        components: number;
        cssVariables: number;
    };
}
export interface PreviewGenerationResult {
    status: "updated" | "unchanged" | "needs_confirmation";
    framework: FrameworkInfo;
    route: string;
    files: ArtifactWriteResult[];
    warnings: string[];
    missingExamples: string[];
    summary: {
        components: number;
        renderable: number;
        placeholders: number;
    };
}
export interface UpdateResult {
    status: "updated" | "unchanged" | "needs_confirmation";
    configChanged: boolean;
    designSystem: DesignSystemArtifactResult;
    preview: PreviewGenerationResult;
}
