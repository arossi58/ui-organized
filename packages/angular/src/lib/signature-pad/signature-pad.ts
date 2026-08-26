import {
  ApplicationRef,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from "@angular/core";
import { signaturePadStyles, type ControlSize, type SignaturePadVariants } from "@ui-organized/core";
import { UioPart, stateFlag } from "../part.js";
import { UioButton } from "../button/button.js";
import { UioFieldError } from "../field-error/field-error.js";
import { nextMachineId } from "../part-ids.js";
import { flushNow } from "../overlay/flush.js";
import {
  SIGNATURE_STROKE_DEFAULTS,
  signatureStroke,
  type SignaturePoint,
} from "./signature-stroke.js";

export type SignaturePadSize = ControlSize;
export type SignaturePadVariant = NonNullable<SignaturePadVariants["variant"]>;

export type SignatureImageType = "image/png" | "image/jpeg" | "image/svg+xml";

/** What `drawEnd` hands back alongside the paths. */
export interface SignatureDrawEnd {
  paths: string[];
  getDataUrl: (type: SignatureImageType, quality?: number) => Promise<string>;
}

/**
 * Rasterise a segment `<svg>`, the way zag's `getDataUrl` does.
 *
 * Reproduced rather than reinvented because the *shape* of the promise is part
 * of the component's API: an empty pad resolves to an empty string rather than
 * to a blank image, a JPEG gets a white ground because JPEG has no alpha, and
 * the canvas is sized in device pixels so a signature is not resampled down on
 * a retina screen. All browser APIs — `XMLSerializer`, `Image`, `canvas` — and
 * no dependency.
 */
export function signatureDataUrl(
  svg: SVGSVGElement,
  options: { type: SignatureImageType; quality?: number; background?: string },
): Promise<string> {
  const { type, quality = 0.92, background } = options;
  const win = svg.ownerDocument.defaultView;
  if (!win) return Promise.resolve("");
  const bounds = svg.getBoundingClientRect();
  const clone = svg.cloneNode(true) as SVGSVGElement;
  // Without a viewBox the clone has no intrinsic size once it leaves the
  // document, and the raster comes out empty.
  if (!clone.hasAttribute("viewBox")) {
    clone.setAttribute("viewBox", `0 0 ${bounds.width} ${bounds.height}`);
  }
  const source =
    '<?xml version="1.0" standalone="no"?>\r\n' + new win.XMLSerializer().serializeToString(clone);
  const svgString = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
  if (type === "image/svg+xml") return Promise.resolve(svgString);

  const ratio = win.devicePixelRatio || 1;
  const canvas = svg.ownerDocument.createElement("canvas");
  canvas.width = bounds.width * ratio;
  canvas.height = bounds.height * ratio;
  const context = canvas.getContext("2d");
  if (type === "image/jpeg" || background) {
    if (context) {
      context.fillStyle = background || "white";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  }
  const image = new win.Image();
  return new Promise<string>((resolve) => {
    image.onload = () => {
      context?.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL(type, quality));
    };
    image.onerror = () => resolve("");
    image.src = svgString;
  });
}

/**
 * A drawing surface that records strokes as SVG paths.
 *
 * ```html
 * <div uioSignaturePad label="Signature" name="sig" [(paths)]="paths"></div>
 * ```
 *
 * ── The ink is this package's own geometry ──────────────────────────────────
 *
 * The other three libraries get their stroke shape from `perfect-freehand`,
 * bundled inside `@zag-js/signature-pad`. This package takes no dependency
 * beyond the CDK, so the outline is written out in `signature-stroke.ts` — a
 * different algorithm in the same family, named and derived there rather than
 * guessed at from screenshots.
 *
 * A signature drawn here will therefore not be pixel-identical to one drawn in
 * the React component, and that is said out loud rather than papered over. What
 * *is* identical is everything the libraries promise each other: one
 * `segment-path` per stroke, the paths the hidden input submits, the parts, the
 * states, and the `<title>` that names the drawing to a screen reader. The `d`
 * attribute is not part of the DOM contract the parity gate compares.
 *
 * ── The odd attributes are zag's ────────────────────────────────────────────
 *
 * `aria-disabled` is written on the control **always**, `"false"` and all, and
 * the control carries `data-disabled` but never `data-invalid` or
 * `data-readonly` — even though `SignaturePad.css` has rules for both. That is a
 * gap between the machine and the stylesheet rather than something this port may
 * fix: emitting the attributes the CSS wants would give Angular an invalid state
 * the other three libraries do not render, and fail the parity gate for being
 * right.
 */
@Component({
  selector: "div[uioSignaturePad]",
  standalone: true,
  exportAs: "uioSignaturePad",
  imports: [UioButton, UioFieldError],
  template: `
    @if (label(); as text) {
      <label
        class="field__label"
        data-scope="signature-pad"
        data-part="label"
        [id]="partId('label')"
        [attr.for]="partId('input')"
        [attr.data-disabled]="flag(disabled())"
        [attr.data-required]="flag(required())"
        (click)="focusControl($event)"
        >{{ text }}@if (required()) {<span class="field__required" aria-hidden="true"></span>}</label
      >
    }

    <div
      class="signature-pad__control"
      data-scope="signature-pad"
      data-part="control"
      role="application"
      aria-roledescription="signature pad"
      aria-label="signature pad"
      [id]="partId('control')"
      [attr.tabindex]="disabled() ? null : 0"
      [attr.aria-disabled]="disabled()"
      [attr.data-disabled]="flag(disabled())"
      [attr.style]="controlStyle"
      (pointerdown)="onPointerDown($event)"
      (pointerup)="onPointerUp($event)"
    >
      <svg
        class="signature-pad__segment"
        data-scope="signature-pad"
        data-part="segment"
        [attr.style]="segmentStyle"
      >
        <!--
          Named for assistive technology, and the text is compared: an svg with
          no accessible name is an unlabelled graphic, and the other three
          libraries put exactly this title here.
        -->
        <title>Signature</title>
        @for (path of drawnPaths(); track $index) {
          <path data-scope="signature-pad" data-part="segment-path" [attr.d]="path"></path>
        }
      </svg>
      @if (showGuide()) {
        <div
          class="signature-pad__guide"
          data-scope="signature-pad"
          data-part="guide"
          [attr.data-disabled]="flag(disabled())"
        ></div>
      }
    </div>

    @if (showClear()) {
      <button
        uioButton
        intent="ghost"
        type="button"
        icon="refresh"
        data-scope="signature-pad"
        data-part="clear-trigger"
        aria-label="clear signature"
        [size]="size()"
        [disabled]="disabled()"
        [attr.hidden]="clearHidden() ? '' : null"
        (click)="clear()"
      >{{ clearLabel() }}</button>
    }

    @if (helperVisible()) {
      <span class="field__description">{{ helperText() }}</span>
    }
    <span uioFieldError [message]="errorMessage()"></span>
    <!--
      The paths, not a raster. They are lossless, resolution independent and
      deterministic; reach for the PNG through "drawEnd", whose details carry
      "getDataUrl". Not a hidden input in the CSS sense — "hidden" is the real
      attribute, which is what the other three render.
    -->
    <input
      type="text"
      hidden
      readonly
      [id]="partId('input')"
      [attr.name]="name()"
      [attr.required]="required() ? '' : null"
      [attr.disabled]="disabled() ? '' : null"
      [value]="paths().join(' ')"
    />
  `,
  host: {
    "[class]": "hostClass()",
    "[id]": "rootId",
    /**
     * The root carries `data-disabled` and nothing else.
     *
     * `UioPart` binds the whole state vocabulary on every part, which is what
     * turns "nobody thought about this state" into a visible omission. Here the
     * machine genuinely emits neither: a read-only or invalid signature pad
     * renders exactly the same root as a valid one, so the two bindings are
     * cleared rather than left to report inputs this component does have. Adding
     * them would give Angular attributes the other three libraries do not, and
     * `SignaturePad.css` would then style an invalid state only one library
     * could ever reach.
     */
    "[attr.data-readonly]": "null",
    "[attr.data-invalid]": "null",
  },
})
export class UioSignaturePad extends UioPart {
  readonly scope = "signature-pad";
  readonly part = "root";

  readonly label = input<string | undefined>(undefined);
  readonly helperText = input<string | undefined>(undefined);
  /** A string shows a message; `true` marks the field invalid without one. */
  readonly error = input<string | boolean | undefined>(undefined);
  /** The strokes, as SVG path data. Uncontrolled until something binds it. */
  readonly paths = model<string[]>([]);
  /** Ink width in device pixels — geometry, not type. */
  readonly strokeWidth = input(SIGNATURE_STROKE_DEFAULTS.size);
  readonly showGuide = input(true, { transform: booleanAttribute });
  readonly showClear = input(true, { transform: booleanAttribute });
  readonly clearLabel = input("Clear");
  readonly size = input<SignaturePadSize>("md");
  readonly variant = input<SignaturePadVariant>("default");
  readonly required = input(false, { transform: booleanAttribute });
  override readonly disabled = input(false, { transform: booleanAttribute });
  override readonly readOnly = input(false, { transform: booleanAttribute });
  readonly name = input<string | undefined>(undefined);

  /** Fires continuously while a stroke is being drawn. */
  readonly draw = output<string[]>();
  /** Fires when a stroke finishes, and when the pad is cleared. */
  readonly drawEnd = output<SignatureDrawEnd>();

  private readonly appRef = inject(ApplicationRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly flag = stateFlag;

  private readonly machine = nextMachineId();
  protected readonly rootId = `signature-pad:${this.machine}`;
  protected partId(part: string): string {
    return `${this.rootId}:${part}`;
  }

  override readonly invalid = computed(() => !!this.error());

  protected readonly errorMessage = computed(() =>
    typeof this.error() === "string" ? (this.error() as string) : undefined,
  );
  protected readonly helperVisible = computed(() => !!this.helperText() && !this.invalid());

  protected readonly hostClass = computed(() =>
    signaturePadStyles({ size: this.size(), variant: this.variant() }),
  );

  private readonly interactive = computed(() => !this.disabled() && !this.readOnly());

  /** The stroke under the pointer, if there is one. */
  private readonly currentPath = signal<string | null>(null);
  private readonly drawing = computed(() => this.currentPath() !== null);

  /**
   * Every finished stroke, plus the one in progress.
   *
   * One `<path>` each — Ark's `Segment` renders the machine's `paths` and
   * appends `currentPath`, so the element count is what a caller sees change and
   * is part of the contract.
   */
  protected readonly drawnPaths = computed(() => {
    const current = this.currentPath();
    return current === null ? this.paths() : [...this.paths(), current];
  });

  /** zag hides the trigger while there is nothing to clear, and mid-stroke. */
  protected readonly clearHidden = computed(() => !this.paths().length || this.drawing());

  /** Written whole, so the custom properties survive a JIT-compiled spec. */
  protected readonly controlStyle =
    "position: relative; touch-action: none; user-select: none; -webkit-user-select: none;";
  protected readonly segmentStyle =
    "position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; pointer-events: none;";

  private points: SignaturePoint[] = [];
  private pointerId: number | null = null;

  private controlEl(): HTMLElement | null {
    return this.host.nativeElement.querySelector<HTMLElement>('[data-part="control"]');
  }

  private segmentEl(): SVGSVGElement | null {
    return this.host.nativeElement.querySelector<SVGSVGElement>('[data-part="segment"]');
  }

  protected focusControl(event: Event): void {
    if (!this.interactive()) return;
    event.preventDefault();
    this.controlEl()?.focus({ preventScroll: true });
  }

  protected onPointerDown(event: PointerEvent): void {
    if (!this.interactive()) return;
    if (event.button !== 0) return;
    // A modified click is the platform's, not the pad's — ⌘-drag is a system
    // gesture on macOS and swallowing it draws a stroke nobody asked for.
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest('[data-part="clear-trigger"]')) return;

    const control = this.controlEl();
    if (!control) return;
    control.setPointerCapture(event.pointerId);
    this.pointerId = event.pointerId;
    this.points = [this.pointFrom(event, control)];
    this.currentPath.set(this.strokeFrom(this.points));

    const document = control.ownerDocument;
    document.addEventListener("pointermove", this.onPointerMove);
    document.addEventListener("pointerup", this.onPointerFinish);
    document.addEventListener("pointercancel", this.onPointerFinish);
    flushNow(this.appRef);
  }

  protected onPointerUp(event: PointerEvent): void {
    const control = this.controlEl();
    if (control?.hasPointerCapture(event.pointerId)) {
      control.releasePointerCapture(event.pointerId);
    }
  }

  /**
   * Followed on the document, not the pad.
   *
   * A signature runs off the edge of the surface constantly, and a listener on
   * the control alone would drop the stroke the moment it did — leaving the pad
   * drawing forever, because the pointer-up would never arrive either.
   */
  private readonly onPointerMove = (event: PointerEvent): void => {
    const control = this.controlEl();
    if (!control || this.pointerId === null) return;
    this.points = [...this.points, this.pointFrom(event, control)];
    this.currentPath.set(this.strokeFrom(this.points));
    this.draw.emit(this.drawnPaths());
    flushNow(this.appRef);
  };

  private readonly onPointerFinish = (): void => {
    const control = this.controlEl();
    const document = control?.ownerDocument ?? this.host.nativeElement.ownerDocument;
    document.removeEventListener("pointermove", this.onPointerMove);
    document.removeEventListener("pointerup", this.onPointerFinish);
    document.removeEventListener("pointercancel", this.onPointerFinish);
    this.pointerId = null;

    const finished = this.currentPath();
    this.points = [];
    this.currentPath.set(null);
    if (finished === null) return;
    this.commit([...this.paths(), finished]);
    this.emitDrawEnd();
    flushNow(this.appRef);
  };

  /** Wipes the pad and reports it, exactly as a finished stroke does. */
  clear(): void {
    this.points = [];
    this.currentPath.set(null);
    this.commit([]);
    this.emitDrawEnd();
    // zag re-focuses whatever was active, which after a click is the trigger
    // that has just been hidden — so focus is put back on the pad instead.
    this.controlEl()?.focus({ preventScroll: true });
    flushNow(this.appRef);
  }

  /** Rasterise the signature. Resolves to `""` when there is nothing drawn. */
  getDataUrl(type: SignatureImageType, quality?: number): Promise<string> {
    if (!this.paths().length) return Promise.resolve("");
    const svg = this.segmentEl();
    if (!svg) return Promise.resolve("");
    return signatureDataUrl(svg, { type, quality });
  }

  private emitDrawEnd(): void {
    this.drawEnd.emit({
      paths: [...this.paths()],
      getDataUrl: (type, quality) => this.getDataUrl(type, quality),
    });
  }

  private commit(paths: string[]): void {
    this.paths.set(paths);
    this.draw.emit(paths);
  }

  private pointFrom(event: PointerEvent, control: HTMLElement): SignaturePoint {
    const box = control.getBoundingClientRect();
    return {
      x: event.clientX - box.left,
      y: event.clientY - box.top,
      pressure: event.pressure,
    };
  }

  private strokeFrom(points: readonly SignaturePoint[]): string {
    return signatureStroke(points, { size: this.strokeWidth() });
  }
}
