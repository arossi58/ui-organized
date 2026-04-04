import { describe, it, expect } from "vitest";
import { transformConfig } from "./transform.js";
import exampleTheme from "../../node_modules/@ds/schema/src/example-theme.json" with { type: "json" };
import { validateConfig } from "@ds/schema";

const config = validateConfig(exampleTheme);

describe("transformConfig — structure", () => {
  const result = transformConfig(config);

  it("returns all five result keys", () => {
    expect(result).toHaveProperty("primitiveTokens");
    expect(result).toHaveProperty("radiusTokens");
    expect(result).toHaveProperty("spacingTokens");
    expect(result).toHaveProperty("typeTokens");
    expect(result).toHaveProperty("modeOverrides");
  });

  it("primitive tokens include brand ramp", () => {
    const brand = (result.primitiveTokens as any).brand;
    expect(brand).toBeDefined();
    expect(brand["900"]).toMatchObject({ $value: expect.stringMatching(/^#/), $type: "color" });
  });

  it("primitive tokens include neutral ramp", () => {
    const neutral = (result.primitiveTokens as any).neutral;
    expect(neutral).toBeDefined();
    expect(Object.keys(neutral).length).toBeGreaterThanOrEqual(10);
  });

  it("primitive tokens include black and white", () => {
    expect((result.primitiveTokens as any).black).toBeDefined();
    expect((result.primitiveTokens as any).white).toBeDefined();
  });

  it("primitive tokens include all six functional palettes", () => {
    const prims = result.primitiveTokens as any;
    expect(prims).toHaveProperty("lima");
    expect(prims).toHaveProperty("cerulean");
    expect(prims).toHaveProperty("caribbean");
    expect(prims).toHaveProperty("candlelight");
    expect(prims).toHaveProperty("cerise");
    expect(prims).toHaveProperty("crimson");
  });

  it("radius tokens include all 13 named sizes", () => {
    const radius = (result.radiusTokens as any)["border-radius"];
    expect(radius).toBeDefined();
    for (let i = 1; i <= 12; i++) {
      const key = `radius-${String(i).padStart(2, "0")}`;
      expect(radius[key]).toBeDefined();
    }
    expect(radius["radius-full"]).toBeDefined();
  });

  it("radius-04 has $value '8px'", () => {
    const r04 = (result.radiusTokens as any)["border-radius"]?.["radius-04"];
    expect(r04.$value).toBe("8px");
  });

  it("spacing tokens contain space-01 equal to base unit in px", () => {
    const step = (result.spacingTokens as any).spacing?.["space-01"];
    expect(step.$value).toBe(`${config.spacing.baseUnit}px`);
  });

  it("spacing tokens contain space-04 = 16px at base 4", () => {
    const step = (result.spacingTokens as any).spacing?.["space-04"];
    expect(step.$value).toBe("16px");
  });

  it("type tokens include font families", () => {
    const fonts = (result.typeTokens as any).type?.font;
    expect(fonts?.heading.$value).toBe(config.typography.headingFont.family);
    expect(fonts?.body.$value).toBe(config.typography.bodyFont.family);
  });

  it("type tokens include body-large size step", () => {
    const sizes = (result.typeTokens as any).type?.size;
    expect(sizes).toHaveProperty("body-large");
    expect(sizes?.["body-large"].$value).toBe("16px");
  });

  it("type tokens include display-xlarge size step", () => {
    const sizes = (result.typeTokens as any).type?.size;
    expect(sizes?.["display-xlarge"].$value).toBe("64px");
  });

  it("type tokens include weight roles for heading and body", () => {
    const weights = (result.typeTokens as any).type?.weight;
    expect(weights).toHaveProperty("heading");
    expect(weights).toHaveProperty("body");
  });

  it("type tokens include leading steps", () => {
    const leading = (result.typeTokens as any).type?.leading;
    expect(leading).toHaveProperty("body-large");
    expect(leading?.["body-large"].$type).toBe("dimension");
  });
});

describe("transformConfig — mode overrides", () => {
  const result = transformConfig(config);

  it("generates a mode entry for each mode in the config", () => {
    for (const name of Object.keys(config.color.modes)) {
      expect(result.modeOverrides).toHaveProperty(name);
    }
  });

  it("dark mode contains color-surface.base resolved to a hex value", () => {
    const dark = result.modeOverrides["dark"];
    expect(dark).toBeDefined();
    expect(dark!["color-surface.base"]).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("dark surface base differs from light surface base", () => {
    const dark = result.modeOverrides["dark"]!["color-surface.base"];
    const light = result.modeOverrides["light"]!["color-surface.base"];
    expect(dark).not.toBe(light);
  });

  it("all resolved override values are hex strings", () => {
    for (const modeValues of Object.values(result.modeOverrides)) {
      for (const hex of Object.values(modeValues)) {
        expect(hex).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });
});
