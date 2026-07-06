import { describe, it, expect } from "vitest";
import { hashProps } from "../src/hash.js";
import type { PropDefinition } from "../src/schema.js";

const a: PropDefinition = { name: "size", type: '"sm" | "md"', required: false };
const b: PropDefinition = { name: "intent", type: "string", required: true };

describe("hashProps", () => {
  it("is order-independent (sorts by name)", () => {
    expect(hashProps([a, b])).toBe(hashProps([b, a]));
  });

  it("ignores description/figmaVariantMapping (annotations, not signature)", () => {
    const annotated = { ...a, description: "a size", figmaVariantMapping: "Size" };
    expect(hashProps([annotated])).toBe(hashProps([a]));
  });

  it("changes when a type changes", () => {
    expect(hashProps([{ ...a, type: '"sm" | "md" | "lg"' }])).not.toBe(hashProps([a]));
  });

  it("changes when required flips", () => {
    expect(hashProps([{ ...a, required: true }])).not.toBe(hashProps([a]));
  });
});
