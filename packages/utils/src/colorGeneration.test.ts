import { describe, it, expect } from "vitest";
import { generateColorRamp, parseToOklch } from "./colorGeneration.js";

describe("parseToOklch", () => {
  it("parses a hex color", () => {
    const result = parseToOklch("#008ffb");
    expect(result.l).toBeGreaterThan(0.4);
    expect(result.l).toBeLessThan(0.8);
    expect(result.c).toBeGreaterThan(0);
    expect(result.h).toBeGreaterThan(200);
    expect(result.h).toBeLessThan(280);
  });

  it("parses a 3-digit hex", () => {
    const full = parseToOklch("#ffffff");
    const short = parseToOklch("#fff");
    expect(short.l).toBeCloseTo(full.l, 2);
  });

  it("parses an oklch() string", () => {
    const result = parseToOklch("oklch(0.603 0.190 240)");
    expect(result.l).toBeCloseTo(0.603, 2);
    expect(result.c).toBeCloseTo(0.190, 2);
    expect(result.h).toBeCloseTo(240, 1);
  });

  it("throws on unsupported format", () => {
    expect(() => parseToOklch("rgb(255, 0, 0)")).toThrow(/Unsupported/);
  });
});

describe("generateColorRamp", () => {
  const ramp = generateColorRamp("#008ffb");

  it("produces all 24 steps (100–2400)", () => {
    const expected = [
      "100", "200", "300", "400", "500", "600", "700", "800",
      "900", "1000", "1100", "1200", "1300", "1400", "1500", "1600",
      "1700", "1800", "1900", "2000", "2100", "2200", "2300", "2400",
    ];
    expect(Object.keys(ramp)).toEqual(expected);
  });

  it("each swatch has hex and oklch fields", () => {
    for (const swatch of Object.values(ramp)) {
      expect(swatch.hex).toMatch(/^#[0-9a-f]{6}$/);
      expect(swatch.oklch).toMatch(/^oklch\(/);
    }
  });

  it("step 100 is lighter than step 900", () => {
    const l100 = parseToOklch(ramp["100"]!.oklch).l;
    const l900 = parseToOklch(ramp["900"]!.oklch).l;
    expect(l100).toBeGreaterThan(l900);
  });

  it("step 900 is lighter than step 1600", () => {
    const l900 = parseToOklch(ramp["900"]!.oklch).l;
    const l1600 = parseToOklch(ramp["1600"]!.oklch).l;
    expect(l900).toBeGreaterThan(l1600);
  });

  it("ramp from oklch string produces same step count", () => {
    const rampFromOklch = generateColorRamp("oklch(0.603 0.190 240)");
    expect(Object.keys(rampFromOklch)).toHaveLength(24);
  });

  it("preserves hue across all steps", () => {
    const sourceHue = parseToOklch("#008ffb").h;
    for (const swatch of Object.values(ramp)) {
      const stepHue = parseToOklch(swatch.oklch).h;
      expect(Math.abs(stepHue - sourceHue)).toBeLessThan(5);
    }
  });
});
