import { Component, ViewChild, provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UioMenu, UioMenuItem, UioMenuSeparator, UioMenuTrigger } from "./menu.js";

/**
 * The keyboard, which is the whole of a menu that a DOM diff cannot reach.
 *
 * The parity gate compares one keypress — the first ArrowDown — because that is
 * the cheapest way to make `[data-highlighted]` exist at all. Everything after
 * it is here: wrapping, Home/End, choosing, and the two ways out.
 *
 * ── What these specs cannot bind ────────────────────────────────────────────
 *
 * `value` and `select` are initializer-based, and JIT registers neither — so the
 * items take their generated fallback values and the output is subscribed on the
 * instance rather than through `(select)`. Neither is a limitation of the
 * component: the parity harness renders the built package, where both bind
 * normally.
 */
@Component({
  standalone: true,
  imports: [UioMenu, UioMenuTrigger, UioMenuItem, UioMenuSeparator],
  template: `
    <button uioMenuTrigger [menu]="menu">Open</button>
    <uio-menu #menu="uioMenu">
      <div uioMenuItem>Cut</div>
      <div uioMenuSeparator></div>
      <div uioMenuItem>Copy</div>
    </uio-menu>
  `,
})
class Host {
  @ViewChild("menu", { static: true }) menu!: UioMenu;
}

describe("UioMenu", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector("button") as HTMLButtonElement;
    const content = () =>
      document.querySelector<HTMLElement>('.cdk-overlay-container [data-part="content"]')!;
    const items = () => [
      ...document.querySelectorAll<HTMLElement>('.cdk-overlay-container [data-part="item"]'),
    ];
    const press = (key: string) => {
      content().dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
      fixture.detectChanges();
    };
    return { fixture, trigger, content, items, press, menu: fixture.componentInstance.menu };
  };

  it("focuses the menu itself, not an item", () => {
    // Ark drives a menu with aria-activedescendant, which is why the popup
    // carries tabindex="0". Moving real focus onto items instead would apply
    // every :focus-visible rule in the stylesheet to the wrong element.
    const { fixture, trigger, content } = render();
    trigger.click();
    fixture.detectChanges();
    expect(document.activeElement).toBe(content());
    expect(content().getAttribute("aria-activedescendant")).toBeNull();
    fixture.destroy();
  });

  it("walks the items with the arrows, naming the highlighted one", () => {
    const { fixture, trigger, content, items, press } = render();
    trigger.click();
    fixture.detectChanges();

    press("ArrowDown");
    expect(items()[0]!.hasAttribute("data-highlighted")).toBe(true);
    expect(content().getAttribute("aria-activedescendant")).toBe(items()[0]!.id);

    press("ArrowDown");
    expect(items()[1]!.hasAttribute("data-highlighted")).toBe(true);
    expect(items()[0]!.hasAttribute("data-highlighted")).toBe(false);

    // Wraps rather than stopping, which is what a two-item menu makes obvious.
    press("ArrowDown");
    expect(items()[0]!.hasAttribute("data-highlighted")).toBe(true);
    press("ArrowUp");
    expect(items()[1]!.hasAttribute("data-highlighted")).toBe(true);
    fixture.destroy();
  });

  it("jumps to the ends with Home and End", () => {
    const { fixture, trigger, items, press } = render();
    trigger.click();
    fixture.detectChanges();
    press("End");
    expect(items()[1]!.hasAttribute("data-highlighted")).toBe(true);
    press("Home");
    expect(items()[0]!.hasAttribute("data-highlighted")).toBe(true);
    fixture.destroy();
  });

  it("skips the separator, which is not an item", () => {
    // The separator sits between the two items in the DOM. Navigation that
    // counted children rather than registered items would land on it.
    const { fixture, trigger, press, items } = render();
    trigger.click();
    fixture.detectChanges();
    press("ArrowDown");
    press("ArrowDown");
    expect(items().length).toBe(2);
    expect(items()[1]!.hasAttribute("data-highlighted")).toBe(true);
    fixture.destroy();
  });

  it("chooses the highlighted item with Enter, closes, and hands focus back", () => {
    const { fixture, trigger, content, press, menu } = render();
    const chosen: string[] = [];
    menu.select.subscribe((value) => chosen.push(value));
    trigger.focus();
    trigger.click();
    fixture.detectChanges();

    press("ArrowDown");
    press("Enter");
    expect(chosen.length).toBe(1);
    expect(content().getAttribute("data-state")).toBe("closed");
    expect(document.activeElement).toBe(trigger);
    fixture.destroy();
  });

  it("highlights under the pointer as well as under the keyboard", () => {
    // `[data-highlighted]` *is* the hover treatment in the shared stylesheet, so
    // a menu that only wrote it from the keyboard would look dead to a mouse.
    const { fixture, trigger, items } = render();
    trigger.click();
    fixture.detectChanges();
    items()[1]!.dispatchEvent(new PointerEvent("pointermove", { bubbles: true }));
    fixture.detectChanges();
    expect(items()[1]!.hasAttribute("data-highlighted")).toBe(true);
    fixture.destroy();
  });

  it("closes on Escape and on Tab, and forgets the highlight", () => {
    const { fixture, trigger, content, press } = render();
    trigger.click();
    fixture.detectChanges();
    press("ArrowDown");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    fixture.detectChanges();
    expect(content().getAttribute("data-state")).toBe("closed");
    expect(content().getAttribute("aria-activedescendant")).toBeNull();

    trigger.click();
    fixture.detectChanges();
    press("Tab");
    expect(content().getAttribute("data-state")).toBe("closed");
    fixture.destroy();
  });

  it("opens from the trigger's own arrow keys", () => {
    // The one thing a click handler cannot give a keyboard user, and the APG's
    // requirement for a menu button.
    const { fixture, trigger, content } = render();
    trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    fixture.detectChanges();
    expect(content().getAttribute("data-state")).toBe("open");
    fixture.destroy();
  });
});
