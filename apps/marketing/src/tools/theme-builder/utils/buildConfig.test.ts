import { describe, it, expect } from "vitest";
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
    // Semantic surface token nested by category, resolved to a concrete value.
    expect(t.color.dark.surface.base.$type).toBe("color");
    expect(typeof t.color.dark.surface.base.$value).toBe("string");
    // Light and dark resolve to different values for the base surface.
    expect(t.color.light.surface.base.$value).not.toBe(t.color.dark.surface.base.$value);
  });

  it("captures typography, spacing and radius with correct $types", () => {
    const t = buildThemeTokens(state()) as any;
    expect(t.type.font.heading.$type).toBe("fontFamily");
    expect(t.type.weight["body-bold"].$type).toBe("fontWeight");
    expect(t.type.size["body-large"]).toMatchObject({ $type: "dimension", $value: "16px" });
    expect(t.spacing["space-01"].$type).toBe("dimension");
    expect(t["border-radius"]["radius-04"].$type).toBe("dimension");
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
