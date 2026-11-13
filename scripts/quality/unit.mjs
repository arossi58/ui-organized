/**
 * Vitest, with a machine-readable report.
 *
 * The only place CI runs a vitest suite: no workflow runs `pnpm test` or `turbo
 * test`. This runs every workspace package's suite and captures per-test results
 * so the aggregator can attribute `packages/react/src/components/<Name>/*.test.tsx`
 * to a component's Interaction cell on its docs page.
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

/**
 * A suite run for its verdict alone: it can fail the gate, and it shows on the
 * /quality dashboard as one row under its package name, but its tests are not
 * filed one by one.
 *
 * The aggregator folds unit rows into the Interaction gate, which is right for a
 * component's tests and wrong for everything else. Parity's SSR suite alone is
 * 1,849 rows, and counted one by one the suites marked this way below would add
 * some 2,500 to a total that is meant to say something about interaction, while
 * measuring nothing about it.
 */
const verdictOnly = (name, options = {}) => ({ name, attribute: false, ...options });

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
 * Then it happened again, worse. When CI's `pnpm test` step became `pnpm
 * quality:unit`, every suite missing from this list stopped running anywhere but
 * a laptop: thirteen of them, among them code-connect (what the MCP server
 * answers from), the CLI, the token pipeline and the SSR half of the parity gate.
 * The comment above this list went on saying the rest "still run under `pnpm
 * test`". Nothing ran them. Hence `unlistedSuites()` below: a package with a
 * `test` script that is missing here fails this gate, because a suite this list
 * does not name is a suite nothing runs.
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
  // The SSR half of the cross-framework parity gate. The browser half needs a
  // browser, so it is a matrix entry of its own in ci.yml.
  verdictOnly("@ui-organized/parity"),
  // What the MCP server and `uiorg init` are built from, and the CLI itself.
  verdictOnly("@ui-organized/code-connect"),
  verdictOnly("@ui-organized/cli"),
  verdictOnly("@ui-organized/storybook-inspector"),
  // The token pipeline, and the packages and plugin built on it.
  verdictOnly("@ui-organized/tokens"),
  verdictOnly("@ui-organized/utils"),
  verdictOnly("@ui-organized/schema"),
  verdictOnly("@ui-organized/resolver"),
  verdictOnly("@ui-organized/export"),
  verdictOnly("@ui-organized/token-io"),
  verdictOnly("@ui-organized/pack-ui-organized"),
  verdictOnly("@ui-organized/figma-token-plugin"),
  // No tests yet, and its own `test` script passes with none. Listed now so its
  // first suite runs in CI the day it lands; drop the flag then, so an include
  // glob that stops matching fails rather than passes.
  verdictOnly("@ui-organized/react-vite", { passWithNoTests: true }),
].map((entry) => (typeof entry === "string" ? { name: entry, attribute: true } : entry));

/**
 * Workspace packages with a `test` script that the list above does not name.
 *
 * Asked of pnpm rather than globbed, so it sees exactly the workspace that
 * `pnpm-workspace.yaml` defines, exclusions included. `undefined` when pnpm
 * cannot answer, which fails the gate: a coverage check that could not run must
 * not read as one that found nothing.
 */
function unlistedSuites() {
  const result = spawnSync("pnpm", ["list", "--recursive", "--depth", "-1", "--json"], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0 || !result.stdout) return undefined;
  let workspace;
  try {
    workspace = JSON.parse(result.stdout);
  } catch {
    return undefined;
  }
  const rootName = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")).name;
  const listed = new Set(PACKAGES.map((pkg) => pkg.name));
  return workspace
    .filter(({ name, path }) => {
      // The root's `test` is `turbo test`: every suite, not one of its own.
      if (!name || name === rootName || listed.has(name)) return false;
      try {
        return Boolean(
          JSON.parse(readFileSync(resolve(path, "package.json"), "utf8")).scripts?.test,
        );
      } catch {
        return false;
      }
    })
    .map(({ name }) => name)
    .sort();
}

/**
 * Narrowed to the packages a change can reach, when CI says so.
 *
 * `QUALITY_PACKAGES` is pnpm's own `...[base]` answer, computed in
 * `scripts/quality/affected.mjs` — so it carries *dependents*, and editing
 * `table-core` still runs `react-table`'s suite. Unset means all of them, which
 * is what a local run and every push to main get.
 *
 * Intersected rather than trusted: pnpm also reports packages with no suite at
 * all (the apps, the examples, the shared configs), and there is nothing here to
 * run for those.
 */
const only = new Set(
  (process.env.QUALITY_PACKAGES ?? "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean),
);

/**
 * An example app selects the marketing suite.
 *
 * The marketing suite holds the check that Get Started's snippets are still the
 * examples' entry files (`getStartedSnippets.test.ts`). No example is a
 * dependency of the docs site, so pnpm never lists marketing as affected by
 * one, and a PR that edited only an example's `main.ts` or `angular.json`
 * would skip the one test that compares it with the page.
 */
if ([...only].some((name) => name.startsWith("@ui-organized/example-"))) {
  only.add("@ui-organized/marketing");
}
const selected = only.size ? PACKAGES.filter((pkg) => only.has(pkg.name)) : PACKAGES;

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
// One entry per package, attributed or not: its verdict and its counts. The
// aggregator reads these for the verdict-only suites, and for any suite that
// failed without a failing test to show for it.
const suites = [];
let failed = false;

// Not narrowed by QUALITY_PACKAGES: a suite missing from the list is missing
// from every run.
const unlisted = unlistedSuites();
if (unlisted === undefined) {
  failed = true;
  console.log("✗ pnpm could not list the workspace, so nothing checked that every suite runs");
} else {
  for (const name of unlisted) {
    failed = true;
    suites.push({
      name,
      attribute: false,
      status: "fail",
      unlisted: true,
      passed: 0,
      failed: 0,
      skipped: 0,
    });
    console.log(
      `✗ ${name} has a \`test\` script but is not in PACKAGES (scripts/quality/unit.mjs), ` +
        `so no CI job runs it`,
    );
  }
}

