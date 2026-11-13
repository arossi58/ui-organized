import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import contract from "@ui-organized/core/token-contract.json" with { type: "json" };
import { themeJsonToCss, themeJsonToVars } from "./themeJson.js";

/**
 * A real Theme Builder export (custom brand, tinted stone neutral, Oswald
 * headings, radius base 6, default mode "system"), and the theme.css the
 * builder wrote for it in the same export. Regenerate both together from
 * `buildThemeJson` / `buildThemeCss` in apps/marketing if the export format
 * changes; the parity test in buildConfig.test.ts checks the live builder.
 */
const fixture = (name: string) =>
  readFileSync(new URL(`./__fixtures__/${name}`, import.meta.url), "utf-8");
const theme = () => JSON.parse(fixture("theme.json")) as Record<string, any>;
const builderCss = fixture("theme.css");

/** Everything after the header comment, which names its generator. */
const body = (css: string) => css.slice(css.indexOf("*/") + 2);

/** `--name: value` for every declaration, across all blocks. */
function declarations(css: string): Array<[string, string]> {
  return [...css.matchAll(/^\s*(--[\w-]+)\s*:\s*(.*);$/gm)].map((m) => [m[1]!, m[2]!]);
}

/** One selector's declarations (the first block that opens with it). */
function blockVars(css: string, selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  const end = css.indexOf("}", start);
  return Object.fromEntries(declarations(css.slice(start, end)));
}

describe("themeJsonToCss", () => {
  it("writes exactly the stylesheet the Theme Builder exports for the same theme", () => {
    expect(body(themeJsonToCss(theme()))).toBe(body(builderCss));
  });

  it("declares every token in the contract, in every default mode", () => {
    for (const mode of ["light", "dark", "system"] as const) {
      const declared = new Set(
        declarations(themeJsonToCss(theme(), { defaultMode: mode })).map(([k]) => k),
      );
      const missing = contract.tokens.filter((name) => !declared.has(name));
      expect(missing, mode).toEqual([]);
    }
    expect(contract.tokens.length).toBeGreaterThanOrEqual(135);
  });

  it("resolves every value: no aliases left, nothing collapsed to transparent", () => {
    // The 2.x pipeline resolved component aliases against a map that lacked
    // spacing, so all seven --Button-* tokens shipped as `transparent`.
    for (const [name, value] of declarations(themeJsonToCss(theme()))) {
      expect(value, name).not.toMatch(/[{}]/);
      expect(value, name).not.toBe("transparent");
      expect(value, name).not.toBe("");
    }
  });

  it("maps the export's names back onto the contract's", () => {
    const root = blockVars(themeJsonToCss(theme(), { defaultMode: "light" }), ":root");
    const t = theme();
    const prim = (ref: string) => {
      const [, , group, step] = /^\{primitive\.(color)\.([^.]+)\.([^.}]+)\}$/.exec(ref)!;
      return t.primitive.color[group!][step!].$value;
    };
    expect(root["--brand"]).toBe(prim(t.color.light.brand.$value));
    expect(root["--color-surface-primary"]).toBe(prim(t.color.light.surface.primary.$value));
    expect(root["--color-interactive-destructive-default-ghost"]).toBeTruthy();
    expect(root["--type-font-heading"]).toBe("'Oswald', sans-serif");
    expect(root["--type-weight-body-heavy"]).toBe("700");
    expect(root["--Button-Small-horizontal"]).toBe(t.component.button["small-horizontal"].$value);
    expect(root["--radius-interactive"]).toBe(t.component.radius.interactive.$value);
    expect(root["--control-height-md"]).toBe(t.component["control-height"].md.$value);
    expect(root["--z-index-popover"]).toBe("1200");
  });

  it("puts the default mode from $extensions on :root, and an option overrides it", () => {
    const system = themeJsonToCss(theme());
    expect(system).toContain("Default mode: system");
    expect(system).toContain("@media (prefers-color-scheme: dark) {\n  :root:not([data-theme]) {");
    expect(blockVars(system, ":root")["--color-surface-primary"]).toBe(
      blockVars(system, '[data-theme="light"]')["--color-surface-primary"],
    );

    const dark = themeJsonToCss(theme(), { defaultMode: "dark" });
    expect(dark).not.toContain("@media");
    expect(blockVars(dark, ":root")["--color-surface-primary"]).toBe(
      blockVars(dark, '[data-theme="dark"]')["--color-surface-primary"],
    );

    const t = theme();
    delete t.$extensions;
    expect(themeJsonToCss(t)).toContain("Default mode: light.");
  });

  it("keeps per-variable edits instead of re-deriving the theme from its inputs", () => {
    // What a designer's Figma re-export looks like: one semantic color pointed
    // at another step, one spacing step changed. Rebuilding from $extensions
    // (as the builder does on load) would silently undo both.
    const t = theme();
    t.color.dark.surface.primary.$value = "{primitive.color.brand.300}";
    t.spacing["space-04"].$value = "18px";
    const css = themeJsonToCss(t);
    expect(blockVars(css, '[data-theme="dark"]')["--color-surface-primary"]).toBe(
      t.primitive.color.brand["300"].$value,
    );
    expect(blockVars(css, ":root")["--spacing-space-04"]).toBe("18px");
  });

  it("fills the layout constants a Figma re-export doesn't carry", () => {
    // The Theme Import plugin's export has no `dimension` group and no z-index,
    // and neither is a theme decision. The tokens package supplies them.
    const t = theme();
    delete t.dimension;
    const root = blockVars(themeJsonToCss(t), ":root");
    expect(root["--dimension-06"]).toBe("240px");
    expect(root["--z-index-toast"]).toBe("1400");
  });

  it("restores numeric order for keys JSON.parse hoists", () => {
    const names = declarations(themeJsonToCss(theme()))
      .map(([k]) => k)
      .filter((k) => k.startsWith("--border-radius-") || k.startsWith("--dimension-"));
    expect(names.slice(0, 3)).toEqual([
      "--border-radius-01",
      "--border-radius-02",
      "--border-radius-03",
    ]);
    expect(names.indexOf("--border-radius-12")).toBeLessThan(names.indexOf("--border-radius-full"));
    expect(names.indexOf("--dimension-09")).toBeLessThan(names.indexOf("--dimension-10"));
  });

  it("accepts DTCG's other value shapes", () => {
    const t = theme();
    t.spacing["space-04"] = { $type: "dimension", $value: { value: 1, unit: "rem" } };
    t.spacing["space-05"] = { $type: "dimension", $value: 20 };
    t.type.font.body = { $type: "fontFamily", $value: ["Inter", "system-ui"] };
    const root = blockVars(themeJsonToCss(t), ":root");
    expect(root["--spacing-space-04"]).toBe("1rem");
    expect(root["--spacing-space-05"]).toBe("20px");
    expect(root["--type-font-body"]).toBe("'Inter', system-ui");
  });

  it("keeps a theme name from closing the header comment", () => {
    const t = theme();
    t.$extensions["com.ui-organized.theme-builder"].themeName = "Evil */ :root { color: red }";
    const css = themeJsonToCss(t);
    // The comment still closes after the header, not inside the name.
    expect(css.indexOf("*/")).toBeGreaterThan(css.indexOf("Default mode"));
  });
});

