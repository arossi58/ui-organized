import { describe, it, expect } from "vitest";
import {
  adjustCropAspectRatio,
  computeDefaultCropDimensions,
  computeInitialCrop,
  computeKeyboardCrop,
  computeMoveCrop,
  computeResizeCrop,
  getKeyboardMoveDelta,
  resolveCropAspectRatio,
  resolveSizeLimits,
  roundRect,
  type Rect,
  type Size,
} from "./crop-geometry.js";

/**
 * Crop rectangles captured from a **running** `@ark-ui/react` ImageCropper in
 * Chromium.
 *
 * Each row is one cropper rendered by the parity harness at a 1280×800 viewport
 * with the library's own stylesheet, read straight off the DOM: the viewport it
 * measured, and the `--crop-x`/`--crop-y`/`--crop-width`/`--crop-height` it
 * settled on.
 *
 * These are the reference values, and they are not a restatement of the
 * implementation — they are what the *other three libraries* put in the DOM, and
 * what `aria-valuenow` and `aria-valuetext` read out. The crop is a sequence of
 * clamps rather than a formula (viewport, then min/max size, then aspect ratio,
 * then the viewport again), and reordering the last two lands a few pixels away:
 * the 16:9 row below comes out at 398.222…px wide, which is not a number any
 * plausible re-derivation reaches by accident.
 *
 * To regenerate: run the parity harness, open
 * `/react.html?component=ImageCropper&props=…`, wait for
 * `[data-part="selection"][data-measured]`, and read the viewport's
 * `getBoundingClientRect()` together with the root's `--crop-x`, `--crop-y`,
 * `--crop-width` and `--crop-height`.
 */
const ZAG_CROPS: {
  name: string;
  viewport: Size;
  props: Partial<{
    aspectRatio: number;
    cropShape: "rectangle" | "circle";
    fixedCropArea: boolean;
    initialCrop: Rect;
  }>;
  crop: Rect;
}[] = [
  {
    name: "default",
    viewport: { width: 1264, height: 280 },
    props: {},
    crop: { x: 126.39999999999998, y: 28, width: 1011.2, height: 224 },
  },
  {
    name: "size/sm",
    viewport: { width: 1264, height: 200 },
    props: {},
    crop: { x: 126.39999999999998, y: 20, width: 1011.2, height: 160 },
  },
  {
    name: "size/lg",
    viewport: { width: 1264, height: 360 },
    props: {},
    crop: { x: 126.39999999999998, y: 36, width: 1011.2, height: 288 },
  },
  // A circle is a square the stylesheet rounds off — the shape resolves to a
  // 1:1 ratio in the machine and nowhere else.
  {
    name: "circle",
    viewport: { width: 1264, height: 280 },
    props: { cropShape: "circle" },
    crop: { x: 520, y: 28, width: 224, height: 224 },
  },
  // Wider than the default 80% box, so the ratio is met by losing width…
  {
    name: "16:9",
    viewport: { width: 1264, height: 280 },
    props: { aspectRatio: 16 / 9 },
    crop: {
      x: 432.8888888888889,
      y: 28.000000000000014,
      width: 398.2222222222222,
      height: 223.99999999999997,
    },
  },
  // …and narrower than it, so the ratio is met by losing height.
  {
    name: "1:1",
    viewport: { width: 1264, height: 280 },
    props: { aspectRatio: 1 },
    crop: { x: 520, y: 28, width: 224, height: 224 },
  },
  {
    name: "1:2",
    viewport: { width: 1264, height: 280 },
    props: { aspectRatio: 0.5 },
    crop: { x: 576, y: 28, width: 112, height: 224 },
  },
  {
    name: "initial crop",
    viewport: { width: 1264, height: 280 },
    props: { initialCrop: { x: 10, y: 10, width: 80, height: 80 } },
    crop: { x: 10, y: 10, width: 80, height: 80 },
  },
  // Under the machine's 40px floor on both axes.
  {
    name: "initial crop under the minimum",
    viewport: { width: 1264, height: 280 },
    props: { initialCrop: { x: 0, y: 0, width: 10, height: 10 } },
    crop: { x: 0, y: 0, width: 40, height: 40 },
  },
  // Bigger than the viewport, and placed outside it.
  {
    name: "initial crop oversized",
    viewport: { width: 1264, height: 280 },
    props: { initialCrop: { x: 5000, y: 5000, width: 5000, height: 5000 } },
    crop: { x: 0, y: 0, width: 1264, height: 280 },
  },
  // `fixedCropArea` fills the viewport rather than 80% of it — a different
  // branch of `computeDefaultCropDimensions` entirely.
  {
    name: "fixed",
    viewport: { width: 1264, height: 280 },
    props: { fixedCropArea: true },
    crop: { x: 492, y: 0, width: 280, height: 280 },
  },
  {
    name: "fixed circle",
    viewport: { width: 1264, height: 280 },
    props: { fixedCropArea: true, cropShape: "circle" },
    crop: { x: 492, y: 0, width: 280, height: 280 },
  },
  {
    name: "fixed 16:9",
    viewport: { width: 1264, height: 280 },
    props: { fixedCropArea: true, aspectRatio: 16 / 9 },
    crop: { x: 383.1111111111111, y: 0, width: 497.77777777777777, height: 280 },
  },
  {
    name: "circle at sm",
    viewport: { width: 1264, height: 200 },
    props: { cropShape: "circle" },
    crop: { x: 552, y: 20, width: 160, height: 160 },
  },
  {
    name: "16:9 at lg",
    viewport: { width: 1264, height: 360 },
    props: { aspectRatio: 16 / 9 },
    crop: { x: 376, y: 36, width: 512, height: 288 },
  },
];

