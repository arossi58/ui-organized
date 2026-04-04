import { describe, it, expect } from "vitest";
import { generateModes, type ResolvedPrimitives } from "./modeGeneration.js";

// Minimal primitives using 100-1600 step convention
const mockPrimitives: ResolvedPrimitives = {
  brand: {
    "100":  { hex: "#e2f2ff", oklch: "oklch(0.940 0.030 240)" },
    "300":  { hex: "#a9d9ff", oklch: "oklch(0.850 0.090 240)" },
    "600":  { hex: "#52b4ff", oklch: "oklch(0.730 0.160 240)" },
    "700":  { hex: "#35a7ff", oklch: "oklch(0.690 0.175 240)" },
    "900":  { hex: "#008ffb", oklch: "oklch(0.603 0.190 240)" },
    "1000": { hex: "#007dde", oklch: "oklch(0.540 0.185 240)" },
    "1200": { hex: "#005aa5", oklch: "oklch(0.400 0.165 240)" },
    "1400": { hex: "#00396c", oklch: "oklch(0.270 0.130 240)" },
    "1600": { hex: "#001a33", oklch: "oklch(0.130 0.070 240)" },
  },
  neutral: {
    "100":  { hex: "#919baf", oklch: "oklch(0.653 0.040 250)" },
    "400":  { hex: "#636f87", oklch: "oklch(0.503 0.033 250)" },
    "900":  { hex: "#262b34", oklch: "oklch(0.252 0.016 250)" },
    "1200": { hex: "#181a22", oklch: "oklch(0.163 0.010 250)" },
    "1400": { hex: "#0f1016", oklch: "oklch(0.108 0.006 250)" },
    "1500": { hex: "#0b0b10", oklch: "oklch(0.082 0.004 250)" },
    "1600": { hex: "#060609", oklch: "oklch(0.044 0.002 250)" },
  },
  functional: {
    success: { "500": { hex: "#22c55e", oklch: "oklch(0.72 0.19 145)" } },
    warning: { "500": { hex: "#f59e0b", oklch: "oklch(0.78 0.18 74)" } },
    error:   { "500": { hex: "#ef4444", oklch: "oklch(0.63 0.22 27)" } },
    info:    { "500": { hex: "#3b82f6", oklch: "oklch(0.62 0.20 251)" } },
  },
};

describe("generateModes", () => {
  const modes = generateModes(mockPrimitives);

  it("returns both light and dark modes", () => {
    expect(modes).toHaveProperty("light");
    expect(modes).toHaveProperty("dark");
  });

  const requiredKeys = [
    "bg.primary",
    "bg.secondary",
    "fg.primary",
    "fg.secondary",
    "interactive.default",
    "interactive.hover",
    "border.default",
    "functional.success",
    "functional.error",
  ];

  for (const key of requiredKeys) {
    it(`light mode includes "${key}"`, () => {
      expect(modes.light[key]).toBeDefined();
    });
    it(`dark mode includes "${key}"`, () => {
      expect(modes.dark[key]).toBeDefined();
    });
  }

  it("light and dark interactive.default use different brand steps", () => {
    expect(modes.light["interactive.default"]).not.toBe(modes.dark["interactive.default"]);
  });

  it("all values are primitive reference strings (palette.step format)", () => {
    const allValues = [
      ...Object.values(modes.light),
      ...Object.values(modes.dark),
    ];
    for (const val of allValues) {
      expect(val).toMatch(/^[a-z]+(\.[a-z]+)*\.\d+$/);
    }
  });
});
