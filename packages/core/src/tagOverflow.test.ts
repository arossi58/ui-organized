import { describe, expect, it } from "vitest";
import { fitTagCount, measureTagRow } from "./tagOverflow.js";

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

describe("measureTagRow", () => {
  const row = (clientWidth: number, widths: number[]) => ({
    clientWidth,
    querySelectorAll: () => widths.map((width) => ({ getBoundingClientRect: () => ({ width }) })),
  });

  it("measures nothing without layout", () => {
    expect(measureTagRow(row(0, [40, 40]), 4)).toBeNull();
  });

  it("counts the room the next element leaves as the row's own", () => {
    // A row hugging two 50px tags is 104 wide, so on its own width only one
    // fits beside the +N. The text box after it has 100px to spare.
    expect(measureTagRow(row(104, [50, 50, 50]), 4)).toBe(1);
    expect(measureTagRow(row(104, [50, 50, 50]), 4, 100)).toBe(3);
  });

  it("takes the row's padding back out", () => {
    expect(measureTagRow(row(112, [50, 50]), 4, -8)).toBe(2);
    expect(measureTagRow(row(112, [50, 50]), 4, -20)).toBe(1);
  });
});
