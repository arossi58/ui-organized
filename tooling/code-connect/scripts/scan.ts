/**
 * Manifest Sync CLI — `pnpm --filter @ui-organized/code-connect scan`.
 *
 * Reads real component code, reconciles it against the committed manifest, and
 * writes `manifest/components.json`, `manifest/latest-hashes.json` and
 * `manifest/frameworks/*.json`. Run it locally and commit the result. CI doesn't
 * write it: the lint gate (`scripts/quality/lint.mjs`, check 8
 * "component-manifest") re-runs it and fails if anything under `manifest/` changes.
 *
 * The scanner is the ONLY writer of `propSignatureHash` — it always
 * computes from current code, never from memory of when a mapping was made.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { ComponentManifest } from "../src/schema.js";
import { scanReact, scanLibrary, LIBRARIES, type ScannedComponent } from "../src/scanner/scan-react.js";
import { scanAngular } from "../src/scanner/scan-angular.js";
import { loadFrameworkSurfaces } from "../src/framework-data.js";
import { resolveTarget } from "../src/frameworks.js";
import { reconcile } from "../src/scanner/manifest-writer.js";

const here = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(here, "../../..");
const MANIFEST_DIR = resolve(REPO, "manifest");
const COMPONENTS_PATH = resolve(MANIFEST_DIR, "components.json");
const HASHES_PATH = resolve(MANIFEST_DIR, "latest-hashes.json");

function readManifest(): ComponentManifest | null {
  try {
    return JSON.parse(readFileSync(COMPONENTS_PATH, "utf8")) as ComponentManifest;
  } catch {
    return null; // first run — no manifest yet
  }
}

const existing = readManifest();
const scanned = scanReact(REPO);
const now = new Date().toISOString();
const { manifest, latestHashes, changes } = reconcile(existing, scanned, now);

mkdirSync(MANIFEST_DIR, { recursive: true });
writeFileSync(COMPONENTS_PATH, JSON.stringify(manifest, null, 2) + "\n");
writeFileSync(HASHES_PATH, JSON.stringify(latestHashes, null, 2) + "\n");

// ─── Report ───────────────────────────────────────────────────────────────────
const counts = { created: 0, updated: 0, deprecated: 0, removed: 0, unchanged: 0 };
for (const c of changes) counts[c.kind]++;

console.log(`code-connect scan → ${manifest.components.length} components`);
console.log(
  `  ${counts.created} created, ${counts.updated} updated, ` +
    `${counts.deprecated} deprecated, ${counts.removed} removed, ${counts.unchanged} unchanged`,
);
for (const c of changes) {
  if (c.kind === "unchanged") continue;
  const mark = c.kind === "created" ? "+" : c.kind === "deprecated" ? "✗" : c.kind === "removed" ? "-" : "~";
  console.log(`  ${mark} ${c.component}  (${c.codePath})`);
}

// ─── Svelte, Vue and Angular ──────────────────────────────────────────────────
// Each library's own props, scanned from its own source, so its AI specs and MCP
// answers describe what that package really accepts. Figma keys stay on the
// React entries: a framework entry reaches them through `reactName`.
const reactNames = new Set(manifest.components.filter((c) => c.status !== "deprecated").map((c) => c.codeName));
const FRAMEWORK_DIR = resolve(MANIFEST_DIR, "frameworks");
mkdirSync(FRAMEWORK_DIR, { recursive: true });

// Angular renames (`UioButton`, and aliases like `UioToastRegion`), so its link
// back to React goes through the same `resolveTarget` the docs site uses.
const angularSurface = loadFrameworkSurfaces(REPO).angular;
const reactForAngular = new Map<string, string>();
for (const name of reactNames) {
  const symbol = resolveTarget("angular", name, angularSurface)?.symbol;
  if (symbol && !reactForAngular.has(symbol)) reactForAngular.set(symbol, name);
}

const SCANS: Record<"svelte" | "vue" | "angular", () => ScannedComponent[]> = {
  svelte: () =>
    scanLibrary(REPO, LIBRARIES.svelte).map((c) => (reactNames.has(c.codeName) ? { ...c, reactName: c.codeName } : c)),
  vue: () => scanLibrary(REPO, LIBRARIES.vue).map((c) => (reactNames.has(c.codeName) ? { ...c, reactName: c.codeName } : c)),
  angular: () =>
    scanAngular(REPO).map((c) => {
      const reactName = reactForAngular.get(c.codeName);
      return reactName ? { ...c, reactName } : c;
    }),
};

for (const framework of ["svelte", "vue", "angular"] as const) {
  const path = resolve(FRAMEWORK_DIR, `${framework}.json`);
  let previous: ComponentManifest | null = null;
  try {
    previous = JSON.parse(readFileSync(path, "utf8")) as ComponentManifest;
  } catch {
    previous = null;
  }
  const result = reconcile(previous, SCANS[framework](), now);
  writeFileSync(path, JSON.stringify(result.manifest, null, 2) + "\n");
  const changed = result.changes.filter((c) => c.kind !== "unchanged").length;
  console.log(`  ${framework}: ${result.manifest.components.length} components (${changed} changed) → manifest/frameworks/${framework}.json`);
}
