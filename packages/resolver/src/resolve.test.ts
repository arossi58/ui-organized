import { describe, it, expect } from "vitest";
import type { DtcgType } from "@ui-organized/schema";
import { resolve, resolveToken } from "./resolve.js";
import { isResolveMiss, type EffectiveDocument, type EffectiveToken } from "./types.js";

type Entry = { type?: DtcgType; value: unknown };

function eff(entries: Record<string, Entry>): EffectiveDocument {
  const tokens = new Map<string, EffectiveToken>();
  for (const [path, entry] of Object.entries(entries)) {
    const token: EffectiveToken = { path, $value: entry.value };
    if (entry.type) token.$type = entry.type;
    tokens.set(path, token);
  }
  return { tokens };
}

/** Assert a resolution succeeded and return it (typed). */
function ok(result: ReturnType<typeof resolveToken>) {
  if (isResolveMiss(result)) throw new Error(`expected resolution, got miss ${result.kind}`);
  return result;
}

describe("references", () => {
  it("resolves a leaf dimension", () => {
    const doc = eff({ "spacing.base": { type: "dimension", value: "4px" } });
    expect(ok(resolveToken(doc, "spacing.base")).raw).toEqual({ value: 4, unit: "px" });
  });

  it("resolves a single alias and inherits its type", () => {
    const doc = eff({
      "color.brand": { type: "color", value: "#3355ff" },
      "color.alias": { value: "{color.brand}" },
    });
    const alias = ok(resolveToken(doc, "color.alias"));
    expect(alias.$type).toBe("color");
    expect(alias.references).toEqual(["color.brand"]);
    expect(alias.raw).toEqual(ok(resolveToken(doc, "color.brand")).raw);
  });

  it("resolves a 3-deep chain and carries the transitive reference chain", () => {
    const doc = eff({
      d: { type: "dimension", value: "2px" },
      c: { value: "{d}" },
      b: { value: "{c}" },
      a: { value: "{b}" },
    });
    const a = ok(resolveToken(doc, "a"));
    expect(a.raw).toEqual({ value: 2, unit: "px" });
    expect(a.references).toEqual(["b", "c", "d"]);
  });
});

describe("miss: unknown-token", () => {
  it("reports the missing path with referencedFrom", () => {
    const doc = eff({ a: { type: "color", value: "{ghost}" } });
    const miss = resolveToken(doc, "a");
    expect(miss).toEqual({ kind: "unknown-token", path: "ghost", referencedFrom: "a" });
  });

  it("reports a directly-requested missing token without referencedFrom", () => {
    expect(resolveToken(eff({}), "nope")).toEqual({ kind: "unknown-token", path: "nope" });
  });
});

describe("miss: cycle", () => {
  it("detects a self-cycle", () => {
    const result = resolveToken(eff({ a: { type: "color", value: "{a}" } }), "a");
    expect(result).toEqual({ kind: "cycle", cycle: ["a"] });
  });

  it("detects a mutual cycle", () => {
    const doc = eff({ a: { value: "{b}" }, b: { value: "{a}" } });
    const result = resolveToken(doc, "a");
    expect(isResolveMiss(result) && result.kind).toBe("cycle");
    if (isResolveMiss(result) && result.kind === "cycle") {
      expect([...result.cycle].sort()).toEqual(["a", "b"]);
    }
  });
});

describe("miss: type-mismatch", () => {
  it("flags a declared type that disagrees with its referent", () => {
    const doc = eff({
      "color.brand": { type: "color", value: "#fff" },
      bad: { type: "dimension", value: "{color.brand}" },
    });
    expect(resolveToken(doc, "bad")).toEqual({
      kind: "type-mismatch",
      path: "bad",
      expected: "dimension",
      got: "color",
    });
  });

  it("flags a color used inside a math expression", () => {
    const doc = eff({
      "color.brand": { type: "color", value: "#fff" },
      bad: { type: "dimension", value: "{color.brand} * 2" },
    });
    const miss = resolveToken(doc, "bad");
    expect(isResolveMiss(miss) && miss.kind).toBe("type-mismatch");
  });
});

describe("miss: bad-expression", () => {
  it("reports mixed incompatible units", () => {
    const doc = eff({
      a: { type: "dimension", value: "16px" },
      b: { type: "dimension", value: "1rem" },
      sum: { type: "dimension", value: "{a} + {b}" },
    });
    const miss = resolveToken(doc, "sum");
    expect(isResolveMiss(miss) && miss.kind).toBe("bad-expression");
  });

  it("reports divide-by-zero", () => {
    const doc = eff({ a: { type: "dimension", value: "4px" }, q: { type: "dimension", value: "{a} / 0" } });
    const miss = resolveToken(doc, "q");
    expect(isResolveMiss(miss) && miss.kind === "bad-expression" && miss.reason).toBe("division by zero");
  });
});

