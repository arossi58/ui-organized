import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { render as renderSvelte } from "svelte/server";
import { SPECS } from "./cases.js";
import { contractOf, type ElementContract } from "./contract.js";

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

const require = createRequire(import.meta.url);
const CORE_SRC = join(dirname(require.resolve("@ui-organized/core/package.json")), "src/components");

function withoutAllowed(contract: ElementContract[], allowed: string[]): ElementContract[] {
  if (!allowed.length) return contract;
  return contract.map((el) => ({
    ...el,
    attributes: Object.fromEntries(
      Object.entries(el.attributes).filter(([name]) => !allowed.includes(name)),
    ),
  }));
}

describe.each(SPECS)("$component", ({ react, svelte, cases, allow = [], stylesheets = [] }) => {
  const allowed = allow.map((a) => a.attribute);

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

    expect(
      withoutAllowed(contractOf(svelteHtml), allowed),
      "DOM contract",
    ).toEqual(withoutAllowed(contractOf(reactHtml), allowed));
  });

  // An allowance is a claim that a difference is invisible. This is what makes
  // that claim checkable rather than a comment someone has to trust.
  for (const { attribute, reason } of allow) {
    it(`allowing ${attribute} is safe: no stylesheet selects on it`, () => {
      expect(stylesheets.length, `${attribute} is allowed but no stylesheets are listed`).toBeGreaterThan(0);
      for (const sheet of stylesheets) {
        const css = readFileSync(join(CORE_SRC, sheet), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
        expect(css, `${sheet} selects on ${attribute}, so this difference is NOT invisible. ${reason}`)
          .not.toContain(`[${attribute}`);
      }
    });
  }
});
