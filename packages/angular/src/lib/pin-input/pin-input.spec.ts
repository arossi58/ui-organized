import { Component, ViewChild, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UioPinInput, toCells } from "./pin-input.js";

/**
 * What typing into six boxes does, which is the whole of this component and
 * almost none of what the parity gate compares.
 *
 * The gate drives two keystrokes and compares the DOM afterwards. It cannot
 * check that a code pasted from an email lands one character per cell, that
 * Backspace closes the gap rather than leaving one, or that a form sees the
 * whole string — and those are the three ways a pin input goes wrong in use.
 *
 * Inputs are replaced with writable signals rather than bound: JIT never
 * registers initializer-based inputs. See `select.spec.ts`.
 */
@Component({
  standalone: true,
  imports: [UioPinInput],
  template: `<div uioPinInput></div>`,
})
class Host {
  @ViewChild(UioPinInput, { static: true }) pin!: UioPinInput;
}

/**
 * Separate from `Host`, because a `[formControl]` writes its own value into the
 * component as the directive is set up — which would overwrite whatever a test
 * had put on the `value` signal a moment earlier.
 */
@Component({
  standalone: true,
  imports: [UioPinInput, ReactiveFormsModule],
  template: `<div uioPinInput [formControl]="control"></div>`,
})
class FormHost {
  readonly control = new FormControl<string>("");
}

describe("UioPinInput", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = (props: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(Host);
    const instance = fixture.componentInstance.pin as unknown as Record<string, unknown>;
    for (const [key, value] of Object.entries(props)) instance[key] = signal(value);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const cells = () => [...host.querySelectorAll<HTMLInputElement>('input[data-part="input"]')];
    const values = () => cells().map((cell) => cell.value);
    const hidden = () => host.querySelector<HTMLInputElement>("input[aria-hidden]")!;
    const root = host.querySelector<HTMLElement>('[data-part="root"]')!;
    const focus = (index: number) => cells()[index]!.dispatchEvent(new FocusEvent("focus"));
    const type = (index: number, text: string) => {
      focus(index);
      const cell = cells()[index]!;
      cell.value = text;
      cell.dispatchEvent(new Event("input", { bubbles: true }));
      fixture.detectChanges();
    };
    const press = (index: number, key: string) => {
      focus(index);
      cells()[index]!.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
      fixture.detectChanges();
    };
    /**
     * A plain event with `clipboardData` bolted on, because jsdom has no
     * constructible `ClipboardEvent`. The component reads `getData("text/plain")`
     * and nothing else, so that is the whole of the surface being stood in for.
     */
    const paste = (index: number, text: string) => {
      focus(index);
      cells()[index]!.dispatchEvent(
        Object.assign(new Event("paste", { bubbles: true, cancelable: true }), {
          clipboardData: { getData: () => text },
        }),
      );
      fixture.detectChanges();
    };
    return { fixture, host, root, cells, values, hidden, type, press, paste };
  };

  it("splits one string across the cells and joins it back", () => {
    // The boundary coercion, at both edges: a short code leaves empty cells, a
    // long one is truncated to the cell count rather than growing the control.
    expect(toCells("12", 4)).toEqual(["1", "2", "", ""]);
    expect(toCells("12345", 3)).toEqual(["1", "2", "3"]);
    expect(toCells("", 2)).toEqual(["", ""]);
  });

  it("advances a cell at a time and reports each keystroke", () => {
    const { values, hidden, type } = render({ length: 4 });
    type(0, "1");
    type(1, "2");
    expect(values()).toEqual(["1", "2", "", ""]);
    expect(hidden().value).toBe("12");
  });

  it("overwrites a filled cell rather than appending to it", () => {
    const { cells, type } = render({ length: 2, value: "12" });
    // The browser hands over the old character and the new one together; the
    // one that was just typed is what the cell keeps.
    type(0, "19");
    expect(cells()[0]!.value).toBe("9");
  });

  it("refuses a character the type does not accept", () => {
    const { cells, hidden, type } = render({ length: 2, type: "numeric" });
    type(0, "a");
    // Rejected *and* wiped off the element: the value binding would not fire
    // again for a model value that never changed, so a stray "a" would sit there.
    expect(cells()[0]!.value).toBe("");
    expect(hidden().value).toBe("");
  });

  it("spreads a pasted code across the cells from the caret", () => {
    const { values, hidden, paste } = render({ length: 4 });
    paste(0, "1234");
    expect(values()).toEqual(["1", "2", "3", "4"]);
    expect(hidden().value).toBe("1234");
  });

  it("truncates a pasted code longer than the control", () => {
    const { hidden, paste } = render({ length: 3 });
    paste(0, "123456");
    expect(hidden().value).toBe("123");
  });

  it("rejects a paste the type does not accept, leaving the code alone", () => {
    const { hidden, paste } = render({ length: 4, type: "numeric" });
    paste(0, "12ab");
    expect(hidden().value).toBe("");
  });

  it("closes the gap when a filled cell is backspaced", () => {
    const { values, press } = render({ length: 4, value: "1234" });
    press(1, "Backspace");
    // Spliced, not blanked: the code shifts left and an empty cell is pushed
    // onto the end. Blanking in place would leave a hole to navigate back into.
    expect(values()).toEqual(["1", "3", "4", ""]);
  });

  it("eats the previous cell when backspacing an empty one", () => {
    const { values, press } = render({ length: 4, value: "12" });
    press(2, "Backspace");
    expect(values()).toEqual(["1", "", "", ""]);
  });

  it("reports complete once every cell is filled", () => {
    const { root, type } = render({ length: 2 });
    type(0, "1");
    expect(root.hasAttribute("data-complete")).toBe(false);
    type(1, "2");
    expect(root.getAttribute("data-complete")).toBe("");
  });

  it("drives a reactive form in both directions", () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const cells = () => [...host.querySelectorAll<HTMLInputElement>('input[data-part="input"]')];

    fixture.componentInstance.control.setValue("42");
    fixture.detectChanges();
    expect(cells().map((cell) => cell.value)).toEqual(["4", "2", "", ""]);

    const third = cells()[2]!;
    third.dispatchEvent(new FocusEvent("focus"));
    third.value = "7";
    third.dispatchEvent(new Event("input", { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe("427");
  });

  it("disables every cell when the form disables the control", () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    const cells = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLInputElement>(
        'input[data-part="input"]',
      ),
    ];
    expect(cells.every((cell) => cell.disabled)).toBe(true);
    // And the stylesheet can see it, which is the half a `disabled` property
    // alone would miss.
    expect(cells.every((cell) => cell.getAttribute("data-disabled") === "")).toBe(true);
  });
});
