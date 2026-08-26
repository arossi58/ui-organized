import {
  AfterViewInit,
  ApplicationRef,
  Directive,
  ElementRef,
  ViewChild,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  signal,
  type Signal,
} from "@angular/core";
import { ControlValueAccessor } from "@angular/forms";
import {
  CONTROL_ICON_SIZE,
  inputFieldStyles,
  parseISODate,
  toISODate,
  todayYMD,
  type ControlSize,
  type InputVariants,
  type YMD,
} from "@ui-organized/core";
import { UioCalendar } from "../calendar/calendar.js";
import { flushNow } from "../overlay/flush.js";
import { UioFieldContext } from "../field/field-context.js";
import { UioPart, stateFlag } from "../part.js";
import { coarsePointer } from "./coarse-pointer.js";
import { openDatePicker } from "./open-date-picker.js";
import { UioDatePopover } from "./date-popover.js";

export type DateFieldSize = NonNullable<InputVariants["size"]>;

/** Split `2024-03-15T09:30` into its two halves; either may be empty. */
export function splitDateTime(value: string): { date: string; time: string } {
  const [date = "", time = ""] = value.split("T");
  return { date, time };
}

/**
 * Everything DateInput and DateTimeInput have in common, which is all of it but
 * two constants.
 *
 * The two components differ only in the native `type` they render and the
 * phrase their picker button is labelled with — the same fourteen-line split
 * React makes. Angular has no way to inherit a template, so the markup is a
 * shared constant below and each component pairs it with its own decorator; the
 * behaviour is inherited from here.
 *
 * ── What is deliberately *not* here ─────────────────────────────────────────
 *
 * React needs `setNativeInputValue` — a call through the native value setter
 * plus a synthetic `input` event — because assigning `.value` on a React-
 * controlled input is silently reverted. Angular writes the value through the
 * same signal the template binds, so the calendar's write-back and a user's
 * typing are the same path and there is nothing to work around.
 *
 * `@Directive()` with no selector, like `UioPart`: a base class that declares
 * inputs, queries and lifecycle hooks is using Angular features, and the
 * compiler refuses to inherit them from an undecorated class.
 */
@Directive()
export abstract class UioDateFieldBase
  extends UioPart
  implements AfterViewInit, ControlValueAccessor
{
  readonly scope = "field";
  readonly part = "root";

  /** The native input type. Fixed per component. */
  protected abstract readonly type: "date" | "datetime-local";
  /** The accessible name of the leading picker button, and of the popup. */
  protected abstract readonly pickerLabel: string;

  readonly label = input<string | undefined>(undefined);
  readonly helperText = input<string | undefined>(undefined);
  /** A string shows an error message; `true` marks the field invalid without one. */
  readonly error = input<string | boolean | undefined>(undefined);
  readonly size = input<DateFieldSize>("md");
  readonly required = input(false, { transform: booleanAttribute });
  readonly name = input<string | undefined>(undefined);
  /** Earliest selectable value, in the native input's own format. */
  readonly min = input<string | undefined>(undefined);
  /** Latest selectable value, in the native input's own format. */
  readonly max = input<string | undefined>(undefined);
  /** Native `step`, which only datetime-local has a use for. */
  readonly step = input<string | number | undefined>(undefined);

  /**
   * The field's value. Uncontrolled until something binds it, which is the same
   * fork `UioSwitch` describes — so React's `defaultValue` and `value` are one
   * input here.
   */
  readonly value = model("");

  protected readonly disabledInput = input(false, {
    alias: "disabled",
    transform: booleanAttribute,
  });
  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabledInput() || this.formDisabled());

  override readonly invalid: Signal<boolean> = computed(() => !!this.error());
  protected readonly errorMessage = computed(() =>
    typeof this.error() === "string" ? (this.error() as string) : undefined,
  );
  /** An error replaces the helper text rather than stacking under it. */
  protected readonly helperVisible = computed(() => !!this.helperText() && !this.invalid());

  protected readonly field = inject(UioFieldContext);
  private readonly appRef = inject(ApplicationRef);
  protected readonly coarse = coarsePointer();
  protected readonly hostClass = computed(() => inputFieldStyles({ size: this.size() }));
  protected readonly iconSize = computed(() => CONTROL_ICON_SIZE[this.size() as ControlSize]);
  protected readonly flag = stateFlag;

  private readonly parts = computed(() => splitDateTime(this.value()));
  protected readonly datePart = computed(() => this.parts().date);
  protected readonly timePart = computed(() => this.parts().time);

  protected readonly calendarValue = computed(() => parseISODate(this.datePart()));
  protected readonly calendarMin = computed(() => parseISODate(this.min()));
  protected readonly calendarMax = computed(() => parseISODate(this.max()));

  /** True for DateTimeInput, which adds a time field and a Done button. */
  protected get isDateTime(): boolean {
    return this.type === "datetime-local";
  }

  @ViewChild("row") private row?: ElementRef<HTMLElement>;
  @ViewChild("control") private control?: ElementRef<HTMLInputElement>;
  @ViewChild(UioCalendar) private calendar?: UioCalendar;
  @ViewChild(UioDatePopover) protected popover?: UioDatePopover;

  constructor() {
    super();
    this.field.bind({
      invalid: this.invalid,
      // Not the field's state: `disabled` is a native attribute on the control,
      // and `.field__control:disabled` is what the stylesheet reads. Ark puts no
      // `data-disabled` on a field's label either. See `UioInput`.
      disabled: signal(false),
      required: signal(false),
      readOnly: signal(false),
    });
    this.field.describe("helper-text", this.helperVisible);
  }

  ngAfterViewInit(): void {
    // Anchored to the whole field row rather than to the 32px picker button, so
    // the popup lines up with the control. And opened onto the calendar's active
    // day rather than onto the "Previous month" button `focusInside` would find.
    this.popover?.anchorTo(this.row?.nativeElement ?? null, null);
    if (this.popover) {
      this.popover.initialFocus = () => this.calendar?.activeDayElement() ?? null;
    }
  }

  protected onInput(event: Event): void {
    this.write((event.target as HTMLInputElement).value);
  }

  /** The OS-native picker, on touch devices. Must run inside the gesture. */
  protected openNativePicker(): void {
    openDatePicker(this.control?.nativeElement ?? null);
  }

  protected onDaySelect(day: YMD): void {
    const iso = toISODate(day);
    if (this.isDateTime) {
      // The popup stays open, so the time can still be set.
      this.write(`${iso}T${this.timePart() || "00:00"}`);
      return;
    }
    this.write(iso);
    this.popover?.hide();
  }

  protected onTimeInput(event: Event): void {
    const time = (event.target as HTMLInputElement).value;
    this.write(`${this.datePart() || toISODate(todayYMD())}T${time}`);
  }

  private write(next: string): void {
    this.value.set(next);
    this.onChange(next);
    /**
     * The value has to reach the DOM before the handler returns.
     *
     * Every write here comes from a discrete interaction — a day clicked in the
     * calendar, a time typed in the footer — and the state it changes is spread
     * across two views: the field's own input, and the calendar inside a
     * portalled surface. React flushes those together inside the event; a
     * zoneless Angular schedules them for the next task, so anything reading the
     * DOM straight after the click sees the old selection under a popup that has
     * already been told about the new one. See `flushNow`.
     */
    flushNow(this.appRef);
  }

  protected onTouched: () => void = () => {};
  private onChange: (value: string) => void = () => {};

  writeValue(value: string | null): void {
    this.value.set(value ?? "");
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}

