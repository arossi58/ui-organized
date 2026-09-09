import { describe, expect, it } from "vitest";
import { formatOklch, oklchToRgba, parseOklch, rgbaToOklch, type Rgba } from "./oklch.js";

const rgb = (r: number, g: number, b: number, a = 1): Rgba => ({ r, g, b, a });

describe("rgbaToOklch", () => {
  /* Reference values from the CSS Color 4 spec's own conversion samples. Tying
     the test to published numbers rather than to this implementation's output
     is what makes it a check on the maths and not a snapshot of a bug. */
  it.each<[string, Rgba, [number, number, number]]>([
    ["white", rgb(255, 255, 255), [1, 0, 0]],
    ["black", rgb(0, 0, 0), [0, 0, 0]],
    ["red", rgb(255, 0, 0), [0.6279, 0.2577, 29.23]],
    ["lime", rgb(0, 255, 0), [0.8664, 0.2948, 142.5]],
    ["blue", rgb(0, 0, 255), [0.452, 0.3132, 264.05]],
  ])("matches the published OKLCH for %s", (_name, input, [l, c, h]) => {
    const out = rgbaToOklch(input);
    expect(out.l).toBeCloseTo(l, 3);
    expect(out.c).toBeCloseTo(c, 3);
    expect(out.h).toBeCloseTo(h, 1);
  });

  it("reports no hue for greys, so round-tripping one cannot invent an angle", () => {
    expect(rgbaToOklch(rgb(128, 128, 128)).c).toBeCloseTo(0, 6);
    expect(rgbaToOklch(rgb(128, 128, 128)).h).toBe(0);
  });
});

describe("oklchToRgba", () => {
  it("clips a colour outside sRGB to the nearest displayable one", () => {
    // A chroma this high at this hue has no sRGB equivalent.
    const out = oklchToRgba({ l: 0.7, c: 0.35, h: 150, a: 1 });
    for (const channel of [out.r, out.g, out.b]) {
      expect(channel).toBeGreaterThanOrEqual(0);
      expect(channel).toBeLessThanOrEqual(255);
      expect(Number.isInteger(channel)).toBe(true);
    }
  });
});

describe("round trip", () => {
  /* The bar for the text field: opening it and pressing enter without editing
     must not shift the colour. That has to hold through the *string*, which is
     where the rounding lives — not just through the float maths. */
  const lcg = (seed: number) => () => (seed = (seed * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32;

  it("survives format → parse for every channel extreme and a random sample", () => {
    const next = lcg(20260817);
    const samples: Rgba[] = [];
    for (const r of [0, 1, 127, 128, 254, 255])
      for (const g of [0, 127, 255]) for (const b of [0, 128, 255]) samples.push(rgb(r, g, b));
    for (let i = 0; i < 400; i++) {
      samples.push(
        rgb(Math.floor(next() * 256), Math.floor(next() * 256), Math.floor(next() * 256)),
      );
    }

    for (const sample of samples) {
      const parsed = parseOklch(formatOklch(sample));
      expect({ input: sample, out: parsed }).toEqual({ input: sample, out: sample });
    }
  });

  it("keeps alpha across the string", () => {
    expect(parseOklch(formatOklch(rgb(37, 99, 235, 0.4)))).toEqual(rgb(37, 99, 235, 0.4));
  });
});

describe("formatOklch", () => {
  it("trims trailing zeros so plain colours stay readable", () => {
    expect(formatOklch(rgb(255, 255, 255))).toBe("oklch(1 0 0)");
    expect(formatOklch(rgb(0, 0, 0))).toBe("oklch(0 0 0)");
  });

  it("only writes the alpha component when the colour is translucent", () => {
    expect(formatOklch(rgb(255, 0, 0))).not.toContain("/");
    expect(formatOklch(rgb(255, 0, 0, 0.5))).toContain("/ 0.5");
  });
});

describe("parseOklch", () => {
  const red = rgb(255, 0, 0);

  it.each([
    ["css form", "oklch(0.62796 0.25768 29.234)"],
    ["without the wrapper", "0.6279 0.2577 29.23"],
    ["percentage lightness", "oklch(62.79% 0.2577 29.23)"],
    ["percentage chroma against 0.4", "oklch(0.6279 64.425% 29.23)"],
    ["explicit degrees", "oklch(0.6279 0.2577 29.23deg)"],
    ["comma separated", "oklch(0.6279, 0.2577, 29.23)"],
    ["extra whitespace", "  oklch(  0.6279   0.2577   29.23 )  "],
    ["uppercase", "OKLCH(0.6279 0.2577 29.23)"],
  ])("reads %s", (_name, input) => {
    expect(parseOklch(input)).toEqual(red);
  });

  it("reads the alpha component as a number or a percentage", () => {
    expect(parseOklch("oklch(0.6279 0.2577 29.23 / 0.5)")).toEqual(rgb(255, 0, 0, 0.5));
    expect(parseOklch("oklch(0.6279 0.2577 29.23 / 50%)")).toEqual(rgb(255, 0, 0, 0.5));
  });

  it("normalises hue units and wraps the angle", () => {
    expect(parseOklch("oklch(0.6279 0.2577 389.23)")).toEqual(red);
    expect(parseOklch("oklch(0.6279 0.2577 -330.77)")).toEqual(red);
    expect(parseOklch("oklch(0.6279 0.2577 0.5104rad)")).toEqual(red);
  });

  it("accepts `none` for any component", () => {
    expect(parseOklch("oklch(none none none)")).toEqual(rgb(0, 0, 0));
  });

  it.each([
    ["empty", ""],
    ["too few components", "oklch(0.5 0.1)"],
    ["too many components", "oklch(0.5 0.1 20 30)"],
    ["a second slash", "oklch(0.5 0.1 20 / 0.5 / 0.5)"],
    ["non-numeric", "oklch(red green blue)"],
    ["another notation", "rgb(255 0 0)"],
    ["a bare hex", "#ff0000"],
  ])("rejects %s", (_name, input) => {
    expect(parseOklch(input)).toBeNull();
  });
});
