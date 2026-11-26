import { describe, expect, it } from "vitest";
import { STAT_SENTIMENT_TAG_VARIANT, resolveStatSentiment, statClass } from "./Stat.styles.js";

describe("resolveStatSentiment", () => {
  it("reads up as good news and down as bad, by default", () => {
    expect(resolveStatSentiment("up")).toBe("positive");
    expect(resolveStatSentiment("down")).toBe("negative");
    expect(resolveStatSentiment("flat")).toBe("neutral");
    expect(resolveStatSentiment()).toBe("neutral");
  });

  it("lets a number where up is bad say so", () => {
    expect(resolveStatSentiment("up", "negative")).toBe("negative");
    expect(STAT_SENTIMENT_TAG_VARIANT[resolveStatSentiment("up", "negative")]).toBe("error");
  });
});

describe("statClass", () => {
  it("puts the card variant on a Card's surface, padded to its size", () => {
    expect(statClass("card", "md").split(" ")).toEqual(
      expect.arrayContaining([
        "card",
        "card--default",
        "card--padding-md",
        "stat",
        "stat--card",
        "stat--md",
      ]),
    );
    expect(statClass("card", "sm")).toContain("card--padding-sm");
  });

  it("leaves the plain variant without a frame", () => {
    expect(statClass("plain", "lg")).toBe("stat stat--plain stat--lg");
  });
});
