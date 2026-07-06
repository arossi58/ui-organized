import { describe, it, expect } from "vitest";
import { SCHEMA_VERSION, type ProjectDocument } from "@ui-organized/schema";
import { serializeProjectDocument, deserializeProjectDocument } from "./index.js";

const doc: ProjectDocument = {
  version: SCHEMA_VERSION,
  meta: {
    name: "Fixture",
    createdAt: "2026-06-28T00:00:00.000Z",
    updatedAt: "2026-06-28T00:00:00.000Z",
    schemaVersion: SCHEMA_VERSION,
  },
  sets: [
    {
      name: "core",
      tokens: {
        color: { brand: { $type: "color", $value: "#3355ff" } },
        spacing: { base: { $type: "dimension", $value: "4px" } },
      },
    },
  ],
  themes: [{ name: "Default", selectedTokenSets: { core: "enabled" } }],
  modes: { light: {}, dark: {} },
};

describe("serializeProjectDocument", () => {
  it("emits 2-space JSON with a trailing newline", () => {
    const text = serializeProjectDocument(doc);
    expect(text.endsWith("\n")).toBe(true);
    expect(text).toContain('\n  "version"');
  });
});

describe("deserializeProjectDocument", () => {
  it("round-trips a document through serialize → deserialize", () => {
    const result = deserializeProjectDocument(serializeProjectDocument(doc));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual(doc);
  });

  it("returns a typed error for malformed JSON", () => {
    const result = deserializeProjectDocument("{ not json");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeInstanceOf(Error);
  });

  it("returns a typed error for schema-invalid JSON", () => {
    const result = deserializeProjectDocument(JSON.stringify({ version: "1.0.0" }));
    expect(result.ok).toBe(false);
  });
});
