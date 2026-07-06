/**
 * `verify-generated-code` CLI (Connect.md §7.4, Layer 4) —
 * `pnpm --filter @ui-organized/code-connect verify <files...>`.
 *
 * Scans agent-generated files against the manifest and reports hallucinated
 * components, unknown props, and missing uncertainty annotations. Exits non-zero on
 * any `error`-severity finding so it can gate a PR the same way lint does. Pass
 * `--strict` to also fail on warnings (§12 open decision — start non-blocking on
 * warnings, tighten later).
 */

import { resolve } from "node:path";
import { ManifestLoader } from "../src/mcp/manifest-loader.js";
import { verifyGeneratedCode } from "../src/flagging/verify.js";

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const files = args.filter((a) => !a.startsWith("--")).map((f) => resolve(process.cwd(), f));

if (files.length === 0) {
  console.error("usage: verify [--strict] <file.tsx> [more...]");
  process.exit(2);
}

const loader = new ManifestLoader();
const findings = verifyGeneratedCode(files, loader, process.cwd());

if (findings.length === 0) {
  console.log(`✓ verify: ${files.length} file(s), no issues`);
  process.exit(0);
}

let errors = 0;
let warnings = 0;
for (const f of findings) {
  const mark = f.severity === "error" ? "✗" : "⚠";
  if (f.severity === "error") errors++;
  else warnings++;
  console.log(`${mark} ${f.file}:${f.line}  [${f.kind}] ${f.message}`);
}
console.log(`\nverify: ${errors} error(s), ${warnings} warning(s)`);

process.exit(errors > 0 || (strict && warnings > 0) ? 1 : 0);
