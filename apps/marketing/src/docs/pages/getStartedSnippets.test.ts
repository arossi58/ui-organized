/**
 * Get Started's snippets, against the example apps that build them.
 *
 * The page's promise is that its code is copy-paste correct, and the gates can
 * only keep that promise for code they run. `examples/svelte-table-smoke`,
 * `examples/vue-table-smoke` and `examples/angular-cli-smoke` are built and
 * rendered by `pnpm smoke` and type-checked by the lint gate, and their entry
 * files are these snippets copied in. This is what makes "copied in" stay true:
 * edit a snippet without its example, or the example without the page, and one
 * of these fails.
 *
 * Compared as code, not as text. Comments, indentation and column alignment are
 * dropped; everything else counts, so an import that moves, changes spelling or
 * gains a `.css` is a difference. The examples keep the docs' own quotes and
 * missing semicolons for the same reason, which is why prettier skips them.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SETUP } from "./getStartedSnippets";

const read = (path: string) =>
  readFileSync(new URL(`../../../../../${path}`, import.meta.url), "utf8");

/** One entry per line of code: comments, blank lines and runs of spaces dropped. */
function code(source: string): string[] {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map((line) =>
      line
        .replace(/(^|\s)\/\/.*$/, "")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean);
}

/** `lines` with `insert` after the one line equal to `anchor`. */
function after(lines: string[], anchor: string, insert: string[]): string[] {
  const at = lines.indexOf(anchor);
  expect(at, `no line \`${anchor}\` to insert after`).toBeGreaterThan(-1);
  expect(lines.lastIndexOf(anchor), `\`${anchor}\` appears twice`).toBe(at);
  return [...lines.slice(0, at + 1), ...insert, ...lines.slice(at + 1)];
}

/** The documented import line for a path the "why it sits there" table lists. */
function importOf(framework: "svelte" | "vue" | "angular", matches: (path: string) => boolean) {
  const row = SETUP[framework].imports.find((r) => matches(r.path));
  expect(row, `${framework}'s import table has no such row`).toBeDefined();
  return `import '${row!.path}'`;
}

/**
 * Each entry file, as a reader who followed the page ends up with it: the entry
 * snippet, the data table's stylesheet after the component styles (where the
 * table step says to put it), and the icon registration below the icon-set
 * import (where "Set up icons" says to put it).
 */
function documentedEntry(framework: "svelte" | "vue" | "angular"): string[] {
  const setup = SETUP[framework];
  let lines = code(setup.entry);
  if (framework !== "angular") {
    lines = after(
      lines,
      importOf(framework, (path) => path.startsWith(`@ui-organized/${framework}/styles`)),
      code(setup.table.styles),
    );
  }
  return after(
    lines,
    importOf(framework, (path) => path.includes("/icons/")),
    code(setup.iconRegister),
  );
}

describe("the Svelte and Vue entries are the examples' main.ts", () => {
  it.each([
    ["svelte", "examples/svelte-table-smoke/src/main.ts"],
    ["vue", "examples/vue-table-smoke/src/main.ts"],
  ] as const)("%s", (framework, file) => {
    expect(code(read(file))).toEqual(documentedEntry(framework));
  });

  it.each(["svelte", "vue"] as const)(
    "%s's import table lists the entry's imports, in order",
    (framework) => {
      const sideEffects = code(SETUP[framework].entry)
        .map((line) => /^import '([^']+)'$/.exec(line)?.[1])
        .filter(Boolean);
      expect(sideEffects).toEqual(SETUP[framework].imports.map((row) => row.path));
    },
  );
});

describe("the Angular CLI path is examples/angular-cli-smoke", () => {
  const stylesConfig = SETUP.angular.stylesConfig!;
  const documentedStyles: string[] = JSON.parse(`{${stylesConfig.code}}`).styles;
  const tableSheet = /"([^"]+)"/.exec(SETUP.angular.table.styles)![1];

  it("angular.json lists the documented stylesheets, with the table's after overlay.css", () => {
    const workspace = JSON.parse(read("examples/angular-cli-smoke/angular.json"));
    const styles = Object.values<{
      architect: { build: { options: { styles: string[] } } };
    }>(workspace.projects)[0].architect.build.options.styles;

    // "after overlay.css" is the table step's own wording, so it is checked
    // against the array rather than assumed.
    expect(SETUP.angular.table.styles).toContain("after overlay.css");
    const overlay = documentedStyles.findIndex((path) => path.endsWith("/overlay.css"));
    expect(overlay).toBeGreaterThan(-1);

    expect(styles).toEqual([
      ...documentedStyles.slice(0, overlay + 1),
      tableSheet,
      ...documentedStyles.slice(overlay + 1),
    ]);
  });

  it("src/main.ts is the entry, with the icon registration", () => {
    expect(code(read("examples/angular-cli-smoke/src/main.ts"))).toEqual(
      documentedEntry("angular"),
    );
  });

  it("src/app/app.config.ts is the provideIconConfig step", () => {
    expect(code(read("examples/angular-cli-smoke/src/app/app.config.ts"))).toEqual(
      code(SETUP.angular.iconConfig),
    );
  });

  it("the import table lists angular.json's stylesheets, then the icon set", () => {
    expect(SETUP.angular.imports.map((row) => row.path)).toEqual([
      ...documentedStyles,
      "@ui-organized/angular/icons/lucide",
    ]);
  });
});