/** zag's, and none of them is a prop the library exposes. */
const MIN_SIZE: Size = { width: 40, height: 40 };
const MAX_SIZE: Size = { width: Number.POSITIVE_INFINITY, height: Number.POSITIVE_INFINITY };

const VIEWPORT: Size = { width: 1264, height: 280 };

describe("computeInitialCrop", () => {
  it("reproduces the rectangles a running zag machine settled on", () => {
    for (const row of ZAG_CROPS) {
      const crop = computeInitialCrop({
        viewportRect: row.viewport,
        aspectRatio: row.props.aspectRatio,
        cropShape: row.props.cropShape ?? "rectangle",
        fixedCropArea: row.props.fixedCropArea ?? false,
        initialCrop: row.props.initialCrop,
        minSize: MIN_SIZE,
        maxSize: MAX_SIZE,
      });
      expect(crop.x, `${row.name} x`).toBeCloseTo(row.crop.x, 9);
      expect(crop.y, `${row.name} y`).toBeCloseTo(row.crop.y, 9);
      expect(crop.width, `${row.name} width`).toBeCloseTo(row.crop.width, 9);
      expect(crop.height, `${row.name} height`).toBeCloseTo(row.crop.height, 9);
    }
  });

  /**
   * The rounded rectangle is what a screen reader hears, so it is asserted as a
   * whole rather than left implied by the floats above — 432.888… has to read
   * as 433 and not as 432.
   */
  it("rounds to the values aria-valuetext reads out", () => {
    const sixteenNine = ZAG_CROPS.find((row) => row.name === "16:9")!;
    expect(roundRect(sixteenNine.crop)).toEqual({ x: 433, y: 28, width: 398, height: 224 });
  });
});

describe("computeDefaultCropDimensions", () => {
  it("fills 80% of the viewport when nothing constrains it", () => {
    expect(computeDefaultCropDimensions(VIEWPORT, undefined, false)).toEqual({
      width: 1011.2,
      height: 224,
    });
  });

  it("fills the viewport's short side when the area is fixed", () => {
    expect(computeDefaultCropDimensions(VIEWPORT, undefined, true)).toEqual({
      width: 280,
      height: 280,
    });
  });

  it("meets a wide ratio by losing height and a narrow one by losing width", () => {
    // 80% of 1264×280 is 1011.2×224, an aspect of 4.514. 16:9 is narrower than
    // that, so the height is what binds; 0.5 is narrower still.
    const wide = computeDefaultCropDimensions(VIEWPORT, 16 / 9, false);
    expect(wide.height).toBeCloseTo(224, 9);
    expect(wide.width / wide.height).toBeCloseTo(16 / 9, 9);
    // A ratio wider than the target box takes the width instead.
    const wider = computeDefaultCropDimensions(VIEWPORT, 8, false);
    expect(wider.width).toBeCloseTo(1011.2, 9);
    expect(wider.width / wider.height).toBeCloseTo(8, 9);
  });
});

