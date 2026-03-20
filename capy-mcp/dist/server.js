import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { loadConfig, writeConfig } from "./config.js";
import { generatePreview } from "./preview.js";
import { generatePrompt } from "./prompt.js";
import { scan } from "./scanner/index.js";
import { resolve } from "path";
const projectRoot = process.cwd();
const server = new McpServer({
    name: "capy",
    version: "0.1.0",
});
server.tool("get_design_system", "Returns a structured JSON object of the project's design system (colors, typography, spacing, components, CSS variables) along with an instruction prompt for the AI agent. Call this before writing any UI code.", {}, async () => {
    const config = await loadConfig(projectRoot);
    const ds = await scan(projectRoot, config.scanDirs);
    const prompt = generatePrompt(config, ds);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify({ designSystem: ds, instructions: prompt }, null, 2),
            },
        ],
    };
});
server.tool("generate_preview", "Scans the codebase and writes a self-contained HTML preview of the design system to disk. Open the file in a browser to visually audit colors, typography, spacing, and components.", {
    outputPath: z
        .string()
        .optional()
        .describe("Path to write the HTML file (defaults to config previewPath)"),
}, async ({ outputPath }) => {
    const config = await loadConfig(projectRoot);
    const ds = await scan(projectRoot, config.scanDirs);
    const outPath = resolve(projectRoot, outputPath || config.previewPath);
    await generatePreview(ds, outPath);
    return {
        content: [
            {
                type: "text",
                text: `Preview written to ${outPath}. Open it in a browser to audit your design system.`,
            },
        ],
    };
});
server.tool("update", "Updates capy.config.json with new preferences and regenerates the HTML preview page.", {
    tokenFormat: z.enum(["tailwind", "css-vars", "raw"]).optional(),
    componentStrictness: z.enum(["existing-first", "scaffold", "both"]).optional(),
    outputStyle: z.enum(["concise", "verbose", "strict", "explorative"]).optional(),
    verbosity: z.enum(["concise", "verbose"]).optional(),
    scanDirs: z.array(z.string()).optional(),
    previewPath: z.string().optional(),
}, async (updates) => {
    const config = await loadConfig(projectRoot);
    const newConfig = { ...config };
    if (updates.tokenFormat)
        newConfig.tokenFormat = updates.tokenFormat;
    if (updates.componentStrictness)
        newConfig.componentStrictness = updates.componentStrictness;
    if (updates.outputStyle)
        newConfig.outputStyle = updates.outputStyle;
    if (updates.verbosity)
        newConfig.verbosity = updates.verbosity;
    if (updates.scanDirs)
        newConfig.scanDirs = updates.scanDirs;
    if (updates.previewPath)
        newConfig.previewPath = updates.previewPath;
    await writeConfig(projectRoot, newConfig);
    // Regenerate preview
    const ds = await scan(projectRoot, newConfig.scanDirs);
    const outPath = resolve(projectRoot, newConfig.previewPath);
    await generatePreview(ds, outPath);
    return {
        content: [
            {
                type: "text",
                text: `Config updated and preview regenerated at ${outPath}.`,
            },
        ],
    };
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch(console.error);
