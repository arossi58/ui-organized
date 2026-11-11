import { describe, expect, it } from "vitest";
import {
  declaredTokens,
  extractCode,
  hardcodedValues,
  totals,
  unknownTokens,
  type RunScore,
} from "../eval/score.js";

describe("unknownTokens", () => {
  const known = new Set(["--color-surface-base"]);

  it("reports references to properties the system doesn't define", () => {
    expect(unknownTokens(`a { color: var(--space-04); background: var(--color-surface-base) }`, known)).toEqual([
      "--space-04",
    ]);
  });

  it("accepts a property the file declares itself", () => {
    expect(unknownTokens(`const s = { "--gap": "1", gap: "var(--gap)" }`, known)).toEqual([]);
  });

  it("reports each name once", () => {
    expect(unknownTokens(`var(--nope) var(--nope)`, known)).toEqual(["--nope"]);
  });
});

describe("hardcodedValues", () => {
  it("finds colours and lengths", () => {
    expect(hardcodedValues(`color: #fff; padding: 16px; margin: 1.5rem; c: rgba(0, 0, 0, 0.5)`)).toEqual([
      "#fff",
      "16px",
      "1.5rem",
      "rgba(0, 0, 0, 0.5)",
    ]);
  });

  it("ignores tokens, their fallbacks, comments and zero", () => {
    expect(hardcodedValues(`/* #000 */ margin: 0px; color: var(--x, #123456);\n// 12px\n`)).toEqual([]);
  });
});

describe("declaredTokens", () => {
  it("reads custom properties from a stylesheet", () => {
    expect([...declaredTokens(`:root {\n  --a: 1;\n  --b-c: var(--a);\n}`)]).toEqual(["--a", "--b-c"]);
  });
});

describe("extractCode", () => {
  it("takes the first fenced block", () => {
    expect(extractCode("Here:\n```tsx\nconst a = 1;\n```\nDone")).toBe("const a = 1;\n");
  });

  it("falls back to the whole reply", () => {
    expect(extractCode("const a = 1;")).toBe("const a = 1;\n");
  });
});

describe("totals", () => {
  const base: RunScore = {
    id: "a",
    failed: false,
    hallucinatedImports: 0,
    unknownProps: 0,
    unknownTokens: [],
    hardcoded: 3,
    typeErrors: 0,
  };

  it("doesn't let hardcoded values make a file unclean", () => {
    expect(totals([base]).cleanFiles).toBe(1);
  });

  it("doesn't count a failed run as clean", () => {
    expect(totals([{ ...base, failed: true }]).cleanFiles).toBe(0);
  });

  it("sums across files", () => {
    const t = totals([base, { ...base, id: "b", unknownProps: 2, unknownTokens: ["--x"] }]);
    expect(t).toMatchObject({ files: 2, unknownProps: 2, unknownTokens: 1, hardcoded: 6, cleanFiles: 1 });
  });
});
