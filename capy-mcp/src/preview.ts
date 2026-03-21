import { join } from "path";
import {
  buildArtifactIgnorePatterns,
  buildStateHashes,
  ensureArtifactsStructure,
  getArtifactPaths,
  loadArtifactState,
  writeArtifactState,
} from "./artifacts.js";
import { appendGitignorePatterns, relativeImportPath, stableStringify, writeTextIfChanged } from "./files.js";
import { detectFramework } from "./framework.js";
import type {
  CapyArtifactState,
  CapyConfig,
  Component,
  DesignSystem,
  FrameworkInfo,
  PreviewBoard,
  PreviewData,
  PreviewGenerationResult,
  PreviewRenderableComponent,
} from "./types.js";

interface GeneratePreviewOptions {
  forceRebuild?: boolean;
}

export async function generatePreview(
  projectRoot: string,
  config: CapyConfig,
  designSystem: DesignSystem,
  options: GeneratePreviewOptions = {}
): Promise<PreviewGenerationResult> {
  const framework = await detectFramework(projectRoot);
  const paths = await ensureArtifactsStructure(projectRoot, config);
  const previousState = options.forceRebuild ? null : await loadArtifactState(projectRoot, config);

  if (framework.kind === "unknown" || framework.kind === "react-no-router") {
    return {
      status: "needs_confirmation",
      framework,
      route: config.previewRoute,
      files: [],
      warnings: framework.confirmationMessage ? [framework.confirmationMessage] : [],
      missingExamples: [],
      summary: {
        components: designSystem.components.length,
        renderable: 0,
        placeholders: designSystem.components.length,
      },
    };
  }

  if (framework.kind === "react-router") {
    const routeModulePath = join(paths.generatedDir, "react-preview-route.tsx");
    const data = buildPreviewData(designSystem, framework, config, previousState);
    const previewPageModule = buildPreviewPageModule();
    const previewDataModule = buildPreviewDataModule(data);
    const registryModule = buildPreviewRegistryModule(
      data,
      framework,
      projectRoot,
      paths.generatedDir
    );

    const files = await Promise.all([
      writeTextIfChanged(join(paths.generatedDir, "preview-page.tsx"), previewPageModule),
      writeTextIfChanged(join(paths.generatedDir, "preview-data.ts"), previewDataModule),
      writeTextIfChanged(join(paths.generatedDir, "preview-registry.tsx"), registryModule),
      writeTextIfChanged(routeModulePath, buildReactRouteModule()),
      appendGitignorePatterns(
        projectRoot,
        buildArtifactIgnorePatterns(projectRoot, config).concat("src/capy-preview")
      ),
    ]);

    await persistState(projectRoot, config, framework, files, data);

    return {
      status: "needs_confirmation",
      framework: {
        ...framework,
        confirmationMessage:
          "React Router route module generated at .capy/generated/react-preview-route.tsx. Confirm the router mount point before wiring /preview automatically.",
      },
      route: config.previewRoute,
      files,
      warnings: [
        "Generated a reusable React Router route module, but Capy did not patch your router tree automatically.",
      ],
      missingExamples: collectMissingExamples(data.components),
      summary: summarizePreview(data.components),
    };
  }

  const data = buildPreviewData(designSystem, framework, config, previousState);
  const previewPagePath = join(paths.generatedDir, "preview-page.tsx");
  const previewDataPath = join(paths.generatedDir, "preview-data.ts");
  const previewRegistryPath = join(paths.generatedDir, "preview-registry.tsx");
  const routeFilePath = framework.routeFile!;
  const ignorePatterns = buildArtifactIgnorePatterns(projectRoot, config, framework.routeDir ?? framework.routeFile);

  const previewPageModule = buildPreviewPageModule();
  const previewDataModule = buildPreviewDataModule(data);
  const registryModule = buildPreviewRegistryModule(
    data,
    framework,
    projectRoot,
    paths.generatedDir
  );
  const routeModule = buildNextRouteModule(framework, previewPagePath);

  const files = await Promise.all([
    writeTextIfChanged(previewPagePath, previewPageModule),
    writeTextIfChanged(previewDataPath, previewDataModule),
    writeTextIfChanged(previewRegistryPath, registryModule),
    writeTextIfChanged(routeFilePath, routeModule),
    appendGitignorePatterns(projectRoot, ignorePatterns),
  ]);

  await persistState(projectRoot, config, framework, files, data);

  const status =
    files.some((file) => file.changed) ||
    previousState?.route !== config.previewRoute ||
    previousState?.layout !== config.previewLayout
      ? "updated"
      : "unchanged";

  return {
    status,
    framework,
    route: config.previewRoute,
    files,
    warnings: data.meta.warnings,
    missingExamples: collectMissingExamples(data.components),
    summary: summarizePreview(data.components),
  };
}

