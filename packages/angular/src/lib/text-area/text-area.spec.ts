import { Component, provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UioTextArea } from "./text-area.js";

/**
 * The forms integration, which the parity gate cannot see — see
 * `field.spec.ts` for why these bind through `[formControl]`.
 */
@Component({
  standalone: true,
  imports: [UioTextArea, ReactiveFormsModule],
  template: `<div uioTextArea [formControl]="control"></div>`,
})
class Host {
  readonly control = new FormControl("");
}

describe("UioTextArea as a form control", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector("textarea") as HTMLTextAreaElement;
    return { fixture, textarea };
  };

  it("writes the form's value into the control", () => {
    const { fixture, textarea } = render();
    fixture.componentInstance.control.setValue("a long answer");
    fixture.detectChanges();
    expect(textarea.value).toBe("a long answer");
  });

  it("reports typing back to the form", () => {
    const { fixture, textarea } = render();
    textarea.value = "typed";
    textarea.dispatchEvent(new Event("input"));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe("typed");
  });

  it("takes its disabled state from the form as well as from the caller", () => {
    const { fixture, textarea } = render();
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(textarea.disabled).toBe(true);
  });

  it("marks itself touched on blur", () => {
    const { fixture, textarea } = render();
    expect(fixture.componentInstance.control.touched).toBe(false);
    textarea.dispatchEvent(new Event("blur"));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.touched).toBe(true);
  });
});
