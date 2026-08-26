import { Overlay } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import {
  ApplicationRef,
  Component,
  DOCUMENT,
  ElementRef,
  EmbeddedViewRef,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  untracked,
  type Signal,
} from "@angular/core";
import {
  CONTROL_ICON_SIZE,
  compareYMD,
  datePickerStyles,
  isSameMonth,
  isSameYMD,
  isWithin,
  monthLabel,
  parseISODate,
  startOfMonth,
  toISODate,
  todayYMD,
  ymdToDate,
  type ControlSize,
  type DatePickerVariants,
  type YMD,
} from "@ui-organized/core";
import { UioFieldError } from "../field-error/field-error.js";
import { UioIcon } from "../icons/icon.js";
import { AnchoredSurface } from "../overlay/anchored.js";
import { anchoredPositions } from "../overlay/anchor.js";
import { pushLayer, removeLayer, type DismissibleLayer } from "../overlay/dismiss.js";
import { flushNow } from "../overlay/flush.js";
import { restoreFocus } from "../overlay/focus.js";
import { applySurfaceStacking, raiseSurface, setSurfaceInteractive } from "../overlay/surface.js";
import { nextMachineId } from "../part-ids.js";
import { UioPart, stateFlag } from "../part.js";
import { datePickerWeeks, shiftMonths } from "./date-picker-grid.js";

export type DatePickerSize = NonNullable<DatePickerVariants["size"]>;
export type DatePickerVariant = NonNullable<DatePickerVariants["variant"]>;
export type DatePickerSelectionMode = "single" | "multiple" | "range";

/** Weekday header and navigation glyphs stay one step below the cell text. */
const NAV_ICON_SIZE = 16;

/** Ark's DatePicker anchors its popup bottom-start with a 4px gutter. */
const POPUP_GUTTER = 4;

/** Parked off-screen while closed, exactly as zag parks its positioner. */
const PARKED = "translate3d(0px, -100vh, 0px)";

/** One day in the grid, with every attribute already decided. See `DayCell`. */
interface DayCell {
  ymd: YMD;
  value: string;
  day: number;
  ariaLabel: string;
  ariaDisabled: "true" | null;
  ariaSelected: "true" | "false";
  ariaInvalid: "true" | null;
  disabled: "" | null;
  selectable: "" | null;
  selected: "" | null;
  unavailable: "" | null;
  outsideRange: "" | null;
  weekend: "" | null;
  today: "" | null;
  focus: "" | null;
  rangeStart: "" | null;
  rangeEnd: "" | null;
  inRange: "" | null;
  tabIndex: number;
}

interface Weekday {
  long: string;
  narrow: string;
}

/** 2024-01-07 is a Sunday — a stable anchor for deriving localised names. */
function weekdayHeaders(locale: string | undefined, weekStartsOn: number): Weekday[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(2024, 0, 7 + ((weekStartsOn + index) % 7));
    return {
      long: date.toLocaleDateString(locale, { weekday: "long" }),
      narrow: date.toLocaleDateString(locale, { weekday: "narrow" }),
    };
  });
}

