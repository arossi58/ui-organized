import { describe, it, expect } from "vitest";
import {
  parseColor,
  parseColorModifier,
  splitHexAlpha,
  toResolvedColor,
  lighten,
  darken,
  withAlpha,
  mix,
  type ColorValue,
} from "./color.js";

const gray: ColorValue = { color: { l: 0.5, c: 0.1, h: 200 }, alpha: 1 };

describe("splitHexAlpha", () => {
  it("expands shorthand and reads alpha", () => {
    expect(splitHexAlpha("#fff")).toEqual({ rgb: "#ffffff", alpha: 1 });
    expect(splitHexAlpha("#ff000080")).toEqual({ rgb: "#ff0000", alpha: 128 / 255 });
    expect(splitHexAlpha("#f008")).toEqual({ rgb: "#ff0000", alpha: 136 / 255 });
  });

  it("rejects non-hex input", () => {
    expect(splitHexAlpha("#xyz")).toBeNull();
  });
});

describe("parseColor", () => {
  it("parses hex", () => {
    const parsed = parseColor("#3355ff");
    expect(parsed).not.toBeNull();
    expect(parsed!.alpha).toBe(1);
  });

  it("parses hex with alpha", () => {
    const parsed = parseColor("#00000080");
    expect(parsed!.alpha).toBeCloseTo(128 / 255, 5);
  });

  it("parses an oklch string with alpha", () => {
    const parsed = parseColor("oklch(0.5 0.1 200 / 0.5)");
    expect(parsed!.color.l).toBeCloseTo(0.5, 5);
    expect(parsed!.alpha).toBeCloseTo(0.5, 5);
  });

  it("parses a structured srgb color object", () => {
    const parsed = parseColor({ colorSpace: "srgb", components: [1, 0, 0], alpha: 1 });
    expect(parsed).not.toBeNull();
  });

  it("parses a structured oklch color object", () => {
    const parsed = parseColor({ colorSpace: "oklch", components: [0.6, 0.1, 250] });
    expect(parsed!.color).toEqual({ l: 0.6, c: 0.1, h: 250 });
  });

  it("returns null for nonsense", () => {
    expect(parseColor("not a color")).toBeNull();
    expect(parseColor(42)).toBeNull();
  });
});

describe("toResolvedColor", () => {
  it("emits oklch + 6-digit hex at full alpha", () => {
    const resolved = toResolvedColor(gray);
    expect(resolved.oklch).toBe("oklch(0.500 0.100 200.0)");
    expect(resolved.hex).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("encodes alpha as oklch /a and 8-digit hex", () => {
    const resolved = toResolvedColor({ color: gray.color, alpha: 0.5 });
    expect(resolved.oklch).toBe("oklch(0.500 0.100 200.0 / 0.500)");
    expect(resolved.hex).toMatch(/^#[0-9a-f]{8}$/);
  });
});

describe("modifiers (pure OKLCH math)", () => {
  it("lighten / darken adjust L additively and clamp", () => {
    expect(lighten(gray, 0.2).color.l).toBeCloseTo(0.7, 10);
    expect(darken(gray, 0.2).color.l).toBeCloseTo(0.3, 10);
    expect(lighten(gray, 1).color.l).toBe(1);
    expect(darken(gray, 1).color.l).toBe(0);
  });

  it("alpha sets the alpha channel", () => {
    expect(withAlpha(gray, 0.25).alpha).toBe(0.25);
    expect(withAlpha(gray, 0.25).color).toEqual(gray.color);
  });

  it("mix interpolates L/C and alpha linearly", () => {
    const black: ColorValue = { color: { l: 0, c: 0, h: 0 }, alpha: 0 };
    const mixed = mix(gray, black, 0.5);
    expect(mixed.color.l).toBeCloseTo(0.25, 10);
    expect(mixed.color.c).toBeCloseTo(0.05, 10);
    expect(mixed.alpha).toBeCloseTo(0.5, 10);
  });

  it("mix interpolates hue along the shortest arc", () => {
    const a: ColorValue = { color: { l: 0.5, c: 0.1, h: 350 }, alpha: 1 };
    const b: ColorValue = { color: { l: 0.5, c: 0.1, h: 10 }, alpha: 1 };
    // shortest path 350 → 10 passes through 0, not 180
    expect(mix(a, b, 0.5).color.h).toBeCloseTo(0, 6);
  });
});

describe("parseColorModifier", () => {
  it("parses a single-color modifier", () => {
    expect(parseColorModifier("lighten({color.brand}, 0.1)")).toEqual({
      fn: "lighten",
      args: ["{color.brand}", "0.1"],
    });
  });

  it("parses a two-color mix", () => {
    expect(parseColorModifier("mix({a}, {b}, 0.5)")).toEqual({
      fn: "mix",
      args: ["{a}", "{b}", "0.5"],
    });
  });

  it("returns null for non-modifiers", () => {
    expect(parseColorModifier("#fff")).toBeNull();
    expect(parseColorModifier("{color.brand}")).toBeNull();
  });
});
