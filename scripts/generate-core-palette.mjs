/**
 * Core palette generator.
 *
 * `tokens-update/core-color.css` is the authored source of truth for the design
 * system's primitive color families (each a 24-step ramp, 100 lightest → 2400
 * darkest). This script reads it and regenerates every downstream artifact that
 * mirrors the core palette, so the "UI Organized" default everywhere stays in
 * lock-step with that one file:
 *
 *   1. packages/tokens/src/primitive/core-color.json
 *        DTCG primitive tokens consumed by the Style Dictionary build.
 *   2. packages/utils/src/coreColors.ts  (CORE_HEX + neutral/brand family lists)
 *        The core color library used across packages.
 *   3. apps/marketing/src/tools/color-palette/constants/defaultPalette.js
 *        The color palette generator tool's default "UI Organized" collection.
 *
 * Run after editing tokens-update/core-color.css:
 *   pnpm generate:palette
 *
 * Then rebuild the token CSS if needed:
 *   pnpm --filter @ui-organized/tokens build:tokens
 *
 * Pure Node (no dependencies). Idempotent: re-running with an unchanged source
 * leaves every output byte-identical.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname, relative } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ─── Paths ──────────────────────────────────────────────────────────────────

const SOURCE_CSS = resolve(ROOT, "tokens-update/core-color.css");
const OUT_TOKENS_JSON = resolve(ROOT, "packages/tokens/src/primitive/core-color.json");
const OUT_CORE_COLORS_TS = resolve(ROOT, "packages/utils/src/coreColors.ts");
const OUT_DEFAULT_PALETTE = resolve(
  ROOT,
  "apps/marketing/src/tools/color-palette/constants/defaultPalette.js",
);

// ─── Palette conventions ──────────────────────────────────────────────────────

// The 24 canonical ramp steps, lightest → darkest.
const STEPS = Array.from({ length: 24 }, (_, i) => String((i + 1) * 100));

// The base/primary weight of every family (the design system's main stop).
const MAIN_STEP = "1200";
const MAIN_STOP_INDEX = STEPS.indexOf(MAIN_STEP); // 11

// Low-chroma tinted-grey families — drive surfaces, borders, and text. The
// brand/neutral split is a curated classification that the flat CSS can't carry,
// so we keep it here. Everything not listed is treated as a brand hue.
const NEUTRAL_FAMILIES = new Set([
  "grey", "dove", "mythical", "flint", "waterloo", "stone",
  "cave", "juniper", "battleship", "squirrel", "hemp",
]);

// ─── Parse the source CSS ─────────────────────────────────────────────────────

/**
 * Parse `--family-step: #hex;` declarations into an ordered map of
 * family → { step: hex }, preserving first-seen family order.
 */