function longDate(day: YMD, locale: string | undefined): string {
  return ymdToDate(day).toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * A date field with its own calendar grid — the other date component, and the
 * only one of the four that is a `<table>`.
 *
 * ```html
 * <div uioDatePicker label="Date" [(value)]="dates" selectionMode="range"></div>
 * ```
 *
 * ── Why this is written out rather than composed ────────────────────────────
 *
 * The other three libraries delegate the whole of this to Ark's DatePicker
 * machine, so its DOM is zag's rather than the design system's: `data-selectable`
 * beside `data-unavailable` beside `data-outside-range`, three different reasons
 * a cell cannot be chosen, each with its own rule in `DatePicker.css`. Angular
 * has no machine, so every one of those is decided in {@link cells} — which is
 * also where the difference from the hand-written `Calendar` lives: this grid
 * carries zag's vocabulary and zag's presence-only encoding (`data-selected=""`),
 * where `Calendar` carries our own and writes `"true"`.
 *
 * ── The one thing it deliberately does not do ───────────────────────────────
 *
 * The view trigger — the month label in the header — is inert. All four
 * libraries render only the *day* view, so there is no year view to switch to;
 * in React, clicking it hides the day view and leaves an empty popup, which is
 * behaviour worth not reproducing. The button stays because its id is part of
 * the rendered contract, and because the day the year view is built it is
 * already in the right place.
 */
@Component({
  selector: "div[uioDatePicker]",
  standalone: true,
  exportAs: "uioDatePicker",
  imports: [UioFieldError, UioIcon],
  template: `
    @if (label(); as text) {
      <label
        class="field__label"
        data-scope="date-picker"
        data-part="label"
        data-index="0"
        [id]="partId('label:0')"
        [attr.for]="inputId(0)"
        [attr.data-state]="state()"
        [attr.data-disabled]="flag(disabledInput())"
        [attr.data-readonly]="flag(readOnly())"
        >{{ text }}@if (required()) {<span class="field__required" aria-hidden="true"></span>}</label
      >
    }

    <div
      class="date-picker__control"
      data-scope="date-picker"
      data-part="control"
      [id]="partId('control')"
      [attr.data-disabled]="flag(disabledInput())"
      [attr.data-placeholder-shown]="flag(isEmpty())"
    >
      @for (index of inputIndexes(); track index) {
        <input
          class="date-picker__input"
          data-scope="date-picker"
          data-part="input"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
          placeholder="mm/dd/yyyy"
          [id]="inputId(index)"
          [attr.name]="name()"
          [attr.data-index]="index"
          [attr.data-state]="state()"
          [attr.data-placeholder-shown]="flag(isEmpty())"
          [attr.readonly]="readOnly() ? '' : null"
          [attr.required]="required() ? '' : null"
          [attr.aria-invalid]="isInvalid() ? 'true' : null"
          [attr.data-invalid]="flag(isInvalid())"
          [disabled]="disabledInput()"
          [value]="displayValue(index)"
          (change)="onInputChange($event, index)"
        />
      }
      <button
        class="date-picker__trigger"
        data-scope="date-picker"
        data-part="trigger"
        type="button"
        aria-haspopup="grid"
        [id]="partId('trigger')"
        [attr.aria-label]="open() ? 'Close calendar' : 'Open calendar'"
        [attr.aria-controls]="partId('content')"
        [attr.aria-expanded]="open() ? 'true' : 'false'"
        [attr.data-state]="state()"
        [attr.data-placeholder-shown]="flag(isEmpty())"
        [attr.data-placement]="anchored.placement()"
        [attr.data-side]="anchored.side()"
        [disabled]="disabledInput()"
        (click)="toggle()"
      >
        <span uioIcon name="calendar" [size]="iconSize()"></span>
      </button>
    </div>

    @if (helperVisible()) {
      <span class="field__description">{{ helperText() }}</span>
    }
    <span uioFieldError [message]="errorMessage()"></span>

    <!-- See UioPopover: a view container anchored on the host is re-homed by projection. -->
    <ng-container #anchor />
    <ng-template #surface>
      <!--
        The positioner class must stay a plain string literal — the
        overlay-stacking test scans for it.
      -->
      <div
        class="date-picker__positioner"
        data-scope="date-picker"
        data-part="positioner"
        [id]="partId('positioner')"
      >
        <div
          class="date-picker__popup"
          data-scope="date-picker"
          data-part="content"
          role="application"
          aria-roledescription="datepicker"
          aria-label="calendar"
          tabindex="-1"
          [id]="partId('content')"
          [attr.data-state]="state()"
          [attr.hidden]="open() ? null : ''"
          [attr.data-placement]="anchored.placement()"
          [attr.data-side]="anchored.side()"
        >
          <div data-scope="date-picker" data-part="view">
            <div
              class="date-picker__view-control"
              data-scope="date-picker"
              data-part="view-control"
              data-view="day"
            >
              <button
                class="date-picker__nav"
                data-scope="date-picker"
                data-part="prev-trigger"
                type="button"
                aria-label="Switch to previous month"
                [id]="partId('prev:day')"
                [disabled]="prevDisabled()"
                [attr.data-disabled]="flag(prevDisabled())"
                (click)="page(-1)"
              >
                <span uioIcon name="chevron-left" [size]="NAV_ICON_SIZE"></span>
              </button>
              <button
                class="date-picker__view-trigger"
                data-scope="date-picker"
                data-part="view-trigger"
                data-view="day"
                type="button"
                aria-label="Switch to year view"
                [id]="partId('view:day')"
              >
                <div data-scope="date-picker" data-part="range-text">{{ rangeText() }}</div>
              </button>
              <button
                class="date-picker__nav"
                data-scope="date-picker"
                data-part="next-trigger"
                type="button"
                aria-label="Switch to next month"
                [id]="partId('next:day')"
                [disabled]="nextDisabled()"
                [attr.data-disabled]="flag(nextDisabled())"
                (click)="page(1)"
              >
                <span uioIcon name="chevron-right" [size]="NAV_ICON_SIZE"></span>
              </button>
            </div>

            <table
              class="date-picker__table"
              data-scope="date-picker"
              data-part="table"
              role="grid"
              data-columns="7"
              aria-roledescription="calendar month"
              data-view="day"
              tabindex="-1"
              [id]="partId('table:day')"
              [attr.aria-multiselectable]="multiSelectable()"
              (keydown)="onGridKeydown($event)"
            >
              <thead
                data-scope="date-picker"
                data-part="table-head"
                aria-hidden="true"
                data-view="day"
              >
                <tr data-scope="date-picker" data-part="table-row" data-view="day">
                  @for (weekday of weekdays(); track weekday.long) {
                    <th
                      class="date-picker__weekday"
                      data-scope="date-picker"
                      data-part="table-header"
                      data-view="day"
                      [attr.aria-label]="weekday.long"
                    >
                      {{ weekday.narrow }}
                    </th>
                  }
                </tr>
              </thead>
              <tbody data-scope="date-picker" data-part="table-body" data-view="day">
                @for (week of cells(); track week[0]!.value) {
                  <tr data-scope="date-picker" data-part="table-row" data-view="day">
                    @for (cell of week; track cell.value) {
                      <td
                        class="date-picker__cell"
                        data-scope="date-picker"
                        data-part="table-cell"
                        role="gridcell"
                        [attr.aria-disabled]="cell.ariaDisabled"
                        [attr.aria-selected]="cell.ariaSelected"
                        [attr.aria-invalid]="cell.ariaInvalid"
                        [attr.data-value]="cell.value"
                      >
                        <div
                          class="date-picker__day"
                          data-scope="date-picker"
                          data-part="table-cell-trigger"
                          role="button"
                          data-view="day"
                          [id]="partId('cell-trigger:' + cell.value)"
                          [attr.tabindex]="cell.tabIndex"
                          [attr.aria-label]="cell.ariaLabel"
                          [attr.aria-disabled]="cell.ariaDisabled"
                          [attr.aria-invalid]="cell.ariaInvalid"
                          [attr.data-disabled]="cell.disabled"
                          [attr.data-selectable]="cell.selectable"
                          [attr.data-selected]="cell.selected"
                          [attr.data-value]="cell.value"
                          [attr.data-unavailable]="cell.unavailable"
                          [attr.data-outside-range]="cell.outsideRange"
                          [attr.data-weekend]="cell.weekend"
                          [attr.data-today]="cell.today"
                          [attr.data-focus]="cell.focus"
                          [attr.data-range-start]="cell.rangeStart"
                          [attr.data-range-end]="cell.rangeEnd"
                          [attr.data-in-range]="cell.inRange"
                          (click)="choose(cell)"
                        >
                          {{ cell.day }}
                        </div>
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ng-template>
  `,
  host: {
    "[class]": "hostClass()",
    "[id]": "rootId",
    "[attr.data-empty]": "flag(isEmpty())",
  },
})
export class UioDatePicker extends UioPart implements OnInit, OnDestroy {
  readonly scope = "date-picker";
  readonly part = "root";

  readonly label = input<string | undefined>(undefined);
  readonly helperText = input<string | undefined>(undefined);
  /** A string shows an error message; `true` marks the field invalid without one. */
  readonly error = input<string | boolean | undefined>(undefined);
  /** ISO dates. An array even in single mode, because `range` selects two. */
  readonly value = model<string[]>([]);
  readonly selectionMode = input<DatePickerSelectionMode>("single");
  readonly min = input<string | undefined>(undefined);
  readonly max = input<string | undefined>(undefined);
  /**
   * Months shown side by side. Accepted for API parity and currently rendered as
   * one: the facade maps a single month's weeks in all four libraries.
   */
  readonly numOfMonths = input(1);
  /** BCP-47 locale driving month names, weekday order and formatting. */
  readonly locale = input<string | undefined>(undefined);
  readonly open = model(false);
  readonly size = input<DatePickerSize>("md");
  readonly variant = input<DatePickerVariant>("default");
  readonly required = input(false, { transform: booleanAttribute });
  readonly readOnlyInput = input(false, { alias: "readOnly", transform: booleanAttribute });
  protected readonly disabledInput = input(false, {
    alias: "disabled",
    transform: booleanAttribute,
  });
  readonly name = input<string | undefined>(undefined);

  override readonly disabled: Signal<boolean> = this.disabledInput;
  override readonly readOnly: Signal<boolean> = this.readOnlyInput;
  /**
   * The open state, and deliberately *not* `data-invalid`.
   *
   * Ark reflects `invalid` onto the input alone — the root, the label and the
   * control carry none — so the base's `invalid` is left at its default here and
   * the two attributes that do belong on the root are bound above.
   */
  override readonly state = computed(() => (this.open() ? "open" : "closed"));

  protected readonly machine = nextMachineId();
  readonly anchored = new AnchoredSurface(inject(Overlay));

  protected readonly NAV_ICON_SIZE = NAV_ICON_SIZE;
  protected readonly flag = stateFlag;

  private readonly today = todayYMD();

  /** Derived from `error`, and bound only where Ark puts it: on the input. */
  protected readonly isInvalid = computed(() => !!this.error());
  protected readonly errorMessage = computed(() =>
    typeof this.error() === "string" ? (this.error() as string) : undefined,
  );
  protected readonly helperVisible = computed(() => !!this.helperText() && !this.isInvalid());
  protected readonly hostClass = computed(() =>
    datePickerStyles({ size: this.size(), variant: this.variant() }),
  );
  protected readonly iconSize = computed(() => CONTROL_ICON_SIZE[this.size() as ControlSize]);

  protected readonly selectedDays = computed(() =>
    this.value()
      .map((iso) => parseISODate(iso))
      .filter((day): day is YMD => !!day),
  );
  protected readonly isEmpty = computed(() => this.selectedDays().length === 0);
  private readonly minDay = computed(() => parseISODate(this.min()));
  private readonly maxDay = computed(() => parseISODate(this.max()));

  /**
   * The day the grid's roving focus is on, which is also what decides the month
   * on screen. Seeded in `ngOnInit`, where the inputs are first bound.
   */
  private readonly focused = signal<YMD>(this.today);
  private readonly view = computed(() => startOfMonth(this.focused()));

  protected readonly rangeText = computed(() =>
    monthLabel(this.view().year, this.view().month, this.locale()),
  );
  protected readonly weekdays = computed(() => weekdayHeaders(this.locale(), 0));
  protected readonly inputIndexes = computed(() =>
    this.selectionMode() === "range" ? [0, 1] : [0],
  );
  /** Ark marks the grid multi-selectable for any mode that takes more than one day. */
  protected readonly multiSelectable = computed(() =>
    this.selectionMode() === "single" ? null : "true",
  );

  /**
   * Paging stops at the month holding the bound, not at the bound itself.
   *
   * Zag asks whether the *adjacent visible range* is still valid, which for a
   * single month is the same question: the month before this one is out of
   * bounds exactly when this month already contains `min`.
   */
  protected readonly prevDisabled = computed(() => {
    const min = this.minDay();
    return min ? compareYMD(this.view(), startOfMonth(min)) <= 0 : false;
  });
  protected readonly nextDisabled = computed(() => {
    const max = this.maxDay();
    return max ? compareYMD(this.view(), startOfMonth(max)) >= 0 : false;
  });

  protected readonly cells = computed((): DayCell[][] => {
    const mode = this.selectionMode();
    const view = this.view();
    const selected = this.selectedDays();
    const min = this.minDay();
    const max = this.maxDay();
    const focused = this.focused();
    const locale = this.locale();
    const [start, end] = mode === "range" ? selected : [];

    return datePickerWeeks(view).map((week) =>
      week.map((day): DayCell => {
        const outsideRange = !isSameMonth(day, view);
        const unavailable = !isWithin(day, min, max);
        const selectable = !outsideRange && !unavailable;
        const isSelected = selected.some((value) => isSameYMD(value, day));
        const rangeStart = mode === "range" && !!start && !!end && isSameYMD(day, start);
        const rangeEnd = mode === "range" && !!start && !!end && isSameYMD(day, end);
        const inRange =
          mode === "range" &&
          !!start &&
          !!end &&
          compareYMD(day, start) >= 0 &&
          compareYMD(day, end) <= 0;
        const weekday = ymdToDate(day).getDay();

        const text = longDate(day, locale);
        const ariaLabel = unavailable
          ? `Not available. ${text}`
          : rangeStart
            ? `Starting range from ${text}`
            : rangeEnd
              ? `Range ending at ${text}`
              : isSelected && mode !== "range"
                ? `Selected date. ${text}`
                : `Choose ${text}`;

        return {
          ymd: day,
          value: toISODate(day),
          day: day.day,
          ariaLabel,
          ariaDisabled: selectable ? null : "true",
          ariaSelected: isSelected || inRange ? "true" : "false",
          ariaInvalid: unavailable ? "true" : null,
          disabled: stateFlag(!selectable),
          selectable: stateFlag(selectable),
          selected: stateFlag(isSelected),
          unavailable: stateFlag(unavailable),
          outsideRange: stateFlag(outsideRange),
          weekend: stateFlag(weekday === 0 || weekday === 6),
          today: stateFlag(isSameYMD(day, this.today)),
          focus: stateFlag(isSameYMD(day, focused)),
          rangeStart: stateFlag(rangeStart),
          rangeEnd: stateFlag(rangeEnd),
          inRange: stateFlag(inRange),
          tabIndex: isSameYMD(day, focused) ? 0 : -1,
        };
      }),
    );
  });

  @ViewChild("surface", { static: true }) private surface!: TemplateRef<unknown>;
  @ViewChild("anchor", { read: ViewContainerRef, static: true }) private anchor!: ViewContainerRef;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly appRef = inject(ApplicationRef);

  private surfaceView?: EmbeddedViewRef<unknown>;
  private applied = false;

  private readonly layer: DismissibleLayer = {
    surface: () => this.contentElement(),
    trigger: () => this.triggerElement(),
    dismiss: () => this.close(),
  };

  constructor() {
    super();
    effect(() => {
      this.open();
      untracked(() => this.sync());
    });
  }

  /** Ark spells the DatePicker's id prefix without the hyphen its scope has. */
  get rootId(): string {
    return `datepicker:${this.machine}`;
  }
  partId(part: string): string {
    return `datepicker:${this.machine}:${part}`;
  }
  protected inputId(index: number): string {
    return this.partId(`input:${index}`);
  }

  /**
   * `ngOnInit`, not `ngAfterViewInit`, and the queries are static because of it —
   * see `UioSelect` for why an inner surface has to be created first.
   */
  ngOnInit(): void {
    const first = this.selectedDays()[0];
    if (first) this.focused.set(first);

    const ref = this.anchored.create(
      this.host.nativeElement,
      anchoredPositions("bottom", "start", POPUP_GUTTER),
    );
    this.surfaceView = ref.attach(
      new TemplatePortal(this.surface, this.anchor),
    ) as EmbeddedViewRef<unknown>;
    applySurfaceStacking(ref);
    setSurfaceInteractive(ref, false);
    this.park();
  }

  ngOnDestroy(): void {
    removeLayer(this.layer);
    this.anchored.dispose();
  }

  show(): void {
    this.setOpen(true);
  }
  close(): void {
    this.setOpen(false);
  }
  toggle(): void {
    this.setOpen(!this.open());
  }

  /** The formatted text one input shows. Ark renders `mm/dd/yyyy` zero-padded. */
  protected displayValue(index: number): string {
    const day = this.selectedDays()[index];
    if (!day) return "";
    return ymdToDate(day).toLocaleDateString(this.locale(), {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  }

  protected onInputChange(event: Event, index: number): void {
    const typed = (event.target as HTMLInputElement).value.trim();
    const parsed = typed ? new Date(typed) : null;
    const next = [...this.value()];
    if (!parsed || Number.isNaN(parsed.getTime())) {
      next.splice(index, 1);
    } else {
      next[index] = toISODate({
        year: parsed.getFullYear(),
        month: parsed.getMonth(),
        day: parsed.getDate(),
      });
    }
    this.commit(next.filter(Boolean));
  }

  protected page(delta: number): void {
    this.focused.set(shiftMonths(this.focused(), delta));
    flushNow(this.appRef);
  }

  protected choose(cell: DayCell): void {
    if (!cell.selectable || this.readOnly()) return;
    this.focused.set(cell.ymd);

    const mode = this.selectionMode();
    if (mode === "multiple") {
      const current = this.value();
      const next = current.includes(cell.value)
        ? current.filter((iso) => iso !== cell.value)
        : [...current, cell.value].sort();
      this.commit(next);
      return;
    }

    if (mode === "range") {
      const current = this.value();
      // A complete range starts a new one; a half-open one closes.
      if (current.length !== 1) {
        this.commit([cell.value]);
        return;
      }
      this.commit([current[0]!, cell.value].sort());
      this.close();
      return;
    }

    this.commit([cell.value]);
    this.close();
  }

  protected onGridKeydown(event: KeyboardEvent): void {
    const focused = this.focused();
    const shift = (days: number) => {
      const next = new Date(focused.year, focused.month, focused.day + days);
      return { year: next.getFullYear(), month: next.getMonth(), day: next.getDate() };
    };
    let next: YMD | null = null;
    switch (event.key) {
      case "ArrowLeft":
        next = shift(-1);
        break;
      case "ArrowRight":
        next = shift(1);
        break;
      case "ArrowUp":
        next = shift(-7);
        break;
      case "ArrowDown":
        next = shift(7);
        break;
      case "Home":
        next = shift(-ymdToDate(focused).getDay());
        break;
      case "End":
        next = shift(6 - ymdToDate(focused).getDay());
        break;
      case "PageUp":
        next = shiftMonths(focused, -1);
        break;
      case "PageDown":
        next = shiftMonths(focused, 1);
        break;
      case "Enter":
      case " ": {
        event.preventDefault();
        const cell = this.cells()
          .flat()
          .find((candidate) => isSameYMD(candidate.ymd, focused));
        if (cell) this.choose(cell);
        return;
      }
      default:
        return;
    }
    event.preventDefault();
    this.focused.set(next);
    flushNow(this.appRef);
    this.focusedCell()?.focus({ preventScroll: true });
  }

  private commit(next: string[]): void {
    this.value.set(next);
    flushNow(this.appRef);
  }

  private triggerElement(): HTMLElement | null {
    return this.host.nativeElement.querySelector<HTMLElement>('[data-part="trigger"]');
  }
  private contentElement(): HTMLElement | null {
    return (
      this.anchored.overlayRef?.overlayElement.querySelector<HTMLElement>('[data-part="content"]') ??
      null
    );
  }
  private positionerElement(): HTMLElement | null {
    return (
      this.anchored.overlayRef?.overlayElement.querySelector<HTMLElement>(
        '[data-part="positioner"]',
      ) ?? null
    );
  }
  private focusedCell(): HTMLElement | null {
    return (
      this.anchored.overlayRef?.overlayElement.querySelector<HTMLElement>(
        '[data-part="table-cell-trigger"][data-focus]',
      ) ?? null
    );
  }

  private setOpen(next: boolean): void {
    if (next && this.disabledInput()) return;
    this.open.set(next);
    if (next) pushLayer(this.document, this.layer);
    else removeLayer(this.layer);
    flushNow(this.appRef);
  }

  private sync(): void {
    const open = this.open();
    if (open === this.applied) return;
    if (open) this.applyOpen();
    else this.applyClose();
  }

  private applyOpen(): void {
    this.applied = true;
    const ref = this.anchored.overlayRef;
    if (!ref) return;
    this.surfaceView?.detectChanges();
    this.unpark();
    // Measured only now: while it was parked the popup was off-screen and the
    // CDK had placed a box with no size.
    this.anchored.reposition();
    raiseSurface(ref);
    setSurfaceInteractive(ref, true);
    this.focusedCell()?.focus({ preventScroll: true });
    pushLayer(this.document, this.layer);
  }

  private applyClose(): void {
    this.applied = false;
    removeLayer(this.layer);
    this.surfaceView?.detectChanges();
    const ref = this.anchored.overlayRef;
    if (ref) setSurfaceInteractive(ref, false);
    this.park();
    restoreFocus(this.triggerElement());
  }

  /**
   * `.date-picker__popup` declares `display`, which overrides the `hidden`
   * attribute — so a closed popup stays laid out and swallows clicks unless it
   * is moved out of the way. Zag parks its positioner a viewport up for exactly
   * this reason.
   */
  private park(): void {
    const positioner = this.positionerElement();
    if (!positioner) return;
    positioner.style.transform = PARKED;
    positioner.style.pointerEvents = "none";
  }

  private unpark(): void {
    const positioner = this.positionerElement();
    if (!positioner) return;
    positioner.style.transform = "";
    positioner.style.pointerEvents = "";
  }
}
