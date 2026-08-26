import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { render as renderSvelte } from "svelte/server";
import { createSSRApp } from "vue";
import { renderToString as renderVue } from "vue/server-renderer";
import { SPECS } from "./cases/index.js";
import { contractOf, hiddenFromAssistiveTech, type ElementContract } from "./contract.js";

/**
 * Same props in, same DOM contract out — across libraries that share one
 * stylesheet and nothing else.
 *
 * React is the reference: every other library is compared against it rather
 * than against each other, so a divergence names one culprit instead of two.
 *
 * All three are rendered server-side to static markup, so this needs no browser
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

describe.each(SPECS)("$component", (spec) => {
  const {
    react, svelte, vue, cases, allow = [], allowTextIn = [], stylesheets = [], select, exclude,
  } = spec;
  const allowed = allow.map((a) => a.attribute);
  const textAllowed = allowTextIn.map((a) => a.selector);

  const shape = (html: string) =>
    withoutAllowed(contractOf(html, select, exclude, textAllowed), allowed);

  describe.each(
    [
      ["svelte", svelte] as const,
      ...(vue ? ([["vue", vue]] as const) : []),
    ].filter(([, component]) => Boolean(component)),
  )("vs %s", (framework, component) => {
    it.each(cases)("$name", async ({ props = {} }) => {
      // The libraries spell the class prop differently. Each side is given only
      // its own spelling, so none receives a stray unknown attribute.
      const { className, ...shared } = props as Record<string, any>;
      const ownProps = { ...shared, ...(className ? { class: className } : {}) };

      const reactHtml = renderToStaticMarkup(
        react({ ...shared, ...(className ? { className } : {}) }),
      );
      const otherHtml =
        framework === "svelte"
          ? renderSvelte(component as any, { props: ownProps }).body
          : await renderVue(createSSRApp(component as any, ownProps));

      const expected = shape(reactHtml);
      // A selector that matches nothing would compare two empty arrays and pass.
      // Only meaningful when a selector is in play — a component can legitimately
      // render nothing (FieldError with an empty message).
      if (select) {
        expect(expected.length, `the selector ${select} matched nothing in the React output`)
          .toBeGreaterThan(0);
      }
      expect(shape(otherHtml), "DOM contract").toEqual(expected);
    });
  });

  // A text allowance claims the element carrying the difference is hidden from
  // assistive technology. That is checkable, so it is checked.
  for (const { selector, reason } of allowTextIn) {
    it(`allowing text in ${selector} is safe: it is aria-hidden`, () => {
      const html = renderToStaticMarkup(react(cases[0]?.props ?? {}));
      const visible = hiddenFromAssistiveTech(html, selector);
      expect(visible, `${selector} is readable by assistive tech, so this text difference is NOT invisible. ${reason}`)
        .toEqual([]);
    });
  }

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
