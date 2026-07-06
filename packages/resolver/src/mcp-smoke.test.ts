import { describe, it, expect } from "vitest";
// Import only from the package's public entry — exactly what an external consumer
// (the MCP server, the Figma plugin) sees. No app/DOM dependencies are involved.
import { resolveToken, isResolveMiss, type EffectiveDocument } from "./index.js";

/**
 * Stands in for the MCP server's `resolve_token` smoke test until
 * `packages/mcp-server` exists. It proves the resolver's oracle API is importable
 * and callable as a pure function, returning a deterministic typed result.
 */
describe("MCP import smoke test", () => {
  it("resolves a token through the public entry with no app dependencies", () => {
    const doc: EffectiveDocument = {
      tokens: new Map([
        ["color.brand", { path: "color.brand", $type: "color", $value: "#3355ff" }],
        ["color.primary", { path: "color.primary", $value: "{color.brand}" }],
      ]),
    };

    const result = resolveToken(doc, "color.primary");
    expect(isResolveMiss(result)).toBe(false);
    if (!isResolveMiss(result)) {
      expect(result.$type).toBe("color");
      expect(result.references).toEqual(["color.brand"]);
    }
  });

  it("returns a typed miss (never throws) for an unknown token", () => {
    const doc: EffectiveDocument = { tokens: new Map() };
    expect(resolveToken(doc, "nope")).toEqual({ kind: "unknown-token", path: "nope" });
  });
});
