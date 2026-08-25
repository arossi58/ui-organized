import { Component, ViewChild, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  UioSplitter,
  applySplitterDelta,
  resolveSplitterSizes,
  splitterAriaValues,
  type SplitterPanelDef,
} from "./splitter.js";

/**
 * A splitter is arithmetic with a drag handle on it, and the browser gate can
 * only see the arithmetic's *result* in one layout at a time.
 *
 * The pure functions are asserted directly, because the cases that go wrong are
 * the ones no fixture would think to render: a layout whose panels cannot all
 * be satisfied, a pair whose sizes have to keep summing to what they summed to,
 * a collapsible panel deciding whether the user meant "smaller" or "gone".
 */
const two: SplitterPanelDef[] = [{ id: "a" }, { id: "b" }];

@Component({
  standalone: true,
  imports: [UioSplitter],
  template: `<div uioSplitter></div>`,
})
class Host {
  @ViewChild(UioSplitter, { static: true }) splitter!: UioSplitter;
}

describe("splitter arithmetic", () => {
  it("splits what is left over evenly", () => {
    // Compared loosely on purpose: sizes are rounded to ten decimal places, so
    // three panels come out as 33.3333333333 rather than as a third. That is
    // zag's precision and it is load-bearing — a splitter divides 100 by three
    // and adds the parts back up, and an exact comparison anywhere in the chain
    // decides the layout changed on every render.
    const thirds = resolveSplitterSizes([{ id: "a" }, { id: "b" }, { id: "c" }], undefined);
    for (const size of thirds) expect(size).toBeCloseTo(100 / 3, 9);
    expect(thirds.reduce((sum, size) => sum + size, 0)).toBeCloseTo(100, 9);

    expect(resolveSplitterSizes(two, [70])).toEqual([70, 30]);
  });

  it("makes a layout legal, and gives the surplus to a panel that can take it", () => {
    // The pass that is easy to leave out: an even split ignores every min and
    // max, so a panel pinned to 30% would render at 50 and report a handle that
    // cannot move. Clamping alone is not enough either — the 20 points panel A
    // gave up have to land on B, or the group no longer fills its container.
    const pinned: SplitterPanelDef[] = [{ id: "a", minSize: 30, maxSize: 30 }, { id: "b" }];
    expect(resolveSplitterSizes(pinned, undefined)).toEqual([30, 70]);
  });

  it("scales sizes that do not add up to a hundred", () => {
    expect(resolveSplitterSizes(two, [30, 30])).toEqual([50, 50]);
  });

  it("reports the range the handle can actually reach", () => {
    // Not the panel's own min and max: a panel with no maximum still cannot
    // grow past what the other panels' minimums leave free.
    const constrained: SplitterPanelDef[] = [{ id: "a" }, { id: "b", minSize: 40 }];
    expect(splitterAriaValues(constrained, [50, 50], 0)).toEqual({
      valueNow: 50,
      valueMin: 0,
      valueMax: 60,
    });
    const pinned: SplitterPanelDef[] = [{ id: "a", minSize: 30, maxSize: 30 }, { id: "b" }];
    const aria = splitterAriaValues(pinned, [30, 70], 0);
    // Equal bounds are how a handle is made inert; there is no `disabled` prop
    // in any of the four libraries.
    expect(aria.valueMin).toBe(aria.valueMax);
  });

  it("keeps the pair summing to what it summed to", () => {
    const constrained: SplitterPanelDef[] = [{ id: "a", minSize: 40 }, { id: "b" }];
    // A is asked to give up 30 and can only give 10; B may only take what A
    // actually gave. Taking the whole delta anyway is how a splitter silently
    // loses a percent per drag until the last panel has eaten the group.
    const next = applySplitterDelta(constrained, [50, 50], 0, -30);
    expect(next[0]! + next[1]!).toBe(100);
    expect(next).toEqual([40, 60]);
  });

  it("snaps a collapsible panel shut rather than stopping at its minimum", () => {
    const collapsible: SplitterPanelDef[] = [
      { id: "a", minSize: 20, collapsible: true, collapsedSize: 0 },
      { id: "b" },
    ];
    // Past the halfway point between collapsed and minimum, the drag means
    // "gone"; before it, "as small as it goes".
    expect(applySplitterDelta(collapsible, [50, 50], 0, -45)).toEqual([0, 100]);
    expect(applySplitterDelta(collapsible, [50, 50], 0, -35)).toEqual([20, 80]);
  });
});

