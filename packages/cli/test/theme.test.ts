import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { declaredTokens, loadBundle } from "../src/bundle.js";
import { run } from "../src/index.js";
import { LIBRARIES, type Framework } from "../src/project.js";
import { readZip } from "../src/zip.js";

/**
 * `uiorg theme` end to end, once per library, against the real Theme Builder
 * fixture. The steps it prints were React's whatever the project was, and its
 * icons.ts failed to compile anywhere else, so each library is run for real
 * and its output read back.
 */

const FIXTURE = join(import.meta.dirname, "fixtures", "kitchen-sink-teal-theme.zip");
const THEME_TOKENS = [...declaredTokens(loadBundle(FIXTURE).files.get("theme.css")!)];

let root: string;
let out: string[];
let err: string[];

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "uiorg-theme-"));
  out = [];
  err = [];
  vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
    out.push(String(chunk));
    return true;
  });
  vi.spyOn(process.stderr, "write").mockImplementation((chunk) => {
    err.push(String(chunk));
    return true;
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  rmSync(root, { recursive: true, force: true });
});

const stdout = (): string => out.join("").replace(/\u001b\[\d+m/g, "");

function writePackage(
  dir: string,
  pkg: Record<string, unknown>,
  files: Record<string, string> = {},
): void {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "package.json"), JSON.stringify(pkg));
  for (const [name, content] of Object.entries(files)) writeFileSync(join(dir, name), content);
}

/** An app on `framework`, installed, with core's contract beside it. */
function app(
  framework: Framework,
  {
    deps = {},
    contract = THEME_TOKENS,
  }: { deps?: Record<string, string>; contract?: string[] } = {},
): void {
  writePackage(root, { dependencies: { [LIBRARIES[framework]]: "^6.1.0", ...deps } });
  writePackage(join(root, "node_modules", LIBRARIES[framework]), {
    name: LIBRARIES[framework],
    version: "6.1.0",
  });
  writePackage(
    join(root, "node_modules", "@ui-organized", "core"),
    { name: "@ui-organized/core", version: "6.1.0" },
    { "token-contract.json": JSON.stringify({ tokens: contract }) },
  );
  mkdirSync(join(root, "src"), { recursive: true });
  writeFileSync(join(root, "src", framework === "react" ? "main.tsx" : "main.ts"), "");
}

const theme = (...args: string[]) => run(["theme", FIXTURE, "--cwd", root, "--offline", ...args]);

