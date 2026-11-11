import {
  Component,
  ViewChild,
  provideZonelessChangeDetection,
  signal,
} from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UioChip, UioChipSegment } from "./chip.js";

/**
 * The chip's structure is its accessibility contract, and the browser parity
 * gate is the only other place it is checked: every segment and the dismiss
 * control are direct *siblings* inside `.chip` (never nested, never wrapped),
 * and a static shorthand segment is a span rather than an empty tab stop.
 *
 * Inputs are assigned onto the instance rather than bound, for the reason
 * `select.spec.ts` sets out: JIT registers no initializer-based input.
 */
@Component({
  standalone: true,
  imports: [UioChip, UioChipSegment],
  template: `
    <span uioChip>
      @if (segmented()) {
        <button uioChipSegment>Name</button>
        <button uioChipSegment>is greater than</button>
        <button uioChipSegment>30</button>
      }
    </span>
  `,
})
class Host {
  readonly segmented = signal(false);
  @ViewChild(UioChip, { static: true }) chip!: UioChip;
}

describe("UioChip", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = (inputs: Record<string, unknown> = {}, segmented = false) => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.segmented.set(segmented);
    const instance = fixture.componentInstance.chip as unknown as Record<string, unknown>;
    for (const [key, value] of Object.entries(inputs)) instance[key] = signal(value);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    return { host, chip: host.querySelector<HTMLElement>(".chip")! };
  };

  it("spells the three parts of its sentence as static segments", () => {
    const { chip } = render({ label: "Role", operator: "is any of", value: "Admin, Owner" });
    expect(chip.className).toBe("chip");
    expect(chip.getAttribute("role")).toBe("group");
    const segments = [...chip.children];
    expect(segments.map((segment) => segment.tagName)).toEqual(["SPAN", "SPAN", "SPAN"]);
    expect(segments.map((segment) => segment.className)).toEqual([
      "chip__segment chip__segment--label",
      "chip__segment chip__segment--operator",
      "chip__segment chip__segment--value",
    ]);
    expect(segments.map((segment) => segment.textContent)).toEqual([
      "Role",
      "is any of",
      "Admin, Owner",
    ]);
    expect(chip.querySelector("svg")).toBeNull();
  });

  it("projects composed segments as sibling buttons, with no wrapper", () => {
    const { chip } = render({ selected: true }, true);
    expect(chip.classList.contains("chip--selected")).toBe(true);
    const segments = [...chip.children] as HTMLButtonElement[];
    expect(segments.map((segment) => segment.tagName)).toEqual(["BUTTON", "BUTTON", "BUTTON"]);
    expect(segments.map((segment) => segment.getAttribute("type"))).toEqual([
      "button",
      "button",
      "button",
    ]);
    // Each carries the segment recipe. Which part is not asserted here: a static
    // `part="operator"` binds under AOT, but JIT registers no signal input, so
    // every composed segment reads its default — the parity gate covers parts.
    expect(segments.every((segment) => segment.classList.contains("chip__segment"))).toBe(true);
    expect(chip.querySelectorAll("button button")).toHaveLength(0);
  });

  it("disables every segment it holds, shorthand ones becoming buttons", () => {
    const { chip } = render({ label: "Role", disabled: true }, true);
    const segments = [...chip.querySelectorAll<HTMLButtonElement>(".chip__segment")];
    expect(segments).toHaveLength(4);
    expect(segments.every((segment) => segment.tagName === "BUTTON" && segment.disabled)).toBe(
      true,
    );
  });

  it("keeps the dismiss control a sibling of the segments", () => {
    const { chip } = render({
      label: "Role",
      value: "Admin",
      removable: true,
      removeLabel: "Remove role filter",
    });
    const last = chip.lastElementChild!;
    expect(last.className).toBe("chip__remove");
    expect(last.getAttribute("aria-label")).toBe("Remove role filter");
    expect(chip.querySelectorAll("button button")).toHaveLength(0);
  });
});
