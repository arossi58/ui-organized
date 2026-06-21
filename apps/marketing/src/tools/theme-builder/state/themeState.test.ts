import { describe, it, expect, beforeEach } from "vitest";
import {
  typeSizeTokens,
  typeLeadingTokens,
  typeFontTokens,
  typeWeightTokens,
} from "@ui-organized/tokens";
import { useBuilderStore } from "./themeState";
import { buildThemeTokens } from "../utils/buildConfig";

const s = () => useBuilderStore.getState();

// The store is a module singleton; restore typography to defaults before each test.
beforeEach(() => {
  s().resetTypeScale();
  s().resetLineHeight();
  s().setHeadingFont(typeFontTokens.heading, { ...typeWeightTokens.heading });
  s().setBodyFont(typeFontTokens.body, { ...typeWeightTokens.body });
});

describe("typography defaults (1:1 with the design system)", () => {
  it("opens in 'system' mode seeded from the canonical tokens", () => {
    expect(s().typeScaleMode).toBe("system");
    expect(s().lineHeightMode).toBe("system");
    expect(s().typeScaleSteps).toEqual(typeSizeTokens);
    expect(s().leadingSteps).toEqual(typeLeadingTokens);
    expect(s().headingFamily).toBe(typeFontTokens.heading);
    expect(s().bodyWeights).toEqual(typeWeightTokens.body);
  });

  it("uses 20px (not 21px) body-medium leading by default — the reported bug", () => {
    expect(s().leadingSteps["body-medium"]).toBe(20);
  });
});

describe("line-height system → custom override", () => {
  it("dragging the body line height flips to a uniform custom multiplier", () => {
    s().setBodyLineHeight(1.5);
    expect(s().lineHeightMode).toBe("custom");
    // body-medium = 14px × 1.5 = 21px once uniform
    expect(s().leadingSteps["body-medium"]).toBe(21);
    // heading steps keep their own (still-default 1.5×) multiplier
    expect(s().leadingSteps["display-xlarge"]).toBe(64 * 1.5);
  });

  it("resetLineHeight restores the canonical per-step leadings", () => {
    s().setBodyLineHeight(1.2);
    expect(s().lineHeightMode).toBe("custom");
    s().resetLineHeight();
    expect(s().lineHeightMode).toBe("system");
    expect(s().leadingSteps).toEqual(typeLeadingTokens);
  });
});

describe("type-scale system → custom override", () => {
  it("editing base/ratio flips to custom and regenerates sizes", () => {
    s().setTypeScale(18, 1.333);
    expect(s().typeScaleMode).toBe("custom");
    expect(s().typeScaleSteps["body-large"]).toBe(18);
    // Leadings stay on the canonical px values while line height is still "system".
    expect(s().lineHeightMode).toBe("system");
    expect(s().leadingSteps).toEqual(typeLeadingTokens);
  });

  it("resetTypeScale restores the canonical sizes", () => {
    s().setTypeScale(20, 1.5);
    expect(s().typeScaleMode).toBe("custom");
    s().resetTypeScale();
    expect(s().typeScaleMode).toBe("system");
    expect(s().typeScaleSteps).toEqual(typeSizeTokens);
  });
});

describe("export → import round-trip", () => {
  it("preserves system mode and the canonical scale", () => {
    const theme = buildThemeTokens(s());
    s().setBodyLineHeight(1.1); // dirty the state
    s().loadFromThemeJson(theme);
    expect(s().lineHeightMode).toBe("system");
    expect(s().typeScaleMode).toBe("system");
    expect(s().leadingSteps).toEqual(typeLeadingTokens);
    expect(s().typeScaleSteps).toEqual(typeSizeTokens);
  });

  it("preserves a customized scale + line height", () => {
    s().setTypeScale(18, 1.2);
    s().setBodyLineHeight(1.4);
    s().setHeadingLineHeight(1.1);
    const customSizes = { ...s().typeScaleSteps };
    const customLeadings = { ...s().leadingSteps };

    const theme = buildThemeTokens(s());
    s().resetTypeScale();
    s().resetLineHeight();
    s().loadFromThemeJson(theme);

    expect(s().typeScaleMode).toBe("custom");
    expect(s().lineHeightMode).toBe("custom");
    expect(s().typeScaleSteps).toEqual(customSizes);
    expect(s().leadingSteps).toEqual(customLeadings);
  });
});
