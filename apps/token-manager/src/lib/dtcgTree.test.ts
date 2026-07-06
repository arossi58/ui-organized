import { describe, it, expect } from "vitest";
import type { DtcgGroup } from "@ui-organized/schema";
import {
  deleteTokenAt,
  getTokenAt,
  hasTokenAt,
  makeToken,
  setTokenAt,
} from "./dtcgTree.js";

const tree: DtcgGroup = {
  color: {
    $type: "color",
    brand: { $value: "#3355ff" },
    blue: { "500": { $value: "#0000ff" } },
  },
};

describe("getTokenAt", () => {
  it("returns a nested token", () => {
    expect(getTokenAt(tree, "color.blue.500")).toEqual({ $value: "#0000ff" });
  });

  it("returns undefined for a group or missing path", () => {
    expect(getTokenAt(tree, "color")).toBeUndefined();
    expect(getTokenAt(tree, "color.ghost")).toBeUndefined();
  });
});

describe("setTokenAt", () => {
  it("creates intermediate groups without mutating the input", () => {
    const next = setTokenAt(tree, "spacing.scale.lg", { $type: "dimension", $value: "16px" });
    expect(getTokenAt(next, "spacing.scale.lg")).toEqual({ $type: "dimension", $value: "16px" });
    expect(getTokenAt(tree, "spacing.scale.lg")).toBeUndefined(); // original untouched
  });

  it("replaces an existing token", () => {
    const next = setTokenAt(tree, "color.brand", { $value: "#ff0000" });
    expect(getTokenAt(next, "color.brand")).toEqual({ $value: "#ff0000" });
  });
});

describe("deleteTokenAt", () => {
  it("removes a token", () => {
    const next = deleteTokenAt(tree, "color.brand");
    expect(hasTokenAt(next, "color.brand")).toBe(false);
    expect(hasTokenAt(next, "color.blue.500")).toBe(true);
  });

  it("prunes groups left empty by the deletion", () => {
    const next = deleteTokenAt(tree, "color.blue.500");
    expect(getTokenAt(next, "color.blue.500")).toBeUndefined();
    expect("blue" in (next.color as Record<string, unknown>)).toBe(false);
  });
});

describe("makeToken", () => {
  it("builds a typed token with a sensible default value", () => {
    expect(makeToken("color")).toEqual({ $type: "color", $value: "#000000" });
    expect(makeToken("number")).toEqual({ $type: "number", $value: 0 });
    expect(makeToken("typography").$type).toBe("typography");
  });
});
