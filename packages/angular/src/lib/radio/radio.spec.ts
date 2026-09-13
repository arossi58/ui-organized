import { Component, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UioRadioGroup, type RadioOption } from "./radio.js";

/**
 * The forms integration, which the parity gate cannot see — see
 * `field.spec.ts` for why these bind through `[formControl]`.
 */
@Component({
  standalone: true,
  imports: [UioRadioGroup, ReactiveFormsModule],
  template: `<div uioRadioGroup [formControl]="control"></div>`,
})
class Host {
  readonly control = new FormControl<string | null>(null);
}

const OPTIONS: RadioOption[] = [
  { value: "a", label: "Apple" },
  { value: "b", label: "Banana" },
];

describe("UioRadioGroup as a form control", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = () => {
    const fixture = TestBed.createComponent(Host);
    const group = fixture.debugElement.query(By.directive(UioRadioGroup))
      .componentInstance as unknown as Record<string, unknown>;
    /**
     * The options are handed over by replacing the signal rather than by
     * binding an input, for the reason `part.spec.ts` gives: JIT never
     * registers initializer-based inputs, so `[options]` in the template above
     * would silently bind nothing and the group would render no radios at all.
     * Replacing the property is the same thing the template does — it reads
     * `options()` on every pass — and it is the only way a spec can reach a
     * signal input. Input *binding* is covered by the parity harness, which
     * runs against the built package the way a consumer does.
     */
    group["options"] = signal(OPTIONS);
    fixture.detectChanges();
    const inputs = [
      ...fixture.nativeElement.querySelectorAll("input[type=radio]"),
    ] as HTMLInputElement[];
    const root = fixture.nativeElement.querySelector("[data-part='root']") as HTMLElement;
    // Non-null: the two options above are always rendered by the time this
    // returns, and indexing them out here keeps every assertion readable.
    return { fixture, inputs, apple: inputs[0]!, banana: inputs[1]!, root };
  };

  it("writes the form's value into the group", () => {
    const { fixture, inputs, root } = render();
    expect(inputs.map((input) => input.checked)).toEqual([false, false]);

    fixture.componentInstance.control.setValue("b");
    fixture.detectChanges();
    expect(inputs.map((input) => input.checked)).toEqual([false, true]);
    // The form drove it, and the stylesheet can see which item it landed on.
    const items = [...root.querySelectorAll("[data-part='item']")] as HTMLElement[];
    expect(items.map((item) => item.getAttribute("data-state"))).toEqual([
      "unchecked",
      "checked",
    ]);
  });

  it("reports a user's choice back to the form", () => {
    const { fixture, banana } = render();
    banana.checked = true;
    banana.dispatchEvent(new Event("change"));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe("b");
  });

  it("takes its disabled state from the form as well as from the caller", () => {
    const { fixture, inputs, root } = render();
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(inputs.every((input) => input.disabled)).toBe(true);
    expect(root.getAttribute("aria-disabled")).toBe("true");
    expect(root.getAttribute("data-disabled")).toBe("");
  });

  it("marks itself touched on blur", () => {
    const { fixture, apple } = render();
    expect(fixture.componentInstance.control.touched).toBe(false);
    apple.dispatchEvent(new Event("blur"));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.touched).toBe(true);
  });

  it("gives every radio in the group one name, named or not", () => {
    // Radios only behave as one choice if they share a name, so an unnamed
    // group still needs one — and its own id is the only value guaranteed
    // unique on the page.
    const { inputs, root } = render();
    expect(inputs.map((input) => input.name)).toEqual([root.id, root.id]);
  });
});
