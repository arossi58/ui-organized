import { describe, it, expect } from "vitest";
import { generateModes, type ResolvedPrimitives } from "./modeGeneration.js";

const makeRamp = (steps: string[]): Record<string, { hex: string; oklch: string }> =>
  Object.fromEntries(steps.map((s) => [s, { hex: "#000000", oklch: "oklch(0 0 0)" }]));

const ALL_STEPS = ["100","200","300","400","500","600","700","800","900","1000","1100","1200","1300","1400","1500","1600"];

const mockPrimitives: ResolvedPrimitives = {
  brand:   makeRamp(ALL_STEPS),
  neutral: makeRamp(ALL_STEPS),
  black:   makeRamp(ALL_STEPS),
  white:   makeRamp(ALL_STEPS),
  functional: {
    lima:        makeRamp(ALL_STEPS),
    cerulean:    makeRamp(ALL_STEPS),
    caribbean:   makeRamp(ALL_STEPS),
    candlelight: makeRamp(ALL_STEPS),
    cerise:      makeRamp(ALL_STEPS),
    crimson:     makeRamp(ALL_STEPS),
  },
};

describe("generateModes", () => {
  const modes = generateModes(mockPrimitives);

  it("returns both light and dark modes", () => {
    expect(modes).toHaveProperty("light");
    expect(modes).toHaveProperty("dark");
  });

  const requiredKeys = [
    "color-surface.base",
    "color-surface.subtle",
    "color-text.primary",
    "color-text.secondary",
    "color-border.subtle",
    "color-border.data-entry",
    "color-icon.primary",
    "color-interactive.primary.default",
    "color-interactive.primary.hover",
    "color-interactive.primary.active",
    "color-interactive.secondary.default",
    "color-interactive.tertiary.default",
    "color-interactive.ghost.hover",
    "color-interactive.destructive.default",
    "color-interactive.contents",
    "color-interactive.focus",
    "color-interactive.ui.default",
    "color-interactive.inactive.01",
    "color-status.success",
    "color-status.success-bg",
    "color-status.error",
    "color-status.error-message",
    "color-elevation.subtle",
    "color-elevation.medium",
  ];

  for (const key of requiredKeys) {
    it(`dark mode includes "${key}"`, () => {
      expect(modes.dark[key]).toBeDefined();
    });
    it(`light mode includes "${key}"`, () => {
      expect(modes.light[key]).toBeDefined();
    });
  }

  it("light and dark surface.base use different steps", () => {
    expect(modes.light["color-surface.base"]).toBe("neutral.100");
    expect(modes.dark["color-surface.base"]).toBe("black.1600");
  });

  it("primary default uses brandShade", () => {
    expect(modes.dark["color-interactive.primary.default"]).toBe("brand.1200");
    expect(modes.light["color-interactive.primary.default"]).toBe("brand.1200");
  });

  it("primary default respects custom brandShade", () => {
    const custom = generateModes(mockPrimitives, "900");
    expect(custom.dark["color-interactive.primary.default"]).toBe("brand.900");
    expect(custom.dark["color-interactive.primary.hover"]).toBe("brand.1100");
    expect(custom.dark["color-interactive.primary.active"]).toBe("brand.1300");
  });

  it("elevation uses css: prefix for OKLCH composite values", () => {
    expect(modes.dark["color-elevation.subtle"]).toMatch(/^css:oklch\(/);
    expect(modes.light["color-elevation.subtle"]).toMatch(/^css:oklch\(/);
  });

  it("dark elevation uses neutral-400, light elevation uses neutral-1400", () => {
    expect(modes.dark["color-elevation.subtle"]).toContain("--neutral-400");
    expect(modes.light["color-elevation.subtle"]).toContain("--neutral-1400");
  });

  it("primitive reference values use palette.step format", () => {
    for (const [key, val] of Object.entries(modes.dark)) {
      if (!val.startsWith("css:")) {
        expect(val, `dark["${key}"]`).toMatch(/^[a-z][a-z0-9-]*\.\d+(-[a-z]+)*$/);
      }
    }
    for (const [key, val] of Object.entries(modes.light)) {
      if (!val.startsWith("css:")) {
        expect(val, `light["${key}"]`).toMatch(/^[a-z][a-z0-9-]*\.\d+(-[a-z]+)*$/);
      }
    }
  });
});
