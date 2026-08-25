import { Component, ViewChild, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UioTagsInput } from "./tags-input.js";

/**
 * Adding, removing and editing a chip — the three things the list is for, and
 * the ones a DOM comparison can only see the result of.
 *
 * The parity gate drives one of each and compares the markup afterwards. What
 * it cannot see is what the *value* did: that `max` refuses a fourth tag rather
 * than silently dropping an earlier one, that an edit commits to the machine's
 * copy, and that emptying a tag mid-edit deletes it.
 *
 * Inputs are replaced with writable signals rather than bound: JIT never
 * registers initializer-based inputs. See `select.spec.ts`.
 */
@Component({
  standalone: true,
  imports: [UioTagsInput],
  template: `<div uioTagsInput></div>`,
})
class Host {
  @ViewChild(UioTagsInput, { static: true }) tags!: UioTagsInput;
}

@Component({
  standalone: true,
  imports: [UioTagsInput, ReactiveFormsModule],
  template: `<div uioTagsInput [formControl]="control"></div>`,
})
class FormHost {
  readonly control = new FormControl<string[]>([]);
}

describe("UioTagsInput", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = (props: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(Host);
    const instance = fixture.componentInstance.tags as unknown as Record<string, unknown>;
    for (const [key, value] of Object.entries(props)) instance[key] = signal(value);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const entry = host.querySelector<HTMLInputElement>('[data-part="input"]')!;
    const root = host.querySelector<HTMLElement>('[data-part="root"]')!;
    const previews = () => [
      ...host.querySelectorAll<HTMLElement>('[data-part="item-preview"]'),
    ];
    const itemInputs = () => [
      ...host.querySelectorAll<HTMLInputElement>('[data-part="item-input"]'),
    ];
    const labels = () =>
      [...host.querySelectorAll<HTMLElement>('[data-part="item-text"]')].map((el) =>
        el.textContent?.trim(),
      );
    /** The form's field, not the per-chip edit inputs — those are hidden too. */
    const hidden = () => host.querySelector<HTMLInputElement>('input[type="text"][hidden]')!;
    /** Typing means "the element's value changed", which is what the handler reads. */
    const typeInto = (element: HTMLInputElement, text: string) => {
      element.value = text;
      element.dispatchEvent(new Event("input", { bubbles: true }));
      fixture.detectChanges();
    };
    const press = (element: HTMLElement, key: string) => {
      element.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
      fixture.detectChanges();
    };
    return { fixture, host, root, entry, previews, itemInputs, labels, hidden, typeInto, press };
  };

  it("turns the entry field into a chip on Enter", () => {
    const { entry, labels, hidden, typeInto, press } = render();
    typeInto(entry, "design");
    press(entry, "Enter");
    expect(labels()).toEqual(["design"]);
    // The field is cleared, and the form sees a comma-joined string.
    expect(entry.value).toBe("");
    expect(hidden().value).toBe("design");
  });

  it("ends a tag at the delimiter without waiting for Enter", () => {
    const { entry, labels, typeInto } = render();
    typeInto(entry, "design,");
    expect(labels()).toEqual(["design"]);
  });

  it("refuses a tag past max, and does not drop an earlier one", () => {
    const { entry, labels, typeInto, press } = render({ value: ["a", "b"], max: 2 });
    typeInto(entry, "c");
    press(entry, "Enter");
    expect(labels()).toEqual(["a", "b"]);
  });

  it("drops a duplicate rather than adding it twice", () => {
    const { entry, labels, typeInto, press } = render({ value: ["design"] });
    typeInto(entry, "design");
    press(entry, "Enter");
    expect(labels()).toEqual(["design"]);
  });

  it("removes a chip through its delete trigger", () => {
    const { fixture, host, labels, root } = render({ value: ["one", "two"] });
    host.querySelectorAll<HTMLButtonElement>('[data-part="item-delete-trigger"]')[0]!.click();
    fixture.detectChanges();
    expect(labels()).toEqual(["two"]);
    expect(root.hasAttribute("data-empty")).toBe(false);
  });

  it("highlights the last chip on the first Backspace and removes it on the second", () => {
    const { entry, previews, labels, press } = render({ value: ["one", "two"] });
    press(entry, "Backspace");
    // One press away from data loss is the whole reason the highlight exists.
    expect(previews()[1]!.getAttribute("data-highlighted")).toBe("");
    expect(labels()).toEqual(["one", "two"]);

    press(entry, "Backspace");
    expect(labels()).toEqual(["one"]);
  });

  it("edits a chip in place and keeps the edit", () => {
    const { entry, itemInputs, previews, labels, typeInto, press } = render({ value: ["one"] });
    press(entry, "Backspace");
    press(entry, "Enter");
    // The chip and its input swap by `hidden` alone — the row is never remounted.
    expect(previews()[0]!.hasAttribute("hidden")).toBe(true);
    expect(itemInputs()[0]!.hasAttribute("hidden")).toBe(false);

    typeInto(itemInputs()[0]!, "uno");
    press(itemInputs()[0]!, "Enter");
    expect(labels()).toEqual(["uno"]);
    expect(previews()[0]!.hasAttribute("hidden")).toBe(false);
  });

  it("abandons an edit on Escape", () => {
    const { entry, itemInputs, labels, typeInto, press } = render({ value: ["one"] });
    press(entry, "Backspace");
    press(entry, "Enter");
    typeInto(itemInputs()[0]!, "uno");
    press(itemInputs()[0]!, "Escape");
    expect(labels()).toEqual(["one"]);
  });

  it("deletes a chip emptied during an edit", () => {
    const { entry, itemInputs, labels, typeInto, press } = render({ value: ["one", "two"] });
    press(entry, "Backspace");
    press(entry, "Enter");
    typeInto(itemInputs()[1]!, "");
    press(itemInputs()[1]!, "Enter");
    // An emptied tag is a deletion — the only way to remove one without
    // reaching for the mouse once an edit has started.
    expect(labels()).toEqual(["one"]);
  });

  it("does not open an edit when editing is off", () => {
    const { entry, itemInputs, press } = render({ value: ["one"], editable: false });
    press(entry, "Backspace");
    press(entry, "Enter");
    expect(itemInputs()[0]!.hasAttribute("hidden")).toBe(true);
  });

  it("refuses every change while read-only", () => {
    const { entry, labels, typeInto, press } = render({ value: ["one"], readOnly: true });
    typeInto(entry, "two");
    press(entry, "Enter");
    expect(labels()).toEqual(["one"]);
  });

  it("drives a reactive form in both directions", () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    fixture.componentInstance.control.setValue(["design", "system"]);
    fixture.detectChanges();
    expect(host.querySelectorAll('[data-part="item-preview"]')).toHaveLength(2);

    const entry = host.querySelector<HTMLInputElement>('[data-part="input"]')!;
    entry.value = "angular";
    entry.dispatchEvent(new Event("input", { bubbles: true }));
    entry.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toEqual(["design", "system", "angular"]);
  });
});
