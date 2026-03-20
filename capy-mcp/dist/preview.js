import { writeFile } from "fs/promises";
export async function generatePreview(ds, outputPath) {
    const html = buildHTML(ds);
    await writeFile(outputPath, html);
}
function buildHTML(ds) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Capy — Design System Preview</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #e5e5e5; padding: 2rem; line-height: 1.6; }
  h1 { font-size: 2rem; margin-bottom: 0.5rem; color: #fff; }
  h2 { font-size: 1.25rem; margin: 2rem 0 1rem; color: #a3a3a3; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 500; }
  .subtitle { color: #737373; margin-bottom: 2rem; }
  .section { margin-bottom: 3rem; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem; }
  .color-card { border-radius: 8px; overflow: hidden; background: #171717; border: 1px solid #262626; }
  .color-swatch { height: 80px; }
  .color-info { padding: 0.5rem 0.75rem; font-size: 0.75rem; }
  .color-name { font-weight: 600; color: #d4d4d4; }
  .color-value { color: #737373; }
  .typo-item { padding: 0.75rem 1rem; background: #171717; border: 1px solid #262626; border-radius: 6px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; }
  .typo-name { font-weight: 500; font-size: 0.875rem; }
  .typo-value { color: #737373; font-size: 0.75rem; font-family: monospace; }
  .spacing-bar { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
  .spacing-visual { background: #3b82f6; height: 20px; border-radius: 4px; min-width: 4px; }
  .spacing-label { font-size: 0.75rem; font-family: monospace; color: #a3a3a3; min-width: 120px; }
  .comp-item { padding: 0.75rem 1rem; background: #171717; border: 1px solid #262626; border-radius: 6px; margin-bottom: 0.5rem; }
  .comp-name { font-weight: 600; color: #d4d4d4; }
  .comp-path { color: #737373; font-size: 0.75rem; font-family: monospace; }
  .var-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
  .var-table th, .var-table td { text-align: left; padding: 0.5rem 0.75rem; border-bottom: 1px solid #262626; }
  .var-table th { color: #737373; font-weight: 500; }
  .var-table td { font-family: monospace; }
  .badge { display: inline-block; padding: 0.125rem 0.5rem; border-radius: 9999px; font-size: 0.625rem; background: #262626; color: #a3a3a3; margin-left: 0.5rem; }
  .empty { color: #525252; font-style: italic; }
</style>
</head>
<body>
<h1>🐹 Capy</h1>
<p class="subtitle">Design System Preview — Generated ${new Date().toLocaleDateString()}</p>

${renderColors(ds)}
${renderTypography(ds)}
${renderSpacing(ds)}
${renderComponents(ds)}
${renderCSSVariables(ds)}

</body>
</html>`;
}
function renderColors(ds) {
    if (ds.colors.length === 0)
        return `<div class="section"><h2>Colors</h2><p class="empty">No colors found</p></div>`;
    const cards = ds.colors
        .map((c) => `<div class="color-card">
  <div class="color-swatch" style="background:${c.value}"></div>
  <div class="color-info">
    <div class="color-name">${esc(c.name)}<span class="badge">${c.source}</span></div>
    <div class="color-value">${esc(c.value)}</div>
  </div>
</div>`)
        .join("\n");
    return `<div class="section"><h2>Colors (${ds.colors.length})</h2><div class="grid">${cards}</div></div>`;
}
function renderTypography(ds) {
    if (ds.typography.length === 0)
        return `<div class="section"><h2>Typography</h2><p class="empty">No typography tokens found</p></div>`;
    const items = ds.typography
        .map((t) => `<div class="typo-item"><span class="typo-name">${esc(t.name)}<span class="badge">${t.source}</span></span><span class="typo-value">${esc(t.value)}</span></div>`)
        .join("\n");
    return `<div class="section"><h2>Typography (${ds.typography.length})</h2>${items}</div>`;
}
function renderSpacing(ds) {
    if (ds.spacing.length === 0)
        return `<div class="section"><h2>Spacing</h2><p class="empty">No spacing tokens found</p></div>`;
    const items = ds.spacing
        .map((s) => {
        const px = parseToPx(s.value);
        return `<div class="spacing-bar"><span class="spacing-label">${esc(s.name)}: ${esc(s.value)}</span><div class="spacing-visual" style="width:${px}px"></div></div>`;
    })
        .join("\n");
    return `<div class="section"><h2>Spacing (${ds.spacing.length})</h2>${items}</div>`;
}
function renderComponents(ds) {
    if (ds.components.length === 0)
        return `<div class="section"><h2>Components</h2><p class="empty">No components found</p></div>`;
    const items = ds.components
        .map((c) => `<div class="comp-item"><span class="comp-name">${esc(c.name)}</span><span class="badge">${c.exportType}</span><br><span class="comp-path">${esc(c.filePath)}</span></div>`)
        .join("\n");
    return `<div class="section"><h2>Components (${ds.components.length})</h2>${items}</div>`;
}
function renderCSSVariables(ds) {
    if (ds.cssVariables.length === 0)
        return "";
    const rows = ds.cssVariables
        .map((v) => `<tr><td>${esc(v.name)}</td><td>${esc(v.value)}</td><td>${esc(v.file)}</td></tr>`)
        .join("\n");
    return `<div class="section"><h2>CSS Variables (${ds.cssVariables.length})</h2><table class="var-table"><thead><tr><th>Variable</th><th>Value</th><th>File</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function parseToPx(value) {
    const num = parseFloat(value);
    if (isNaN(num))
        return 16;
    if (value.endsWith("rem"))
        return num * 16;
    if (value.endsWith("em"))
        return num * 16;
    return num;
}
