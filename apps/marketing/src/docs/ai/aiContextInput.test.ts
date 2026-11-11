/** "Copy for AI" under another library copies that library's own props once its scan has loaded. */
import { describe, it, expect } from "vitest";
import type { ComponentManifest } from "@ui-organized/code-connect/schema";
import vueManifest from "../../../../../manifest/frameworks/vue.json";
import { docsComponents } from "../registry";
import { aiContextFor } from "./aiContextInput";

const button = docsComponents.find((c) => c.entry?.codeName === "Button")!;
const select = docsComponents.find((c) => c.entry?.codeName === "Select")!;
const vue = vueManifest as unknown as ComponentManifest;

describe("Copy for AI per library", () => {
  it("copies Vue's own props and points at the Vue index once its scan is loaded", () => {
    const text = aiContextFor(select, "markdown", { framework: "vue", frameworkManifest: vue })!.text;
    expect(text).toContain("| `modelValue` |");
    expect(text).toContain("/llms-vue.txt");
    expect(text).toContain("packages/vue/src/components/Select/");
  });

  it("matches the published spec's Vue Button table (asChild included)", () => {
    expect(aiContextFor(button, "markdown", { framework: "vue", frameworkManifest: vue })!.text).toContain("| `asChild` |");
  });

  it("still copies something correct before the scan arrives", () => {
    const text = aiContextFor(select, "markdown", { framework: "vue" })!.text;
    expect(text).toContain('import { Select } from "@ui-organized/vue"');
  });
});