for (const pkg of selected) {
  const out = resolve(QUALITY, `vitest-${pkg.name.replace(/[@/]/g, "-")}.json`);
  rmSync(out, { force: true });
  const result = spawnSync(
    "pnpm",
    [
      "--filter",
      pkg.name,
      "exec",
      "vitest",
      "run",
      "--reporter=json",
      `--outputFile=${out}`,
      ...(pkg.passWithNoTests ? ["--passWithNoTests"] : []),
    ],
    { cwd: root, encoding: "utf8" },
  );
  if (result.status !== 0) {
    failed = true;
    console.log(result.stdout ?? "");
    console.log(result.stderr ?? "");
  }

  let report;
  try {
    report = existsSync(out) ? JSON.parse(readFileSync(out, "utf8")) : undefined;
  } catch {
    report = undefined;
  }
  const counts = { pass: 0, fail: 0, skip: 0 };
  for (const suite of report?.testResults ?? []) {
    for (const test of suite.assertionResults ?? []) {
      const status = test.status === "passed" ? "pass" : SKIPPED.has(test.status) ? "skip" : "fail";
      counts[status]++;
      if (!pkg.attribute) continue;
      tests.push({
        file: relative(root, suite.name ?? ""),
        name: test.fullName ?? test.title,
        status,
      });
    }
  }
  suites.push({
    name: pkg.name,
    attribute: pkg.attribute,
    status: result.status === 0 ? "pass" : "fail",
    passed: counts.pass,
    failed: counts.fail,
    skipped: counts.skip,
  });
}

writeFileSync(
  resolve(QUALITY, "unit.json"),
  JSON.stringify({ status: failed ? "fail" : "pass", suites, tests }, null, 2) + "\n",
);

// Per package as well as in total, so a CI log says which suites a narrowed run
// actually ran.
console.log("");
for (const suite of suites) {
  const counts =
    `${suite.passed} passed` +
    `${suite.failed ? `, ${suite.failed} failed` : ""}` +
    `${suite.skipped ? `, ${suite.skipped} skipped` : ""}` +
    `${suite.unlisted ? " (never run: missing from PACKAGES)" : ""}`;
  console.log(`  ${suite.status === "fail" ? "✗" : "✓"} ${suite.name.padEnd(36)} ${counts}`);
}
const total = (key) => suites.reduce((sum, suite) => sum + suite[key], 0);
console.log(
  `\n${failed ? "✗" : "✓"} unit: ${total("passed")} passed` +
    `${total("failed") ? `, ${total("failed")} failed` : ""}` +
    `${total("skipped") ? `, ${total("skipped")} skipped` : ""}\n`,
);
process.exit(failed ? 1 : 0);
