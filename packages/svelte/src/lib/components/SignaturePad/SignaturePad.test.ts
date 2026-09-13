import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { render } from "@testing-library/svelte";
import SignaturePad from "./SignaturePad.svelte";

// The clear trigger is the library Button with an icon, and no icon set is
// registered in a unit test — so `Icon` says so, once, loudly, and irrelevantly
// to anything asserted here.
beforeAll(() => vi.spyOn(console, "warn").mockImplementation(() => {}));
afterAll(() => vi.restoreAllMocks());

/**
 * The half of SignaturePad the parity gate cannot see.
 *
 * Ink is `d` on a `<path>`, and `d` is not a contract attribute — so the gate
 * can prove all four libraries render the same segment element and say nothing
 * about whether a stroke is in it. `defaultPaths` is the only way to reach the
 * drawn state without a pointer: zag seeds `paths` from it in the machine's
 * context, so it is populated on the first render.
 *
 * What is *not* covered anywhere, here or in the gate: drawing itself. The
 * pressure envelope `perfect-freehand` builds, the in-progress `currentPath`,
 * and the canvas raster `getDataUrl` produces all need a real pointer and a
 * real canvas. Those belong to the Playwright harness, which does not cover this
 * component yet.
 *
 * `strokeWidth` is uncovered for a different reason: it reaches the machine as
 * `drawing.size` and only ever changes the *shape* of a stroke that a pointer
 * produced. It leaves no trace in the DOM at all, so there is nothing to assert
 * short of drawing.
 */
describe("SignaturePad", () => {
  const PATHS = ["M 10 40 q 20 -30 40 0", "M 60 20 l 20 20"];

  /**
   * One `Segment`, however many strokes.
   *
   * Ark's `Segment` draws the whole signature: it maps the machine's `paths`
   * itself and appends the in-progress `currentPath`, so it is rendered once and
   * never mapped over. All four libraries used to map it over `api.paths` and
   * hand each copy a `path` prop Ark ignores, which produced N `<svg>` elements
   * each containing all N paths, stacked exactly on top of one another. It
   * looked right — the topmost copy is the correct one — so only the DOM was
   * wrong, which is why porting caught it and no visual check would have.
   *
   * These assertions are the guard against it coming back: the segment count is
   * fixed at one, and the path count tracks the strokes.
   */

  it("draws every committed stroke inside a single segment", () => {
    const { container } = render(SignaturePad, { props: { defaultPaths: PATHS } });
    const paths = [...container.querySelectorAll('[data-part="segment-path"]')];
    expect(container.querySelectorAll('[data-part="segment"]')).toHaveLength(1);
    expect(paths.map((p) => p.getAttribute("d"))).toEqual(PATHS);
  });

  it("renders the segment but no stroke when there is none", () => {
    const { container } = render(SignaturePad, { props: {} });
    expect(container.querySelectorAll('[data-part="segment-path"]')).toHaveLength(0);
    // The segment element is unconditional — it is the canvas the strokes go in.
    expect(container.querySelectorAll('[data-part="segment"]')).toHaveLength(1);
  });

  it("takes controlled paths over the default", () => {
    const { container } = render(SignaturePad, {
      props: { defaultPaths: ["M 0 0 L 1 1"], paths: PATHS },
    });
    const paths = [...container.querySelectorAll('[data-part="segment-path"]')];
    expect(paths.map((p) => p.getAttribute("d"))).toEqual(PATHS);
  });

  it("hides the clear trigger until there is something to clear", () => {
    const empty = render(SignaturePad, { props: {} });
    expect(empty.container.querySelector("button")!.hasAttribute("hidden")).toBe(true);

    const drawn = render(SignaturePad, { props: { defaultPaths: PATHS } });
    expect(drawn.container.querySelector("button")!.hasAttribute("hidden")).toBe(false);
  });

  it("submits the strokes as the hidden input's value", () => {
    const { container } = render(SignaturePad, { props: { defaultPaths: PATHS, name: "sig" } });
    const input = container.querySelector("input")!;
    // The paths, not a rasterised data URL: `getDataUrl` is async and cannot
    // feed a render-time value. See the component.
    expect(input.getAttribute("value") ?? (input as HTMLInputElement).value).toBe(PATHS.join(" "));
    expect(input.getAttribute("name")).toBe("sig");
  });
});
