import { Component, ViewChild, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UioRatingGroup } from "./rating-group.js";

/**
 * Choosing a rating, which the parity gate cannot drive at all.
 *
 * A rating item's only content is the star icon, and the gate's stub icon set
 * has no `star` — so every item renders empty, collapses to zero size, and
 * Playwright refuses to click something it cannot see. That leaves the whole of
 * the interaction to be asserted here, where a synthetic event needs no layout.
 *
 * Inputs are replaced with writable signals rather than bound: JIT never
 * registers initializer-based inputs. See `select.spec.ts`.
 */
@Component({
  standalone: true,
  imports: [UioRatingGroup],
  template: `<div uioRatingGroup></div>`,
})
class Host {
  @ViewChild(UioRatingGroup, { static: true }) rating!: UioRatingGroup;
}

@Component({
  standalone: true,
  imports: [UioRatingGroup, ReactiveFormsModule],
  template: `<div uioRatingGroup [formControl]="control"></div>`,
})
class FormHost {
  readonly control = new FormControl<number>(-1);
}

describe("UioRatingGroup", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = (props: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(Host);
    const component = fixture.componentInstance.rating;
    const instance = component as unknown as Record<string, unknown>;
    for (const [key, value] of Object.entries(props)) instance[key] = signal(value);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const items = () => [...host.querySelectorAll<HTMLElement>('[data-part="item"]')];
    /** Star numbers are one-based, so an item is addressed the way ARIA names it. */
    const star = (index: number) => items()[index - 1]!;
    const hidden = () => host.querySelector<HTMLInputElement>("input[hidden]")!;
    const checked = () =>
      items()
        .filter((item) => item.hasAttribute("data-checked"))
        .map((item) => Number(item.getAttribute("aria-posinset")));
    const highlighted = () =>
      items()
        .filter((item) => item.hasAttribute("data-highlighted"))
        .map((item) => Number(item.getAttribute("aria-posinset")));
    const click = (index: number) => {
      star(index).click();
      fixture.detectChanges();
    };
    const press = (index: number, key: string) => {
      star(index).dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
      fixture.detectChanges();
    };
    return { fixture, host, component, items, star, hidden, checked, highlighted, click, press };
  };

  it("fills every star up to the one chosen, and checks only that one", () => {
    const { component, checked, highlighted, hidden, click } = render({ count: 5 });
    click(3);
    expect(component.value()).toBe(3);
    // Two attributes, two meanings: one star is checked, three are filled.
    expect(checked()).toEqual([3]);
    expect(highlighted()).toEqual([1, 2, 3]);
    expect(hidden().value).toBe("3");
  });

  it("puts the tab stop on the checked star alone", () => {
    const { items, click } = render({ count: 3 });
    click(2);
    expect(items().map((item) => item.getAttribute("tabindex"))).toEqual(["-1", "0", "-1"]);
  });

  it("steps by a whole star with the arrow keys", () => {
    const { component, press } = render({ count: 5, value: 2 });
    press(2, "ArrowRight");
    expect(component.value()).toBe(3);
    press(3, "ArrowLeft");
    expect(component.value()).toBe(2);
  });

  it("steps by half a star when half ratings are allowed", () => {
    const { component, press } = render({ count: 5, value: 2, allowHalf: true });
    press(2, "ArrowRight");
    expect(component.value()).toBe(2.5);
  });

  it("marks the fractional star, and only that one", () => {
    const { items, checked } = render({ count: 3, value: 2.5, allowHalf: true });
    expect(checked()).toEqual([3]);
    // `data-half` is what the clipped copy is drawn from, so it has to land on
    // the star the fraction belongs to rather than the one before it.
    expect(items().map((item) => item.hasAttribute("data-half"))).toEqual([false, false, true]);
  });

  it("jumps to the ends with Home and End", () => {
    const { component, press } = render({ count: 5, value: 3 });
    press(3, "Home");
    expect(component.value()).toBe(1);
    press(1, "End");
    expect(component.value()).toBe(5);
  });

  it("takes Space only when there is no rating yet", () => {
    const { component, press } = render({ count: 5 });
    press(1, " ");
    expect(component.value()).toBe(1);
    // Not a toggle: Space on a rating that already has one leaves it alone.
    press(1, " ");
    expect(component.value()).toBe(1);
  });

  /**
   * `readOnlyInput` and `disabledInput`, not `readOnly` and `disabled`.
   *
   * Those two names belong to `UioPart`, whose host bindings would put
   * `data-readonly` and `data-disabled` on a root that Ark leaves bare — so the
   * component takes its own inputs under aliases and leaves the base signals
   * alone. See the note on the class.
   */
  it("refuses a click while read-only", () => {
    const { component, click } = render({ count: 5, value: 2, readOnlyInput: true });
    click(4);
    expect(component.value()).toBe(2);
  });

  it("refuses a click while disabled", () => {
    const { component, click } = render({ count: 5, value: 2, disabledInput: true });
    click(4);
    expect(component.value()).toBe(2);
  });

  it("keeps the first star checked while empty, so the group has a tab stop", () => {
    const { checked, highlighted, hidden } = render({ count: 5 });
    // No rating is -1, not 0 — and nothing is filled, even though one star
    // reports itself checked for the roving tab index.
    expect(hidden().value).toBe("-1");
    expect(checked()).toEqual([1]);
    expect(highlighted()).toEqual([]);
  });

  it("drives a reactive form in both directions", () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    fixture.componentInstance.control.setValue(4);
    fixture.detectChanges();
    const items = () => [...host.querySelectorAll<HTMLElement>('[data-part="item"]')];
    expect(items()[3]!.getAttribute("data-checked")).toBe("");

    items()[1]!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(2);
  });

  it("greys every item when the form disables the control", () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const items = [...host.querySelectorAll<HTMLElement>('[data-part="item"]')];
    expect(items.every((item) => item.getAttribute("data-disabled") === "")).toBe(true);
    // The root reports nothing: Ark keeps the state on the control and the
    // items, and a `data-disabled` here would be an attribute no other library
    // in the system emits.
    expect(host.querySelector('[data-part="root"]')!.hasAttribute("data-disabled")).toBe(false);
  });
});
