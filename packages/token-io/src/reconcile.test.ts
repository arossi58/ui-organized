import { describe, it, expect } from "vitest";
import { DtcgGroupSchema, type DtcgGroup, type OverrideLayer } from "@ui-organized/schema";
import {
  applyOverrides,
  reconcileOverrides,
  hasStaleOverrides,
} from "./reconcile.js";
import { getTokenAtPath, stripProvenance } from "./tree.js";

const provenance = { "ui-organized": { generatedBy: "brand-palette", ramp: { family: "brand", step: 500 } } };

function base(): DtcgGroup {
  return {
    color: {
      $type: "color",
      brand: {
        "500": { $value: "#3355ff", $extensions: { ...provenance } },
        "600": { $value: "#2244ee", $extensions: { ...provenance } },
      },
    },
  };
}

describe("applyOverrides", () => {
  it("merges override props onto the target token without mutating the base", () => {
    const original = base();
    const result = applyOverrides(original, { "color.brand.500": { $value: "#ff0000" } });
    expect(getTokenAtPath(result, "color.brand.500")?.$value).toBe("#ff0000");
    expect(getTokenAtPath(original, "color.brand.500")?.$value).toBe("#3355ff");
  });

  it("skips overrides whose target token is missing", () => {
    const result = applyOverrides(base(), { "color.ghost": { $value: "#000000" } });
    expect(getTokenAtPath(result, "color.ghost")).toBeUndefined();
  });
});

describe("reconcileOverrides", () => {
  it("classifies reapplied, redundant, and stale overrides", () => {
    const overrides: OverrideLayer = {
      "color.brand.500": { $value: "#ff0000" }, // differs → reapplied
      "color.brand.600": { $value: "#2244ee" }, // equals base → redundant
      "color.ghost": { $value: "#000000" }, // missing → stale
    };
    const { overrides: next, report } = reconcileOverrides(base(), overrides);

    expect(report.reapplied).toEqual(["color.brand.500"]);
    expect(report.redundant).toEqual(["color.brand.600"]);
    expect(report.stale).toEqual([{ path: "color.ghost", reason: "missing" }]);

    // Redundant dropped; reapplied + stale kept (never silently discarded).
    expect(Object.keys(next).sort()).toEqual(["color.brand.500", "color.ghost"]);
  });

  it("flags a shape change ($type no longer matches) as stale", () => {
    const { report } = reconcileOverrides(base(), {
      "color.brand.500": { $type: "dimension", $value: "4px" },
    });
    expect(report.stale).toEqual([{ path: "color.brand.500", reason: "shape-changed" }]);
  });

  it("reports no stale overrides for a clean reconcile", () => {
    const { report } = reconcileOverrides(base(), { "color.brand.500": { $value: "#ff0000" } });
    expect(hasStaleOverrides(report)).toBe(false);
  });

  it("models the DoD: generate → override 3 → regenerate with a new brand color", () => {
    // User overrode three tokens on the original ramp.
    const overrides: OverrideLayer = {
      "color.brand.500": { $value: "#abcdef" },
      "color.brand.600": { $value: "#123456" },
      "color.brand.700": { $value: "#999999" }, // 700 will not exist in the new ramp
    };
    // Regenerated ramp with a new brand color: 500 happens to match the override,
    // 600 differs, 700 was dropped.
    const regenerated: DtcgGroup = {
      color: {
        $type: "color",
        brand: {
          "500": { $value: "#abcdef" },
          "600": { $value: "#0000ff" },
        },
      },
    };
    const { overrides: next, report } = reconcileOverrides(regenerated, overrides);
    expect(report.redundant).toEqual(["color.brand.500"]);
    expect(report.reapplied).toEqual(["color.brand.600"]);
    expect(report.stale).toEqual([{ path: "color.brand.700", reason: "missing" }]);
    // Zero silent loss: every non-redundant override survives.
    expect(next["color.brand.600"]).toEqual({ $value: "#123456" });
    expect(next["color.brand.700"]).toEqual({ $value: "#999999" });
  });
});

describe("stripProvenance (export valid with $extensions removed)", () => {
  it("removes pack provenance and leaves a valid DTCG document", () => {
    const stripped = stripProvenance(base(), "ui-organized");
    expect(getTokenAtPath(stripped, "color.brand.500")?.$extensions).toBeUndefined();
    expect(DtcgGroupSchema.safeParse(stripped).success).toBe(true);
  });

  it("preserves other extension namespaces", () => {
    const tree: DtcgGroup = {
      color: {
        $type: "color",
        brand: { $value: "#3355ff", $extensions: { "ui-organized": { generatedBy: "x" }, "com.acme": { note: 1 } } },
      },
    };
    const stripped = stripProvenance(tree, "ui-organized");
    expect(getTokenAtPath(stripped, "color.brand")?.$extensions).toEqual({ "com.acme": { note: 1 } });
  });
});
