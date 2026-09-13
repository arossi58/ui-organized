import { Component, ViewChild, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UioNumberField, stepValue } from "./number-field.js";

/**
 * The arithmetic, which is all of this component that a DOM comparison cannot
 * reach.
 *
 * The browser gate presses one stepper, because that is the cheapest way to make
 * the moved value exist at all. Everything a *second* press would reveal is
 * here: that a bound holds rather than being crossed, that a fractional step
 * does not accumulate floating-point residue, that clamping waits for blur, and
 * that read-only refuses both directions while disabled refuses everything.
 *
 * Inputs are assigned onto the instance rather than bound, for the reason
 * `accordion.spec.ts` sets out: JIT registers no initializer-based input, and
 * `useDefineForClassFields: false` leaves each one a plain property a spec can
 * replace with a writable signal.
 */
@Component({
  standalone: true,
  imports: [UioNumberField],
  template: `<div uioNumberField></div>`,
})
class Host {
  @ViewChild(UioNumberField, { static: true }) field!: UioNumberField;
}

describe("stepValue", () => {
  it("adds without the binary-floating-point residue", () => {
    // 0.1 + 0.2 is 0.30000000000000004, and a number field stepping by 0.1 from
    // 0.2 would put that in front of the user.
    expect(stepValue(0.2, 0.1, 1)).toBe(0.3);
    expect(stepValue(2, 0.5, -1)).toBe(1.5);
    expect(stepValue(1.005, 0.001, 1)).toBe(1.006);
  });

  it("treats an empty value as zero", () => {
    // Zag's `nan()`. Pressing increment on an empty field has to land on the
    // step rather than on NaN.
    expect(stepValue(Number.NaN, 1, 1)).toBe(1);
    expect(stepValue(Number.NaN, 1, -1)).toBe(-1);
  });
});

