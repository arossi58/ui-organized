import { describe, it, expect } from "vitest";
import { typeSizeTokens, typeLeadingTokens } from "@ui-organized/tokens";
import { useBuilderStore } from "../state/themeState";
import { buildThemeTokens, buildThemeJson, buildIconsModule, buildReadme } from "./buildConfig";
import { buildThemeCss } from "./buildCss";
import tokenContract from "../../../../../../packages/react/token-contract.json";

const state = () => useBuilderStore.getState();

/** Every `--name` the generated stylesheet declares, across all its blocks. */
function declaredVars(css: string): Set<string> {
  return new Set([...css.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]!));
}

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
    // the tokens change). Guards that the default export tracks the canonical
    // scale (body-medium 21px leading = 1.5× body, display-xlarge 64px size).
    for (const [step, px] of Object.entries(typeSizeTokens)) {
      expect(t.type.size[step].$value, `size ${step}`).toBe(`${px}px`);
    }
    for (const [step, px] of Object.entries(typeLeadingTokens)) {
      expect(t.type.leading[step].$value, `leading ${step}`).toBe(`${px}px`);
    }
    // Spelled out explicitly as an anchor against silent drift.
    expect(t.type.leading["body-medium"].$value).toBe("21px");
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

  it("compiles under noUnusedLocals — no unused value imports", () => {
    // The generated file used to open with `import { IconProvider }` and never
    // use it, which is a hard error under the Vite React template's default
    // `noUnusedLocals`. The usage example belongs in the doc comment.
    const src = buildIconsModule(state());
    const valueImports = src.match(/^import (?!type )/gm) ?? [];
    expect(valueImports).toEqual([]);
  });

  it("types the config instead of freezing it", () => {
    // `as const` gives literal types, so `useState(iconConfig.strokeAdjustment)`
    // infers useState<true> and rejects a (checked: boolean) => void handler.
    // Annotating also validates the generated object against the real interface.
    const src = buildIconsModule(state());
    expect(src).toContain('import type { IconConfig } from "@ui-organized/react"');
    expect(src).toContain("export const iconConfig: IconConfig = {");
    expect(src).not.toContain("as const");
  });

  it("tells you to register the icon set for the chosen library", () => {
    // The library imports no icon package itself, so the subpath import is not
    // optional advice — without it <Icon> renders nothing.
    state().setIcons({ library: "tabler" });
    expect(buildIconsModule(state())).toContain('import "@ui-organized/react/icons/tabler"');
  });
});

describe("buildThemeCss", () => {
  it("declares every token @ui-organized/react consumes", () => {
    // THE regression test. The export previously re-skinned the whole semantic
    // layer but omitted --dimension-* and --z-index-*, which broke the sidebar
    // and every portalled overlay with a green build and a clean console. The
    // contract is derived from the library's own CSS, so this fails the moment a
    // component starts reading a token the export doesn't emit.
    // See docs/theme-test.md and packages/react/scripts/token-contract.ts.
    const declared = declaredVars(buildThemeCss(state()));
    const missing = tokenContract.tokens.filter((name) => !declared.has(name));
    expect(missing, "tokens the theme export fails to declare").toEqual([]);
  });

  it("puts the mode-independent layout constants on :root, not in a mode block", () => {
    const css = buildThemeCss(state());
    const root = css.slice(css.indexOf(":root"), css.indexOf('[data-theme="light"]'));
    expect(root).toContain("--dimension-06: 240px;");
    expect(root).toContain("--z-index-popover: 1000;");
    expect(root).toContain("--z-index-toast: 1300;");
  });

  it("ships both modes regardless of which one :root defaults to", () => {
    for (const mode of ["light", "dark", "system"] as const) {
      state().setExportDefaultMode(mode);
      const css = buildThemeCss(state());
      expect(css, mode).toContain('[data-theme="light"] {');
      expect(css, mode).toContain('[data-theme="dark"] {');
    }
  });

  it("puts the chosen default mode on bare :root", () => {
    const surfaceIn = (css: string, block: string) => {
      const start = css.indexOf(block);
      return /--color-surface-primary: (#[0-9a-fA-F]+)/.exec(css.slice(start))?.[1];
    };

    state().setExportDefaultMode("light");
    const lightDefault = buildThemeCss(state());
    expect(surfaceIn(lightDefault, ":root")).toBe(surfaceIn(lightDefault, '[data-theme="light"]'));

    state().setExportDefaultMode("dark");
    const darkDefault = buildThemeCss(state());
    expect(surfaceIn(darkDefault, ":root")).toBe(surfaceIn(darkDefault, '[data-theme="dark"]'));
  });

  it("lets an explicit data-theme beat the system preference", () => {
    state().setExportDefaultMode("system");
    const css = buildThemeCss(state());
    // Without `:not([data-theme])` this media query ties with [data-theme="light"]
    // on specificity and wins on source order, forcing a light island dark.
    expect(css).toContain("@media (prefers-color-scheme: dark)");
    expect(css).toContain(":root:not([data-theme])");
    expect(css.indexOf("@media")).toBeLessThan(css.indexOf('[data-theme="light"] {'));
  });
});

describe("buildReadme", () => {
  it("documents the import path that actually resolves", () => {
    // `@ui-organized/react/styles.css` shipped in this README for months and
    // fails the build on the first line — it wasn't an exports subpath.
    const readme = buildReadme(state());
    expect(readme).toContain("@ui-organized/react/styles");
    expect(readme).toContain("theme.css");
    // Order is the other half of the instruction, and was missing entirely.
    expect(readme).toMatch(/order/i);
  });

  it("describes the default mode the CSS actually emits", () => {
    state().setExportDefaultMode("dark");
    expect(buildReadme(state())).toContain('data-theme="dark"');
    state().setExportDefaultMode("light");
    expect(buildReadme(state())).toContain('data-theme="light"');
  });
});
