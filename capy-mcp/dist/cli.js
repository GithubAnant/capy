#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { createInterface } from "readline/promises";
import { stdin, stdout } from "process";
import { resolve } from "path";
import { getDefaultConfig, loadConfig, writeConfig } from "./config.js";
import { scan } from "./scanner/index.js";
import { generatePreview } from "./preview.js";
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
    const scanDirsRaw = await rl.question(chalk.cyan("Directories to scan (comma-separated) [src]: "));
    const scanDirs = scanDirsRaw.trim() ? scanDirsRaw.split(",").map((s) => s.trim()) : ["src"];
    rl.close();
    const config = {
        ...getDefaultConfig(),
        tokenFormat: tokenFormat,
        componentStrictness: componentStrictness,
        outputStyle: outputStyle,
        verbosity: verbosity,
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
    .description("Generate an HTML preview of your design system")
    .option("-o, --output <path>", "Output path for the HTML file")
    .action(async (opts) => {
    const projectRoot = process.cwd();
    const config = await loadConfig(projectRoot);
    const ds = await scan(projectRoot, config.scanDirs);
    const outPath = resolve(projectRoot, opts.output || config.previewPath);
    await generatePreview(ds, outPath);
    console.log(chalk.green(`✓ Preview written to ${outPath}`));
});
program
    .command("update")
    .description("Update Capy config")
    .option("--token-format <format>", "Token format: tailwind, css-vars, raw")
    .option("--strictness <level>", "Component strictness: existing-first, scaffold, both")
    .option("--output-style <style>", "Output style: concise, verbose, strict, explorative")
    .option("--verbosity <level>", "Verbosity: concise, verbose")
    .option("--scan-dirs <dirs>", "Comma-separated scan directories")
    .action(async (opts) => {
    const projectRoot = process.cwd();
    const config = await loadConfig(projectRoot);
    if (opts.tokenFormat)
        config.tokenFormat = opts.tokenFormat;
    if (opts.strictness)
        config.componentStrictness = opts.strictness;
    if (opts.outputStyle)
        config.outputStyle = opts.outputStyle;
    if (opts.verbosity)
        config.verbosity = opts.verbosity;
    if (opts.scanDirs)
        config.scanDirs = opts.scanDirs.split(",").map((s) => s.trim());
    await writeConfig(projectRoot, config);
    const ds = await scan(projectRoot, config.scanDirs);
    const outPath = resolve(projectRoot, config.previewPath);
    await generatePreview(ds, outPath);
    console.log(chalk.green("✓ Config updated and preview regenerated"));
});
program
    .command("scan")
    .description("Run the scanner and print the design system JSON")
    .action(async () => {
    const projectRoot = process.cwd();
    const config = await loadConfig(projectRoot);
    const ds = await scan(projectRoot, config.scanDirs);
    console.log(JSON.stringify(ds, null, 2));
});
program.parse();
async function ask(rl, label, options, defaultVal) {
    const optStr = options.map((o) => (o === defaultVal ? chalk.bold(o) : o)).join(" / ");
    const answer = await rl.question(chalk.cyan(`${label} (${optStr}) [${defaultVal}]: `));
    const trimmed = answer.trim().toLowerCase();
    return options.includes(trimmed) ? trimmed : defaultVal;
}
