import { describe, it, expect } from "vitest";
import { SCHEMA_VERSION, type ProjectDocument } from "@ui-organized/schema";
import { exportCss, exportResolvedTokens } from "./index.js";

const meta = {
  name: "x",
  createdAt: "2026-06-28T00:00:00.000Z",
  updatedAt: "2026-06-28T00:00:00.000Z",
  schemaVersion: SCHEMA_VERSION,
};

const doc: ProjectDocument = {
  version: SCHEMA_VERSION,
  meta,
  sets: [
    {
      name: "primitives",
      tokens: {
        color: { $type: "color", black: { $value: "#0a0a0a" }, white: { $value: "#ffffff" } },
        spacing: { $type: "dimension", "space-04": { $value: "4px" }, "space-08": { $value: "{spacing.space-04} * 2" } },
      },
    },
    {
      name: "semantic-light",
      $extensions: { mode: "light" },
      tokens: { color: { $type: "color", text: { $value: "{color.black}" } } },
    },
    {
      name: "semantic-dark",
      $extensions: { mode: "dark" },
      tokens: { color: { $type: "color", text: { $value: "{color.white}" } } },
    },
  ],
  themes: [
    {
      name: "Default",
      selectedTokenSets: { primitives: "source", "semantic-light": "enabled", "semantic-dark": "enabled" },
    },
  ],
  modes: { light: {}, dark: {} },
};

describe("exportCss", () => {
  const css = exportCss(doc);

  it("uses the --dot.path→dash naming contract", () => {
    expect(css).toContain("--spacing-space-04: 4px;");
    expect(css).toContain("--spacing-space-08: 8px;"); // math resolved
    expect(css).toMatch(/--color-black: #[0-9a-f]{6};/);
  });

  it("emits mode-constant tokens once on :root", () => {
    expect(css).toMatch(/:root \{[\s\S]*--spacing-space-04: 4px;[\s\S]*\}/);
    // a primitive color appears on :root, not under a theme block
    const root = css.slice(css.indexOf(":root"), css.indexOf("[data-theme"));
    expect(root).toContain("--color-black");
  });

  it("backfills the layout constants a document doesn't define", () => {
    // The failure this prevents is silent: without --dimension-06 the sidebar
    // shrinks to fit and every portalled overlay loses its z-index, with nothing
    // thrown and a clean console. See docs/theme-test.md.
    const root = css.slice(css.indexOf(":root"), css.indexOf("[data-theme"));
    expect(root).toContain("--dimension-06: 240px;");
    expect(root).toContain("--z-index-popover: 1200;");
    expect(root).toContain("--z-index-toast: 1400;");
  });

  it("lets a document's own layout constants win over the backfill", () => {
    const custom: ProjectDocument = {
      ...doc,
      sets: [
        ...doc.sets,
        {
          name: "layout",
          tokens: { dimension: { $type: "dimension", "06": { $value: "300px" } } },
        },
      ],
      themes: [
        {
          name: "Default",
          selectedTokenSets: { ...doc.themes[0]!.selectedTokenSets, layout: "enabled" },
        },
      ],
    };
    const out = exportCss(custom);
    expect(out).toContain("--dimension-06: 300px;");
    expect(out).not.toContain("--dimension-06: 240px;");
  });

  it("emits mode-varying tokens per mode under [data-theme]", () => {
    expect(css).toContain('[data-theme="light"]');
    expect(css).toContain('[data-theme="dark"]');
    // color.text differs by mode → it must be in the theme blocks, not :root
    const root = css.slice(css.indexOf(":root"), css.indexOf("[data-theme"));
    expect(root).not.toContain("--color-text");
    const light = css.slice(css.indexOf('[data-theme="light"]'), css.indexOf('[data-theme="dark"]'));
    const dark = css.slice(css.indexOf('[data-theme="dark"]'));
    const lightText = /--color-text: (#[0-9a-f]{6});/.exec(light)?.[1];
    const darkText = /--color-text: (#[0-9a-f]{6});/.exec(dark)?.[1];
    expect(lightText).toBeDefined();
    expect(darkText).toBeDefined();
    expect(lightText).not.toBe(darkText);
  });
});

describe("exportResolvedTokens", () => {
  it("returns a flat, sorted, resolved feed for Storybook", () => {
    const tokens = exportResolvedTokens(doc, { mode: "light" });
    const byPath = new Map(tokens.map((t) => [t.path, t]));
    expect(byPath.get("spacing.space-08")?.css).toBe("8px");
    expect(byPath.get("color.text")?.type).toBe("color");
    expect(byPath.get("color.text")?.references).toEqual(["color.black"]);
  });
});
