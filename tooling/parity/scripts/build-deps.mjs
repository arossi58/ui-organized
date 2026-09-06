/**
 * Rebuild the libraries this gate compares, unless something already has.
 *
 * The gate resolves each package through its published export conditions, so it
 * tests `dist` — and the first time a deliberately drifted class name was
 * injected here, the suite came back green against the *previous* build. Hence a
 * `pretest` that rebuilds whatever way vitest was invoked.
 *
 * **Except under turbo, where rebuilding is actively harmful.** `turbo test`
 * already builds this package's dependencies before running it, and a nested
 * `pnpm build` inside the task races every other task in the same run: tsup
 * cleans `packages/core/dist` while another package's vitest is halfway through
 * importing it. That failure is nastier than the one this script prevents,
 * because it lands on an innocent package — the marketing app's docs test — and
 * it poisons turbo's cache with a half-written `dist` that every later run
 * replays.
 *
 * `TURBO_HASH` is set in every process turbo spawns for a task, and nowhere
 * else, so it is exactly the signal for "the graph has already been built".
 */
import { spawnSync } from "node:child_process";

if (process.env.TURBO_HASH) {
  console.log("build-deps: skipped — turbo built the dependency graph already");
  process.exit(0);
}

/**
 * The table packages are in the list because the gate compares them: a
 * `DataTable` scenario resolves `@ui-organized/react-table` and its two ports
 * through their published export conditions, so a stale `dist` there is exactly
 * the failure this script exists to prevent — it was just less visible while the
 * table was outside the harness.
 */
const packages = [
  "core",
  "react",
  "svelte",
  "vue",
  "angular",
  "table-core",
  "react-table",
  "vue-table",
  "svelte-table",
  "angular-table",
];
const args = ["--filter", ...packages.flatMap((name) => [`@ui-organized/${name}`, "--filter"])];
args.pop();
const { status } = spawnSync("pnpm", [...args, "build"], { stdio: "inherit" });
process.exit(status ?? 1);
