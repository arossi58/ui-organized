import { NgTemplateOutlet } from "@angular/common";
import {
  AfterViewInit,
  ApplicationRef,
  Component,
  ElementRef,
  ViewChild,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
} from "@angular/core";
import { clsx } from "clsx";
import {
  CONTROL_ICON_SIZE,
  inputFieldStyles,
  parseISODate,
  toISODate,
  type ControlSize,
  type DateRangeInputVariants,
} from "@ui-organized/core";
import { UioCalendar, type CalendarRange } from "../calendar/calendar.js";
import { UioDatePopover, UioDatePopoverTrigger } from "../date-field/date-popover.js";
import { coarsePointer } from "../date-field/coarse-pointer.js";
import { openDatePicker } from "../date-field/open-date-picker.js";
import { UioIcon } from "../icons/icon.js";
import { flushNow } from "../overlay/flush.js";
import { nextMachineId } from "../part-ids.js";

export type DateRangeInputSize = NonNullable<DateRangeInputVariants["size"]>;

/** The paired ends of a range, as ISO `YYYY-MM-DD` strings; `""` when empty. */
export interface DateRangeValue {
  start: string;
  end: string;
}

const EMPTY_RANGE: DateRangeValue = { start: "", end: "" };

/** The icon pill in front of each control, which both ends share. */
const ADORNMENT =
  "input-affix__adornment input-affix__adornment--start input-affix__action";

/**
 * A from–to date range built from two native `<input type="date">` controls on
 * the Input field surface, under one shared label, helper text and error.
 *
 * ```html
 * <div uioDateRangeInput label="Stay" [(value)]="stay" min="2024-01-01"></div>
 * ```
 *
 * On a fine pointer the leading calendar buttons open one shared two-month range
 * calendar; on touch they defer to the OS-native picker. The two ends
 * auto-constrain each other — the end cannot precede the start — on top of the
 * optional `min`/`max`.
 *
 * ── Three things that look like details and are not ─────────────────────────
 *
 * **The root is not a `Field`.** It is a plain `role="group"` naming itself with
 * `aria-labelledby`, because two controls under one label is a group and not a
 * field: a `<label for>` may only name one of them. That is also why the label
 * is a `<span>`, the helper text a `<p>`, and the error pill is written out here
 * rather than being `UioFieldError` — outside a field that component renders no
 * id, and this group needs one to describe itself by.
 *
 * **Only the start button is a popover trigger.** One popover may have one
 * trigger and the range shares a single calendar, so the end button sets the
 * open state by hand. It is the one control in the date family whose behaviour
 * is written rather than delegated.
 *
 * **The row is split across two templates.** The coarse-pointer fork has to
 * bracket the popover as well as the button — a touch device renders no calendar
 * at all — and a template reference cannot cross an `@if`. The two inputs and
 * the separator, which is where all the attributes live, are shared between the
 * branches rather than written twice.
 */
