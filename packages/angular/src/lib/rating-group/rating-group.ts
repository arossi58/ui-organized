import {
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import {
  CONTROL_ICON_SIZE,
  ratingGroupStyles,
  type ControlSize,
  type RatingGroupVariants,
} from "@ui-organized/core";
import { UioPart, stateFlag } from "../part.js";
import { nextMachineId } from "../part-ids.js";
import { UioIcon } from "../icons/icon.js";
import { UioFieldError } from "../field-error/field-error.js";

export type RatingGroupSize = ControlSize;
export type RatingGroupVariant = NonNullable<RatingGroupVariants["variant"]>;

const DEFAULT_COUNT = 5;

/** Zag's "no rating yet", which is not the same as zero and not the same as 1. */
const EMPTY = -1;

/**
 * A row of stars that reads and writes one number.
 *
 * ```html
 * <div uioRatingGroup label="Rating" [count]="5" formControlName="score"></div>
 * ```
 *
 * ── Why the items are radios ────────────────────────────────────────────────
 *
 * The control is a `radiogroup` and each star a `radio`, so a screen reader
 * announces "3 stars, 3 of 5" rather than a row of anonymous images, and the
 * arrow keys move the rating rather than the page. Exactly one star is in the
 * tab order — the checked one — which is the roving tab index every radio group
 * in the library uses.
 *
 * ── Two attributes that mean different things ───────────────────────────────
 *
 * `data-checked` marks the *one* star the value names. `data-highlighted` marks
 * every star up to it, and it is what the fill is styled off — so a rating of 3
 * has three highlighted stars and one checked. Hovering rewrites the highlight
 * without touching the value, which is how the preview works, and is why hover
 * is state here rather than a CSS `:hover` rule.
 *
 * ── Half stars ─────────────────────────────────────────────────────────────
 *
 * `data-half` lands on the checked star when the value has a fractional part,
 * and the clipped copy laid over it is what draws the half. Pointer position
 * inside the star decides which half a click means, so `allowHalf` changes what
 * a click *is* rather than only what can be displayed.
 *
 * ── The Angular-specific win ────────────────────────────────────────────────
 *
 * `ControlValueAccessor`, so `[(ngModel)]` and Reactive Forms both drive it.
 */
@Component({
  selector: "div[uioRatingGroup]",
  standalone: true,
  exportAs: "uioRatingGroup",
  imports: [UioIcon, UioFieldError],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UioRatingGroup), multi: true },
  ],
  template: `
    @if (label(); as text) {
      <!--
        The for attribute names the hidden input, and clicking the label focuses
        the checked star instead — a label cannot point at a radio group, and
        pointing it at one arbitrary star would name the wrong value.
      -->
      <label
        class="field__label"
        data-scope="rating-group"
        data-part="label"
        [id]="partId('label')"
        [attr.for]="partId('input')"
        [attr.data-disabled]="flag(isDisabled())"
        [attr.data-required]="flag(required())"
        (click)="focusActive($event)"
        >{{ text }}@if (required()) {<span class="field__required" aria-hidden="true"></span>}</label
      >
    }
    <!--
      aria-labelledby names the label id whether or not a label is rendered,
      exactly as Ark does. Unlabelled, it is a reference to nothing rather than
      a wrong name, and every item still carries its own aria-label.
    -->
    <div
      class="rating-group__control"
      data-scope="rating-group"
      data-part="control"
      role="radiogroup"
      aria-orientation="horizontal"
      [id]="partId('control')"
      [attr.aria-labelledby]="partId('label')"
      [attr.aria-readonly]="readOnlyInput() ? 'true' : null"
      [attr.data-readonly]="flag(readOnlyInput())"
      [attr.data-disabled]="flag(isDisabled())"
      (pointerleave)="clearHover()"
    >
      @for (index of items(); track index) {
        <span
          class="rating-group__item"
          data-scope="rating-group"
          data-part="item"
          role="radio"
          aria-roledescription="rating"
          [id]="partId('item:' + index)"
          [attr.aria-label]="index + ' stars'"
          [attr.aria-disabled]="isDisabled()"
          [attr.data-disabled]="flag(isDisabled())"
          [attr.data-readonly]="flag(readOnlyInput())"
          [attr.aria-setsize]="count()"
          [attr.aria-posinset]="index"
          [attr.aria-checked]="isChecked(index)"
          [attr.data-checked]="flag(isChecked(index))"
          [attr.data-highlighted]="flag(isHighlighted(index))"
          [attr.data-half]="flag(halfIndex() === index)"
          [attr.tabindex]="tabIndexFor(index)"
          (pointermove)="onItemPointerMove($event, index)"
          (pointerdown)="onItemPointerDown($event)"
          (click)="select(index)"
          (keydown)="onKeydown($event)"
          (blur)="onBlur()"
        >
          <span uioIcon name="star" class="rating-group__star" [size]="iconSize()"></span>
          @if (allowHalf()) {
            <!--
              A clipped copy of the same star laid over the empty one. The width
              does the clipping, so the two stay pixel-aligned at every size.
            -->
            <span class="rating-group__half" aria-hidden="true">
              <span uioIcon name="star" class="rating-group__star" [size]="iconSize()"></span>
            </span>
          }
        </span>
      }
    </div>
    @if (helperVisible()) {
      <span class="field__description">{{ helperText() }}</span>
    }
    <span uioFieldError [message]="errorMessage()"></span>
    <input
      type="text"
      hidden
      [id]="partId('input')"
      [attr.name]="name()"
      [attr.required]="required() ? '' : null"
      [attr.readonly]="readOnlyInput() ? '' : null"
      [disabled]="isDisabled()"
      [value]="value()"
    />
  `,
  host: {
    "[class]": "hostClass()",
    "[id]": "rootId",
  },
})
export class UioRatingGroup extends UioPart implements ControlValueAccessor {
  readonly scope = "rating-group";
  readonly part = "root";

