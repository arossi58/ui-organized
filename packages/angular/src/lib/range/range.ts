import {
  AfterViewInit,
  ApplicationRef,
  Component,
  DestroyRef,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from "@angular/core";
import { rangeStyles, type RangeVariants } from "@ui-organized/core";
import { UioPart, stateFlag } from "../part.js";
import { UioFieldContext } from "../field/field-context.js";
import { UioFieldError } from "../field-error/field-error.js";
import { nextMachineId } from "../part-ids.js";
import { flushNow } from "../overlay/flush.js";

export type RangeSize = NonNullable<RangeVariants["size"]>;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** Index of the value in `sorted` (ascending) closest to `target`. */
export function nearestSnapIndex(sorted: readonly number[], target: number): number {
  let best = 0;
  let bestDistance = Infinity;
  for (let index = 0; index < sorted.length; index += 1) {
    const value = sorted[index];
    if (value === undefined) continue;
    const distance = Math.abs(value - target);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  }
  return best;
}

/**
 * Zag's `snapValueToStep`, which is not `Math.round(v / step) * step`.
 *
 * Two things the naive version gets wrong and this does not: a step that does
 * not divide the range evenly leaves a last stop *below* `max`, and floating
 * point turns `0.1 + 0.2` into a value no step ever lands on. Both are why the
 * remainder is taken against `min` and the result re-rounded to the step's own
 * decimal precision.
 */
export function snapToStep(value: number, min: number, max: number, step: number): number {
  const remainder = (value - min) % step;
  let snapped =
    Math.abs(remainder) * 2 >= step
      ? value + Math.sign(remainder) * (step - Math.abs(remainder))
      : value - remainder;
  snapped = roundToStepPrecision(snapped, step);
  if (snapped < min) {
    snapped = min;
  } else if (snapped > max) {
    const stepsInRange = Math.floor((max - min) / step);
    const largest = min + stepsInRange * step;
    snapped = stepsInRange <= 0 || largest < min ? max : largest;
  }
  return roundToStepPrecision(snapped, step);
}

function roundToStepPrecision(value: number, step: number): number {
  const text = step.toString();
  const point = text.indexOf(".");
  const places = point >= 0 ? text.length - point : 0;
  if (places <= 0) return value;
  const scale = Math.pow(10, places);
  return Math.round(value * scale) / scale;
}

/**
 * A labelled slider with one thumb.
 *
 * ```html
 * <div uioRange label="Volume" [(value)]="volume" [min]="0" [max]="100"></div>
 * ```
 *
 * ── Two kinds of snapping, and why one of them is driven by index ───────────
 *
 * `step` snaps at regular intervals between `min` and `max`. `snapValues` snaps
 * to a fixed *set* — `[1, 2, 4, 8]` — and those are not evenly spaced, so the
 * underlying slider is driven by the value's **index** and the bounds become
 * `0..n-1`. That is what makes one arrow press move to the adjacent allowed
 * value rather than 1/7th of the way across a gap, and it is why
 * `aria-valuenow` reports an index while the readout above reports the real
 * number. All four libraries do it this way.
 *
 * ── The root is a Field, and the thumb is what the caption names ────────────
 *
 * The caption is a `field/label` part, not a `slider/label` — this component
 * never renders one — so the thumb's `aria-labelledby` is pointed at the
 * caption by hand. Left to the machine it would name a `slider:…:label` that
 * does not exist, and the thumb would have no accessible name at all. With no
 * caption the attribute is dropped rather than left dangling, which is the
 * failure `OMIT_ARIA` exists to prevent on the React side.
 */
@Component({
  selector: "div[uioRange]",
  standalone: true,
  exportAs: "uioRange",
  providers: [UioFieldContext],
  imports: [UioFieldError],
  template: `
    <div class="range__header">
      @if (label(); as text) {
        <!--
          "for" names the field's control id, which is what Ark's Field.Label
          emits. It resolves to nothing here — the control is a slider thumb
          rather than an input — and it is reproduced because the four libraries
          render the same element. Clicking the caption focuses the thumb, which
          is the behaviour the attribute would otherwise have provided.
        -->
        <label
          class="range__label text-default-body-small"
          data-scope="field"
          data-part="label"
          [id]="field.partId('label')"
          [attr.for]="field.controlId"
          [attr.data-invalid]="flag(invalid())"
          [attr.data-disabled]="flag(disabled())"
          (click)="focusThumb($event)"
          >{{ text }}</label
        >
      }
      @if (!hideValue()) {
        <span class="range__value text-default-body-large">{{ display() }}</span>
      }
    </div>

    <div
      class="range__slider"
      data-scope="slider"
      data-part="root"
      data-orientation="horizontal"
      [id]="sliderId"
      [attr.data-disabled]="flag(disabled())"
      [attr.data-dragging]="flag(dragging())"
      [attr.data-focus]="flag(focused())"
      [style]="rootStyle()"
    >
      <div class="range__row">
        @if (rangeLabels()) {
          <span class="range__range-label range__range-label--start text-default-body-small">{{
            startLabel() ?? resolvedMin()
          }}</span>
        }
        <div
          class="range__control"
          data-scope="slider"
          data-part="control"
          data-orientation="horizontal"
          [id]="sliderPartId('control')"
          [attr.data-disabled]="flag(disabled())"
          [attr.data-dragging]="flag(dragging())"
          [attr.data-focus]="flag(focused())"
          [style.touch-action]="'none'"
          [style.user-select]="'none'"
          [style.position]="'relative'"
          (pointerdown)="onControlPointerDown($event)"
        >
          <div
            class="range__track"
            data-scope="slider"
            data-part="track"
            data-orientation="horizontal"
            [id]="sliderPartId('track')"
            [attr.data-disabled]="flag(disabled())"
            [attr.data-dragging]="flag(dragging())"
            [attr.data-focus]="flag(focused())"
            [style.position]="'relative'"
          >
            <div
              class="range__indicator"
              data-scope="slider"
              data-part="range"
              data-orientation="horizontal"
              [id]="sliderPartId('range')"
              [attr.data-disabled]="flag(disabled())"
              [attr.data-dragging]="flag(dragging())"
              [attr.data-focus]="flag(focused())"
              [style.position]="'absolute'"
              [style.left]="'var(--slider-range-start)'"
              [style.right]="'var(--slider-range-end)'"
            ></div>
            <div
              #thumb
              class="range__thumb"
              data-scope="slider"
              data-part="thumb"
              data-index="0"
              data-orientation="horizontal"
              role="slider"
              draggable="false"
              aria-orientation="horizontal"
              [id]="sliderPartId('thumb:0')"
              [attr.data-disabled]="flag(disabled())"
              [attr.data-dragging]="flag(dragging())"
              [attr.data-focus]="flag(focused())"
              [attr.aria-disabled]="disabled() ? 'true' : null"
              [attr.aria-label]="ariaLabelAttr()"
              [attr.aria-labelledby]="labelledByAttr()"
              [attr.aria-valuemin]="sliderMin()"
              [attr.aria-valuemax]="sliderMax()"
              [attr.aria-valuenow]="sliderValue()"
              [attr.tabindex]="disabled() ? null : 0"
              [style]="thumbStyle()"
              (keydown)="onKeydown($event)"
              (focus)="focused.set(true)"
              (blur)="focused.set(false)"
              (pointerdown)="onThumbPointerDown($event)"
            >
              <input
                type="text"
                hidden
                [id]="sliderPartId('input:0')"
                [attr.name]="name()"
                [value]="sliderValue()"
              />
            </div>
          </div>
        </div>
        @if (rangeLabels()) {
          <span class="range__range-label range__range-label--end text-default-body-small">{{
            endLabel() ?? resolvedMax()
          }}</span>
        }
      </div>
    </div>

    <span uioFieldError [message]="errorMessage()"></span>
  `,
  host: {
    role: "group",
    "[class]": "hostClass()",
    "[id]": "field.rootId",
  },
})
export class UioRange extends UioPart implements AfterViewInit {
  readonly scope = "field";
  readonly part = "root";

  readonly label = input<string | undefined>(undefined);
  /**
   * Uncontrolled until something binds it, which is why there is no separate
   * `defaultValue` — see `UioSwitch`. `undefined` means "start at the minimum",
   * which for a snapping slider is the first allowed value rather than `min`.
   */
  readonly value = model<number | undefined>(undefined);
  readonly min = input(0);
  readonly max = input(100);
  readonly step = input(1);
  /** A fixed set of allowed values. Takes precedence over min/max/step. */
  readonly snapValues = input<readonly number[] | undefined>(undefined);
  readonly rangeLabels = input(false, { transform: booleanAttribute });
  readonly startLabel = input<string | number | undefined>(undefined);
  readonly endLabel = input<string | number | undefined>(undefined);
  readonly size = input<RangeSize>("md");
  /** A string shows a message below the track; `true` marks it invalid without one. */
  readonly error = input<string | boolean | undefined>(undefined);
  override readonly disabled = input(false, { transform: booleanAttribute });
  readonly hideValue = input(false, { transform: booleanAttribute });
  /** Formats the readout above the track. */
  readonly formatValue = input<((value: number) => string) | undefined>(undefined);
  readonly name = input<string | undefined>(undefined);
  /** Accessible name for the thumb when there is no visible caption. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: "aria-label" });

  /**
   * Fired once, when the drag or the keypress ends.
   *
   * The continuous half is `model()`'s own `valueChange`, which fires on every
   * step — there is no second output for it, and adding one would give the same
   * event two names.
   */
  readonly valueCommitted = output<number>();

  protected readonly field = inject(UioFieldContext);
  private readonly appRef = inject(ApplicationRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  private readonly machine = nextMachineId();
  protected readonly sliderId = `slider:${this.machine}`;
  protected sliderPartId(part: string): string {
    return `slider:${this.machine}:${part}`;
  }

  protected readonly flag = stateFlag;
  protected readonly dragging = signal(false);
  protected readonly focused = signal(false);
  /** Measured, because the thumb's own width is half of where it sits. */
  private readonly thumbSize = signal<{ width: number; height: number } | null>(null);

  override readonly invalid = computed(() => !!this.error());
  protected readonly errorMessage = computed(() =>
    typeof this.error() === "string" ? (this.error() as string) : undefined,
  );

  protected readonly hostClass = computed(() => rangeStyles({ size: this.size() }));

  /** Sorted ascending, or `null` when the slider is a plain range. */
  private readonly snapPoints = computed(() => {
    const values = this.snapValues();
    return values && values.length > 0 ? [...values].sort((a, b) => a - b) : null;
  });

  protected readonly resolvedMin = computed(() => this.snapPoints()?.[0] ?? this.min());
  protected readonly resolvedMax = computed(() => {
    const points = this.snapPoints();
    return points ? (points[points.length - 1] ?? this.max()) : this.max();
  });

  /** The value in the caller's units, snapped and clamped. */
  protected readonly current = computed(() => {
    const raw = this.value();
    const points = this.snapPoints();
    if (raw == null) return this.resolvedMin();
    if (points) return points[nearestSnapIndex(points, raw)] ?? this.resolvedMin();
    return clamp(raw, this.min(), this.max());
  });

  /** What the *machine* is driving: an index when snapping, the value otherwise. */
  protected readonly sliderValue = computed(() => {
    const points = this.snapPoints();
    return points ? nearestSnapIndex(points, this.current()) : this.current();
  });
  protected readonly sliderMin = computed(() => (this.snapPoints() ? 0 : this.min()));
  protected readonly sliderMax = computed(() => {
    const points = this.snapPoints();
    return points ? points.length - 1 : this.max();
  });
  private readonly sliderStep = computed(() => (this.snapPoints() ? 1 : this.step()));

  protected readonly display = computed(() => {
    const format = this.formatValue();
    return format ? format(this.current()) : String(this.current());
  });

  /**
   * Exactly one of the two, never both and never a dangling reference.
   *
   * With a caption the thumb points at it; without one it takes the supplied
   * `aria-label`; with neither it carries no name at all rather than an
   * `aria-labelledby` naming an element that was never rendered.
   */
  protected readonly labelledByAttr = computed(() =>
    this.label() ? this.field.partId("label") : null,
  );
  protected readonly ariaLabelAttr = computed(() => (this.label() ? null : (this.ariaLabel() ?? null)));

  private readonly percent = computed(() => {
    const min = this.sliderMin();
    const max = this.sliderMax();
    return max === min ? 0 : (this.sliderValue() - min) / (max - min);
  });

  /**
   * The custom properties the shared stylesheet positions everything from.
   *
   * Zag writes these on the slider root and the CSS reads them, so they are not
   * decoration: without `--slider-range-end` the filled part of the track is the
   * whole track at every value. The thumb offset subtracts half the thumb's own
   * width so the thumb stays *inside* the track at both ends instead of hanging
   * half-way off, which is why it has to be measured rather than assumed.
   */
  protected readonly rootStyle = computed(() => {
    const size = this.thumbSize();
    const percent = this.percent() * 100;
    const offset = size ? Number((-size.width / 2 + this.percent() * size.width).toFixed(2)) : 0;
    return {
      "--slider-thumb-offset-0": `calc(${percent}% - ${offset}px)`,
      "--slider-thumb-transform": "translateX(-50%)",
      "--slider-range-start": "0%",
      "--slider-range-end": `${100 - percent}%`,
      "--slider-thumb-width": size ? `${size.width}px` : "",
      "--slider-thumb-height": size ? `${size.height}px` : "",
    };
  });

  protected readonly thumbStyle = computed(() => ({
    // Hidden until measured: an unmeasured thumb would be painted half a thumb
    // out of place on the first frame and jump once the measurement lands.
    visibility: this.thumbSize() ? "visible" : "hidden",
    position: "absolute",
    transform: "var(--slider-thumb-transform)",
    "inset-inline-start": "var(--slider-thumb-offset-0)",
  }));

  constructor() {
    super();
    this.field.bind({
      invalid: this.invalid,
      disabled: this.disabled,
      required: signal(false),
      readOnly: signal(false),
    });
  }

  ngAfterViewInit(): void {
    const thumb = this.host.nativeElement.querySelector<HTMLElement>('[data-part="thumb"]');
    if (!thumb) return;
    const measure = () =>
      this.thumbSize.set({ width: thumb.offsetWidth, height: thumb.offsetHeight });
    measure();
    // Kept measured, because the thumb's size is a token and a theme swap or a
    // font load changes it after the first frame.
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      measure();
      flushNow(this.appRef);
    });
    observer.observe(thumb);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  // ── Interaction ───────────────────────────────────────────────────────────

  private get interactive(): boolean {
    return !this.disabled();
  }

  protected focusThumb(event: Event): void {
    if (!this.interactive) return;
    event.preventDefault();
    this.host.nativeElement.querySelector<HTMLElement>('[role="slider"]')?.focus();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.interactive) return;
    const multiplier =
      event.ctrlKey || event.metaKey
        ? 0.1
        : event.key === "PageUp" ||
            event.key === "PageDown" ||
            (event.shiftKey && event.key.startsWith("Arrow"))
          ? 10
          : 1;
    const step = multiplier * this.sliderStep();
    const value = this.sliderValue();
    let next: number | null = null;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
      case "PageUp":
        next = value + step;
        break;
      case "ArrowLeft":
      case "ArrowDown":
      case "PageDown":
        next = value - step;
        break;
      case "Home":
        next = this.sliderMin();
        break;
      case "End":
        next = this.sliderMax();
        break;
      default:
        return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.commit(next, true);
  }

  protected onThumbPointerDown(event: PointerEvent): void {
    if (!this.interactive || event.button !== 0) return;
    // Handled here so the control below does not *also* jump the thumb to the
    // press point: a drag that starts on the thumb keeps the value it started
    // with until the pointer moves.
    event.stopPropagation();
    (event.currentTarget as HTMLElement).focus({ preventScroll: true });
    this.beginDrag(event);
  }

  protected onControlPointerDown(event: PointerEvent): void {
    if (!this.interactive || event.button !== 0) return;
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    this.host.nativeElement.querySelector<HTMLElement>('[role="slider"]')?.focus({
      preventScroll: true,
    });
    this.commit(this.valueAtPoint(event.clientX), false);
    this.beginDrag(event);
  }

  /**
   * The drag is followed on the *document*, not on the thumb.
   *
   * A slider is a few pixels tall and a drag leaves it immediately; listening on
   * the element would stop the value moving the moment the pointer strayed
   * vertically. Pointer capture would also work and is not available in every
   * engine this package supports.
   */
  private beginDrag(event: PointerEvent): void {
    this.dragging.set(true);
    const document = (event.target as HTMLElement).ownerDocument;
    const move = (moved: PointerEvent) => this.commit(this.valueAtPoint(moved.clientX), false);
    const stop = () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", stop);
      document.removeEventListener("pointercancel", stop);
      this.dragging.set(false);
      this.valueCommitted.emit(this.current());
      flushNow(this.appRef);
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", stop);
    document.addEventListener("pointercancel", stop);
  }

  private valueAtPoint(clientX: number): number {
    const control = this.host.nativeElement.querySelector<HTMLElement>('[data-part="control"]');
    if (!control) return this.sliderValue();
    const rect = control.getBoundingClientRect();
    if (rect.width <= 0) return this.sliderValue();
    const percent = clamp((clientX - rect.left) / rect.width, 0, 1);
    const min = this.sliderMin();
    const max = this.sliderMax();
    const step = this.sliderStep();
    return clamp(Math.round((percent * (max - min)) / step) * step + min, min, max);
  }

  /** `next` is in *machine* units — an index when snapping. */
  private commit(next: number, ends: boolean): void {
    const min = this.sliderMin();
    const max = this.sliderMax();
    const snapped = clamp(snapToStep(next, min, max, this.sliderStep()), min, max);
    const points = this.snapPoints();
    const published = points ? (points[Math.round(snapped)] ?? this.resolvedMin()) : snapped;
    if (published !== this.current()) {
      this.value.set(published);
    }
    // A keypress is a whole gesture, so the commit fires with it; a drag waits
    // for the pointer to come up.
    if (ends) this.valueCommitted.emit(published);
    flushNow(this.appRef);
  }
}
