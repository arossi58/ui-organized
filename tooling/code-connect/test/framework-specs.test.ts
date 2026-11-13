/**
 * Specs for Svelte and Vue come from each library's OWN scan
 * (`manifest/frameworks/<framework>.json`), not React's prop table.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildComponentSpec } from "../src/component-spec.js";
import { projectRules } from "../src/ai-context-rules.js";
import { loadFrameworkSurfaces } from "../src/framework-data.js";
import { resolveTarget, setupImportsFor, surfaceFromSources } from "../src/frameworks.js";
import { COMPONENT_SLUGS } from "../src/usage/index.js";
import type { ComponentManifest } from "../src/schema.js";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (p: string) => JSON.parse(readFileSync(join(REPO, p), "utf8")) as ComponentManifest;
const manifest = read("manifest/components.json");
const latest = { generatedAt: "", hashes: {} };
const entry = (name: string) => manifest.components.find((c) => c.codeName === name)!;

const VUE = surfaceFromSources("vue", { barrels: [readFileSync(join(REPO, "packages/vue/src/index.ts"), "utf8")] });
const SVELTE = surfaceFromSources("svelte", { barrels: [readFileSync(join(REPO, "packages/svelte/src/lib/index.ts"), "utf8")] });

function spec(framework: "vue" | "svelte", name: string) {
  const surface = framework === "vue" ? VUE : SVELTE;
  const target = resolveTarget(framework, name, surface)!;
  return buildComponentSpec(entry(name), manifest, latest, "0.0.0", {
    framework,
    target,
    frameworkManifest: read(`manifest/frameworks/${framework}.json`),
  });
}

/** The spec exactly as `get_component` and the static files build it: whole surface included. */
const SURFACES = loadFrameworkSurfaces(REPO);
function servedSpec(framework: "svelte" | "vue" | "angular", name: string) {
  const surface = SURFACES[framework];
  const target = resolveTarget(framework, name, surface)!;
  return buildComponentSpec(entry(name), manifest, latest, "0.0.0", {
    framework,
    target,
    frameworkManifest: read(`manifest/frameworks/${framework}.json`),
    surface,
  });
}

describe("framework specs from each library's own scan", () => {
  it("lists Vue Button's asChild and cites the Vue source", () => {
    const text = spec("vue", "Button");
    expect(text).toContain("| `asChild` |");
    expect(text).toContain("packages/vue/src/components/Button/Button.types.ts");
    expect(text).not.toContain("scanned from the React component");
  });

  it("lists Vue Select's v-model prop instead of React's callback", () => {
    const text = spec("vue", "Select");
    expect(text).toContain("| `modelValue` |");
  });

  it("expands Svelte's shared size alias into its values", () => {
    expect(spec("svelte", "Button")).toMatch(/\| `size` \| `"sm"` \\\| `"md"` \\\| `"lg"` \|/);
  });

  it("imports from the library's own package", () => {
    expect(spec("svelte", "Button")).toContain("@ui-organized/svelte");
  });
});

describe("specs write out the types their props name", () => {
  const SELECT_OPTION = "- `SelectOption` is `{ value: string; label: string; disabled?: boolean }`";

  it("gives React's and Vue's Select the option's shape", () => {
    expect(buildComponentSpec(entry("Select"), manifest, latest, "0.0.0")).toContain(SELECT_OPTION);
    expect(spec("vue", "Select")).toContain(SELECT_OPTION);
  });

  it("uses the library's own declaration, not React's", () => {
    const tabs = servedSpec("svelte", "Tabs");
    expect(tabs).toContain("- `TabItem` is `{ value: string | number; label: string | Snippet;");
    expect(tabs).not.toContain("ReactNode; content");
  });

  it("writes Angular's from its own scan, through the checker", () => {
    const tree = servedSpec("angular", "TreeView");
    expect(tree).toContain(
      "- `TreeViewNode` is `{ id: string; label: string; children?: TreeViewNode[]; icon?: string | IconGlyph; disabled?: boolean }`",
    );
    expect(servedSpec("angular", "Select")).toContain(SELECT_OPTION);
  });
});

