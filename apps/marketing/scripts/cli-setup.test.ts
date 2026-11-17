/**
 * `uiorg theme` prints each library's setup steps after applying a theme, and
 * they have to say what Get started says. The CLI can't import this app (it
 * ships with no dependencies), so it keeps its own copy in
 * `packages/cli/src/setup.ts`, and this holds the two together: the stylesheets
 * in order with their numbered comments, Angular CLI's angular.json list, and
 * the icon packages. Get started's snippets are the ones checked against real
 * builds, so when this fails, the CLI is the side to change.
 */
import { describe, expect, it } from "vitest";
import { SETUP as CLI, THEME_NOTE } from "../../../packages/cli/src/setup";
import { ANGULAR_VITE_ENTRY, SETUP as DOCS } from "../src/docs/pages/getStartedSnippets";

const FRAMEWORKS = ["react", "svelte", "vue", "angular"] as const;

/** An entry's numbered imports, as `[path, note]` per `import '…'  // N. note` line. */
function numberedImports(entry: string): [string, string][] {
  return [...entry.matchAll(/^import '([^']+)' +\/\/ \d+\. (.+)$/gm)].map((m) => [m[1]!, m[2]!]);
}

/** The numbered imports before the theme's, which the CLI prints itself. */
function beforeTheme(entry: string): [string, string][] {
  const imports = numberedImports(entry);
  const theme = imports.findIndex(([, note]) => note === THEME_NOTE);
  expect(theme, "the theme's import comment").toBeGreaterThan(0);
  return imports.slice(0, theme);
}

const cliStylesheets = (fw: (typeof FRAMEWORKS)[number]) =>
  CLI[fw].stylesheets.map((s): [string, string] => [s.path, s.note]);

describe("uiorg theme's steps match Get started", () => {
  it.each(["react", "svelte", "vue"] as const)("%s: the stylesheets, in order", (fw) => {
    expect(cliStylesheets(fw)).toEqual(beforeTheme(DOCS[fw].entry));
  });

  it("angular on Vite: the stylesheets, in order", () => {
    expect(cliStylesheets("angular")).toEqual(beforeTheme(ANGULAR_VITE_ENTRY));
  });

  it("angular CLI: angular.json's styles, then the theme", () => {
    const { styles } = JSON.parse(`{${DOCS.angular.stylesConfig!.code}}`) as { styles: string[] };
    const ours = CLI.angular.stylesheets.map((s) => s.path);
    expect(styles.slice(0, ours.length)).toEqual(ours);
    expect(styles[ours.length]).toBe("src/styles/theme.css");
  });

  it.each(FRAMEWORKS)("%s: the icon packages", (fw) => {
    expect(Object.values(CLI[fw].iconPackages)).toEqual(DOCS[fw].iconPackages);
  });
});
