import { Component, ViewChild, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UioSegmentedControl, type SegmentedControlItem } from "./segmented-control.js";

/**
 * Roving focus, and the mechanism it actually rides on.
 *
 * This is the one control in the library whose keyboard is **the browser's own**:
 * the segments are native radios sharing a `name`, which is what makes them a
 * single tab stop that the arrow keys move and select within. Nothing in the
 * component implements that, and the assertions below are therefore about the
 * three properties the browser needs in order to do it —
 *
 *   - every radio in one control carries the *same* name, and two controls on a
 *     page carry different ones;
 *   - exactly one radio is checked, and it is the one the arrows will start
 *     from;
 *   - a disabled segment is natively disabled, so the browser steps over it.
 *
 * — plus the state the component *does* own, which is what focus and hover write
 * onto the segment. jsdom implements none of the arrow-key behaviour itself, so
 * a spec that pressed keys here would be testing a stub; what it can check is
 * that the DOM the browser needs is the DOM that is rendered.
 *
 * Inputs are assigned onto the instance rather than bound — JIT registers no
 * initializer-based input. See `accordion.spec.ts`.
 */
const ITEMS: SegmentedControlItem[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month", disabled: true },
];

@Component({
  standalone: true,
  imports: [UioSegmentedControl],
  template: `<div uioSegmentedControl></div>`,
})
class Host {
  @ViewChild(UioSegmentedControl, { static: true }) control!: UioSegmentedControl;
}

describe("UioSegmentedControl", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = (
    options: {
      items?: SegmentedControlItem[];
      value?: string;
      name?: string;
      disabled?: boolean;
    } = {},
  ) => {
    const fixture = TestBed.createComponent(Host);
    const instance = fixture.componentInstance.control as unknown as Record<string, unknown>;
    instance["items"] = signal(options.items ?? ITEMS);
    if (options.value !== undefined) instance["value"] = signal(options.value);
    if (options.name !== undefined) instance["name"] = signal(options.name);
    instance["disabledInput"] = signal(options.disabled ?? false);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const segments = () => [...host.querySelectorAll<HTMLElement>('[data-part="item"]')];
    const texts = () => [...host.querySelectorAll<HTMLElement>('[data-part="item-text"]')];
    const radios = () => [...host.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
    const check = (index: number) => {
      const radio = radios()[index]!;
      radio.checked = true;
      radio.dispatchEvent(new Event("change", { bubbles: true }));
      fixture.detectChanges();
    };
    return {
      fixture,
      host,
      segments,
      texts,
      radios,
      check,
      value: () => fixture.componentInstance.control.value(),
    };
  };

  it("makes one radio group out of the segments", () => {
    const { radios } = render();
    const names = new Set(radios().map((radio) => radio.name));
    // One name is the whole mechanism. Two names would render identically and
    // leave every segment its own independent tab stop.
    expect(names.size).toBe(1);
    expect([...names][0]).toBeTruthy();
  });

  it("gives two controls different names", () => {
    // Two fixtures rather than one host holding two controls: seeding a second
    // control's items after the first pass is what NG0100 is for, and the thing
    // under test is the id counter, which is module-global either way.
    const first = render();
    const second = render();
    // Without this two segmented controls on one page are one radio group, and
    // choosing in either clears the other.
    expect(first.radios()[0]!.name).not.toBe(second.radios()[0]!.name);
  });

  it("keeps the caller's name when given one", () => {
    const { radios } = render({ name: "range" });
    expect(radios().every((radio) => radio.name === "range")).toBe(true);
  });

  it("checks exactly one segment, defaulting to the first", () => {
    const { radios, segments } = render();
    expect(radios().filter((radio) => radio.checked).length).toBe(1);
    expect(radios()[0]!.checked).toBe(true);
    expect(segments()[0]!.getAttribute("data-state")).toBe("checked");
    expect(segments()[1]!.getAttribute("data-state")).toBe("unchecked");

    const selected = render({ value: "week" });
    expect(selected.radios()[1]!.checked).toBe(true);
    expect(selected.radios().filter((radio) => radio.checked).length).toBe(1);
  });

  it("moves the checked state when a radio reports a change", () => {
    // What an arrow key does through the browser, and what a click on the label
    // does through the radio inside it — both arrive as one `change`.
    const { check, value, segments, texts } = render();
    check(1);
    expect(value()).toBe("week");
    expect(segments()[1]!.getAttribute("data-state")).toBe("checked");
    expect(segments()[0]!.getAttribute("data-state")).toBe("unchecked");
    // The text reports the same state as the label around it — Zag builds both
    // out of one set of data attributes.
    expect(texts()[1]!.getAttribute("data-state")).toBe("checked");
  });

  it("takes a disabled segment out of the browser's rotation", () => {
    const { radios, segments, texts } = render();
    expect(radios()[2]!.disabled).toBe(true);
    expect(segments()[2]!.getAttribute("data-disabled")).toBe("");
    expect(texts()[2]!.getAttribute("data-disabled")).toBe("");
    // The other two stay live: a per-item disable is not a group disable.
    expect(radios()[0]!.disabled).toBe(false);
  });

  it("disables every segment when the whole control is", () => {
    const { host, radios, segments } = render({ disabled: true });
    expect(radios().every((radio) => radio.disabled)).toBe(true);
    expect(segments().every((segment) => segment.hasAttribute("data-disabled"))).toBe(true);
    const root = host.querySelector<HTMLElement>('[data-part="root"]')!;
    expect(root.getAttribute("data-disabled")).toBe("");
    expect(root.getAttribute("aria-disabled")).toBe("true");
  });

  it("marks the focused segment, and only that one", () => {
    const { fixture, radios, segments, host } = render();
    radios()[1]!.dispatchEvent(new FocusEvent("focus"));
    fixture.detectChanges();
    expect(segments()[1]!.getAttribute("data-focus")).toBe("");
    expect(segments()[0]!.hasAttribute("data-focus")).toBe(false);
    // Not the root. `UioPart` owns `focus` as the root's own boolean, and a
    // control with one focused segment must not report focus on the whole row.
    expect(host.querySelector('[data-part="root"]')!.hasAttribute("data-focus")).toBe(false);

    radios()[1]!.dispatchEvent(new FocusEvent("blur"));
    fixture.detectChanges();
    expect(segments()[1]!.hasAttribute("data-focus")).toBe(false);
  });

  it("marks a hovered segment unless it is disabled", () => {
    const { fixture, segments } = render();
    segments()[1]!.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
    fixture.detectChanges();
    expect(segments()[1]!.getAttribute("data-hover")).toBe("");

    segments()[2]!.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
    fixture.detectChanges();
    // `.segmented__item[data-hover]` paints a hover wash; a disabled segment
    // that took it would look pressable.
    expect(segments()[2]!.hasAttribute("data-hover")).toBe(false);
  });

  it("keeps the indicator hidden until it has been measured", () => {
    // jsdom lays nothing out, so every offset is zero — which is exactly Zag's
    // "not ready yet". The pill stays `hidden` rather than painting a collapsed
    // sliver over the first segment.
    const { host } = render();
    const indicator = host.querySelector<HTMLElement>('[data-part="indicator"]')!;
    expect(indicator.hasAttribute("hidden")).toBe(true);
  });
});
