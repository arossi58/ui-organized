/**
 * Run the visual gate inside the pinned Playwright container.
 *
 * Screenshot baselines are per-platform: Playwright suffixes each one with the
 * platform that rendered it (`snapshotPathTemplate` in
 * apps/storybook/playwright.config.ts). Font rasterisation differs between macOS,
 * a bare ubuntu-latest runner and the Playwright image, so a baseline only means
 * something if everyone renders it the same way - which means everyone renders
 * it in this container.
 *
 * As things stand the committed set is 334 `-darwin` files and no `-linux` ones,
 * so CI has no oracle for the platform it actually renders on. That is what this
 * script is for: run it once with `--update-snapshots` and commit the `-linux`
 * set. Until then the gate reports those baselines as "not yet recorded" rather
 * than as diffs, which the aggregator distinguishes deliberately - "we have never
 * measured this" and "this changed" are different facts.
 *
 * Regenerate baselines after an intended visual change:
 *   pnpm --filter @ui-organized/storybook run test:visual:docker -- --update-snapshots
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

// Pinned to the @playwright/test version in apps/storybook, because the browser
// build is what determines the pixels. Bumping one without the other silently
// invalidates every baseline.
const pkg = JSON.parse(readFileSync(resolve(root, "apps/storybook/package.json"), "utf8"));
const version = (pkg.devDependencies["@playwright/test"] ?? "").replace(/^[^0-9]*/, "");
const image = `mcr.microsoft.com/playwright:v${version}-noble`;

if (spawnSync("docker", ["info"], { stdio: "ignore" }).status !== 0) {
  console.error(
    `x Docker is not available.\n\n` +
      `  Visual baselines are rendered in ${image} so that a\n` +
      `  developer's screenshots are byte-identical to CI's. Without Docker you can still\n` +
      `  run every other gate, and CI will run this one on your PR.\n\n` +
      `  To regenerate baselines locally, install Docker Desktop and re-run.`,
  );
  process.exit(1);
}

const passthrough = process.argv.slice(2).join(" ");
const result = spawnSync(
  "docker",
  [
    "run",
    "--rm",
    "--ipc=host",
    "-v",
    `${root}:/work`,
    "-w",
    "/work",
    image,
    "bash",
    "-lc",
    [
      "corepack enable",
      "pnpm install --frozen-lockfile",
      "pnpm --filter @ui-organized/storybook exec storybook build --quiet",
      `pnpm --filter @ui-organized/storybook exec playwright test --project=visual ${passthrough}`,
    ].join(" && "),
  ],
  { stdio: "inherit" },
);
process.exit(result.status ?? 1);
