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
/**
 * Every package with a unit suite, not just React's.
 *
 * This list was four entries while React was the only framework, and stayed four
 * after three more shipped — so `@ui-organized/core`'s 50 tests, Angular's 529,
 * Svelte's and Vue's 49 each and the three table adapters' all ran under `turbo
 * test` and reached the dashboard as nothing at all. A gate nobody can see the
 * result of is not reporting, and the quality page read as though the design
 * system were still one framework wide.
 *
 * `@ui-organized/core` earns its place twice over: it holds the framework-purity
 * assertion, the check that keeps a fifth adapter possible.
 */
const PACKAGES = [
  "@ui-organized/core",
  "@ui-organized/react",
  "@ui-organized/svelte",
  "@ui-organized/vue",
  "@ui-organized/angular",
  // The table ships as its own packages (see TABLE.md): the framework-free
  // engine and one adapter per framework, all attributed to the Data Table's
  // docs page.
  "@ui-organized/table-core",
  "@ui-organized/react-table",
  "@ui-organized/vue-table",
  "@ui-organized/svelte-table",
  "@ui-organized/angular-table",
  "@ui-organized/marketing",
];

/**
 * Narrowed to the packages a change can reach, when CI says so.
 *
 * `QUALITY_PACKAGES` is pnpm's own `...[base]` answer, computed in
 * `scripts/quality/affected.mjs` — so it carries *dependents*, and editing
 * `table-core` still runs `react-table`'s suite. Unset means all of them, which
 * is what a local run and every push to main get.
 *
 * Intersected rather than trusted: this list is the set with results worth
 * attributing to a docs page, and a package pnpm reports as affected but that is
 * absent here has nowhere to put its numbers.
 */
const only = new Set(
  (process.env.QUALITY_PACKAGES ?? "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean),
);
const selected = only.size ? PACKAGES.filter((pkg) => only.has(pkg)) : PACKAGES;

if (selected.length !== PACKAGES.length) {
  console.log(
    `Unit: ${selected.length} of ${PACKAGES.length} packages (narrowed by QUALITY_PACKAGES)`,
  );
}

/**
 * Vitest spells a skipped test three ways and this only knew one of them.
 *
 * The JSON reporter is jest-shaped, so `pending` was a fair guess — but vitest
 * emits `skipped` for `it.skip` and `describe.skipIf`, and `todo` for `it.todo`.
 * Everything not on this list was mapped to `fail`, which means a skipped test
 * was recorded in `.quality/unit.json` as a failing one and counted as a failure
 * on the /quality dashboard and on the component's docs page.
 *
 * It never failed the gate — that is driven by vitest's own exit code, which is
 * why this sat unnoticed — so the symptom was purely a number that was wrong in
 * the one direction nobody double-checks: worse than reality.
 */
const SKIPPED = new Set(["pending", "skipped", "todo"]);

const tests = [];
let failed = false;

for (const pkg of selected) {
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
        status: test.status === "passed" ? "pass" : SKIPPED.has(test.status) ? "skip" : "fail",
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
