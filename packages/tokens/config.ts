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

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Custom name transform ────────────────────────────────────────────────────
// Joins the token path with hyphens, preserving original key casing.
// e.g. ["Button", "Small", "horizontal"] → "Button-Small-horizontal"
//      ["color-border", "subtle"]        → "color-border-subtle"

StyleDictionary.registerTransform({
  name: "name/preserve-case",
  type: "name",
  transform: (token) => token.path.join("-"),
});

// ─── Build ────────────────────────────────────────────────────────────────────

export async function buildTokens(): Promise<void> {
  const sd = new StyleDictionary({
    log: { verbosity: "default" },
    source: [resolve(__dirname, "src/**/*.json")],
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
}
