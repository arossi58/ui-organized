/**
 * `pnpm figma:sync` — link the Figma library to the manifest, at each library publish.
 *
 * Reads FIGMA_TOKEN and FIGMA_FILE_KEY. Writes component keys to
 * `manifest/components.json` and, where the API allows it, variable names to
 * `manifest/figma-variables.json`. Both are reviewed as a normal diff. `--check` writes
 * nothing and fails on anything needing attention, for CI.
 *
 * Reads the file rather than the published-library endpoints, so it also works
 * before a first publish. Variable names need Figma's Enterprise plan over REST; a
 * refusal is a warning, and `get_figma_frame` reports the variables it can't name.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { FigmaRequestError, figmaGet } from "../src/figma/rest.js";
import { libraryComponents, planSync, type FigmaOverrides } from "../src/figma/sync.js";
import type { FigmaDocument, FigmaVariableNames } from "../src/figma/types.js";
import type { ComponentManifest } from "../src/schema.js";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const check = process.argv.includes("--check");
const token = process.env.FIGMA_TOKEN;
const fileKey = process.env.FIGMA_FILE_KEY;

if (!token || !fileKey) {
  console.error("✖ Set FIGMA_TOKEN and FIGMA_FILE_KEY.");
  process.exit(2);
}

const manifestPath = resolve(REPO, "manifest/components.json");
const overridesPath = resolve(REPO, "manifest/figma-overrides.json");
const variablesPath = resolve(REPO, "manifest/figma-variables.json");

const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as ComponentManifest;
const overrides = existsSync(overridesPath)
  ? (JSON.parse(readFileSync(overridesPath, "utf8")) as FigmaOverrides)
  : {};

const file = await figmaGet<FigmaDocument>(`/files/${fileKey}`, token);
const library = libraryComponents(file.document, (node) =>
  node.type === "COMPONENT_SET" ? file.componentSets?.[node.id]?.key : file.components?.[node.id]?.key,
);
const { manifest: next, report } = planSync(manifest, library, overrides);

const section = (title: string, items: string[]): void => {
  if (items.length) console.error(`\n${title} (${items.length})\n${items.map((i) => `  ${i}`).join("\n")}`);
};
console.error(`Linked ${report.linked.length} of ${library.length} Figma components, ${report.changed.length} changed.`);
section("In Figma, not in code", report.figmaOnly);
section("Linked before, gone from Figma", report.linkGone);
section("Property drift", report.drift);
section("In code, not in Figma", report.codeOnly);

let variables: FigmaVariableNames | undefined;
try {
  const response = await figmaGet<{ meta: { variables: Record<string, { key: string; name: string }> } }>(
    `/files/${fileKey}/variables/local`,
    token,
  );
  const sorted = Object.entries(response.meta.variables).sort(([a], [b]) => a.localeCompare(b));
  variables = Object.fromEntries(sorted.flatMap(([id, v]) => [[id, v.name], [v.key, v.name]]));
} catch (error) {
  if (!(error instanceof FigmaRequestError) || error.status !== 403) throw error;
  console.error("\n! Figma refused the variables endpoint, which needs an Enterprise plan. Variable names weren't refreshed.");
}

if (check) {
  const attention = report.figmaOnly.length + report.linkGone.length + report.drift.length + report.changed.length;
  process.exit(attention ? 1 : 0);
}

writeFileSync(manifestPath, `${JSON.stringify(next, null, 2)}\n`);
if (variables) writeFileSync(variablesPath, `${JSON.stringify(variables, null, 2)}\n`);