describe("resolveCropAspectRatio", () => {
  it("makes a circle square and leaves a rectangle alone", () => {
    expect(resolveCropAspectRatio("circle", undefined)).toBe(1);
    expect(resolveCropAspectRatio("circle", 16 / 9)).toBe(1);
    expect(resolveCropAspectRatio("rectangle", 16 / 9)).toBe(16 / 9);
    expect(resolveCropAspectRatio("rectangle", undefined)).toBe(undefined);
  });
});

describe("resolveSizeLimits", () => {
  it("caps everything at the viewport, however large the maximum", () => {
    const limits = resolveSizeLimits({
      minSize: MIN_SIZE,
      maxSize: MAX_SIZE,
      viewportSize: VIEWPORT,
    });
    expect(limits).toEqual({
      minWidth: 40,
      minHeight: 40,
      maxWidth: 1264,
      maxHeight: 280,
      hasAspect: false,
    });
  });

  it("lets the two axes constrain each other under a ratio", () => {
    const limits = resolveSizeLimits({
      minSize: MIN_SIZE,
      maxSize: MAX_SIZE,
      viewportSize: VIEWPORT,
      aspectRatio: 16 / 9,
    });
    // The height is the binding side in a 1264×280 viewport: 280 × 16/9 = 497.8.
    expect(limits.maxHeight).toBeCloseTo(280, 9);
    expect(limits.maxWidth).toBeCloseTo(497.7777777777778, 9);
    expect(limits.minWidth / limits.minHeight).toBeCloseTo(16 / 9, 9);
  });
});

describe("computeResizeCrop", () => {
  const crop: Rect = { x: 100, y: 40, width: 200, height: 100 };
  const options = { viewportRect: VIEWPORT, minSize: MIN_SIZE, maxSize: MAX_SIZE };

  it("moves only the edges the handle owns", () => {
    expect(
      computeResizeCrop({ ...options, cropStart: crop, handlePosition: "e", delta: { x: 50, y: 0 } }),
    ).toEqual({ x: 100, y: 40, width: 250, height: 100 });
    expect(
      computeResizeCrop({ ...options, cropStart: crop, handlePosition: "w", delta: { x: -50, y: 0 } }),
    ).toEqual({ x: 50, y: 40, width: 250, height: 100 });
  });

  it("never lets a box shrink under the minimum or past the viewport", () => {
    const tiny = computeResizeCrop({
      ...options,
      cropStart: crop,
      handlePosition: "e",
      delta: { x: -1000, y: 0 },
    });
    expect(tiny.width).toBe(40);
    const huge = computeResizeCrop({
      ...options,
      cropStart: crop,
      handlePosition: "e",
      delta: { x: 5000, y: 0 },
    });
    expect(huge.x + huge.width).toBe(VIEWPORT.width);
  });

  it("keeps the ratio when one is set, whichever edge is dragged", () => {
    const resized = computeResizeCrop({
      ...options,
      cropStart: { x: 100, y: 40, width: 160, height: 90 },
      handlePosition: "se",
      delta: { x: 80, y: 0 },
      aspectRatio: 16 / 9,
    });
    expect(resized.width / resized.height).toBeCloseTo(16 / 9, 6);
  });
});

describe("computeMoveCrop", () => {
  it("keeps the size and clamps the position into the viewport", () => {
    const crop: Rect = { x: 100, y: 40, width: 200, height: 100 };
    expect(computeMoveCrop(crop, { x: 20, y: -10 }, VIEWPORT)).toEqual({
      x: 120,
      y: 30,
      width: 200,
      height: 100,
    });
    expect(computeMoveCrop(crop, { x: -500, y: -500 }, VIEWPORT)).toEqual({
      x: 0,
      y: 0,
      width: 200,
      height: 100,
    });
    expect(computeMoveCrop(crop, { x: 5000, y: 5000 }, VIEWPORT)).toEqual({
      x: 1064,
      y: 180,
      width: 200,
      height: 100,
    });
  });
});

