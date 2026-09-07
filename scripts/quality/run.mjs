/**
 * `pnpm quality` — every gate, one command, one report.
 *
 * Runs the five gates in cost order (cheap and blocking first), always
 * aggregates at the end, and exits non-zero only if a **blocking** gate failed.
 * Visual and cross-browser are advisory: they still run, still report, and still
 * show on the docs pages, but they do not fail the command.
 *
 * Nothing short-circuits. A failing lint gate must not hide a failing a11y gate
 * — the point of running everything is to see everything, and a stop-on-first
 * gate turns one run into six.
 *
 * Flags:
 *   --skip-build    reuse the existing Storybook build (much faster to iterate)
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const skipBuild = process.argv.includes("--skip-build");

const run = (cmd, args) =>
  spawnSync(cmd, args, { cwd: root, stdio: "inherit", encoding: "utf8" }).status ?? 1;

const rule = (title) => console.log(`\n== ${title} ${"=".repeat(Math.max(0, 58 - title.length))}`);

// Stale reports from a previous run would be aggregated as if they were this
// run's results — a gate that crashed before writing its report would appear to
// have passed, which is the most dangerous failure mode this script has.
rmSync(resolve(root, ".quality"), { recursive: true, force: true });
mkdirSync(resolve(root, ".quality"), { recursive: true });

const results = {};

rule("Lint & token validation");
results.lint = run("node", ["scripts/quality/lint.mjs"]);

rule("Unit tests");
results.unit = run("node", ["scripts/quality/unit.mjs"]);

if (!skipBuild) {
  rule("Building Storybook");
  // One build, four gates. Rebuilding per gate would roughly quadruple the run
  // for no added signal.
  const build = run("pnpm", [
    "--filter",
    "@ui-organized/storybook",
    "exec",
    "storybook",
    "build",
    "--quiet",
  ]);
  if (build !== 0) {
    console.error("\nx Storybook build failed - the browser gates cannot run.\n");
    process.exit(1);
  }
} else if (!existsSync(resolve(root, "apps/storybook/storybook-static/index.json"))) {
  console.error("\nx --skip-build was passed but there is no Storybook build to reuse.\n");
  process.exit(1);
}

const gate = (label, script) => {
  rule(label);
  results[script] = run("pnpm", ["run", `quality:${script}`]);
};

gate("Accessibility (blocking)", "a11y");
/**
 * The other three libraries' accessibility, which the Storybook gate above
 * cannot reach: it depends on `@ui-organized/react` alone. This one runs on the
 * parity harness and compares Svelte, Vue and Angular against React's own axe
 * result at the same scenario — see `tooling/parity/browser/a11y.browser.spec.ts`
 * for why comparing beats scoring here. Blocking, like its React counterpart.
 */
gate("Accessibility · svelte/vue/angular (blocking)", "a11y:frameworks");
gate("Interaction (blocking)", "interaction");
gate("Visual regression (advisory)", "visual");
gate("Cross-browser smoke (advisory)", "browsers");

rule("Aggregating");
run("node", ["scripts/quality/aggregate.mjs"]);

// Advisory gates are excluded from the exit status by design - see the header.
const blocking = {
  lint: results.lint,
  unit: results.unit,
  a11y: results.a11y,
  "a11y:frameworks": results["a11y:frameworks"],
  interaction: results.interaction,
};
const failed = Object.entries(blocking).filter(([, code]) => code !== 0);
const advisory = Object.entries({ visual: results.visual, browsers: results.browsers })
  .filter(([, code]) => code !== 0)
  .map(([name]) => name);

if (advisory.length) {
  console.log(`\n! advisory gate(s) reporting failures: ${advisory.join(", ")}`);
  console.log("  Not blocking. See the summary above and manifest/test-status.json.");
}
if (failed.length) {
  console.error(`\nx blocking gate(s) failed: ${failed.map(([n]) => n).join(", ")}\n`);
  process.exit(1);
}
console.log("\nok - all blocking gates passed\n");
