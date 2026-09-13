import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { TYPE_SCALE_STEP_NAMES } from "@ui-organized/utils";

/**
 * Guards the global typography utilities (`.text-{weight}-{step}`) against drift:
 * every weight × step combination must exist, and the family mapping must hold
 * (display/heading steps → heading family; body/caption → body family).
 */

// The four semantic weight roles the type styles expose. These intentionally do
// NOT come from @ui-organized/utils WEIGHT_ROLES, which is the 9-step primitive
// CSS-weight scale (thin…black); these are the semantic roles the font-weight
// tokens and the Figma type styles use.
const WEIGHTS = ["default", "emphasis", "strong", "heavy"] as const;

// Read relative to the package root (vitest runs with cwd = packages/react),
// avoiding import.meta which the CommonJS typecheck rejects.
const css = readFileSync("src/typography.css", "utf8");

const isHeadingStep = (step: string) =>
  step.startsWith("display") || step.startsWith("heading");

describe("typography.css", () => {
  it("defines every weight × step class with the correct family mapping", () => {
    for (const weight of WEIGHTS) {
      for (const step of TYPE_SCALE_STEP_NAMES) {
        const selector = `.text-${weight}-${step} {`;
        const start = css.indexOf(selector);
        expect(start, selector).toBeGreaterThanOrEqual(0);

        // The rule body runs to the first closing brace (no nested braces).
        const rule = css.slice(start, css.indexOf("}", start));
        const family = isHeadingStep(step) ? "heading" : "body";
        expect(rule).toContain(`var(--type-font-${family})`);
        expect(rule).toContain(`var(--type-weight-${family}-${weight})`);
        expect(rule).toContain(`var(--type-size-${step})`);
        expect(rule).toContain(`var(--type-leading-${step})`);
      }
    }
  });

  it("defines exactly 40 type-style classes (no typos/extras)", () => {
    const selectors = css.match(/^\.text-[a-z-]+ \{/gm) ?? [];
    expect(selectors).toHaveLength(WEIGHTS.length * TYPE_SCALE_STEP_NAMES.length);
  });
});
