import {
  ApplicationRef,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from "@angular/core";
import { imageCropperStyles, type ControlSize, type ImageCropperVariants } from "@ui-organized/core";
import { UioPart, stateFlag } from "../part.js";
import { nextMachineId } from "../part-ids.js";
import { flushNow } from "../overlay/flush.js";
import {
  CROP_HANDLES,
  adjustCropAspectRatio,
  computeInitialCrop,
  computeKeyboardCrop,
  computeMoveCrop,
  computeResizeCrop,
  getKeyboardMoveDelta,
  isVisibleRect,
  roundRect,
  type HandlePosition,
  type Rect,
  type Size,
} from "./crop-geometry.js";

export type ImageCropperSize = ControlSize;
export type CropShape = NonNullable<ImageCropperVariants["cropShape"]>;
export type CropRect = Rect;

/** zag's crop bounds, none of which the library exposes as props. */
const MIN_SIZE: Size = { width: 40, height: 40 };
const MAX_SIZE: Size = { width: Number.POSITIVE_INFINITY, height: Number.POSITIVE_INFINITY };

/** zag's nudge ladder: plain, with Shift, with Ctrl or Cmd. */
const NUDGE_STEP = 1;
const NUDGE_STEP_SHIFT = 10;
const NUDGE_STEP_CTRL = 50;

const DEFAULT_MIN_ZOOM = 1;
const DEFAULT_MAX_ZOOM = 5;
const ZOOM_STEP = 0.1;

/** The instructions the selection carries, verbatim from the machine. */
const SELECTION_INSTRUCTIONS =
  "Use arrow keys to move the crop. Hold Alt with arrow keys to resize width or height. " +
  "Press plus or minus to zoom.";

const toPx = (value: number) => `${value}px`;

/** zag's `getHandlePositionStyles`, which places each handle on its own edge. */
const HANDLE_STYLES: Record<HandlePosition, string> = {
  n: "position: absolute; cursor: n-resize; width: 96%; top: 0px; left: 50%; translate: -50% -50%;",
  e: "position: absolute; cursor: e-resize; height: 96%; right: 0px; top: 50%; translate: 50% -50%;",
  s: "position: absolute; cursor: s-resize; width: 96%; bottom: 0px; left: 50%; translate: -50% 50%;",
  w: "position: absolute; cursor: w-resize; height: 96%; left: 0px; top: 50%; translate: -50% -50%;",
  ne: "position: absolute; cursor: ne-resize; top: 0px; right: 0px; translate: 50% -50%;",
  se: "position: absolute; cursor: se-resize; bottom: 0px; right: 0px; translate: 50% 50%;",
  sw: "position: absolute; cursor: sw-resize; bottom: 0px; left: 0px; translate: -50% 50%;",
  nw: "position: absolute; cursor: nw-resize; top: 0px; left: 0px; translate: -50% -50%;",
};

/**
 * A crop box over an image, draggable and resizable.
 *
 * ```html
 * <div uioImageCropper src="/photo.png" [aspectRatio]="1" (cropChange)="crop = $event"></div>
 * ```
 *
 * ── Nothing here is true until the viewport has a width ─────────────────────
 *
 * The crop rectangle is derived from the *laid-out* viewport — 80% of it,
 * centred, then fitted to the aspect ratio and the size bounds — and it reaches
 * assistive technology as `aria-valuenow`, `aria-valuemax` and an
 * `aria-valuetext` that reads the rectangle out in pixels. So the arithmetic has
 * to land on the same numbers React does rather than on a sensible box of its
 * own, which is why `crop-geometry.ts` is a transcription of zag's rather than a
 * re-derivation, and why it is checked against rectangles captured from a
 * running React cropper.
 *
 * Before the measurement lands the crop is zero-sized, `data-measured` is absent
 * and the selection is `visibility: hidden` — the same first frame the other
 * three libraries render, and the reason a browser scenario has to wait for
 * `[data-measured]` before comparing anything.
 *
 * ── `fixedCropArea` disables, it does not remove ────────────────────────────
 *
 * The handles stay in the DOM and take `data-disabled`, so the box keeps its
 * shape and its outline. The selection loses its tab stop and gains
 * `aria-disabled="true"` — which is zag 1.41.2's behaviour, the machine Ark React
 * bundles. Newer zag drops the `aria-disabled` and keeps the tab stop, on the
 * grounds that a fixed crop area is still pannable; Angular follows React here
 * because React is what this library is compared against.
 */
@Component({
  selector: "div[uioImageCropper]",
  standalone: true,
  exportAs: "uioImageCropper",
  template: `
    @if (label(); as text) {
      <span class="field__label">{{ text }}</span>
    }

    <div
      class="image-cropper__viewport"
      data-scope="image-cropper"
      data-part="viewport"
      role="presentation"
      [id]="partId('viewport')"
      [attr.data-ownedby]="rootId"
      [attr.data-disabled]="flag(fixedCropArea())"
      [attr.style]="viewportStyle"
      (pointerdown)="onViewportPointerDown($event)"
    >
      <img
        class="image-cropper__image"
        data-scope="image-cropper"
        data-part="image"
        draggable="false"
        role="presentation"
        aria-hidden="true"
        [id]="partId('image')"
        [attr.alt]="alt()"
        [attr.src]="src()"
        [attr.data-ownedby]="partId('viewport')"
        [attr.data-ready]="flag(imageReady())"
        [attr.style]="imageStyle()"
        (load)="onImageLoad($event)"
      />

      <div
        class="image-cropper__selection"
        data-scope="image-cropper"
        data-part="selection"
        role="slider"
        aria-roledescription="2d slider"
        aria-valuemin="0"
        [id]="partId('selection')"
        [attr.tabindex]="fixedCropArea() ? null : 0"
        [attr.aria-label]="selectionLabel()"
        [attr.aria-disabled]="fixedCropArea() ? 'true' : null"
        [attr.aria-valuemax]="valueMax()"
        [attr.aria-valuenow]="rounded().x"
        [attr.aria-valuetext]="valueText()"
        [attr.aria-description]="SELECTION_INSTRUCTIONS"
        [attr.data-disabled]="flag(fixedCropArea())"
        [attr.data-shape]="cropShape()"
        [attr.data-measured]="flag(measured())"
        [attr.data-dragging]="flag(dragging())"
        [attr.style]="selectionStyle()"
        (pointerdown)="onSelectionPointerDown($event)"
        (keydown)="onSelectionKeydown($event)"
      >
        @if (showGrid()) {
          <div
            class="image-cropper__grid"
            data-scope="image-cropper"
            data-part="grid"
            aria-hidden="true"
            data-axis="horizontal"
            [attr.data-dragging]="flag(dragging())"
            [attr.style]="gridStyle('horizontal')"
          ></div>
          <div
            class="image-cropper__grid"
            data-scope="image-cropper"
            data-part="grid"
            aria-hidden="true"
            data-axis="vertical"
            [attr.data-dragging]="flag(dragging())"
            [attr.style]="gridStyle('vertical')"
          ></div>
        }
        <!--
          Rendered even when the crop area is fixed: zag disables the handles
          rather than removing them, so the box keeps its outline.
        -->
        @for (position of HANDLES; track position) {
          <div
            data-scope="image-cropper"
            data-part="handle"
            aria-hidden="true"
            role="presentation"
            [class]="handleClass(position)"
            [id]="partId('handle:' + position)"
            [attr.data-position]="position"
            [attr.data-disabled]="flag(fixedCropArea())"
            [attr.style]="handleStyle(position)"
            (pointerdown)="onHandlePointerDown($event, position)"
          ></div>
        }
      </div>
    </div>

    @if (helperText(); as text) {
      <span class="field__description">{{ text }}</span>
    }
  `,
  host: {
    "[class]": "hostClass()",
    "[id]": "rootId",
    role: "group",
    "aria-roledescription": "Image cropper",
    "aria-label": "Image cropper",
    "aria-live": "polite",
    "[attr.aria-description]": "description()",
    "[attr.aria-controls]": "controls()",
    "[attr.aria-busy]": "imageReady() ? null : 'true'",
    "[attr.data-fixed]": "flag(fixedCropArea())",
    "[attr.data-shape]": "cropShape()",
    "[attr.data-dragging]": "flag(dragging())",
    "[attr.data-panning]": "flag(panning())",
    "[attr.style]": "rootStyle()",
  },
})
export class UioImageCropper extends UioPart {
  readonly scope = "image-cropper";
  readonly part = "root";

  readonly src = input("");
  readonly alt = input("");
  readonly label = input<string | undefined>(undefined);
  readonly helperText = input<string | undefined>(undefined);
  /** The box the editor opens with. Defaults to the largest centred one. */
  readonly initialCrop = input<CropRect | undefined>(undefined);
  /** Locks the box to a ratio, e.g. `1` for square. */
  readonly aspectRatio = input<number | undefined>(undefined);
  readonly cropShape = input<CropShape>("rectangle");
  readonly cropChange = output<CropRect>();
  /** Uncontrolled until something binds it — see `UioSwitch`. */
  readonly zoom = model(1);
  readonly zoomChange = output<number>();
  readonly minZoom = input<number | undefined>(undefined);
  readonly maxZoom = input<number | undefined>(undefined);
  readonly showGrid = input(true, { transform: booleanAttribute });
  readonly fixedCropArea = input(false, { transform: booleanAttribute });
  readonly size = input<ImageCropperSize>("md");

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly appRef = inject(ApplicationRef);

  protected readonly flag = stateFlag;
  protected readonly HANDLES = CROP_HANDLES;
  protected readonly SELECTION_INSTRUCTIONS = SELECTION_INSTRUCTIONS;

  private readonly machine = nextMachineId();
  protected readonly rootId = `image-cropper:${this.machine}`;
  protected partId(part: string): string {
    return `${this.rootId}:${part}`;
  }

  protected readonly hostClass = computed(() =>
    imageCropperStyles({ size: this.size(), cropShape: this.cropShape() }),
  );

  private readonly viewportRect = signal<Size>({ width: 0, height: 0 });
  private readonly naturalSize = signal<Size>({ width: 0, height: 0 });
  private readonly crop = signal<CropRect>({ x: 0, y: 0, width: 0, height: 0 });
  protected readonly dragging = signal(false);
  protected readonly panning = signal(false);

  protected readonly imageReady = computed(() => isVisibleRect(this.naturalSize()));
  protected readonly measured = computed(
    () => isVisibleRect(this.viewportRect()) && isVisibleRect(this.crop()),
  );
  protected readonly rounded = computed(() => roundRect(this.crop()));

  private readonly resolvedZoom = computed(() =>
    Math.min(
      Math.max(this.zoom(), this.minZoom() ?? DEFAULT_MIN_ZOOM),
      this.maxZoom() ?? DEFAULT_MAX_ZOOM,
    ),
  );

  protected readonly controls = computed(
    () => `${this.partId("viewport")} ${this.partId("selection")}`,
  );

  /**
   * The live region's text, and the only place `zoom` is readable at all.
   *
   * Two branches, both the machine's: an image that has not loaded reports that
   * it is loading, and one that has reports the crop in whole pixels. The zoom
   * is written to two decimal places and the rotation is always zero — the
   * library exposes no rotation prop in any of the four packages.
   */
  protected readonly description = computed(() => {
    if (!this.imageReady()) return "Image cropper preview loading";
    const crop = this.rounded();
    const zoom = this.resolvedZoom();
    const zoomText = Number.isFinite(zoom) ? `${zoom.toFixed(2)}x zoom` : "default zoom";
    return (
      `Image cropper preview, ${zoomText}, 0 degrees rotation. ` +
      `Crop positioned at ${crop.x}px from the left and ${crop.y}px from the top ` +
      `with a size of ${crop.width}px by ${crop.height}px.`
    );
  });

  protected readonly selectionLabel = computed(
    () => `Crop selection area (${this.cropShape() === "circle" ? "circle" : "rectangle"})`,
  );

  protected readonly valueText = computed(() => {
    const { x, y, width, height } = this.rounded();
    return this.cropShape() === "circle"
      ? `Position X ${x}px, Y ${y}px. Diameter ${width}px.`
      : `Position X ${x}px, Y ${y}px. Size ${width}px by ${height}px.`;
  });

  /**
   * How far the box can travel, not how big it is.
   *
   * Before the viewport has been measured there is nothing to subtract from, so
   * the machine falls back to the box's own position — which is zero — rather
   * than to a negative number.
   */
  protected readonly valueMax = computed(() => {
    const viewport = this.viewportRect();
    const crop = this.crop();
    return isVisibleRect(viewport)
      ? Math.max(0, Math.round(viewport.width - crop.width))
      : Math.max(this.rounded().x, 0);
  });

  protected readonly rootStyle = computed(() => {
    const crop = this.crop();
    return (
      `--crop-width: ${toPx(crop.width)}; --crop-height: ${toPx(crop.height)}; ` +
      `--crop-x: ${toPx(crop.x)}; --crop-y: ${toPx(crop.y)}; ` +
      `--image-zoom: ${this.resolvedZoom()}; --image-rotation: 0; ` +
      "--image-offset-x: 0px; --image-offset-y: 0px;"
    );
  });

  protected readonly viewportStyle =
    "position: relative; overflow: hidden; touch-action: none; user-select: none;";

  protected readonly imageStyle = computed(
    () =>
      "pointer-events: none; user-select: none; " +
      `transform: translate(0px, 0px) rotate(0deg) scale(${this.resolvedZoom()}, ${this.resolvedZoom()}); ` +
      "will-change: transform;",
  );

  protected readonly selectionStyle = computed(
    () =>
      "position: absolute; top: var(--crop-y); left: var(--crop-x); " +
      "width: var(--crop-width); height: var(--crop-height); touch-action: none;" +
      (this.measured() ? "" : " visibility: hidden;"),
  );

  protected gridStyle(axis: "horizontal" | "vertical"): string {
    return (
      "position: absolute; " +
      `inset: ${axis === "horizontal" ? "33.33% 0px" : "0px 33.33%"}; ` +
      "pointer-events: none;" +
      (this.measured() ? "" : " visibility: hidden;")
    );
  }

  protected handleClass(position: HandlePosition): string {
    return `image-cropper__handle image-cropper__handle--${position}`;
  }

  protected handleStyle(position: HandlePosition): string {
    return HANDLE_STYLES[position];
  }

  private resize: ResizeObserver | null = null;
  private observed: Element | null = null;

  constructor() {
    super();

    /**
     * Re-fit whenever anything the crop is derived from changes.
     *
     * `afterRenderEffect`, because all of it reads a laid-out viewport. The
     * measurement writes signals, which schedules another pass; the guards in
     * `measureViewport` are what stop it from running for ever.
     */
    afterRenderEffect(() => {
      this.aspectRatio();
      this.cropShape();
      this.fixedCropArea();
      this.initialCrop();
      untracked(() => this.measureViewport());
    });

    inject(DestroyRef).onDestroy(() => this.resize?.disconnect());
  }

  private viewportEl(): HTMLElement | null {
    return this.host.nativeElement.querySelector<HTMLElement>('[data-part="viewport"]');
  }

  private measureViewport(): void {
    const el = this.viewportEl();
    if (!el) return;

    if (typeof ResizeObserver !== "undefined" && this.observed !== el) {
      this.resize?.disconnect();
      this.observed = el;
      // The crop is a pixel rectangle inside the viewport, so a viewport that
      // changes width invalidates it — a window resize as much as a new image.
      this.resize = new ResizeObserver(() => this.measureViewport());
      this.resize.observe(el);
    }

    const box = el.getBoundingClientRect();
    const next: Size = { width: box.width, height: box.height };
    if (!isVisibleRect(next)) return;

    const previous = this.viewportRect();
    const sameViewport = previous.width === next.width && previous.height === next.height;
    if (!sameViewport) this.viewportRect.set(next);

    const crop = this.crop();
    if (!isVisibleRect(crop)) {
      this.setCrop(
        computeInitialCrop({
          viewportRect: next,
          aspectRatio: this.aspectRatio(),
          cropShape: this.cropShape(),
          fixedCropArea: this.fixedCropArea(),
          initialCrop: this.initialCrop(),
          minSize: MIN_SIZE,
          maxSize: MAX_SIZE,
        }),
      );
      return;
    }

    // A ratio the box no longer matches — the caller changed `aspectRatio` or
    // `cropShape` after the fact — re-fits it about its own centre rather than
    // resetting it to the middle of the viewport.
    const adjusted = adjustCropAspectRatio({
      crop,
      viewportRect: next,
      aspectRatio: this.aspectRatio(),
      cropShape: this.cropShape(),
      minSize: MIN_SIZE,
      maxSize: MAX_SIZE,
    });
    if (adjusted !== crop) this.setCrop(adjusted);
  }

  private setCrop(crop: CropRect): void {
    const previous = this.crop();
    if (
      previous.x === crop.x &&
      previous.y === crop.y &&
      previous.width === crop.width &&
      previous.height === crop.height
    ) {
      return;
    }
    this.crop.set(crop);
    this.cropChange.emit(crop);
    flushNow(this.appRef);
  }

  protected onImageLoad(event: Event): void {
    const image = event.currentTarget as HTMLImageElement;
    if (!image.complete) return;
    const size = { width: image.naturalWidth, height: image.naturalHeight };
    if (!isVisibleRect(size)) return;
    this.naturalSize.set(size);
    // A loaded image is the machine's cue to lay the default crop out, which is
    // usually a no-op here because the viewport already had a width.
    this.measureViewport();
    flushNow(this.appRef);
  }

  private origin: { pointer: { x: number; y: number }; crop: CropRect } | null = null;
  private handle: HandlePosition | null = null;

  protected onSelectionPointerDown(event: PointerEvent): void {
    if (this.fixedCropArea()) {
      event.preventDefault();
      return;
    }
    this.startDrag(event, null);
  }

  protected onHandlePointerDown(event: PointerEvent, position: HandlePosition): void {
    if (this.fixedCropArea()) {
      event.preventDefault();
      return;
    }
    // The handle sits on the selection's edge, so its own pointerdown would also
    // start a move. Stopping here is what makes a corner resize rather than drag.
    event.stopPropagation();
    this.startDrag(event, position);
  }

  /**
   * Panning the image under a fixed crop.
   *
   * There is nothing to pan while the image is at zoom 1 — it exactly fills the
   * viewport — so this only ever sets `data-panning`, which is the attribute the
   * other three libraries also set for the same gesture.
   */
  protected onViewportPointerDown(event: PointerEvent): void {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const target = event.target as HTMLElement | null;
    if (!this.fixedCropArea() && target?.closest('[data-part="selection"]')) return;
    if (target?.closest('[data-part="handle"]')) return;
    this.panning.set(true);
    const document = this.host.nativeElement.ownerDocument;
    const stop = () => {
      document.removeEventListener("pointerup", stop);
      document.removeEventListener("pointercancel", stop);
      this.panning.set(false);
      flushNow(this.appRef);
    };
    document.addEventListener("pointerup", stop);
    document.addEventListener("pointercancel", stop);
    flushNow(this.appRef);
  }

  private startDrag(event: PointerEvent, handle: HandlePosition | null): void {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    this.origin = { pointer: { x: event.clientX, y: event.clientY }, crop: this.crop() };
    this.handle = handle;
    this.dragging.set(true);

    // Followed on the document: a crop box is dragged to the edge of its
    // viewport constantly, and a listener on the box alone would drop the
    // gesture the moment the pointer left it.
    const document = this.host.nativeElement.ownerDocument;
    const move = (moved: PointerEvent) => this.onDragMove(moved);
    const stop = () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", stop);
      document.removeEventListener("pointercancel", stop);
      this.origin = null;
      this.handle = null;
      this.dragging.set(false);
      flushNow(this.appRef);
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", stop);
    document.addEventListener("pointercancel", stop);
    flushNow(this.appRef);
  }

  private onDragMove(event: PointerEvent): void {
    const origin = this.origin;
    if (!origin) return;
    const delta = {
      x: event.clientX - origin.pointer.x,
      y: event.clientY - origin.pointer.y,
    };
    const viewportRect = this.viewportRect();
    const handle = this.handle;
    this.setCrop(
      handle
        ? computeResizeCrop({
            cropStart: origin.crop,
            handlePosition: handle,
            delta,
            viewportRect,
            minSize: MIN_SIZE,
            maxSize: MAX_SIZE,
            aspectRatio: this.cropShape() === "circle" ? 1 : this.aspectRatio(),
          })
        : computeMoveCrop(origin.crop, delta, viewportRect),
    );
  }

  protected onSelectionKeydown(event: KeyboardEvent): void {
    if (this.fixedCropArea()) {
      event.preventDefault();
      return;
    }
    if (event.defaultPrevented) return;

    const { key, shiftKey, ctrlKey, metaKey, altKey } = event;
    if (key === "+" || key === "=") {
      event.preventDefault();
      this.zoomBy(ZOOM_STEP);
      return;
    }
    if (key === "-" || key === "_") {
      event.preventDefault();
      this.zoomBy(-ZOOM_STEP);
      return;
    }

    const arrows = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
    if (!arrows.includes(key)) return;
    event.preventDefault();

    const step = ctrlKey || metaKey ? NUDGE_STEP_CTRL : shiftKey ? NUDGE_STEP_SHIFT : NUDGE_STEP;
    const viewportRect = this.viewportRect();
    if (!isVisibleRect(viewportRect)) return;

    if (altKey) {
      // Alt resizes instead of moving, from the south or east edge — zag picks
      // the handle from the axis rather than from where the pointer last was.
      const handle: HandlePosition = key === "ArrowUp" || key === "ArrowDown" ? "s" : "e";
      this.setCrop(
        computeKeyboardCrop(key, handle, step, this.crop(), viewportRect, MIN_SIZE, MAX_SIZE),
      );
    } else {
      this.setCrop(computeMoveCrop(this.crop(), getKeyboardMoveDelta(key, step), viewportRect));
    }
    flushNow(this.appRef);
  }

  /** Step the zoom, clamped into `minZoom`…`maxZoom`. */
  zoomBy(delta: number): void {
    this.setZoom(this.zoom() + delta);
  }

  setZoom(value: number): void {
    const next = Math.min(
      Math.max(value, this.minZoom() ?? DEFAULT_MIN_ZOOM),
      this.maxZoom() ?? DEFAULT_MAX_ZOOM,
    );
    if (next === this.zoom()) return;
    this.zoom.set(next);
    this.zoomChange.emit(next);
    flushNow(this.appRef);
  }
}