@Component({
  selector: "div[uioDateRangeInput]",
  standalone: true,
  exportAs: "uioDateRangeInput",
  imports: [NgTemplateOutlet, UioCalendar, UioDatePopover, UioDatePopoverTrigger, UioIcon],
  host: {
    role: "group",
    "[class]": "hostClass()",
    "[attr.aria-labelledby]": "label() ? labelId : null",
    "[attr.aria-describedby]": "describedBy()",
    "[attr.data-disabled]": "disabled() ? 'true' : null",
  },
  template: `
    @if (label(); as text) {
      <span class="field__label" [id]="labelId"
        >{{ text }}@if (required()) {<span class="field__required" aria-hidden="true"></span>}</span
      >
    }

    @if (coarse()) {
      <div class="date-range__row" #row>
        <div class="input-affix date-range__field">
          <button
            type="button"
            [class]="ADORNMENT"
            [attr.aria-label]="startPickerLabel()"
            [disabled]="disabled()"
            (click)="onStartPicker()"
          >
            <span uioIcon name="calendar" [size]="iconSize()"></span>
          </button>
          <ng-container [ngTemplateOutlet]="startInput" />
        </div>
        <ng-container [ngTemplateOutlet]="tail" />
      </div>
    } @else {
      <div class="date-range__row" #row>
        <div class="input-affix date-range__field">
          <button
            uioDatePopoverTrigger
            [datePopover]="surface"
            [class]="ADORNMENT"
            [attr.aria-label]="startPickerLabel()"
            [disabled]="disabled()"
          >
            <span uioIcon name="calendar" [size]="iconSize()"></span>
          </button>
          <ng-container [ngTemplateOutlet]="startInput" />
        </div>
        <ng-container [ngTemplateOutlet]="tail" />
      </div>

      <uio-date-popover #surface="uioDatePopover" [label]="popupLabel()">
        <div
          uioCalendar
          mode="range"
          [numMonths]="2"
          [rangeValue]="calendarRange()"
          [min]="calendarMin()"
          [max]="calendarMax()"
          (rangeChange)="onRangeChange($event)"
          (rangeComplete)="surface.hide()"
        ></div>
      </uio-date-popover>
    }

    @if (helperVisible()) {
      <p class="field__description" [id]="helperId">{{ helperText() }}</p>
    }
    @if (errorVisible()) {
      <!--
        The pill UioFieldError renders, written out because this group is not an
        Ark Field: outside one that component emits no id, and no "data-scope"
        or "aria-live" either — which is what React renders here too.
      -->
      <span class="field-error text-emphasis-caption" [id]="errorId"
        ><span uioIcon class="field-error__icon" name="alert-circle" [size]="ERROR_ICON_SIZE"></span
        >{{ errorMessage() }}</span
      >
    }

    <ng-template #startInput>
      <input
        #startControl
        type="date"
        class="field__control field__control--affix-start"
        [attr.data-empty]="current().start ? null : 'true'"
        [attr.min]="min()"
        [attr.max]="current().end || max()"
        [attr.name]="startName()"
        [attr.required]="required() ? '' : null"
        [attr.aria-label]="startLabel()"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [disabled]="disabled()"
        [value]="current().start"
        (input)="onEndpointInput($event, true)"
      />
    </ng-template>

    <ng-template #tail>
      <span class="date-range__separator text-default-body-large" aria-hidden="true">{{
        separator()
      }}</span>
      <div class="input-affix date-range__field">
        <button
          type="button"
          [class]="ADORNMENT"
          [attr.aria-label]="endPickerLabel()"
          [disabled]="disabled()"
          (click)="onEndPicker()"
        >
          <span uioIcon name="calendar" [size]="iconSize()"></span>
        </button>
        <input
          #endControl
          type="date"
          class="field__control field__control--affix-start"
          [attr.data-empty]="current().end ? null : 'true'"
          [attr.min]="current().start || min()"
          [attr.max]="max()"
          [attr.name]="endName()"
          [attr.required]="required() ? '' : null"
          [attr.aria-label]="endLabel()"
          [attr.aria-invalid]="invalid() ? 'true' : null"
          [disabled]="disabled()"
          [value]="current().end"
          (input)="onEndpointInput($event, false)"
        />
      </div>
    </ng-template>
  `,
})
export class UioDateRangeInput implements AfterViewInit {
  readonly label = input<string | undefined>(undefined);
  readonly helperText = input<string | undefined>(undefined);
  /** A string shows an error message; `true` marks the range invalid without one. */
  readonly error = input<string | boolean | undefined>(undefined);
  readonly size = input<DateRangeInputSize>("md");
  readonly required = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Uncontrolled until something binds it — the fork `UioSwitch` describes. */
  readonly value = model<DateRangeValue>(EMPTY_RANGE);

  /** Earliest selectable date for both controls (ISO `YYYY-MM-DD`). */
  readonly min = input<string | undefined>(undefined);
  /** Latest selectable date for both controls (ISO `YYYY-MM-DD`). */
  readonly max = input<string | undefined>(undefined);

  readonly startName = input<string | undefined>(undefined);
  readonly endName = input<string | undefined>(undefined);
  readonly startLabel = input("Start date");
  readonly endLabel = input("End date");
  /** Rendered between the two controls. Defaults to an en dash. */
  readonly separator = input("–");

