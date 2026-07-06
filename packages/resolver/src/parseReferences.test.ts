import { describe, it, expect } from "vitest";
import { parseReferences, isResolveMiss, type ResolveMiss, type TokenResolution } from "./index.js";

describe("parseReferences", () => {
  it("returns no references for a literal value", () => {
    expect(parseReferences("#ff0066")).toEqual([]);
    expect(parseReferences(16)).toEqual([]);
  });

  it("extracts a bare reference", () => {
    expect(parseReferences("{color.brand}")).toEqual(["color.brand"]);
  });

  it("extracts references inside a math expression", () => {
    expect(parseReferences("{spacing.base} * 2")).toEqual(["spacing.base"]);
  });

  it("extracts multiple references from a modifier expression", () => {
    expect(parseReferences("mix({color.a}, {color.b}, 0.5)")).toEqual(["color.a", "color.b"]);
  });

  it("recurses into composite objects", () => {
    const typography = {
      fontFamily: "{font.body}",
      fontSize: "{size.md}",
      fontWeight: 400,
      lineHeight: "{leading.md}",
    };
    expect(parseReferences(typography)).toEqual(["font.body", "size.md", "leading.md"]);
  });

  it("recurses into arrays (e.g. a shadow list)", () => {
    const shadows = [
      { color: "{color.shadow}", offsetX: "0px", offsetY: "1px", blur: "2px" },
      { color: "{color.shadow}", offsetX: "0px", offsetY: "2px", blur: "4px" },
    ];
    expect(parseReferences(shadows)).toEqual(["color.shadow"]);
  });

  it("de-duplicates and trims while preserving first-seen order", () => {
    expect(parseReferences("{ a.b } + { c.d } + {a.b}")).toEqual(["a.b", "c.d"]);
  });
});

describe("isResolveMiss", () => {
  it("narrows a miss from a resolution", () => {
    const miss: ResolveMiss = { kind: "unknown-token", path: "color.ghost" };
    const ok: TokenResolution = {
      path: "color.brand",
      $type: "color",
      raw: { oklch: "oklch(0.6 0.2 270)", hex: "#3355ff" },
      references: [],
    };
    expect(isResolveMiss(miss)).toBe(true);
    expect(isResolveMiss(ok)).toBe(false);
  });
});
