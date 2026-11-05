import { describe, it, expect } from "vitest";
import { contrastRatio, relativeLuminance } from "./contrast.js";
import { getCoreFamily } from "./families.js";
import { getAuthoredFamily, NEUTRAL_FAMILY_NAMES } from "./coreColors.js";
import { getNeutralPreset } from "./neutralPresets.js";
import { resolveSemanticColors, resolveSemanticRefs } from "./semanticResolve.js";
import { semanticColorMap } from "./semanticColorMap.js";

const GREY = getCoreFamily("grey");
const opts = (brand: string, neutral = "grey") => ({
  brandRamp: getCoreFamily(brand),
  neutralRamp: getCoreFamily(neutral),
});
const refStep = (mode: "light" | "dark", brand: string, cssVar: string) => {
  const r = resolveSemanticRefs(mode, opts(brand))[cssVar]!;
  return r.kind === "alias" ? `${r.group === "neutral" ? "grey" : r.group}.${r.step}` : r.value;
};

describe("getCoreFamily", () => {
  it("returns neutrals re-derived to grey's lightness", () => {
    const derived = relativeLuminance(getCoreFamily("juniper")["1400"]!.hex);
    const grey = relativeLuminance(GREY["1400"]!.hex);
    expect(Math.abs(derived - grey) / grey).toBeLessThan(0.05);
  });

  it("returns brands as authored", () => {
    expect(getCoreFamily("mars")).toBe(getAuthoredFamily("mars"));
  });

  it("keeps the authored neutrals reachable for palette display", () => {
    for (const name of NEUTRAL_FAMILY_NAMES.filter((n) => n !== "grey")) {
      expect(getAuthoredFamily(name)).not.toBe(getCoreFamily(name));
    }
  });
});

describe("resolveSemanticColors — unresolvable refs", () => {
  it("throws on a ramp that is missing a mapped step", () => {
    expect(() =>
      resolveSemanticColors("light", { brandRamp: getCoreFamily("mars"), neutralRamp: getNeutralPreset("flint") }),
    ).toThrow(/grey\.\d+.*neutral ramp/);
  });

  it("resolves every role to a color on a full ramp", () => {
    for (const mode of ["light", "dark"] as const) {
      const bad = Object.values(resolveSemanticColors(mode, opts("mars", "flint"))).filter(
        (v) => !/^(#|rgba?\()/.test(v),
      );
      expect(bad).toEqual([]);
    }
  });
});

describe("resolveSemanticColors — filled-button label", () => {
  it("keeps the near-white label on the default brand, matching the shipped map", () => {
    for (const mode of ["light", "dark"] as const) {
      expect(refStep(mode, "mars", "--color-interactive-contents")).toBe("grey.100");
      // The default theme needs no adjustment: resolver output == shipped CSS.
      for (const [cssVar, ref] of Object.entries(semanticColorMap[mode])) {
        const out = refStep(mode, "mars", cssVar);
        if (/^(brand|grey)\./.test(ref) && !out.startsWith("rgba")) expect(out, cssVar).toBe(ref);
      }
    }
  });

  it("gives a light brand fill a dark label", () => {
    expect(refStep("light", "candlelight", "--color-interactive-contents")).toBe("grey.2400");
    expect(refStep("dark", "candlelight", "--color-interactive-contents")).toBe("grey.2400");
  });

  it("follows a lighter primary shade", () => {
    const vars = resolveSemanticColors("dark", { ...opts("mars"), brandShade: "900" });
    expect(vars["--color-interactive-contents"]).toBe(GREY["2400"]!.hex);
    expect(contrastRatio(vars["--color-interactive-contents"]!, vars["--color-interactive-primary-default"]!)).toBeGreaterThanOrEqual(4.5);
  });
});

describe("resolveSemanticColors — links", () => {
  it.each(["purple", "lapis", "persian", "cerulean"])("%s dark links clear 4.5:1 on both surfaces", (brand) => {
    const v = resolveSemanticColors("dark", opts(brand));
    for (const state of ["default", "hover", "active"]) {
      for (const bed of ["primary", "secondary"]) {
        expect(
          contrastRatio(v[`--color-interactive-tertiary-${state}`]!, v[`--color-surface-${bed}`]!),
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("keeps link states on distinct steps", () => {
    for (const brand of ["purple", "lapis", "candlelight", "mars"]) {
      for (const mode of ["light", "dark"] as const) {
        const steps = ["default", "hover", "active"].map((s) => refStep(mode, brand, `--color-interactive-tertiary-${s}`));
        expect(new Set(steps).size, `${mode} ${brand} ${steps}`).toBe(3);
      }
    }
  });
});

describe("resolveSemanticRefs", () => {
  it("is byte-identical to resolveSemanticColors", () => {
    for (const mode of ["light", "dark"] as const) {
      for (const brand of ["mars", "candlelight", "lapis"]) {
        const flat = resolveSemanticColors(mode, opts(brand, "juniper"));
        const refs = resolveSemanticRefs(mode, opts(brand, "juniper"));
        for (const [k, r] of Object.entries(refs)) {
          expect(r.kind === "alias" ? r.hex : r.value, k).toBe(flat[k]);
        }
      }
    }
  });
});
