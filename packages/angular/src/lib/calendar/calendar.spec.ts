import { provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  addDays,
  addMonths,
  clampYMD,
  todayYMD,
  ymdToDate,
  type YMD,
} from "@ui-organized/core";
import { calendarKeyTarget } from "./calendar-keys.js";
import { UioCalendar } from "./calendar.js";

/**
 * The half of the calendar the parity gate is blind to.
 *
 * It compares the rendered grid cell by cell, and `tabindex` is not one of the
 * attributes it compares — so roving focus, the bounds it is clamped into, and
 * the month the view follows it to are all invisible there. Each of them is a
 * silent failure when it is wrong: a grid that renders perfectly and cannot be
 * driven by a keyboard.
 *
 * Inputs are not driven from here. These specs run under the JIT compiler, which
 * never registers initializer-based inputs — see `part.spec.ts` — so the fixture
 * gets the component's *defaults*: single mode, one month, no bounds, anchored
 * on today. Everything that needs a bound is a pure function instead.
 */

describe("calendarKeyTarget", () => {
  const day = { year: 2024, month: 2, day: 15 } as const; // Friday, 15 March 2024

  it("moves by a day, a week, and to the ends of the week", () => {
    expect(calendarKeyTarget("ArrowLeft", day, 0)).toEqual({ year: 2024, month: 2, day: 14 });
    expect(calendarKeyTarget("ArrowRight", day, 0)).toEqual({ year: 2024, month: 2, day: 16 });
    expect(calendarKeyTarget("ArrowUp", day, 0)).toEqual({ year: 2024, month: 2, day: 8 });
    expect(calendarKeyTarget("ArrowDown", day, 0)).toEqual({ year: 2024, month: 2, day: 22 });
    // Sunday-first: the 15th is a Friday, so its week runs the 10th to the 16th.
    expect(calendarKeyTarget("Home", day, 0)).toEqual({ year: 2024, month: 2, day: 10 });
    expect(calendarKeyTarget("End", day, 0)).toEqual({ year: 2024, month: 2, day: 16 });
  });

  it("takes the week's first day from weekStartsOn", () => {
    // Monday-first moves both ends on by one: the 11th to the 17th.
    expect(calendarKeyTarget("Home", day, 1)).toEqual({ year: 2024, month: 2, day: 11 });
    expect(calendarKeyTarget("End", day, 1)).toEqual({ year: 2024, month: 2, day: 17 });
  });

  it("pages to the FIRST of the adjacent month, which is the shared quirk", () => {
    // Not a port bug and not to be fixed here: React, Svelte and Vue all reuse
    // `addMonths`, whose contract is "land on the first". Changing it means
    // changing @ui-organized/core for all four at once.
    expect(calendarKeyTarget("PageUp", day, 0)).toEqual({ year: 2024, month: 1, day: 1 });
    expect(calendarKeyTarget("PageDown", day, 0)).toEqual({ year: 2024, month: 3, day: 1 });
  });

  it("passes a key it does not handle back to the caller", () => {
    // `null` rather than "no move": Tab, Escape and typing all have to reach
    // whatever is around the grid, so the handler must not preventDefault them.
    expect(calendarKeyTarget("Tab", day, 0)).toBeNull();
    expect(calendarKeyTarget("a", day, 0)).toBeNull();
  });

  it("is clamped into the bounds rather than refused at them", () => {
    // The composition the grid performs. Arrowing past `min` lands *on* it, so
    // focus stops at the edge instead of leaving the selectable window.
    const min = { year: 2024, month: 2, day: 10 };
    const max = { year: 2024, month: 2, day: 20 };
    const before = calendarKeyTarget("ArrowUp", { year: 2024, month: 2, day: 11 }, 0)!;
    expect(clampYMD(before, min, max)).toEqual(min);
    const after = calendarKeyTarget("ArrowDown", { year: 2024, month: 2, day: 19 }, 0)!;
    expect(clampYMD(after, min, max)).toEqual(max);
  });
});

