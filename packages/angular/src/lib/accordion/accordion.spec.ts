import { Component, ViewChild, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UioAccordion, type AccordionItem } from "./accordion.js";

/**
 * The two halves of an accordion the browser gate cannot compare: the keyboard,
 * and the single/multiple fork.
 *
 * The gate drives one click, because that is what makes the open state exist at
 * all. What it cannot see is *which* value the component would have arrived at
 * from a different starting point — a port that treats the open set as something
 * it only ever adds to renders identically for the first click and never closes
 * anything afterwards.
 *
 * Inputs are assigned onto the instance rather than bound, for the reason
 * `select.spec.ts` sets out: JIT registers no initializer-based input, and
 * `useDefineForClassFields: false` leaves each one a plain property.
 */
const ITEMS: AccordionItem[] = [
  { value: "one", title: "One", content: "First" },
  { value: "two", title: "Two", content: "Second" },
  { value: "three", title: "Three", content: "Third", disabled: true },
];

@Component({
  standalone: true,
  imports: [UioAccordion],
  template: `<div uioAccordion></div>`,
})
class Host {
  @ViewChild(UioAccordion, { static: true }) accordion!: UioAccordion;
}

describe("UioAccordion", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = (
    options: { items?: AccordionItem[]; multiple?: boolean; open?: string[]; disabled?: boolean } = {},
  ) => {
    const fixture = TestBed.createComponent(Host);
    const instance = fixture.componentInstance.accordion as unknown as Record<string, unknown>;
    instance["items"] = signal(options.items ?? ITEMS);
    instance["multiple"] = signal(options.multiple ?? true);
    instance["disabledInput"] = signal(options.disabled ?? false);
    if (options.open) instance["value"] = signal(options.open);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const root = host.querySelector<HTMLElement>('[data-part="root"]')!;
    const triggers = () => [
      ...host.querySelectorAll<HTMLElement>('[data-part="item-trigger"]'),
    ];
    const panels = () => [...host.querySelectorAll<HTMLElement>('[data-part="item-content"]')];
    const press = (from: number, key: string) => {
      triggers()[from]!.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
      fixture.detectChanges();
    };
    const click = (index: number) => {
      triggers()[index]!.click();
      fixture.detectChanges();
    };
    return { fixture, host, root, triggers, panels, press, click };
  };

  it("opens more than one item at a time by default", () => {
    const { fixture, triggers, panels, click } = render();
    click(0);
    click(1);
    expect(triggers()[0]!.getAttribute("aria-expanded")).toBe("true");
    expect(triggers()[1]!.getAttribute("aria-expanded")).toBe("true");
    expect(panels()[0]!.hasAttribute("hidden")).toBe(false);
    expect(panels()[1]!.hasAttribute("hidden")).toBe(false);
    fixture.destroy();
  });

  it("closes the previous item in single mode", () => {
    // The one behaviour `multiple` actually names.
    const { fixture, triggers, click } = render({ multiple: false });
    click(0);
    click(1);
    expect(triggers()[0]!.getAttribute("data-state")).toBe("closed");
    expect(triggers()[1]!.getAttribute("data-state")).toBe("open");
    fixture.destroy();
  });

  it("closes the open item when it is clicked again, in either mode", () => {
    // React passes `collapsible: !multiple` so that single mode keeps this;
    // multiple mode gets it from Zag implicitly. Both branches, one assertion.
    for (const multiple of [true, false]) {
      const { fixture, triggers, click } = render({ multiple });
      click(0);
      expect(triggers()[0]!.getAttribute("data-state")).toBe("open");
      click(0);
      expect(triggers()[0]!.getAttribute("data-state")).toBe("closed");
      fixture.destroy();
    }
  });

  it("refuses to open a disabled item", () => {
    const { fixture, triggers, click } = render();
    click(2);
    expect(triggers()[2]!.getAttribute("data-state")).toBe("closed");
    fixture.destroy();
  });

  it("disables every item from the group without marking the root", () => {
    /**
     * Zag reads `item.disabled ?? root.disabled`, and reports the answer on the
     * item, the trigger and the panel — never on the root. Putting it on the root
     * as well is the natural thing for a base class that owns `data-disabled` to
     * do, and would differ from all three other libraries.
     */
    const { fixture, root, triggers, panels } = render({ disabled: true });
    expect(root.hasAttribute("data-disabled")).toBe(false);
    expect(triggers()[0]!.hasAttribute("disabled")).toBe(true);
    expect(panels()[0]!.hasAttribute("data-disabled")).toBe(true);
    fixture.destroy();
  });

  it("walks the headers with the arrows, wrapping past a disabled one", () => {
    const { fixture, triggers, press } = render();
    triggers()[0]!.focus();
    fixture.detectChanges();

    press(0, "ArrowDown");
    expect(document.activeElement).toBe(triggers()[1]);
    // The third is disabled, so down from the second wraps to the first.
    press(1, "ArrowDown");
    expect(document.activeElement).toBe(triggers()[0]);
    press(0, "ArrowUp");
    expect(document.activeElement).toBe(triggers()[1]);
    fixture.destroy();
  });

  it("moves focus without opening anything", () => {
    // The opposite of Tabs, and the APG's rule for this pattern: arrowing to a
    // header selects nothing, and Enter is what opens the one you land on.
    const { fixture, triggers, press } = render();
    triggers()[0]!.focus();
    fixture.detectChanges();
    press(0, "ArrowDown");
    expect(triggers().every((trigger) => trigger.getAttribute("data-state") === "closed")).toBe(
      true,
    );
    fixture.destroy();
  });

  it("jumps to the ends with Home and End", () => {
    const { fixture, triggers, press } = render();
    triggers()[0]!.focus();
    fixture.detectChanges();
    press(0, "End");
    // Not the disabled third.
    expect(document.activeElement).toBe(triggers()[1]);
    press(1, "Home");
    expect(document.activeElement).toBe(triggers()[0]);
    fixture.destroy();
  });

  it("reports the focused item on the item, the trigger and the panel", () => {
    // All three carry `data-focus` in Ark, and it is cleared by any blur — the
    // accordion, unlike Tabs, does not test `relatedTarget`.
    const { fixture, host, triggers } = render();
    triggers()[1]!.focus();
    fixture.detectChanges();
    const focused = [...host.querySelectorAll("[data-focus]")].map((el) =>
      el.getAttribute("data-part"),
    );
    expect(focused).toEqual(["item", "item-trigger", "item-content"]);

    triggers()[1]!.blur();
    fixture.detectChanges();
    expect(host.querySelectorAll("[data-focus]").length).toBe(0);
    fixture.destroy();
  });
});
