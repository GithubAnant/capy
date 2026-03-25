import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { buildDesignSystemArtifact, writeDesignSystemArtifact } from "../dist/index.js";

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

test("buildDesignSystemArtifact captures css variables and components", async () => {
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
    "src/app/globals.css": ":root { --color-primary: #111827; --space-4: 1rem; }",
    "src/components/Button.tsx":
      "export function Button() { return null; }\nexport const ButtonGroup = () => null;",
    "src/features/account/UserCard.tsx": "export function UserCard() { return null; }",
  });

  try {
    const artifact = await buildDesignSystemArtifact(projectRoot, { mode: "build" });

    assert.equal(artifact.repo.framework, "next-app-router");
    assert.equal(artifact.repo.previewEntryFile, "src/app/preview/page.tsx");
    assert.equal(artifact.tokens.cssVariables.length, 2);
    assert.equal(artifact.components.items.some((component) => component.name === "Button"), true);
    assert.equal(artifact.components.items.some((component) => component.name === "UserCard"), true);
    assert.equal(artifact.scan.componentDirs.includes("src/components"), true);
    assert.equal(artifact.scan.styleFiles.includes("src/app/globals.css"), true);
  } finally {
    await cleanup(projectRoot);
  }
});

test("writeDesignSystemArtifact writes a stable json file to .capy", async () => {
  const projectRoot = await createTempProject({
    "package.json": JSON.stringify(
      {
        name: "sample-react-app",
        private: true,
        dependencies: {
          react: "19.0.0",
          "react-router-dom": "7.0.0",
        },
      },
      null,
      2
    ),
    "src/styles.css": ":root { --text-body: #222; }",
    "src/components/Card.tsx": "export function Card() { return null; }",
  });

  try {
    const artifact = await writeDesignSystemArtifact(projectRoot, {
      mode: "update",
      changedFiles: ["src/styles.css"],
    });

    const raw = await readFile(join(projectRoot, ".capy/design-system.json"), "utf8");
    const written = JSON.parse(raw);

    assert.equal(artifact.artifact.mode, "update");
    assert.deepEqual(written.artifact.changedFiles, ["src/styles.css"]);
    assert.equal(written.components.items[0].name, "Card");
    assert.equal(written.artifact.artifactPath, ".capy/design-system.json");
  } finally {
    await cleanup(projectRoot);
  }
});

test("buildDesignSystemArtifact prioritizes likely primitives and usage examples", async () => {
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
    "src/lib/use-toast.ts": "export function useToast() { return { toast: () => null }; }",
  });

  try {
    const artifact = await buildDesignSystemArtifact(projectRoot, { mode: "build" });

    assert.equal(artifact.components.items.some((item) => item.path === "src/components/Button.tsx"), true);
    assert.match(artifact.scan.discoveredFamilies.join("\n"), /src\/components\/.*Button/i);
    assert.ok(artifact.components.count >= 1);
  } finally {
    await cleanup(projectRoot);
  }
});
