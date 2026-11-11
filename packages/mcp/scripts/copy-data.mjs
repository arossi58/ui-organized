#!/usr/bin/env node
/**
 * Copies what the server reads into `dist/data`. A missing input fails the build:
 * a server shipped without these answers every question with "doesn't exist",
 * which an agent would believe.
 */

import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const pkgRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repo = join(pkgRoot, "../..");
const out = join(pkgRoot, "dist/data");
mkdirSync(out, { recursive: true });

for (const source of [
  "manifest/components.json",
  "manifest/latest-hashes.json",
  "packages/tokens/output/variables.css",
]) {
  const from = join(repo, source);
  if (!existsSync(from)) {
    process.stderr.write(`✗ ${source} is missing. Build @ui-organized/tokens and run the code-connect scan.\n`);
    process.exit(1);
  }
  copyFileSync(from, join(out, source.split("/").pop()));
}

// Optional: it only exists once figma:sync has run, and the server reports unnamed variables.
const variables = join(repo, "manifest/figma-variables.json");
if (existsSync(variables)) copyFileSync(variables, join(out, "figma-variables.json"));

// Svelte, Vue and Angular: each library's export surface, own scanned manifest and
// version, so the server can answer for a project in any of the four.
const codeConnect = join(repo, "tooling/code-connect");
const exported = spawnSync(
  join(codeConnect, "node_modules/.bin/tsx"),
  [join(codeConnect, "scripts/export-framework-data.ts"), join(out, "frameworks.json")],
  { stdio: "inherit" },
);
if (exported.status !== 0) {
  process.stderr.write("✗ Couldn't export the Svelte/Vue/Angular data. Run the code-connect scan first.\n");
  process.exit(1);
}

const { version: reactVersion } = JSON.parse(readFileSync(join(repo, "packages/react/package.json"), "utf8"));
writeFileSync(join(out, "meta.json"), `${JSON.stringify({ reactVersion })}\n`);
