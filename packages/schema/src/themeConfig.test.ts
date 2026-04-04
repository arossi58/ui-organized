import { describe, it, expect } from "vitest";
import { validateConfig, themeConfigSchema } from "./themeConfig.js";
import exampleTheme from "./example-theme.json";

function merge(base: unknown, overrides: Record<string, unknown>): unknown {
  return { ...(base as Record<string, unknown>), ...overrides };
}

describe("validateConfig — valid input", () => {
  it("accepts the example theme fixture", () => {
    expect(() => validateConfig(exampleTheme)).not.toThrow();
  });

  it("returns the parsed config", () => {
    const result = validateConfig(exampleTheme);
    expect(result.metadata.name).toBe("Horizon");
    expect(result.color.neutralPreset).toBe("shark");
    expect(result.typography.scale.base).toBe(16);
    expect(result.borderRadius["radius-04"]).toBe(8);
    expect(result.borderRadius["radius-full"]).toBe(99999);
    expect(result.spacing.baseUnit).toBe(4);
  });

  it("allows timestamp to be omitted", () => {
    const { timestamp: _ts, ...metaWithoutTimestamp } = (exampleTheme as any).metadata;
    const input = merge(exampleTheme, { metadata: metaWithoutTimestamp });
    expect(() => validateConfig(input)).not.toThrow();
  });

  it("accepts multiple modes", () => {
    const result = validateConfig(exampleTheme);
    expect(result.color.modes).toHaveProperty("dark");
    expect(result.color.modes).toHaveProperty("light");
  });
});

describe("validateConfig — type scale step names", () => {
  it("has all required step names", () => {
    const result = validateConfig(exampleTheme);
    const steps = result.typography.scale.steps;
    const required = [
      "display-xlarge", "display-large", "display-medium",
      "heading-large", "heading-medium", "heading-small",
      "body-large", "body-medium", "body-small", "caption",
    ];
    for (const step of required) {
      expect(steps[step]).toBeDefined();
      expect(steps[step]).toBeGreaterThan(0);
    }
  });
});

describe("validateConfig — border radius scale", () => {
  it("has all radius steps", () => {
    const result = validateConfig(exampleTheme);
    const br = result.borderRadius;
    for (let i = 1; i <= 12; i++) {
      const key = `radius-${String(i).padStart(2, "0")}`;
      expect(br[key as keyof typeof br]).toBeGreaterThanOrEqual(0);
    }
    expect(br["radius-full"]).toBe(99999);
  });

  it("radius steps increase monotonically", () => {
    const result = validateConfig(exampleTheme);
    const br = result.borderRadius;
    for (let i = 1; i < 12; i++) {
      const a = `radius-${String(i).padStart(2, "0")}`;
      const b = `radius-${String(i + 1).padStart(2, "0")}`;
      expect(br[b as keyof typeof br]).toBeGreaterThanOrEqual(br[a as keyof typeof br]);
    }
  });
});

describe("validateConfig — missing required fields", () => {
  it("throws when metadata is missing", () => {
    const { metadata: _m, ...rest } = exampleTheme as any;
    expect(() => validateConfig(rest)).toThrow(/metadata/);
  });

  it("throws when color is missing", () => {
    const { color: _c, ...rest } = exampleTheme as any;
    expect(() => validateConfig(rest)).toThrow(/color/);
  });

  it("throws when typography is missing", () => {
    const { typography: _t, ...rest } = exampleTheme as any;
    expect(() => validateConfig(rest)).toThrow(/typography/);
  });

  it("throws when borderRadius is missing", () => {
    const { borderRadius: _b, ...rest } = exampleTheme as any;
    expect(() => validateConfig(rest)).toThrow(/borderRadius/);
  });

  it("throws when spacing is missing", () => {
    const { spacing: _s, ...rest } = exampleTheme as any;
    expect(() => validateConfig(rest)).toThrow(/spacing/);
  });

  it("throws when metadata.name is empty", () => {
    const input = merge(exampleTheme, {
      metadata: { ...exampleTheme.metadata, name: "" },
    });
    expect(() => validateConfig(input)).toThrow(/name/);
  });

  it("throws when schemaVersion is not semver", () => {
    const input = merge(exampleTheme, {
      metadata: { ...exampleTheme.metadata, schemaVersion: "v1" },
    });
    expect(() => validateConfig(input)).toThrow(/semver/);
  });
});

