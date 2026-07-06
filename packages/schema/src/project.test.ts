import { describe, it, expect } from "vitest";
import {
  parseProjectDocument,
  assertProjectDocument,
  migrateProjectDocument,
} from "./parse.js";
import { SCHEMA_VERSION, type ProjectDocument } from "./project.js";

/** A hand-written sample document exercising sets, themes, modes, refs, and a composite. */
const sample: ProjectDocument = {
  version: SCHEMA_VERSION,
  meta: {
    name: "Sample",
    createdAt: "2026-06-28T00:00:00.000Z",
    updatedAt: "2026-06-28T00:00:00.000Z",
    schemaVersion: SCHEMA_VERSION,
  },
  sets: [
    {
      name: "primitives",
      tokens: {
        color: {
          $type: "color",
          brand: { $value: "#3355ff" },
          "brand-hover": { $value: "{color.brand}" },
        },
        spacing: {
          base: { $type: "dimension", $value: "4px" },
          lg: { $type: "dimension", $value: "{spacing.base} * 4" },
        },
      },
    },
    {
      name: "semantic",
      tokens: {
        text: {
          heading: {
            $type: "typography",
            $value: {
              fontFamily: "Inter",
              fontSize: "32px",
              fontWeight: 700,
              lineHeight: 1.2,
            },
          },
        },
      },
    },
  ],
  themes: [
    {
      name: "Default",
      selectedTokenSets: { primitives: "source", semantic: "enabled" },
    },
  ],
  modes: {
    light: { $description: "Light mode" },
    dark: { $description: "Dark mode" },
  },
};

describe("parseProjectDocument", () => {
  it("round-trips a hand-written sample document", () => {
    const roundTripped: unknown = JSON.parse(JSON.stringify(sample));
    const result = parseProjectDocument(roundTripped);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual(sample);
  });

  it("accepts a plain-DTCG document with no packs/recipes/overrides", () => {
    const plain: ProjectDocument = {
      version: SCHEMA_VERSION,
      meta: {
        name: "Plain",
        createdAt: "2026-06-28T00:00:00.000Z",
        updatedAt: "2026-06-28T00:00:00.000Z",
        schemaVersion: SCHEMA_VERSION,
      },
      sets: [{ name: "core", tokens: { size: { sm: { $type: "dimension", $value: "8px" } } } }],
      themes: [],
      modes: {},
    };
    const result = parseProjectDocument(plain);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.packs).toBeUndefined();
      expect(result.value.recipes).toBeUndefined();
      expect(result.value.overrides).toBeUndefined();
    }
  });

  it("validates tokens carrying optional provenance in $extensions", () => {
    const withProvenance: ProjectDocument = {
      version: SCHEMA_VERSION,
      meta: {
        name: "Generated",
        createdAt: "2026-06-28T00:00:00.000Z",
        updatedAt: "2026-06-28T00:00:00.000Z",
        schemaVersion: SCHEMA_VERSION,
      },
      sets: [
        {
          name: "core",
          tokens: {
            color: {
              brand: {
                $type: "color",
                $value: "#3355ff",
                $extensions: {
                  "ui-organized": { generatedBy: "brand-palette", ramp: { family: "brand", step: 500 } },
                },
              },
            },
          },
        },
      ],
      themes: [],
      modes: {},
    };
    expect(parseProjectDocument(withProvenance).ok).toBe(true);
  });

  it("returns a typed error (not a throw) for a document missing meta", () => {
    const result = parseProjectDocument({ version: SCHEMA_VERSION, sets: [], themes: [], modes: {} });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.issues.length).toBeGreaterThan(0);
  });

  it("returns an error for a set with a malformed token", () => {
    const bad = {
      version: SCHEMA_VERSION,
      meta: {
        name: "Bad",
        createdAt: "x",
        updatedAt: "x",
        schemaVersion: SCHEMA_VERSION,
      },
      sets: [{ name: "core", tokens: { color: { brand: { $type: "color", $value: 42 } } } }],
      themes: [],
      modes: {},
    };
    expect(parseProjectDocument(bad).ok).toBe(false);
  });
});

describe("assertProjectDocument", () => {
  it("returns the parsed document for valid input", () => {
    expect(assertProjectDocument(JSON.parse(JSON.stringify(sample))).meta.name).toBe("Sample");
  });

  it("throws for invalid input", () => {
    expect(() => assertProjectDocument({})).toThrow();
  });
});

describe("migrateProjectDocument", () => {
  it("passes a current-version document straight through", () => {
    const result = migrateProjectDocument(JSON.parse(JSON.stringify(sample)));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual(sample);
  });

  it("rejects a non-object document with a typed error", () => {
    const result = migrateProjectDocument(null);
    expect(result.ok).toBe(false);
  });
});