function parseCoreColorCss(css) {
  const families = new Map();
  const re = /--([a-z][a-z0-9]*)-(\d+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g;
  let match;
  while ((match = re.exec(css)) !== null) {
    const [, family, step, hex] = match;
    if (!families.has(family)) families.set(family, {});
    families.get(family)[step] = hex.toLowerCase();
  }
  return families;
}

/** Validate every family has exactly the 24 canonical steps. */
function validate(families) {
  if (families.size === 0) {
    throw new Error(`No color families found in ${rel(SOURCE_CSS)}.`);
  }
  for (const [family, stops] of families) {
    const missing = STEPS.filter((s) => !(s in stops));
    const extra = Object.keys(stops).filter((s) => !STEPS.includes(s));
    if (missing.length || extra.length) {
      throw new Error(
        `Family "${family}" has irregular steps` +
          (missing.length ? ` (missing ${missing.join(", ")})` : "") +
          (extra.length ? ` (unexpected ${extra.join(", ")})` : "") +
          `. Expected the 24-step ramp 100…2400.`,
      );
    }
  }
}

/** Order a family's stops lightest → darkest as an array of hex strings. */
function orderedStops(stops) {
  return STEPS.map((s) => stops[s]);
}

/** "grey" → "Grey" (display name used by the palette tool). */
function titleCase(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function rel(p) {
  return relative(ROOT, p);
}

// ─── Emitters ─────────────────────────────────────────────────────────────────

/** packages/tokens/src/primitive/core-color.json — DTCG color tokens. */
function buildTokensJson(families) {
  const tree = {};
  for (const [family, stops] of families) {
    tree[family] = {};
    for (const step of STEPS) {
      tree[family][step] = { $type: "color", $value: stops[step] };
    }
  }
  return JSON.stringify(tree, null, 2) + "\n";
}

/** apps/marketing/.../defaultPalette.js — the "UI Organized" default collection. */
function buildDefaultPalette(families) {
  const header = `// The default "UI Organized" collection IS the design system's global color
// tokens. GENERATED from tokens-update/core-color.css by
// scripts/generate-core-palette.mjs — every family is the canonical 24-step ramp
// (100 lightest -> 2400 darkest). The base \`color\` is the ${MAIN_STEP} weight, the
// design system's primary stop (mainStopIndex ${MAIN_STOP_INDEX}). Do not edit by hand; edit the
// source CSS and re-run \`pnpm generate:palette\`.
export const DEFAULT_PALETTE = [`;

  const rows = [];
  let id = 1;
  for (const [family, stops] of families) {
    const ordered = orderedStops(stops);
    const customStops = ordered.map((h) => `'${h}'`).join(",");
    rows.push(
      `  { id: ${id}, name: '${titleCase(family)}', color: '${stops[MAIN_STEP]}', ` +
        `customStops: [${customStops}] },`,
    );
    id += 1;
  }
  return `${header}\n${rows.join("\n")}\n];\n`;
}

/** A single CORE_HEX line: `  grey: { "100":"#...", ... },` */
function coreHexLine(family, stops) {
  const pairs = STEPS.map((s) => `"${s}":"${stops[s]}"`).join(", ");
  return `  ${family}: { ${pairs} },`;
}

/**
 * Patch packages/utils/src/coreColors.ts in place: regenerate the CORE_HEX
 * object literal and the NEUTRAL/BRAND family lists, preserving every other line
 * (imports, toRamp, exported getters) verbatim.
 */
function patchCoreColors(existing, families) {
  // ── CORE_HEX block ──
  const hexLines = [...families.entries()]
    .map(([family, stops]) => coreHexLine(family, stops))
    .join("\n");
  const coreHexBlock =
    "const CORE_HEX: Record<string, Record<string, string>> = {\n" +
    hexLines +
    "\n};";

  const startMarker = "const CORE_HEX: Record<string, Record<string, string>> = {";
  const start = existing.indexOf(startMarker);
  if (start === -1) throw new Error("Could not find CORE_HEX declaration in coreColors.ts");
  // The literal ends at the first line that is exactly "};".
  const endRel = existing.slice(start).indexOf("\n};");
  if (endRel === -1) throw new Error("Could not find end of CORE_HEX literal in coreColors.ts");
  const end = start + endRel + "\n};".length;

  let out = existing.slice(0, start) + coreHexBlock + existing.slice(end);

  // ── Family role lists ──
  const neutrals = [...families.keys()].filter((f) => NEUTRAL_FAMILIES.has(f));
  const brands = [...families.keys()].filter((f) => !NEUTRAL_FAMILIES.has(f));
  const asArray = (names) => names.map((n) => `"${n}"`).join(",");

  out = out.replace(
    /export const NEUTRAL_FAMILY_NAMES: string\[\] = \[[^\]]*\];/,
    `export const NEUTRAL_FAMILY_NAMES: string[] = [${asArray(neutrals)}];`,
  );
  out = out.replace(
    /export const BRAND_FAMILY_NAMES: string\[\] = \[[^\]]*\];/,
    `export const BRAND_FAMILY_NAMES: string[] = [${asArray(brands)}];`,
  );

  return out;
}

// ─── Run ──────────────────────────────────────────────────────────────────────

function writeIfChanged(path, content) {
  let prev = null;
  try {
    prev = readFileSync(path, "utf-8");
  } catch {
    // new file
  }
  if (prev === content) {
    console.log(`  unchanged  ${rel(path)}`);
    return false;
  }
  writeFileSync(path, content, "utf-8");
  console.log(`  wrote      ${rel(path)}`);
  return true;
}

function main() {
  const css = readFileSync(SOURCE_CSS, "utf-8");
  const families = parseCoreColorCss(css);
  validate(families);
  console.log(
    `Parsed ${families.size} color families from ${rel(SOURCE_CSS)}.`,
  );

  writeIfChanged(OUT_TOKENS_JSON, buildTokensJson(families));
  writeIfChanged(OUT_DEFAULT_PALETTE, buildDefaultPalette(families));

  const coreColorsSrc = readFileSync(OUT_CORE_COLORS_TS, "utf-8");
  writeIfChanged(OUT_CORE_COLORS_TS, patchCoreColors(coreColorsSrc, families));

  console.log("✓ Core palette generated from tokens-update/core-color.css");
}

main();
