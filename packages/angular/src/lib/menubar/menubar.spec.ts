import {
  ApplicationRef,
  Component,
  ViewChild,
  provideZonelessChangeDetection,
  signal,
} from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UioMenu, UioMenuItem, UioMenuTrigger } from "../menu/menu.js";
import { UioMenubar } from "./menubar.js";

/**
 * The half of a menubar the parity gate cannot see.
 *
 * The browser gate compares the rendered DOM contract, and `tabindex` is not
 * part of it — `isContractAttribute` admits `role`, `aria-*` and `data-*` and
 * nothing else. So the single tab stop, which is the entire reason a menubar is
 * a component rather than a `display: flex` rule, goes uncompared there. It is
 * also the part every library writes imperatively rather than declaratively,
 * which is exactly where a port drifts.
 *
 * ── What these specs cannot bind ────────────────────────────────────────────
 *
 * `orientation` is initializer-based and JIT registers no such input, so it is
 * replaced with a writable signal on the instance — the same technique
 * `accordion.spec.ts` uses, and it drives the host bindings identically. The
 * `[menu]` input *is* bindable, because it is a decorator input; see the note on
 * `UioMenuTrigger`.
 */
@Component({
  standalone: true,
  imports: [UioMenubar, UioMenu, UioMenuTrigger, UioMenuItem],
  template: `
    <div uioMenubar>
      <button uioMenuTrigger class="menubar__trigger" [menu]="file">File</button>
      <uio-menu #file="uioMenu"><div uioMenuItem>New</div></uio-menu>

      <button uioMenuTrigger class="menubar__trigger" [menu]="edit">Edit</button>
      <uio-menu #edit="uioMenu"><div uioMenuItem>Undo</div></uio-menu>

      <button uioMenuTrigger class="menubar__trigger" [menu]="view">View</button>
      <uio-menu #view="uioMenu"><div uioMenuItem>Zoom</div></uio-menu>
    </div>
  `,
})
class Host {
  @ViewChild(UioMenubar, { static: true }) bar!: UioMenubar;
}

/** The same trigger with no bar around it, which must stay a plain button. */
@Component({
  standalone: true,
  imports: [UioMenu, UioMenuTrigger, UioMenuItem],
  template: `
    <button uioMenuTrigger [menu]="lone">Actions</button>
    <uio-menu #lone="uioMenu"><div uioMenuItem>Rename</div></uio-menu>
  `,
})
class LoneHost {}

