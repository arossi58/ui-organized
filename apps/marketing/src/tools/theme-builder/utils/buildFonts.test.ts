import { describe, it, expect } from "vitest";
import { useBuilderStore } from "../state/themeState";
import { buildFontsModule, fontLinkTags, resolveThemeFonts } from "./buildFonts";
import { buildReadme, buildThemeTokens } from "./buildConfig";
import {
  FALLBACK_FONTS,
  getAvailableWeights,
  googleFontsHref,
  unservableWeights,
  weightCoverageWarning,
} from "../hooks/useGoogleFonts";

const state = () => useBuilderStore.getState();

/** Put the store in a known font configuration. */
function setFonts(
  heading: { family: string; weights: Record<string, number>; available: number[] },
  body: { family: string; weights: Record<string, number>; available: number[] },
) {
  state().setHeadingFont(heading.family, heading.weights, heading.available);
  state().setBodyFont(body.family, body.weights, body.available);
}

const FOUR = { default: 400, emphasis: 500, strong: 600, heavy: 700 };
const NINE = [100, 200, 300, 400, 500, 600, 700, 800, 900];
const OSWALD = [200, 300, 400, 500, 600, 700];

describe("googleFontsHref", () => {
  it("sorts and deduplicates the weight list", () => {
    // css2 rejects an unsorted `wght@` list outright — 400, not a silent omission.
    expect(googleFontsHref("Inter", [700, 400, 400, 500])).toContain("wght@400;500;700");
  });

  it("percent-encodes a family name with a space", () => {
    expect(googleFontsHref("Playfair Display", [400])).toContain("family=Playfair%20Display:");
  });

  it("asks for display=swap", () => {
    expect(googleFontsHref("Inter", [400])).toContain("&display=swap");
  });
});

describe("resolveThemeFonts", () => {
  it("emits one entry per family with the theme's weights (criterion 1)", () => {
    setFonts(
      { family: "Oswald", weights: FOUR, available: OSWALD },
      { family: "Inter", weights: FOUR, available: NINE },
    );
    const fonts = resolveThemeFonts(state());
    expect(fonts.map((f) => f.family)).toEqual(["Oswald", "Inter"]);
    for (const font of fonts) {
      expect(font.weights).toEqual([400, 500, 600, 700]);
      expect(font.href).toContain("wght@400;500;600;700");
    }
  });

  it("merges into ONE entry when heading and body share a family (criterion 2)", () => {
    // Also the design system's own default — Inter for both roles.
    setFonts(
      { family: "Inter", weights: { default: 400, emphasis: 500 }, available: NINE },
      { family: "Inter", weights: { default: 600, emphasis: 700 }, available: NINE },
    );
    const fonts = resolveThemeFonts(state());
    expect(fonts).toHaveLength(1);
    expect(fonts[0]!.family).toBe("Inter");
    expect(fonts[0]!.weights).toEqual([400, 500, 600, 700]);
  });

  it("never builds a combined multi-family URL", () => {
    // A multi-family request drops an unknown family silently and still answers
    // 200, so one typo would take that font down with no signal at all.
    setFonts(
      { family: "Oswald", weights: FOUR, available: OSWALD },
      { family: "Inter", weights: FOUR, available: NINE },
    );
    for (const font of resolveThemeFonts(state())) {
      expect(font.href.match(/family=/g)).toHaveLength(1);
    }
  });
});

describe("buildFontsModule", () => {
  it("compiles under noUnusedLocals — no imports at all (criterion 8)", () => {
    expect(buildFontsModule(state())).not.toMatch(/^import /m);
  });

  it("emits the resolved families as data", () => {
    setFonts(
      { family: "Playfair Display", weights: FOUR, available: [400, 500, 600, 700, 800, 900] },
      { family: "Inter", weights: FOUR, available: NINE },
    );
    const src = buildFontsModule(state());
    expect(src).toContain('family: "Playfair Display"');
    expect(src).toContain("weights: [400, 500, 600, 700]");
    expect(src).toContain("Playfair%20Display");
    expect(src).toContain("export const themeFonts");
  });
});

describe("fontLinkTags", () => {
  it("preconnects to both hosts and links each family separately", () => {
    setFonts(
      { family: "Oswald", weights: FOUR, available: OSWALD },
      { family: "Inter", weights: FOUR, available: NINE },
    );
    const tags = fontLinkTags(resolveThemeFonts(state()));
    expect(tags).toContain('<link rel="preconnect" href="https://fonts.googleapis.com">');
    expect(tags).toContain('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');
    expect(tags.match(/rel="stylesheet"/g)).toHaveLength(2);
    // Never an @import: it sits behind a second round trip and bakes a CDN into
    // the tokens. See the header of buildFonts.ts.
    expect(tags).not.toContain("@import");
  });
});

