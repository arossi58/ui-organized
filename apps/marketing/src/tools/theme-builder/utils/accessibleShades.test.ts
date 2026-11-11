import { describe, it, expect } from "vitest";
import {
  BRAND_FAMILY_NAMES,
  generateColorRamp,
  getCoreFamily,
  resolveSemanticColors,
} from "@ui-organized/utils";
import {
  getAccessibleShades,
  isAccessiblePrimary,
  pickAccessibleShade,
  primaryLabelFor,
  PRIMARY_MIN_STEP,
} from "./accessibleShades";

describe("getAccessibleShades", () => {
  it("returns a non-empty band for a curated brand family", () => {
    const shades = getAccessibleShades(getCoreFamily("mars"));
    expect(shades.length).toBeGreaterThan(0);
    expect(shades).toContain("1400"); // the curated default stays selectable
  });

  it("keeps the default 1400 selectable for every brand, light ones included", () => {
    for (const name of BRAND_FAMILY_NAMES) {
      expect(getAccessibleShades(getCoreFamily(name)), name).toContain("1400");
    }
  });

  it("every returned shade reads with the label the resolver gives it", () => {
    const ramp = getCoreFamily("mars");
    for (const step of getAccessibleShades(ramp)) {
      expect(isAccessiblePrimary(ramp[step]?.hex)).toBe(true);
      expect(primaryLabelFor(ramp[step]!.hex).ratio).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("never offers the pale tint steps", () => {
    const ramp = getCoreFamily("mars");
    const min = Number(PRIMARY_MIN_STEP);
    expect(getAccessibleShades(ramp).every((s) => Number(s) >= min)).toBe(true);
  });
});

describe("primaryLabelFor", () => {
  it("matches the label the resolver actually emits", () => {
    const neutralRamp = getCoreFamily("grey");
    for (const name of ["mars", "candlelight", "lapis", "emerald"]) {
      const brandRamp = getCoreFamily(name);
      const vars = resolveSemanticColors("light", { brandRamp, neutralRamp });
      expect(primaryLabelFor(brandRamp["1400"]!.hex).hex, name).toBe(vars["--color-interactive-contents"]);
    }
  });

  it("puts a dark label on a light brand", () => {
    expect(primaryLabelFor(getCoreFamily("candlelight")["1400"]!.hex).ref).toBe("grey.2400");
    expect(primaryLabelFor(getCoreFamily("mars")["1400"]!.hex).ref).toBe("grey.100");
  });
});

describe("pickAccessibleShade", () => {
  it("keeps the preferred shade when it is already accessible", () => {
    expect(pickAccessibleShade(getCoreFamily("mars"), "1400")).toBe("1400");
    // A light brand no longer gets pushed dark: its 1400 reads under a dark label.
    expect(pickAccessibleShade(getCoreFamily("candlelight"), "1400")).toBe("1400");
  });

  it("snaps to an accessible shade when the preferred one is inaccessible", () => {
    const ramp = getCoreFamily("mars");
    // A near-white tint step is never offered as a primary.
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