describe("specs never send another library's reader to React", () => {
  it("points at the library's own index, and counts components rather than manifest entries", () => {
    const text = spec("vue", "Button");
    expect(text).toContain("https://uiorganized.com/llms-vue.txt");
    expect(text).not.toContain("https://uiorganized.com/llms.txt");
    // One per docs page, as Copy for AI says, not the manifest's 174 entries.
    expect(COMPONENT_SLUGS).toHaveLength(67);
    expect(text).toContain("67 components — https://uiorganized.com/llms-vue.txt");
    expect(buildComponentSpec(entry("Button"), manifest, latest, "0.0.0")).toContain(
      "67 components — https://uiorganized.com/llms.txt",
    );
  });

  it("doesn't tell a Vue reader to use React's `render`", () => {
    const text = spec("vue", "Button");
    expect(text).not.toContain("`render`");
    expect(text).not.toContain("={");
  });

  it("names the Angular classes in a usage guide's cross-references", () => {
    const text = servedSpec("angular", "Button");
    expect(text).toContain("Use `UioSwitch` or `UioToggle` instead.");
    expect(text).toContain("- `UioToggle`: when");
    expect(text).not.toContain("`Switch`");
  });

  it("never offers Heroicons to Svelte, which has no adapter for it", () => {
    for (const name of ["Button", "Icon", "Tag"]) expect(servedSpec("svelte", name)).not.toMatch(/heroicons/i);
  });

  it("writes the icon hint in each library's own binding syntax", () => {
    expect(servedSpec("vue", "Button")).toContain(':icon="CircleAlert"');
    expect(servedSpec("angular", "Button")).toContain('icon="circle-alert"');
    expect(servedSpec("angular", "Button")).not.toContain("icon={");
  });

  it("imports the stylesheets by the `.css` subpath TypeScript 6 accepts outside React", () => {
    for (const framework of ["svelte", "vue", "angular"] as const) {
      const sheets = setupImportsFor(framework, { table: true }).filter((i) => i.includes("/styles"));
      expect(sheets).toEqual([
        `@ui-organized/${framework}/styles.css`,
        `@ui-organized/${framework}-table/styles.css`,
      ]);
    }
    expect(spec("vue", "Button")).toContain("import '@ui-organized/vue/styles.css';");
    // React's bare subpath ships type declarations, and Get started uses it.
    expect(setupImportsFor("react", { table: true })).toContain("@ui-organized/react/styles");
  });
});

describe("projectRules per library", () => {
  it("points each library at its own spec path and index", () => {
    expect(projectRules("@ui-organized/vue", "vue").join("\n")).toContain("/ai/vue/<Component>.md");
    expect(projectRules("@ui-organized/vue", "vue").join("\n")).toContain("/llms-vue.txt");
    expect(projectRules("@ui-organized/react").join("\n")).toContain("/ai/<Component>.md");
  });

  it("adds the library's markup conventions, and none for React", () => {
    expect(projectRules("@ui-organized/svelte", "svelte").join("\n")).toContain("`class` (never `className`)");
    expect(projectRules("@ui-organized/angular", "angular").join("\n")).toContain("`<button uioButton>`");
    expect(projectRules("@ui-organized/react")).toHaveLength(5);
  });

  it("sends a Figma link to Figma's own MCP first, while nothing is linked", () => {
    const rules = projectRules("@ui-organized/vue", "vue").join("\n");
    expect(rules).toContain("`get_design_context`");
    expect(rules.indexOf("`get_design_context`")).toBeLessThan(rules.indexOf("`get_figma_frame`"));
    expect(rules).not.toContain("call `get_figma_frame` first");
  });
});
