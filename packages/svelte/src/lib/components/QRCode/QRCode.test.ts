import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte";
import QRCode from "./QRCode.svelte";

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
 * `uqr` over them. Nothing here re-implements the encoder — an encoder written
 * in this package would be a fourth answer to a question that already has one.
 * What is checked is that the props arrive, by watching the encoder's output
 * change when they do.
 */
describe("QRCode", () => {
  const patternOf = (container: HTMLElement) =>
    container.querySelector('[data-part="pattern"]')!.getAttribute("d") ?? "";

  const styleOf = (container: HTMLElement) =>
    container.querySelector('[data-part="root"]')!.getAttribute("style") ?? "";

  it("encodes the value into the pattern", () => {
    const { container } = render(QRCode, { props: { value: "https://ui-organized.dev" } });
    // A module is `M<x>,<y>h<n>v<n>h-<n>z`; an empty or absent `d` means the
    // machine never saw the value.
    expect(patternOf(container)).toMatch(/^M\d+,\d+h/);
  });

  it("encodes a different value differently", () => {
    const first = render(QRCode, { props: { value: "one" } });
    const second = render(QRCode, { props: { value: "two" } });
    expect(patternOf(first.container)).not.toBe(patternOf(second.container));
  });

  it("scales the code by pixelSize", () => {
    const { container } = render(QRCode, { props: { value: "hi", pixelSize: 7 } });
    // The machine publishes the module size and the resulting edge length; both
    // are multiples of the one prop, so a dropped `pixelSize` shows up as the
    // default 10 rather than as a missing attribute.
    // Whitespace-tolerant: the SSR renderer writes `--qrcode-pixel-size:7px`
    // and the client one re-serialises it as `--qrcode-pixel-size: 7px`.
    expect(styleOf(container)).toMatch(/--qrcode-pixel-size:\s*7px/);
    expect(patternOf(container)).toContain("h7v7h-7z");
  });

  it("passes the error-correction level through to the encoder", () => {
    const low = render(QRCode, { props: { value: "same string", errorCorrection: "L" } });
    const high = render(QRCode, { props: { value: "same string", errorCorrection: "H" } });
    // Higher correction means more redundancy, which means a larger grid for
    // the same string. Comparing sizes rather than exact paths keeps this
    // assertion about *our* prop reaching the machine rather than about the
    // encoder's output, which is not ours to pin.
    expect(patternOf(high.container).length).toBeGreaterThan(patternOf(low.container).length);
  });

  it("labels the code with its value unless a label is given, on the frame", () => {
    // The name is on the frame, not the root: `aria-label` on an element with no
    // role is prohibited and silently ignored, and the img role that makes it
    // legal cannot go on the root because the root also holds the download
    // button. Every library places it the same way; the parity gate holds them
    // to it.
    const { container } = render(QRCode, { props: { value: "https://example.com" } });
    const frame = container.querySelector('[data-part="frame"]')!;
    expect(frame.getAttribute("role")).toBe("img");
    expect(frame.getAttribute("aria-label")).toBe("https://example.com");
    expect(container.querySelector('[data-part="root"]')!.hasAttribute("aria-label")).toBe(false);

    const labelled = render(QRCode, { props: { value: "https://example.com", label: "Ticket" } });
    expect(
      labelled.container.querySelector('[data-part="frame"]')!.getAttribute("aria-label"),
    ).toBe("Ticket");
  });
});