describe("theme.json font metadata", () => {
  it("records provider, declared weights and the family's real list", () => {
    setFonts(
      { family: "Oswald", weights: FOUR, available: OSWALD },
      { family: "Inter", weights: FOUR, available: NINE },
    );
    const ext = (buildThemeTokens(state()) as any).$extensions["com.ui-organized.theme-builder"];
    expect(ext.fonts.provider).toBe("google");
    expect(ext.fonts.heading).toEqual({
      family: "Oswald",
      weights: [400, 500, 600, 700],
      available: OSWALD,
    });
    expect(ext.fonts.body.available).toEqual(NINE);
  });

  it("round-trips through export → import (criterion 5)", () => {
    setFonts(
      { family: "Oswald", weights: FOUR, available: OSWALD },
      { family: "Lora", weights: { default: 400, emphasis: 500, strong: 600, heavy: 700 }, available: [400, 500, 600, 700] },
    );
    const exported = buildThemeTokens(state());

    setFonts(
      { family: "Inter", weights: FOUR, available: NINE },
      { family: "Inter", weights: FOUR, available: NINE },
    );
    state().loadFromThemeJson(exported);

    const back = state();
    expect(back.headingFamily).toBe("Oswald");
    expect(back.bodyFamily).toBe("Lora");
    expect(back.headingFontAvailable).toEqual(OSWALD);
    expect(back.bodyFontAvailable).toEqual([400, 500, 600, 700]);
  });

  it("imports an older theme.json with no `fonts` key without throwing (criterion 5)", () => {
    setFonts(
      { family: "Oswald", weights: FOUR, available: OSWALD },
      { family: "Inter", weights: FOUR, available: NINE },
    );
    const legacy = buildThemeTokens(state()) as any;
    delete legacy.$extensions["com.ui-organized.theme-builder"].fonts;

    expect(() => state().loadFromThemeJson(legacy)).not.toThrow();
    // Falls back to the declared weights, so the export asks for exactly what the
    // theme uses rather than inventing a variant list it can't know.
    expect(state().headingFontAvailable).toEqual([400, 500, 600, 700]);
  });

  it("survives a theme.json with no $extensions at all", () => {
    expect(() => state().loadFromThemeJson({ type: {}, spacing: {} })).not.toThrow();
  });
});

describe("weight coverage warnings", () => {
  it("flags roles that collapse onto one weight — the Anton case (criterion 7)", () => {
    // What the picker actually produces: it snaps every role to the nearest
    // available weight, so Anton (400 only) silently flattens the hierarchy
    // rather than asking for weights it can't serve.
    const warning = weightCoverageWarning(
      "Anton",
      { default: 400, emphasis: 400, strong: 400, heavy: 400 },
      [400],
    );
    expect(warning).toContain("Anton");
    expect(warning).toContain("400");
    expect(warning).toContain("Emphasis, Strong and Heavy");
  });

  it("flags weights the family cannot serve — the import case", () => {
    const warning = weightCoverageWarning("Anton", FOUR, [400]);
    expect(warning).toContain("does not ship weights 500, 600 and 700");
    expect(warning).toContain("synthesise");
  });

  it("warns for Anton through the picker's own code path (criterion 7)", () => {
    // End-to-end against the shipped variant list and the snapping the picker
    // applies, rather than hand-written inputs — so this can't pass on a fixture
    // that no longer matches what selecting Anton actually does.
    const anton = FALLBACK_FONTS.find((f) => f.family === "Anton")!;
    const ws = getAvailableWeights(anton);
    const nearest = (t: number) =>
      ws.reduce((p, c) => (Math.abs(c - t) < Math.abs(p - t) ? c : p));
    const snapped = {
      default: nearest(400),
      emphasis: nearest(500),
      strong: nearest(600),
      heavy: nearest(700),
    };
    expect(ws).toEqual([400]);
    expect(snapped).toEqual({ default: 400, emphasis: 400, strong: 400, heavy: 400 });

    const warning = weightCoverageWarning("Anton", snapped, ws);
    expect(warning).toBe(
      "Anton ships only weight 400, so Emphasis, Strong and Heavy render the same as Default.",
    );
  });

  it("warns for Bebas Neue too — the other single-weight display face", () => {
    const bebas = FALLBACK_FONTS.find((f) => f.family === "Bebas Neue")!;
    expect(getAvailableWeights(bebas)).toEqual([400]);
    expect(
      weightCoverageWarning("Bebas Neue", { default: 400, emphasis: 400, strong: 400, heavy: 400 }, [400]),
    ).toContain("Bebas Neue ships only weight 400");
  });

  it("says nothing when the family covers every role", () => {
    expect(weightCoverageWarning("Inter", FOUR, NINE)).toBeNull();
  });

  it("says nothing before the variant list has loaded", () => {
    expect(weightCoverageWarning("Inter", FOUR, [])).toBeNull();
  });

  it("unservableWeights ignores extra weights the family happens to have", () => {
    expect(unservableWeights([400, 700], NINE)).toEqual([]);
    expect(unservableWeights([400, 950], NINE)).toEqual([950]);
  });
});

describe("README fonts section", () => {
  it("gives link tags rather than an @import, and names the families", () => {
    setFonts(
      { family: "Oswald", weights: FOUR, available: OSWALD },
      { family: "Inter", weights: FOUR, available: NINE },
    );
    const readme = buildReadme(state());
    expect(readme).toContain("Use the fonts (web)");
    expect(readme).toContain("**Oswald**");
    expect(readme).toContain('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');
    expect(readme).not.toContain("@import url");
    // The trap that survives loading the font: a later stylesheet overriding it.
    expect(readme).toContain("--type-font-*");
  });

  it("warns in the README when a weight will be synthesised", () => {
    setFonts(
      { family: "Anton", weights: FOUR, available: [400] },
      { family: "Inter", weights: FOUR, available: NINE },
    );
    const readme = buildReadme(state());
    expect(readme).toContain("Anton does not ship weights 500, 600 and 700");
  });

  it("leads with the CLI, and names this bundle's own zip", () => {
    state().setThemeName("Kitchen Sink Teal");
    const readme = buildReadme(state());
    expect(readme).toContain("npx @ui-organized/cli theme kitchen-sink-teal-theme.zip");
    // The manual route stays — the CLI is a convenience, not a requirement.
    expect(readme).toContain("@ui-organized/react/styles");
    expect(readme).toMatch(/by hand/i);
  });

  it("omits that note when every weight is real", () => {
    setFonts(
      { family: "Inter", weights: FOUR, available: NINE },
      { family: "Inter", weights: FOUR, available: NINE },
    );
    expect(buildReadme(state())).not.toContain("does not ship weight");
  });
});