function buildPreviewData(
  designSystem: DesignSystem,
  framework: FrameworkInfo,
  config: CapyConfig,
  previousState: CapyArtifactState | null
): PreviewData {
  const warnings: string[] = [];
  const components = designSystem.components.map((component) =>
    buildRenderableComponent(component, framework, warnings)
  );
  const uniqueWarnings = Array.from(new Set(warnings));
  const foundations = {
    colors: designSystem.colors,
    typography: designSystem.typography,
    spacing: designSystem.spacing,
    cssVariables: designSystem.cssVariables,
  };
  const boards = buildBoards(components);
  const fingerprint = createPreviewFingerprint(
    framework.kind,
    config.previewRoute,
    config.previewLayout,
    foundations,
    components,
    boards,
    uniqueWarnings
  );
  const generatedAt =
    previousState?.hashes.previewFingerprint === fingerprint
      ? previousState.generatedAt
      : new Date().toISOString();

  return {
    meta: {
      generatedAt,
      framework: framework.kind,
      route: config.previewRoute,
      layout: config.previewLayout,
      warnings: uniqueWarnings,
    },
    foundations,
    components,
    boards,
  };
}

function buildRenderableComponent(
  component: Component,
  framework: FrameworkInfo,
  warnings: string[]
): PreviewRenderableComponent {
  const exampleProps = inferExampleProps(component);
  const hasEnoughInferredProps = component.requiredProps.every(
    (prop) => prop in exampleProps
  );

  if (component.exportType === "unknown" || !component.importName) {
    return {
      name: component.name,
      filePath: component.filePath,
      exportType: component.exportType,
      importName: component.importName,
      requiredProps: component.requiredProps,
      renderMode: "placeholder",
      notes: ["Capy could not determine a stable import for this component file."],
      exampleProps,
    };
  }

  if (framework.kind === "next-app-router" && !component.isClientComponent) {
    warnings.push(
      "Next App Router preview auto-renders client components only. Server-default components stay as metadata cards until examples are added or the component is client-safe."
    );
    return {
      name: component.name,
      filePath: component.filePath,
      exportType: component.exportType,
      importName: component.importName,
      requiredProps: component.requiredProps,
      renderMode: "placeholder",
      notes: [
        "This file is not marked with `use client`, so the local preview keeps it as a metadata card.",
      ],
      exampleProps,
    };
  }

  if (component.canRenderWithoutProps || hasEnoughInferredProps) {
    return {
      name: component.name,
      filePath: component.filePath,
      exportType: component.exportType,
      importName: component.importName,
      requiredProps: component.requiredProps,
      renderMode: "auto",
      notes: component.requiredProps.length === 0 ? [] : ["Using inferred demo props."],
      exampleProps,
    };
  }

  return {
    name: component.name,
    filePath: component.filePath,
    exportType: component.exportType,
    importName: component.importName,
    requiredProps: component.requiredProps,
    renderMode: "example",
    notes: ["Add demo props in .capy/examples.ts to render this specimen."],
    exampleProps,
  };
}

function inferExampleProps(component: Component): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  const name = component.name.toLowerCase();

  for (const prop of component.requiredProps) {
    const normalized = prop.toLowerCase();
    if (normalized === "children") props[prop] = component.name;
    else if (normalized.includes("label")) props[prop] = component.name;
    else if (normalized.includes("title")) props[prop] = `${component.name} title`;
    else if (normalized === "open" || normalized.endsWith("open")) props[prop] = true;
    else if (normalized.includes("checked") || normalized.includes("selected")) props[prop] = true;
    else if (normalized.includes("count")) props[prop] = 3;
    else if (normalized.includes("variant")) props[prop] = "primary";
    else if (normalized.includes("items") || normalized.includes("options")) props[prop] = [];
    else if (normalized.includes("placeholder")) props[prop] = `Preview ${component.name}`;
    else if (normalized.includes("value")) props[prop] = name.includes("input") ? "Preview value" : component.name;
  }

  if (!("children" in props) && /(button|badge|chip|tag|pill|link)/.test(name)) {
    props.children = component.name;
  }
  if (!("open" in props) && /(modal|dialog|drawer|sheet|popover|tooltip)/.test(name)) {
    props.open = true;
  }
  if (!("placeholder" in props) && /(input|field|search|textarea)/.test(name)) {
    props.placeholder = `Preview ${component.name}`;
  }
  if (!("checked" in props) && /(checkbox|switch|toggle|radio)/.test(name)) {
    props.checked = true;
  }

  return props;
}

