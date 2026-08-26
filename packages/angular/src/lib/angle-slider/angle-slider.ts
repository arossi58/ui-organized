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
import { angleSliderStyles, type AngleSliderVariants } from "@ui-organized/core";
import { UioPart, stateFlag } from "../part.js";
import { UioFieldError } from "../field-error/field-error.js";
import { nextMachineId } from "../part-ids.js";
import { flushNow } from "../overlay/flush.js";

export type AngleSliderSize = NonNullable<AngleSliderVariants["size"]>;

/** The dial's fixed bounds. 359, not 360 — 360° *is* 0°. */
export const ANGLE_MIN = 0;
export const ANGLE_MAX = 359;

export const clampAngle = (degree: number) => Math.min(Math.max(degree, ANGLE_MIN), ANGLE_MAX);

/**
 * Snap a dragged angle to the nearest step, with one asymmetry that is zag's
 * and worth keeping: a value that rounds *up* onto 359 wraps to 0 instead, so a
 * dial with `step={1}` passes through the top of the circle rather than sticking
 * one degree short of it.
 */
export function constrainAngle(degree: number, step: number): number {
  const clamped = clampAngle(degree);
  const upper = Math.ceil(clamped / step);
  const nearest = Math.round(clamped / step);
  if (upper < clamped / step) return nearest * step;
  return upper * step === ANGLE_MAX ? ANGLE_MIN : upper * step;
}

/**
 * The angle of `point` around the centre of `rect`, measured clockwise from
 * twelve o'clock. Zag's `getPointAngle`.
 *
 * `atan2(x, y)` rather than the usual `atan2(y, x)`: swapping the arguments
 * rotates the frame so that zero is *up* rather than to the right, which is
 * where a dial's zero is. The `360 - deg` then turns the result clockwise,
 * because screen coordinates run down the page while angles run up it.
 */
export function angleAtPoint(
  rect: { left: number; top: number; width: number; height: number },
  point: { x: number; y: number },
): number {
  const x = point.x - (rect.left + rect.width / 2);
  const y = point.y - (rect.top + rect.height / 2);
  const degrees = Math.atan2(x, y) * (180 / Math.PI) + 180;
  return 360 - degrees;
}

/** Zag's `snapValueToStep` against the dial's own bounds. */
export function snapAngleToStep(value: number, step: number): number {
  const remainder = (value - ANGLE_MIN) % step;
  let snapped =
    Math.abs(remainder) * 2 >= step
      ? value + Math.sign(remainder) * (step - Math.abs(remainder))
      : value - remainder;
  if (snapped < ANGLE_MIN) return ANGLE_MIN;
  if (snapped > ANGLE_MAX) {
    const steps = Math.floor((ANGLE_MAX - ANGLE_MIN) / step);
    return steps <= 0 ? ANGLE_MAX : ANGLE_MIN + steps * step;
  }
  return snapped;
}

/**
 * A circular dial for picking an angle.
 *
 * ```html
 * <div uioAngleSlider label="Rotation" [(value)]="angle" [markers]="[0, 90, 180, 270]"></div>
 * ```
 *
 * ── The readout is a plain div, deliberately ────────────────────────────────
 *
 * Zag's `valueText` part has an id and part attributes, and Ark's React
 * `ValueText` **does not spread them** — it renders a bare `ark.div` whose only
 * job is to hold the text. That is upstream behaviour rather than a choice, and
 * it is reproduced here rather than corrected, because the four libraries have
 * to render the same element. Rendering the part properly would give Angular an
 * id nobody else has and shift every id placeholder after it in the gate.
 *
 * ── The thumb names a label that may not exist ──────────────────────────────
 *
 * `aria-labelledby` always points at `…:label`, whether or not a caption was
 * given — again zag's, again reproduced. Because the label id is built from the
 * root id, the dangling reference normalises to the same placeholder in all four
 * libraries, which is why the *shape* of an id is part of the contract even when
 * the literal is not.
 */
@Component({
  selector: "div[uioAngleSlider]",
  standalone: true,
  exportAs: "uioAngleSlider",
  imports: [UioFieldError],
  template: `
    @if (label() || showValue()) {
      <div class="angle-slider__header">
        @if (label(); as text) {
          <label
            class="field__label"
            data-scope="angle-slider"
            data-part="label"
            [id]="partId('label')"
            [attr.for]="partId('input')"
            [attr.data-disabled]="flag(disabled())"
            [attr.data-invalid]="flag(invalid())"
            [attr.data-readonly]="flag(readOnly())"
            (click)="focusThumb($event)"
            >{{ text }}</label
          >
        }
        @if (showValue()) {
          <div class="angle-slider__value">{{ current() }}°</div>
        }
      </div>
    }

    <div
      class="angle-slider__control"
      data-scope="angle-slider"
      data-part="control"
      role="presentation"
      [id]="partId('control')"
      [attr.data-disabled]="flag(disabled())"
      [attr.data-invalid]="flag(invalid())"
      [attr.data-readonly]="flag(readOnly())"
      [style.touch-action]="'none'"
      [style.user-select]="'none'"
      (pointerdown)="onControlPointerDown($event)"
    >
      @if (markers().length) {
        <div class="angle-slider__markers" data-scope="angle-slider" data-part="marker-group">
          @for (marker of markers(); track $index) {
            <div
              class="angle-slider__marker"
              data-scope="angle-slider"
              data-part="marker"
              [attr.data-value]="marker"
              [attr.data-state]="markerState(marker)"
              [attr.data-disabled]="flag(disabled())"
              [style.--marker-value]="marker"
              [style.--marker-display-value]="marker"
              [style.rotate]="'calc(var(--marker-display-value) * 1deg)'"
            ></div>
          }
        </div>
      }
      <div
        class="angle-slider__thumb"
        data-scope="angle-slider"
        data-part="thumb"
        role="slider"
        aria-valuemax="360"
        aria-valuemin="0"
        [id]="partId('thumb')"
        [attr.aria-labelledby]="partId('label')"
        [attr.aria-valuenow]="current()"
        [attr.tabindex]="thumbTabIndex()"
        [attr.data-disabled]="flag(disabled())"
        [attr.data-invalid]="flag(invalid())"
        [attr.data-readonly]="flag(readOnly())"
        [style.rotate]="'var(--angle)'"
        (keydown)="onKeydown($event)"
      ></div>
    </div>

    @if (helperVisible()) {
      <span class="field__description">{{ helperText() }}</span>
    }
    <span uioFieldError [message]="errorMessage()"></span>
    <input type="hidden" [id]="partId('input')" [attr.name]="name()" [value]="current()" />
  `,
  host: {
    "[class]": "hostClass()",
    "[id]": "rootId",
    "[style.--value]": "current()",
    "[style.--angle]": "current() + 'deg'",
  },
})
export class UioAngleSlider extends UioPart {
  readonly scope = "angle-slider";
  readonly part = "root";

