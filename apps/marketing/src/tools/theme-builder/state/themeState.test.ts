import { describe, it, expect, beforeEach } from "vitest";
import {
  typeSizeTokens,
  typeLeadingTokens,
  typeFontTokens,
  typeWeightTokens,
} from "@ui-organized/tokens";
import {
  getCoreFamily,
  parseToOklch,
  DEFAULT_NEUTRAL_TINT,
  MAX_LIGHTNESS_GIVE,
  MIN_NEUTRAL_TINT,
} from "@ui-organized/utils";
import { useBuilderStore } from "./themeState";
import { buildThemeTokens } from "../utils/buildConfig";
import { describeReplaced } from "../utils/themeDiff";

const s = () => useBuilderStore.getState();

// The store is a module singleton; restore typography to defaults before each test.
beforeEach(() => {
  s().resetTypeScale();
  s().resetLineHeight();
  s().setHeadingFont(typeFontTokens.heading, { ...typeWeightTokens.heading });
  s().setBodyFont(typeFontTokens.body, { ...typeWeightTokens.body });
});

describe("typography defaults (1:1 with the design system)", () => {
  it("opens in 'system' mode seeded from the canonical tokens", () => {
    expect(s().typeScaleMode).toBe("system");
    expect(s().lineHeightMode).toBe("system");
    expect(s().typeScaleSteps).toEqual(typeSizeTokens);
    expect(s().leadingSteps).toEqual(typeLeadingTokens);
    expect(s().headingFamily).toBe(typeFontTokens.heading);
    expect(s().bodyWeights).toEqual(typeWeightTokens.body);
  });

  it("uses the canonical 21px body-medium leading by default (1.5× body)", () => {
    expect(s().leadingSteps["body-medium"]).toBe(21);
  });
});

describe("line-height system → custom override", () => {
  it("dragging the body line height flips to a uniform custom multiplier", () => {
    s().setBodyLineHeight(1.5);
    expect(s().lineHeightMode).toBe("custom");
    // body-medium = 14px × 1.5 = 21px once uniform
    expect(s().leadingSteps["body-medium"]).toBe(21);
    // heading steps keep their own (still-default 1.5×) multiplier
    expect(s().leadingSteps["display-xlarge"]).toBe(64 * 1.5);
  });

  it("resetLineHeight restores the canonical per-step leadings", () => {
    s().setBodyLineHeight(1.2);
    expect(s().lineHeightMode).toBe("custom");
    s().resetLineHeight();
    expect(s().lineHeightMode).toBe("system");
    expect(s().leadingSteps).toEqual(typeLeadingTokens);
  });
});

describe("type-scale system → custom override", () => {
  it("editing base/ratio flips to custom and regenerates sizes", () => {
    s().setTypeScale(18, 1.333);
    expect(s().typeScaleMode).toBe("custom");
    expect(s().typeScaleSteps["body-large"]).toBe(18);
    // Leadings stay on the canonical px values while line height is still "system".
    expect(s().lineHeightMode).toBe("system");
    expect(s().leadingSteps).toEqual(typeLeadingTokens);
  });

  it("resetTypeScale restores the canonical sizes", () => {
    s().setTypeScale(20, 1.5);
    expect(s().typeScaleMode).toBe("custom");
    s().resetTypeScale();
    expect(s().typeScaleMode).toBe("system");
    expect(s().typeScaleSteps).toEqual(typeSizeTokens);
  });
});

describe("export → import round-trip", () => {
  it("preserves system mode and the canonical scale", () => {
    const theme = buildThemeTokens(s());
    s().setBodyLineHeight(1.1); // dirty the state
    s().loadFromThemeJson(theme);
    expect(s().lineHeightMode).toBe("system");
    expect(s().typeScaleMode).toBe("system");
    expect(s().leadingSteps).toEqual(typeLeadingTokens);
    expect(s().typeScaleSteps).toEqual(typeSizeTokens);
  });

  it("preserves a customized scale + line height", () => {
    s().setTypeScale(18, 1.2);
    s().setBodyLineHeight(1.4);
    s().setHeadingLineHeight(1.1);
    const customSizes = { ...s().typeScaleSteps };
    const customLeadings = { ...s().leadingSteps };

    const theme = buildThemeTokens(s());
    s().resetTypeScale();
    s().resetLineHeight();
    s().loadFromThemeJson(theme);

    expect(s().typeScaleMode).toBe("custom");
    expect(s().lineHeightMode).toBe("custom");
    expect(s().typeScaleSteps).toEqual(customSizes);
    expect(s().leadingSteps).toEqual(customLeadings);
  });
});

