import { describe, it, expect } from "vitest";
import type { DtcgGroup } from "@ui-organized/schema";
import { importDtcg } from "./import.js";
import { serializeProjectDocument, deserializeProjectDocument } from "./index.js";

const tree: DtcgGroup = {
  color: { $type: "color", brand: { $value: "#3355ff" }, alias: { $value: "{color.brand}" } },
};

describe("importDtcg (neutrality acceptance test 1)", () => {
  it("wraps arbitrary DTCG into a valid document with no pack", () => {
    const result = importDtcg(tree, { name: "core" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const doc = result.value;
    expect(doc.sets).toEqual([{ name: "core", tokens: tree }]);
    expect(doc.packs).toBeUndefined();
    expect(doc.recipes).toBeUndefined();
    expect(doc.overrides).toBeUndefined();
    expect(doc.themes[0]?.selectedTokenSets).toEqual({ core: "enabled" });
  });

  it("cold import → export adds no provenance or pack layers", () => {
    const result = importDtcg(tree, { name: "core" });
    if (!result.ok) throw result.error;
    const json = serializeProjectDocument(result.value);
    expect(json).not.toContain("uiorganized");
    expect(json).not.toContain('"packs"');
    expect(json).not.toContain('"recipes"');
    expect(json).not.toContain('"overrides"');
  });

  it("round-trips through serialize → deserialize unchanged", () => {
    const result = importDtcg(tree, { name: "core" });
    if (!result.ok) throw result.error;
    const back = deserializeProjectDocument(serializeProjectDocument(result.value));
    expect(back.ok).toBe(true);
    if (back.ok) expect(back.value).toEqual(result.value);
  });
});
