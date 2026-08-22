import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { render as renderSvelte } from "svelte/server";
import { Button as ReactButton } from "@ui-organized/react";
import SvelteButtonFixture from "./fixtures/ButtonFixture.svelte";
import { contractOf, textOf } from "./contract.js";

/**
 * Same props in, same DOM contract out — across two libraries that share one
 * stylesheet and nothing else.
 *
 * Both are rendered server-side to static markup. That is deliberate: it needs
 * no browser, so this gate is cheap enough to run on every commit, and it covers
 * the static half of the contract completely. Interactive state — `[data-state]`
 * on an open popover, `[data-highlighted]` on a hovered option — is the other
 * half and needs a real browser; that is what the Playwright harness is for.
 */

const CASES: { name: string; props: Record<string, unknown> }[] = [
  { name: "default", props: {} },
  { name: "primary/sm", props: { intent: "primary", size: "sm" } },
  { name: "secondary/md", props: { intent: "secondary", size: "md" } },
  { name: "tertiary/lg", props: { intent: "tertiary", size: "lg" } },
  { name: "ghost", props: { intent: "ghost" } },
  { name: "destructive", props: { intent: "destructive" } },
  { name: "destructive-ghost", props: { intent: "destructive-ghost" } },
  { name: "disabled", props: { disabled: true } },
  { name: "submit", props: { type: "submit" } },
  { name: "with class", props: { className: "mine", class: "mine" } },
  { name: "aria-label", props: { "aria-label": "Save" } },
];

describe("Button renders the same contract in React and Svelte", () => {
  for (const { name, props } of CASES) {
    it(name, () => {
      // `className` is React's spelling and `class` is Svelte's; each library is
      // given only its own, so neither receives a stray unknown attribute.
      const { className, class: svelteClass, ...shared } = props as Record<string, any>;

      const reactHtml = renderToStaticMarkup(
        <ReactButton {...shared} {...(className ? { className } : {})}>
          Label
        </ReactButton>,
      );
      const svelteHtml = renderSvelte(SvelteButtonFixture as any, {
        props: { ...shared, ...(svelteClass ? { class: svelteClass } : {}) },
      }).body;

      expect(contractOf(svelteHtml)).toEqual(contractOf(reactHtml));
      expect(textOf(svelteHtml)).toEqual(textOf(reactHtml));
    });
  }
});