describe("UioMenubar", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = (orientation?: "horizontal" | "vertical") => {
    const fixture = TestBed.createComponent(Host);
    if (orientation) {
      (fixture.componentInstance.bar as unknown as Record<string, unknown>)["orientation"] =
        signal(orientation);
    }
    fixture.detectChanges();
    /**
     * `ApplicationRef.tick()`, not `fixture.detectChanges()` alone: the roving
     * runs from `afterEveryRender`, and render hooks belong to the application's
     * pass rather than to one view's local change detection.
     */
    const flush = () => {
      fixture.detectChanges();
      TestBed.inject(ApplicationRef).tick();
    };
    flush();

    const host = fixture.nativeElement as HTMLElement;
    const triggers = () => [...host.querySelectorAll<HTMLElement>("[data-menubar-item]")];
    const tabStops = () => triggers().map((trigger) => trigger.tabIndex);
    const focused = () => triggers().indexOf(document.activeElement as HTMLElement);
    const send = (target: HTMLElement, key: string) => {
      const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
      target.dispatchEvent(event);
      flush();
      return event;
    };
    const press = (key: string) => send((document.activeElement ?? host) as HTMLElement, key);
    /** Straight at the bar, bypassing whatever the focused trigger claims. */
    const pressOnBar = (key: string) => send(host.querySelector("div")!, key);
    return { fixture, host, triggers, tabStops, focused, press, pressOnBar, flush };
  };

  it("is a single tab stop", () => {
    // The whole point: Tab reaches the bar once, and the arrows move within it.
    // Three triggers all at the browser default would be three tab stops.
    const { fixture, tabStops } = render();
    expect(tabStops()).toEqual([0, -1, -1]);
    fixture.destroy();
  });

  it("moves focus and the tab stop with the arrows, wrapping at both ends", () => {
    const { fixture, triggers, tabStops, focused, press } = render();
    triggers()[0]!.focus();

    press("ArrowRight");
    expect(focused()).toBe(1);
    expect(tabStops()).toEqual([-1, 0, -1]);

    press("ArrowRight");
    press("ArrowRight");
    // Wrapped rather than stopping at the end.
    expect(focused()).toBe(0);

    press("ArrowLeft");
    expect(focused()).toBe(2);
    expect(tabStops()).toEqual([-1, -1, 0]);
    fixture.destroy();
  });

  it("jumps to the ends with Home and End", () => {
    const { fixture, triggers, focused, press } = render();
    triggers()[1]!.focus();
    press("End");
    expect(focused()).toBe(2);
    press("Home");
    expect(focused()).toBe(0);
    fixture.destroy();
  });

  it("lets a trigger claim ArrowDown for its own menu", () => {
    /**
     * A menu trigger opens its menu on ArrowDown and moves focus into it — the
     * APG behaviour, and what Ark does in the other three libraries. It calls
     * `preventDefault`, and the bar honours that rather than fighting it, so
     * focus ends up in the popup rather than one trigger along.
     *
     * Worth pinning because it is what makes the *vertical* axis unreachable
     * from a trigger in every one of the four libraries, and the next spec
     * therefore has to go around it.
     */
    const { fixture, triggers, focused, press } = render();
    triggers()[0]!.focus();
    const event = press("ArrowDown");
    expect(event.defaultPrevented).toBe(true);
    expect(focused()).toBe(-1);
    expect(triggers()[0]!.getAttribute("data-state")).toBe("open");
    fixture.destroy();
  });

  it("swaps which arrows move when the bar is vertical", () => {
    /**
     * A vertical bar is laid out by `data-orientation`, and the arrows have to
     * follow it. Left/Right must be left alone there — they belong to the text
     * caret, and a bar that swallowed them would look correct and quietly break
     * every input a user tabs into next.
     *
     * Sent at the bar rather than at the focused trigger, because the trigger
     * claims both vertical arrows first (see above). The bar navigates from
     * `document.activeElement`, not from the event's target, so this exercises
     * exactly the arithmetic under test with the trigger's claim out of the way.
     */
    const { fixture, triggers, focused, pressOnBar } = render("vertical");
    triggers()[0]!.focus();

    const ignored = pressOnBar("ArrowRight");
    expect(ignored.defaultPrevented).toBe(false);
    expect(focused()).toBe(0);

    pressOnBar("ArrowDown");
    expect(focused()).toBe(1);
    pressOnBar("ArrowUp");
    expect(focused()).toBe(0);
    fixture.destroy();
  });

  it("follows focus into the bar, wherever it lands", () => {
    /**
     * The `focus` / `focusin` trap. `focus` does not bubble, so a listener on the
     * bar never sees a trigger being focused and the tab stop stays wherever it
     * was last put — Shift+Tab into the bar would then land on the last trigger
     * and leave the *first* as the tab stop. React's synthetic `onFocus` does
     * bubble, which is why the port has to be `focusin`.
     */
    const { fixture, triggers, tabStops, flush } = render();
    triggers()[2]!.focus();
    flush();
    expect(tabStops()).toEqual([-1, -1, 0]);
    fixture.destroy();
  });

  it("leaves the arrows alone when focus is not on a trigger", () => {
    /**
     * Focus inside an open menu bubbles its keydowns through the bar, and those
     * arrows belong to the menu. Swallowing them here would break navigation
     * inside every dropdown the bar holds.
     */
    const { fixture, host, tabStops, press } = render();
    (document.activeElement as HTMLElement | null)?.blur();
    host.querySelector("div")!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    const event = press("ArrowRight");
    expect(event.defaultPrevented).toBe(false);
    expect(tabStops()).toEqual([0, -1, -1]);
    fixture.destroy();
  });

  it("makes every trigger inside it a menuitem, and leaves a lone trigger a button", () => {
    // `role="menubar"` admits no other children, so a trigger placed in one has
    // to stop being a button. Outside a bar both attributes must be absent —
    // the marker is also how the bar finds its own triggers, and a stray one
    // would put an unrelated menu's items in range.
    const { fixture, triggers } = render();
    for (const trigger of triggers()) {
      expect(trigger.getAttribute("role")).toBe("menuitem");
      expect(trigger.getAttribute("data-menubar-item")).toBe("");
    }
    fixture.destroy();

    const lone = TestBed.createComponent(LoneHost);
    lone.detectChanges();
    const button = lone.nativeElement.querySelector("button") as HTMLElement;
    expect(button.hasAttribute("role")).toBe(false);
    expect(button.hasAttribute("data-menubar-item")).toBe(false);
    lone.destroy();
  });
});
