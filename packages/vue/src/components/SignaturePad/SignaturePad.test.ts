import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import SignaturePad from "./SignaturePad.vue";

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
 * and the canvas raster `getDataUrl` produces all need a real pointer and a real
 * canvas. Those belong to the Playwright harness, which does not cover this
 * component yet.
 *
 * `strokeWidth` is uncovered for a different reason: it reaches the machine as
 * `drawing.size` and only ever changes the *shape* of a stroke that a pointer
 * produced. It leaves no trace in the DOM at all, so there is nothing to assert
 * short of drawing.
 */
const PATHS = ["M 10 40 q 20 -30 40 0", "M 60 20 l 20 20"];

/**
 * One `Segment`, however many strokes.
 *
 * Ark's `Segment` draws the whole signature: it maps the machine's `paths`
 * itself and appends the in-progress `currentPath`, so it is rendered once and
 * never mapped over. All four libraries used to map it over `api.paths` and hand
 * each copy a `path` prop Ark ignores, which produced N `<svg>` elements each
 * containing all N paths, stacked exactly on top of one another. It looked
 * right — the topmost copy is the correct one — so only the DOM was wrong, which
 * is why porting caught it and no visual check would have.
 *
 * These assertions are the guard against it coming back: the segment count is
 * fixed at one, and the path count tracks the strokes.
 */

const render = (props: Record<string, unknown>) =>
  renderToString(createSSRApp(SignaturePad, props));

// The whole tag first, then the attribute out of it: Vue and React order the two
// differently — `d` comes before `data-part` in one and after it in the other —
// and a single expression spanning both would only match one of them.
const pathsIn = (html: string) =>
  [...html.matchAll(/<path[^>]*data-part="segment-path"[^>]*>/g)]
    .map((m) => /\sd="([^"]*)"/.exec(m[0])?.[1] ?? "");

// The clear trigger is the library Button with an icon, and no icon set is
// registered in a unit test — so `Icon` says so, once, loudly, and irrelevantly
// to anything asserted here.
beforeAll(() => vi.spyOn(console, "warn").mockImplementation(() => {}));
afterAll(() => vi.restoreAllMocks());

describe("SignaturePad", () => {
  it("draws every committed stroke inside a single segment", async () => {
    const html = await render({ defaultPaths: PATHS });
    expect(html.match(/data-part="segment"/g) ?? []).toHaveLength(1);
    expect(pathsIn(html)).toEqual(PATHS);
  });

  it("renders the segment but no stroke when there is none", async () => {
    const html = await render({});
    expect(pathsIn(html)).toEqual([]);
    // The segment element is unconditional — it is the canvas the strokes go in.
    expect(html.match(/data-part="segment"/g) ?? []).toHaveLength(1);
  });

  it("takes controlled paths over the default", async () => {
    const html = await render({ defaultPaths: ["M 0 0 L 1 1"], paths: PATHS });
    expect(pathsIn(html)).toEqual(PATHS);
  });

  it("hides the clear trigger until there is something to clear", async () => {
    expect(await render({})).toMatch(/data-part="clear-trigger"[^>]*hidden/);
    expect(await render({ defaultPaths: PATHS })).not.toMatch(
      /data-part="clear-trigger"[^>]*hidden/,
    );
  });

  it("submits the strokes as the hidden input's value", async () => {
    const html = await render({ defaultPaths: PATHS, name: "sig" });
    // The paths, not a rasterised data URL: `getDataUrl` is async and cannot
    // feed a render-time value. See the component.
    expect(html).toContain(`value="${PATHS.join(" ")}"`);
    expect(html).toContain('name="sig"');
  });

  /**
   * Vue casts an absent Boolean prop to `false`, so a forwarded boolean that has
   * no `undefined` default arrives at the machine as a deliberate choice. Here
   * that would mean an uncontrolled pad silently reporting itself enabled,
   * required or writable when the caller said nothing — the same class of bug
   * that pinned five popovers shut. See ../../props.ts.
   */
  it("leaves the machine's own defaults alone when a boolean is not given", async () => {
    const html = await render({ label: "Signature" });
    expect(html).not.toContain("data-disabled");
    expect(html).not.toContain("data-required");
    // Not `readonly`: zag marks the hidden input read-only whatever the pad's
    // own `readOnly` says, because its value is written by the machine and never
    // typed. `aria-disabled` on the control is where an accidental `false` would
    // surface, and it reads "false" rather than being absent even when nothing
    // was passed.
    expect(html).toContain('aria-disabled="false"');
    expect(html).not.toContain("required=");
  });

  it("still forwards a boolean that is given", async () => {
    expect(await render({ label: "Signature", disabled: true })).toContain("data-disabled");
    expect(await render({ label: "Signature", required: true })).toContain("data-required");
  });
});
