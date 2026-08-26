/**
 * The crop box's arithmetic, ported from `@zag-js/image-cropper` 1.41.2.
 *
 * ── Why it is a port rather than an invention ───────────────────────────────
 *
 * Everything a caller can see about an ImageCropper is a *number*: the crop
 * rectangle reaches the DOM as `--crop-x`/`--crop-y`/`--crop-width`/
 * `--crop-height`, and it reaches assistive technology as `aria-valuenow`,
 * `aria-valuemax` and an `aria-valuetext` that reads the rectangle out loud.
 * The parity gate compares those aria attributes, so "a sensible crop box" is
 * not good enough — Angular has to arrive at the *same* rectangle React does,
 * to the pixel, from the same viewport.
 *
 * There is no way to get there by re-deriving it. The rules are not a formula
 * but a sequence of clamps applied in a particular order, and the order is
 * load-bearing: a crop is fitted to the viewport, then to the min/max size,
 * then to the aspect ratio, then re-clamped into the viewport, and doing the
 * last two the other way round produces a box that is a few pixels different
 * and reads differently. So this is a transcription, function for function,
 * with zag's names kept so the two can be diffed when it is next upgraded.
 *
 * It is checked rather than trusted: `crop-geometry.spec.ts` holds crop
 * rectangles captured from a **running** `@ark-ui/react` ImageCropper in
 * Chromium — the viewport it measured and the rectangle it settled on — and
 * asserts this file reproduces them.
 *
 * ── What is deliberately left out ───────────────────────────────────────────
 *
 * Rotation, flipping, pinch-zoom and the offset panning maths. The library's
 * public `ImageCropper` exposes none of them (no `rotation`, `flip` or
 * `onRotationChange` prop in any of the four packages), so the machine's values
 * are fixed at `0` and `false` and every path through `clampOffset` and
 * `computeAABB` is unreachable. Porting dead code would be four hundred lines
 * nothing could ever check.
 */

