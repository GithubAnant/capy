#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { buildPreviewBrief } from "./brief.js";
import { writeDesignSystemArtifact } from "./design-system.js";
import { runPreviewUpdate } from "./update.js";

function buildPreviewBriefSchema() {
  return {
    project_facts: z.object({
      framework: z.enum([
        "next-app-router",
        "next-pages-router",
        "react-router",
        "react-no-router",
        "unknown",
      ]),
      routing_style: z.enum([
        "app-router",
        "pages-router",
        "react-router",
        "none",
        "unknown",
      ]),
      preview_route: z.string(),
      preview_entry_file: z.string(),
      package_manager: z.enum(["npm", "pnpm", "yarn", "bun"]),
      likely_component_dirs: z.array(z.string()),
      likely_style_files: z.array(z.string()),
      likely_page_dirs: z.array(z.string()),
      likely_ui_dirs: z.array(z.string()),
    }),
    inspection_plan: z.array(
      z.object({
        step: z.number(),
        action: z.string(),
        targets: z.array(z.string()),
        reason: z.string(),
      })
    ),
    constraints: z.array(z.string()),
    deliverable_spec: z.object({
      goal: z.string(),
      layout: z.literal("bidirectional-scroll"),
      allow_horizontal_rows: z.boolean(),
      preview_route: z.string(),
      preview_entry_file: z.string(),
      sections: z.array(z.string()),
      use_existing_components_first: z.boolean(),
      interaction_features: z.array(z.string()),
    }),
    update_strategy: z.array(z.string()),
    warnings: z.array(z.string()),
    instructions: z.string(),
  };
}

function toStructuredPreviewBrief(brief: Awaited<ReturnType<typeof buildPreviewBrief>>) {
  return {
    project_facts: {
      framework: brief.projectFacts.framework,
      routing_style: brief.projectFacts.routingStyle,
      preview_route: brief.projectFacts.previewRoute,
      preview_entry_file: brief.projectFacts.previewEntryFile,
      package_manager: brief.projectFacts.packageManager,
      likely_component_dirs: brief.projectFacts.likelyComponentDirs,
      likely_style_files: brief.projectFacts.likelyStyleFiles,
      likely_page_dirs: brief.projectFacts.likelyPageDirs,
      likely_ui_dirs: brief.projectFacts.likelyUiDirs,
    },
    inspection_plan: brief.inspectionPlan.map((item) => ({
      step: item.step,
      action: item.action,
      targets: item.targets,
      reason: item.reason,
    })),
    constraints: brief.constraints,
    deliverable_spec: {
      goal: brief.deliverableSpec.goal,
      layout: brief.deliverableSpec.layout,
      allow_horizontal_rows: brief.deliverableSpec.allowHorizontalRows,
      preview_route: brief.deliverableSpec.previewRoute,
      preview_entry_file: brief.deliverableSpec.previewEntryFile,
      sections: brief.deliverableSpec.sections,
      use_existing_components_first: brief.deliverableSpec.useExistingComponentsFirst,
      interaction_features: brief.deliverableSpec.interactionFeatures,
    },
    update_strategy: brief.updateStrategy,
    warnings: brief.warnings,
    instructions: brief.instructions,
  };
}

