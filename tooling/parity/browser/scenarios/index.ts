import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { BrowserScenario } from "./scenario.js";

export { ANGULAR_COMPONENTS } from "./scenario.js";
export type { BrowserScenario, Step } from "./scenario.js";

/**
 * Every scenario module in this directory, collected without a list anyone has
 * to remember to edit.
 *
 * The directory rather than a hand-written barrel, for the same reason
 * `src/cases/index.ts` uses a glob: a barrel entry that is forgotten leaves a
 * component silently uncovered — the gate stays green while saying nothing
 * about it, which is the exact failure this package exists to prevent. Dropping
 * a file in here is the whole of adding a component, so several people can add
 * several at once without editing the same line.
 *
 * `import.meta.glob` is not available here the way it is on the SSR side: this
 * module is loaded by Playwright, which transpiles with esbuild rather than
 * running through Vite. Reading the directory is the Node equivalent, and it
 * is safe precisely because nothing but Playwright ever imports this file.
 *
 * Sorted so the run order is the same on every machine — the gate's test titles
 * are derived from this list, and an order that shifted with the filesystem
 * would make an otherwise empty diff unreadable.
 */
const HERE = fileURLToPath(new URL(".", import.meta.url));
const SHARED = new Set(["index.ts", "scenario.ts"]);

/**
 * `"DateRangeInput.ts"` → `"date-range-input"`, to match the slugs
 * `scripts/quality/affected.mjs` emits. One scenario file per component is what
 * makes this a rename rather than a lookup.
 */
function slugOf(fileName: string): string {
  return fileName
    .slice(0, -".ts".length)
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

/**
 * CI's component filter, the same `QUALITY_COMPONENTS` the Storybook gates read
 * (see `apps/storybook/shared/story.ts`). Unset means every scenario, which is
 * what a local run and every push to main get.
 *
 * Filtering here rather than in each of the four specs is the same argument the
 * directory read above makes: the four browser gates share this list, and a
 * filter applied in three of them would leave the fourth quietly running
 * everything.
 */
const only = new Set(
  (process.env.QUALITY_COMPONENTS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

const files = readdirSync(HERE)
  .filter((name) => name.endsWith(".ts") && !name.endsWith(".d.ts") && !SHARED.has(name))
  .filter((name) => only.size === 0 || only.has(slugOf(name)))
  .sort();

const modules = await Promise.all(
  files.map(
    (name) => import(`./${name.slice(0, -".ts".length)}.js`) as Promise<{ default?: unknown }>,
  ),
);

export const SCENARIOS: BrowserScenario[] = modules.flatMap((module, index) => {
  // Everything in here is collected, so a file that is not a scenario module
  // has to say so loudly rather than arriving as `undefined` in a flatMap and
  // failing somewhere else. Shared helpers belong in `scenario.ts`.
  if (!Array.isArray(module.default)) {
    throw new Error(
      `parity harness: scenarios/${files[index]} must default-export a BrowserScenario[]`,
    );
  }
  return module.default as BrowserScenario[];
});
