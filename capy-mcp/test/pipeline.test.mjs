import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { getDesignSystemContext, updateProjectArtifacts } from "../dist/pipeline.js";

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

test("getDesignSystemContext writes incremental preview artifacts for Next app router projects", async () => {
  const projectRoot = await createTempProject({
    "package.json": JSON.stringify(
      {
        name: "sample-next-app",
        private: true,
        dependencies: {
          next: "15.0.0",
          react: "19.0.0",
        },
      },
      null,
      2
    ),
    ".gitignore": "node_modules\n",
    "src/app/layout.tsx": `export default function Layout({ children }) { return <html><body>{children}</body></html>; }`,
    "src/app/page.tsx": `export default function Home() { return <main>Home</main>; }`,
    "src/app/globals.css": `:root { --color-primary: #0f172a; --spacing-4: 1rem; --font-body: "Newsreader"; }`,
    "src/components/Button.tsx": `"use client";
export function Button({ children }: { children: React.ReactNode }) {
  return <button>{children}</button>;
}`,
    "src/components/UserSettings.tsx": `"use client";
export function UserSettings({ user }: { user: { name: string } }) {
  return <section>{user.name}</section>;
}`,
  });

  try {
    const context = await getDesignSystemContext(projectRoot);
    assert.equal(context.preview.status, "updated");
    assert.equal(context.designSystemArtifact.status, "updated");
    assert.deepEqual(context.preview.missingExamples, ["UserSettings"]);

    const gitignore = await readFile(join(projectRoot, ".gitignore"), "utf8");
    assert.match(gitignore, /\.capy\/design-system\.json/);
    assert.match(gitignore, /src\/app\/preview/);

    const previewRoute = await readFile(join(projectRoot, "src/app/preview/page.tsx"), "utf8");
    assert.match(previewRoute, /CapyPreviewPage/);

    const previewRegistry = await readFile(
      join(projectRoot, ".capy/generated/preview-registry.tsx"),
      "utf8"
    );
    assert.match(previewRegistry, /capyExamples/);
    assert.match(previewRegistry, /UserSettings/);

    const designSystem = JSON.parse(
      await readFile(join(projectRoot, ".capy/design-system.json"), "utf8")
    );
    assert.equal(designSystem.components.length, 2);
  } finally {
    await cleanup(projectRoot);
  }
});

test("updateProjectArtifacts stays unchanged when the scanned project is unchanged", async () => {
  const projectRoot = await createTempProject({
    "package.json": JSON.stringify(
      {
        name: "sample-next-app",
        private: true,
        dependencies: {
          next: "15.0.0",
          react: "19.0.0",
        },
      },
      null,
      2
    ),
    "src/app/layout.tsx": `export default function Layout({ children }) { return <html><body>{children}</body></html>; }`,
    "src/app/page.tsx": `export default function Home() { return <main>Home</main>; }`,
    "src/components/Button.tsx": `"use client";
export function Button({ children }: { children: React.ReactNode }) {
  return <button>{children}</button>;
}`,
  });

  try {
    const first = await updateProjectArtifacts(projectRoot, {});
    const second = await updateProjectArtifacts(projectRoot, {});

    assert.equal(first.status, "updated");
    assert.equal(second.designSystem.status, "unchanged");
    assert.equal(second.preview.status, "unchanged");
    assert.equal(second.status, "unchanged");
  } finally {
    await cleanup(projectRoot);
  }
});

test("react projects without react-router return needs_confirmation", async () => {
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
    "src/App.tsx": `export function App() { return <main>Hello</main>; }`,
  });

  try {
    const result = await updateProjectArtifacts(projectRoot, {});
    assert.equal(result.status, "needs_confirmation");
    assert.match(result.preview.warnings[0], /React Router is required/);
  } finally {
    await cleanup(projectRoot);
  }
});
