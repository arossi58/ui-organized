/**
 * Vitest, with a machine-readable report.
 *
 * `turbo test` fans out across every package and prints for humans; this runs
 * the same suites but captures per-test results so the aggregator can attribute
 * `packages/react/src/components/<Name>/*.test.tsx` to a component's
 * Interaction cell on its docs page.
 *
 * Writes `.quality/unit.json`. Exits non-zero if anything failed.
 */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { resolve, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const QUALITY = resolve(root, ".quality");
mkdirSync(QUALITY, { recursive: true });

// Packages whose vitest results are worth attributing. The rest still run under
// `pnpm test`; they just have no component to attach to.
const PACKAGES = ["@ui-organized/react", "@ui-organized/marketing"];

const tests = [];
let failed = false;

for (const pkg of PACKAGES) {
  const out = resolve(QUALITY, `vitest-${pkg.replace(/[@/]/g, "-")}.json`);
  rmSync(out, { force: true });
  const result = spawnSync(
    "pnpm",
    ["--filter", pkg, "exec", "vitest", "run", "--reporter=json", `--outputFile=${out}`],
    { cwd: root, encoding: "utf8" },
  );
  if (result.status !== 0) {
    failed = true;
    console.log(result.stdout ?? "");
    console.log(result.stderr ?? "");
  }
  if (!existsSync(out)) continue;

  let report;
  try {
    report = JSON.parse(readFileSync(out, "utf8"));
  } catch {
    continue;
  }
  for (const suite of report.testResults ?? []) {
    for (const test of suite.assertionResults ?? []) {
      tests.push({
        file: relative(root, suite.name ?? ""),
        name: test.fullName ?? test.title,
        status: test.status === "passed" ? "pass" : test.status === "pending" ? "skip" : "fail",
      });
    }
  }
}

writeFileSync(
  resolve(QUALITY, "unit.json"),
  JSON.stringify({ status: failed ? "fail" : "pass", tests }, null, 2) + "\n",
);

const counts = tests.reduce((acc, t) => ({ ...acc, [t.status]: (acc[t.status] ?? 0) + 1 }), {});
console.log(
  `\n${failed ? "✗" : "✓"} unit: ${counts.pass ?? 0} passed` +
    `${counts.fail ? `, ${counts.fail} failed` : ""}${counts.skip ? `, ${counts.skip} skipped` : ""}\n`,
);
process.exit(failed ? 1 : 0);