describe("UioSplitter", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  /** Inputs are initializer-based, and JIT registers none — see `sheet.spec.ts`. */
  const render = (panels: SplitterPanelDef[] = two) => {
    const fixture = TestBed.createComponent(Host);
    const splitter = fixture.componentInstance.splitter as unknown as Record<string, unknown>;
    splitter["panels"] = signal(panels);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector("[uioSplitter]") as HTMLElement;
    const handle = () => root.querySelector<HTMLElement>('[data-part="resize-trigger"]')!;
    const sizes = () =>
      [...root.querySelectorAll<HTMLElement>('[data-part="panel"]')].map((panel) =>
        Number(panel.style.flexGrow),
      );
    const press = (key: string, shiftKey = false) => {
      handle().dispatchEvent(new KeyboardEvent("keydown", { key, shiftKey, bubbles: true }));
      fixture.detectChanges();
    };
    return { fixture, root, handle, sizes, press };
  };

  it("resizes with the arrow keys, ten times as far with Shift", () => {
    const { fixture, handle, sizes, press } = render();
    expect(sizes()).toEqual([50, 50]);

    press("ArrowRight");
    expect(sizes()).toEqual([51, 49]);
    expect(handle().getAttribute("aria-valuenow")).toBe("51");

    press("ArrowRight", true);
    expect(sizes()).toEqual([61, 39]);

    press("ArrowLeft", true);
    expect(sizes()).toEqual([51, 49]);
    fixture.destroy();
  });

  it("runs the handle to its limits with Home and End", () => {
    const { fixture, sizes, press } = render();
    press("End");
    expect(sizes()).toEqual([100, 0]);
    press("Home");
    expect(sizes()).toEqual([0, 100]);
    fixture.destroy();
  });

  it("ignores the arrows that run across its axis", () => {
    // A horizontal splitter's handle moves left and right. Up and down are
    // someone else's keys — a scroll, a listbox behind it — and swallowing them
    // would be invisible until a user could not get out of the handle.
    const { fixture, sizes, press } = render();
    press("ArrowDown");
    press("ArrowUp");
    expect(sizes()).toEqual([50, 50]);
    fixture.destroy();
  });

  it("cannot move a handle between two pinned panels", () => {
    const { fixture, sizes, press } = render([{ id: "a", minSize: 30, maxSize: 30 }, { id: "b" }]);
    expect(sizes()).toEqual([30, 70]);
    press("ArrowRight");
    press("End");
    expect(sizes()).toEqual([30, 70]);
    fixture.destroy();
  });

  it("converts a drag from pixels into a share of the group", () => {
    // The one piece a keypress does not exercise: the group's own width is what
    // a pixel is measured against, and jsdom measures every element as zero —
    // so the box is supplied rather than left to fall back to a divide by zero.
    const { fixture, root, handle, sizes } = render();
    root.getBoundingClientRect = () => ({ width: 200, height: 100, x: 0, y: 0, top: 0, left: 0, right: 200, bottom: 100, toJSON: () => ({}) });

    handle().dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0, clientX: 100, pointerId: 1 }));
    fixture.detectChanges();
    expect(root.getAttribute("data-dragging")).toBe("");

    // 20px of 200 is a tenth of the group.
    handle().dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientX: 120, pointerId: 1 }));
    fixture.detectChanges();
    expect(sizes()).toEqual([60, 40]);

    handle().dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1 }));
    fixture.detectChanges();
    expect(root.hasAttribute("data-dragging")).toBe(false);
    fixture.destroy();
  });
});