export interface Size {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Rect extends Point, Size {}

/** How much of the viewport a crop fills when nothing else decides. zag's. */
export const DEFAULT_VIEWPORT_FILL = 0.8;

/** Two aspect ratios closer than this are the same one. zag's tolerance. */
const ASPECT_RATIO_TOLERANCE = 1e-3;

const { min, max, abs, round } = Math;

const clamp = (value: number, low: number, high: number) => min(max(value, low), high);

export const isVisibleRect = (rect: Size) => rect.width > 0 && rect.height > 0;

export const roundRect = (rect: Rect): Rect => ({
  x: round(rect.x),
  y: round(rect.y),
  width: round(rect.width),
  height: round(rect.height),
});

export const clampPoint = (point: Point, low: Point, high: Point): Point => ({
  x: clamp(point.x, low.x, high.x),
  y: clamp(point.y, low.y, high.y),
});

export const getCenterPoint = (rect: Rect): Point => ({
  x: rect.x + rect.width / 2,
  y: rect.y + rect.height / 2,
});

/** How far a crop of this size may be moved before it leaves the viewport. */
export const getMaxBounds = (crop: Size, viewport: Size): Point => ({
  x: max(0, viewport.width - crop.width),
  y: max(0, viewport.height - crop.height),
});

export const centerRect = (size: Size, viewport: Size): Point => ({
  x: max(0, (viewport.width - size.width) / 2),
  y: max(0, (viewport.height - size.height) / 2),
});

export const centerCropOnPoint = (crop: Size, center: Point, viewport: Size): Point =>
  clampPoint(
    { x: center.x - crop.width / 2, y: center.y - crop.height / 2 },
    { x: 0, y: 0 },
    getMaxBounds(crop, viewport),
  );

/** A circular crop is a square one that the stylesheet rounds off. */
export const resolveCropAspectRatio = (
  shape: "rectangle" | "circle",
  aspectRatio: number | undefined,
): number | undefined => (shape === "circle" ? 1 : aspectRatio);

const isLeftHandle = (v: HandlePosition) => v === "w" || v === "nw" || v === "sw";
const isRightHandle = (v: HandlePosition) => v === "e" || v === "ne" || v === "se";
const isTopHandle = (v: HandlePosition) => v === "n" || v === "nw" || v === "ne";
const isBottomHandle = (v: HandlePosition) => v === "s" || v === "sw" || v === "se";
const isCornerHandle = (v: HandlePosition) =>
  (isLeftHandle(v) || isRightHandle(v)) && (isTopHandle(v) || isBottomHandle(v));
const isHorizontalEdgeHandle = (v: HandlePosition) =>
  (isLeftHandle(v) || isRightHandle(v)) && !(isTopHandle(v) || isBottomHandle(v));
const isVerticalEdgeHandle = (v: HandlePosition) =>
  (isTopHandle(v) || isBottomHandle(v)) && !(isLeftHandle(v) || isRightHandle(v));

export type HandlePosition = "n" | "e" | "s" | "w" | "ne" | "se" | "sw" | "nw";

/** Every corner and edge, in the order zag names them. */
export const CROP_HANDLES: readonly HandlePosition[] = [
  "nw",
  "n",
  "ne",
  "e",
  "se",
  "s",
  "sw",
  "w",
];

const hasAspectRatio = (value: number | undefined): value is number =>
  typeof value === "number" && value > 0;

interface SizeLimits {
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  hasAspect: boolean;
}

interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/**
 * The size a crop is allowed to be, in this viewport, at this aspect ratio.
 *
 * The viewport is a hard ceiling on both axes — a crop bigger than what it is
 * cropping is meaningless — and with an aspect ratio the two axes constrain each
 * other, so the pass below runs twice: once to fit the width and once to check
 * the height that implies.
 */
export function resolveSizeLimits(options: {
  minSize: Size;
  maxSize: Size;
  viewportSize: Size;
  aspectRatio?: number;
}): SizeLimits {
  const { minSize, maxSize, viewportSize, aspectRatio } = options;
  let minWidth = min(minSize.width, viewportSize.width);
  let minHeight = min(minSize.height, viewportSize.height);

  let maxWidth = maxSize?.width ?? viewportSize.width;
  if (!Number.isFinite(maxWidth)) maxWidth = viewportSize.width;
  maxWidth = min(maxWidth, viewportSize.width);
  let maxHeight = maxSize?.height ?? viewportSize.height;
  if (!Number.isFinite(maxHeight)) maxHeight = viewportSize.height;
  maxHeight = min(maxHeight, viewportSize.height);
  maxWidth = max(minWidth, maxWidth);
  maxHeight = max(minHeight, maxHeight);

  const hasAspect = hasAspectRatio(aspectRatio);
  if (hasAspect) {
    const minWidthWithAspect = max(minWidth, minHeight * aspectRatio);
    const minHeightWithAspect = minWidthWithAspect / aspectRatio;
    minWidth = min(minWidthWithAspect, viewportSize.width);
    minHeight = min(minHeightWithAspect, viewportSize.height);
    let constrainedMaxWidth = min(maxWidth, maxHeight * aspectRatio, viewportSize.width);
    let constrainedMaxHeight = constrainedMaxWidth / aspectRatio;
    if (constrainedMaxHeight > maxHeight || constrainedMaxHeight > viewportSize.height) {
      constrainedMaxHeight = min(maxHeight, viewportSize.height);
      constrainedMaxWidth = constrainedMaxHeight * aspectRatio;
    }
    maxWidth = max(minWidth, min(constrainedMaxWidth, viewportSize.width));
    maxHeight = max(minHeight, min(constrainedMaxHeight, viewportSize.height));
  } else {
    maxWidth = max(minWidth, min(maxWidth, viewportSize.width));
    maxHeight = max(minHeight, min(maxHeight, viewportSize.height));
  }
  return { minWidth, minHeight, maxWidth, maxHeight, hasAspect };
}

/**
 * Fit a width and a height to the aspect ratio and the limits, both ways round,
 * and keep whichever moved less.
 *
 * The two-way trial is zag's, and it is what stops a crop from collapsing: fixing
 * the width can drive the height under its minimum, fixing the height can drive
 * the width over the viewport, and only one of the two will be legal at the
 * extremes.
 */
function clampAspectSize(params: {
  widthValue: number;
  heightValue: number;
  limits: SizeLimits;
  viewportRect: Size;
  aspectRatio: number;
}): Size {
  const { widthValue, heightValue, limits, viewportRect, aspectRatio } = params;
  const { minWidth, minHeight, maxWidth, maxHeight } = limits;

  const constrainWidthFromHeight = (height: number): Size => {
    let width = clamp(height * aspectRatio, minWidth, maxWidth);
    width = min(width, viewportRect.width);
    return { width, height: width / aspectRatio };
  };

  const clampByWidth = (value: number): Size => {
    let width = clamp(value, minWidth, maxWidth);
    width = min(width, viewportRect.width);
    let height = width / aspectRatio;
    if (height < minHeight) ({ width, height } = constrainWidthFromHeight(minHeight));
    if (height > maxHeight) {
      ({ width, height } = constrainWidthFromHeight(min(maxHeight, viewportRect.height)));
    }
    if (height > viewportRect.height) {
      ({ width, height } = constrainWidthFromHeight(viewportRect.height));
      if (height < minHeight) ({ width, height } = constrainWidthFromHeight(minHeight));
    }
    return { width, height };
  };

  const clampByHeight = (value: number): Size => {
    let height = clamp(value, minHeight, maxHeight);
    height = min(height, viewportRect.height);
    let width = height * aspectRatio;
    width = clamp(width, minWidth, maxWidth);
    width = min(width, viewportRect.width);
    let adjustedHeight = width / aspectRatio;
    if (adjustedHeight < minHeight) {
      ({ width, height: adjustedHeight } = constrainWidthFromHeight(minHeight));
    }
    if (adjustedHeight > maxHeight) {
      ({ width, height: adjustedHeight } = constrainWidthFromHeight(
        min(maxHeight, viewportRect.height),
      ));
    }
    if (width > viewportRect.width) {
      width = viewportRect.width;
      adjustedHeight = width / aspectRatio;
      if (adjustedHeight > maxHeight) {
        ({ width, height: adjustedHeight } = constrainWidthFromHeight(
          min(maxHeight, viewportRect.height),
        ));
      }
      if (adjustedHeight < minHeight) {
        ({ width, height: adjustedHeight } = constrainWidthFromHeight(minHeight));
      }
    }
    return { width, height: adjustedHeight };
  };

  const byWidth = clampByWidth(widthValue);
  const byHeight = clampByHeight(heightValue);
  const deltaWidth = abs(byWidth.width - widthValue) + abs(byWidth.height - heightValue);
  const deltaHeight = abs(byHeight.width - widthValue) + abs(byHeight.height - heightValue);
  return deltaHeight < deltaWidth ? byHeight : byWidth;
}

/** Move only the edges the dragged handle owns. */
function applyDeltaToEdges(params: {
  bounds: Bounds;
  delta: Point;
  handlePosition: HandlePosition;
  viewportRect: Size;
  minSize: Size;
  maxSize: Size;
}): Bounds {
  const { bounds, delta, handlePosition, viewportRect, minSize, maxSize } = params;
  let { left, top, right, bottom } = bounds;
  if (isLeftHandle(handlePosition)) {
    left = clamp(left + delta.x, max(0, right - maxSize.width), right - minSize.width);
  }
  if (isRightHandle(handlePosition)) {
    right = clamp(
      right + delta.x,
      left + minSize.width,
      min(viewportRect.width, left + maxSize.width),
    );
  }
  if (isTopHandle(handlePosition)) {
    top = clamp(top + delta.y, max(0, bottom - maxSize.height), bottom - minSize.height);
  }
  if (isBottomHandle(handlePosition)) {
    bottom = clamp(
      bottom + delta.y,
      top + minSize.height,
      min(viewportRect.height, top + maxSize.height),
    );
  }
  return { left, top, right, bottom };
}

/** Dragging a left or right edge with a locked ratio grows the box about its middle. */
function applyAspectToHorizontalResize(params: {
  bounds: Bounds;
  limits: SizeLimits;
  viewportRect: Size;
  aspectRatio: number;
  handlePosition: HandlePosition;
}): Bounds {
  const { bounds, limits, viewportRect, aspectRatio, handlePosition } = params;
  const { left, top, right, bottom } = bounds;
  const centerY = (top + bottom) / 2;
  const constrained = clampAspectSize({
    widthValue: right - left,
    heightValue: (right - left) / aspectRatio,
    limits,
    viewportRect,
    aspectRatio,
  });
  const halfH = constrained.height / 2;
  let newTop = centerY - halfH;
  let newBottom = centerY + halfH;
  if (newTop < 0) {
    newTop = 0;
    newBottom = constrained.height;
  }
  if (newBottom > viewportRect.height) {
    newBottom = viewportRect.height;
    newTop = newBottom - constrained.height;
  }
  return {
    left: isRightHandle(handlePosition) ? left : right - constrained.width,
    top: newTop,
    right: isRightHandle(handlePosition) ? left + constrained.width : right,
    bottom: newBottom,
  };
}

/** The same, for a top or bottom edge. */
function applyAspectToVerticalResize(params: {
  bounds: Bounds;
  limits: SizeLimits;
  viewportRect: Size;
  aspectRatio: number;
  handlePosition: HandlePosition;
}): Bounds {
  const { bounds, limits, viewportRect, aspectRatio, handlePosition } = params;
  const { left, top, right, bottom } = bounds;
  const centerX = (left + right) / 2;
  const constrained = clampAspectSize({
    widthValue: (bottom - top) * aspectRatio,
    heightValue: bottom - top,
    limits,
    viewportRect,
    aspectRatio,
  });
  const halfW = constrained.width / 2;
  let newLeft = centerX - halfW;
  let newRight = centerX + halfW;
  if (newLeft < 0) {
    newLeft = 0;
    newRight = constrained.width;
  }
  if (newRight > viewportRect.width) {
    newRight = viewportRect.width;
    newLeft = newRight - constrained.width;
  }
  return {
    left: newLeft,
    top: isBottomHandle(handlePosition) ? top : bottom - constrained.height,
    right: newRight,
    bottom: isBottomHandle(handlePosition) ? top + constrained.height : bottom,
  };
}

/** A corner drag pins the opposite corner. */
function applyCornerResize(params: {
  bounds: Bounds;
  width: number;
  height: number;
  handlePosition: HandlePosition;
}): Bounds {
  const { bounds, width, height, handlePosition } = params;
  const { left, top, right, bottom } = bounds;
  if (isRightHandle(handlePosition) && isBottomHandle(handlePosition)) {
    return { left, top, right: left + width, bottom: top + height };
  }
  if (isRightHandle(handlePosition) && isTopHandle(handlePosition)) {
    return { left, top: bottom - height, right: left + width, bottom };
  }
  if (isBottomHandle(handlePosition)) {
    return { left: right - width, top, right, bottom: top + height };
  }
  return { left: right - width, top: bottom - height, right, bottom };
}

/**
 * The whole resize pipeline, and the one function that has to be exact.
 *
 * It is also how a crop is *validated*: `setDefaultCrop` calls it with a zero
 * delta purely to run a candidate rectangle through every clamp. That is why the
 * initial crop, the aspect-ratio adjustment and the viewport-resize path all go
 * through here rather than each fitting the box their own way.
 */
export function computeResizeCrop(options: {
  cropStart: Rect;
  handlePosition: HandlePosition;
  delta: Point;
  viewportRect: Size;
  minSize: Size;
  maxSize: Size;
  aspectRatio?: number;
}): Rect {
  const { cropStart, handlePosition, delta, viewportRect, minSize, maxSize, aspectRatio } = options;
  const limits = resolveSizeLimits({ minSize, maxSize, viewportSize: viewportRect, aspectRatio });
  const { minWidth, minHeight, maxWidth, maxHeight, hasAspect } = limits;

  let { left, top, right, bottom } = applyDeltaToEdges({
    bounds: {
      left: cropStart.x,
      top: cropStart.y,
      right: cropStart.x + cropStart.width,
      bottom: cropStart.y + cropStart.height,
    },
    delta,
    handlePosition,
    viewportRect,
    minSize,
    maxSize,
  });

  if (hasAspect && aspectRatio) {
    if (isCornerHandle(handlePosition)) {
      let tempW = right - left;
      let tempH = tempW / aspectRatio;
      if (
        tempH > bottom - top ||
        top + tempH > viewportRect.height ||
        left + tempW > viewportRect.width
      ) {
        tempH = bottom - top;
        tempW = tempH * aspectRatio;
      }
      const constrained = clampAspectSize({
        widthValue: tempW,
        heightValue: tempH,
        limits,
        viewportRect,
        aspectRatio,
      });
      ({ left, top, right, bottom } = applyCornerResize({
        bounds: { left, top, right, bottom },
        width: constrained.width,
        height: constrained.height,
        handlePosition,
      }));
    } else if (isHorizontalEdgeHandle(handlePosition)) {
      ({ left, top, right, bottom } = applyAspectToHorizontalResize({
        bounds: { left, top, right, bottom },
        limits,
        viewportRect,
        aspectRatio,
        handlePosition,
      }));
    } else if (isVerticalEdgeHandle(handlePosition)) {
      ({ left, top, right, bottom } = applyAspectToVerticalResize({
        bounds: { left, top, right, bottom },
        limits,
        viewportRect,
        aspectRatio,
        handlePosition,
      }));
    }
  }

  // The final fit into the viewport, after the ratio has had its say. Doing this
  // before the aspect branch instead produces a box a few pixels different, and
  // `aria-valuetext` reads it out.
  left = clamp(left, 0, max(0, viewportRect.width - minWidth));
  top = clamp(top, 0, max(0, viewportRect.height - minHeight));
  right = clamp(right, left + minWidth, min(viewportRect.width, left + maxWidth));
  bottom = clamp(bottom, top + minHeight, min(viewportRect.height, top + maxHeight));

  return { x: left, y: top, width: right - left, height: bottom - top };
}

/** Dragging the box itself: the size never changes, only where it sits. */
export function computeMoveCrop(cropStart: Rect, delta: Point, viewportRect: Size): Rect {
  return {
    x: clamp(cropStart.x + delta.x, 0, viewportRect.width - cropStart.width),
    y: clamp(cropStart.y + delta.y, 0, viewportRect.height - cropStart.height),
    width: cropStart.width,
    height: cropStart.height,
  };
}

/** The crop a cropper opens with, before anything has been dragged. */
export function computeDefaultCropDimensions(
  viewportRect: Size,
  aspectRatio: number | undefined,
  fixedCropArea: boolean,
): Size {
  const targetWidth = viewportRect.width * DEFAULT_VIEWPORT_FILL;
  const targetHeight = viewportRect.height * DEFAULT_VIEWPORT_FILL;
  if (hasAspectRatio(aspectRatio)) {
    if (fixedCropArea) {
      let height = viewportRect.height;
      let width = height * aspectRatio;
      if (width > viewportRect.width) {
        width = viewportRect.width;
        height = width / aspectRatio;
      }
      return { width, height };
    }
    const targetAspect = targetWidth / targetHeight;
    if (aspectRatio > targetAspect) {
      const width = targetWidth;
      return { width, height: width / aspectRatio };
    }
    const height = targetHeight;
    return { width: height * aspectRatio, height };
  }
  if (fixedCropArea) {
    const size = min(viewportRect.width, viewportRect.height);
    return { width: size, height: size };
  }
  return { width: targetWidth, height: targetHeight };
}

/**
 * The rectangle a cropper settles on for a given viewport and set of props.
 *
 * zag spreads this across `setDefaultCrop` and `adjustCropAspectRatio`; it is one
 * function here because the two say the same thing and having them apart is what
 * makes the order easy to get wrong.
 */
export function computeInitialCrop(options: {
  viewportRect: Size;
  aspectRatio?: number;
  cropShape: "rectangle" | "circle";
  fixedCropArea: boolean;
  initialCrop?: Rect;
  minSize: Size;
  maxSize: Size;
}): Rect {
  const { viewportRect, cropShape, fixedCropArea, initialCrop, minSize, maxSize } = options;
  const aspectRatio = resolveCropAspectRatio(cropShape, options.aspectRatio);
  const fit = (rect: Rect): Rect =>
    computeResizeCrop({
      cropStart: rect,
      handlePosition: "se",
      delta: { x: 0, y: 0 },
      viewportRect,
      minSize,
      maxSize,
      aspectRatio,
    });

  if (initialCrop) {
    const { width, height } = fit({ x: 0, y: 0, width: initialCrop.width, height: initialCrop.height });
    const bounds = getMaxBounds({ width, height }, viewportRect);
    const { x, y } = clampPoint(initialCrop, { x: 0, y: 0 }, bounds);
    return { x, y, width, height };
  }

  const defaultSize = computeDefaultCropDimensions(viewportRect, aspectRatio, fixedCropArea);
  const { width, height } = fit({ x: 0, y: 0, ...defaultSize });
  const { x, y } = centerRect({ width, height }, viewportRect);
  return { x, y, width, height };
}

/**
 * Re-fit an existing crop after the aspect ratio or shape changed.
 *
 * Keeps the box where it was — centred on the same point — rather than jumping
 * it back to the middle, which is what makes switching from square to 16:9 feel
 * like a change of shape rather than a reset.
 */
export function adjustCropAspectRatio(options: {
  crop: Rect;
  viewportRect: Size;
  aspectRatio?: number;
  cropShape: "rectangle" | "circle";
  minSize: Size;
  maxSize: Size;
}): Rect {
  const { crop, viewportRect, cropShape, minSize, maxSize } = options;
  const aspectRatio = resolveCropAspectRatio(cropShape, options.aspectRatio);
  if (!isVisibleRect(viewportRect) || !isVisibleRect(crop) || aspectRatio === undefined) {
    return crop;
  }
  if (abs(crop.width / crop.height - aspectRatio) < ASPECT_RATIO_TOLERANCE) return crop;
  const constrained = computeResizeCrop({
    cropStart: crop,
    handlePosition: "se",
    delta: { x: 0, y: 0 },
    viewportRect,
    minSize,
    maxSize,
    aspectRatio,
  });
  if (crop.width === constrained.width && crop.height === constrained.height) return crop;
  const position = centerCropOnPoint(constrained, getCenterPoint(crop), viewportRect);
  return { x: position.x, y: position.y, width: constrained.width, height: constrained.height };
}

/** Arrow keys move the box; the modifier decides how far. zag's three steps. */
export function getKeyboardMoveDelta(key: string, step: number): Point {
  switch (key) {
    case "ArrowLeft":
      return { x: -step, y: 0 };
    case "ArrowRight":
      return { x: step, y: 0 };
    case "ArrowUp":
      return { x: 0, y: -step };
    case "ArrowDown":
      return { x: 0, y: step };
    default:
      return { x: 0, y: 0 };
  }
}

const expandLeft = (crop: Rect, step: number, maxWidth: number) => {
  const newX = max(0, crop.x - step);
  const newWidth = crop.width + (crop.x - newX);
  if (newWidth <= maxWidth) return { x: newX, width: newWidth };
  return { x: crop.x + crop.width - maxWidth, width: maxWidth };
};

const expandTop = (crop: Rect, step: number, maxHeight: number) => {
  const newY = max(0, crop.y - step);
  const newHeight = crop.height + (crop.y - newY);
  if (newHeight <= maxHeight) return { y: newY, height: newHeight };
  return { y: crop.y + crop.height - maxHeight, height: maxHeight };
};

const shrinkFromLeft = (crop: Rect, step: number, minWidth: number) => {
  const newX = min(crop.x + step, crop.x + crop.width - minWidth);
  return { x: newX, width: crop.width - (newX - crop.x) };
};

const shrinkFromTop = (crop: Rect, step: number, minHeight: number) => {
  const newY = min(crop.y + step, crop.y + crop.height - minHeight);
  return { y: newY, height: crop.height - (newY - crop.y) };
};

/**
 * Alt+arrow resizes rather than moves, from a nominated handle.
 *
 * Note what this does *not* do: it ignores the aspect ratio. That is zag's —
 * `computeKeyboardCrop` calls `resolveSizeLimits` without one — and it is
 * reproduced rather than corrected, because a keyboard resize that respected the
 * ratio in Angular alone would drift from the other three libraries by a few
 * pixels per keypress and read differently in `aria-valuetext`.
 */
export function computeKeyboardCrop(
  key: string,
  handlePosition: HandlePosition,
  step: number,
  crop: Rect,
  viewportRect: Size,
  minSize: Size,
  maxSize: Size,
): Rect {
  const nextCrop: Rect = { ...crop };
  const { minWidth, minHeight, maxWidth, maxHeight } = resolveSizeLimits({
    minSize,
    maxSize,
    viewportSize: viewportRect,
  });
  const isCorner = isCornerHandle(handlePosition);

  if (key === "ArrowLeft") {
    if (isLeftHandle(handlePosition)) {
      const expanded = expandLeft(crop, step, maxWidth);
      nextCrop.x = expanded.x;
      nextCrop.width = expanded.width;
      if (isCorner && isTopHandle(handlePosition)) {
        const expandedY = expandTop(crop, step, maxHeight);
        nextCrop.y = expandedY.y;
        nextCrop.height = expandedY.height;
      } else if (isCorner && isBottomHandle(handlePosition)) {
        nextCrop.height = min(viewportRect.height - nextCrop.y, min(maxHeight, nextCrop.height + step));
      }
    } else if (isRightHandle(handlePosition)) {
      nextCrop.width = max(minWidth, nextCrop.width - step);
      if (isCorner && isTopHandle(handlePosition)) {
        const shrunk = shrinkFromTop(crop, step, minHeight);
        nextCrop.y = shrunk.y;
        nextCrop.height = shrunk.height;
      } else if (isCorner && isBottomHandle(handlePosition)) {
        nextCrop.height = max(minHeight, nextCrop.height - step);
      }
    }
  } else if (key === "ArrowRight") {
    if (isLeftHandle(handlePosition)) {
      const shrunk = shrinkFromLeft(crop, step, minWidth);
      nextCrop.x = shrunk.x;
      nextCrop.width = shrunk.width;
      if (isCorner && isTopHandle(handlePosition)) {
        const shrunkY = shrinkFromTop(crop, step, minHeight);
        nextCrop.y = shrunkY.y;
        nextCrop.height = shrunkY.height;
      } else if (isCorner && isBottomHandle(handlePosition)) {
        nextCrop.height = max(minHeight, nextCrop.height - step);
      }
    } else if (isRightHandle(handlePosition)) {
      nextCrop.width = min(viewportRect.width - nextCrop.x, min(maxWidth, nextCrop.width + step));
      if (isCorner && isTopHandle(handlePosition)) {
        const expanded = expandTop(crop, step, maxHeight);
        nextCrop.y = expanded.y;
        nextCrop.height = expanded.height;
      } else if (isCorner && isBottomHandle(handlePosition)) {
        nextCrop.height = min(viewportRect.height - nextCrop.y, min(maxHeight, nextCrop.height + step));
      }
    }
  }

  if (key === "ArrowUp") {
    if (isTopHandle(handlePosition)) {
      const expanded = expandTop(crop, step, maxHeight);
      nextCrop.y = expanded.y;
      nextCrop.height = expanded.height;
      if (isCorner && isLeftHandle(handlePosition)) {
        const expandedX = expandLeft(crop, step, maxWidth);
        nextCrop.x = expandedX.x;
        nextCrop.width = expandedX.width;
      } else if (isCorner && isRightHandle(handlePosition)) {
        nextCrop.width = min(viewportRect.width - nextCrop.x, min(maxWidth, nextCrop.width + step));
      }
    } else if (isBottomHandle(handlePosition)) {
      nextCrop.height = max(minHeight, nextCrop.height - step);
      if (isCorner && isLeftHandle(handlePosition)) {
        const shrunk = shrinkFromLeft(crop, step, minWidth);
        nextCrop.x = shrunk.x;
        nextCrop.width = shrunk.width;
      } else if (isCorner && isRightHandle(handlePosition)) {
        nextCrop.width = max(minWidth, nextCrop.width - step);
      }
    }
  } else if (key === "ArrowDown") {
    if (isTopHandle(handlePosition)) {
      const shrunk = shrinkFromTop(crop, step, minHeight);
      nextCrop.y = shrunk.y;
      nextCrop.height = shrunk.height;
      if (isCorner && isLeftHandle(handlePosition)) {
        const shrunkX = shrinkFromLeft(crop, step, minWidth);
        nextCrop.x = shrunkX.x;
        nextCrop.width = shrunkX.width;
      } else if (isCorner && isRightHandle(handlePosition)) {
        nextCrop.width = max(minWidth, nextCrop.width - step);
      }
    } else if (isBottomHandle(handlePosition)) {
      nextCrop.height = min(viewportRect.height - nextCrop.y, min(maxHeight, nextCrop.height + step));
      if (isCorner && isLeftHandle(handlePosition)) {
        const expanded = expandLeft(crop, step, maxWidth);
        nextCrop.x = expanded.x;
        nextCrop.width = expanded.width;
      } else if (isCorner && isRightHandle(handlePosition)) {
        nextCrop.width = min(viewportRect.width - nextCrop.x, min(maxWidth, nextCrop.width + step));
      }
    }
  }

  return nextCrop;
}
