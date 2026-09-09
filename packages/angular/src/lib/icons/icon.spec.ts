import { describe, it, expect } from "vitest";
import { applySvgProps, parseIconMarkup } from "./icon.js";

/**
 * The two pure pieces of `UioIcon`, tested where the parity gate cannot reach.
 *
 * The gate renders each case in a fresh page, so it can never see what happens
 * when a *live* icon's config changes — which is the only way a prop that was
 * set can need clearing.
 */

describe("parseIconMarkup", () => {
  it("turns markup into a real svg element", () => {
    const svg = parseIconMarkup(document, `<svg viewBox="0 0 24 24"><path d="M0 0"/></svg>`);
    expect(svg?.tagName.toLowerCase()).toBe("svg");
    expect(svg?.getAttribute("viewBox")).toBe("0 0 24 24");
    expect(svg?.children.length).toBe(1);
  });

  it("refuses markup that is not an svg", () => {
    // Not defence against a hostile string — the set is code the app imported —
    // but a registration mistake should render nothing rather than inject a div
    // into the middle of a flex row.
    expect(parseIconMarkup(document, `<div>not an icon</div>`)).toBeNull();
    expect(parseIconMarkup(document, "")).toBeNull();
  });
});

describe("applySvgProps", () => {
  const svg = () => parseIconMarkup(document, `<svg></svg>`)!;

  it("writes attributes and custom properties to their own places", () => {
    const element = svg();
    applySvgProps(element, { width: 24, "--ng-icon__stroke-width": 1.5 }, new Set());
    expect(element.getAttribute("width")).toBe("24");
    expect(element.style.getPropertyValue("--ng-icon__stroke-width")).toBe("1.5");
  });

  it("omits a missing value rather than stringifying it", () => {
    // `stroke-width="undefined"` is invalid and renders nothing — worse than the
    // attribute simply being absent, which is what a solid icon wants.
    const element = svg();
    applySvgProps(element, { width: 24, "stroke-width": undefined }, new Set());
    expect(element.hasAttribute("stroke-width")).toBe(false);
  });

  it("clears a prop that the new set no longer has", () => {
    // The case that needs the `previous` set: adapters omit a key rather than
    // passing undefined, so switching a provider from outline to solid would
    // otherwise leave the last outline's stroke on the element forever.
    const element = svg();
    const first = applySvgProps(
      element,
      { "data-size": 24, "--ng-icon__stroke-width": 2 },
      new Set(),
    );
    expect(first).toEqual(new Set(["data-size", "--ng-icon__stroke-width"]));

    applySvgProps(element, { "data-size": 24 }, first);
    expect(element.style.getPropertyValue("--ng-icon__stroke-width")).toBe("");
    expect(element.getAttribute("data-size")).toBe("24");
  });
});
