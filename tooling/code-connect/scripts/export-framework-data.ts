/**
 * Write Svelte, Vue and Angular's AI data — export surface, own scanned
 * manifest, version — to one JSON file, for `@ui-organized/mcp` to ship. A
 * consumer's machine has none of the libraries' source, so the published server
 * reads this instead of calling `loadFrameworkData()`.
 *
 *   tsx scripts/export-framework-data.ts <outFile>
 */

import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadFrameworkData } from "../src/framework-data.js";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const out = process.argv[2];
if (!out) {
  process.stderr.write("usage: export-framework-data <outFile>\n");
  process.exit(1);
}

const data = loadFrameworkData(REPO);
for (const [framework, d] of Object.entries(data)) {
  if (!d.surface.exports.length) {
    process.stderr.write(`✗ ${framework}: no exports found — is the package in this checkout?\n`);
    process.exit(1);
  }
}
writeFileSync(out, `${JSON.stringify(data)}\n`);