function buildBoards(components: PreviewRenderableComponent[]): PreviewBoard[] {
  const boards: PreviewBoard[] = [
    {
      id: "foundations",
      title: "Foundations",
      kind: "foundations",
      x: 0,
      y: 0,
      width: 640,
      height: 880,
      componentIds: [],
    },
  ];

  const groups = new Map<string, PreviewRenderableComponent[]>();
  for (const component of components) {
    const group = categorizeComponent(component);
    const existing = groups.get(group) ?? [];
    existing.push(component);
    groups.set(group, existing);
  }

  let column = 0;
  let row = 0;
  for (const [group, groupComponents] of groups.entries()) {
    boards.push({
      id: group.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: group,
      kind: "components",
      x: 720 + column * 420,
      y: row * 420,
      width: 380,
      height: Math.max(320, 160 + groupComponents.length * 104),
      componentIds: groupComponents.map((component) => componentId(component)),
    });

    column += 1;
    if (column === 2) {
      column = 0;
      row += 1;
    }
  }

  return boards;
}

function categorizeComponent(component: PreviewRenderableComponent): string {
  const text = `${component.name} ${component.filePath}`.toLowerCase();
  if (/(button|input|select|checkbox|radio|field|form|switch|toggle|textarea)/.test(text)) {
    return "Inputs & Actions";
  }
  if (/(modal|dialog|drawer|sheet|popover|tooltip|toast)/.test(text)) {
    return "Overlays";
  }
  if (/(nav|menu|sidebar|breadcrumb|tabs|header|footer)/.test(text)) {
    return "Navigation";
  }
  if (/(card|table|list|avatar|badge|tag|chip|stat|empty|skeleton)/.test(text)) {
    return "Display";
  }
  if (/(hero|pricing|auth|dashboard|settings|profile)/.test(text)) {
    return "Product Surfaces";
  }
  return "Everything Else";
}

function componentId(component: PreviewRenderableComponent): string {
  return `${component.name}-${component.filePath}`.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
}

function buildPreviewDataModule(data: PreviewData): string {
  return `export const previewData = ${stableStringify({
    ...data,
    components: data.components.map((component) => ({
      ...component,
      id: componentId(component),
    })),
  })} as const;\n`;
}

function buildPreviewRegistryModule(
  data: PreviewData,
  framework: FrameworkInfo,
  projectRoot: string,
  generatedDir: string
): string {
  const importableComponents = data.components.filter(
    (component) => component.renderMode !== "placeholder" && component.importName
  );

  const imports = importableComponents
    .map((component, index) => {
      const alias = `Component${index}`;
      const importPath = relativeImportPath(
        generatedDir,
        join(projectRoot, component.filePath)
      );
      if (component.exportType === "default") {
        return `import ${alias} from "${importPath}";`;
      }
      return `import { ${component.importName} as ${alias} } from "${importPath}";`;
    })
    .join("\n");

  const entries = data.components
    .map((component) => {
      const index = importableComponents.findIndex(
        (candidate) => candidate.name === component.name && candidate.filePath === component.filePath
      );
      const alias = index >= 0 ? `Component${index}` : null;
      return `  {
    id: "${componentId(component)}",
    name: ${JSON.stringify(component.name)},
    filePath: ${JSON.stringify(component.filePath)},
    renderMode: ${JSON.stringify(component.renderMode)},
    requiredProps: ${stableStringify(component.requiredProps)},
    notes: ${stableStringify(component.notes)},
    render: () => ${buildRenderExpression(component, alias, framework)},
  }`;
    })
    .join(",\n");

  return `"use client";

import * as React from "react";
${imports ? `${imports}\n` : ""}import { capyExamples } from "../examples";

export interface PreviewRegistryEntry {
  id: string;
  name: string;
  filePath: string;
  renderMode: "auto" | "example" | "placeholder";
  requiredProps: string[];
  notes: string[];
  render: () => React.ReactNode;
}

function placeholder(message: string): React.ReactNode {
  return (
    <div className="capy-placeholder">
      <strong>Needs specimen data</strong>
      <span>{message}</span>
    </div>
  );
}

export const previewRegistry: PreviewRegistryEntry[] = [
${entries}
];
`;
}

