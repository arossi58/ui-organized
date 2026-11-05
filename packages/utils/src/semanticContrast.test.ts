/**
 * Contrast regression for the semantic color map.
 *
 * Every (brand × neutral × mode) combination is resolved through the public
 * path (`getCoreFamily` → `resolveSemanticColors`) and each role pair is held
 * to its WCAG floor. No browser needed: the map plus the ramps decide it.
 *
 * Text roles and links are measured against the HARDER of the two surfaces —
 * cards and section beds sit on `surface-secondary`, which in dark mode is a
 * step lighter than the page, and that is where most captions actually live.
 */

import { describe, it, expect } from "vitest";
import { contrastRatio } from "./contrast.js";
import { getCoreFamily } from "./families.js";
import { BRAND_FAMILY_NAMES, NEUTRAL_FAMILY_NAMES } from "./coreColors.js";
import { resolveSemanticColors } from "./semanticResolve.js";

const MODES = ["light", "dark"] as const;
const BEDS = ["--color-surface-primary", "--color-surface-secondary"];

/** [foreground, backgrounds, minimum ratio] */
const PAIRS: Array<[string, string[], number]> = [
  ["--color-content-primary", BEDS, 4.5],
  ["--color-content-secondary", BEDS, 4.5],
  ["--color-content-tertiary", BEDS, 4.5],
  ["--color-content-placeholder", BEDS, 4.5],
  ["--color-interactive-tertiary-default", BEDS, 4.5],
  ["--color-interactive-tertiary-hover", BEDS, 4.5],
  ["--color-interactive-tertiary-active", BEDS, 4.5],
  [
    "--color-interactive-contents",
    [
      "--color-interactive-primary-default",
      "--color-interactive-primary-hover",
      "--color-interactive-primary-active",
    ],
    4.5,
  ],
  ["--color-interactive-focus", BEDS, 3],
];
// `--color-border-primary` is deliberately absent: it draws decorative dividers
// (cards, tabs, menus) at ~1.3–1.5:1, and WCAG 1.4.11 only requires 3:1 for a
// boundary that is the sole way to identify a control. Decided 2026-09-25.

describe("semantic contrast across every brand × neutral × mode", () => {
  it("clears every WCAG floor", () => {
    const failures: string[] = [];
    let checked = 0;
    for (const mode of MODES) {
      for (const brand of BRAND_FAMILY_NAMES) {
        for (const neutral of NEUTRAL_FAMILY_NAMES) {
          const vars = resolveSemanticColors(mode, {
            brandRamp: getCoreFamily(brand),
            neutralRamp: getCoreFamily(neutral),
          });
          checked++;
          for (const [fg, bgs, min] of PAIRS) {
            const ratio = Math.min(...bgs.map((bg) => contrastRatio(vars[fg]!, vars[bg]!)));
            if (ratio < min) {
              failures.push(`${mode} ${brand}/${neutral} ${fg} ${ratio.toFixed(2)}:1 < ${min}`);
            }
          }
        }
      }
    }
    expect(checked).toBe(BRAND_FAMILY_NAMES.length * NEUTRAL_FAMILY_NAMES.length * 2);
    expect(failures, `${failures.length} failing pairs:\n${failures.join("\n")}`).toEqual([]);
  });
});