describe("neutral surface tint", () => {
  // The store is a singleton, so put the neutral back to the untinted default.
  const resetNeutral = () => {
    s().setNeutralFamily("grey");
    s().setNeutralTint(DEFAULT_NEUTRAL_TINT);
  };

  it("defaults to untinted grey", () => {
    resetNeutral();
    expect(s().neutralMode).toBe("family");
    expect(s().neutralFamily).toBe("grey");
    expect(s().neutralRamp).toEqual(getCoreFamily("grey"));
  });

  it("tints from a named family while holding lightness", () => {
    resetNeutral();
    s().setNeutralFamily("flint");
    const grey = getCoreFamily("grey");
    for (const step of Object.keys(grey)) {
      const delta = Math.abs(
        parseToOklch(s().neutralRamp[step]!.hex).l - parseToOklch(grey[step]!.hex).l,
      );
      // Exact except at the light steps, where sRGB is too narrow to hold the
      // chroma and the generator spends a bounded amount of lightness for it.
      expect(delta, step).toBeLessThanOrEqual(MAX_LIGHTNESS_GIVE + 0.005);
    }
    // …but it is no longer grey.
    expect(s().neutralRamp["400"]!.hex).not.toBe(grey["400"]!.hex);
  });

  it("tints the light-mode surface steps visibly", () => {
    resetNeutral();
    s().setNeutralFamily("flint");
    // surface-base (400), surface-secondary (300) and surface-primary (100).
    for (const step of ["400", "300", "100"]) {
      expect(parseToOklch(s().neutralRamp[step]!.hex).c, step).toBeGreaterThan(0.01);
    }
  });

  it("tints from a custom hex", () => {
    resetNeutral();
    s().setNeutralColor("#3355ff");
    expect(s().neutralMode).toBe("custom");
    expect(s().neutralHex).toBe("#3355ff");
    expect(s().neutralRamp["400"]!.hex).not.toBe(getCoreFamily("grey")["400"]!.hex);
  });

  it("re-derives the ramp when strength changes", () => {
    resetNeutral();
    s().setNeutralFamily("flint");
    const atDefault = s().neutralRamp["1200"]!.hex;
    s().setNeutralTint(0.045);
    expect(s().neutralRamp["1200"]!.hex).not.toBe(atDefault);
    s().setNeutralTint(0);
    expect(s().neutralRamp).toEqual(getCoreFamily("grey"));
  });

  it("carries a picked family into the custom color", () => {
    resetNeutral();
    s().setNeutralFamily("flint");
    // The color input mirrors the swatch, so switching to custom continues from
    // the family rather than jumping to an unrelated hex.
    expect(s().neutralHex).toBe(s().neutralRamp["1000"]!.hex);
    expect(s().neutralHex).not.toBe("#808080");
  });

  it("floors the strength when a tinted family is picked", () => {
    resetNeutral();
    s().setNeutralTint(0); // below the control's minimum
    s().setNeutralFamily("flint");
    expect(s().neutralTint).toBe(MIN_NEUTRAL_TINT);
    expect(s().neutralRamp).not.toEqual(getCoreFamily("grey"));
  });

  it("floors the strength when a custom color is picked", () => {
    resetNeutral();
    s().setNeutralTint(0);
    s().setNeutralColor("#3355ff");
    expect(s().neutralTint).toBe(MIN_NEUTRAL_TINT);
  });

  it("leaves grey alone — it is achromatic whatever the strength", () => {
    resetNeutral();
    s().setNeutralTint(0);
    s().setNeutralFamily("grey");
    expect(s().neutralTint).toBe(0);
    expect(s().neutralRamp).toEqual(getCoreFamily("grey"));
  });

  it("floors an imported tint below the minimum", () => {
    resetNeutral();
    s().setNeutralFamily("flint");
    const theme = buildThemeTokens(s()) as Record<string, any>;
    theme.$extensions["com.ui-organized.theme-builder"].neutral.tint = 0.001;

    s().loadFromThemeJson(theme);
    expect(s().neutralTint).toBe(MIN_NEUTRAL_TINT);
  });

  it("round-trips a custom tint through export → import", () => {
    resetNeutral();
    s().setNeutralColor("#3355ff");
    s().setNeutralTint(0.041);
    const expected = { ...s().neutralRamp };

    const theme = buildThemeTokens(s());
    s().setNeutralFamily("grey"); // dirty the state
    s().setNeutralTint(DEFAULT_NEUTRAL_TINT);
    s().loadFromThemeJson(theme);

    expect(s().neutralMode).toBe("custom");
    expect(s().neutralHex).toBe("#3355ff");
    expect(s().neutralTint).toBeCloseTo(0.041, 5);
    expect(s().neutralRamp).toEqual(expected);
  });

  it("round-trips a family tint through export → import", () => {
    resetNeutral();
    s().setNeutralFamily("juniper");
    const expected = { ...s().neutralRamp };

    const theme = buildThemeTokens(s());
    s().setNeutralColor("#ff0000"); // dirty the state
    s().loadFromThemeJson(theme);

    expect(s().neutralMode).toBe("family");
    expect(s().neutralFamily).toBe("juniper");
    expect(s().neutralRamp).toEqual(expected);
  });

  it("loads a legacy theme that predates tinting", () => {
    resetNeutral();
    const theme = buildThemeTokens(s()) as Record<string, any>;
    const ext = theme.$extensions["com.ui-organized.theme-builder"];
    // Themes written before this feature carry only `neutral.family`.
    ext.neutral = { family: "flint" };

    s().setNeutralColor("#ff0000"); // dirty the state
    s().loadFromThemeJson(theme);

    expect(s().neutralMode).toBe("family");
    expect(s().neutralFamily).toBe("flint");
    expect(s().neutralTint).toBe(DEFAULT_NEUTRAL_TINT);
  });
});

