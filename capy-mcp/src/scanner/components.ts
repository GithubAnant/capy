import { readFile } from "fs/promises";
import { glob } from "glob";
import { basename, extname, relative } from "path";
import ts from "typescript";
import type { Component } from "../types.js";

export async function scanComponents(
  projectRoot: string,
  scanDirs: string[]
): Promise<Component[]> {
  const patterns = scanDirs.map((dir) => `${dir}/**/*.{tsx,jsx,vue,svelte}`);

  const files = await glob(patterns, {
    cwd: projectRoot,
    absolute: true,
    ignore: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/app/preview/**",
      "**/pages/preview.*",
      "**/capy-preview/**",
      "**/*.test.*",
      "**/*.spec.*",
      "**/*.stories.*",
    ],
  });

  const components: Component[] = [];

  for (const file of files) {
    const content = await readFile(file, "utf-8");
    const relPath = relative(projectRoot, file);
    const fileName = basename(file).replace(/\.\w+$/, "");

    if (/^(use[A-Z]|index|types|utils|helpers|constants|page|layout|loading|error|template|not-found)$/.test(fileName)) {
      if (fileName === "index" && !hasJSX(content)) continue;
      if (fileName !== "index") continue;
    }

    if (!hasJSX(content) && !file.endsWith(".vue") && !file.endsWith(".svelte")) {
      continue;
    }

    const component = analyzeComponent(file, content, relPath, fileName);
    components.push(component);
  }

  return components;
}

function analyzeComponent(
  file: string,
  content: string,
  relPath: string,
  fallbackName: string
): Component {
  if (file.endsWith(".vue") || file.endsWith(".svelte")) {
    return {
      name: fallbackName,
      filePath: relPath,
      exportType: "default",
      importName: fallbackName,
      requiredProps: [],
      canRenderWithoutProps: true,
      isClientComponent: true,
    };
  }

  const sourceFile = ts.createSourceFile(
    file,
    content,
    ts.ScriptTarget.Latest,
    true,
    extname(file).toLowerCase() === ".jsx" ? ts.ScriptKind.JSX : ts.ScriptKind.TSX
  );

  const fileIsClientComponent = /^\s*["']use client["'];?/m.test(content);
  let exportType: Component["exportType"] = "unknown";
  let importName: string | undefined;
  let requiredProps: string[] = [];
  let canRenderWithoutProps = true;

  for (const statement of sourceFile.statements) {
    if (ts.isFunctionDeclaration(statement) && hasExportModifier(statement)) {
      const detectedName = statement.name?.text;
      if (detectedName && isComponentName(detectedName)) {
        exportType = hasDefaultModifier(statement) ? "default" : "named";
        importName = detectedName;
        ({ requiredProps, canRenderWithoutProps } = getParameterHints(statement.parameters[0]));
        break;
      }
    }

    if (ts.isClassDeclaration(statement) && hasExportModifier(statement)) {
      const detectedName = statement.name?.text;
      if (detectedName && isComponentName(detectedName)) {
        exportType = hasDefaultModifier(statement) ? "default" : "named";
        importName = detectedName;
        break;
      }
    }

    if (ts.isVariableStatement(statement) && hasExportModifier(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name)) continue;
        const detectedName = declaration.name.text;
        if (!isComponentName(detectedName)) continue;

        exportType = hasDefaultModifier(statement) ? "default" : "named";
        importName = detectedName;
        ({ requiredProps, canRenderWithoutProps } = getVariableHints(declaration));
        break;
      }
    }

    if (ts.isExportAssignment(statement)) {
      exportType = "default";
      if (ts.isIdentifier(statement.expression)) {
        importName = statement.expression.text;
      }
    }

    if (importName) break;
  }

  return {
    name: fallbackName === "index" && importName ? importName : fallbackName,
    filePath: relPath,
    exportType,
    importName,
    requiredProps,
    canRenderWithoutProps,
    isClientComponent: fileIsClientComponent,
  };
}

function getVariableHints(
  declaration: ts.VariableDeclaration
): Pick<Component, "requiredProps" | "canRenderWithoutProps"> {
  if (!declaration.initializer) {
    return { requiredProps: [], canRenderWithoutProps: true };
  }

  if (
    ts.isArrowFunction(declaration.initializer) ||
    ts.isFunctionExpression(declaration.initializer)
  ) {
    return getParameterHints(declaration.initializer.parameters[0]);
  }

  return { requiredProps: [], canRenderWithoutProps: true };
}

function getParameterHints(
  parameter: ts.ParameterDeclaration | undefined
): Pick<Component, "requiredProps" | "canRenderWithoutProps"> {
  if (!parameter) {
    return { requiredProps: [], canRenderWithoutProps: true };
  }

  if (parameter.questionToken || parameter.initializer) {
    return { requiredProps: [], canRenderWithoutProps: true };
  }

  if (ts.isObjectBindingPattern(parameter.name)) {
    const requiredProps = parameter.name.elements
      .filter((element) => Boolean(element.name) && !element.initializer)
      .map((element) => element.name.getText())
      .filter(Boolean);
    return {
      requiredProps,
      canRenderWithoutProps: requiredProps.length === 0,
    };
  }

  if (parameter.type && ts.isTypeLiteralNode(parameter.type)) {
    const requiredProps = parameter.type.members
      .filter(ts.isPropertySignature)
      .filter((member) => !member.questionToken && member.name)
      .map((member) => member.name.getText().replace(/['"]/g, ""));
    return {
      requiredProps,
      canRenderWithoutProps: requiredProps.length === 0,
    };
  }

  return {
    requiredProps: [parameter.name.getText()],
    canRenderWithoutProps: false,
  };
}

function hasJSX(content: string): boolean {
  return /return\s*\(?\s*</.test(content) || /<[A-Z][\w.]*/.test(content);
}

function hasExportModifier(node: ts.Node): boolean {
  const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
  return Boolean(modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword));
}

function hasDefaultModifier(node: ts.Node): boolean {
  const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
  return Boolean(modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword));
}

function isComponentName(name: string): boolean {
  return /^[A-Z]/.test(name);
}
