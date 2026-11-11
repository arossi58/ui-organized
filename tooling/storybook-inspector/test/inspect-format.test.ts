import { describe, it, expect } from "vitest";
import {
  isKeywordValue,
  parseVarRefs,
  selectorSpecificity,
  splitSelectorList,
  usesVar,
  textClassOf,
  isIconTag,
  nodeLabel,
  isColorValue,
  isVisibleColor,
  isZeroLength,
  matchesQuery,
} from "../src/inspect/format.js";

describe("inspect/format selectors", () => {
  it("scores specificity per Selectors Level 4", () => {
    expect(selectorSpecificity(".a.b")).toEqual([0, 2, 0]);
    expect(selectorSpecificity("#a div.b::before")).toEqual([1, 1, 2]);
    expect(selectorSpecificity('.a[data-x="y.z"]:hover')).toEqual([0, 3, 0]);
    expect(selectorSpecificity(".a:where(.b, #c)")).toEqual([0, 1, 0]);
    expect(selectorSpecificity(".a:not(.b, #c)")).toEqual([1, 1, 0]);
    expect(selectorSpecificity(".a:is(:hover:not(:disabled))")).toEqual([0, 3, 0]);
  });

  it("splits selector lists on top-level commas only", () => {
    expect(splitSelectorList(".a, .b:is(.c, .d)")).toEqual([".a", ".b:is(.c, .d)"]);
  });

  it("treats keywords and zeros as nothing to tokenise", () => {
    for (const v of ["transparent", "currentcolor", "currentColor", "0", "0px", "none", "initial"]) {
      expect(isKeywordValue(v), v).toBe(true);
    }
    expect(isKeywordValue("2px")).toBe(false);
  });
});

describe("inspect/format", () => {
  it("parses design-token var references from a value", () => {
    expect(parseVarRefs("var(--vds-color-bg, #fff)")).toEqual(["--vds-color-bg"]);
    expect(parseVarRefs("1px solid var(--border) var(--x)")).toEqual(["--border", "--x"]);
    expect(parseVarRefs("12px")).toEqual([]);
  });

  it("detects var usage", () => {
    expect(usesVar("var(--a)")).toBe(true);
    expect(usesVar("red")).toBe(false);
  });

  it("finds the typography utility class", () => {
    expect(textClassOf(["btn", "text-medium-2", "x"])).toBe("text-medium-2");
    expect(textClassOf(["btn"])).toBeUndefined();
  });

  it("identifies icon (svg) tags", () => {
    expect(isIconTag("svg")).toBe(true);
    expect(isIconTag("DIV")).toBe(false);
  });

  it("builds a readable node label", () => {
    expect(nodeLabel("button", ["btn", "text-medium-2"], "Save")).toContain("button.btn");
    expect(nodeLabel("div", [])).toBe("div");
  });

  it("classifies colors and visibility", () => {
    expect(isColorValue("rgb(1, 2, 3)")).toBe(true);
    expect(isColorValue("#fff")).toBe(true);
    expect(isColorValue("12px")).toBe(false);
    expect(isVisibleColor("rgba(0, 0, 0, 0)")).toBe(false);
    expect(isVisibleColor("transparent")).toBe(false);
    expect(isVisibleColor("rgb(1, 2, 3)")).toBe(true);
  });

  it("matches element-list search by tag / class / text", () => {
    const n = { tag: "button", classes: ["btn", "btn--primary"], text: "Save" };
    expect(matchesQuery(n, "")).toBe(true);
    expect(matchesQuery(n, "butt")).toBe(true);
    expect(matchesQuery(n, "primary")).toBe(true);
    expect(matchesQuery(n, "save")).toBe(true);
    expect(matchesQuery(n, "zzz")).toBe(false);
  });

  it("detects zero-length shorthands", () => {
    expect(isZeroLength("0px")).toBe(true);
    expect(isZeroLength("0px 0px")).toBe(true);
    expect(isZeroLength("normal")).toBe(true);
    expect(isZeroLength("8px")).toBe(false);
    expect(isZeroLength("8px 0px")).toBe(false);
  });
});