describe("UioCalendar roving focus", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = () => {
    const fixture = TestBed.createComponent(UioCalendar);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const days = () => [...root.querySelectorAll<HTMLElement>(".calendar__day")];
    const activeIndex = () => days().findIndex((cell) => cell.getAttribute("tabindex") === "0");
    const press = (key: string) => {
      root
        .querySelector(".calendar__grid")!
        .dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
      fixture.detectChanges();
    };
    /**
     * The active cell, named the way the component names it.
     *
     * Positional assertions would be date-dependent: a press near the end of the
     * month pages the view, and the same day is then at a different index. The
     * label is the same whichever month it is rendered in.
     */
    const activeLabel = () => days()[activeIndex()]?.getAttribute("aria-label");
    const labelFor = (day: YMD) =>
      ymdToDate(day).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    return { fixture, root, days, activeIndex, activeLabel, labelFor, press };
  };

  it("opens with exactly one day in the tab order", () => {
    // Roving focus: 42 buttons and one tab stop. Every cell at -1 would make the
    // grid unreachable; every cell at 0 would put 42 stops in the page's order.
    const { fixture, days, activeIndex } = render();
    expect(days()).toHaveLength(42);
    expect(days().filter((cell) => cell.getAttribute("tabindex") === "0")).toHaveLength(1);
    expect(activeIndex()).toBeGreaterThan(-1);
    fixture.destroy();
  });

  it("moves the focused day by a day and by a week", () => {
    const { fixture, activeLabel, labelFor, press } = render();
    const today = todayYMD();
    press("ArrowRight");
    expect(activeLabel()).toBe(labelFor(addDays(today, 1)));
    press("ArrowDown");
    expect(activeLabel()).toBe(labelFor(addDays(today, 8)));
    press("ArrowLeft");
    expect(activeLabel()).toBe(labelFor(addDays(today, 7)));
    fixture.destroy();
  });

  it("keeps the focused day on screen six weeks out", () => {
    // `ensureVisible` pages the view so the day the keys asked for is still
    // rendered and still the tab stop. Which *month* is on screen is not asserted
    // and deliberately so: the check is against the 31st of the view month, so a
    // day one or two into a short month's successor is left in the trailing
    // cells rather than paged to. React, Svelte and Vue share the expression.
    const { fixture, activeLabel, labelFor, activeIndex, press } = render();
    const today = todayYMD();
    for (let step = 0; step < 6; step++) press("ArrowDown");
    expect(activeLabel()).toBe(labelFor(addDays(today, 42)));
    expect(activeIndex()).toBeGreaterThan(-1);
    fixture.destroy();
  });

  it("pages to the 1st of the next month, not to the same day", () => {
    // The shared quirk again, this time end to end — `addMonths` lands on the
    // first, so PageDown from the 15th focuses the 1st. See `calendarKeyTarget`.
    const { fixture, days, activeIndex, activeLabel, labelFor, press } = render();
    press("PageDown");
    expect(activeLabel()).toBe(labelFor(addMonths(todayYMD(), 1)));
    expect(days()[activeIndex()]!.textContent?.trim()).toBe("1");
    fixture.destroy();
  });

  it("reports the focused day to the popover that has to open onto it", () => {
    // The date popover asks for this rather than focusing the first focusable
    // element, which would be the "Previous month" button.
    const { fixture, days, activeIndex } = render();
    const active = fixture.componentInstance.activeDayElement();
    expect(active).toBe(days()[activeIndex()]);
    expect(active?.getAttribute("aria-label")).toContain(String(todayYMD().day));
    fixture.destroy();
  });

  it("renders the year popup inside its own subtree, parked while closed", () => {
    // The whole reason the header's Select is written out here: a popup portalled
    // to the body is outside the enclosing date popover, so choosing a year would
    // read as an outside interaction and dismiss the calendar.
    const { fixture, root } = render();
    const positioner = root.querySelector<HTMLElement>(':scope > [data-part="positioner"]');
    expect(positioner).not.toBeNull();
    expect(positioner!.getAttribute("data-scope")).toBe("select");
    // `.select-popup` declares `display`, so `hidden` alone leaves it painted.
    expect(positioner!.style.transform).toContain("-100vh");
    expect(document.body.querySelector(".cdk-overlay-container")).toBeNull();
    fixture.destroy();
  });
});