export function createServer(projectRoot = process.cwd()): McpServer {
  const server = new McpServer({
    name: "capy",
    version: "1.0.4",
  });

  server.registerTool(
    "get_preview_brief",
    {
      title: "Get Preview Brief",
      description:
        "Call this first for any UI preview, design-system, component-catalog, or style-audit task. Returns the repo map, inspection plan, constraints, and exact /preview spec the agent should follow before writing code.",
      inputSchema: {
        task: z
          .enum(["build_preview", "update_preview"])
          .default("build_preview")
          .describe("Whether the agent is creating /preview from scratch or updating it."),
        changedFiles: z
          .array(z.string())
          .optional()
          .describe("Files changed since the previous preview pass, when known."),
        userGoal: z
          .string()
          .optional()
          .describe("The user's request, so the returned instructions can stay aligned."),
      },
      outputSchema: buildPreviewBriefSchema(),
    },
    async ({ task = "build_preview", changedFiles, userGoal }) => {
      const brief = await buildPreviewBrief(projectRoot, {
        task,
        changedFiles,
        userGoal,
      });

      const structuredContent = toStructuredPreviewBrief(brief);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(structuredContent, null, 2),
          },
        ],
        structuredContent,
      };
    }
  );

  server.registerTool(
    "update_preview",
    {
      title: "Update Preview",
      description:
        "Diffs the current repo against Capy's last snapshot, refreshes the design-system artifact, and returns an incremental /preview update brief. Works even when the repo is not a git repository.",
      inputSchema: {
        snapshotPath: z
          .string()
          .default(".capy/preview-state.json")
          .describe("Where Capy stores the previous file-hash snapshot relative to the repo root."),
        designSystemPath: z
          .string()
          .default(".capy/design-system.json")
          .describe("Where to refresh the machine-readable design-system artifact."),
        changedFiles: z
          .array(z.string())
          .optional()
          .describe("Optional manual override for changed files. If omitted, Capy diffs against its last snapshot."),
        userGoal: z
          .string()
          .optional()
          .describe("Optional user request to keep the update brief aligned with the task."),
      },
      outputSchema: {
        snapshot_path: z.string(),
        design_system_path: z.string(),
        changed_files: z.array(z.string()),
        baseline_created: z.boolean(),
        used_manual_changed_files: z.boolean(),
        warnings: z.array(z.string()),
        preview_update_brief: z.object(buildPreviewBriefSchema()),
      },
    },
    async ({
      snapshotPath = ".capy/preview-state.json",
      designSystemPath = ".capy/design-system.json",
      changedFiles,
      userGoal,
    }) => {
      const result = await runPreviewUpdate(projectRoot, {
        snapshotPath,
        designSystemPath,
        changedFiles,
        userGoal,
      });

      const structuredContent = {
        snapshot_path: result.snapshotPath,
        design_system_path: result.designSystemPath,
        changed_files: result.changedFiles,
        baseline_created: result.baselineCreated,
        used_manual_changed_files: result.usedManualChangedFiles,
        warnings: result.warnings,
        preview_update_brief: toStructuredPreviewBrief(result.previewBrief),
      };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(structuredContent, null, 2),
          },
        ],
        structuredContent,
      };
    }
  );

  server.registerTool(
    "get_design_system",
    {
      title: "Get Design System",
      description:
        "Builds and writes a stable machine-readable design-system artifact for the current repo. Use this when the agent needs a durable JSON source of truth for future UI work.",
      inputSchema: {
        artifactPath: z
          .string()
          .default(".capy/design-system.json")
          .describe("Where to write the design-system JSON artifact relative to the repo root."),
        mode: z
          .enum(["build", "update"])
          .default("build")
          .describe("Whether this is the first artifact pass or an incremental refresh."),
        changedFiles: z
          .array(z.string())
          .optional()
          .describe("Files changed since the previous pass, when known."),
        userGoal: z
          .string()
          .optional()
          .describe("Optional end-user request to keep the artifact guidance aligned with the task."),
      },
      outputSchema: {
        artifact_path: z.string(),
        framework: z.enum([
          "next-app-router",
          "next-pages-router",
          "react-router",
          "react-no-router",
          "unknown",
        ]),
        routing_style: z.enum([
          "app-router",
          "pages-router",
          "react-router",
          "none",
          "unknown",
        ]),
        preview_route: z.string(),
        preview_entry_file: z.string(),
        component_count: z.number(),
        css_variable_count: z.number(),
        component_dirs: z.array(z.string()),
        style_files: z.array(z.string()),
        discovered_families: z.array(z.string()),
      },
    },
    async ({ artifactPath = ".capy/design-system.json", mode = "build", changedFiles, userGoal }) => {
      const artifact = await writeDesignSystemArtifact(projectRoot, {
        artifactPath,
        mode,
        changedFiles,
        userGoal,
      });

      const structuredContent = {
        artifact_path: artifact.artifact.artifactPath,
        framework: artifact.repo.framework,
        routing_style: artifact.repo.routingStyle,
        preview_route: artifact.repo.previewRoute,
        preview_entry_file: artifact.repo.previewEntryFile,
        component_count: artifact.components.count,
        css_variable_count: artifact.tokens.cssVariables.length,
        component_dirs: artifact.scan.componentDirs,
        style_files: artifact.scan.styleFiles,
        discovered_families: artifact.scan.discoveredFamilies,
      };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                ...structuredContent,
                design_system: artifact,
              },
              null,
              2
            ),
          },
        ],
        structuredContent,
      };
    }
  );

  return server;
}

export async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
