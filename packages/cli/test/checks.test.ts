import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { declaredTokens, namedFontFamilies, parseFonts, parseIconLibrary, loadBundle } from "../src/bundle.js";
import { checkCascade, checkFontsPresent, checkTokenCoverage } from "../src/checks.js";
import { normaliseIcons, planApply } from "../src/apply.js";
import { inspectProject } from "../src/project.js";

/**
 * The checks are the reason the command exists, so they are tested against the
 * exact failures that motivated them — a theme missing the layout constants, a
 * bundle whose fonts.ts was left behind, and a stylesheet that overrides the
 * theme's typeface later in the cascade.
 */

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "uiorg-cli-"));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

/** A project with @ui-organized/react installed and a given token contract. */
function withContract(tokens: string[]): void {
  const pkg = join(dir, "node_modules", "@ui-organized", "react");
  mkdirSync(pkg, { recursive: true });
  writeFileSync(join(pkg, "package.json"), JSON.stringify({ name: "@ui-organized/react", version: "4.2.0" }));
  writeFileSync(join(pkg, "token-contract.json"), JSON.stringify({ tokens }));
}

function bundleDir(files: Record<string, string>): string {
  const src = join(dir, "bundle");
  mkdirSync(src, { recursive: true });
  for (const [name, content] of Object.entries(files)) writeFileSync(join(src, name), content);
  return src;
}

const THEME = `:root {
  --color-surface-primary: #fff;
  --type-font-heading: 'Oswald', sans-serif;
  --type-font-body: 'Inter', sans-serif;
}`;

const FONTS = `export const themeFonts = [
  {
    family: "Oswald",
    weights: [400, 700],
    href: "https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap",
  },
];`;

describe("parsing a bundle", () => {
  it("reads the tokens a theme declares across every block", () => {
    const tokens = declaredTokens(`:root { --a: 1; }\n[data-theme="dark"] {\n  --b: 2;\n}`);
    expect([...tokens].sort()).toEqual(["--a", "--b"]);
  });

  it("takes only the first family of each font stack", () => {
    // `sans-serif` is a fallback, not something anyone loads.
    expect(namedFontFamilies(THEME).sort()).toEqual(["Inter", "Oswald"]);
  });

  it("reads fonts.ts without executing it", () => {
    // Running code out of a downloaded archive to read three fields would be a
    // poor trade for a generated file with a fixed shape.
    const [font] = parseFonts(FONTS);
    expect(font).toMatchObject({ family: "Oswald", weights: [400, 700] });
    expect(font!.href).toContain("wght@400;700");
  });

  it("reads the selected icon library", () => {
    expect(parseIconLibrary(`export const iconConfig = { library: "tabler" };`)).toBe("tabler");
  });

  it("refuses a folder that isn't a theme bundle, and says what it found", () => {
    const src = bundleDir({ "notes.txt": "hello" });
    expect(() => loadBundle(src)).toThrow(/no theme\.css.*notes\.txt/s);
  });
});

describe("token coverage", () => {
  it("names every property the theme is missing, and blocks", () => {
    withContract(["--color-surface-primary", "--dimension-06", "--z-index-popover"]);
    const bundle = loadBundle(bundleDir({ "theme.css": THEME }));
    const [finding] = checkTokenCoverage(bundle, inspectProject(dir));
    expect(finding!.severity).toBe("error");
    expect(finding!.detail).toContain("--dimension-06");
    expect(finding!.detail).toContain("--z-index-popover");
    expect(finding!.detail).not.toContain("--color-surface-primary");
  });

  it("passes a complete theme", () => {
    withContract(["--color-surface-primary"]);
    const bundle = loadBundle(bundleDir({ "theme.css": THEME }));
    expect(checkTokenCoverage(bundle, inspectProject(dir))[0]!.severity).toBe("info");
  });

  it("says so rather than passing when the library isn't installed", () => {
    // A silent pass would be indistinguishable from a real one.
    const bundle = loadBundle(bundleDir({ "theme.css": THEME }));
    const [finding] = checkTokenCoverage(bundle, inspectProject(dir));
    expect(finding!.severity).toBe("info");
    expect(finding!.title).toMatch(/not checked/i);
  });
});

