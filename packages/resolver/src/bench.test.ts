import { describe, it, expect } from "vitest";
import { resolve } from "./resolve.js";
import type { EffectiveDocument, EffectiveToken } from "./types.js";

/**
 * Builds a ~2,000-token document that exercises leaves, references, math
 * expressions, and color modifiers — a shallow graph (no deep recursion) so the
 * benchmark measures throughput, not stack depth.
 */
function buildLargeDoc(count: number): EffectiveDocument {
  const tokens = new Map<string, EffectiveToken>();
  tokens.set("base", { path: "base", $type: "dimension", $value: "4px" });
  tokens.set("brand", { path: "brand", $type: "color", $value: "#3355ff" });

  for (let i = 0; i < count; i++) {
    if (i % 3 === 0) {
      tokens.set(`dim.${i}`, { path: `dim.${i}`, $type: "dimension", $value: `{base} * ${(i % 10) + 1}` });
    } else if (i % 3 === 1) {
      tokens.set(`color.${i}`, {
        path: `color.${i}`,
        $type: "color",
        $value: `lighten({brand}, ${((i % 9) + 1) / 100})`,
      });
    } else {
      tokens.set(`alias.${i}`, { path: `alias.${i}`, $value: "{brand}" });
    }
  }
  return { tokens };
}

describe("performance", () => {
  it("resolves a ~2,000-token document in well under 50ms", () => {
    const doc = buildLargeDoc(2000);

    // Warm up (JIT) once, then measure a fresh pass.
    resolve(doc);
    const start = performance.now();
    const result = resolve(doc);
    const elapsed = performance.now() - start;

    expect(result.tokens.size).toBe(2002);
    expect(result.misses).toEqual([]);

    // Wall-clock timing is only meaningful on stable hardware. Dev machines should
    // comfortably meet the ~50ms design budget; shared CI runners are slower and
    // highly variable, so allow a loose ceiling there — enough to catch a
    // catastrophic (e.g. algorithmic) regression without flaking on runner
    // variance. The correctness assertions above always gate.
    const budgetMs = process.env.CI ? 1000 : 50;
    expect(elapsed).toBeLessThan(budgetMs);
  });
});
