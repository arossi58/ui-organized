import { describe, it, expect } from "vitest";
import { generateSpacingScale, SPACING_SCALE, SPACING_MULTIPLIERS } from "./spacing.js";

describe("generateSpacingScale", () => {
  it("produces a value for every defined step", () => {
    const scale = generateSpacingScale(4);
    for (const step of Object.keys(SPACING_MULTIPLIERS)) {
      expect(scale[step]).toBeDefined();
    }
  });

  it("at base unit 4px, output matches canonical SPACING_SCALE", () => {
    const scale = generateSpacingScale(4);
    for (const [step, canonical] of Object.entries(SPACING_SCALE)) {
      expect(scale[step]).toBe(canonical);
    }
  });

  it("space-01 equals the base unit", () => {
    expect(generateSpacingScale(4)["space-01"]).toBe(4);
    expect(generateSpacingScale(8)["space-01"]).toBe(8);
  });

  it("space-005 is half the base unit", () => {
    expect(generateSpacingScale(4)["space-005"]).toBe(2);
    expect(generateSpacingScale(8)["space-005"]).toBe(4);
  });

  it("space-04 is 4× the base unit", () => {
    expect(generateSpacingScale(4)["space-04"]).toBe(16);
    expect(generateSpacingScale(8)["space-04"]).toBe(32);
  });

  it("all values scale proportionally with base unit", () => {
    const scale4 = generateSpacingScale(4);
    const scale8 = generateSpacingScale(8);
    for (const step of Object.keys(SPACING_MULTIPLIERS)) {
      expect(scale8[step]).toBe(scale4[step]! * 2);
    }
  });

  it("defaults to base unit 4 when called with no argument", () => {
    const defaultScale = generateSpacingScale();
    const scale4 = generateSpacingScale(4);
    expect(defaultScale).toEqual(scale4);
  });
});
