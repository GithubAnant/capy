import { getArtifactPaths, persistDesignSystemArtifact } from "./artifacts.js";
import { loadConfig, writeConfig } from "./config.js";
import { detectFramework } from "./framework.js";
import { generatePreview } from "./preview.js";
import { generatePrompt } from "./prompt.js";
import { scan } from "./scanner/index.js";
export async function getDesignSystemContext(projectRoot) {
    const config = await loadConfig(projectRoot);
    const designSystem = await scan(projectRoot, config.scanDirs);
    const designSystemArtifact = await persistDesignSystemArtifact(projectRoot, config, designSystem);
    const preview = await generatePreview(projectRoot, config, designSystem);
    const framework = await detectFramework(projectRoot);
    const prompt = generatePrompt(config, designSystem, {
        framework,
        designSystemPath: getArtifactPaths(projectRoot, config).designSystemPath,
        route: config.previewRoute,
        previewStatus: preview.status,
        missingExamples: preview.missingExamples,
    });
    return {
        config,
        designSystem,
        designSystemArtifact,
        preview,
        prompt,
    };
}
export async function updateProjectArtifacts(projectRoot, updates, options = {}) {
    const currentConfig = await loadConfig(projectRoot);
    const nextConfig = { ...currentConfig, ...updates };
    const configChanged = JSON.stringify(currentConfig) !== JSON.stringify(nextConfig);
    if (configChanged) {
        await writeConfig(projectRoot, nextConfig);
    }
    const designSystem = await scan(projectRoot, nextConfig.scanDirs);
    const designSystemArtifact = await persistDesignSystemArtifact(projectRoot, nextConfig, designSystem);
    const preview = await generatePreview(projectRoot, nextConfig, designSystem, options);
    return {
        status: configChanged || designSystemArtifact.status === "updated" || preview.status === "updated"
            ? preview.status === "needs_confirmation"
                ? "needs_confirmation"
                : "updated"
            : preview.status,
        configChanged,
        designSystem: designSystemArtifact,
        preview,
    };
}
