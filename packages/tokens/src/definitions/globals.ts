/**
 * Global layout constants, parsed straight from the DTCG source files.
 *
 * These are the tokens that are **not** themeable: fixed pixel sizes and the
 * overlay stacking scale. Every theme needs them — component CSS references
 * `--dimension-06` for the sidebar rail and `--z-index-popover` for every
 * portalled layer — but no theme has any reason to change them, which is exactly
 * how they came to be omitted from generated themes and lost at runtime.
 *
 * Exporting them as plain JS is what lets a theme generator emit a *complete*
 * stylesheet without hardcoding the values a second time. Do not hand-edit these
 * maps — change the JSON under `src/semantic/`.
 */

import dimension from "../semantic/dimension.json" with { type: "json" };
import zIndex from "../semantic/z-index.json" with { type: "json" };

/**
 * Fixed layout sizes per step, e.g. `{ "06": "240px", … }`.
 *
 * Values keep their `px` unit because that is what a CSS custom property needs;
 * consumers that want numbers can `parseFloat`.
 */
export const dimensionTokens: Record<string, string> = Object.fromEntries(
  Object.entries(dimension.dimension).map(([step, token]) => [step, token.$value]),
);

/**
 * Dimension steps in numeric order.
 *
 * Sorting `dimensionTokens` itself does nothing: `"10"`, `"11"` and `"12"` are
 * valid array indices, so JS hoists them ahead of `"01"`…`"09"` in any object's
 * iteration order and the sort is silently undone. Order has to be re-applied
 * wherever the keys are read.
 */
const dimensionSteps = Object.keys(dimensionTokens).sort((a, b) => Number(a) - Number(b));

/**
 * Stacking order for portalled overlays: popovers, menus and selects sit beneath
 * dialogs; tooltips and toasts float above everything so they stay visible over
 * an open dialog.
 */
export const zIndexTokens: Record<string, number> = Object.fromEntries(
  Object.entries(zIndex["z-index"]).map(([layer, token]) => [layer, token.$value]),
);

/**
 * Both families as ready-to-write CSS custom properties, e.g.
 * `{ "--dimension-06": "240px", "--z-index-popover": "1000" }`.
 *
 * A generated theme stylesheet should emit all of these on `:root`. They are
 * mode-independent, so they never belong in a `[data-theme]` block.
 */
export function globalConstantVars(): Record<string, string> {
  const vars: Record<string, string> = {};
  // `--dimension-01` is not an array index, so insertion order holds from here.
  for (const step of dimensionSteps) {
    vars[`--dimension-${step}`] = dimensionTokens[step]!;
  }
  for (const [layer, value] of Object.entries(zIndexTokens)) {
    vars[`--z-index-${layer}`] = String(value);
  }
  return vars;
}
