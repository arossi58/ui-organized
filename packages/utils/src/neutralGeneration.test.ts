import { describe, it, expect } from "vitest";
import {
  generateNeutralRamp,
  getNeutralRamp,
  rampHue,
  NEUTRAL_TINT_STRENGTHS,
  DEFAULT_NEUTRAL_TINT,
  MAX_LIGHTNESS_GIVE,
} from "./neutralGeneration.js";
import { maxChromaFor, parseToOklch, type ColorRamp } from "./colorGeneration.js";
import { coreColors, getCoreFamily, NEUTRAL_FAMILY_NAMES, CORE_STEPS } from "./coreColors.js";

const GREY = getCoreFamily("grey");

/** WCAG 2.x relative luminance of a 6-digit hex. */
function relativeLuminance(hex: string): number {
  const h = hex.replace("#", "");
  const channel = (i: number) => {
    const v = parseInt(h.slice(i, i + 2), 16) / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

/** The real neutral-backed token pairs from semanticColorMap, as [fg, bg] steps. */
const TOKEN_PAIRS: [label: string, fg: string, bg: string][] = [
  ["light content-primary on surface-primary", "2400", "100"],
  ["light content-primary on surface-base", "2400", "400"],
  ["light content-secondary on surface-primary", "2000", "100"],
  ["light content-tertiary on surface-secondary", "1800", "300"],
  ["light content-placeholder on surface-primary", "1700", "100"],
  ["light border-primary on surface-primary", "800", "100"],
  ["light border-data-entry on surface-base", "1400", "400"],
  ["dark content-primary on surface-primary", "100", "2300"],
  ["dark content-primary on surface-base", "100", "2400"],
  ["dark content-secondary on surface-primary", "1100", "2300"],
  ["dark content-tertiary on surface-secondary", "1300", "2200"],
  ["dark border-primary on surface-secondary", "2100", "2200"],
];

const SAMPLE_HUES = [0, 18, 65, 141, 196, 228, 265, 292, 338];

describe("generateNeutralRamp", () => {
  it("emits all 24 steps with hex and oklch", () => {
    const ramp = generateNeutralRamp(265);
    expect(Object.keys(ramp)).toEqual(CORE_STEPS);
    for (const step of CORE_STEPS) {
      expect(ramp[step]!.hex).toMatch(/^#[0-9a-f]{6}$/);
      expect(ramp[step]!.oklch).toMatch(/^oklch\(/);
    }
  });

  it("never gives up more lightness than the budget allows", () => {
    for (const hue of SAMPLE_HUES) {
      for (const strength of Object.values(NEUTRAL_TINT_STRENGTHS)) {
        const ramp = generateNeutralRamp(hue, { strength });
        for (const step of CORE_STEPS) {
          const before = parseToOklch(GREY[step]!.hex).l;
          const after = parseToOklch(ramp[step]!.hex).l;
          expect(Math.abs(after - before), `${step} @ hue ${hue}`).toBeLessThanOrEqual(
            MAX_LIGHTNESS_GIVE + 0.005,
          );
        }
      }
    }
  });

  it("preserves lightness exactly wherever sRGB has room for the chroma", () => {
    // The give only exists to buy chroma the gamut would otherwise refuse. Where
    // the requested chroma already fits, lightness must not move at all.
    for (const hue of SAMPLE_HUES) {
      const strength = DEFAULT_NEUTRAL_TINT;
      const ramp = generateNeutralRamp(hue, { strength });
      for (const step of CORE_STEPS) {
        const before = parseToOklch(GREY[step]!.hex).l;
        const requested = parseToOklch(ramp[step]!.oklch).c;
        if (maxChromaFor(before, hue) < requested) continue; // gamut-limited
        const after = parseToOklch(ramp[step]!.hex).l;
        expect(Math.abs(after - before), `${step} @ hue ${hue}`).toBeLessThanOrEqual(0.005);
      }
    }
  });

  it("spends the give only at the crowded light end", () => {
    // Mid and dark steps have gamut room to spare, so they never move.
    const ramp = generateNeutralRamp(265);
    for (const step of CORE_STEPS.filter((s) => Number(s) >= 500)) {
      const before = parseToOklch(GREY[step]!.hex).l;
      const after = parseToOklch(ramp[step]!.hex).l;
      expect(Math.abs(after - before), step).toBeLessThanOrEqual(0.005);
    }
  });

  it("never drops a token pair below the WCAG band it started in", () => {
    // The guarantee that matters: a tint may nudge a ratio, but it must not move
    // a pair across 3:1, 4.5:1 or 7:1. Checked at every 5 degrees of hue and
    // every strength, not just the samples.
    const bands = [7, 4.5, 3];
    for (const strength of Object.values(NEUTRAL_TINT_STRENGTHS)) {
      for (let hue = 0; hue < 360; hue += 5) {
        const ramp = generateNeutralRamp(hue, { strength });
        for (const [label, fg, bg] of TOKEN_PAIRS) {
          const before = contrast(GREY[fg]!.hex, GREY[bg]!.hex);
          const after = contrast(ramp[fg]!.hex, ramp[bg]!.hex);
          for (const band of bands) {
            if (before >= band) {
              expect(
                after,
                `${label} @ hue ${hue} strength ${strength} fell below ${band}:1`,
              ).toBeGreaterThanOrEqual(band);
            }
          }
        }
      }
    }
  });

  it("keeps the contrast shift bounded", () => {
    // Worst measured shift is content-placeholder on surface-primary,
    // 5.77:1 -> 5.35:1 (~7%).
    for (let hue = 0; hue < 360; hue += 5) {
      const ramp = generateNeutralRamp(hue, { strength: NEUTRAL_TINT_STRENGTHS.strong });
      for (const [label, fg, bg] of TOKEN_PAIRS) {
        const before = contrast(GREY[fg]!.hex, GREY[bg]!.hex);
        const after = contrast(ramp[fg]!.hex, ramp[bg]!.hex);
        expect(Math.abs(after - before) / before, `${label} @ hue ${hue}`).toBeLessThan(0.1);
      }
    }
  });

  it("makes the light-mode surfaces visibly tinted, not white", () => {
    // The regression this guards: with the authored light-end taper, light
    // surface-primary (grey.100) asked for chroma 0.005 against a gamut ceiling
    // of 0.004 and rendered flat white while dark mode tinted correctly.
    for (const hue of SAMPLE_HUES) {
      const ramp = generateNeutralRamp(hue);
      for (const step of ["100", "300", "400"]) {
        expect(
          parseToOklch(ramp[step]!.hex).c,
          `light surface step ${step} @ hue ${hue}`,
        ).toBeGreaterThan(0.01);
      }
    }
  });

  it("stays in gamut at maximum strength", () => {
    for (const hue of SAMPLE_HUES) {
      const ramp = generateNeutralRamp(hue, { strength: NEUTRAL_TINT_STRENGTHS.strong });
      for (const step of CORE_STEPS) {
        // A clipped color round-trips to a different chroma than requested.
        const { c } = parseToOklch(ramp[step]!.hex);
        expect(c).toBeLessThanOrEqual(NEUTRAL_TINT_STRENGTHS.strong + 0.005);
      }
    }
  });

  it("actually tints the surface steps", () => {
    const ramp = generateNeutralRamp(265);
    // Light surface-base (400) and surface-secondary (300) carry visible chroma.
    expect(parseToOklch(ramp["400"]!.hex).c).toBeGreaterThan(0.015);
    expect(parseToOklch(ramp["300"]!.hex).c).toBeGreaterThan(0.01);
    // Dark surfaces too.
    expect(parseToOklch(ramp["2200"]!.hex).c).toBeGreaterThan(0.015);
    // Every step moved off pure grey.
    expect(ramp["400"]!.hex).not.toBe(GREY["400"]!.hex);
  });

  it("returns the base ramp unchanged for an achromatic input", () => {
    expect(generateNeutralRamp("#808080")).toBe(GREY);
    expect(generateNeutralRamp("#ffffff")).toBe(GREY);
  });

  it("returns the base ramp unchanged at zero strength", () => {
    expect(generateNeutralRamp(265, { strength: 0 })).toBe(GREY);
    expect(generateNeutralRamp("#3355ff", { strength: NEUTRAL_TINT_STRENGTHS.none })).toBe(GREY);
  });

  it("takes hue from a hex input", () => {
    const fromHex = generateNeutralRamp("#3355ff");
    const fromHue = generateNeutralRamp(parseToOklch("#3355ff").h);
    expect(fromHex).toEqual(fromHue);
  });

  it("scales chroma with strength", () => {
    const subtle = parseToOklch(generateNeutralRamp(265, { strength: 0.02 })["1200"]!.hex).c;
    const strong = parseToOklch(generateNeutralRamp(265, { strength: 0.045 })["1200"]!.hex).c;
    expect(strong).toBeGreaterThan(subtle);
  });

  it("preserves the lightness of a non-grey base ramp", () => {
    const base = getCoreFamily("dove");
    const ramp = generateNeutralRamp(196, { baseRamp: base });
    for (const step of CORE_STEPS) {
      const before = parseToOklch(base[step]!.hex).l;
      const after = parseToOklch(ramp[step]!.hex).l;
      expect(Math.abs(after - before)).toBeLessThanOrEqual(0.005);
    }
  });

  it("normalizes hue across the full circle", () => {
    expect(generateNeutralRamp(-95)).toEqual(generateNeutralRamp(265));
    expect(generateNeutralRamp(625)).toEqual(generateNeutralRamp(265));
  });
});

describe("rampHue", () => {
  it("returns null for the achromatic grey ramp", () => {
    expect(rampHue(GREY)).toBeNull();
  });

  it("recovers the authored hue of each tinted family", () => {
    // Measured at step 1200, where the authored chroma plateau is stable.
    const expected: Record<string, number> = {
      dove: 338,
      mythical: 292,
      flint: 265,
      waterloo: 277,
      stone: 228,
      cave: 210,
      juniper: 196,
      battleship: 141,
      squirrel: 65,
      hemp: 18,
    };
    for (const [name, hue] of Object.entries(expected)) {
      const actual = rampHue(getCoreFamily(name))!;
      const delta = Math.abs(((actual - hue + 540) % 360) - 180);
      expect(delta, `${name}: got ${actual.toFixed(1)}, want ~${hue}`).toBeLessThan(8);
    }
  });

  it("round-trips a generated ramp's hue", () => {
    expect(Math.abs(rampHue(generateNeutralRamp(265))! - 265)).toBeLessThan(2);
  });
});

describe("getNeutralRamp", () => {
  it("returns grey exactly as authored", () => {
    expect(getNeutralRamp("grey")).toBe(coreColors.grey);
  });

  it("falls back to grey for an unknown family", () => {
    expect(getNeutralRamp("nonesuch")).toBe(coreColors.grey);
  });

  it("gives every preset grey's lightness curve, within the give budget", () => {
    for (const name of NEUTRAL_FAMILY_NAMES) {
      const ramp = getNeutralRamp(name);
      for (const step of CORE_STEPS) {
        const before = parseToOklch(GREY[step]!.hex).l;
        const after = parseToOklch(ramp[step]!.hex).l;
        expect(Math.abs(after - before), `${name}.${step}`).toBeLessThanOrEqual(
          MAX_LIGHTNESS_GIVE + 0.005,
        );
      }
    }
  });

  it("fixes the luminance divergence the authored families had", () => {
    // docs/theme-test.md recorded juniper.1400 at roughly half grey.1400's
    // luminance. Re-derived, they match.
    const authored = relativeLuminance(coreColors.juniper!["1400"]!.hex);
    const derived = relativeLuminance(getNeutralRamp("juniper")["1400"]!.hex);
    const grey = relativeLuminance(GREY["1400"]!.hex);
    expect(authored).toBeLessThan(grey * 0.7);
    expect(Math.abs(derived - grey) / grey).toBeLessThan(0.05);
  });

  it("keeps each preset's hue distinct", () => {
    const hues = NEUTRAL_FAMILY_NAMES.filter((n) => n !== "grey").map(
      (n) => rampHue(getNeutralRamp(n))!,
    );
    expect(new Set(hues.map((h) => Math.round(h))).size).toBe(hues.length);
  });

  it("honours the strength argument", () => {
    const quiet = parseToOklch(getNeutralRamp("flint", 0.02)["1200"]!.hex).c;
    const loud = parseToOklch(getNeutralRamp("flint", 0.045)["1200"]!.hex).c;
    expect(loud).toBeGreaterThan(quiet);
  });

  it("defaults to the mean strength of the authored families", () => {
    expect(DEFAULT_NEUTRAL_TINT).toBe(0.032);
    const ramp: ColorRamp = getNeutralRamp("dove");
    const peak = Math.max(...CORE_STEPS.map((s) => parseToOklch(ramp[s]!.hex).c));
    expect(peak).toBeGreaterThan(0.028);
    expect(peak).toBeLessThan(0.036);
  });
});