describe("themeJsonToCss errors", () => {
  it("points a legacy 2.x config at the Theme Builder", () => {
    const legacy = {
      metadata: { name: "Horizon", schemaVersion: "1.0.0" },
      color: { brandColor: { hex: "#008ffb" }, modes: { light: {}, dark: {} } },
    };
    expect(() => themeJsonToCss(legacy)).toThrow(/legacy theme config/);
    expect(() => themeJsonToCss(legacy)).toThrow("https://uiorganized.com/tools/theme-builder");
  });

  it("needs both color modes", () => {
    const t = theme();
    delete t.color.dark;
    expect(() => themeJsonToCss(t)).toThrow(/no color\.dark group/);
    expect(() => themeJsonToCss([])).toThrow(/must be a JSON object/);
  });

  it("names every token it can't write, in one error", () => {
    const t = theme();
    t.color.light.surface.primary.$value = "{primitive.color.brand.9999}";
    t.color.dark.surface.primary.$value = "{a} {b}";
    t.spacing["space-04"].$value = true;
    let message = "";
    try {
      themeJsonToVars(t);
    } catch (err) {
      message = (err as Error).message;
    }
    expect(message).toContain("3 tokens");
    expect(message).toContain(
      "color.light.surface.primary: {primitive.color.brand.9999} doesn't resolve",
    );
    expect(message).toContain('color.dark.surface.primary: unsupported reference in "{a} {b}"');
    expect(message).toContain("spacing.space-04: unsupported $value true");
  });

  it("catches a reference cycle", () => {
    const t = theme();
    t.color.light.brand.$value = "{color.dark.brand}";
    t.color.dark.brand.$value = "{color.light.brand}";
    expect(() => themeJsonToCss(t)).toThrow(/circular reference/);
  });
});
