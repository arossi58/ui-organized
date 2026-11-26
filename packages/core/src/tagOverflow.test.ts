import { describe, expect, it } from "vitest";
import { fitTagCount } from "./tagOverflow.js";

describe("fitTagCount", () => {
  it("shows every tag when they fit without a +N", () => {
    expect(fitTagCount([40, 40, 40], 136, 8, 40)).toBe(3);
  });
  it("reserves room for the +N once they do not", () => {
    // 40 + 8 + 40 = 88; adding the third (136) overflows 120, so +N must fit: 88 + 8 + 40 = 136 > 120 → one.
    expect(fitTagCount([40, 40, 40], 120, 8, 40)).toBe(1);
    expect(fitTagCount([40, 40, 40, 40], 150, 8, 40)).toBe(2);
  });
  it("keeps at least one tag, however narrow the field", () => {
    expect(fitTagCount([300, 40], 100, 8, 40)).toBe(1);
  });
  it("returns zero for no tags", () => {
    expect(fitTagCount([], 100, 8, 40)).toBe(0);
  });
});
