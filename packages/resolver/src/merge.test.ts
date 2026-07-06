import { describe, it, expect } from "vitest";
import { SCHEMA_VERSION, type ProjectDocument, type TokenSet } from "@ui-organized/schema";
import { flattenSet, mergeSets, selectActiveSets, mergeProjectDocument } from "./merge.js";

const core: TokenSet = {
  name: "core",
  tokens: {
    color: {
      $type: "color",
      brand: { $value: "#3355ff" },
      alias: { $value: "{color.brand}" },
    },
    spacing: {
      base: { $type: "dimension", $value: "4px" },
    },
  },
};

describe("flattenSet", () => {
  it("flattens to dot paths and inherits group $type", () => {
    const tokens = flattenSet(core);
    const byPath = new Map(tokens.map((t) => [t.path, t]));
    expect([...byPath.keys()].sort()).toEqual(["color.alias", "color.brand", "spacing.base"]);
    expect(byPath.get("color.brand")!.$type).toBe("color");
    expect(byPath.get("color.alias")!.$type).toBe("color"); // inherited
    expect(byPath.get("spacing.base")!.$type).toBe("dimension");
  });
});

describe("mergeSets", () => {
  it("overlays later sets over earlier ones by path", () => {
    const a: TokenSet = { name: "a", tokens: { color: { brand: { $type: "color", $value: "#111111" } } } };
    const b: TokenSet = { name: "b", tokens: { color: { brand: { $type: "color", $value: "#222222" } } } };
    const merged = mergeSets([a, b]);
    expect(merged.tokens.get("color.brand")!.$value).toBe("#222222");
  });

  it("includes tokens unique to each set", () => {
    const merged = mergeSets([core]);
    expect(merged.tokens.size).toBe(3);
  });
});

describe("selectActiveSets", () => {
  const doc: ProjectDocument = {
    version: SCHEMA_VERSION,
    meta: { name: "d", createdAt: "x", updatedAt: "x", schemaVersion: SCHEMA_VERSION },
    sets: [
      { name: "primitives", tokens: {} },
      { name: "semantic", tokens: {} },
      { name: "experimental", tokens: {} },
    ],
    themes: [],
    modes: {},
  };

  it("keeps enabled + source sets in document order, drops disabled and unlisted", () => {
    const theme = {
      name: "T",
      selectedTokenSets: { primitives: "source", semantic: "enabled", experimental: "disabled" } as const,
    };
    expect(selectActiveSets(doc, theme).map((s) => s.name)).toEqual(["primitives", "semantic"]);
  });
});

describe("per-mode divergence", () => {
  it("produces different effective docs from different set lists", () => {
    const primitives: TokenSet = {
      name: "primitives",
      tokens: { color: { $type: "color", black: { $value: "#000000" }, white: { $value: "#ffffff" } } },
    };
    const light: TokenSet = {
      name: "semantic-light",
      tokens: { color: { $type: "color", text: { $value: "{color.black}" } } },
    };
    const dark: TokenSet = {
      name: "semantic-dark",
      tokens: { color: { $type: "color", text: { $value: "{color.white}" } } },
    };
    const lightDoc = mergeSets([primitives, light]);
    const darkDoc = mergeSets([primitives, dark]);
    expect(lightDoc.tokens.get("color.text")!.$value).toBe("{color.black}");
    expect(darkDoc.tokens.get("color.text")!.$value).toBe("{color.white}");
  });
});

describe("mergeProjectDocument", () => {
  it("merges the sets active for a named theme", () => {
    const doc: ProjectDocument = {
      version: SCHEMA_VERSION,
      meta: { name: "d", createdAt: "x", updatedAt: "x", schemaVersion: SCHEMA_VERSION },
      sets: [core, { name: "unused", tokens: { z: { $type: "number", $value: 9 } } }],
      themes: [{ name: "Default", selectedTokenSets: { core: "enabled", unused: "disabled" } }],
      modes: {},
    };
    const effective = mergeProjectDocument(doc, "Default");
    expect(effective.tokens.has("color.brand")).toBe(true);
    expect(effective.tokens.has("z")).toBe(false);
  });

  it("returns an empty document for an unknown theme", () => {
    const doc: ProjectDocument = {
      version: SCHEMA_VERSION,
      meta: { name: "d", createdAt: "x", updatedAt: "x", schemaVersion: SCHEMA_VERSION },
      sets: [core],
      themes: [],
      modes: {},
    };
    expect(mergeProjectDocument(doc, "Nope").tokens.size).toBe(0);
  });
});
