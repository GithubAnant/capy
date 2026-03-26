import { readFile } from "node:fs/promises";
import path from "node:path";
import PreviewClient, { type PreviewSnapshot } from "./PreviewClient";

async function getPreviewSnapshot(): Promise<PreviewSnapshot | null> {
  try {
    const artifactPath = path.join(process.cwd(), ".capy", "design-system.json");
    const raw = await readFile(artifactPath, "utf8");
    return JSON.parse(raw) as PreviewSnapshot;
  } catch {
    return null;
  }
}

export default async function PreviewPage() {
  const snapshot = await getPreviewSnapshot();

  return <PreviewClient snapshot={snapshot} />;
}
