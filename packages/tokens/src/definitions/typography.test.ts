import { describe, it, expect } from "vitest";
import {
  typeSizeTokens,
  typeLeadingTokens,
  typeFontTokens,
  typeWeightTokens,
} from "./typography.js";

describe("canonical typography exports", () => {
  it("parses the full set of steps from the DTCG JSON", () => {
    const steps = [
      "display-xlarge", "display-large", "display-medium",
      "heading-large", "heading-medium", "heading-small",
      "body-large", "body-medium", "body-small", "caption",
    ];
    expect(Object.keys(typeSizeTokens).sort()).toEqual([...steps].sort());
    expect(Object.keys(typeLeadingTokens).sort()).toEqual([...steps].sort());
  });

  it("exposes sizes + leadings as plain px numbers", () => {
    expect(typeSizeTokens["body-medium"]).toBe(14);
    expect(typeLeadingTokens["body-medium"]).toBe(21);
    expect(typeSizeTokens["display-xlarge"]).toBe(64);
    expect(typeLeadingTokens["display-xlarge"]).toBe(102.4);
    // Every value is a finite number, not a "14px" string.
    for (const v of [...Object.values(typeSizeTokens), ...Object.values(typeLeadingTokens)]) {
      expect(typeof v).toBe("number");
      expect(Number.isFinite(v)).toBe(true);
    }
  });

  it("exposes fonts and weights", () => {
    expect(typeFontTokens.heading).toBe("Inter");
    expect(typeFontTokens.body).toBe("Inter");
    expect(typeWeightTokens.body).toEqual({ default: 400, emphasis: 500, strong: 600, heavy: 700 });
    expect(typeWeightTokens.heading).toEqual({ default: 400, emphasis: 500, strong: 600, heavy: 700 });
  });
});
