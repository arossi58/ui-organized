/**
 * The generated glyph table against the designer's SVGs.
 *
 * `comparisonIcons.ts` is a copy of six files, and a copy is a thing that
 * drifts. Re-exporting an icon by hand after a redraw is exactly the edit that
 * gets forgotten, and the failure is silent: the chip keeps rendering the *old*
 * glyph, which looks fine on its own and only reads as wrong beside the design.
 *
 * So the SVGs stay the source of truth and this asserts the module still says
 * what they say — modulo the one deliberate transformation, `#030303` →
 * `currentColor`.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { COMPARISON_ICONS, COMPARISON_ICON_NAMES } from "./comparisonIcons.js";

/**
 * Relative to the package root, as `contract.ts`'s `SRC_DIR` is, and for the
 * same reason: this package builds to CommonJS as well as ESM, so `import.meta`
 * is a compile error here rather than a convenience.
 */
const here = join("src", "icons");
/** Whitespace is not part of the glyph; the ink and the shape are. */
const normalise = (svg: string) =>
  svg.replaceAll('"#030303"', '"currentColor"').trim().split(/\s+/).join(" ");

describe("comparison icons", () => {
  it("covers every SVG in the directory, and nothing else", () => {
    const onDisk = readdirSync(here)
      .filter((file) => file.endsWith(".svg"))
      .map((file) => file.replace(/\.svg$/, ""))
      .sort();
    expect(onDisk).toEqual([...COMPARISON_ICON_NAMES].sort());
  });

  it.each([...COMPARISON_ICON_NAMES])("%s matches its source file", (name) => {
    const source = readFileSync(join(here, `${name}.svg`), "utf8");
    expect(COMPARISON_ICONS[name]).toBe(normalise(source));
  });

  it("takes its colour from the text beside it", () => {
    for (const markup of Object.values(COMPARISON_ICONS)) {
      // A hard-coded ink is invisible in the dark theme and wrong inside a
      // selected chip — the whole reason the export is rewritten.
      expect(markup).not.toMatch(/#[0-9a-f]{3,8}/i);
      expect(markup).toContain("currentColor");
    }
  });
});