describe("fonts named but not loadable", () => {
  it("warns for a family the bundle can't load", () => {
    const bundle = loadBundle(bundleDir({ "theme.css": THEME, "fonts.ts": FONTS }));
    const [finding] = checkFontsPresent(bundle, parseFonts(FONTS));
    expect(finding!.severity).toBe("warning");
    expect(finding!.title).toContain("Inter");
    expect(finding!.title).not.toContain("Oswald");
  });

  it("is quiet when every family is covered", () => {
    const css = `:root { --type-font-body: 'Oswald', sans-serif; }`;
    const bundle = loadBundle(bundleDir({ "theme.css": css, "fonts.ts": FONTS }));
    expect(checkFontsPresent(bundle, parseFonts(FONTS))[0]!.severity).toBe("info");
  });
});

describe("cascade conflicts", () => {
  it("names a stylesheet that overrides the theme's typeface", () => {
    mkdirSync(join(dir, "src"), { recursive: true });
    writeFileSync(join(dir, "src", "brand.css"), `:root { --type-font-body: "Comic Sans MS"; }`);
    const [finding] = checkCascade(inspectProject(dir), join(dir, "src", "theme.css"));
    expect(finding!.severity).toBe("warning");
    expect(finding!.detail).toContain("src/brand.css");
  });

  it("doesn't flag the theme file itself", () => {
    mkdirSync(join(dir, "src"), { recursive: true });
    const themePath = join(dir, "src", "theme.css");
    writeFileSync(themePath, THEME);
    expect(checkCascade(inspectProject(dir), themePath)).toEqual([]);
  });

  it("ignores the bundle's own copy when it's unzipped inside the project", () => {
    const src = bundleDir({ "theme.css": THEME });
    mkdirSync(join(dir, "src"), { recursive: true });
    const themePath = join(dir, "src", "theme.css");
    writeFileSync(themePath, THEME);
    expect(checkCascade(inspectProject(dir), themePath, src)).toEqual([]);
  });
});

describe("applying", () => {
  it("writes beside an existing theme.css rather than assuming a layout", () => {
    // src/styles/ is one project's convention, not a standard.
    mkdirSync(join(dir, "app", "css"), { recursive: true });
    writeFileSync(join(dir, "app", "css", "theme.css"), "/* old */");
    const src = bundleDir({ "theme.css": THEME });
    const bundle = loadBundle(src);
    const plan = planApply(bundle, inspectProject(dir, { ignore: src }));
    expect(plan.themeCssPath).toBe(join(dir, "app", "css", "theme.css"));
    expect(plan.writes[0]!.status).toBe("updated");
  });

  it("never mistakes the bundle's own theme.css for the destination", () => {
    // Unzipping into the project is a normal thing to do, and the bundle's copy
    // is usually *shallower* than the app's — so detection reaches it first.
    // Targeting it would copy the file onto itself and report success while the
    // real stylesheet went untouched. Guarded twice: detection skips the bundle,
    // and planApply refuses a destination inside it even if a caller forgets.
    const src = bundleDir({ "theme.css": THEME });
    const bundle = loadBundle(src);

    const guarded = planApply(bundle, inspectProject(dir, { ignore: src }));
    expect(guarded.themeCssPath).toBe(join(dir, "src", "styles", "theme.css"));

    const unguarded = planApply(bundle, inspectProject(dir));
    expect(unguarded.themeCssPath.startsWith(src)).toBe(false);
  });

  it("reports identical content as unchanged, so a second run is a no-op", () => {
    mkdirSync(join(dir, "src", "styles"), { recursive: true });
    writeFileSync(join(dir, "src", "styles", "theme.css"), THEME);
    const bundle = loadBundle(bundleDir({ "theme.css": THEME }));
    expect(planApply(bundle, inspectProject(dir)).writes[0]!.status).toBe("unchanged");
  });

  it("strips the uncompilable import from an older icons.ts", () => {
    // Bundles exported before the generator was fixed are still in Downloads
    // folders, and the import is a hard error under noUnusedLocals.
    const old = `import { IconProvider } from "@ui-organized/react";\n\nexport const iconConfig = { library: "lucide" } as const;\n`;
    const fixed = normaliseIcons(old);
    expect(fixed).not.toContain("import {");
    expect(fixed).toContain("iconConfig");
  });

  it("leaves an icons.ts that genuinely uses the import alone", () => {
    const real = `import { IconProvider } from "@ui-organized/react";\nexport const Wrapped = () => <IconProvider library="lucide" />;\n`;
    expect(normaliseIcons(real)).toBe(real);
  });
});
