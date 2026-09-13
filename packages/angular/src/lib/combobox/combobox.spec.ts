import { Component, ViewChild, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UioCombobox, type ComboboxOption } from "./combobox.js";

/**
 * Filtering, the active descendant, and the forms integration — the three halves
 * of a combobox the browser gate cannot reach.
 *
 * The gate opens the popup and compares it. It does not type, because typing
 * moves `aria-activedescendant` and that makes zag append a live region to
 * `document.body` in React alone — an element with an id, in a gate that numbers
 * every id in the document. So the keyboard lives here.
 *
 * Inputs are replaced with writable signals rather than bound: JIT never
 * registers initializer-based inputs. See `select.spec.ts`.
 */
const FRUIT: ComboboxOption[] = [
  { value: "a", label: "Apple" },
  { value: "b", label: "Banana" },
  { value: "c", label: "Cherry", disabled: true },
];

@Component({
  standalone: true,
  imports: [UioCombobox, ReactiveFormsModule],
  template: `<div uioCombobox [formControl]="control"></div>`,
})
class Host {
  @ViewChild(UioCombobox, { static: true }) combobox!: UioCombobox;
  readonly control = new FormControl<string | null>(null);
}

describe("UioCombobox", () => {
  /**
   * Destroyed by hand between tests, because the popup is not under the host.
   *
   * The CDK parents every overlay to one `.cdk-overlay-container` that outlives
   * a fixture, so a pane left behind is still the first thing
   * `document.querySelector` finds — and the next test asserts against the
   * previous test's popup.
   */
  let live: { destroy(): void }[] = [];

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => {
    for (const fixture of live) fixture.destroy();
    live = [];
    TestBed.resetTestingModule();
  });

  const render = (props: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(Host);
    live.push(fixture);
    const instance = fixture.componentInstance.combobox as unknown as Record<string, unknown>;
    instance["options"] = signal(props["options"] ?? FRUIT);
    for (const [key, value] of Object.entries(props)) {
      if (key !== "options") instance[key] = signal(value);
    }
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector("div[uioCombobox]") as HTMLElement;
    const input = host.querySelector<HTMLInputElement>('[data-part="input"]')!;
    const trigger = host.querySelector<HTMLButtonElement>('[data-part="trigger"]')!;
    // The popup lives in the CDK's overlay container, not under the host.
    const content = () =>
      document.querySelector<HTMLElement>('.cdk-overlay-container [data-part="content"]')!;
    const items = () => [
      ...document.querySelectorAll<HTMLElement>('.cdk-overlay-container [data-part="item"]'),
    ];
    const labels = () => items().map((item) => item.textContent?.trim());
    const type = (text: string) => {
      input.value = text;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      fixture.detectChanges();
    };
    const press = (key: string) => {
      input.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
      fixture.detectChanges();
    };
    const open = () => {
      trigger.click();
      fixture.detectChanges();
    };
    return { fixture, host, input, trigger, content, items, labels, type, press, open };
  };

  it("filters the list against the typed text, and opens to show it", () => {
    const { input, content, labels, type } = render();
    expect(content().getAttribute("data-state")).toBe("closed");

    type("ban");
    // Typing opens: a filtered list nobody can see is the one state this control
    // must never be in.
    expect(content().getAttribute("data-state")).toBe("open");
    expect(labels()).toEqual(["Banana"]);
    expect(input.getAttribute("aria-expanded")).toBe("true");
  });

  it("matches without regard to case or accent, which lowercasing does not", () => {
    const { labels, type } = render({
      options: [
        { value: "1", label: "Café" },
        { value: "2", label: "Cabbage" },
      ],
    });
    type("CAFE");
    // A `search`-usage collator at base sensitivity, exactly as zag's filter
    // does it. `toLowerCase().includes()` finds nothing here.
    expect(labels()).toEqual(["Café"]);
  });

  it("shows Ark's Empty part when nothing matches, and no items beside it", () => {
    const { content, items, type } = render({ emptyMessage: "No results found." });
    type("zzz");
    expect(items()).toEqual([]);
    expect(content().getAttribute("data-empty")).toBe("");
    expect(
      document
        .querySelector('.cdk-overlay-container [data-part="empty"]')
        ?.textContent?.trim(),
    ).toBe("No results found.");
  });

  it("moves aria-activedescendant with the arrows, skipping what cannot be chosen", () => {
    const { input, items, open, press } = render();
    open();
    // Opening highlights nothing when nothing is chosen, so the input names no
    // descendant at all.
    expect(input.hasAttribute("aria-activedescendant")).toBe(false);

    press("ArrowDown");
    expect(input.getAttribute("aria-activedescendant")).toBe(items()[0]!.id);
    expect(items()[0]!.getAttribute("data-highlighted")).toBe("");

    press("ArrowDown");
    expect(input.getAttribute("aria-activedescendant")).toBe(items()[1]!.id);
    expect(items()[0]!.hasAttribute("data-highlighted")).toBe(false);

    // Cherry is disabled, and `loopFocus` is on for a combobox — so this wraps
    // to the first option rather than stopping. `UioListbox` stops.
    press("ArrowDown");
    expect(input.getAttribute("aria-activedescendant")).toBe(items()[0]!.id);

    press("ArrowUp");
    expect(input.getAttribute("aria-activedescendant")).toBe(items()[1]!.id);
  });

  it("drops a highlight that has just been filtered away", () => {
    const { input, open, press, type } = render();
    open();
    press("ArrowDown");
    expect(input.hasAttribute("aria-activedescendant")).toBe(true);

    type("cher");
    // Apple is gone from the list; naming it would point assistive tech at an
    // element that is no longer in the document.
    expect(input.hasAttribute("aria-activedescendant")).toBe(false);
  });

  it("chooses with Enter, closes, and reports to the form", () => {
    const { fixture, input, content, press, open } = render();
    open();
    press("ArrowDown");
    press("Enter");

    expect(fixture.componentInstance.control.value).toBe("a");
    expect(input.value).toBe("Apple");
    expect(content().getAttribute("data-state")).toBe("closed");
    expect(content().hasAttribute("hidden")).toBe(true);
  });

  it("shows only the chosen option when reopened, because the text is the filter", () => {
    const { fixture, items, labels, open } = render();
    open();
    items()[1]!.click();
    fixture.detectChanges();
    open();

    // Verified against React in the browser: the chosen label is left in the box
    // and the box is what filters. Every library here does this; a port that
    // "fixed" it would be the odd one out.
    expect(labels()).toEqual(["Banana"]);
    expect(items()[0]!.getAttribute("data-state")).toBe("checked");
    expect(items()[0]!.getAttribute("data-highlighted")).toBe("");
  });

  it("takes a value from the form and puts its label in the box", () => {
    const { fixture, input } = render();
    fixture.componentInstance.control.setValue("b");
    fixture.detectChanges();
    expect(input.value).toBe("Banana");
  });

  it("closes on Escape without clearing what was chosen", () => {
    const { fixture, content, items, press, open } = render();
    open();
    items()[0]!.click();
    fixture.detectChanges();
    open();
    press("Escape");

    expect(content().getAttribute("data-state")).toBe("closed");
    expect(fixture.componentInstance.control.value).toBe("a");
  });

  it("refuses to open while a reactive form has it disabled", () => {
    const { fixture, content, open } = render();
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    open();
    expect(content().getAttribute("data-state")).toBe("closed");
    expect(fixture.nativeElement.querySelector("div[uioCombobox]").getAttribute("data-disabled")).toBe("");
  });
});
