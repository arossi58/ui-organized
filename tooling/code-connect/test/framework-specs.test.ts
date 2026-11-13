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
import { resolveTarget, surfaceFromSources } from "../src/frameworks.js";
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
