import { describe, it, expect } from "vitest";
import { mergeProjectDocument, resolve } from "@ui-organized/resolver";
import { importTokensStudio, exportTokensStudio, type TokensStudioFile } from "./tokens-studio.js";
import { getTokenAtPath } from "./tree.js";

const ts: TokensStudioFile = {
  $metadata: { tokenSetOrder: ["core", "semantic"] },
  $themes: [
    {
      id: "t1",
      name: "Light",
      group: "mode",
      selectedTokenSets: { core: "source", semantic: "enabled" },
      $figmaStyleReferences: {},
    },
  ],
  core: {
    color: { brand: { value: "#3355ff", type: "color" } },
    space: {
      sm: { value: "4px", type: "spacing", description: "small" },
      md: { value: "{space.sm} * 2", type: "spacing" },
    },
    weight: { bold: { value: 700, type: "fontWeights" } },
  },
  semantic: {
    color: { text: { value: "{color.brand}", type: "color" } },
    elevation: {
      card: {
        value: { x: "0", y: "1", blur: "2", spread: "0", color: "#000000", type: "dropShadow" },
        type: "boxShadow",
      },
    },
  },
};

describe("importTokensStudio", () => {
  const result = importTokensStudio(ts);
  if (!result.ok) throw result.error;
  const doc = result.value;

  it("maps sets in order with theme statuses", () => {
    expect(doc.sets.map((s) => s.name)).toEqual(["core", "semantic"]);
    expect(doc.themes[0]?.group).toBe("mode");
    expect(doc.themes[0]?.selectedTokenSets).toEqual({ core: "source", semantic: "enabled" });
  });

  it("maps TS types to DTCG, preserving the original type for non-1:1 mappings", () => {
    const sm = getTokenAtPath(doc.sets[0]!.tokens, "space.sm")!;
    expect(sm.$type).toBe("dimension");
    expect(sm.$description).toBe("small");
    expect((sm.$extensions?.["tokens-studio"] as { type?: string })?.type).toBe("spacing");
    expect(getTokenAtPath(doc.sets[0]!.tokens, "weight.bold")!.$type).toBe("fontWeight");
  });

  it("remaps boxShadow sub-fields to the DTCG shadow shape", () => {
    const card = getTokenAtPath(doc.sets[1]!.tokens, "elevation.card")!;
    expect(card.$type).toBe("shadow");
    expect(card.$value).toMatchObject({ offsetX: "0", offsetY: "1", blur: "2", color: "#000000" });
  });

  it("imports a document that resolves (math + cross-set references)", () => {
    const effective = mergeProjectDocument(doc, "Light");
    const resolved = resolve(effective);
    expect(resolved.tokens.get("space.md")?.raw).toEqual({ value: 8, unit: "px" });
    expect(resolved.tokens.get("color.text")?.$type).toBe("color");
  });
});

describe("Tokens Studio round-trip (lossless on known fields)", () => {
  it("import → export reproduces the original file", () => {
    const result = importTokensStudio(ts);
    if (!result.ok) throw result.error;
    expect(exportTokensStudio(result.value)).toEqual(ts);
  });
});