describe("UioNumberField", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = (
    options: {
      value?: number | null;
      min?: number;
      max?: number;
      step?: number;
      readOnly?: boolean;
      disabled?: boolean;
      format?: Intl.NumberFormatOptions;
    } = {},
  ) => {
    const fixture = TestBed.createComponent(Host);
    const instance = fixture.componentInstance.field as unknown as Record<string, unknown>;
    if (options.value !== undefined) instance["value"] = signal(options.value);
    if (options.min !== undefined) instance["min"] = signal(options.min);
    if (options.max !== undefined) instance["max"] = signal(options.max);
    if (options.step !== undefined) instance["step"] = signal(options.step);
    if (options.format !== undefined) instance["format"] = signal(options.format);
    instance["readOnlyInput"] = signal(options.readOnly ?? false);
    instance["disabledInput"] = signal(options.disabled ?? false);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const input = host.querySelector<HTMLInputElement>('[data-part="input"]')!;
    const decrement = host.querySelector<HTMLButtonElement>('[data-part="decrement-trigger"]')!;
    const increment = host.querySelector<HTMLButtonElement>('[data-part="increment-trigger"]')!;
    const press = (button: HTMLButtonElement) => {
      button.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0 }));
      fixture.detectChanges();
    };
    const type = (text: string) => {
      input.value = text;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      fixture.detectChanges();
    };
    const blur = () => {
      input.dispatchEvent(new FocusEvent("blur"));
      fixture.detectChanges();
    };
    const arrow = (key: string) => {
      input.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
      fixture.detectChanges();
    };
    return {
      fixture,
      host,
      input,
      decrement,
      increment,
      press,
      type,
      blur,
      arrow,
      value: () => fixture.componentInstance.field.value(),
    };
  };

  it("steps by one, and reports the number through ARIA", () => {
    const { input, increment, press, value } = render({ value: 3 });
    press(increment);
    expect(value()).toBe(4);
    expect(input.value).toBe("4");
    expect(input.getAttribute("aria-valuenow")).toBe("4");
  });

  it("stops at a bound rather than crossing it", () => {
    const { increment, decrement, press, value } = render({ value: 3, min: 0, max: 4 });
    press(increment);
    expect(value()).toBe(4);
    // The stepper is now disabled, so a second press has nothing to act on —
    // asserted through the attribute as well, because a component that clamped
    // the value but left the button live would pass the line above.
    expect(increment.disabled).toBe(true);
    expect(increment.getAttribute("data-disabled")).toBe("");
    press(increment);
    expect(value()).toBe(4);

    press(decrement);
    expect(value()).toBe(3);
    expect(increment.disabled).toBe(false);
    expect(increment.hasAttribute("data-disabled")).toBe(false);
  });

  it("disables the decrement stepper on an empty field with a minimum of zero", () => {
    // An empty value counts as zero for every range test, so this really is at
    // its minimum. With no minimum at all the default is MIN_SAFE_INTEGER and
    // the same field is steppable in both directions.
    const { decrement, increment } = render({ value: null, min: 0, max: 10 });
    expect(decrement.disabled).toBe(true);
    expect(increment.disabled).toBe(false);

    const open = render({ value: null });
    expect(open.decrement.disabled).toBe(false);
    expect(open.increment.disabled).toBe(false);
  });

  it("steps fractionally without accumulating residue", () => {
    const { increment, press, value, input } = render({ value: 0.2, step: 0.1 });
    press(increment);
    press(increment);
    expect(value()).toBe(0.4);
    expect(input.value).toBe("0.4");
  });

  it("clamps on blur, not on every keystroke", () => {
    const { type, blur, value, input } = render({ value: 0, min: 0, max: 20 });
    // `15` is unreachable in a field that clamps as you type: the `1` would
    // become the minimum the moment it was typed.
    type("1");
    expect(value()).toBe(1);
    type("15");
    expect(value()).toBe(15);
    type("150");
    expect(value()).toBe(150);
    blur();
    expect(value()).toBe(20);
    expect(input.value).toBe("20");
  });

  it("empties rather than clamping when the text is cleared", () => {
    const { type, blur, value, input } = render({ value: 5, min: 1, max: 9 });
    type("");
    blur();
    // Not `1`. An empty field is a state a user can be in, and clamping it to
    // the minimum would make the field impossible to clear.
    expect(value()).toBeNull();
    expect(input.value).toBe("");
    expect(input.hasAttribute("aria-valuenow")).toBe(false);
  });

  it("moves with the arrow keys and jumps to the bounds with Home and End", () => {
    const { arrow, value } = render({ value: 5, min: 0, max: 10 });
    arrow("ArrowUp");
    expect(value()).toBe(6);
    arrow("ArrowDown");
    expect(value()).toBe(5);
    arrow("Home");
    expect(value()).toBe(0);
    arrow("End");
    expect(value()).toBe(10);
  });

  it("refuses both directions while read-only, and every route while disabled", () => {
    const readOnly = render({ value: 3, readOnly: true });
    expect(readOnly.increment.disabled).toBe(true);
    expect(readOnly.decrement.disabled).toBe(true);
    // The input is still focusable and still reads its value out — that is what
    // separates read-only from disabled — so the keyboard has to be refused
    // separately from the steppers.
    expect(readOnly.input.disabled).toBe(false);
    readOnly.arrow("ArrowUp");
    expect(readOnly.value()).toBe(3);

    const disabled = render({ value: 3, disabled: true });
    expect(disabled.input.disabled).toBe(true);
    expect(disabled.increment.disabled).toBe(true);
    expect(disabled.decrement.disabled).toBe(true);
  });

  it("formats the value and still parses what it wrote", () => {
    const { input, increment, press, value } = render({
      value: 12,
      format: { style: "currency", currency: "USD" },
    });
    expect(input.value).toBe("$12.00");
    // The round trip is the point: the next press has to read "$12.00" back as
    // 12 rather than as NaN, which is where a naive parseFloat gives up.
    press(increment);
    expect(value()).toBe(13);
    expect(input.value).toBe("$13.00");
    expect(input.getAttribute("aria-valuenow")).toBe("13");
    // Formatting drops the input's pattern — a currency string is not what that
    // regex describes.
    expect(input.hasAttribute("pattern")).toBe(false);
  });
});
