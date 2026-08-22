import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { render as renderSvelte } from "svelte/server";
import { SPECS } from "./cases.js";
import { contractOf } from "./contract.js";

/**
 * Same props in, same DOM contract out — across libraries that share one
 * stylesheet and nothing else.
 *
 * Both sides are rendered server-side to static markup, so this needs no browser
 * and is cheap enough to run on every commit. It covers the static half of the
 * contract completely; interactive state (`[data-state]` on an open popover,
 * `[data-highlighted]` on a hovered option) is the other half and needs
 * Playwright.
 */
describe.each(SPECS)("$component", ({ react, svelte, cases }) => {
  it.each(cases)("$name", ({ props = {} }) => {
    // The two libraries spell the class prop differently. Each side is given
    // only its own spelling, so neither receives a stray unknown attribute.
    const { className, ...shared } = props as Record<string, any>;

    const reactHtml = renderToStaticMarkup(
      react({ ...shared, ...(className ? { className } : {}) }),
    );
    const svelteHtml = renderSvelte(svelte as any, {
      props: { ...shared, ...(className ? { class: className } : {}) },
    }).body;

    expect(contractOf(svelteHtml), "DOM contract").toEqual(contractOf(reactHtml));
  });
});