describe("validateConfig — invalid value types", () => {
  it("throws when brandColor.hex is not a valid hex", () => {
    const input = merge(exampleTheme, {
      color: {
        ...exampleTheme.color,
        brandColor: { hex: "not-a-hex", oklch: "oklch(0.5 0.1 200)" },
      },
    });
    expect(() => validateConfig(input)).toThrow(/hex/i);
  });

  it("throws when spacing.baseUnit is zero", () => {
    const input = merge(exampleTheme, { spacing: { baseUnit: 0 } });
    expect(() => validateConfig(input)).toThrow(/baseUnit/);
  });

  it("throws when spacing.baseUnit is negative", () => {
    const input = merge(exampleTheme, { spacing: { baseUnit: -4 } });
    expect(() => validateConfig(input)).toThrow(/baseUnit/);
  });

  it("throws when a font weight is not a multiple of 100", () => {
    const input = merge(exampleTheme, {
      typography: {
        ...exampleTheme.typography,
        headingFont: { family: "Roboto", weights: { Heavy: 750 } },
      },
    });
    expect(() => validateConfig(input)).toThrow(/multiple of 100/);
  });

  it("throws when a font weight is below 100", () => {
    const input = merge(exampleTheme, {
      typography: {
        ...exampleTheme.typography,
        bodyFont: { family: "Roboto", weights: { Default: 50 } },
      },
    });
    expect(() => validateConfig(input)).toThrow(/100/);
  });

  it("throws when scale base is not positive", () => {
    const input = merge(exampleTheme, {
      typography: {
        ...exampleTheme.typography,
        scale: { ...exampleTheme.typography.scale, base: -1 },
      },
    });
    expect(() => validateConfig(input)).toThrow(/base/);
  });
});

describe("validateConfig — icons", () => {
  it("accepts valid icons config", () => {
    const result = validateConfig(exampleTheme);
    expect(result.icons.library).toBe("lucide");
    expect(result.icons.style).toBe("outline");
    expect(result.icons.strokeAdjustment).toBe(true);
  });

  it("accepts all supported library values", () => {
    for (const library of ["lucide", "tabler", "heroicons"] as const) {
      const input = merge(exampleTheme, {
        icons: { library, style: "outline", strokeAdjustment: false },
      });
      expect(() => validateConfig(input)).not.toThrow();
    }
  });

  it("accepts solid style", () => {
    const input = merge(exampleTheme, {
      icons: { library: "heroicons", style: "solid", strokeAdjustment: false },
    });
    expect(() => validateConfig(input)).not.toThrow();
  });

  it("throws when icons is missing", () => {
    const { icons: _i, ...rest } = exampleTheme as any;
    expect(() => validateConfig(rest)).toThrow(/icons/);
  });

  it("throws when library is not a supported value", () => {
    const input = merge(exampleTheme, {
      icons: { library: "font-awesome", style: "outline", strokeAdjustment: false },
    });
    expect(() => validateConfig(input)).toThrow();
  });

  it("throws when style is not a supported value", () => {
    const input = merge(exampleTheme, {
      icons: { library: "lucide", style: "duotone", strokeAdjustment: false },
    });
    expect(() => validateConfig(input)).toThrow();
  });

  it("throws when strokeAdjustment is not a boolean", () => {
    const input = merge(exampleTheme, {
      icons: { library: "lucide", style: "outline", strokeAdjustment: "yes" },
    });
    expect(() => validateConfig(input)).toThrow();
  });
});

describe("themeConfigSchema.parse", () => {
  it("returns the same data as validateConfig", () => {
    const fromSchema = themeConfigSchema.parse(exampleTheme);
    const fromHelper = validateConfig(exampleTheme);
    expect(fromSchema).toEqual(fromHelper);
  });
});