/**
 * The markup both single date fields render.
 *
 * A shared constant rather than two copies: the whole point of the pair is that
 * they are the same field, and a divergence between two hand-kept templates
 * would show up as a parity failure in one component and not the other.
 *
 * Two things in here are load-bearing:
 *
 *  - **The coarse-pointer fork renders a plain button.** On touch there is no
 *    popover at all, so the button is not a popover trigger and reports none of
 *    its state — which is what the other three do, and why `data-scope="popover"`
 *    is absent from the whole field on a phone.
 *  - **The popover element itself is removed from the DOM.** Ark's Popover.Root
 *    renders nothing; `HostPresence` inside `UioDatePopover` does the same here,
 *    so the field root holds the label, the row, the helper text and the error
 *    and nothing else.
 */
export const DATE_FIELD_TEMPLATE = `
  @if (label(); as text) {
    <label uioFieldLabel
      >{{ text }}@if (required()) {<span class="field__required" aria-hidden="true"></span>}</label
    >
  }

  @if (coarse()) {
    <div class="input-affix" #row>
      <button
        type="button"
        class="input-affix__adornment input-affix__adornment--start input-affix__action"
        [attr.aria-label]="pickerLabel"
        [disabled]="isDisabled()"
        (click)="openNativePicker()"
      >
        <span uioIcon name="calendar" [size]="iconSize()"></span>
      </button>
      <input
        #control
        class="field__control field__control--affix-start"
        data-scope="field"
        data-part="input"
        [id]="field.controlId"
        [attr.type]="type"
        [attr.name]="name()"
        [attr.min]="min()"
        [attr.max]="max()"
        [attr.step]="step()"
        [attr.required]="required() ? '' : null"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [attr.aria-describedby]="field.describedBy()"
        [attr.data-invalid]="flag(invalid())"
        [attr.data-empty]="value() ? null : 'true'"
        [disabled]="isDisabled()"
        [value]="value()"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />
    </div>
  } @else {
    <div class="input-affix" #row>
      <button
        uioDatePopoverTrigger
        [datePopover]="surface"
        class="input-affix__adornment input-affix__adornment--start input-affix__action"
        [attr.aria-label]="pickerLabel"
        [disabled]="isDisabled()"
      >
        <span uioIcon name="calendar" [size]="iconSize()"></span>
      </button>
      <input
        #control
        class="field__control field__control--affix-start"
        data-scope="field"
        data-part="input"
        [id]="field.controlId"
        [attr.type]="type"
        [attr.name]="name()"
        [attr.min]="min()"
        [attr.max]="max()"
        [attr.step]="step()"
        [attr.required]="required() ? '' : null"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [attr.aria-describedby]="field.describedBy()"
        [attr.data-invalid]="flag(invalid())"
        [attr.data-empty]="value() ? null : 'true'"
        [disabled]="isDisabled()"
        [value]="value()"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />
    </div>

    <uio-date-popover #surface="uioDatePopover" [label]="pickerLabel">
      <div
        uioCalendar
        mode="single"
        [value]="calendarValue()"
        [min]="calendarMin()"
        [max]="calendarMax()"
        (daySelect)="onDaySelect($event)"
      ></div>
      @if (isDateTime) {
        <div class="date-popover__footer">
          <input
            type="time"
            class="field__control date-popover__time"
            aria-label="Time"
            [attr.data-empty]="timePart() ? null : 'true'"
            [value]="timePart()"
            (input)="onTimeInput($event)"
          />
          <button
            uioButton
            intent="primary"
            size="md"
            class="date-popover__done"
            (click)="surface.hide()"
          >
            Done
          </button>
        </div>
      }
    </uio-date-popover>
  }

  @if (helperVisible()) {
    <span
      class="field__description"
      data-scope="field"
      data-part="helper-text"
      [id]="field.partId('helper-text')"
      >{{ helperText() }}</span
    >
  }
  <span uioFieldError [message]="errorMessage()"></span>
`;
