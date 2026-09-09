import { Component, ViewChild, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UioTabs, type TabItem } from "./tabs.js";

/**
 * The keyboard, which is the whole of a tab strip that a DOM diff cannot reach.
 *
 * The browser parity gate presses one arrow key, because that is the cheapest
 * way to make the focused state exist at all. Everything after it is here: the
 * wrap past a disabled tab, Home and End, the orientation split, and the blur
 * rule that decides whether the strip still reports focus.
 *
 * Tabs is also the one component in this library whose highlight *is* real DOM
 * focus rather than `aria-activedescendant`, so these assert on
 * `document.activeElement` and not only on attributes — an implementation that
 * moved `data-focus` without moving focus would satisfy the gate and strand
 * every keyboard user on the first tab.
 *
 * `tabs` is assigned onto the instance rather than bound: JIT does not register
 * initializer-based inputs, and `useDefineForClassFields: false` leaves every
 * one of them a plain property a spec can replace with a writable signal. The
 * parity harness covers real binding, against the built package.
 */
const TABS: TabItem[] = [
  { value: "one", label: "One", content: "First" },
  { value: "two", label: "Two", content: "Second" },
  { value: "three", label: "Three", content: "Third", disabled: true },
];

@Component({
  standalone: true,
  imports: [UioTabs],
  template: `<div uioTabs></div>`,
})
class Host {
  @ViewChild(UioTabs, { static: true }) tabs!: UioTabs;
}

