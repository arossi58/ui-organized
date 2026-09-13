import { Component, ViewChild, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UioSelect, type SelectOption } from "./select.js";

/**
 * The forms integration and the keyboard — the two halves of a Select the
 * browser parity gate cannot reach.
 *
 * The gate compares four rendered trees, and three of those libraries have no
 * forms integration to compare against: `ControlValueAccessor` is a capability
 * this library has and React's does not, so it is tested here or nowhere. The
 * keyboard is the other half: the gate presses one arrow key to make
 * `[data-highlighted]` exist, and everything past that first press lives here.
 *
 * `options` is assigned onto the instance rather than bound. JIT does not
 * register initializer-based inputs, and `useDefineForClassFields: false` — the
 * flag this whole package depends on — makes every one of them a plain instance
 * property that a spec can replace with a writable signal. That is exactly what
 * `part.spec.ts` does, and the parity harness covers real binding against the
 * built package.
 */
const FRUIT: SelectOption[] = [
  { value: "a", label: "Apple" },
  { value: "b", label: "Banana" },
  { value: "c", label: "Cherry", disabled: true },
];

@Component({
  standalone: true,
  imports: [UioSelect, ReactiveFormsModule],
  template: `<div uioSelect [formControl]="control"></div>`,
})
class Host {
  @ViewChild(UioSelect, { static: true }) select!: UioSelect;
  readonly control = new FormControl<string | null>(null);
}

describe("UioSelect", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = (options: SelectOption[] = FRUIT) => {
    const fixture = TestBed.createComponent(Host);
    // Before the first pass, so the popup is rendered with them.
    (fixture.componentInstance.select as unknown as Record<string, unknown>)["options"] =
      signal(options);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const trigger = host.querySelector<HTMLButtonElement>('[data-part="trigger"]')!;
    const valueText = host.querySelector<HTMLElement>('[data-part="value-text"]')!;
    const native = host.querySelector<HTMLSelectElement>("select")!;
    const content = () =>
      document.querySelector<HTMLElement>('.cdk-overlay-container [data-part="content"]')!;
    const items = () => [
      ...document.querySelectorAll<HTMLElement>('.cdk-overlay-container [data-part="item"]'),
    ];
    const press = (key: string) => {
      content().dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
      fixture.detectChanges();
    };
    return { fixture, host, trigger, valueText, native, content, items, press };
  };

  it("writes the form's value into the trigger and the control a form submits", () => {
    const { fixture, valueText, native } = render();
    fixture.componentInstance.control.setValue("b");
    fixture.detectChanges();
    expect(valueText.textContent).toBe("Banana");
    // The visible trigger is a button; this is what actually gets posted.
    expect(native.value).toBe("b");
    // Ark drops the placeholder option once there is an answer — leaving it
    // would offer "no answer" as a choice long after one was made.
    expect([...native.options].map((option) => option.value)).toEqual(["a", "b", "c"]);
    fixture.destroy();
  });

  it("reports a choice back to the form", () => {
    const { fixture, trigger, items } = render();
    trigger.click();
    fixture.detectChanges();
    items()[1]!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe("b");
    fixture.destroy();
  });

  it("takes its disabled state from the form as well as from the caller", () => {
    // `control.disable()` has to reach the parts the stylesheet dims, not just
    // keep the value out of the form.
    const { fixture, host, trigger, native } = render();
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(trigger.disabled).toBe(true);
    expect(trigger.getAttribute("data-disabled")).toBe("");
    expect(host.querySelector('[data-part="value-text"]')!.getAttribute("data-disabled")).toBe("");
    expect(native.disabled).toBe(true);

    // And a disabled select cannot be opened by any route.
    trigger.click();
    fixture.detectChanges();
    expect(trigger.getAttribute("data-state")).toBe("closed");
    fixture.destroy();
  });

  it("marks itself touched on blur", () => {
    const { fixture, trigger } = render();
    expect(fixture.componentInstance.control.touched).toBe(false);
    trigger.dispatchEvent(new FocusEvent("blur"));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.touched).toBe(true);
    fixture.destroy();
  });

  it("focuses the listbox and highlights nothing until there is a selection", () => {
    const { fixture, trigger, content } = render();
    trigger.click();
    fixture.detectChanges();
    // Focus on the listbox, the option only *named* — see the class note.
    expect(document.activeElement).toBe(content());
    expect(content().getAttribute("aria-activedescendant")).toBeNull();
    fixture.destroy();
  });

  it("opens onto the current selection", () => {
    const { fixture, trigger, content, items } = render();
    fixture.componentInstance.control.setValue("b");
    fixture.detectChanges();
    trigger.click();
    fixture.detectChanges();
    expect(content().getAttribute("aria-activedescendant")).toBe(items()[1]!.id);
    expect(items()[1]!.hasAttribute("data-highlighted")).toBe(true);
    fixture.destroy();
  });

  it("steps over a disabled option", () => {
    // Cherry is disabled. An arrow key that landed on it would look right and
    // do nothing on Enter.
    const { fixture, trigger, items, press } = render();
    trigger.click();
    fixture.detectChanges();
    press("ArrowDown");
    press("ArrowDown");
    press("ArrowDown");
    expect(items()[2]!.hasAttribute("data-highlighted")).toBe(false);
    expect(items()[0]!.hasAttribute("data-highlighted")).toBe(true);
    fixture.destroy();
  });

  it("chooses with Enter, closes, and hands focus back to the trigger", () => {
    const { fixture, trigger, content, press } = render();
    trigger.focus();
    trigger.click();
    fixture.detectChanges();
    press("ArrowDown");
    press("Enter");
    expect(fixture.componentInstance.control.value).toBe("a");
    expect(content().getAttribute("data-state")).toBe("closed");
    expect(document.activeElement).toBe(trigger);
    fixture.destroy();
  });

  it("opens from the trigger's keyboard, not only from a click", () => {
    const { fixture, trigger, content } = render();
    trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    fixture.detectChanges();
    expect(content().getAttribute("data-state")).toBe("open");
    fixture.destroy();
  });

  it("closes on Escape without changing the value", () => {
    const { fixture, trigger, content, press } = render();
    fixture.componentInstance.control.setValue("a");
    fixture.detectChanges();
    trigger.click();
    fixture.detectChanges();
    press("ArrowDown");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    fixture.detectChanges();
    expect(content().getAttribute("data-state")).toBe("closed");
    expect(fixture.componentInstance.control.value).toBe("a");
    fixture.destroy();
  });
});
