/**
 * Style Dictionary v4 configuration.
 *
 * Reads DTCG-formatted JSON files from src/ and outputs CSS custom properties
 * to output/variables.css.
 *
 * Custom name transform: preserves the original token path casing (no forced
 * kebab-case lowercasing) so that tokens like Button.Small.horizontal produce
 * --Button-Small-horizontal, matching the CSS custom property names already
 * established in the component library.
 *
 * outputReferences: true — semantic and component tokens output var() references
 * so that runtime overrides (dark mode, theme swap) cascade automatically.
 */

import StyleDictionary from "style-dictionary";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { readFileSync, appendFileSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Custom name transform ────────────────────────────────────────────────────
// Joins the token path with hyphens, preserving original key casing.
// e.g. ["Button", "Small", "horizontal"] → "Button-Small-horizontal"
//      ["color-border", "secondary"]     → "color-border-secondary"

StyleDictionary.registerTransform({
  name: "name/preserve-case",
  type: "name",
  transform: (token) => token.path.join("-"),
});

// ─── Build ────────────────────────────────────────────────────────────────────

// ─── Theme override blocks ────────────────────────────────────────────────────
// The base `:root` block (dark mode) is produced by Style Dictionary below.
// Light mode — and an explicit dark block, for nesting one theme inside another —
// are appended as `[data-theme="…"]` selectors that override only the semantic
// COLOR tokens. Spacing, radius, dimension, and typography are theme-independent
// and stay on :root.
//
// Each theme is just a folder of DTCG semantic color files that re-point the same
// token names at different primitive ramp steps. Add `src/themes/<name>/` and a
// matching entry here to ship more themes — see THEMES section in
// instructions/theme-token-mappings.md.

const SEMANTIC_COLOR_FILES = [
  "color-border.json",
  "color-interactive.json",
  "color-content.json",
  "color-status.json",
  "color-surface.json",
] as const;

interface DtcgLeaf {
  $value: string | number;
  $type?: string;
}

/** Convert a {ramp.step} reference to a var(--ramp-step); pass raw values through. */
function refToCss(value: string | number): string {
  if (typeof value !== "string") return String(value);
  const match = value.match(/^\{(.+)\}$/);
  if (!match?.[1]) return value; // raw value, e.g. rgba(252, 252, 252, 0)
  return `var(--${match[1].replace(/\./g, "-")})`;
}

/** Recursively flatten a DTCG color tree to `--token-name: value;` declarations. */
function flattenToDeclarations(tree: Record<string, unknown>, path: string[] = []): string[] {
  const out: string[] = [];
  for (const [key, node] of Object.entries(tree)) {
    const next = [...path, key];
    if (node && typeof node === "object" && "$value" in (node as object)) {
      const leaf = node as DtcgLeaf;
      out.push(`  --${next.join("-")}: ${refToCss(leaf.$value)};`);
    } else if (node && typeof node === "object") {
      out.push(...flattenToDeclarations(node as Record<string, unknown>, next));
    }
  }
  return out;
}

/** Build a `[data-theme="<name>"] { … }` block from a folder of semantic color files. */
function buildThemeBlock(themeName: string, dir: string): string {
  const declarations: string[] = [];
  for (const file of SEMANTIC_COLOR_FILES) {
    let raw: string;
    try {
      raw = readFileSync(resolve(dir, file), "utf-8");
    } catch {
      continue; // a theme may legitimately omit a group and inherit it
    }
    declarations.push(...flattenToDeclarations(JSON.parse(raw)));
  }
  return `\n[data-theme="${themeName}"] {\n${declarations.join("\n")}\n}\n`;
}

export async function buildTokens(): Promise<void> {
  const sd = new StyleDictionary({
    log: { verbosity: "default" },
    // Explicit dirs only — excludes src/themes/** so per-theme overrides don't
    // collide with the base semantic tokens on :root.
    source: [
      resolve(__dirname, "src/primitive/**/*.json"),
      resolve(__dirname, "src/semantic/**/*.json"),
      resolve(__dirname, "src/component/**/*.json"),
      resolve(__dirname, "src/typography/**/*.json"),
    ],
    platforms: {
      css: {
        transforms: [
          "attribute/cti",
          "name/preserve-case",
          "color/css",
          "fontFamily/css",
        ],
        buildPath: resolve(__dirname, "output/") + "/",
        files: [
          {
            destination: "variables.css",
            format: "css/variables",
            options: {
              outputReferences: true,
              selector: ":root",
            },
          },
        ],
      },
    },
  });

  await sd.buildAllPlatforms();

  // ── Append theme override blocks ────────────────────────────────────────────
  // :root above is the dark default. We re-assert it as [data-theme="dark"] so a
  // light-default page can host a dark island (and vice versa), then add light.
  const outFile = resolve(__dirname, "output/variables.css");
  const themesDir = resolve(__dirname, "src/themes");

  const darkBlock = buildThemeBlock("dark", resolve(__dirname, "src/semantic"));
  const lightBlock = buildThemeBlock("light", resolve(themesDir, "light"));

  // Bare --brand alias (the brand primary). Mode-independent, so it lives on :root.
  const brandBlock = `\n:root {\n  --brand: var(--brand-1400);\n}\n`;

  // Overlay z-index layering scale. Stacking order for portalled overlays:
  // popovers/menus/selects sit beneath dialogs; tooltips and toasts float above
  // everything so they stay visible over an open dialog. Layout constants, not
  // themeable colors, so they are mode-independent and live on :root.
  const zIndexBlock =
    `\n:root {\n` +
    `  --z-index-popover: 1000;\n` +
    `  --z-index-dialog: 1100;\n` +
    `  --z-index-tooltip: 1200;\n` +
    `  --z-index-toast: 1300;\n` +
    `}\n`;

  appendFileSync(outFile, darkBlock + lightBlock + brandBlock + zIndexBlock, "utf-8");
}
