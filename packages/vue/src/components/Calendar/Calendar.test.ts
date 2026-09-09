// @vitest-environment jsdom
//
// Set per file rather than in the package's vite config: this is the only Vue
// test that needs a document, and switching the whole package to jsdom would
// make every other one pay for it.
import { describe, it, expect, afterEach, vi } from "vitest";
import { createApp, nextTick, type App } from "vue";
import Calendar from "./Calendar.vue";

/**
 * Roving focus, which the parity gate is structurally unable to see.
 *
 * The browser gate compares a DOM *contract*, and `contractOf` counts an
 * attribute as part of that contract only if it is `id`, `role`, `type`,
 * `disabled`, `hidden`, `aria-*` or `data-*`. `tabindex` is none of those, and
 * `document.activeElement` is not an attribute at all — so a calendar whose
 * arrow keys moved nothing, or moved the tab stop without moving focus, would
 * render byte-identical markup in all three libraries and the gate would report
 * it green. That is not a gap to close in the gate: `tabindex` is genuinely not
 * how this design system is styled, and widening the contract to catch one
 * component would flood every other comparison with a value the frameworks are
 * entitled to disagree about mid-render.
 *
 * So the keyboard grid is pinned here instead, in both hand-ported libraries.
 * The trap it exists for is real and specific: React does this with an effect
 * plus a `focusPending` flag, because its `setFocused` is shared with the click
 * and focus handlers; the Vue port drops both and awaits `nextTick()` inside
 * `moveFocus`, which is the only keyboard path. If that await ever goes, the
 * lookup runs against the previous DOM — and on a `PageUp`/`PageDown` that
 * remounts every button it finds a node that has just been discarded, so focus
 * silently lands nowhere and the calendar stops being keyboard-operable.
 *
 * The Vue port has a second way to lose the same thing. Its day buttons carry a
 * function `ref` that populates the `dayRefs` map keyed by ISO date; Vue calls
 * that ref with `null` on unmount, and it deletes on `null`. If the delete ever
 * ran *after* the insert for a remounted button with the same key — which is
 * what a month page is — the map would end up empty for the day just navigated
 * to. Nothing here is asserted about the map directly; the focus assertions are
 * what would catch it.
 */
