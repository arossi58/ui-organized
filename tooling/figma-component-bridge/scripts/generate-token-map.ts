/**
 * Generate the committed Token Name Map snapshot.
 *
 * Enumerates every CSS custom property the design system emits (from the
 * canonical `@ui-organized/tokens` output, `variables.css`) and applies the
 * locked {@link cssVarToFigma} rules, producing `src/generated/token-name-map.json`
 * — a reviewable, diffable artifact: when tokens change, the map diff shows up in
 * the PR rather than being silently re-derived. The plugin's runtime resolver
 * uses the rule directly; this JSON is the golden snapshot + what the (future)
 * companion service can ship for offline mode.
 *
 * Run: pnpm --filter @ui-organized/figma-component-bridge generate:token-map
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { cssVarToFigma, type FigmaVarRef } from "../src/tokenNaming";

const here = dirname(fileURLToPath(import.meta.url));
const CSS_PATH = resolve(here, "../../../packages/tokens/output/variables.css");
const OUT_DIR = resolve(here, "../src/generated");
const OUT_PATH = resolve(OUT_DIR, "token-name-map.json");

const css = readFileSync(CSS_PATH, "utf8");

// Unique custom-property names (left-hand side of a `--foo: …;` declaration).
const names = [
  ...new Set([...css.matchAll(/(--[A-Za-z0-9-]+)\s*:/g)].map((m) => m[1]!)),
].sort();

const map: Record<string, FigmaVarRef> = {};
let unmapped = 0;
for (const cssVar of names) {
  const ref = cssVarToFigma(cssVar);
  if (ref) map[cssVar] = ref;
  else unmapped++; // primitives + anything without a stable Figma name
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_PATH, JSON.stringify(map, null, 2) + "\n");

const mapped = Object.keys(map).length;
console.log(
  `token-name-map.json: ${mapped} mapped, ${unmapped} unmapped (primitives), ${names.length} css vars total`,
);

// Spot-check the tricky cases so a rule regression is obvious in the log.
const checks = [
  "--color-interactive-primary-default",
  "--color-interactive-destructive-default-ghost",
  "--color-text-primary",
  "--radius-interactive",
  "--control-height-md",
  "--spacing-space-01",
  "--border-radius-04",
  "--Button-Medium-horizontal",
  "--type-size-body-small",
  "--grey-1000",
];
console.log("spot checks:");
for (const v of checks) {
  const ref = cssVarToFigma(v);
  console.log(`  ${v.padEnd(46)} → ${ref ? `${ref.collection}:${ref.name}` : "(unmapped)"}`);
}