  /** `-1` is "no rating", which is not zero and not one. */
  readonly value = model<number>(EMPTY);
  readonly valueChange = output<number>();

  readonly label = input<string | undefined>(undefined);
  readonly helperText = input<string | undefined>(undefined);
  /** A string shows a message; `true` marks the field invalid without one. */
  readonly error = input<string | boolean | undefined>(undefined);
  readonly count = input(DEFAULT_COUNT);
  readonly allowHalf = input(false, { transform: booleanAttribute });
  readonly size = input<RatingGroupSize>("md");
  readonly variant = input<RatingGroupVariant>("default");
  readonly required = input(false, { transform: booleanAttribute });
  /** Ark's default, so an unnamed rating still submits under a sensible key. */
  readonly name = input("rating");

  /**
   * Neither of these overrides its `UioPart` field, deliberately.
   *
   * The base binds `data-disabled` and `data-readonly` on the host, and Ark's
   * rating root reports *neither*: the state lives on the control and on each
   * item instead. Overriding would put two attributes on the root that no other
   * library emits. Same split, for the same reason, as `readOnlyInput` on
   * `UioNumberField`.
   */
  protected readonly readOnlyInput = input(false, {
    alias: "readOnly",
    transform: booleanAttribute,
  });
  protected readonly disabledInput = input(false, {
    alias: "disabled",
    transform: booleanAttribute,
  });
  private readonly formDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabledInput() || this.formDisabled());

  protected readonly errorMessage = computed(() =>
    typeof this.error() === "string" ? (this.error() as string) : undefined,
  );
  private readonly isInvalid = computed(() => !!this.error());
  protected readonly helperVisible = computed(() => !!this.helperText() && !this.isInvalid());

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly hostClass = computed(() =>
    ratingGroupStyles({ size: this.size(), variant: this.variant() }),
  );
  protected readonly iconSize = computed(() => CONTROL_ICON_SIZE[this.size()]);
  protected readonly items = computed(() =>
    Array.from({ length: this.count() }, (_, index) => index + 1),
  );

  /** `-1` when the pointer is not over the row. Overrides the value while set. */
  private readonly hoveredValue = signal(EMPTY);
  private readonly hovering = computed(() => this.hoveredValue() > EMPTY);
  /** What the stars are drawn from: the hover preview if there is one. */
  private readonly shownValue = computed(() =>
    this.hovering() ? this.hoveredValue() : this.value(),
  );

  /**
   * The star the value names — and, with no value at all, the first, so the
   * group still has a tab stop.
   *
   * Both halves of Zag's test, not one or the other: an *empty* rating being
   * hovered reports two checked stars, the hovered one and the first. That
   * reads wrong and is what the other three libraries render, so reproducing it
   * is the point.
   */
  protected isChecked(index: number): boolean {
    return Math.ceil(this.shownValue()) === index || (this.value() <= 0 && index === 1);
  }
  /** Everything up to and including the checked star is filled. */
  protected isHighlighted(index: number): boolean {
    const shown = this.shownValue();
    return index <= shown || Math.ceil(shown) === index;
  }
  protected readonly halfIndex = computed(() => {
    const shown = this.shownValue();
    const equal = Math.ceil(shown);
    return Math.abs(shown - equal) === 0.5 ? equal : -1;
  });
  protected readonly flag = stateFlag;

  private readonly machine = nextMachineId();
  /** Ark's ids are `rating:<machine>`, not `rating-group:` — the scope and the
   *  id prefix differ for this one machine, and the ids are what a label names. */
  protected get rootId(): string {
    return `rating:${this.machine}`;
  }
  protected partId(part: string): string {
    return `rating:${this.machine}:${part}`;
  }

  private get interactive(): boolean {
    return !this.isDisabled() && !this.readOnlyInput();
  }

  /**
   * Read-only keeps one tab stop so the rating can still be read; disabled has
   * none at all.
   */
  protected tabIndexFor(index: number): number | null {
    if (this.isDisabled()) return null;
    const checked = this.isChecked(index);
    if (this.readOnlyInput()) return checked ? 0 : null;
    return checked ? 0 : -1;
  }

  // ── Pointer ───────────────────────────────────────────────────────────────

  /** Which half of the star the pointer is in decides half versus whole. */
  protected onItemPointerMove(event: PointerEvent, index: number): void {
    if (!this.interactive || event.pointerType === "touch") return;
    const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const midway = box.width > 0 && (event.clientX - box.left) / box.width < 0.5;
    this.hoveredValue.set(this.allowHalf() && midway ? index - 0.5 : index);
  }

  protected clearHover(): void {
    this.hoveredValue.set(EMPTY);
  }

  /**
   * The press is cancelled so the star does not take focus from under the click;
   * focus is moved explicitly once the value has settled.
   */
  protected onItemPointerDown(event: PointerEvent): void {
    if (!this.interactive || event.button !== 0) return;
    event.preventDefault();
  }

  protected select(index: number): void {
    if (!this.interactive) return;
    // A click while hovering takes the *hovered* value, which is the half-star
    // the pointer is actually over rather than the whole star it belongs to.
    const hovered = this.hoveredValue();
    this.commit(hovered === EMPTY ? index : hovered);
    this.focusActiveRadio();
  }

  // ── Keyboard ──────────────────────────────────────────────────────────────

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.interactive) return;
    const step = this.allowHalf() ? 0.5 : 1;
    const current = this.value();

    switch (event.key) {
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        this.commit(Math.max(0, current - step));
        break;
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        this.commit(Math.min(this.count(), (current === EMPTY ? 0 : current) + step));
        break;
      case "Home":
        event.preventDefault();
        this.commit(1);
        break;
      case "End":
        event.preventDefault();
        this.commit(this.count());
        break;
      case " ":
        // Space only sets a rating that has none — it is not a toggle.
        if (current > 0) return;
        event.preventDefault();
        this.commit(1);
        break;
      default:
        return;
    }
    this.focusActiveRadio();
  }

  protected focusActive(event: Event): void {
    event.preventDefault();
    if (!this.interactive) return;
    this.focusActiveRadio();
  }

  protected onBlur(): void {
    this.onTouched();
  }

  private focusActiveRadio(): void {
    queueMicrotask(() => {
      const index = Math.max(1, Math.ceil(this.value()));
      this.host.nativeElement
        .querySelector<HTMLElement>(`[role="radio"][aria-posinset="${index}"]`)
        ?.focus();
    });
  }

  private commit(next: number): void {
    if (next === this.value()) return;
    this.value.set(next);
    this.valueChange.emit(next);
    this.onChange(next);
  }

  // ── Forms ─────────────────────────────────────────────────────────────────

  protected onTouched: () => void = () => {};
  private onChange: (value: number) => void = () => {};

  writeValue(value: number | null): void {
    this.value.set(value ?? EMPTY);
  }
  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}
