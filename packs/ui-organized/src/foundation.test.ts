import { describe, it, expect } from "vitest";
import { DtcgGroupSchema } from "@ui-organized/schema";
import { generateFoundation, DEFAULT_CONFIG, uiOrganizedPack } from "./index.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function get(tree: unknown, path: string): any {
  let node: any = tree;
  for (const key of path.split(".")) {
    if (node === null || typeof node !== "object") return undefined;
    node = node[key];
  }
  return node;
}

describe("generateFoundation", () => {
  const { tokens, recipes } = generateFoundation(DEFAULT_CONFIG);

  it("emits the expected token families as plain DTCG", () => {
    expect(get(tokens, "color.brand.500")).toBeDefined();
    expect(get(tokens, "color.neutral.500")).toBeDefined();
    expect(get(tokens, "font.size.body-large")).toBeDefined();
    expect(get(tokens, "spacing.space-04")).toBeDefined();
    expect(get(tokens, "radius.radius-03")).toBeDefined();
    expect(get(tokens, "elevation.subtle")).toBeDefined();
  });

  it("produces a valid DTCG document", () => {
    expect(DtcgGroupSchema.safeParse(tokens).success).toBe(true);
  });

  it("attaches optional provenance under the pack id", () => {
    expect(get(tokens, "color.brand.500").$extensions["ui-organized"].generatedBy).toBe(
      "brand-palette",
    );
    expect(get(tokens, "color.brand.500").$extensions["ui-organized"].ramp).toEqual({
      family: "brand",
      step: 500,
    });
  });

  it("stays valid DTCG once provenance is removed (owned tokens)", () => {
    const stripped = JSON.parse(JSON.stringify(tokens));
    const strip = (node: any): void => {
      if (node && typeof node === "object") {
        delete node.$extensions;
        for (const key of Object.keys(node)) if (!key.startsWith("$")) strip(node[key]);
      }
    };
    strip(stripped);
    expect(DtcgGroupSchema.safeParse(stripped).success).toBe(true);
  });

  it("records one recipe per generator with output paths", () => {
    expect(recipes.map((r) => r.generator).sort()).toEqual([
      "brand-palette",
      "elevation",
      "neutral-preset",
      "radius",
      "spacing",
      "typescale",
    ]);
    const brand = recipes.find((r) => r.generator === "brand-palette");
    expect(brand?.outputPaths).toContain("color.brand.500");
  });

  it("varies output with the brand input (deterministically)", () => {
    const a = generateFoundation({ ...DEFAULT_CONFIG, brand: "#ff0000" });
    const b = generateFoundation({ ...DEFAULT_CONFIG, brand: "#ff0000" });
    expect(get(a.tokens, "color.brand.500")).toEqual(get(b.tokens, "color.brand.500"));
    expect(get(a.tokens, "color.brand.500")).not.toEqual(get(tokens, "color.brand.500"));
  });
});

describe("uiOrganizedPack", () => {
  it("implements the GeneratorPack interface", () => {
    expect(uiOrganizedPack.id).toBe("ui-organized");
    expect(uiOrganizedPack.generators).toHaveLength(6);
  });

  it("validates its config", () => {
    expect(uiOrganizedPack.configSchema.safeParse({ brand: "#3355ff", neutral: "flint" }).success).toBe(
      true,
    );
    expect(uiOrganizedPack.configSchema.safeParse({ brand: "nope", neutral: "flint" }).success).toBe(
      false,
    );
    expect(uiOrganizedPack.configSchema.safeParse({ brand: "#3355ff", neutral: "xxx" }).success).toBe(
      false,
    );
  });
});