  readonly label = input<string | undefined>(undefined);
  readonly helperText = input<string | undefined>(undefined);
  /** A string shows a message; `true` marks the dial invalid without one. */
  readonly error = input<string | boolean | undefined>(undefined);
  /** Uncontrolled until something binds it — see `UioSwitch`. */
  readonly value = model(0);
  readonly step = input(1);
  readonly markers = input<readonly number[]>([]);
  readonly showValue = input(false, { transform: booleanAttribute });
  readonly size = input<AngleSliderSize>("md");
  override readonly disabled = input(false, { transform: booleanAttribute });
  override readonly readOnly = input(false, { transform: booleanAttribute });
  readonly name = input<string | undefined>(undefined);

  /** Fired once, when the drag or the keypress ends. */
  readonly valueChangeEnd = output<number>();

  private readonly machine = nextMachineId();
  protected readonly rootId = `angle-slider:${this.machine}`;
  protected partId(part: string): string {
    return `${this.rootId}:${part}`;
  }

  private readonly appRef = inject(ApplicationRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly flag = stateFlag;
  private readonly dragging = signal(false);

  override readonly invalid = computed(() => !!this.error());
  protected readonly errorMessage = computed(() =>
    typeof this.error() === "string" ? (this.error() as string) : undefined,
  );
  protected readonly helperVisible = computed(() => !!this.helperText() && !this.invalid());

  protected readonly hostClass = computed(() => angleSliderStyles({ size: this.size() }));
  protected readonly current = computed(() => clampAngle(this.value()));

  private readonly interactive = computed(() => !this.disabled() && !this.readOnly());

  /**
   * Zag's rule, which is not "focusable unless disabled".
   *
   * A read-only dial keeps its tab stop so the angle can still be read, and a
   * disabled one has none — but the test is `readOnly || interactive`, so a
   * control that is *both* disabled and read-only stays focusable. Odd, and
   * reproduced rather than tidied: the four libraries render the same element.
   */
  protected readonly thumbTabIndex = computed(() =>
    this.readOnly() || this.interactive() ? 0 : null,
  );

  protected markerState(marker: number): string {
    const value = this.current();
    if (marker < value) return "under-value";
    if (marker > value) return "over-value";
    return "at-value";
  }

  protected focusThumb(event: Event): void {
    if (!this.interactive()) return;
    event.preventDefault();
    this.thumbElement()?.focus();
  }

  private thumbElement(): HTMLElement | null {
    return this.host.nativeElement.querySelector<HTMLElement>('[data-part="thumb"]');
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.interactive()) return;
    const multiplier = event.ctrlKey || event.metaKey ? 0.1 : event.shiftKey ? 10 : 1;
    const step = multiplier * this.step();
    let next: number | null = null;
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowUp":
        next = snapAngleToStep(this.current() - step, step);
        break;
      case "ArrowRight":
      case "ArrowDown":
        next = snapAngleToStep(this.current() + step, step);
        break;
      case "Home":
        next = ANGLE_MIN;
        break;
      case "End":
        next = ANGLE_MAX;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.set(next);
    this.valueChangeEnd.emit(this.current());
    flushNow(this.appRef);
  }

  protected onControlPointerDown(event: PointerEvent): void {
    if (!this.interactive() || event.button !== 0) return;
    event.stopPropagation();
    this.thumbElement()?.focus({ preventScroll: true });
    this.setFromPoint(event.clientX, event.clientY);

    // Followed on the document: a dial is small and a drag leaves it at once,
    // and the whole point of the gesture is that the pointer can circle it from
    // well outside.
    const document = (event.target as HTMLElement).ownerDocument;
    this.dragging.set(true);
    const move = (moved: PointerEvent) => this.setFromPoint(moved.clientX, moved.clientY);
    const stop = () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", stop);
      document.removeEventListener("pointercancel", stop);
      this.dragging.set(false);
      this.valueChangeEnd.emit(this.current());
      flushNow(this.appRef);
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", stop);
    document.addEventListener("pointercancel", stop);
  }

  private setFromPoint(clientX: number, clientY: number): void {
    const control = this.host.nativeElement.querySelector<HTMLElement>('[data-part="control"]');
    if (!control) return;
    const angle = angleAtPoint(control.getBoundingClientRect(), { x: clientX, y: clientY });
    this.set(constrainAngle(angle, this.step()));
    flushNow(this.appRef);
  }

  private set(next: number): void {
    const clamped = clampAngle(next);
    if (clamped === this.current()) return;
    this.value.set(clamped);
  }
}