describe("getKeyboardMoveDelta", () => {
  it("is the four arrows and nothing else", () => {
    expect(getKeyboardMoveDelta("ArrowLeft", 10)).toEqual({ x: -10, y: 0 });
    expect(getKeyboardMoveDelta("ArrowRight", 10)).toEqual({ x: 10, y: 0 });
    expect(getKeyboardMoveDelta("ArrowUp", 10)).toEqual({ x: 0, y: -10 });
    expect(getKeyboardMoveDelta("ArrowDown", 10)).toEqual({ x: 0, y: 10 });
    expect(getKeyboardMoveDelta("Enter", 10)).toEqual({ x: 0, y: 0 });
  });
});

describe("computeKeyboardCrop", () => {
  const crop: Rect = { x: 100, y: 40, width: 200, height: 100 };

  it("grows and shrinks from the nominated edge", () => {
    expect(
      computeKeyboardCrop("ArrowRight", "e", 10, crop, VIEWPORT, MIN_SIZE, MAX_SIZE).width,
    ).toBe(210);
    expect(
      computeKeyboardCrop("ArrowLeft", "e", 10, crop, VIEWPORT, MIN_SIZE, MAX_SIZE).width,
    ).toBe(190);
    expect(
      computeKeyboardCrop("ArrowDown", "s", 10, crop, VIEWPORT, MIN_SIZE, MAX_SIZE).height,
    ).toBe(110);
    expect(
      computeKeyboardCrop("ArrowUp", "s", 10, crop, VIEWPORT, MIN_SIZE, MAX_SIZE).height,
    ).toBe(90);
  });

  /**
   * zag resolves the size limits here *without* an aspect ratio, so a keyboard
   * resize breaks the lock. Reproduced rather than corrected: a version that
   * respected the ratio in Angular alone would drift from the other three
   * libraries by a few pixels per keypress and read differently in
   * `aria-valuetext`.
   */
  it("stops at the viewport edge rather than running past it", () => {
    const wide = computeKeyboardCrop(
      "ArrowRight",
      "e",
      5000,
      crop,
      VIEWPORT,
      MIN_SIZE,
      MAX_SIZE,
    );
    expect(wide.x + wide.width).toBe(VIEWPORT.width);
  });
});

describe("adjustCropAspectRatio", () => {
  it("leaves a box that already matches alone", () => {
    const square: Rect = { x: 10, y: 10, width: 100, height: 100 };
    expect(
      adjustCropAspectRatio({
        crop: square,
        viewportRect: VIEWPORT,
        aspectRatio: 1,
        cropShape: "rectangle",
        minSize: MIN_SIZE,
        maxSize: MAX_SIZE,
      }),
    ).toBe(square);
  });

  it("re-fits about the box's own centre rather than the viewport's", () => {
    const crop: Rect = { x: 100, y: 40, width: 200, height: 100 };
    const adjusted = adjustCropAspectRatio({
      crop,
      viewportRect: VIEWPORT,
      aspectRatio: 1,
      cropShape: "rectangle",
      minSize: MIN_SIZE,
      maxSize: MAX_SIZE,
    });
    expect(adjusted.width).toBeCloseTo(adjusted.height, 9);
    // The centre stays where it was: 200 across from 100 is 200, 100 down from
    // 40 is 90.
    expect(adjusted.x + adjusted.width / 2).toBeCloseTo(200, 9);
    expect(adjusted.y + adjusted.height / 2).toBeCloseTo(90, 9);
  });

  it("has nothing to do without a viewport", () => {
    const crop: Rect = { x: 0, y: 0, width: 10, height: 10 };
    expect(
      adjustCropAspectRatio({
        crop,
        viewportRect: { width: 0, height: 0 },
        aspectRatio: 1,
        cropShape: "rectangle",
        minSize: MIN_SIZE,
        maxSize: MAX_SIZE,
      }),
    ).toBe(crop);
  });
});
