export type FrameworkKind =
  | "next-app-router"
  | "next-pages-router"
  | "react-router"
  | "react-no-router"
  | "unknown";

export type RoutingStyle =
  | "app-router"
  | "pages-router"
  | "react-router"
  | "none"
  | "unknown";

export interface FrameworkInfo {
  kind: FrameworkKind;
  label: string;
  routingStyle: RoutingStyle;
  previewRoute: string;
  previewEntryFile: string;
  packageManager: "npm" | "pnpm" | "yarn" | "bun";
  needsConfirmation: boolean;
  confirmationMessage?: string;
}

export interface ProjectFacts {
  framework: FrameworkKind;
  routingStyle: RoutingStyle;
  previewRoute: string;
  previewEntryFile: string;
  packageManager: FrameworkInfo["packageManager"];
  likelyComponentDirs: string[];
  likelyStyleFiles: string[];
  likelyPageDirs: string[];
  likelyUiDirs: string[];
}

export interface InspectionStep {
  step: number;
  action: string;
  targets: string[];
  reason: string;
}

export interface DeliverableSpec {
  goal: string;
  layout: "bidirectional-scroll";
  allowHorizontalRows: boolean;
  previewRoute: string;
  previewEntryFile: string;
  sections: string[];
  useExistingComponentsFirst: boolean;
  interactionFeatures: string[];
  layoutGuidelines: string[];
}

export interface PreviewBrief {
  projectFacts: ProjectFacts;
  inspectionPlan: InspectionStep[];
  constraints: string[];
  deliverableSpec: DeliverableSpec;
  updateStrategy: string[];
  warnings: string[];
  instructions: string;
}

export interface DesignSystemBuildInput {
  artifactPath?: string;
  changedFiles?: string[];
  mode?: "build" | "update";
  userGoal?: string;
}

export interface CssVariableRecord {
  name: string;
  value: string;
  category: "color" | "typography" | "layout" | "other";
  file: string;
  line: number;
}

export interface ComponentRecord {
  name: string;
  path: string;
  exports: string[];
  kind: "primitive" | "component" | "feature" | "unknown";
}

export interface DesignSystemArtifact {
  artifact: {
    generatedAt: string;
    mode: "build" | "update";
    artifactPath: string;
    changedFiles: string[];
  };
  repo: {
    framework: FrameworkKind;
    routingStyle: RoutingStyle;
    previewRoute: string;
    previewEntryFile: string;
    packageManager: FrameworkInfo["packageManager"];
  };
  scan: {
    componentDirs: string[];
    pageDirs: string[];
    styleFiles: string[];
    uiDirs: string[];
    discoveredFamilies: string[];
  };
  tokens: {
    cssVariables: CssVariableRecord[];
    themeSourceFiles: string[];
  };
  components: {
    count: number;
    items: ComponentRecord[];
  };
}

export interface PreviewStateSnapshot {
  generatedAt: string;
  trackedFiles: Record<string, string>;
}

export interface PreviewUpdateInput {
  snapshotPath?: string;
  designSystemPath?: string;
  changedFiles?: string[];
  userGoal?: string;
}

export interface PreviewUpdateResult {
  snapshotPath: string;
  designSystemPath: string;
  changedFiles: string[];
  baselineCreated: boolean;
  usedManualChangedFiles: boolean;
  previewBrief: PreviewBrief;
  designSystem: DesignSystemArtifact;
  warnings: string[];
}
