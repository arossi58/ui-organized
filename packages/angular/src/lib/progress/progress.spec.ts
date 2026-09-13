import { Component, ViewChild, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UioProgress } from "./progress.js";

/**
 * The indeterminate fork, which is the whole component and the one thing a
 * rendered-DOM comparison of a *determinate* bar can never catch.
 *
 * `Progress.css` selects on `[data-state="indeterminate"]` and on nothing else,
 * so a port that treated a null value as zero would render a bar that is merely
 * empty — correct width, correct ARIA range, no animation — and pass every
 * static check in the suite.
 *
 * Inputs are replaced with writable signals rather than bound: JIT never
 * registers initializer-based inputs, and `useDefineForClassFields: false`
 * leaves each one a plain instance property a spec can swap. Real binding is
 * covered by the browser parity harness, against the built package.
 */
@Component({
  standalone: true,
  imports: [UioProgress],
  template: `<div uioProgress></div>`,
})
class Host {
  @ViewChild(UioProgress, { static: true }) progress!: UioProgress;
}

describe("UioProgress", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = (props: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(Host);
    const instance = fixture.componentInstance.progress as unknown as Record<string, unknown>;
    // Before the first pass, so the header and the track are rendered with them.
    for (const [key, value] of Object.entries(props)) instance[key] = signal(value);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector("div[uioProgress]") as HTMLElement;
    const find = (part: string) => host.querySelector<HTMLElement>(`[data-part="${part}"]`);
    return { fixture, host, find, instance };
  };

  it("reports an indeterminate bar as indeterminate, everywhere it is asked", () => {
    const { host, find } = render();
    const track = find("track")!;
    expect(host.getAttribute("data-state")).toBe("indeterminate");
    expect(track.getAttribute("data-state")).toBe("indeterminate");
    expect(find("range")!.getAttribute("data-state")).toBe("indeterminate");

    // No reading exists, so none is announced as a number — and the range has no
    // width at all, which is what leaves the CSS animation in charge of it.
    expect(track.hasAttribute("aria-valuenow")).toBe(false);
    expect(track.getAttribute("aria-label")).toBe("loading...");
    expect(host.hasAttribute("data-value")).toBe(false);
    expect(find("range")!.style.width).toBe("");
    // `--percent` is absent rather than zero: a zero would be a real reading.
    expect(host.getAttribute("style") ?? "").not.toContain("--percent");
  });

  it("switches to a determinate reading when a value arrives", () => {
    // Seeded with the default so the property is a writable signal to begin
    // with: an untouched `input()` cannot be set under the JIT compiler.
    const { fixture, host, find, instance } = render({ value: null });
    (instance["value"] as ReturnType<typeof signal<number | null>>).set(40);
    fixture.detectChanges();

    expect(host.getAttribute("data-state")).toBe("loading");
    expect(host.getAttribute("data-value")).toBe("40");
    expect(host.getAttribute("style")).toContain("--percent: 40");
    const track = find("track")!;
    expect(track.getAttribute("aria-valuenow")).toBe("40");
    // Ark names the bar after its own reading, as a percentage — never "40 of
    // 100", and never after the label beside it.
    expect(track.getAttribute("aria-label")).toBe("40%");
    expect(find("range")!.style.width).toBe("40%");
  });

  it("reads the percentage of the range, not the raw value", () => {
    const { find } = render({ value: 3, max: 5, showValue: true });
    expect(find("track")!.getAttribute("aria-label")).toBe("60%");
    expect(find("value-text")!.textContent?.trim()).toBe("60%");
    expect(find("track")!.getAttribute("aria-valuemax")).toBe("5");
  });

  it("calls a full bar complete", () => {
    const { host } = render({ value: 100 });
    expect(host.getAttribute("data-state")).toBe("complete");
  });

  it("puts a ring's value inside the ring and still renders the header", () => {
    const { host, find } = render({ value: 40, shape: "circular", showValue: true });
    expect(find("circle")).not.toBeNull();
    expect(find("track")).toBeNull();
    // The header is rendered even though nothing goes in it — `showValue` alone
    // asks for one, and all four libraries leave the empty div behind.
    expect(host.querySelector(".progress__header")).not.toBeNull();
    expect(host.querySelector(".progress__header .progress__value")).toBeNull();
    expect(find("value-text")!.className).toContain("progress__circle-value");
  });
});