describe("math", () => {
  it("evaluates a reference-in-expression with unit carry", () => {
    const doc = eff({
      "spacing.base": { type: "dimension", value: "4px" },
      "spacing.lg": { type: "dimension", value: "{spacing.base} * 4" },
    });
    const lg = ok(resolveToken(doc, "spacing.lg"));
    expect(lg.raw).toEqual({ value: 16, unit: "px" });
    expect(lg.references).toEqual(["spacing.base"]);
  });

  it("evaluates a unitless number expression", () => {
    const doc = eff({ ratio: { type: "number", value: "3 * 2 + 1" } });
    expect(ok(resolveToken(doc, "ratio")).raw).toBe(7);
  });
});

describe("composites", () => {
  it("resolves a typography token with literal and referenced sub-fields", () => {
    const doc = eff({
      "size.lg": { type: "dimension", value: "32px" },
      heading: {
        type: "typography",
        value: { fontFamily: "Inter", fontSize: "{size.lg}", fontWeight: "bold", lineHeight: 1.2 },
      },
    });
    const heading = ok(resolveToken(doc, "heading"));
    expect(heading.raw).toEqual({
      fontFamily: "Inter",
      fontSize: { value: 32, unit: "px" },
      fontWeight: 700,
      lineHeight: { value: 1.2, unit: "" },
    });
    expect(heading.references).toEqual(["size.lg"]);
  });

  it("resolves a shadow array", () => {
    const doc = eff({
      "color.shadow": { type: "color", value: "#00000040" },
      elevation: {
        type: "shadow",
        value: [{ color: "{color.shadow}", offsetX: "0px", offsetY: "1px", blur: "2px" }],
      },
    });
    const shadow = ok(resolveToken(doc, "elevation"));
    expect(Array.isArray(shadow.raw)).toBe(true);
    expect(shadow.references).toEqual(["color.shadow"]);
  });

  it("propagates a miss when a composite sub-field references an unknown token", () => {
    const doc = eff({
      elevation: {
        type: "shadow",
        value: { color: "{color.ghost}", offsetX: "0px", offsetY: "1px", blur: "2px" },
      },
    });
    expect(resolveToken(doc, "elevation")).toEqual({
      kind: "unknown-token",
      path: "color.ghost",
      referencedFrom: "elevation",
    });
  });
});

describe("color modifiers (integration)", () => {
  const base = { type: "color" as const, value: { colorSpace: "oklch", components: [0.5, 0.1, 200] } };

  it("lightens a referenced color in OKLCH", () => {
    const doc = eff({ "color.base": base, "color.light": { type: "color", value: "lighten({color.base}, 0.2)" } });
    const light = ok(resolveToken(doc, "color.light"));
    expect((light.raw as { oklch: string }).oklch).toBe("oklch(0.700 0.100 200.0)");
    expect(light.references).toEqual(["color.base"]);
  });

  it("applies alpha", () => {
    const doc = eff({ "color.base": base, "color.fade": { type: "color", value: "alpha({color.base}, 0.5)" } });
    expect((ok(resolveToken(doc, "color.fade")).raw as { oklch: string }).oklch).toBe(
      "oklch(0.500 0.100 200.0 / 0.500)",
    );
  });

  it("mixes two referenced colors", () => {
    const doc = eff({
      "color.a": { type: "color", value: { colorSpace: "oklch", components: [0.4, 0, 0] } },
      "color.b": { type: "color", value: { colorSpace: "oklch", components: [0.8, 0, 0] } },
      "color.mid": { type: "color", value: "mix({color.a}, {color.b}, 0.5)" },
    });
    expect((ok(resolveToken(doc, "color.mid")).raw as { oklch: string }).oklch).toBe("oklch(0.600 0.000 0.0)");
  });

  it("applies a modifier to a literal color", () => {
    const doc = eff({ c: { type: "color", value: "darken(#808080, 0.1)" } });
    const result = ok(resolveToken(doc, "c"));
    expect((result.raw as { hex: string }).hex).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe("resolve (full document pass)", () => {
  it("returns successes in tokens and every miss kind in misses", () => {
    const doc = eff({
      leaf: { type: "dimension", value: "4px" },
      good: { type: "dimension", value: "{leaf} * 2" },
      selfCycle: { type: "color", value: "{selfCycle}" },
      missing: { type: "color", value: "{ghost}" },
      mismatch: { type: "dimension", value: "{leaf} / 0" },
    });
    const result = resolve(doc, { mode: "light" });
    expect(result.mode).toBe("light");
    expect(result.tokens.has("leaf")).toBe(true);
    expect(result.tokens.has("good")).toBe(true);
    const kinds = new Set(result.misses.map((m) => m.kind));
    expect(kinds.has("cycle")).toBe(true);
    expect(kinds.has("unknown-token")).toBe(true);
    expect(kinds.has("bad-expression")).toBe(true);
  });

  it("is deterministic across runs", () => {
    const build = () =>
      eff({
        "color.base": { type: "color", value: "#3355ff" },
        "color.alias": { value: "{color.base}" },
        "spacing.lg": { type: "dimension", value: "{spacing.base} * 4" },
        "spacing.base": { type: "dimension", value: "4px" },
      });
    const a = resolve(build());
    const b = resolve(build());
    expect([...a.tokens.entries()]).toEqual([...b.tokens.entries()]);
  });
});
