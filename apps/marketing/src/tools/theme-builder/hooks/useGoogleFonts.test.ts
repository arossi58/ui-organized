import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";
import { typeFontTokens } from "@ui-organized/tokens";
import { useBuilderStore } from "../state/themeState";
import { useGoogleFonts } from "./useGoogleFonts";

/**
 * Renders the hook once. A server render runs no effects, so whatever comes out
 * is what the font pickers have on their first render, which is the only moment
 * Ark's combobox reads its options to label the selected value.
 */
function firstRender(): { families: string[]; loading: boolean } {
  let seen: { families: string[]; loading: boolean } | null = null;
  function Probe() {
    const { fonts, loading } = useGoogleFonts();
    seen = { families: fonts.map((f) => f.family), loading };
    return null;
  }
  renderToStaticMarkup(createElement(Probe));
  if (!seen) throw new Error("Probe never rendered");
  return seen;
}

describe("useGoogleFonts", () => {
  it("offers the design system's default families on the first render", () => {
    const { families, loading } = firstRender();
    expect(loading).toBe(false);
    expect(families).toContain(typeFontTokens.heading);
    expect(families).toContain(typeFontTokens.body);
  });

  it("offers the families a fresh Theme Builder opens with", () => {
    // The pickers' value is the store's, so that is the one that must resolve.
    const { headingFamily, bodyFamily } = useBuilderStore.getState();
    const { families } = firstRender();
    expect(families).toContain(headingFamily);
    expect(families).toContain(bodyFamily);
  });
});
