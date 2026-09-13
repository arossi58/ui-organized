import { Component, provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UioCheckbox } from "./checkbox.js";

/**
 * The forms integration, which the parity gate cannot see — see
 * `field.spec.ts` for why these bind through `[formControl]`.
 */
@Component({
  standalone: true,
  imports: [UioCheckbox, ReactiveFormsModule],
  template: `<label uioCheckbox [formControl]="control"></label>`,
})
class Host {
  readonly control = new FormControl(false);
}

describe("UioCheckbox as a form control", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("input") as HTMLInputElement;
    const root = fixture.nativeElement.querySelector("label[uioCheckbox]") as HTMLElement;
    const indicator = fixture.nativeElement.querySelector("[data-part='indicator']") as HTMLElement;
    return { fixture, input, root, indicator };
  };

  it("writes the form's value into the box", () => {
    const { fixture, input, root, indicator } = render();
    expect(input.checked).toBe(false);
    expect(root.getAttribute("data-state")).toBe("unchecked");
    expect(indicator.hasAttribute("hidden")).toBe(true);

    fixture.componentInstance.control.setValue(true);
    fixture.detectChanges();
    expect(input.checked).toBe(true);
    // The whole point of the state attribute: the form drove it, and the
    // stylesheet can see it.
    expect(root.getAttribute("data-state")).toBe("checked");
    expect(indicator.hasAttribute("hidden")).toBe(false);
  });

  it("reports a user's tick back to the form", () => {
    const { fixture, input } = render();
    input.checked = true;
    input.dispatchEvent(new Event("change"));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(true);
  });

  it("takes its disabled state from the form as well as from the caller", () => {
    const { fixture, input, root } = render();
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(input.disabled).toBe(true);
    expect(root.getAttribute("data-disabled")).toBe("");
    expect(root.className).toContain("checkbox--disabled");
  });

  it("marks itself touched on blur", () => {
    const { fixture, input } = render();
    expect(fixture.componentInstance.control.touched).toBe(false);
    input.dispatchEvent(new Event("blur"));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.touched).toBe(true);
  });
});