describe("Calendar roving focus", () => {
  /**
   * March 2024, chosen because it starts on a Friday: the grid's first row is
   * five February days, so the month is nowhere near a row boundary and the
   * arithmetic below has nothing to hide behind.
   *
   *   row 1 | Feb 25 26 27 28 29 | Mar  1  2
   *   row 2 | Mar  3  4  5  6  7  8  9
   *   row 3 | Mar 10 11 12 13 14 15 16
   *   row 4 | Mar 17 18 19 20 21 22 23
   *   row 5 | Mar 24 25 26 27 28 29 30
   *   row 6 | Mar 31 | Apr  1  2  3  4  5  6
   */
  const MARCH_15 = { year: 2024, month: 2, day: 15 };
  /** Cell 0 is February 25, so March N is cell 4 + N. */
  const LEAD = 4;

  const mounted: { app: App; host: HTMLElement }[] = [];
  afterEach(() => {
    for (const { app, host } of mounted.splice(0)) {
      app.unmount();
      host.remove();
    }
    vi.restoreAllMocks();
  });

  const open = (props: Record<string, unknown> = {}) => {
    // No icon set is registered in a unit test, so the header's nav buttons say
    // so — once per Icon, and irrelevantly to focus.
    vi.spyOn(console, "warn").mockImplementation(() => {});
    // Attached to the document, not rendered in a detached fragment: an element
    // outside the document cannot take focus, and every assertion below is
    // about `document.activeElement`.
    const host = document.createElement("div");
    document.body.append(host);
    const app = createApp(Calendar, { mode: "single", value: MARCH_15, ...props });
    app.mount(host);
    mounted.push({ app, host });

    const grid = () => host.querySelector<HTMLElement>(".calendar__grid")!;
    // Re-queried on every call: a month change remounts every button, and a
    // list captured before one is a list of detached nodes.
    const days = () => [...host.querySelectorAll<HTMLButtonElement>(".calendar__day")];
    return {
      host,
      grid,
      days,
      /** The button for the given day of the *displayed* month. */
      march: (day: number) => days()[LEAD + day]!,
      monthName: () => host.querySelector(".calendar__month-name")!.textContent!.trim(),
      press: async (key: string) => {
        grid().dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
        // Twice: `moveFocus` awaits one tick before looking the node up, and a
        // month change re-renders on the tick after that.
        await nextTick();
        await nextTick();
      },
    };
  };

  it("starts with the selected day as the only tab stop, and does not steal focus", async () => {
    const cal = open();
    await nextTick();

    // Exactly one 0 among 42 cells — a roving tabindex, not 42 tab stops and
    // not none. The gate cannot assert either, since `tabindex` is not part of
    // the compared contract.
    expect(cal.days().filter((d) => d.tabIndex === 0)).toEqual([cal.march(15)]);
    // And rendering must not move DOM focus. The popup decides that, from
    // `onActiveDay` — a calendar that focused itself on mount would yank focus
    // out of the field the moment a value changed under it.
    expect(document.activeElement).not.toBe(cal.march(15));
  });

  it("moves a day at a time with the left and right arrows", async () => {
    const cal = open();
    await nextTick();

    await cal.press("ArrowRight");
    expect(document.activeElement).toBe(cal.march(16));
    expect(cal.march(16).tabIndex).toBe(0);
    // The tab stop is a stop, singular: the day it left has to give it up.
    expect(cal.march(15).tabIndex).toBe(-1);

    await cal.press("ArrowLeft");
    await cal.press("ArrowLeft");
    expect(document.activeElement).toBe(cal.march(14));
  });

  it("moves a week at a time with the up and down arrows", async () => {
    const cal = open();
    await nextTick();

    await cal.press("ArrowDown");
    expect(document.activeElement).toBe(cal.march(22));
    await cal.press("ArrowUp");
    await cal.press("ArrowUp");
    // Seven back from the 22nd, which is a different row and the same column.
    expect(document.activeElement).toBe(cal.march(8));
  });

  it("moves to the ends of the week with Home and End", async () => {
    const cal = open();
    await nextTick();

    // The 15th is a Friday, so its week runs Sunday the 10th to Saturday the
    // 16th. Home and End are relative to `weekStartsOn`, not to the month.
    await cal.press("Home");
    expect(document.activeElement).toBe(cal.march(10));
    await cal.press("End");
    expect(document.activeElement).toBe(cal.march(16));
  });

  it("pages the view a month at a time with PageUp and PageDown", async () => {
    const cal = open();
    await nextTick();

    await cal.press("PageUp");
    expect(cal.monthName()).toBe("February");
    /**
     * The 1st, not the 15th — and deliberately pinned as such.
     *
     * Both handlers go through `addMonths`, whose contract is "add whole
     * months, landing on the first of the resulting month": it is the view
     * pager, and it discards the day. A date grid conventionally keeps the day
     * of the month across a page, so this is a real deviation — but it is one
     * shared verbatim by React, Svelte and Vue, since all three call the same
     * `@ui-organized/core` helper. The parity gate is right to stay silent
     * about it, and it is not a port's to fix. Asserted rather than glossed so
     * that whoever changes `addMonths` finds out here.
     */
    expect(document.activeElement!.textContent!.trim()).toBe("1");
    expect(document.activeElement).toBe(cal.days()[4]);

    await cal.press("PageDown");
    await cal.press("PageDown");
    expect(cal.monthName()).toBe("April");
    // The whole point of the await inside `moveFocus`: paging remounts every
    // button, so a focus call made before the DOM caught up would land on a
    // node that is no longer in the document.
    expect(document.body.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).toBe(cal.days()[1]);
    expect(document.activeElement!.textContent!.trim()).toBe("1");
  });

  it("selects the focused day with Enter and Space, and swallows the key", async () => {
    const onSelect = vi.fn();
    const cal = open({ onSelect });
    await nextTick();

    await cal.press("ArrowRight");
    /**
     * Dispatched by hand rather than through `press`, so that `defaultPrevented`
     * can be read back off the event. Space on a focused button would otherwise
     * scroll the page out from under the calendar, and the handler's
     * `preventDefault()` is the only thing stopping it — a detail a port drops
     * by returning early from the switch.
     */
    const press = (key: string) => {
      const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
      cal.grid().dispatchEvent(event);
      return event.defaultPrevented;
    };
    expect(press("Enter")).toBe(true);
    expect(onSelect).toHaveBeenCalledWith({ year: 2024, month: 2, day: 16 });
    expect(press(" ")).toBe(true);
    expect(onSelect).toHaveBeenCalledTimes(2);
    // An unhandled key falls through untouched — the grid is not a keyboard trap.
    expect(press("a")).toBe(false);
  });

  it("clamps movement to the min/max window instead of leaving it", async () => {
    const cal = open({
      min: { year: 2024, month: 2, day: 14 },
      max: { year: 2024, month: 2, day: 16 },
    });
    await nextTick();

    // A week up from the 15th is the 8th, which is outside the window — and a
    // day outside it is `disabled`, so focus would be lost rather than merely
    // misplaced. `clampYMD` is what stops that.
    await cal.press("ArrowUp");
    expect(document.activeElement).toBe(cal.march(14));
    await cal.press("ArrowDown");
    await cal.press("ArrowDown");
    expect(document.activeElement).toBe(cal.march(16));
  });
});
