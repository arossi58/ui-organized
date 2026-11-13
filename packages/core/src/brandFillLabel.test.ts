import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { cssFiles } from "./contract.js";

/**
 * Text drawn on a primary (brand) fill must be `--color-interactive-contents`.
 *
 * That label is the only one chosen against the fill: the resolver picks
 * near-white or near-black by contrast with the brand's resolved primary
 * steps, so it holds 4.5:1 for every brand (`semanticContrast.test.ts` in
 * utils proves the token pair). `--color-content-light` is near-white whatever
 * the brand. Navigation, SegmentedControl and Steps drew it on primary fills,
 * which read at 1.99:1 on a light brand such as candlelight, in both modes.
 *
 * The token-level test can't see which label a stylesheet pairs with a fill,
 * so this reads the CSS.
 */

const PRIMARY_FILL = /background(?:-color)?\s*:\s*var\(--color-interactive-primary-(?:default|hover|active|selected)\)/;
// `color:` as its own declaration, not the tail of `background-color:`/`border-color:`.
const COLOR = /(?:^|[;{\s])color\s*:\s*([^;]+);/;

/** Innermost `selector { body }` rules, comments stripped. A rule inside `@media` keeps its own selector. */
function rules(css: string): Array<{ selector: string; body: string }> {
  const bare = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...bare.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({
    selector: selector!.trim(),
    body: body!,
  }));
}

/**
 * Where the label isn't declared beside its fill (a sibling element draws the
 * fill, or the color is inherited from a base rule), a same-rule scan can't
 * pair them, so the label's rule is named here.
 */
const SPLIT_LABELS: Array<[file: string, selector: string, why: string]> = [
  [
    "src/components/SegmentedControl/SegmentedControl.css",
    '.segmented__item[data-state="checked"]',
    "the checked item sits over .segmented__indicator, the primary-default pill",
  ],
  [
    "src/components/Steps/Steps.css",
    ".steps__trigger[data-current] .steps__indicator",
    "the base .steps__indicator rule sets --color-content-light, which the current step must override",
  ],
];

describe("labels on primary fills", () => {
  it("use --color-interactive-contents wherever a rule sets both", () => {
    const wrong: string[] = [];
    let fills = 0;
    for (const file of cssFiles()) {
      for (const { selector, body } of rules(readFileSync(file, "utf8"))) {
        if (!PRIMARY_FILL.test(body)) continue;
        fills++;
        const color = COLOR.exec(body)?.[1]?.trim();
        if (color && color !== "var(--color-interactive-contents)") {
          wrong.push(`${file}: ${selector} → color: ${color}`);
        }
      }
    }
    // Sanity: the scan found the primary fills (Button, Toggle, Pagination, …).
    expect(fills).toBeGreaterThan(10);
    expect(wrong).toEqual([]);
  });

  it.each(SPLIT_LABELS)("%s %s uses it too", (file, selector, why) => {
    const rule = rules(readFileSync(file, "utf8")).find((r) => r.selector === selector);
    expect(rule, `${selector} not found in ${file}`).toBeDefined();
    expect(COLOR.exec(rule!.body)?.[1]?.trim(), why).toBe("var(--color-interactive-contents)");
  });
});
