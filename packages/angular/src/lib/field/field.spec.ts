import { Component, provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UioField, UioFieldControl } from "./field.js";

/**
 * The `ControlValueAccessor` on the field's control, which is the one thing the
 * parity gate cannot see.
 *
 * The gate compares rendered DOM across four libraries and three of them have
 * no forms integration to compare against — this is a capability the React
 * library does not have, not parity debt. So it is tested here.
 *
 * Bound through `[formControl]` rather than through the component's own inputs:
 * JIT never registers initializer-based inputs, but a CVA is reached through a
 * provider and its methods are called directly, so that path works exactly as it
 * does in a real build.
 */
@Component({
  standalone: true,
  imports: [UioField, UioFieldControl, ReactiveFormsModule],
  template: `<div uioField><input uioFieldControl [formControl]="control" /></div>`,
})
class Host {
  readonly control = new FormControl("");
}

describe("UioFieldControl as a form control", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("input") as HTMLInputElement;
    return { fixture, input };
  };

  it("writes the form's value into the control", () => {
    const { fixture, input } = render();
    fixture.componentInstance.control.setValue("hello");
    fixture.detectChanges();
    expect(input.value).toBe("hello");
  });

  it("reports typing back to the form", () => {
    const { fixture, input } = render();
    input.value = "typed";
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe("typed");
  });

  it("takes its disabled state from the form as well as from the field", () => {
    // `setDisabledState` is how a reactive form disables a control, and it has
    // to reach the same expression the field's own `disabled` does — otherwise
    // `control.disable()` greys nothing.
    const { fixture, input } = render();
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(input.disabled).toBe(true);
  });

  it("marks itself touched on blur", () => {
    const { fixture, input } = render();
    expect(fixture.componentInstance.control.touched).toBe(false);
    input.dispatchEvent(new Event("blur"));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.touched).toBe(true);
  });

  it("names the control it labels", () => {
    // Not the literal ids — those are not the contract — but the relationship:
    // the field's control carries the id the label's `for` would name, and
    // reports its part so the stylesheet can find it.
    const { fixture, input } = render();
    const root = fixture.nativeElement.querySelector("[data-part='root']") as HTMLElement;
    expect(root.getAttribute("role")).toBe("group");
    expect(input.id.startsWith(`${root.id}:`)).toBe(true);
    expect(input.getAttribute("data-part")).toBe("input");
  });
});
