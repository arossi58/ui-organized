import { describe, it, expect } from "vitest";
import { evaluateExpression, looksLikeExpression } from "./math.js";

describe("evaluateExpression — arithmetic", () => {
  it("respects operator precedence", () => {
    expect(evaluateExpression("2 + 3 * 4")).toEqual({ ok: true, value: 14, unit: "" });
  });

  it("respects parentheses", () => {
    expect(evaluateExpression("(2 + 3) * 4")).toEqual({ ok: true, value: 20, unit: "" });
  });

  it("handles unary minus", () => {
    expect(evaluateExpression("-4 * 2")).toEqual({ ok: true, value: -8, unit: "" });
    expect(evaluateExpression("3 - -2")).toEqual({ ok: true, value: 5, unit: "" });
  });

  it("handles decimals", () => {
    expect(evaluateExpression("0.5 * 8")).toEqual({ ok: true, value: 4, unit: "" });
  });
});

describe("evaluateExpression — units", () => {
  it("carries a unit through multiplication by a scalar", () => {
    expect(evaluateExpression("16px * 2")).toEqual({ ok: true, value: 32, unit: "px" });
  });

  it("carries a unit through addition of like units", () => {
    expect(evaluateExpression("16px + 4px")).toEqual({ ok: true, value: 20, unit: "px" });
  });

  it("treats unitless operands as compatible in addition", () => {
    expect(evaluateExpression("16px + 0")).toEqual({ ok: true, value: 16, unit: "px" });
  });

  it("cancels like units on division", () => {
    expect(evaluateExpression("16px / 4px")).toEqual({ ok: true, value: 4, unit: "" });
  });

  it("rejects adding incompatible units", () => {
    const result = evaluateExpression("16px + 1rem");
    expect(result.ok).toBe(false);
  });

  it("rejects multiplying two units (no area)", () => {
    expect(evaluateExpression("16px * 2px").ok).toBe(false);
  });

  it("rejects dividing a scalar by a unit", () => {
    expect(evaluateExpression("2 / 4px").ok).toBe(false);
  });
});

describe("evaluateExpression — errors", () => {
  it("rejects divide-by-zero", () => {
    const result = evaluateExpression("4px / 0");
    expect(result).toEqual({ ok: false, reason: "division by zero" });
  });

  it("rejects an empty expression", () => {
    expect(evaluateExpression("").ok).toBe(false);
  });

  it("rejects identifiers / function calls (sandboxed grammar)", () => {
    expect(evaluateExpression("alert(1)").ok).toBe(false);
    expect(evaluateExpression("a + b").ok).toBe(false);
  });

  it("rejects unbalanced parentheses", () => {
    expect(evaluateExpression("(2 + 3").ok).toBe(false);
  });

  it("rejects trailing operators", () => {
    expect(evaluateExpression("2 +").ok).toBe(false);
  });
});

describe("looksLikeExpression", () => {
  it("recognizes operators and parentheses", () => {
    expect(looksLikeExpression("16px * 2")).toBe(true);
    expect(looksLikeExpression("(1 + 2)")).toBe(true);
  });

  it("does not treat a plain or signed literal as an expression", () => {
    expect(looksLikeExpression("16px")).toBe(false);
    expect(looksLikeExpression("-4px")).toBe(false);
  });
});
