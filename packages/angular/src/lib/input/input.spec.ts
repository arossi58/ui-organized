import { Component, provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UioInput } from "./input.js";

/**
 * The forms integration, which the parity gate cannot see — see
 * `field.spec.ts` for why these bind through `[formControl]` and not through
 * the component's own inputs.
 */
@Component({
  standalone: true,
  imports: [UioInput, ReactiveFormsModule],
  template: `<div uioInput [formControl]="control"></div>`,
})
class Host {
  readonly control = new FormControl("");
}

describe("UioInput as a form control", () => {
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

  it("keeps its own signal in step with the element", () => {
    // The reason the value is a signal bound with `[value]` rather than written
    // imperatively: if the signal fell behind what the user typed, the next
    // unrelated change detection would put the old value back and move the
    // caret with it.
    const { fixture, input } = render();
    input.value = "abc";
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();
    fixture.detectChanges();
    expect(input.value).toBe("abc");
  });

  it("takes its disabled state from the form as well as from the caller", () => {
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
});
