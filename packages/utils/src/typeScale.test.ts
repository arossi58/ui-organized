import { describe, it, expect } from "vitest";
import {
  calculateTypeScale,
  getCanonicalTypeScale,
  roundTypeSize,
  calculateLineHeights,
  TYPE_SCALE_STEPS_DESKTOP,
  TYPE_SCALE_STEP_NAMES,
} from "./typeScale.js";

describe("roundTypeSize", () => {
  it("rounds small values to nearest integer", () => {
    expect(roundTypeSize(12.3)).toBe(12);
    expect(roundTypeSize(13.7)).toBe(14);
    expect(roundTypeSize(10.4)).toBe(10);
  });

  it("rounds values >= 16 to nearest even integer", () => {
    expect(roundTypeSize(16)).toBe(16);
    expect(roundTypeSize(17)).toBe(18);
    expect(roundTypeSize(18.9)).toBe(18);
    expect(roundTypeSize(25)).toBe(26);
    expect(roundTypeSize(30.1)).toBe(30);
  });
});

describe("getCanonicalTypeScale", () => {
  const scale = getCanonicalTypeScale();

  it("includes all defined step names", () => {
    for (const step of TYPE_SCALE_STEP_NAMES) {
      expect(scale[step]).toBeDefined();
    }
  });

  it("body-large is 16px", () => {
    expect(scale["body-large"]).toBe(16);
  });

  it("caption is 10px", () => {
    expect(scale["caption"]).toBe(10);
  });

  it("display-xlarge is 64px", () => {
    expect(scale["display-xlarge"]).toBe(64);
  });

  it("steps decrease from display-xlarge to caption", () => {
    const ordered = TYPE_SCALE_STEP_NAMES;
    for (let i = 1; i < ordered.length; i++) {
      expect(scale[ordered[i]!]).toBeLessThanOrEqual(scale[ordered[i - 1]!]!);
    }
  });
});

describe("calculateTypeScale", () => {
  const scale = calculateTypeScale(16, 1.25);

  it("includes all defined steps", () => {
    for (const step of Object.keys(TYPE_SCALE_STEPS_DESKTOP)) {
      expect(scale[step]).toBeDefined();
    }
  });

  it("body-large step equals base size", () => {
    expect(scale["body-large"]).toBe(16);
  });

  it("steps decrease from display-xlarge to caption", () => {
    const ordered = TYPE_SCALE_STEP_NAMES;
    for (let i = 1; i < ordered.length; i++) {
      expect(scale[ordered[i]!]).toBeLessThanOrEqual(scale[ordered[i - 1]!]!);
    }
  });

  it("all values are positive integers", () => {
    for (const value of Object.values(scale)) {
      expect(value).toBeGreaterThan(0);
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it("produces larger heading sizes with a bigger ratio", () => {
    const scale2 = calculateTypeScale(16, 1.5);
    expect(scale2["heading-large"]).toBeGreaterThanOrEqual(scale["heading-large"]!);
  });
});

describe("calculateLineHeights", () => {
  const scale = getCanonicalTypeScale();
  const lineHeights = calculateLineHeights(scale);

  it("returns a value for every scale step", () => {
    for (const step of Object.keys(scale)) {
      expect(lineHeights[step]).toBeDefined();
    }
  });

  it("display has tighter line height ratio than body-large", () => {
    const displayRatio = lineHeights["display-xlarge"]! / scale["display-xlarge"]!;
    const bodyRatio = lineHeights["body-large"]! / scale["body-large"]!;
    expect(displayRatio).toBeLessThan(bodyRatio);
  });

  it("all values are positive integers", () => {
    for (const value of Object.values(lineHeights)) {
      expect(value).toBeGreaterThan(0);
      expect(Number.isInteger(value)).toBe(true);
    }
  });
});