describe("loadFromThemeJson reports the values it replaced", () => {
  // The builder keeps its inputs and re-derives every color, spacing step,
  // radius and component size, so a variable edited in Figma comes back as the
  // derived value. The import has to say which, not promise a lossless trip.
  const exported = () => JSON.parse(JSON.stringify(buildThemeTokens(s()))) as Record<string, any>;
  /** The `$value` a `{a.b.c}` reference points at inside `doc`. */
  const valueAt = (doc: Record<string, any>, ref: string): unknown =>
    ref
      .slice(1, -1)
      .split(".")
      .reduce<any>((node, key) => node?.[key], doc)?.$value;

  beforeEach(() => {
    s().setNeutralFamily("grey");
    s().setNeutralTint(DEFAULT_NEUTRAL_TINT);
    s().setRadiusBase(4);
    s().setSpacingBase(4);
  });

  it("reports nothing for the builder's own unmodified export", () => {
    expect(s().loadFromThemeJson(exported())).toEqual([]);
  });

  it("reports nothing for an unmodified tinted, customized theme either", () => {
    s().setNeutralFamily("juniper");
    s().setRadiusBase(6);
    s().setSpacingBase(5);
    s().setTypeScale(18, 1.2);
    const theme = exported();
    s().setNeutralFamily("grey"); // dirty the state
    s().setSpacingBase(4);
    expect(s().loadFromThemeJson(theme)).toEqual([]);
    s().resetTypeScale();
  });

  it("reports a re-pointed semantic color", () => {
    const theme = exported();
    const original = theme.color.dark.surface.primary.$value as string;
    theme.color.dark.surface.primary.$value = "{primitive.color.neutral.1000}";

    expect(s().loadFromThemeJson(theme)).toEqual([
      {
        path: "color.dark.surface.primary",
        section: "color",
        file: valueAt(theme, "{primitive.color.neutral.1000}"),
        builder: valueAt(theme, original),
      },
    ]);
  });

  it("reports an edited primitive hex, and each semantic color that resolved through it", () => {
    const theme = exported();
    theme.primitive.color.brand["1400"].$value = "#123456";

    const replaced = s().loadFromThemeJson(theme).map((r) => r.path);
    expect(replaced).toContain("primitive.color.brand.1400");
    // The file's aliases still point at brand.1400, but brand.1400 is a different color.
    const aliased = Object.entries(theme.color.light)
      .filter(([, token]) => (token as any).$value === "{primitive.color.brand.1400}")
      .map(([name]) => `color.light.${name}`);
    expect(aliased.length).toBeGreaterThan(0);
    for (const path of aliased) expect(replaced).toContain(path);
  });

  it("reports an edited spacing step, and counts it by section", () => {
    const theme = exported();
    theme.spacing["space-03"].$value = "13px";

    const replaced = s().loadFromThemeJson(theme);
    expect(replaced.map((r) => [r.path, r.file])).toEqual([["spacing.space-03", "13px"]]);
    expect(describeReplaced(replaced)).toBe("1 spacing value");
  });

  it("ignores the float and format noise a Figma round trip adds", () => {
    const theme = exported();
    // Figma stores numbers as 32-bit floats, and the builder's rgba() alpha
    // colors may come back as 8-digit hex from another tool.
    const step = theme.spacing["space-03"];
    step.$value = `${parseFloat(step.$value) + 0.0000002}px`;
    const ui = theme.color.light.interactive["ui-default"];
    const [r, g, b, a] = /rgba\(([^)]+)\)/.exec(ui.$value)![1]!.split(",").map(Number);
    const hex = (n: number) => Math.round(n).toString(16).padStart(2, "0");
    ui.$value = `#${hex(r!)}${hex(g!)}${hex(b!)}${hex(a! * 255)}`;

    expect(s().loadFromThemeJson(theme)).toEqual([]);
  });

  it("reports nothing for a file with no color group", () => {
    const theme = exported();
    delete theme.color;
    delete theme.primitive;
    expect(s().loadFromThemeJson(theme)).toEqual([]);
    expect(s().loadFromThemeJson({ type: {}, spacing: {} })).toEqual([]);
  });
});