function buildRenderExpression(
  component: PreviewRenderableComponent,
  alias: string | null,
  framework: FrameworkInfo
): string {
  const notesMessage = component.notes[0] ?? "Preview unavailable.";
  if (!alias) {
    return `placeholder(${JSON.stringify(notesMessage)})`;
  }

  const inferredProps = stableStringify(component.exampleProps);
  const autoRenderable = component.renderMode === "auto";
  const frameworkNote =
    framework.kind === "next-app-router"
      ? "Previewing auto-detected client component."
      : "Previewing auto-detected component.";

  return `(() => {
      const userExample = capyExamples[${JSON.stringify(component.name)}];
      if (userExample?.disabled) {
        return placeholder("Disabled in .capy/examples.ts");
      }
      const Component = ${alias} as unknown as React.ComponentType<any>;
      if (userExample?.render) {
        return userExample.render(Component);
      }
      const mergedProps = { ...${inferredProps}, ...(userExample?.props ?? {}) };
      if (Object.keys(userExample?.props ?? {}).length > 0 || ${autoRenderable ? "true" : "false"}) {
        return React.createElement(Component, mergedProps);
      }
      return placeholder(${JSON.stringify(`${notesMessage} ${frameworkNote}`)});
    })()`;
}

function buildPreviewPageModule(): string {
  return `"use client";

import * as React from "react";
import { previewData } from "./preview-data";
import { previewRegistry } from "./preview-registry";

const registryById = new Map(previewRegistry.map((entry) => [entry.id, entry]));

export function CapyPreviewPage() {
  const [scale, setScale] = React.useState(1);
  const [position, setPosition] = React.useState({ x: 48, y: 48 });
  const dragState = React.useRef<{ x: number; y: number } | null>(null);

  const onWheel = React.useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    if (!event.metaKey && !event.ctrlKey) return;
    event.preventDefault();
    setScale((current) => {
      const next = current - event.deltaY * 0.001;
      return Math.min(1.8, Math.max(0.55, Number(next.toFixed(2))));
    });
  }, []);

  const onPointerDown = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    dragState.current = { x: event.clientX - position.x, y: event.clientY - position.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [position.x, position.y]);

  const onPointerMove = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    setPosition({
      x: event.clientX - dragState.current.x,
      y: event.clientY - dragState.current.y,
    });
  }, []);

  const stopDragging = React.useCallback(() => {
    dragState.current = null;
  }, []);

  return (
    <main className="capy-shell">
      <header className="capy-header">
        <div>
          <p className="capy-kicker">capy.com/preview</p>
          <h1>Design canvas</h1>
          <p className="capy-subtitle">
            Pan in any direction, zoom with trackpad pinch or ctrl/cmd + wheel, and use
            examples from <code>.capy/examples.ts</code> when a component needs real-ish props.
          </p>
        </div>
        <dl className="capy-meta">
          <div><dt>Framework</dt><dd>{previewData.meta.framework}</dd></div>
          <div><dt>Route</dt><dd>{previewData.meta.route}</dd></div>
          <div><dt>Components</dt><dd>{previewData.components.length}</dd></div>
        </dl>
      </header>

      <section
        className="capy-canvas"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDragging}
        onPointerLeave={stopDragging}
      >
        <div
          className="capy-stage"
          style={{
            transform: \`translate(\${position.x}px, \${position.y}px) scale(\${scale})\`,
          }}
        >
          {previewData.boards.map((board) => (
            <article
              key={board.id}
              className={\`capy-board capy-board-\${board.kind}\`}
              style={{
                left: board.x,
                top: board.y,
                width: board.width,
                minHeight: board.height,
              }}
            >
              <div className="capy-board-header">
                <h2>{board.title}</h2>
                {board.kind !== "foundations" ? <span>{board.componentIds.length} items</span> : null}
              </div>
              {board.kind === "foundations" ? <FoundationsBoard /> : null}
              {board.kind !== "foundations" ? (
                <div className="capy-components">
                  {board.componentIds.map((id) => {
                    const entry = registryById.get(id);
                    if (!entry) return null;
                    return <SpecimenCard key={entry.id} entry={entry} />;
                  })}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <style jsx>{\`
        .capy-shell {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(255, 207, 112, 0.16), transparent 24%),
            radial-gradient(circle at top right, rgba(66, 153, 225, 0.16), transparent 22%),
            #f5f1e8;
          color: #2b251b;
          padding: 24px;
          font-family: Georgia, "Times New Roman", serif;
        }
        .capy-header {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        .capy-kicker {
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-size: 12px;
          color: #8c7151;
          margin-bottom: 6px;
        }
        h1 {
          font-size: clamp(2rem, 4vw, 3.5rem);
          line-height: 0.95;
          margin: 0;
        }
        .capy-subtitle {
          max-width: 720px;
          margin-top: 10px;
          line-height: 1.5;
        }
        .capy-meta {
          display: grid;
          grid-template-columns: repeat(3, minmax(120px, 1fr));
          gap: 12px;
          min-width: min(420px, 100%);
        }
        .capy-meta div {
          background: rgba(255, 255, 255, 0.66);
          border: 1px solid rgba(140, 113, 81, 0.2);
          border-radius: 16px;
          padding: 12px 14px;
        }
        .capy-meta dt {
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #8c7151;
          margin-bottom: 4px;
        }
        .capy-meta dd {
          margin: 0;
          font-size: 14px;
        }
        .capy-canvas {
          position: relative;
          overflow: auto;
          min-height: calc(100vh - 180px);
          border-radius: 28px;
          background-image:
            linear-gradient(rgba(140, 113, 81, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(140, 113, 81, 0.08) 1px, transparent 1px);
          background-size: 48px 48px;
          background-color: rgba(255, 252, 245, 0.72);
          border: 1px solid rgba(140, 113, 81, 0.2);
          touch-action: none;
        }
        .capy-stage {
          position: relative;
          width: 1800px;
          height: 1400px;
          transform-origin: top left;
        }
        .capy-board {
          position: absolute;
          background: rgba(255, 255, 255, 0.94);
          border: 1px solid rgba(140, 113, 81, 0.18);
          border-radius: 28px;
          padding: 18px;
          box-shadow: 0 20px 60px rgba(80, 57, 33, 0.08);
          backdrop-filter: blur(10px);
        }
        .capy-board-header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          margin-bottom: 14px;
        }
        .capy-board-header h2 {
          font-size: 1.15rem;
          margin: 0;
        }
        .capy-board-header span {
          font-size: 0.8rem;
          color: #8c7151;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .capy-foundations {
          display: grid;
          gap: 16px;
        }
        .capy-token-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
          gap: 12px;
        }
        .capy-color-card,
        .capy-token-card,
        .capy-component-card {
          border-radius: 18px;
          border: 1px solid rgba(140, 113, 81, 0.12);
          background: #fffdf8;
        }
        .capy-color-swatch {
          height: 74px;
          border-radius: 18px 18px 12px 12px;
          border-bottom: 1px solid rgba(140, 113, 81, 0.12);
        }
        .capy-color-card div,
        .capy-token-card div {
          padding: 10px 12px 12px;
        }
        .capy-components {
          display: grid;
          gap: 14px;
        }
        .capy-component-card {
          padding: 14px;
        }
        .capy-component-preview {
          padding: 14px;
          border-radius: 16px;
          background: rgba(245, 241, 232, 0.72);
          border: 1px dashed rgba(140, 113, 81, 0.24);
          margin-bottom: 12px;
          content-visibility: auto;
        }
        .capy-component-meta {
          display: grid;
          gap: 6px;
        }
        .capy-component-meta h3 {
          margin: 0;
          font-size: 1rem;
        }
        .capy-component-meta code,
        .capy-shell code {
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 0.85em;
        }
        .capy-notes {
          padding-left: 16px;
          margin: 6px 0 0;
          color: #6b5741;
        }
        .capy-placeholder {
          display: grid;
          gap: 6px;
          color: #6b5741;
        }
        .capy-placeholder strong {
          font-size: 0.95rem;
        }
        @media (max-width: 900px) {
          .capy-shell {
            padding: 16px;
          }
          .capy-header {
            flex-direction: column;
          }
          .capy-meta {
            min-width: 0;
            width: 100%;
          }
        }
      \`}</style>
    </main>
  );
}

function FoundationsBoard() {
  return (
    <div className="capy-foundations">
      <section>
        <div className="capy-board-header">
          <h2>Colors</h2>
          <span>{previewData.foundations.colors.length}</span>
        </div>
        <div className="capy-token-grid">
          {previewData.foundations.colors.map((color) => (
            <div className="capy-color-card" key={\`\${color.name}-\${color.value}\`}>
              <div className="capy-color-swatch" style={{ background: color.value }} />
              <div>
                <strong>{color.name}</strong>
                <p>{color.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <div className="capy-board-header">
          <h2>Typography</h2>
          <span>{previewData.foundations.typography.length}</span>
        </div>
        <div className="capy-token-grid">
          {previewData.foundations.typography.map((token) => (
            <div className="capy-token-card" key={\`\${token.name}-\${token.value}\`}>
              <div>
                <strong>{token.name}</strong>
                <p style={{ margin: 0 }}>{token.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <div className="capy-board-header">
          <h2>Spacing + Vars</h2>
          <span>{previewData.foundations.spacing.length + previewData.foundations.cssVariables.length}</span>
        </div>
        <div className="capy-token-grid">
          {previewData.foundations.spacing.map((token) => (
            <div className="capy-token-card" key={\`\${token.name}-\${token.value}\`}>
              <div>
                <strong>{token.name}</strong>
                <p style={{ margin: 0 }}>{token.value}</p>
              </div>
            </div>
          ))}
          {previewData.foundations.cssVariables.slice(0, 18).map((token) => (
            <div className="capy-token-card" key={\`\${token.name}-\${token.value}\`}>
              <div>
                <strong>{token.name}</strong>
                <p style={{ margin: 0 }}>{token.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SpecimenCard({ entry }: { entry: (typeof previewRegistry)[number] }) {
  return (
    <article className="capy-component-card">
      <ErrorBoundary fallback={<div className="capy-placeholder"><strong>Render failed</strong><span>Use .capy/examples.ts to provide props or a wrapper.</span></div>}>
        <div className="capy-component-preview">{entry.render()}</div>
      </ErrorBoundary>
      <div className="capy-component-meta">
        <h3>{entry.name}</h3>
        <code>{entry.filePath}</code>
        {entry.requiredProps.length > 0 ? (
          <p>Required props: {entry.requiredProps.join(", ")}</p>
        ) : (
          <p>No required props detected.</p>
        )}
        {entry.notes.length > 0 ? (
          <ul className="capy-notes">
            {entry.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
`;
}

