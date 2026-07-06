import { describe, it, expect } from "vitest";
import { buildGraph, findCycles } from "./graph.js";
import type { EffectiveDocument, EffectiveToken } from "./types.js";

function effDoc(entries: Record<string, unknown>): EffectiveDocument {
  const tokens = new Map<string, EffectiveToken>();
  for (const [path, value] of Object.entries(entries)) {
    tokens.set(path, { path, $value: value });
  }
  return { tokens };
}

describe("buildGraph", () => {
  it("records direct reference edges", () => {
    const graph = buildGraph(effDoc({ a: "{b}", b: "1", c: "{a} * 2" }));
    expect(graph.nodes.get("a")!.references).toEqual(["b"]);
    expect(graph.nodes.get("b")!.references).toEqual([]);
    expect(graph.nodes.get("c")!.references).toEqual(["a"]);
  });

  it("records edges inside composite sub-fields", () => {
    const graph = buildGraph(
      effDoc({ heading: { fontFamily: "{font.body}", fontSize: "{size.lg}" } }),
    );
    expect(graph.nodes.get("heading")!.references).toEqual(["font.body", "size.lg"]);
  });
});

describe("findCycles", () => {
  it("detects a self-cycle", () => {
    expect(findCycles(buildGraph(effDoc({ a: "{a}" })))).toEqual([["a"]]);
  });

  it("detects a mutual cycle", () => {
    const cycles = findCycles(buildGraph(effDoc({ a: "{b}", b: "{a}" })));
    expect(cycles).toHaveLength(1);
    expect([...cycles[0]!].sort()).toEqual(["a", "b"]);
  });

  it("returns nothing for an acyclic graph", () => {
    expect(findCycles(buildGraph(effDoc({ a: "{b}", b: "1" })))).toEqual([]);
  });

  it("ignores dangling references", () => {
    expect(findCycles(buildGraph(effDoc({ a: "{ghost}" })))).toEqual([]);
  });
});
