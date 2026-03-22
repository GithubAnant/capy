import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { runPreviewUpdate } from "../dist/index.js";

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

test("runPreviewUpdate creates a baseline snapshot when no prior state exists", async () => {
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
    "src/app/globals.css": ":root { --color-primary: #111827; }",
    "src/components/Button.tsx": "export function Button() { return null; }",
  });

  try {
    const result = await runPreviewUpdate(projectRoot);
    const snapshotRaw = await readFile(join(projectRoot, ".capy/preview-state.json"), "utf8");

    assert.equal(result.baselineCreated, true);
    assert.deepEqual(result.changedFiles, []);
    assert.match(result.warnings.join("\n"), /baseline snapshot/i);
    assert.ok(JSON.parse(snapshotRaw).trackedFiles["src/components/Button.tsx"]);
  } finally {
    await cleanup(projectRoot);
  }
});

test("runPreviewUpdate detects changed files without git by diffing against the prior snapshot", async () => {
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
    "src/app/globals.css": ":root { --color-primary: #111827; }",
    "src/components/Button.tsx": "export function Button() { return null; }",
  });

  try {
    await runPreviewUpdate(projectRoot);
    await writeFile(
      join(projectRoot, "src/components/Button.tsx"),
      "export function Button() { return <button>Updated</button>; }"
    );

    const result = await runPreviewUpdate(projectRoot);
    const designSystemRaw = await readFile(join(projectRoot, ".capy/design-system.json"), "utf8");

    assert.equal(result.baselineCreated, false);
    assert.deepEqual(result.changedFiles, ["src/components/Button.tsx"]);
    assert.match(result.previewBrief.updateStrategy[0], /src\/components\/Button\.tsx/);
    assert.deepEqual(JSON.parse(designSystemRaw).artifact.changedFiles, ["src/components/Button.tsx"]);
  } finally {
    await cleanup(projectRoot);
  }
});