function buildNextRouteModule(framework: FrameworkInfo, previewPagePath: string): string {
  const importPath = relativeImportPath(framework.routeDir!, previewPagePath);
  if (framework.kind === "next-pages-router") {
    return `import { CapyPreviewPage } from "${importPath}";

export default function PreviewPage() {
  return <CapyPreviewPage />;
}
`;
  }

  return `import { CapyPreviewPage } from "${importPath}";

export default function PreviewPage() {
  return <CapyPreviewPage />;
}
`;
}

function buildReactRouteModule(): string {
  return `import { CapyPreviewPage } from "./preview-page";

export function createCapyPreviewRoute() {
  return {
    path: "/preview",
    element: <CapyPreviewPage />,
  };
}
`;
}

async function persistState(
  projectRoot: string,
  config: CapyConfig,
  framework: FrameworkInfo,
  files: { path: string; changed: boolean; created: boolean }[],
  data: PreviewData
): Promise<void> {
  const state: CapyArtifactState = {
    version: "2",
    framework: framework.kind,
    route: config.previewRoute,
    layout: config.previewLayout,
    generatedAt: data.meta.generatedAt,
    hashes: buildStateHashes(
      Object.fromEntries(files.map((file) => [file.path, `${file.changed}:${file.created}`]))
    ),
    warnings: data.meta.warnings,
    missingExamples: collectMissingExamples(data.components),
  };
  state.hashes.previewFingerprint = createPreviewFingerprint(
    framework.kind,
    config.previewRoute,
    config.previewLayout,
    data.foundations,
    data.components,
    data.boards,
    data.meta.warnings
  );
  await writeArtifactState(projectRoot, config, state);
}

function collectMissingExamples(components: PreviewRenderableComponent[]): string[] {
  return components
    .filter((component) => component.renderMode === "example")
    .map((component) => component.name);
}

function summarizePreview(components: PreviewRenderableComponent[]): PreviewGenerationResult["summary"] {
  const renderable = components.filter((component) => component.renderMode === "auto").length;
  const placeholders = components.filter((component) => component.renderMode === "placeholder").length;
  return {
    components: components.length,
    renderable,
    placeholders,
  };
}

function createPreviewFingerprint(
  framework: FrameworkInfo["kind"],
  route: string,
  layout: CapyConfig["previewLayout"],
  foundations: PreviewData["foundations"],
  components: PreviewRenderableComponent[],
  boards: PreviewBoard[],
  warnings: string[]
): string {
  return stableStringify({
    framework,
    route,
    layout,
    foundations,
    components,
    boards,
    warnings,
  });
}
