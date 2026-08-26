import { SIZES, type ParityAllowance } from "../../src/cases/spec.js";
import { part, type BrowserScenario, type Step } from "./scenario.js";

const src = "/photo.png";

/**
 * ── What the browser adds that a static render cannot ───────────────────────
 *
 * Everything numeric. The crop box is derived from the *laid-out* viewport —
 * 80% of it, centred, then fitted to the aspect ratio and the size bounds — and
 * it reaches assistive technology as `aria-valuenow`, `aria-valuemax` and an
 * `aria-valuetext` that reads the rectangle out in pixels. On a static render
 * the viewport has no width, so the rect is zero and `data-measured` is absent
 * in every library, which is a real agreement and a shallow one. These cases are
 * where the four libraries have to arrive at the *same rectangle*.
 *
 * That is a much sharper claim than it looks. The crop is not a formula but a
 * sequence of clamps in a particular order — viewport, then min/max size, then
 * aspect ratio, then the viewport again — and swapping the last two produces a
 * box a few pixels different, which `aria-valuetext` reads out loud. Angular has
 * no zag, so its arithmetic is a transcription of the machine's; these cases are
 * what hold it to the transcription being right.
 *
 * The image is deliberately one the harness does not serve. It 404s in every
 * library, which pins the loading half of the contract — `aria-busy="true"`, the
 * "preview loading" description, no `data-ready` — and leaves the crop derived
 * from the viewport alone rather than from an image whose decode timing would
 * differ between runs.
 */
const settled: Step[] = [
  { do: "wait", target: `${part("image-cropper", "selection")}[data-measured]` },
];

/**
 * The one attribute the four libraries cannot agree on, and it is upstream.
 *
 * Held to the same standard as every other allowance: `ImageCropper.css` selects
 * on classes and on `[data-axis]`, never on `[aria-disabled]`, and
 * `[data-disabled]` — which every library still emits on the selection, the
 * viewport and all eight handles — is what carries the state. The assertion in
 * the gate re-checks that against the stylesheet on every run, so the day the CSS
 * starts reading `aria-disabled` this stops being allowed.
 */
const ARIA_DISABLED_SKEW: ParityAllowance = {
  attribute: "aria-disabled",
  reason:
    "zag 1.43.3 — the machine @ark-ui/svelte and @ark-ui/vue bundle — drops " +
    "aria-disabled from the selection under fixedCropArea and gives it a " +
    "tabIndex unconditionally; zag 1.41.2, the one @ark-ui/react bundles, marks " +
    "it disabled and takes it out of the tab order. The wrappers trail and the " +
    "machine leads, so React loses the attribute rather than the other two " +
    "failing to emit it — and the change is deliberate, because a fixed crop " +
    "area is still pannable by keyboard and so is not disabled. Angular follows " +
    "React, which is what it is compared against. Same allowance as the SSR " +
    "gate's; remove both once Ark React ships the newer machine.",
};

const laidOut = (
  name: string,
  props: Record<string, unknown>,
  allow?: ParityAllowance[],
): BrowserScenario => ({
  component: "ImageCropper",
  name,
  props,
  steps: settled,
  regions: ["#mount"],
  ...(allow ? { allow, stylesheets: ["ImageCropper/ImageCropper.css"] } : {}),
});

const scenarios: BrowserScenario[] = [
  laidOut("default", { src }),
  laidOut("with alt", { src, alt: "A photograph" }),
  laidOut("with label", { src, label: "Crop your photo" }),
  laidOut("label and helper", { src, label: "Avatar", helperText: "Square crop" }),
  // A circular crop is a square one the stylesheet rounds off, so the shape
  // reaches three places at once: the root recipe, `data-shape`, and the
  // `aria-label` and `aria-valuetext` that say "circle" and "Diameter".
  laidOut("crop shape/rectangle", { src, cropShape: "rectangle" }),
  laidOut("crop shape/circle", { src, cropShape: "circle" }),
  // 16:9 is wider than the 80% default box, so the ratio is met by shrinking the
  // height; 1:1 is narrower, so it is met by shrinking the width. Both branches
  // of `computeDefaultCropDimensions`, and they land on different rectangles.
  laidOut("aspect ratio", { src, aspectRatio: 16 / 9 }),
  laidOut("square aspect ratio", { src, aspectRatio: 1 }),
  // A crop the caller placed rather than one the machine centred.
  laidOut("initial crop", { src, initialCrop: { x: 10, y: 10, width: 80, height: 80 } }),
  // Smaller than the 40px floor on both axes: the box has to come back out at
  // the minimum rather than at what was asked for.
  laidOut("initial crop under the minimum", {
    src,
    initialCrop: { x: 0, y: 0, width: 10, height: 10 },
  }),
  laidOut("no grid", { src, showGrid: false }),
  // `fixedCropArea` disables the selection and every handle rather than removing
  // them, and changes how the default box is sized — it fills the viewport
  // instead of 80% of it.
  laidOut("fixed crop area", { src, fixedCropArea: true }, [ARIA_DISABLED_SKEW]),
  laidOut("fixed circle", { src, fixedCropArea: true, cropShape: "circle" }, [ARIA_DISABLED_SKEW]),
  laidOut("zoom", { src, zoom: 2 }),
  laidOut("default zoom", { src, defaultZoom: 1.5 }),
  laidOut("zoom bounds", { src, minZoom: 0.5, maxZoom: 6 }),
  ...SIZES.map((size) => laidOut(`size/${size}`, { src, size })),
  laidOut("extra class", { src, className: "custom" }),
  {
    component: "ImageCropper",
    // The component's whole point, and unreachable without a keypress: the box
    // moves by one pixel and says so through `aria-valuenow` and
    // `aria-valuetext`. A library whose nudge arithmetic drifts reports a
    // different number here rather than looking fine and feeling wrong.
    //
    // The click is what focuses the selection — pressed and released in one
    // place, so it starts and ends a drag of zero length and moves nothing.
    name: "nudged with the keyboard",
    props: { src },
    steps: [
      ...settled,
      { do: "click", target: part("image-cropper", "selection") },
      { do: "awaitFocus", target: part("image-cropper", "selection") },
      { do: "press", key: "ArrowRight" },
      { do: "wait", target: `${part("image-cropper", "selection")}[aria-valuenow="127"]` },
    ],
    regions: ["#mount"],
  },
  {
    component: "ImageCropper",
    // Shift multiplies the nudge by ten. Worth its own case because the step
    // ladder is three separate numbers in the machine, and a port that read the
    // wrong modifier passes the plain case.
    name: "nudged a long way",
    props: { src },
    steps: [
      ...settled,
      { do: "click", target: part("image-cropper", "selection") },
      { do: "awaitFocus", target: part("image-cropper", "selection") },
      { do: "press", key: "Shift+ArrowRight" },
      { do: "wait", target: `${part("image-cropper", "selection")}[aria-valuenow="136"]` },
    ],
    regions: ["#mount"],
  },
];

export default scenarios;
