import { describe, it, expect } from "vitest";
import { getProvenance, ProvenanceSchema } from "./extensions.js";

describe("getProvenance", () => {
  const ext = {
    "ui-organized": { generatedBy: "brand-palette", ramp: { family: "brand", step: 500 } },
  };

  it("reads provenance for a pack id", () => {
    expect(getProvenance(ext, "ui-organized")).toEqual({
      generatedBy: "brand-palette",
      ramp: { family: "brand", step: 500 },
    });
  });

  it("returns undefined when the pack id is absent (a typed miss)", () => {
    expect(getProvenance(ext, "other-pack")).toBeUndefined();
  });

  it("returns undefined when there are no extensions", () => {
    expect(getProvenance(undefined, "ui-organized")).toBeUndefined();
  });

  it("treats malformed provenance as absent rather than throwing", () => {
    expect(getProvenance({ "ui-organized": { generatedFrom: "should-be-array" } }, "ui-organized"))
      .toBeUndefined();
  });
});

describe("ProvenanceSchema", () => {
  it("accepts an empty provenance object (everything optional)", () => {
    expect(ProvenanceSchema.safeParse({}).success).toBe(true);
  });
});