describe("uiorg theme, per library", () => {
  it("React: its stylesheets, icons.ts and the IconProvider that uses it", async () => {
    app("react");
    expect(await theme()).toBe(0);
    const text = stdout();
    expect(text).toMatch(/✓ Theme covers all \d+ required tokens/);
    expect(text).toMatch(/import '@ui-organized\/tokens\/variables\.css' +\/\/ 1\. token baseline/);
    expect(text).toMatch(/import '@ui-organized\/react\/styles' +\/\/ 2\. component styles/);
    expect(text).toMatch(/import '\.\/styles\/theme\.css' +\/\/ 3\. your theme, last so it wins/);
    expect(text).toContain("both declare on :root");
    expect(text).toContain("npm install lucide-react");
    expect(text).toContain("import '@ui-organized/react/icons/lucide'");
    // The step that was missing: without it, the icons.ts just written is unused.
    expect(text).toContain("import { iconConfig } from './icons'");
    expect(text).toContain("<IconProvider {...iconConfig}>");
    expect(existsSync(join(root, "src", "icons.ts"))).toBe(true);
  });

  it("Svelte: styles.css, its own icon package, and IconProvider with the theme's values", async () => {
    app("svelte");
    expect(await theme()).toBe(0);
    const text = stdout();
    expect(text).toMatch(/import '@ui-organized\/svelte\/styles\.css' +\/\/ 2\. component styles/);
    expect(text).toContain("npm install @lucide/svelte");
    expect(text).toContain("import '@ui-organized/svelte/icons/lucide'");
    expect(text).toContain("import { IconProvider } from '@ui-organized/svelte'");
    expect(text).toContain('library="lucide"');
    expect(text).toContain('style="outline"');
    expect(text).toContain("baseSize={24}");
    // Off in this theme, and off is the default: a bare attribute would turn it on.
    expect(text).not.toContain("strokeAdjustment");
    expect(existsSync(join(root, "src", "icons.ts"))).toBe(false);
  });

  it("Svelte: names a theme's Heroicons as having no adapter, and prints no subpath for it", async () => {
    app("svelte");
    const bundle = join(root, "bundle");
    mkdirSync(bundle);
    for (const entry of readZip(readFileSync(FIXTURE)))
      writeFileSync(join(bundle, entry.name), entry.data);
    const json = JSON.parse(readFileSync(join(bundle, "theme.json"), "utf8"));
    json.$extensions["com.ui-organized.theme-builder"].icons.library = "heroicons";
    writeFileSync(join(bundle, "theme.json"), JSON.stringify(json));

    expect(await run(["theme", bundle, "--cwd", root, "--offline"])).toBe(0);
    const text = stdout();
    expect(text).toContain("! @ui-organized/svelte has no heroicons adapter");
    expect(text).not.toContain("icons/heroicons");
    expect(text).not.toContain("<IconProvider");
  });

  it("Vue: styles.css, and icon-style rather than style", async () => {
    app("vue");
    expect(await theme()).toBe(0);
    const text = stdout();
    expect(text).toMatch(/import '@ui-organized\/vue\/styles\.css' +\/\/ 2\. component styles/);
    expect(text).toContain("npm install @lucide/vue");
    expect(text).toContain('icon-style="outline"');
    expect(text).toContain(':base-size="24"');
    expect(text).not.toMatch(/[^-]style="outline"/);
    expect(existsSync(join(root, "src", "icons.ts"))).toBe(false);
  });

  it("Vue: leaves icons.ts out of the plan, not just off the disk", async () => {
    app("vue");
    expect(await theme("--check")).toBe(0);
    expect(stdout()).toContain("+ src/styles/theme.css");
    expect(stdout()).toContain("+ src/fonts.ts");
    expect(stdout()).not.toContain("icons.ts");
  });

  it("Angular CLI: the angular.json styles array, keeping the app's own stylesheet last", async () => {
    app("angular", { deps: { "@angular/core": "^21.2.0" } });
    writeFileSync(
      join(root, "angular.json"),
      JSON.stringify({
        projects: {
          "my-app": { architect: { build: { options: { styles: ["src/styles.scss"] } } } },
        },
      }),
    );
    mkdirSync(join(root, "src", "app"));
    writeFileSync(join(root, "src", "app", "app.config.ts"), "");

    expect(await theme()).toBe(0);
    const text = stdout();
    expect(text).toContain("projects › my-app › architect › build › options");
    expect(text).toContain(
      [
        '      "styles": [',
        '        "@ui-organized/tokens/variables.css",',
        '        "@angular/cdk/overlay-prebuilt.css",',
        '        "@ui-organized/angular/styles.css",',
        '        "@ui-organized/angular/overlay.css",',
        '        "src/styles/theme.css",',
        '        "src/styles.scss"',
        "      ]",
      ].join("\n"),
    );
    expect(text).not.toContain("import '@ui-organized/tokens/variables.css'");
    // @ng-icons 35+ needs Angular 22.
    expect(text).toContain("npm install @ng-icons/lucide@34");
    expect(text).toContain("the providers in src/app/app.config.ts");
    expect(text).toContain("provideIconConfig({");
    expect(text).toContain("  library: 'lucide',");
    expect(text).toContain("  strokeAdjustment: false,");
    expect(existsSync(join(root, "src", "icons.ts"))).toBe(false);
  });

  it("Angular on Vite: the same stylesheets as imports", async () => {
    app("angular");
    expect(await theme()).toBe(0);
    const text = stdout();
    expect(text).toMatch(
      /import '@angular\/cdk\/overlay-prebuilt\.css' +\/\/ 2\. the CDK's overlay pane/,
    );
    expect(text).toMatch(
      /import '@ui-organized\/angular\/overlay\.css' +\/\/ 4\. overlay stacking/,
    );
    expect(text).toMatch(/import '\.\/styles\/theme\.css' +\/\/ 5\. your theme, last so it wins/);
    expect(text).toContain("npm install @ng-icons/lucide\n");
    expect(text).toContain("bootstrapApplication's providers");
  });

  it("takes --framework over package.json", async () => {
    app("react");
    expect(await theme("--framework", "vue")).toBe(0);
    expect(stdout()).toContain("Next (Vue)");
    expect(stdout()).toContain("@ui-organized/vue/styles.css");
  });

  it("refuses a --framework it doesn't know", async () => {
    expect(await theme("--framework", "solid")).toBe(2);
    expect(err.join("")).toContain('Unknown --framework "solid"');
  });

  it("leaves out installs for packages package.json already lists", async () => {
    app("react", { deps: { "@ui-organized/tokens": "^3.5.0", "lucide-react": "^0.400.0" } });
    expect(await theme()).toBe(0);
    expect(stdout()).toContain("import '@ui-organized/react/icons/lucide'");
    expect(stdout()).not.toContain("npm install");
  });
});

describe("uiorg theme findings", () => {
  it("marks unchecked coverage as a warning, never a tick", async () => {
    writePackage(root, { dependencies: { "@ui-organized/vue": "^6.1.0" } });
    expect(await theme("--check")).toBe(0);
    expect(stdout()).toContain("! Token coverage not checked");
    expect(stdout()).not.toContain("✓ Token coverage");
  });

  it("refuses a theme missing tokens, and writes nothing", async () => {
    app("vue", { contract: [...THEME_TOKENS, "--not-in-the-theme"] });
    expect(await theme()).toBe(1);
    expect(stdout()).toContain("✗ Not applied");
    expect(existsSync(join(root, "src", "styles", "theme.css"))).toBe(false);
  });

  // It used to print "✗ Not applied" and then apply.
  it("says it's applying anyway under --force, applies, and still exits 1", async () => {
    app("vue", { contract: [...THEME_TOKENS, "--not-in-the-theme"] });
    expect(await theme("--force")).toBe(1);
    expect(stdout()).toContain("! Applying anyway (--force)");
    expect(stdout()).not.toContain("Not applied");
    expect(existsSync(join(root, "src", "styles", "theme.css"))).toBe(true);
  });
});