  private readonly machine = nextMachineId();
  protected readonly labelId = `${this.machine}-label`;
  protected readonly helperId = `${this.machine}-helper`;
  protected readonly errorId = `${this.machine}-error`;

  protected readonly ADORNMENT = ADORNMENT;
  protected readonly ERROR_ICON_SIZE = 12;

  private readonly appRef = inject(ApplicationRef);
  protected readonly coarse = coarsePointer();

  protected readonly invalid = computed(() => !!this.error());
  protected readonly errorMessage = computed(() =>
    typeof this.error() === "string" ? (this.error() as string) : undefined,
  );
  protected readonly helperVisible = computed(() => !!this.helperText() && !this.invalid());
  protected readonly errorVisible = computed(() => this.invalid() && !!this.errorMessage());
  protected readonly describedBy = computed(() => {
    const ids = [
      this.helperVisible() ? this.helperId : null,
      this.errorVisible() ? this.errorId : null,
    ].filter(Boolean);
    return ids.length ? ids.join(" ") : null;
  });

  protected readonly hostClass = computed(() =>
    clsx(inputFieldStyles({ size: this.size() }), "date-range"),
  );
  protected readonly iconSize = computed(() => CONTROL_ICON_SIZE[this.size() as ControlSize]);

  protected readonly current = computed(
    (): DateRangeValue => ({ start: this.value().start ?? "", end: this.value().end ?? "" }),
  );
  protected readonly calendarRange = computed(
    (): CalendarRange => ({
      start: parseISODate(this.current().start),
      end: parseISODate(this.current().end),
    }),
  );
  protected readonly calendarMin = computed(() => parseISODate(this.min()));
  protected readonly calendarMax = computed(() => parseISODate(this.max()));

  protected readonly startPickerLabel = computed(() => `${this.startLabel()} — choose date`);
  protected readonly endPickerLabel = computed(() => `${this.endLabel()} — choose date`);
  protected readonly popupLabel = computed(
    () => `${this.startLabel()} — ${this.endLabel()}, choose dates`,
  );

  @ViewChild("row") private row?: ElementRef<HTMLElement>;
  @ViewChild("startControl") private startControl?: ElementRef<HTMLInputElement>;
  @ViewChild("endControl") private endControl?: ElementRef<HTMLInputElement>;
  @ViewChild(UioCalendar) private calendar?: UioCalendar;
  @ViewChild(UioDatePopover) private popover?: UioDatePopover;

  ngAfterViewInit(): void {
    // The whole row, not the 32px button — the popup belongs to the pair. And
    // opened onto the calendar's active day rather than the "Previous month"
    // button, which is what `focusInside` would otherwise find first.
    this.popover?.anchorTo(this.row?.nativeElement ?? null, null);
    if (this.popover) {
      this.popover.initialFocus = () => this.calendar?.activeDayElement() ?? null;
    }
  }

  protected onStartPicker(): void {
    openDatePicker(this.startControl?.nativeElement ?? null);
  }

  /**
   * The end button, which is a plain button in both modes.
   *
   * On touch it opens the OS picker for its own control; on a fine pointer it
   * opens the shared calendar, because a popover may only have one trigger and
   * the start button already is it.
   */
  protected onEndPicker(): void {
    if (this.coarse()) {
      openDatePicker(this.endControl?.nativeElement ?? null);
      return;
    }
    this.popover?.show();
  }

  protected onEndpointInput(event: Event, isStart: boolean): void {
    const next = (event.target as HTMLInputElement).value;
    const current = this.current();
    this.update(isStart ? { start: next, end: current.end } : { start: current.start, end: next });
  }

  protected onRangeChange(range: CalendarRange): void {
    this.update({
      start: range.start ? toISODate(range.start) : "",
      end: range.end ? toISODate(range.end) : "",
    });
  }

  private update(next: DateRangeValue): void {
    this.value.set(next);
    // Both ends and the calendar's band are refreshed by different views; see
    // `write` in `UioDateFieldBase` for why a discrete interaction flushes.
    flushNow(this.appRef);
  }
}
