import type { Plugin } from "@opencode-ai/plugin";
import { tool } from "@opencode-ai/plugin/tool";

let capyMcp: typeof import("capy-mcp") | null = null;

async function getCapyMcp() {
  if (!capyMcp) {
    capyMcp = await import("capy-mcp");
  }
  return capyMcp;
}

export const CapyPlugin: Plugin = async (ctx) => {
  return {
    tool: {
      capy_get_preview_brief: tool({
        description:
          "Get a preview brief for the current project. Returns repo map, inspection plan, constraints, and exact /preview spec the agent should follow before writing code. Call this first for any UI preview, design-system, component-catalog, or style-audit task.",
        args: {
          task: tool.schema
            .enum(["build_preview", "update_preview"])
            .default("build_preview")
            .describe("Whether to create /preview from scratch or update it."),
          changedFiles: tool.schema
            .array(tool.schema.string())
            .optional()
            .describe("Files changed since the previous preview pass."),
          userGoal: tool.schema
            .string()
            .optional()
            .describe("The user's request for context."),
        },
        async execute(args, context) {
          const { directory } = context;
          const capy = await getCapyMcp();
          const projectRoot = directory ?? process.cwd();

          const result = await capy.buildPreviewBrief(projectRoot, {
            task: args.task ?? "build_preview",
            changedFiles: args.changedFiles,
            userGoal: args.userGoal,
          });

          return JSON.stringify(result, null, 2);
        },
      }),

      capy_get_design_system: tool({
        description:
          "Build and write a stable machine-readable design-system artifact for the current project. Use this when you need a durable JSON source of truth for UI work.",
        args: {
          artifactPath: tool.schema
            .string()
            .default(".capy/design-system.json")
            .describe("Where to write the design-system JSON artifact."),
          mode: tool.schema
            .enum(["build", "update"])
            .default("build")
            .describe("First pass or incremental refresh."),
          changedFiles: tool.schema
            .array(tool.schema.string())
            .optional()
            .describe("Files changed since the previous pass."),
          userGoal: tool.schema
            .string()
            .optional()
            .describe("Optional end-user request for context."),
        },
        async execute(args, context) {
          const { directory } = context;
          const capy = await getCapyMcp();
          const projectRoot = directory ?? process.cwd();

          const result = await capy.writeDesignSystemArtifact(projectRoot, {
            artifactPath: args.artifactPath ?? ".capy/design-system.json",
            mode: args.mode ?? "build",
            changedFiles: args.changedFiles,
            userGoal: args.userGoal,
          });

          return JSON.stringify(result, null, 2);
        },
      }),

      capy_update_preview: tool({
        description:
          "Diff the current project against Capy's last snapshot, refresh the design-system artifact, and return an incremental /preview update brief. Works even without git.",
        args: {
          snapshotPath: tool.schema
            .string()
            .default(".capy/preview-state.json")
            .describe("Where Capy stores the previous file-hash snapshot."),
          designSystemPath: tool.schema
            .string()
            .default(".capy/design-system.json")
            .describe("Where to refresh the design-system artifact."),
          changedFiles: tool.schema
            .array(tool.schema.string())
            .optional()
            .describe("Manual override for changed files."),
          userGoal: tool.schema
            .string()
            .optional()
            .describe("Optional user request for context."),
        },
        async execute(args, context) {
          const { directory } = context;
          const capy = await getCapyMcp();
          const projectRoot = directory ?? process.cwd();

          const result = await capy.runPreviewUpdate(projectRoot, {
            snapshotPath: args.snapshotPath ?? ".capy/preview-state.json",
            designSystemPath: args.designSystemPath ?? ".capy/design-system.json",
            changedFiles: args.changedFiles,
            userGoal: args.userGoal,
          });

          return JSON.stringify(result, null, 2);
        },
      }),

      capy_detect_framework: tool({
        description:
          "Detect the framework (Next.js, React Router, etc.) and routing style of the current project.",
        args: {},
        async execute(args, context) {
          const { directory } = context;
          const capy = await getCapyMcp();
          const projectRoot = directory ?? process.cwd();

          const result = await capy.detectFramework(projectRoot);

          return JSON.stringify(result, null, 2);
        },
      }),
    },
  };
};

export default CapyPlugin;
