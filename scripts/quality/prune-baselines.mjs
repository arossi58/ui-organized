/**
 * Delete visual baselines whose story no longer exists.
 *
 * Nothing removes a baseline when a story is renamed or deleted, so they
 * accumulate silently — the repo had 44 orphans from a `--default` → `--inspect`
 * rename and the Separator → Divider rename. They cost review noise and make the
 * baseline count lie about coverage.
 *
 * Pass `--check` to fail instead of deleting (used by the lint gate).
 */
import { readdirSync, readFileSync, rmSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const DIR = resolve(root, "apps/storybook/visual/__screenshots__");
const INDEX = resolve(root, "apps/storybook/storybook-static/index.json");
const check = process.argv.includes("--check");

if (!existsSync(INDEX)) {
  console.error(
    `✖ No Storybook build at ${INDEX}.\n` +
      `  Baselines are pruned against the built story index, so build first:\n` +
      `    pnpm --filter @ui-organized/storybook exec storybook build --quiet`,
  );
  process.exit(1);
}

const entries = JSON.parse(readFileSync(INDEX, "utf8")).entries;
const live = new Set(
  Object.values(entries)
    .filter((e) => e.type === "story")
    .map((e) => e.id),
);

const orphans = readdirSync(DIR).filter((file) => {
  const match = file.match(/^(.*)-(darwin|linux|win32)\.png$/);
  return match && !live.has(match[1]);
});

if (!orphans.length) {
  console.log("✓ No orphaned baselines.");
  process.exit(0);
}

if (check) {
  console.error(`✖ ${orphans.length} orphaned baseline(s) — the story no longer exists:`);
  for (const o of orphans) console.error(`    ${o}`);
  console.error("  Run `node scripts/quality/prune-baselines.mjs` to remove them.");
  process.exit(1);
}

for (const o of orphans) rmSync(resolve(DIR, o));
console.log(`✓ Pruned ${orphans.length} orphaned baseline(s).`);
