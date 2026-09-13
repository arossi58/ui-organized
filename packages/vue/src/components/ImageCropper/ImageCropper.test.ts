// @vitest-environment jsdom
//
// The rest of this package's tests render on the server, and these mostly do
// too. jsdom is here for the last case alone, which has to *mount* the
// component: it is the one built by hand out of `useImageCropper` and
// `RootProvider` rather than by `ImageCropper.Root`, and a server render never
// runs the effects or the reactivity graph that construction depends on.
import { describe, it, expect, beforeAll } from "vitest";
import { createApp, createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import ImageCropper from "./ImageCropper.vue";

/**
 * jsdom ships no `ResizeObserver`, and the machine watches the viewport with one
 * the moment it mounts. The stub observes nothing on purpose: a jsdom element
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
 * That the root's props reach the machine at all.
 *
 * This is not a formality here. Ark Vue 5.39's `image-cropper-root` calls
 * `useImageCropper({}, emit)` — an empty object where its own props should go —
 * so every prop it declares is accepted, removed from `$attrs` because it is
 * declared, and then dropped on the floor. The component works around it by
 * building the machine itself and handing it to `RootProvider`; these are the
 * assertions that stop the workaround being quietly reverted, because the
 * symptom otherwise is a circle that renders as a rectangle with nothing
 * anywhere saying so.
 *
 * The `--image-zoom` half is also the part the parity gate cannot see at all:
 * every geometry the machine computes is written as an inline style, and `style`
 * is not part of the contract.
 *
 * What is *not* covered anywhere yet: the crop rect. It is measured from the
 * loaded image and the viewport's box, neither of which exists in a server
 * render, so `initialCrop`, `aspectRatio` and the zoom bounds have no observable
 * effect until a real layout does. Moving and resizing the box is pointer work.
 * Both belong to the Playwright harness, which does not cover this component
 * yet.
 */
const render = (props: Record<string, unknown>) =>
  renderToString(createSSRApp(ImageCropper, props));

describe("ImageCropper", () => {
  it("passes the zoom through to the machine", async () => {
    expect(await render({ src: "/a.png", zoom: 2 })).toContain("--image-zoom:2");
  });

  it("passes the uncontrolled zoom through to the machine", async () => {
    expect(await render({ src: "/a.png", defaultZoom: 3 })).toContain("--image-zoom:3");
  });

  it("puts the crop shape on the root and the selection", async () => {
    const html = await render({ src: "/a.png", cropShape: "circle" });
    expect(html.match(/data-shape="circle"/g) ?? []).toHaveLength(2);
    expect(html).not.toContain('data-shape="rectangle"');
  });

  it("disables the viewport and every handle when the crop is fixed", async () => {
    const html = await render({ src: "/a.png", fixedCropArea: true });
    expect(html).toContain("data-fixed");
    // Eight handles plus the viewport and the selection.
    expect(html.match(/data-disabled/g) ?? []).toHaveLength(10);
  });

  /**
   * `fixedCropArea` is a forwarded boolean, so it declares `undefined` — Vue
   * casts an absent Boolean prop to `false`, which `definedOnly` would then
   * forward as a deliberate choice. It happens to agree with the machine here,
   * which is exactly why this is worth pinning: the day the machine's default
   * changes, an explicit `false` is the difference between a bug and none.
   */
  it("says nothing about a fixed crop area unless asked", async () => {
    const html = await render({ src: "/a.png" });
    expect(html).not.toContain("data-fixed");
    expect(html).not.toContain("data-disabled");
  });

  it("renders the image the caller asked for", async () => {
    const html = await render({ src: "/photo.png", alt: "A photograph" });
    expect(html).toContain('src="/photo.png"');
    expect(html).toContain('alt="A photograph"');
  });

  it("draws the rule-of-thirds guides by default and drops them on request", async () => {
    // `showGrid` defaults to true, which Vue's Boolean cast would turn off.
    expect((await render({ src: "/a.png" })).match(/data-part="grid"/g) ?? []).toHaveLength(2);
    expect(await render({ src: "/a.png", showGrid: false })).not.toContain('data-part="grid"');
  });

  /**
   * The one case that mounts.
   *
   * `useImageCropper` is called here with a `computed` that rebuilds its
   * handlers every evaluation, and its result is handed to `RootProvider` as a
   * prop — a shape no other component in this package uses, and one where a
   * feedback loop between the machine's watcher and that computed would show up
   * as a hang rather than as a wrong attribute. A server render never runs
   * either, so this is the only place it is exercised.
   */
  it("mounts, provides its context to every part, and settles", () => {
    const host = document.createElement("div");
    document.body.append(host);
    const app = createApp(ImageCropper, { src: "/a.png", cropShape: "circle" });
    app.mount(host);

    expect(host.querySelector('[data-part="root"]')!.getAttribute("data-shape")).toBe("circle");
    // Every part below the root reads the machine out of context; one that found
    // none would have thrown on mount rather than rendered.
    expect(host.querySelectorAll('[data-part="handle"]')).toHaveLength(8);
    expect(host.querySelector('[data-part="image"]')!.getAttribute("src")).toBe("/a.png");

    app.unmount();
    host.remove();
  });
});
