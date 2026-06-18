import { describe, it, expect } from "vitest";
import { generateColorRamp, getCoreFamily } from "@ui-organized/utils";
import {
  getAccessibleShades,
  isAccessiblePrimary,
  pickAccessibleShade,
} from "./accessibleShades";

describe("getAccessibleShades", () => {
  it("returns a non-empty band for a curated brand family", () => {
    const shades = getAccessibleShades(getCoreFamily("mars"));
    expect(shades.length).toBeGreaterThan(0);
    expect(shades).toContain("1400"); // the curated default stays selectable
  });

  it("every returned shade actually reads with white button text", () => {
    const ramp = getCoreFamily("mars");
    for (const step of getAccessibleShades(ramp)) {
      expect(isAccessiblePrimary(ramp[step]?.hex)).toBe(true);
    }
  });
});

describe("pickAccessibleShade", () => {
  it("keeps the preferred shade when it is already accessible", () => {
    const ramp = getCoreFamily("mars");
    expect(pickAccessibleShade(ramp, "1400")).toBe("1400");
  });

  it("snaps to an accessible shade when the preferred one is inaccessible", () => {
    const ramp = getCoreFamily("mars");
    // A near-white light step can never read with white button text.
    expect(isAccessiblePrimary(ramp["200"]?.hex)).toBe(false);

    const picked = pickAccessibleShade(ramp, "200");
    expect(picked).not.toBe("200");
    expect(getAccessibleShades(ramp)).toContain(picked);
    expect(isAccessiblePrimary(ramp[picked]?.hex)).toBe(true);
  });

  it("always resolves to an accessible shade across many custom hues", () => {
    for (const hex of ["#ff0000", "#00ff00", "#0000ff", "#ffe000", "#00ffff", "#ff00ff"]) {
      const ramp = generateColorRamp(hex);
      const picked = pickAccessibleShade(ramp, "1400");
      expect(isAccessiblePrimary(ramp[picked]?.hex)).toBe(true);
    }
  });
});
