import { describe, it, expect } from "vitest";
import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import QRCode from "./QRCode.vue";

/**
 * The half of QRCode the parity gate cannot see.
 *
 * That gate compares tags, classes, ARIA and `data-*` across the four
 * libraries — and the code itself is none of those. It is a `d` on one `<path>`,
 * sized by custom properties on the root, and both are invisible to a contract
 * that deliberately ignores geometry. So the gate can prove every library
 * renders the same *scaffolding* around a code and say nothing about whether the
 * code encodes anything at all.
 *
 * These assertions are the other half: that `value`, `pixelSize` and
 * `errorCorrection` reach the machine, which is where `@zag-js/qr-code` runs
 * `uqr` over them. That matters more in Vue than anywhere else, because Ark Vue
 * names the encoded string `modelValue`: a facade that forwarded `value` would
 * render a perfectly well-formed code for the wrong string, with nothing
 * anywhere to say so.
 */
// The whole tag first, then the attribute out of it: Vue and React order the
// two differently — `d` comes before `data-part` in one and after it in the
// other — and a single expression spanning both would only match one of them.
const patternOf = (html: string) => {
  const tag = /<path[^>]*data-part="pattern"[^>]*>/.exec(html)?.[0] ?? "";
  return /\sd="([^"]*)"/.exec(tag)?.[1] ?? "";
};
const render = (props: Record<string, unknown>) => renderToString(createSSRApp(QRCode, props));

describe("QRCode", () => {
  it("encodes the value into the pattern", async () => {
    const html = await render({ value: "https://ui-organized.dev" });
    // A module is `M<x>,<y>h<n>v<n>h-<n>z`; an empty or absent `d` means the
    // machine never saw the value.
    expect(patternOf(html)).toMatch(/^M\d+,\d+h/);
  });

  it("encodes a different value differently", async () => {
    expect(patternOf(await render({ value: "one" }))).not.toBe(
      patternOf(await render({ value: "two" })),
    );
  });

  it("scales the code by pixelSize", async () => {
    const html = await render({ value: "hi", pixelSize: 7 });
    // The machine publishes the module size and the resulting edge length; both
    // are multiples of the one prop, so a dropped `pixelSize` shows up as the
    // default 10 rather than as a missing attribute.
    expect(html).toContain("--qrcode-pixel-size:7px");
    expect(patternOf(html)).toContain("h7v7h-7z");
  });

  it("passes the error-correction level through to the encoder", async () => {
    const low = patternOf(await render({ value: "same string", errorCorrection: "L" }));
    const high = patternOf(await render({ value: "same string", errorCorrection: "H" }));
    // Higher correction means more redundancy, which means a larger grid for
    // the same string. Comparing sizes rather than exact paths keeps this
    // assertion about *our* prop reaching the machine rather than about the
    // encoder's output, which is not ours to pin.
    expect(high.length).toBeGreaterThan(low.length);
  });

  it("labels the code with its value unless a label is given", async () => {
    expect(await render({ value: "https://example.com" })).toContain(
      'aria-label="https://example.com"',
    );
    expect(await render({ value: "https://example.com", label: "Ticket" })).toContain(
      'aria-label="Ticket"',
    );
  });
});
