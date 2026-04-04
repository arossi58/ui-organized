import { describe, it, expect } from "vitest";
import { resolveWeights, WEIGHT_ROLES } from "./weightFallback.js";

describe("resolveWeights", () => {
  it("returns all roles when fully assigned", () => {
    const assigned = {
      thin: 100, extralight: 200, light: 300, regular: 400,
      medium: 500, semibold: 600, bold: 700, extrabold: 800, black: 900,
    };
    const result = resolveWeights(assigned);
    expect(result).toEqual(assigned);
  });

  it("returns system defaults when nothing is assigned", () => {
    const result = resolveWeights({});
    expect(result.regular).toBe(400);
    expect(result.bold).toBe(700);
    expect(result.thin).toBe(100);
    expect(result.black).toBe(900);
  });

  it("resolves unassigned roles to nearest assigned weight", () => {
    // Only regular (400) and bold (700) assigned
    const result = resolveWeights({ regular: 400, bold: 700 });

    // light (default 300) — 300 is 100 from 400, 400 from 700 → falls back to 400
    expect(result.light).toBe(400);
    // medium (default 500) — 100 from 400, 200 from 700 → falls back to 400
    expect(result.medium).toBe(400);
    // semibold (default 600) — 200 from 400, 100 from 700 → falls back to 700
    expect(result.semibold).toBe(700);
    // extrabold (default 800) — 400 from 400, 100 from 700 → falls back to 700
    expect(result.extrabold).toBe(700);
  });

  it("prefers lighter weight when equidistant", () => {
    // medium default is 500 — equidistant between 400 and 600
    const result = resolveWeights({ regular: 400, semibold: 600 });
    expect(result.medium).toBe(400);
  });

  it("returns all WEIGHT_ROLES as keys", () => {
    const result = resolveWeights({ regular: 400 });
    for (const role of WEIGHT_ROLES) {
      expect(result).toHaveProperty(role);
    }
  });

  it("handles a single assigned weight — all roles fall back to it", () => {
    const result = resolveWeights({ regular: 400 });
    for (const role of WEIGHT_ROLES) {
      expect(result[role]).toBe(400);
    }
  });
});
