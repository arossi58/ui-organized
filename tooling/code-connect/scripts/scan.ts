/**
 * Manifest Sync CLI (Connect.md §5) — `pnpm --filter @ui-organized/code-connect scan`.
 *
 * Reads real component code, reconciles it against the committed manifest, and
 * writes `manifest/components.json` + `manifest/latest-hashes.json` at the repo
 * root. Runs locally and (per §9) as a CI job on merge to main.
 *
 * The scanner is the ONLY writer of `propSignatureHash` (Connect.md §8) — it always
 * computes from current code, never from memory of when a mapping was made.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { ComponentManifest } from "../src/schema.js";
import { scanReact } from "../src/scanner/scan-react.js";
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
const counts = { created: 0, updated: 0, deprecated: 0, unchanged: 0 };
for (const c of changes) counts[c.kind]++;

console.log(`code-connect scan → ${manifest.components.length} components`);
console.log(
  `  ${counts.created} created, ${counts.updated} updated, ` +
    `${counts.deprecated} deprecated, ${counts.unchanged} unchanged`,
);
for (const c of changes) {
  if (c.kind === "unchanged") continue;
  const mark = c.kind === "created" ? "+" : c.kind === "deprecated" ? "✗" : "~";
  console.log(`  ${mark} ${c.component}  (${c.codePath})`);
}
