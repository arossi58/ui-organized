import {
  ApplicationRef,
  Component,
  DOCUMENT,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from "@angular/core";
import {
  clampYMD,
  compareYMD,
  isSameMonth,
  isSameYMD,
  isWithin,
  monthGrid,
  monthLabel,
  monthName,
  addMonths,
  startOfMonth,
  toISODate,
  todayYMD,
  weekdayLabels,
  ymdToDate,
  selectFieldStyles,
  type YMD,
} from "@ui-organized/core";
import { UioButton } from "../button/button.js";
import { UioIcon } from "../icons/icon.js";
import { nextMachineId, VISUALLY_HIDDEN_INPUT } from "../part-ids.js";
import { pushLayer, removeLayer, type DismissibleLayer } from "../overlay/dismiss.js";
import { flushNow } from "../overlay/flush.js";
import { restoreFocus } from "../overlay/focus.js";
import { moveHighlight } from "../overlay/roving.js";
import { applyOverlayStacking } from "../overlay/stacking.js";
import { stateFlag } from "../part.js";
import { calendarKeyTarget } from "./calendar-keys.js";

/** The start and end of a range selection; either end may be missing. */
export interface CalendarRange {
  start: YMD | null;
  end: YMD | null;
}

/**
 * A day cell, fully resolved.
 *
 * Every attribute is decided here rather than in the template, because each one
 * is a small expression over five signals and the template would evaluate all of
 * them again on every change-detection pass, for 42 cells per month. Resolving
 * into a memoised `computed()` means the grid is rebuilt when a signal it reads
 * changes and not otherwise.
 *
 * The flags are `"true"` or `null`, not `""` or `null`. That is the one place in
 * this package where {@link stateFlag} is the wrong encoding: `Calendar` is
 * hand-written in all four libraries rather than emitted by a Zag machine, and
 * the other three write `data-selected={selected || undefined}` — which React,
 * Svelte and Vue all render as the string `"true"`. The stylesheet only tests
 * presence, but the parity gate compares the value.
 */
interface DayCell {
  ymd: YMD;
  iso: string;
  day: number;
  ariaLabel: string;
  disabled: boolean;
  tabIndex: number;
  outside: "true" | null;
  today: "true" | null;
  selected: "true" | null;
  rangeLo: "true" | null;
  rangeHi: "true" | null;
  inRange: "true" | null;
  ariaSelected: "true" | null;
  ariaCurrent: "date" | null;
}

/** The ids one year `Select` in the header needs, allocated once per pane. */
interface YearIds {
  field: string;
  select: string;
  label: string;
  control: string;
  trigger: string;
  positioner: string;
  content: string;
}

interface MonthPane {
  key: string;
  index: number;
  anchor: YMD;
  name: string;
  label: string;
  /** The visible year as text — a `<select>`'s `value` is a string, not a number. */
  year: string;
  weeks: DayCell[][];
  ids: YearIds;
}

/** One entry in the year dropdown, with the string form both bindings need. */
interface YearOption {
  year: number;
  text: string;
}

/** `monthGrid`'s flat run of days, split into the weeks it already represents. */
function weeksOf<T>(cells: T[]): T[][] {
  const weeks: T[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function orderedPair(a: YMD, b: YMD): [YMD, YMD] {
  return compareYMD(a, b) <= 0 ? [a, b] : [b, a];
}

const flagged = (on: boolean): "true" | null => (on ? "true" : null);

/** Icons in the header follow the small control size, as the ghost Select does. */
const HEADER_ICON_SIZE = 16;

/** The gap Ark's Select leaves between its trigger and its popup. */
const YEAR_POPUP_GUTTER = 4;

/**
 * Parked off-screen rather than merely `hidden`.
 *
 * `.select-popup` declares `display: flex`, which overrides the `hidden`
 * attribute — a closed listbox stays laid out, keeps its size, and swallows
 * clicks over the grid behind it. Zag moves the positioner a viewport out of the
 * way for exactly this reason; the same two properties do it here.
 */
const PARKED = "translate3d(0px, -100vh, 0px)";

/**
 * The design-system calendar grid, shared by the date fields' popover.
 *
 * Internal: it is not exported from the package barrel and has no parity case,
 * because it has no public DOM contract of its own — every pixel of it reaches a
 * user through DateInput, DateTimeInput or DateRangeInput.
 *
 * ── The year Select is written out here, and that is the notable difference ──
 *
 * React, Svelte and Vue all render the design system's own `Select` in the
 * header and hand it `portalContainer={calendarRoot}`, so its popup lands inside
 * the calendar's subtree rather than in `document.body`. That is not cosmetic: a
 * popup in the body is *outside* the enclosing date popover, so clicking an
 * option reads as an outside interaction and dismisses the whole calendar under
 * the user's cursor.
 *
 * `UioSelect` has no equivalent input, and it could not simply grow one: it
 * builds a CDK overlay, and a CDK overlay carries a container and a pane —
 * two elements the other three libraries do not render, sitting inside the
 * subtree the parity gate compares cell by cell. So the header's Select is
 * written out here instead, as the same DOM `UioSelect` produces, with its
 * positioner as a plain child of the calendar root. The behaviour it keeps is
 * the behaviour this component needs: open, choose, dismiss, and roving
 * highlight. Anything richer belongs in `UioSelect`, and a caller who wants that
 * is not inside a calendar.
 */
@Component({
  selector: "div[uioCalendar]",
  standalone: true,
  exportAs: "uioCalendar",
  imports: [UioButton, UioIcon],
  host: {
    class: "calendar",
    // The containing block the header's year popup is positioned against. The
    // grid is all in-flow, so nothing else in the calendar is affected.
    "[style.position]": "'relative'",
    "(mouseleave)": "hover.set(null)",
  },
  template: `
    <div class="calendar__header">
      <button
        uioButton
        intent="ghost"
        size="sm"
        icon="chevron-left"
        class="calendar__nav"
        aria-label="Previous month"
        [disabled]="prevDisabled()"
        (click)="page(-1)"
      ></button>
      <div class="calendar__labels">
        @for (pane of panes(); track pane.key) {
          <div class="calendar__label">
            <span class="calendar__month-name text-emphasis-body-large">{{ pane.name }}</span>
            <div
              role="group"
              data-scope="field"
              data-part="root"
              [class]="yearFieldClass"
              [id]="pane.ids.field"
            >
              <div
                class="select-field__control"
                data-scope="select"
                data-part="root"
                [id]="pane.ids.select"
              >
                <label
                  class="select-field__label--hidden"
                  data-scope="select"
                  data-part="label"
                  [id]="pane.ids.label"
                  [attr.for]="pane.ids.control"
                  >Year, {{ pane.name }}</label
                >
                <button
                  class="select-field__trigger text-default-body-large"
                  data-scope="select"
                  data-part="trigger"
                  type="button"
                  role="combobox"
                  aria-haspopup="listbox"
                  aria-invalid="false"
                  aria-required="false"
                  [id]="pane.ids.trigger"
                  [attr.data-state]="yearState(pane.index)"
                  [attr.aria-expanded]="openYear() === pane.index ? 'true' : 'false'"
                  [attr.aria-labelledby]="pane.ids.label"
                  [attr.aria-controls]="openYear() === pane.index ? pane.ids.content : null"
                  [attr.data-placement]="yearPlacement(pane.key)"
                  [attr.data-side]="yearSide(pane.key)"
                  (click)="toggleYear(pane)"
                >
                  <span class="select-field__value" data-scope="select" data-part="value-text">{{
                    pane.anchor.year
                  }}</span>
                  <div
                    class="select-field__icon"
                    data-scope="select"
                    data-part="indicator"
                    aria-hidden="true"
                    [attr.data-state]="yearState(pane.index)"
                  >
                    <span uioIcon name="chevron-down" [size]="HEADER_ICON_SIZE"></span>
                  </div>
                </button>
                <!--
                  The control a form would submit, and what the label names. The
                  calendar never submits anything, but Ark's Select renders one
                  and the four libraries render the same tree.
                -->
                <select
                  aria-hidden="true"
                  tabindex="-1"
                  [id]="pane.ids.control"
                  [attr.style]="HIDDEN"
                  [attr.aria-labelledby]="pane.ids.label"
                  [value]="pane.year"
                >
                  @for (option of yearOptions(); track option.year) {
                    <option [value]="option.text">{{ option.text }}</option>
                  }
                </select>
              </div>
            </div>
          </div>
        }
      </div>
      <button
        uioButton
        intent="ghost"
        size="sm"
        icon="chevron-right"
        class="calendar__nav"
        aria-label="Next month"
        [disabled]="nextDisabled()"
        (click)="page(1)"
      ></button>
    </div>

    <div class="calendar__months">
      @for (pane of panes(); track pane.key) {
        <div class="calendar__month">
          <div class="calendar__weekdays" aria-hidden="true">
            @for (weekday of weekdays(); track $index) {
              <span class="calendar__weekday text-default-body-small">{{ weekday }}</span>
            }
          </div>
          <!--
            Weeks are real rows. A grid may only own rows, and a gridcell may
            only sit in one — a flat run of 42 day buttons under role="grid" is
            neither. 'monthGrid' always returns six whole weeks, so the chunking
            is exact.

            The grid itself is not a tab stop: focus lives on the day buttons,
            one of which always carries tabindex=0 (roving focus).
          -->
          <div
            class="calendar__grid"
            role="grid"
            [attr.aria-label]="pane.label"
            (keydown)="onGridKeydown($event)"
          >
            @for (week of pane.weeks; track week[0]!.iso) {
              <div class="calendar__week" role="row">
                @for (cell of week; track cell.iso) {
                  <button
                    class="calendar__day"
                    type="button"
                    role="gridcell"
                    [attr.tabindex]="cell.tabIndex"
                    [disabled]="cell.disabled"
                    [attr.aria-label]="cell.ariaLabel"
                    [attr.aria-selected]="cell.ariaSelected"
                    [attr.aria-current]="cell.ariaCurrent"
                    [attr.data-outside]="cell.outside"
                    [attr.data-today]="cell.today"
                    [attr.data-selected]="cell.selected"
                    [attr.data-range-lo]="cell.rangeLo"
                    [attr.data-range-hi]="cell.rangeHi"
                    [attr.data-in-range]="cell.inRange"
                    (click)="onDayClick(cell.ymd)"
                    (mouseenter)="onDayHover(cell.ymd)"
                    (focus)="focused.set(cell.ymd)"
                  >
                    <span class="calendar__day-label text-default-body-large">{{ cell.day }}</span>
                  </button>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>

    <!--
      The year popups, as plain children of the calendar root — which is where
      the other three libraries portal theirs. See the class comment.
    -->
    @for (pane of panes(); track pane.key) {
      <div
        class="select-positioner"
        data-scope="select"
        data-part="positioner"
        style="position: absolute; top: 0; left: 0; min-width: max-content; pointer-events: none; transform: translate3d(0px, -100vh, 0px);"
        [id]="pane.ids.positioner"
      >
        <div
          class="select-popup select-popup--ghost"
          data-scope="select"
          data-part="content"
          role="listbox"
          tabindex="0"
          [id]="pane.ids.content"
          [attr.data-state]="yearState(pane.index)"
          [attr.hidden]="openYear() === pane.index ? null : ''"
          [attr.aria-labelledby]="pane.ids.label"
          [attr.data-placement]="yearPlacement(pane.key)"
          [attr.data-side]="yearSide(pane.key)"
          [attr.aria-activedescendant]="activeYearOption(pane)"
          [attr.data-activedescendant]="activeYearOption(pane)"
          (keydown)="onYearKeydown($event, pane.index)"
        >
          @for (option of yearOptions(); track option.year) {
            <div
              class="select-popup__item text-default-body-large"
              data-scope="select"
              data-part="item"
              role="option"
              [id]="yearOptionId(pane, option.year)"
              [attr.data-value]="option.text"
              [attr.aria-selected]="option.year === pane.anchor.year ? 'true' : 'false'"
              [attr.data-state]="option.year === pane.anchor.year ? 'checked' : 'unchecked'"
              [attr.data-highlighted]="highlightedFlag(pane.index, option.year)"
              (click)="chooseYear(pane.index, option.year)"
              (pointermove)="highlightedYear.set(option.year)"
            >
              <span
                data-scope="select"
                data-part="item-text"
                [attr.data-state]="option.year === pane.anchor.year ? 'checked' : 'unchecked'"
                [attr.data-highlighted]="highlightedFlag(pane.index, option.year)"
                >{{ option.text }}</span
              >
              <div
                class="select-popup__item-indicator"
                data-scope="select"
                data-part="item-indicator"
                aria-hidden="true"
                [attr.data-state]="option.year === pane.anchor.year ? 'checked' : 'unchecked'"
                [attr.hidden]="option.year === pane.anchor.year ? null : ''"
              >
                <span uioIcon name="check" [size]="HEADER_ICON_SIZE"></span>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class UioCalendar implements OnInit, OnDestroy {
  /** "single" selects one day; "range" selects a start-to-end pair. */
  readonly mode = input<"single" | "range">("single");
  /** Selected day in single mode. */
  readonly value = input<YMD | null>(null);
  /** Selected range in range mode. */
  readonly rangeValue = input<CalendarRange | null>(null);
  readonly min = input<YMD | null>(null);
  readonly max = input<YMD | null>(null);
  /** Number of months shown side by side. */
  readonly numMonths = input(1);
  /** First day of the week: 0 = Sunday (default), 1 = Monday. */
  readonly weekStartsOn = input(0);

  /** The chosen day, in single mode. */
  readonly daySelect = output<YMD>();
  /** The updated range, in range mode. */
  readonly rangeChange = output<CalendarRange>();
  /** Both ends of a range have been chosen; the caller may close. */
  readonly rangeComplete = output<void>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly appRef = inject(ApplicationRef);

  private readonly today = todayYMD();

  /**
   * Where the calendar opens. Seeded in `ngOnInit` and never again.
   *
   * `ngOnInit` rather than a field initialiser because that is the first moment
   * the inputs are bound — a signal input read in the constructor answers with
   * its default, so a calendar opened on a selected day would always open on
   * today. And *once* rather than reactively, because recomputing would drag the
   * view back to the selected month every time the value changed under a user
   * who had paged away — which is exactly what happens when a range's first end
   * is chosen.
   */
  private readonly viewMonth = signal<YMD>(startOfMonth(this.today));
  protected readonly focused = signal<YMD>(this.today);
  protected readonly hover = signal<YMD | null>(null);

  protected readonly openYear = signal<number | null>(null);
  protected readonly highlightedYear = signal<number | null>(null);
  /**
   * Which panes' popups have been positioned at least once.
   *
   * `data-placement` and `data-side` are sticky in Ark — they appear the first
   * time a popup opens and stay after it closes — and a trigger claiming a side
   * before anything has been placed is a difference the stylesheet can see.
   *
   * Keyed by the *month*, not by the pane's position. Choosing a year moves the
   * view, which changes every pane's key, and the other three libraries key
   * their `Select` the same way — so the replacement Select has never been
   * opened and reports no placement. Tracking by index would leave the attribute
   * on a control that had just been remounted.
   */
  private readonly placed = signal<ReadonlySet<string>>(new Set());

  protected readonly HIDDEN = VISUALLY_HIDDEN_INPUT;
  protected readonly HEADER_ICON_SIZE = HEADER_ICON_SIZE;
  protected readonly yearFieldClass = selectFieldStyles({ size: "sm", variant: "ghost" });

  /** Allocated lazily and kept, so a pane's ids survive paging and re-render. */
  private readonly yearIdCache: YearIds[] = [];

  protected readonly months = computed(() =>
    Array.from({ length: this.numMonths() }, (_, i) => addMonths(this.viewMonth(), i)),
  );

  private readonly lastVisible = computed(() => addMonths(this.viewMonth(), this.numMonths() - 1));

  protected readonly weekdays = computed(() => weekdayLabels(this.weekStartsOn()));

  /** Can't page earlier than the month containing `min`, nor later than `max`. */
  protected readonly prevDisabled = computed(() => {
    const min = this.min();
    return min ? compareYMD(this.viewMonth(), startOfMonth(min)) <= 0 : false;
  });
  protected readonly nextDisabled = computed(() => {
    const max = this.max();
    return max ? compareYMD(startOfMonth(this.lastVisible()), startOfMonth(max)) >= 0 : false;
  });

  /**
   * Year options: bounded by min/max when set, else a wide default window,
   * always widened to include every visible year.
   */
  protected readonly years = computed(() => {
    const min = this.min();
    const max = this.max();
    const base = this.today.year;
    const lo = Math.min(min ? min.year : base - 100, this.viewMonth().year);
    const hi = Math.max(max ? max.year : base + 10, this.lastVisible().year);
    const out: number[] = [];
    for (let year = lo; year <= hi; year++) out.push(year);
    return out;
  });

  protected readonly yearOptions = computed((): YearOption[] =>
    this.years().map((year) => ({ year, text: String(year) })),
  );

  /**
   * The active range endpoints, resolved from *either* the committed range or
   * the start-to-hover preview, so the in-range band renders the same either way.
   */
  private readonly band = computed((): { lo: YMD | null; hi: YMD | null } => {
    if (this.mode() !== "range") return { lo: null, hi: null };
    const start = this.rangeValue()?.start ?? null;
    if (!start) return { lo: null, hi: null };
    const other = (this.rangeValue()?.end ?? null) ?? this.hover();
    if (!other) return { lo: null, hi: null };
    const [lo, hi] = orderedPair(start, other);
    return { lo, hi };
  });

  protected readonly panes = computed((): MonthPane[] => {
    const mode = this.mode();
    const value = this.value();
    const start = this.rangeValue()?.start ?? null;
    const end = this.rangeValue()?.end ?? null;
    const { lo, hi } = this.band();
    const min = this.min();
    const max = this.max();
    const focused = this.focused();
    const weekStartsOn = this.weekStartsOn();

    return this.months().map((anchor, index) => {
      const cells = monthGrid(anchor.year, anchor.month, weekStartsOn).map((d): DayCell => {
        const isLo = !!lo && isSameYMD(d, lo);
        const isHi = !!hi && isSameYMD(d, hi);
        const endpoint =
          mode === "range" && (isSameYMD(d, start) || isSameYMD(d, end) || isLo || isHi);
        const selected = (mode === "single" && isSameYMD(d, value)) || endpoint;
        const banded = !!lo && !!hi && !isSameYMD(lo, hi);
        return {
          ymd: d,
          iso: toISODate(d),
          day: d.day,
          ariaLabel: ymdToDate(d).toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          disabled: !isWithin(d, min, max),
          tabIndex: isSameYMD(d, focused) ? 0 : -1,
          outside: flagged(!isSameMonth(d, anchor)),
          today: flagged(isSameYMD(d, this.today)),
          selected: flagged(selected),
          rangeLo: flagged(isLo && banded),
          rangeHi: flagged(isHi && banded),
          inRange:
            flagged(!!lo && !!hi && compareYMD(d, lo) > 0 && compareYMD(d, hi) < 0),
          ariaSelected: flagged(selected),
          ariaCurrent: isSameYMD(d, this.today) ? "date" : null,
        };
      });

      return {
        key: `${anchor.year}-${anchor.month}`,
        index,
        anchor,
        name: monthName(anchor.year, anchor.month),
        label: monthLabel(anchor.year, anchor.month),
        year: String(anchor.year),
        weeks: weeksOf(cells),
        ids: this.yearIds(index),
      };
    });
  });

  private readonly yearLayer: DismissibleLayer = {
    surface: () => this.yearPositioner(this.openYear()),
    trigger: () => this.yearTrigger(this.openYear()),
    dismiss: () => this.closeYear(),
  };

  ngOnInit(): void {
    const anchor =
      (this.mode() === "single" ? this.value() : (this.rangeValue()?.start ?? null)) ??
      clampYMD(this.today, this.min(), this.max());
    this.viewMonth.set(startOfMonth(anchor));
    this.focused.set(anchor);
  }

  ngOnDestroy(): void {
    // A calendar torn down with its year list open would otherwise leave a layer
    // on the dismissal stack, and every later Escape would reach it first.
    removeLayer(this.yearLayer);
  }

  /**
   * The day the popover should focus when it opens.
   *
   * Read off the DOM rather than tracked, because the element the roving
   * `tabindex` is on *is* the answer, and it is the same one the caller would
   * have to look up anyway.
   */
  activeDayElement(): HTMLElement | null {
    return this.host.nativeElement.querySelector<HTMLElement>('.calendar__day[tabindex="0"]');
  }

  protected page(delta: number): void {
    this.viewMonth.set(addMonths(this.viewMonth(), delta));
    // A discrete interaction, so the grid catches up before the click returns —
    // see `flushNow`, and `write` in `UioDateFieldBase` for the same reason.
    flushNow(this.appRef);
  }

  protected onDayClick(day: YMD): void {
    this.focused.set(day);
    this.selectDay(day);
  }

  protected onDayHover(day: YMD): void {
    const range = this.rangeValue();
    if (this.mode() === "range" && range?.start && !range.end) this.hover.set(day);
  }

  protected onGridKeydown(event: KeyboardEvent): void {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.selectDay(this.focused());
      return;
    }
    const target = calendarKeyTarget(event.key, this.focused(), this.weekStartsOn());
    if (!target) return;
    event.preventDefault();
    this.moveFocus(clampYMD(target, this.min(), this.max()));
  }

  private selectDay(day: YMD): void {
    if (!isWithin(day, this.min(), this.max())) return;
    if (this.mode() === "single") {
      this.daySelect.emit(day);
      return;
    }
    const start = this.rangeValue()?.start ?? null;
    const end = this.rangeValue()?.end ?? null;
    if (!start || end || compareYMD(day, start) < 0) {
      this.rangeChange.emit({ start: day, end: null });
    } else {
      this.rangeChange.emit({ start, end: day });
      this.rangeComplete.emit();
    }
  }

  /**
   * Roving focus, moved only by the keyboard.
   *
   * The view may page here, which re-renders every button, so the DOM has to
   * catch up before the new node can be focused — hence the flush. Hover and
   * render never call this: opening the popup must not yank focus around.
   */
  private moveFocus(next: YMD): void {
    this.focused.set(next);
    this.ensureVisible(next);
    flushNow(this.appRef);
    this.activeDayElement()?.focus({ preventScroll: true });
  }

  private ensureVisible(day: YMD): void {
    const view = this.viewMonth();
    const last = this.lastVisible();
    if (compareYMD(day, view) < 0) {
      this.viewMonth.set(startOfMonth(day));
    } else if (compareYMD(day, { ...last, day: 31 }) > 0) {
      this.viewMonth.set(startOfMonth(addMonths(day, -(this.numMonths() - 1))));
    }
  }

  // ── The header's year Select ───────────────────────────────────────────────

  /**
   * Allocated on first use and kept, so a pane's ids survive paging.
   *
   * Called from `panes()`, which is a computed — the cache write is the only
   * side effect in it, and it is idempotent, so a recompute cannot renumber a
   * control that is already on screen.
   */
  private yearIds(index: number): YearIds {
    while (this.yearIdCache.length <= index) {
      const field = nextMachineId();
      const select = nextMachineId();
      this.yearIdCache.push({
        field: `field:${field}`,
        select: `select:${select}`,
        label: `field:${field}:label`,
        control: `field:${field}:control`,
        trigger: `select:${select}:trigger`,
        positioner: `select:${select}:positioner`,
        content: `select:${select}:content`,
      });
    }
    return this.yearIdCache[index]!;
  }

  protected yearOptionId(pane: MonthPane, year: number): string {
    return `${pane.ids.select}:option:${year}`;
  }

  protected yearState(index: number): "open" | "closed" {
    return this.openYear() === index ? "open" : "closed";
  }

  protected yearPlacement(key: string): string | null {
    return this.placed().has(key) ? "bottom-start" : null;
  }

  protected yearSide(key: string): string | null {
    return this.placed().has(key) ? "bottom" : null;
  }

  protected highlightedFlag(index: number, year: number): "" | null {
    return stateFlag(this.openYear() === index && this.highlightedYear() === year);
  }

  protected activeYearOption(pane: MonthPane): string | null {
    if (this.openYear() !== pane.index) return null;
    const year = this.highlightedYear();
    return year === null ? null : this.yearOptionId(pane, year);
  }

  protected toggleYear(pane: MonthPane): void {
    const index = pane.index;
    if (this.openYear() === index) {
      this.closeYear();
      return;
    }
    this.openYear.set(index);
    this.highlightedYear.set(pane.anchor.year);
    this.placed.update((current) => new Set(current).add(pane.key));
    // Before measuring: while it was parked the popup carried a transform, and
    // the attributes that say it is open have not reached the DOM yet.
    flushNow(this.appRef);
    this.positionYear(index);
    pushLayer(this.document, this.yearLayer);
    this.yearContent(index)?.focus({ preventScroll: true });
  }

  protected chooseYear(index: number, year: number): void {
    const targetMonth = addMonths(this.viewMonth(), index).month;
    const view = addMonths({ year, month: targetMonth, day: 1 }, -index);
    this.viewMonth.set(view);
    this.focused.set(clampYMD(startOfMonth(view), this.min(), this.max()));
    this.closeYear();
  }

  protected onYearKeydown(event: KeyboardEvent, index: number): void {
    const years = this.years();
    const navigable = years.map(() => ({ disabled: false }));
    const current = years.indexOf(this.highlightedYear() ?? Number.NaN);

    const move = (step: number) => {
      const next = years[moveHighlight(navigable, current, step)];
      if (next !== undefined) this.highlightedYear.set(next);
      event.preventDefault();
    };

    switch (event.key) {
      case "ArrowDown":
        return move(1);
      case "ArrowUp":
        return move(-1);
      case "Home":
        this.highlightedYear.set(null);
        return move(1);
      case "End":
        this.highlightedYear.set(null);
        return move(-1);
      case "Enter":
      case " ": {
        event.preventDefault();
        const year = years[current];
        if (year !== undefined) this.chooseYear(index, year);
        return;
      }
      case "Tab":
        this.closeYear();
        return;
      default:
        return;
    }
  }

  private closeYear(): void {
    const index = this.openYear();
    if (index === null) return;
    this.openYear.set(null);
    this.highlightedYear.set(null);
    removeLayer(this.yearLayer);
    flushNow(this.appRef);
    this.parkYear(index);
    restoreFocus(this.yearTrigger(index));
  }

  /**
   * The header trigger and the popup are in two different places in the tree —
   * the trigger inside its month label, the popup a direct child of the root —
   * so they are found by their own position rather than by a shared ancestor.
   */
  private yearTrigger(index: number | null): HTMLElement | null {
    if (index === null) return null;
    const label = this.host.nativeElement.querySelectorAll<HTMLElement>(".calendar__label")[index];
    return label?.querySelector<HTMLElement>('[data-part="trigger"]') ?? null;
  }

  private yearPositioner(index: number | null): HTMLElement | null {
    if (index === null) return null;
    return (
      this.host.nativeElement.querySelectorAll<HTMLElement>(":scope > .select-positioner")[index] ??
      null
    );
  }

  private yearContent(index: number | null): HTMLElement | null {
    return this.yearPositioner(index)?.querySelector<HTMLElement>('[data-part="content"]') ?? null;
  }

  /**
   * Place the popup under its trigger, in the calendar's own coordinates.
   *
   * The other three libraries get this from zag's popper, which writes a fixed
   * position onto the positioner. A fixed position is wrong here: the calendar
   * sits inside a CDK overlay pane that carries a transform, which becomes the
   * containing block for any fixed descendant. Measuring against the calendar
   * root and positioning absolutely inside it is the same placement and follows
   * the popover if it ever moves.
   */
  private positionYear(index: number): void {
    const positioner = this.yearPositioner(index);
    const trigger = this.yearTrigger(index);
    if (!positioner || !trigger) return;
    const root = this.host.nativeElement.getBoundingClientRect();
    const box = trigger.getBoundingClientRect();
    positioner.style.transform = "";
    positioner.style.pointerEvents = "";
    positioner.style.left = `${box.left - root.left}px`;
    positioner.style.top = `${box.bottom - root.top + YEAR_POPUP_GUTTER}px`;
    // `.select-popup` is `width: var(--reference-width)` — zag measures the
    // trigger and publishes it on the positioner; nothing else does.
    positioner.style.setProperty("--reference-width", `${box.width}px`);
    // There is no CDK pane here, so the positioner is both the thing that is
    // stacked and the thing that declares the level — see `applyOverlayStacking`.
    applyOverlayStacking(positioner, positioner);
  }

  private parkYear(index: number): void {
    const positioner = this.yearPositioner(index);
    if (!positioner) return;
    positioner.style.transform = PARKED;
    positioner.style.pointerEvents = "none";
  }
}
