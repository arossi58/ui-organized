import { provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UioDateInput } from "../date-input/date-input.js";
import { UioDateTimeInput } from "../date-time-input/date-time-input.js";
import { splitDateTime } from "./date-field-base.js";
import { openDatePicker } from "./open-date-picker.js";

/**
 * The pointer fork, which decides whether there is a popover at all.
 *
 * Nothing else can see it: the parity gate drives a desktop browser, so it only
 * ever renders the fine-pointer side, and the coarse side is a *different DOM* —
 * a plain button where the other has a popover trigger. Getting it backwards
 * ships either a phone with a 320px month grid in a 6px popover, or a desktop
 * with no calendar at all.
 */

type MediaStub = { matches: boolean };

function stubPointer(coarse: boolean): void {
  // jsdom has no matchMedia at all, which is also why `coarsePointer` guards it:
  // an unguarded call would make every date field un-instantiable in a spec.
  (globalThis as unknown as { matchMedia: unknown }).matchMedia = (query: string) =>
    ({
      matches: coarse,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaStub;
}

function clearPointer(): void {
  delete (globalThis as unknown as { matchMedia?: unknown }).matchMedia;
}

describe("splitDateTime", () => {
  it("splits a datetime-local value, and copes with either half missing", () => {
    expect(splitDateTime("2024-03-15T09:30")).toEqual({ date: "2024-03-15", time: "09:30" });
    expect(splitDateTime("2024-03-15")).toEqual({ date: "2024-03-15", time: "" });
    expect(splitDateTime("")).toEqual({ date: "", time: "" });
  });
});

describe("openDatePicker", () => {
  it("does nothing without an input, and never for a disabled one", () => {
    let opened = 0;
    const input = { disabled: true, showPicker: () => opened++ } as unknown as HTMLInputElement;
    openDatePicker(null);
    openDatePicker(input);
    expect(opened).toBe(0);
  });

  it("swallows a picker the browser refuses to open", () => {
    // `showPicker` throws when it is unsupported or outside a user gesture. This
    // is a pure enhancement — the input stays typeable — so a throw here must not
    // take the click handler down with it.
    const input = {
      disabled: false,
      showPicker: () => {
        throw new Error("NotAllowedError");
      },
    } as unknown as HTMLInputElement;
    expect(() => openDatePicker(input)).not.toThrow();
  });
});

describe("the coarse-pointer fork", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    clearPointer();
  });

  it("gives a fine pointer the design system's own calendar popover", () => {
    stubPointer(false);
    const fixture = TestBed.createComponent(UioDateInput);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    const trigger = root.querySelector('[data-scope="popover"][data-part="trigger"]');
    expect(trigger).not.toBeNull();
    expect(trigger!.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger!.getAttribute("aria-label")).toBe("Choose date");
    // The surface is portalled, so it is outside the field rather than missing.
    expect(document.querySelector(".cdk-overlay-container .date-popover")).not.toBeNull();
    fixture.destroy();
  });

  it("gives a coarse pointer a plain button and no popover at all", () => {
    stubPointer(true);
    const fixture = TestBed.createComponent(UioDateInput);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[data-scope="popover"]')).toBeNull();
    const button = root.querySelector("button.input-affix__action")!;
    expect(button.getAttribute("aria-label")).toBe("Choose date");
    expect(button.hasAttribute("aria-expanded")).toBe(false);
    // Not merely hidden: on touch the calendar is never built.
    expect(document.querySelector(".cdk-overlay-container .date-popover")).toBeNull();
    fixture.destroy();
  });

  it("renders the native type each wrapper fixes, and flags the empty field", () => {
    stubPointer(false);
    const fixture = TestBed.createComponent(UioDateTimeInput);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('[data-part="input"]') as HTMLInputElement;

    expect(input.getAttribute("type")).toBe("datetime-local");
    // A native date input is never `:placeholder-shown`, so the empty state is
    // flagged instead — and as the string "true", which is what the other three
    // render and what the parity gate compares.
    expect(input.getAttribute("data-empty")).toBe("true");
    expect(
      fixture.nativeElement.querySelector('[data-part="trigger"]')!.getAttribute("aria-label"),
    ).toBe("Choose date and time");
    fixture.destroy();
  });
});
