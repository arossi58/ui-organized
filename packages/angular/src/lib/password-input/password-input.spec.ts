import { Component, ViewChild, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UioPasswordInput } from "./password-input.js";

/**
 * The reveal toggle, which is three attributes moving together and one that must
 * not move at all.
 *
 * The browser gate compares one press. What it cannot say is that the state
 * belongs to the component rather than to the caller: `visible` is deliberately
 * not an input, because a password a caller could reveal on the user's behalf is
 * a different component than this one.
 *
 * Inputs are assigned onto the instance rather than bound — JIT registers no
 * initializer-based input. See `accordion.spec.ts`.
 */
@Component({
  standalone: true,
  imports: [UioPasswordInput],
  template: `<div uioPasswordInput></div>`,
})
class Host {
  @ViewChild(UioPasswordInput, { static: true }) field!: UioPasswordInput;
}

describe("UioPasswordInput", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = (options: { showToggle?: boolean; disabled?: boolean } = {}) => {
    const fixture = TestBed.createComponent(Host);
    const instance = fixture.componentInstance.field as unknown as Record<string, unknown>;
    instance["showToggle"] = signal(options.showToggle ?? true);
    instance["disabledInput"] = signal(options.disabled ?? false);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const input = host.querySelector<HTMLInputElement>('[data-part="input"]')!;
    const toggle = () => host.querySelector<HTMLButtonElement>("button.input-affix__action");
    const press = () => {
      toggle()!.click();
      fixture.detectChanges();
    };
    return { fixture, host, input, toggle, press };
  };

  it("starts concealed, and says what pressing the button will do", () => {
    const { input, toggle } = render();
    expect(input.getAttribute("type")).toBe("password");
    // The label names the *action*, not the state — the state is `aria-pressed`.
    // Inverting the pair is invisible on screen and misleading to everyone else.
    expect(toggle()!.getAttribute("aria-label")).toBe("Show password");
    expect(toggle()!.getAttribute("aria-pressed")).toBe("false");
  });

  it("reveals and conceals again, moving all three attributes together", () => {
    const { input, toggle, press } = render();
    press();
    expect(input.getAttribute("type")).toBe("text");
    expect(toggle()!.getAttribute("aria-label")).toBe("Hide password");
    expect(toggle()!.getAttribute("aria-pressed")).toBe("true");

    press();
    expect(input.getAttribute("type")).toBe("password");
    expect(toggle()!.getAttribute("aria-pressed")).toBe("false");
  });

  it("keeps the typed value across a reveal", () => {
    const { fixture, input, press } = render();
    input.value = "hunter2";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    fixture.detectChanges();
    press();
    // The `type` swap re-renders the element's binding; a component that drove
    // the value from anywhere but the element itself would blank it here.
    expect(input.value).toBe("hunter2");
  });

  it("takes the trailing padding class away with the toggle", () => {
    // `field__control--affix-end` is what reserves room for the button. Left on
    // a field that has none, the text sits in a gap.
    const withToggle = render();
    expect(withToggle.input.classList.contains("field__control--affix-end")).toBe(true);
    expect(withToggle.toggle()).not.toBeNull();

    const without = render({ showToggle: false });
    expect(without.input.classList.contains("field__control--affix-end")).toBe(false);
    expect(without.toggle()).toBeNull();
  });

  it("disables the toggle along with the control", () => {
    const { input, toggle } = render({ disabled: true });
    expect(input.disabled).toBe(true);
    expect(toggle()!.disabled).toBe(true);
  });

  it("reports invalid on the field and the control, and never disabled", () => {
    const fixture = TestBed.createComponent(Host);
    const instance = fixture.componentInstance.field as unknown as Record<string, unknown>;
    instance["error"] = signal("Too short");
    instance["disabledInput"] = signal(true);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const root = host.querySelector<HTMLElement>('[data-part="root"]')!;
    const input = host.querySelector<HTMLInputElement>('[data-part="input"]')!;
    expect(root.getAttribute("data-invalid")).toBe("");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    // React passes only `invalid` to Field.Root, so a disabled password field
    // reports itself through the control's native attribute alone. Emitting
    // `data-disabled` here would be a difference from all three other libraries.
    expect(root.hasAttribute("data-disabled")).toBe(false);
    expect(input.hasAttribute("data-disabled")).toBe(false);
  });
});
