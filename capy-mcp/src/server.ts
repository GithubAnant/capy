import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getDesignSystemContext, updateProjectArtifacts } from "./pipeline.js";

const projectRoot = process.cwd();

const server = new McpServer({
  name: "capy",
  version: "0.1.0",
});

server.tool(
  "get_design_system",
  "Scans the project, writes .capy/design-system.json if needed, refreshes the local preview artifacts incrementally, and returns structured JSON plus a session prompt for the AI agent.",
  {},
  async () => {
    const context = await getDesignSystemContext(projectRoot);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              designSystem: context.designSystem,
              designSystemArtifact: context.designSystemArtifact,
              preview: context.preview,
              instructions: context.prompt,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.tool(
  "generate_preview",
  "Scans the codebase, writes or refreshes local preview artifacts, and generates a local-only /preview route when the framework supports it. Uses incremental writes by default.",
  {
    forceRebuild: z
      .boolean()
      .optional()
      .describe("Rebuild preview artifacts even if incremental state says nothing changed."),
  },
  async ({ forceRebuild }) => {
    const result = await updateProjectArtifacts(projectRoot, {}, { forceRebuild });
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result.preview, null, 2),
        },
      ],
    };
  }
);

server.tool(
  "update",
  "Incrementally updates capy.config.json, .capy/design-system.json, and preview artifacts after design-system or preference changes.",
  {
    tokenFormat: z.enum(["tailwind", "css-vars", "raw"]).optional(),
    componentStrictness: z.enum(["existing-first", "scaffold", "both"]).optional(),
    outputStyle: z.enum(["concise", "verbose", "strict", "explorative"]).optional(),
    verbosity: z.enum(["concise", "verbose"]).optional(),
    previewRoute: z.string().optional(),
    previewLayout: z
      .enum(["hybrid", "page-first", "feature-first", "component-library"])
      .optional(),
    artifactsDir: z.string().optional(),
    scanDirs: z.array(z.string()).optional(),
    forceRebuild: z.boolean().optional(),
  },
  async (updates) => {
    const result = await updateProjectArtifacts(
      projectRoot,
      {
        tokenFormat: updates.tokenFormat,
        componentStrictness: updates.componentStrictness,
        outputStyle: updates.outputStyle,
        verbosity: updates.verbosity,
        previewRoute: updates.previewRoute,
        previewLayout: updates.previewLayout,
        artifactsDir: updates.artifactsDir,
        scanDirs: updates.scanDirs,
      },
      { forceRebuild: updates.forceRebuild }
    );

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
