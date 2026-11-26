import { Component, Input, ViewChild, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  UioNavigationMenu,
  UioNavigationMenuItem,
  UioNavigationMenuLink,
} from "./navigation-menu.js";

/**
 * What the parity harness cannot time or reach: the hover delays, a touch
 * that must not open anything, a press outside, and the bar's arrow keys,
 * which move focus without changing a single compared attribute.
 */
@Component({
  standalone: true,
  imports: [UioNavigationMenu, UioNavigationMenuItem, UioNavigationMenuLink],
  template: `
    <nav uioNavigationMenu aria-label="Main">
      <div uioNavigationMenuItem value="product" label="Product">
        <a uioNavigationMenuLink href="#reports" description="Charts.">Reports</a>
        <a uioNavigationMenuLink href="#alerts">Alerts</a>
      </div>
      <div uioNavigationMenuItem value="company" label="Company">
        <a uioNavigationMenuLink href="#team">Team</a>
      </div>
      <div uioNavigationMenuItem value="pricing" label="Pricing" href="#pricing"></div>
    </nav>
    <button id="outside">Outside</button>
  `,
})
class Host {
  @ViewChild(UioNavigationMenu, { static: true }) menu!: UioNavigationMenu;
}

/**
 * JIT registers no initializer inputs (see sheet.spec.ts), and an item's
 * `value` is required, so its static attributes are never written. This is
 * what the CLI's JIT transform does for `input()`: mark the field with the
 * decorator Angular's AOT compiler would have emitted.
 */
for (const name of ["value", "label", "href"]) {
  Input({ isSignal: true, alias: name, required: name === "value" } as Input)(
    UioNavigationMenuItem.prototype,
    name,
  );
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** jsdom has no PointerEvent; a MouseEvent with a pointer type is what the handlers read. */
function pointer(type: string, target: Element, pointerType = "mouse"): void {
  const event = new MouseEvent(type, { bubbles: type === "pointerdown", cancelable: true });
  Object.defineProperty(event, "pointerType", { value: pointerType });
  target.dispatchEvent(event);
}

function key(target: Element, name: string): KeyboardEvent {
  const event = new KeyboardEvent("keydown", { key: name, bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event;
}

describe("UioNavigationMenu", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  /** Initializer inputs cannot be bound under JIT; see sheet.spec.ts. */
  const render = (inputs: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(Host);
    for (const [name, value] of Object.entries(inputs)) {
      (fixture.componentInstance.menu as unknown as Record<string, unknown>)[name] = signal(value);
    }
    fixture.detectChanges();
    document.body.append(fixture.nativeElement);
    const root = fixture.nativeElement as HTMLElement;
    const triggers = [...root.querySelectorAll<HTMLButtonElement>('[data-part="trigger"]')];
    const content = (value: string) =>
      root.querySelector<HTMLElement>(`[data-part="content"][data-value="${value}"]`)!;
    const settle = async () => {
      await fixture.whenStable();
      fixture.detectChanges();
    };
    return { fixture, root, triggers, content, settle, menu: fixture.componentInstance.menu };
  };

  it("names its parts as zag does, with nav-menu ids", () => {
    const { fixture, root, triggers, content } = render();
    const nav = root.querySelector("nav")!;
    expect(nav.id).toMatch(/^nav-menu:[^:]+$/);
    expect(nav.getAttribute("data-scope")).toBe("navigation-menu");
    expect(triggers[0]!.id).toBe(`${nav.id}:trigger:product`);
    expect(triggers[0]!.getAttribute("aria-controls")).toBe(content("product").id);
    expect(content("product").getAttribute("aria-labelledby")).toBe(triggers[0]!.id);
    expect(content("product").hidden).toBe(true);
    const link = content("product").querySelector('[data-part="link"]')!;
    expect(link.classList).toContain("navigation-menu__link");
    expect(link.getAttribute("data-ownedby")).toBe(content("product").id);
    const bar = root.querySelector('[data-part="item"] > [data-part="link"]')!;
    expect(bar.classList).toContain("navigation-menu__trigger");
    fixture.destroy();
  });

  it("toggles a panel on click", async () => {
    const { fixture, triggers, content, settle, menu } = render();
    triggers[0]!.click();
    await settle();
    expect(menu.value()).toBe("product");
    expect(triggers[0]!.getAttribute("aria-expanded")).toBe("true");
    expect(content("product").hidden).toBe(false);
    triggers[0]!.click();
    await settle();
    expect(menu.value()).toBe("");
    expect(content("product").hidden).toBe(true);
    fixture.destroy();
  });

  it("opens on a mouse hover after the delay, switches at once, and ignores touch", async () => {
    const { fixture, triggers, menu } = render({ openDelay: 40, closeDelay: 40 });
    pointer("pointerenter", triggers[0]!, "touch");
    await wait(80);
    expect(menu.value()).toBe("");

    pointer("pointerenter", triggers[0]!);
    await wait(10);
    expect(menu.value()).toBe("");
    await wait(60);
    expect(menu.value()).toBe("product");

    // Another trigger while one is open: no delay.
    pointer("pointerleave", triggers[0]!);
    pointer("pointerenter", triggers[1]!);
    await wait(10);
    expect(menu.value()).toBe("company");

    pointer("pointerleave", triggers[1]!);
    await wait(80);
    expect(menu.value()).toBe("");
    fixture.destroy();
  });

  it("stays open while the pointer travels into the panel", async () => {
    const { fixture, triggers, content, menu } = render({ openDelay: 0, closeDelay: 40 });
    pointer("pointerenter", triggers[0]!);
    await wait(10);
    expect(menu.value()).toBe("product");
    pointer("pointerleave", triggers[0]!);
    pointer("pointerenter", content("product"));
    await wait(80);
    expect(menu.value()).toBe("product");
    fixture.destroy();
  });

  it("closes on Escape and on a press outside, but not on a press on another trigger", async () => {
    const { fixture, root, triggers, settle, menu } = render();
    triggers[0]!.click();
    await settle();
    pointer("pointerdown", triggers[1]!);
    expect(menu.value()).toBe("product");

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(menu.value()).toBe("");

    triggers[0]!.click();
    await settle();
    pointer("pointerdown", root.querySelector("#outside")!);
    expect(menu.value()).toBe("");
    fixture.destroy();
  });

  it("closes when a link in a panel is followed", async () => {
    const { fixture, triggers, content, settle, menu } = render();
    triggers[0]!.click();
    await settle();
    const link = content("product").querySelector<HTMLAnchorElement>('[data-part="link"]')!;
    link.addEventListener("click", (event) => event.preventDefault(), { once: true });
    link.click();
    // The listener above runs after the link's own, so the menu saw an
    // ordinary click and closed; the page simply did not navigate.
    expect(menu.value()).toBe("");
    fixture.destroy();
  });

  it("moves along the bar with the arrow keys, without wrapping", async () => {
    const { fixture, root, triggers } = render();
    const pricing = root.querySelector<HTMLElement>('[data-part="item"] > [data-part="link"]')!;
    triggers[0]!.focus();
    expect(key(triggers[0]!, "ArrowRight").defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(triggers[1]);
    key(triggers[1]!, "End");
    expect(document.activeElement).toBe(pricing);
    // At the end the key is still taken, and focus stays.
    expect(key(pricing, "ArrowRight").defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(pricing);
    key(pricing, "Home");
    expect(document.activeElement).toBe(triggers[0]);
    // Down on a closed trigger opens nothing; the item swallows the key.
    expect(key(triggers[0]!, "ArrowDown").defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(triggers[0]);
    fixture.destroy();
  });
});
