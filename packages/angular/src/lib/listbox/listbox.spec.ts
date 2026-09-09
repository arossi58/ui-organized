import { Component, ViewChild, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UioListbox, type ListboxOption } from "./listbox.js";

/**
 * The two things about a listbox that look like one state and are two, plus the
 * forms integration React has no counterpart for.
 *
 * `aria-activedescendant` and `[data-highlighted]` both follow the highlighted
 * option and they are *not* the same claim: Ark paints a highlight only when the
 * user is driving by keyboard. The browser gate presses one arrow key to make
 * the attribute exist; everything either side of that press is here.
 *
 * Inputs are replaced with writable signals rather than bound: JIT never
 * registers initializer-based inputs. See `select.spec.ts`.
 */
const FRUIT: ListboxOption[] = [
  { value: "a", label: "Apple" },
  { value: "b", label: "Banana" },
  { value: "c", label: "Cherry", disabled: true },
];

@Component({
  standalone: true,
  imports: [UioListbox, ReactiveFormsModule],
  template: `<div uioListbox [formControl]="control"></div>`,
})
class Host {
  @ViewChild(UioListbox, { static: true }) listbox!: UioListbox;
  readonly control = new FormControl<string[]>([]);
}

describe("UioListbox", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = (props: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(Host);
    const instance = fixture.componentInstance.listbox as unknown as Record<string, unknown>;
    instance["options"] = signal(props["options"] ?? FRUIT);
    for (const [key, value] of Object.entries(props)) {
      if (key !== "options") instance[key] = signal(value);
    }
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector("div[uioListbox]") as HTMLElement;
    const content = host.querySelector<HTMLElement>('[data-part="content"]')!;
    const items = () => [...host.querySelectorAll<HTMLElement>('[data-part="item"]')];
    const focus = () => {
      content.dispatchEvent(new FocusEvent("focus"));
      fixture.detectChanges();
    };
    const press = (key: string) => {
      content.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
      fixture.detectChanges();
    };
    const click = (index: number) => {
      // Both events, in order: the mousedown is what moves focus onto the
      // content, and the pointerdown is what tells the component the modality is
      // pointer rather than keyboard. `MouseEvent` for both, because jsdom does
      // not construct a `PointerEvent` and nothing here reads one.
      items()[index]!.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
      items()[index]!.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      focus();
      items()[index]!.click();
      fixture.detectChanges();
    };
    return { fixture, host, content, items, focus, press, click };
  };

  it("names the clicked option without highlighting it", () => {
    const { content, items, click } = render();
    click(0);

    // Selected, and named as the active descendant …
    expect(items()[0]!.getAttribute("data-state")).toBe("checked");
    expect(items()[0]!.getAttribute("aria-selected")).toBe("true");
    expect(content.getAttribute("aria-activedescendant")).toBe(items()[0]!.id);
    expect(content.getAttribute("data-activedescendant")).toBe(items()[0]!.id);
    // … and *not* highlighted, because the pointer put it there. This is the
    // whole visual state of the component, and the one a port gets wrong.
    expect(items()[0]!.hasAttribute("data-highlighted")).toBe(false);
  });

  it("paints the highlight as soon as a key is pressed", () => {
    const { content, items, click, press } = render();
    click(0);
    press("ArrowDown");

    expect(content.getAttribute("aria-activedescendant")).toBe(items()[1]!.id);
    expect(items()[1]!.getAttribute("data-highlighted")).toBe("");
    // Arrowing does not select — `selectOnHighlight` is off, so the first
    // option is still the chosen one.
    expect(items()[0]!.getAttribute("data-state")).toBe("checked");
    expect(items()[1]!.getAttribute("data-state")).toBe("unchecked");
  });

  it("skips a disabled option and stops at the end rather than wrapping", () => {
    const { content, items, focus, press } = render();
    focus();
    // Focusing an unchosen list highlights its first option, so one press is
    // one move rather than an arrival.
    expect(content.getAttribute("aria-activedescendant")).toBe(items()[0]!.id);

    press("ArrowDown");
    expect(content.getAttribute("aria-activedescendant")).toBe(items()[1]!.id);
    // Cherry is disabled and there is nothing after it: `loopFocus` is off for a
    // listbox, so this is where the list ends. `UioCombobox` wraps here.
    press("ArrowDown");
    expect(content.getAttribute("aria-activedescendant")).toBe(items()[1]!.id);
  });

  it("does not deselect the chosen option when it is clicked again", () => {
    const { items, click } = render();
    click(0);
    click(0);
    // `deselectable` is off, so a single-select listbox cannot be emptied by
    // clicking — which is what makes it a choice rather than a toggle.
    expect(items()[0]!.getAttribute("data-state")).toBe("checked");
  });

  it("toggles in multiple mode, and says so to assistive tech", () => {
    const { content, items, click } = render({ selectionMode: "multiple" });
    expect(content.getAttribute("aria-multiselectable")).toBe("true");
    click(0);
    click(1);
    expect(items().map((item) => item.getAttribute("data-state"))).toEqual([
      "checked",
      "checked",
      "unchecked",
    ]);
    click(0);
    expect(items()[0]!.getAttribute("data-state")).toBe("unchecked");
  });

  it("drives a reactive form in both directions", () => {
    const { fixture, items, click } = render();
    fixture.componentInstance.control.setValue(["b"]);
    fixture.detectChanges();
    expect(items()[1]!.getAttribute("data-state")).toBe("checked");

    click(0);
    expect(fixture.componentInstance.control.value).toEqual(["a"]);
  });

  it("leaves an ungrouped option unwrapped and disables every part when the form does", () => {
    const { fixture, host } = render({
      options: [
        { value: "a", label: "Apple", group: "Fruit" },
        { value: "n", label: "Almond" },
      ],
    });
    // A group with no heading would announce a group with no name.
    expect(host.querySelectorAll('[data-part="item-group"]').length).toBe(1);
    expect(
      host.querySelector('[data-part="content"] > [data-part="item"]')?.getAttribute("data-value"),
    ).toBe("n");

    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(host.getAttribute("data-disabled")).toBe("");
    expect(host.querySelector('[data-part="item"]')!.getAttribute("aria-disabled")).toBe("true");
  });

  it("stands a disabled option in for an empty list, and only when it is empty", () => {
    // Not Ark's Empty part, which is a `role="presentation"` div: a listbox must
    // own "option" or "group" children, and axe rates a childless one critical.
    // A disabled option keeps the list non-empty and says something true. All
    // four libraries render this same element — the parity gate holds them to it.
    const { host } = render({ options: [], emptyMessage: "Nothing here" });
    const content = host.querySelector('[data-part="content"]')!;
    expect(content.getAttribute("data-empty")).toBe("");

    const empty = host.querySelector(".listbox__empty")!;
    expect(empty.textContent?.trim()).toBe("Nothing here");
    expect(empty.getAttribute("role")).toBe("option");
    expect(empty.getAttribute("aria-disabled")).toBe("true");
  });
});
