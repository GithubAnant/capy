import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { buildPreviewBrief } from "../dist/brief.js";

async function createTempProject(structure) {
  const root = await mkdtemp(join(tmpdir(), "capy-mcp-"));
  await Promise.all(
    Object.entries(structure).map(async ([relativePath, content]) => {
      const filePath = join(root, relativePath);
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, content);
    })
  );
  return root;
}

async function cleanup(path) {
  await rm(path, { recursive: true, force: true });
}

test("buildPreviewBrief maps a Next app-router project into a preview brief", async () => {
  const projectRoot = await createTempProject({
    "package.json": JSON.stringify(
      {
        name: "sample-next-app",
        private: true,
        dependencies: {
          next: "16.0.0",
          react: "19.0.0",
        },
      },
      null,
      2
    ),
    "src/app/layout.tsx": "export default function Layout({ children }) { return children; }",
    "src/app/page.tsx": "export default function Page() { return null; }",
    "src/app/globals.css": ":root { color: red; }",
    "src/components/Button.tsx": "export function Button() { return null; }",
    "src/components/sections/Hero.tsx": "export function Hero() { return null; }",
  });

  try {
    const brief = await buildPreviewBrief(projectRoot, { task: "build_preview" });
    assert.equal(brief.projectFacts.framework, "next-app-router");
    assert.equal(brief.projectFacts.previewEntryFile, "src/app/preview/page.tsx");
    assert.match(brief.instructions, /src\/app\/preview\/page\.tsx/);
    assert.equal(brief.deliverableSpec.layout, "bidirectional-scroll");
    assert.ok(brief.deliverableSpec.sections.includes("Icons"));
    assert.match(brief.instructions, /click-to-copy behavior/i);
    assert.deepEqual(brief.inspectionPlan[0].targets, ["src/app/layout.tsx", "src/app/page.tsx"]);
    assert.ok(brief.projectFacts.likelyComponentDirs.includes("src/components"));
    assert.ok(brief.projectFacts.likelyStyleFiles.includes("src/app/globals.css"));
  } finally {
    await cleanup(projectRoot);
  }
});

test("buildPreviewBrief warns when React routing is not configured", async () => {
  const projectRoot = await createTempProject({
    "package.json": JSON.stringify(
      {
        name: "sample-react-app",
        private: true,
        dependencies: {
          react: "19.0.0",
        },
      },
      null,
      2
    ),
    "src/App.tsx": "export function App() { return null; }",
    "src/styles.css": "body { margin: 0; }",
  });

  try {
    const brief = await buildPreviewBrief(projectRoot, { task: "build_preview" });
    assert.equal(brief.projectFacts.framework, "react-no-router");
    assert.match(brief.warnings.join("\n"), /react-router-dom/);
    assert.match(brief.constraints.join("\n"), /confirm router setup/i);
  } finally {
    await cleanup(projectRoot);
  }
});

test("buildPreviewBrief carries changed files into update guidance", async () => {
  const projectRoot = await createTempProject({
    "package.json": JSON.stringify(
      {
        name: "sample-next-app",
        private: true,
        dependencies: {
          next: "16.0.0",
          react: "19.0.0",
        },
      },
      null,
      2
    ),
    "src/app/layout.tsx": "export default function Layout({ children }) { return children; }",
    "src/app/page.tsx": "export default function Page() { return null; }",
    "src/app/globals.css": ":root { color: red; }",
  });

  try {
    const brief = await buildPreviewBrief(projectRoot, {
      task: "update_preview",
      changedFiles: ["src/app/globals.css", "src/components/Button.tsx"],
      userGoal: "Update the preview after styling changes",
    });

    assert.match(brief.updateStrategy[0], /src\/app\/globals\.css/);
    assert.match(brief.instructions, /Update the existing \/preview route incrementally/);
    assert.match(brief.instructions, /Update the preview after styling changes/);
  } finally {
    await cleanup(projectRoot);
  }
});