describe("UioTabs", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = (
    tabs: TabItem[] = TABS,
    orientation: "horizontal" | "vertical" = "horizontal",
  ) => {
    const fixture = TestBed.createComponent(Host);
    const instance = fixture.componentInstance.tabs as unknown as Record<string, unknown>;
    // Before the first pass, so the triggers are rendered from them.
    instance["tabs"] = signal(tabs);
    instance["orientation"] = signal(orientation);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const root = host.querySelector<HTMLElement>('[data-part="root"]')!;
    const list = host.querySelector<HTMLElement>('[data-part="list"]')!;
    const triggers = () => [...host.querySelectorAll<HTMLElement>('[data-part="trigger"]')];
    const panels = () => [...host.querySelectorAll<HTMLElement>('[data-part="content"]')];
    const press = (key: string) => {
      list.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
      fixture.detectChanges();
    };
    return { fixture, host, root, list, triggers, panels, press };
  };

  it("marks the selected tab as focused before anything has focus", () => {
    // Zag seeds `focusedValue` from the selection, so the selected trigger
    // reports `data-focus` on first paint while the root and the list report
    // none — focus is not actually in there yet. Reading `data-focus` as "has
    // DOM focus" passes every interactive test and fails this one.
    const { root, list, triggers } = render();
    expect(triggers()[0]!.hasAttribute("data-focus")).toBe(true);
    expect(root.hasAttribute("data-focus")).toBe(false);
    expect(list.hasAttribute("data-focus")).toBe(false);
  });

  it("moves real focus with the arrows and selects what it lands on", () => {
    const { fixture, triggers, panels, press } = render();
    triggers()[0]!.focus();
    fixture.detectChanges();

    press("ArrowRight");
    expect(document.activeElement).toBe(triggers()[1]);
    // Zag's default activation mode is automatic: arriving selects.
    expect(triggers()[1]!.hasAttribute("data-selected")).toBe(true);
    expect(panels()[1]!.hasAttribute("hidden")).toBe(false);
    expect(panels()[0]!.hasAttribute("hidden")).toBe(true);
    fixture.destroy();
  });

  it("wraps past the disabled tab rather than landing on it", () => {
    // The third tab is disabled. Landing on it looks like nothing happened,
    // which is why this is the arithmetic worth asserting rather than the
    // ordinary next-tab case.
    const { fixture, triggers, press } = render();
    triggers()[1]!.focus();
    fixture.detectChanges();
    press("ArrowRight");
    expect(document.activeElement).toBe(triggers()[0]);
    expect(triggers()[0]!.hasAttribute("data-selected")).toBe(true);

    press("ArrowLeft");
    // Backwards wraps the same way, over the disabled tab at the far end.
    expect(document.activeElement).toBe(triggers()[1]);
    fixture.destroy();
  });

  it("jumps to the ends with Home and End, skipping a disabled end", () => {
    const { fixture, triggers, press } = render();
    triggers()[0]!.focus();
    fixture.detectChanges();

    press("End");
    // Not the third: End means "the last one a user can actually use".
    expect(document.activeElement).toBe(triggers()[1]);
    press("Home");
    expect(document.activeElement).toBe(triggers()[0]);
    fixture.destroy();
  });

  it("takes up and down instead of left and right when vertical", () => {
    const { fixture, triggers, press } = render(TABS, "vertical");
    triggers()[0]!.focus();
    fixture.detectChanges();

    // Left and right belong to the page in a vertical strip, and swallowing them
    // would break text selection and horizontal scrolling around it.
    press("ArrowRight");
    expect(document.activeElement).toBe(triggers()[0]);

    press("ArrowDown");
    expect(document.activeElement).toBe(triggers()[1]);
    fixture.destroy();
  });

  it("keeps the strip focused while moving between triggers", () => {
    /**
     * The `relatedTarget` test. A blur fires on the old trigger *before* focus
     * lands on the new one, so clearing unconditionally would drop `data-focus`
     * off the root and the list for a tick — long enough for anything reading
     * the DOM straight after the keypress to see a strip nobody is in.
     */
    const { fixture, root, list, triggers, press } = render();
    triggers()[0]!.focus();
    fixture.detectChanges();
    expect(root.hasAttribute("data-focus")).toBe(true);

    press("ArrowRight");
    expect(root.hasAttribute("data-focus")).toBe(true);
    expect(list.hasAttribute("data-focus")).toBe(true);
    expect(triggers()[1]!.hasAttribute("data-focus")).toBe(true);
    expect(triggers()[0]!.hasAttribute("data-focus")).toBe(false);
    fixture.destroy();
  });

  it("forgets the focused tab once focus leaves the strip entirely", () => {
    const { fixture, root, triggers } = render();
    triggers()[0]!.focus();
    fixture.detectChanges();

    triggers()[0]!.blur();
    fixture.detectChanges();
    expect(root.hasAttribute("data-focus")).toBe(false);
    // No tab reports focus either — Zag clears the focused value, so the strip
    // stops claiming a tab the user has left.
    expect(triggers().some((trigger) => trigger.hasAttribute("data-focus"))).toBe(false);
    fixture.destroy();
  });

  it("stops being a tab stop once the selected panel holds something focusable", () => {
    /**
     * The APG's rule, and Zag's `syncTabIndex`: a panel of text has to be
     * reachable by Tab or its content is unreachable to a keyboard, while a panel
     * that already contains a button is reachable through it — and leaving
     * `tabindex="0"` on that one costs the user an extra, empty stop.
     *
     * Both libraries decide this *after* render because both have to look at the
     * panel. Asserting it here is also what proves the render hook runs at all;
     * without one this silently degrades to Angular emitting Ark's pre-`raf`
     * markup forever.
     */
    const { fixture, panels, triggers, press } = render();
    panels()[1]!.appendChild(document.createElement("button"));
    triggers()[0]!.focus();
    fixture.detectChanges();

    press("ArrowRight");
    expect(panels()[1]!.hasAttribute("tabindex")).toBe(false);
    // The panels nobody selected keep theirs, exactly as Zag leaves them.
    expect(panels()[0]!.getAttribute("tabindex")).toBe("0");
    fixture.destroy();
  });

  it("does nothing at all when every tab is disabled", () => {
    // `moveHighlight` answers -1 here, and the handler has to leave focus where
    // it was rather than throw or land on something unusable.
    const { fixture, press } = render([
      { value: "one", label: "One", disabled: true },
      { value: "two", label: "Two", disabled: true },
    ]);
    const before = document.activeElement;
    expect(() => press("ArrowRight")).not.toThrow();
    expect(document.activeElement).toBe(before);
    fixture.destroy();
  });
});
