import { Component, provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UioSwitch } from "./switch.js";

/**
 * The `ControlValueAccessor`, which is the one thing the parity gate cannot see.
 *
 * The gate compares rendered DOM across four libraries, and three of them have
 * no forms integration to compare against — this is a capability the React
 * library does not have, not parity debt. So it is tested here.
 *
 * These bind through `[formControl]`, not through the component's own inputs:
 * JIT never registers initializer-based inputs, but a CVA is reached through a
 * provider and its methods are called directly, so that path works exactly as it
 * does in a real build.
 */
@Component({
  standalone: true,
  imports: [UioSwitch, ReactiveFormsModule],
  template: `<label uioSwitch [formControl]="control"></label>`,
})
class Host {
  readonly control = new FormControl(false);
}

describe("UioSwitch as a form control", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("input") as HTMLInputElement;
    const root = fixture.nativeElement.querySelector("label[uioSwitch]") as HTMLElement;
    return { fixture, input, root };
  };

  it("writes the form's value into the control", () => {
    const { fixture, input, root } = render();
    expect(input.checked).toBe(false);
    expect(root.getAttribute("data-state")).toBe("unchecked");

    fixture.componentInstance.control.setValue(true);
    fixture.detectChanges();
    expect(input.checked).toBe(true);
    // The whole point of the state attribute: the form drove it, and the
    // stylesheet can see it.
    expect(root.getAttribute("data-state")).toBe("checked");
  });

  it("reports a user's toggle back to the form", () => {
    const { fixture, input } = render();
    input.checked = true;
    input.dispatchEvent(new Event("change"));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(true);
  });

  it("takes its disabled state from the form as well as from the caller", () => {
    // `setDisabledState` is how a reactive form disables a control, and it has
    // to reach the same signal the `disabled` input does — otherwise
    // `control.disable()` greys nothing.
    const { fixture, input, root } = render();
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(input.disabled).toBe(true);
    expect(root.getAttribute("data-disabled")).toBe("");
  });

  it("marks itself touched on blur", () => {
    const { fixture, input } = render();
    expect(fixture.componentInstance.control.touched).toBe(false);
    input.dispatchEvent(new Event("blur"));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.touched).toBe(true);
  });
});
