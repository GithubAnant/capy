#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { createInterface } from "readline/promises";
import { stdin, stdout } from "process";
import { getDefaultConfig, writeConfig } from "./config.js";
import { getDesignSystemContext, updateProjectArtifacts } from "./pipeline.js";
const program = new Command();
program.name("capy").description("Extract your design system for AI agents").version("0.1.0");
program
    .command("init")
    .description("Initialize Capy in your project")
    .action(async () => {
    const projectRoot = process.cwd();
    console.log(chalk.bold("\n🐹 Capy — Design System for AI Agents\n"));
    const rl = createInterface({ input: stdin, output: stdout });
    const tokenFormat = await ask(rl, "Token format", ["tailwind", "css-vars", "raw"], "tailwind");
    const componentStrictness = await ask(rl, "Component strictness", ["existing-first", "scaffold", "both"], "existing-first");
    const outputStyle = await ask(rl, "Output style", ["concise", "verbose", "strict", "explorative"], "concise");
    const verbosity = await ask(rl, "Verbosity", ["concise", "verbose"], "concise");
    const previewLayout = await ask(rl, "Preview layout", ["hybrid", "page-first", "feature-first", "component-library"], "hybrid");
    const scanDirsRaw = await rl.question(chalk.cyan("Directories to scan (comma-separated) [src]: "));
    const scanDirs = scanDirsRaw.trim() ? scanDirsRaw.split(",").map((s) => s.trim()) : ["src"];
    rl.close();
    const config = {
        ...getDefaultConfig(),
        tokenFormat: tokenFormat,
        componentStrictness: componentStrictness,
        outputStyle: outputStyle,
        verbosity: verbosity,
        previewLayout: previewLayout,
        scanDirs,
    };
    await writeConfig(projectRoot, config);
    console.log(chalk.green("\n✓ capy.config.json created\n"));
    // Print MCP config snippet
    console.log(chalk.bold("Add this to your MCP agent config:\n"));
    console.log(chalk.gray(JSON.stringify({
        mcpServers: {
            capy: {
                command: "npx",
                args: ["-y", "capy-mcp"],
            },
        },
    }, null, 2)));
    console.log();
});
program
    .command("preview")
    .description("Generate or refresh the local preview route and Capy artifacts")
    .option("--force", "Force-refresh preview artifacts even when nothing changed")
    .action(async (opts) => {
    const result = await updateProjectArtifacts(process.cwd(), {}, { forceRebuild: Boolean(opts.force) });
    console.log(chalk.green(`✓ Preview status: ${result.preview.status}`));
    console.log(chalk.gray(JSON.stringify(result.preview, null, 2)));
});
program
    .command("update")
    .description("Update Capy config")
    .option("--token-format <format>", "Token format: tailwind, css-vars, raw")
    .option("--strictness <level>", "Component strictness: existing-first, scaffold, both")
    .option("--output-style <style>", "Output style: concise, verbose, strict, explorative")
    .option("--verbosity <level>", "Verbosity: concise, verbose")
    .option("--preview-layout <layout>", "Preview layout: hybrid, page-first, feature-first, component-library")
    .option("--preview-route <route>", "Preview route path (default: /preview)")
    .option("--artifacts-dir <path>", "Directory for Capy artifacts (default: .capy)")
    .option("--scan-dirs <dirs>", "Comma-separated scan directories")
    .option("--force", "Force-refresh preview artifacts even when incremental state is unchanged")
    .action(async (opts) => {
    const result = await updateProjectArtifacts(process.cwd(), {
        tokenFormat: opts.tokenFormat,
        componentStrictness: opts.strictness,
        outputStyle: opts.outputStyle,
        verbosity: opts.verbosity,
        previewLayout: opts.previewLayout,
        previewRoute: opts.previewRoute,
        artifactsDir: opts.artifactsDir,
        scanDirs: opts.scanDirs ? opts.scanDirs.split(",").map((s) => s.trim()) : undefined,
    }, { forceRebuild: Boolean(opts.force) });
    console.log(chalk.green(`✓ Update status: ${result.status}`));
    console.log(chalk.gray(JSON.stringify(result, null, 2)));
});
program
    .command("scan")
    .description("Run the scanner, refresh artifacts, and print the design-system context")
    .action(async () => {
    const context = await getDesignSystemContext(process.cwd());
    console.log(JSON.stringify({
        designSystem: context.designSystem,
        designSystemArtifact: context.designSystemArtifact,
        preview: context.preview,
        instructions: context.prompt,
    }, null, 2));
});
program.parse();
async function ask(rl, label, options, defaultVal) {
    const optStr = options.map((o) => (o === defaultVal ? chalk.bold(o) : o)).join(" / ");
    const answer = await rl.question(chalk.cyan(`${label} (${optStr}) [${defaultVal}]: `));
    const trimmed = answer.trim().toLowerCase();
    return options.includes(trimmed) ? trimmed : defaultVal;
}
