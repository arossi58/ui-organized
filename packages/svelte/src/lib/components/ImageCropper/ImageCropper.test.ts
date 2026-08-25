import { describe, it, expect, beforeAll } from "vitest";
import { render } from "@testing-library/svelte";
import ImageCropper from "./ImageCropper.svelte";

/**
 * jsdom ships no `ResizeObserver`, and the machine watches the viewport with one
 * the moment it mounts — without this every case below dies in an effect rather
 * than on its assertion. The stub observes nothing on purpose: a jsdom element
 * has no box to report, which is exactly why the crop rect is untestable here.
 */
beforeAll(() => {
  if ("ResizeObserver" in globalThis) return;
  (globalThis as Record<string, unknown>).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

/**
 * The half of ImageCropper the parity gate cannot see.
 *
 * Every geometry the machine computes — the crop rect, the image transform, each
 * handle's placement — is written as an inline style, and `style` is not part of
 * the contract. So the gate proves the parts and their state attributes match
 * across the four libraries and says nothing about whether `zoom` reached the
 * machine at all.
 *
 * What is *not* covered anywhere yet: the crop rect. It is measured from the
 * loaded image and the viewport's box, both of which are zero in jsdom, so
 * `initialCrop`, `aspectRatio` and the zoom bounds have no observable effect
 * until a real layout exists. Moving and resizing the box is pointer work.
 * Both belong to the Playwright harness, which does not cover this component
 * yet.
 */
describe("ImageCropper", () => {
  const styleOf = (container: HTMLElement) =>
    container.querySelector('[data-part="root"]')!.getAttribute("style") ?? "";

  it("passes the zoom through to the machine", () => {
    const { container } = render(ImageCropper, { props: { src: "/a.png", zoom: 2 } });
    // Whitespace-tolerant: the SSR renderer writes `--image-zoom:2` and the
    // client one re-serialises it as `--image-zoom: 2`.
    expect(styleOf(container)).toMatch(/--image-zoom:\s*2\b/);
  });

  it("passes the uncontrolled zoom through to the machine", () => {
    const { container } = render(ImageCropper, { props: { src: "/a.png", defaultZoom: 3 } });
    expect(styleOf(container)).toMatch(/--image-zoom:\s*3\b/);
  });

  it("puts the crop shape on the root and the selection", () => {
    const { container } = render(ImageCropper, { props: { src: "/a.png", cropShape: "circle" } });
    expect(container.querySelector('[data-part="root"]')!.getAttribute("data-shape")).toBe("circle");
    expect(container.querySelector('[data-part="selection"]')!.getAttribute("data-shape")).toBe(
      "circle",
    );
  });

  it("disables the selection, the viewport and every handle when the crop is fixed", () => {
    const { container } = render(ImageCropper, { props: { src: "/a.png", fixedCropArea: true } });
    expect(container.querySelector('[data-part="root"]')!.hasAttribute("data-fixed")).toBe(true);
    expect(container.querySelector('[data-part="viewport"]')!.hasAttribute("data-disabled")).toBe(
      true,
    );
    const handles = [...container.querySelectorAll('[data-part="handle"]')];
    expect(handles).toHaveLength(8);
    expect(handles.every((h) => h.hasAttribute("data-disabled"))).toBe(true);
  });

  it("renders the image the caller asked for", () => {
    const { container } = render(ImageCropper, {
      props: { src: "/photo.png", alt: "A photograph" },
    });
    const image = container.querySelector('[data-part="image"]')!;
    expect(image.getAttribute("src")).toBe("/photo.png");
    expect(image.getAttribute("alt")).toBe("A photograph");
  });
});
