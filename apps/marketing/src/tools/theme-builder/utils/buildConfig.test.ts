import { describe, it, expect } from "vitest";
import { typeSizeTokens, typeLeadingTokens } from "@ui-organized/tokens";
import { useBuilderStore } from "../state/themeState";
import { buildThemeTokens, buildThemeJson, buildIconsModule } from "./buildConfig";

const state = () => useBuilderStore.getState();

describe("buildThemeTokens (DTCG)", () => {
  it("emits valid JSON", () => {
    expect(() => JSON.parse(buildThemeJson(state()))).not.toThrow();
  });

  it("captures both color modes as DTCG color tokens", () => {
    const t = buildThemeTokens(state()) as any;
    expect(t.color.light).toBeTruthy();
    expect(t.color.dark).toBeTruthy();
    // Semantic surface token nested by category.
    expect(t.color.dark.surface.base.$type).toBe("color");
    expect(typeof t.color.dark.surface.base.$value).toBe("string");
    // Light and dark reference different primitives for the base surface.
    expect(t.color.light.surface.base.$value).not.toBe(t.color.dark.surface.base.$value);
  });

  it("emits the full 24-step ramp for every used primitive family", () => {
    const t = buildThemeTokens(state()) as any;
    expect(t.primitive.color).toBeTruthy();
    // A used family ships all 24 shades, not just the referenced steps…
    expect(Object.keys(t.primitive.color.neutral)).toHaveLength(24);
    expect(Object.keys(t.primitive.color.brand)).toHaveLength(24);
    // …including steps the semantic map never references (e.g. neutral 700).
    expect(t.primitive.color.neutral["700"]).toBeTruthy();
    // Primitives carry resolved hex values.
    const swatch = Object.values(t.primitive.color.neutral)[0] as any;
    expect(swatch.$type).toBe("color");
    expect(swatch.$value).toMatch(/^#[0-9a-fA-F]{3,8}$/);
    // A functional family in use (status colors → crimson) ships its full ramp too.
    expect(Object.keys(t.primitive.color.crimson)).toHaveLength(24);
  });

  it("makes semantic colors reference primitives, with every alias resolvable", () => {
    const t = buildThemeTokens(state()) as any;
    // surface.base is a reference, not a baked hex.
    expect(t.color.dark.surface.base.$value).toMatch(/^\{primitive\.color\..+\}$/);

    // Walk every semantic leaf; each `{primitive.color.g.s}` alias must resolve.
    const aliasRe = /^\{primitive\.color\.([^.]+)\.([^.}]+)\}$/;
    const checkGroup = (group: any) => {
      for (const v of Object.values(group) as any[]) {
        if (v && typeof v.$value === "string") {
          const m = aliasRe.exec(v.$value);
          if (m) {
            const [, g, s] = m;
            expect(t.primitive.color[g], `missing primitive ${g}.${s}`).toBeTruthy();
            expect(t.primitive.color[g][s], `missing primitive ${g}.${s}`).toBeTruthy();
          }
        } else if (v && typeof v === "object") {
          checkGroup(v);
        }
      }
    };
    checkGroup(t.color.light);
    checkGroup(t.color.dark);
  });

  it("captures typography, spacing and radius with correct $types", () => {
    const t = buildThemeTokens(state()) as any;
    expect(t.type.font.heading.$type).toBe("fontFamily");
    expect(t.type.weight["body-heavy"].$type).toBe("fontWeight");
    expect(t.type.size["body-large"]).toMatchObject({ $type: "dimension", $value: "16px" });
    expect(t.spacing["space-01"].$type).toBe("dimension");
    expect(t["border-radius"]["04"].$type).toBe("dimension");
    // Derived control height: body-large leading (24px) + 2×space-01 (4).
    // The 1px border is excluded (drawn inside), matching a Figma frame.
    expect(t.component["control-height"].md).toMatchObject({ $type: "dimension", $value: "32px" });
  });

  it("emits the canonical design-system type scale by default (1:1 with @ui-organized/tokens)", () => {
    const t = buildThemeTokens(state()) as any;
    // Every size + leading in the default export equals the shipped token JSON,
    // so the builder opens identical to the design system (and auto-syncs when
    // the tokens change). This is the regression guard for the body-medium
    // 21px→20px fix and the display-xlarge 48px→64px size fix.
    for (const [step, px] of Object.entries(typeSizeTokens)) {
      expect(t.type.size[step].$value, `size ${step}`).toBe(`${px}px`);
    }
    for (const [step, px] of Object.entries(typeLeadingTokens)) {
      expect(t.type.leading[step].$value, `leading ${step}`).toBe(`${px}px`);
    }
    // The two values the user reported / we discovered, spelled out explicitly.
    expect(t.type.leading["body-medium"].$value).toBe("20px");
    expect(t.type.size["display-xlarge"].$value).toBe("64px");
  });

  it("captures icon settings under $extensions (not the token tree)", () => {
    // Set non-default icon params, like a user customizing the Icons tab.
    state().setIcons({ library: "tabler", baseSize: 32, baseStroke: 1.5, strokeAdjustment: true });
    const t = buildThemeTokens(state()) as any;
    const icons = t.$extensions["com.ui-organized.theme-builder"].icons;
    expect(icons).toMatchObject({
      library: "tabler",
      baseSize: 32,
      baseStroke: 1.5,
      strokeAdjustment: true,
      package: "@tabler/icons-react",
    });
    // Icons must NOT pollute the standard token groups.
    expect(t.icons).toBeUndefined();
  });
});

describe("buildIconsModule", () => {
  it("emits an IconProvider snippet reflecting the current config", () => {
    state().setIcons({ library: "heroicons", baseSize: 20, baseStroke: 2, style: "solid" });
    const src = buildIconsModule(state());
    expect(src).toContain("IconProvider");
    expect(src).toContain('library: "heroicons"');
    expect(src).toContain("baseSize: 20");
    expect(src).toContain("@heroicons/react");
  });
});
