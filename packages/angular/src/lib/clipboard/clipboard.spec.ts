import { Component, ViewChild, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { UioClipboard } from "./clipboard.js";

/**
 * The copy transition, which the browser parity gate deliberately cannot drive.
 *
 * Clicking a Clipboard trigger in a headless browser rejects — the page has no
 * clipboard permission — and React lets that rejection go unhandled, so a
 * scenario that clicked one would fail the gate's "no page errors" assertion on
 * *React* rather than on any port. The whole copied state therefore lives here.
 *
 * What matters is that the state is entered anyway. Zag's machine transitions on
 * COPY regardless of whether the write resolved, because a permission the user
 * cannot grant is not something a button should silently do nothing about.
 *
 * Inputs are replaced with writable signals rather than bound: JIT never
 * registers initializer-based inputs. See `select.spec.ts`.
 */
@Component({
  standalone: true,
  imports: [UioClipboard],
  template: `<div uioClipboard></div>`,
})
class Host {
  @ViewChild(UioClipboard, { static: true }) clipboard!: UioClipboard;
}

describe("UioClipboard", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  const render = (props: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(Host);
    const instance = fixture.componentInstance.clipboard as unknown as Record<string, unknown>;
    for (const [key, value] of Object.entries(props)) instance[key] = signal(value);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector("div[uioClipboard]") as HTMLElement;
    const find = (part: string) => host.querySelector<HTMLElement>(`[data-part="${part}"]`);
    const copied = () =>
      [...host.querySelectorAll("[data-copied]")].map((el) => el.getAttribute("data-part"));
    return { fixture, host, find, copied };
  };

  it("marks every part copied, and puts the state in the accessible name", () => {
    vi.useFakeTimers();
    const { fixture, host, find, copied } = render({ value: "https://ui-organized.dev" });
    const trigger = find("trigger")!;
    expect(host.hasAttribute("data-copied")).toBe(false);
    expect(trigger.getAttribute("aria-label")).toBe("Copy to clipboard");

    trigger.click();
    fixture.detectChanges();

    // The whole point: the write is rejected in this environment and the state
    // flips anyway.
    expect(host.getAttribute("data-copied")).toBe("");
    expect(copied().sort()).toEqual(["control", "input", "trigger"]);
    expect(trigger.getAttribute("aria-label")).toBe("Copied to clipboard");
    // Both indicators swap: the glyph and the word.
    expect(trigger.textContent?.trim()).toBe("Copied");
  });

  it("reverts after the timeout, and a second copy extends it rather than cutting it short", () => {
    vi.useFakeTimers();
    const { fixture, host, find } = render({ value: "v", timeout: 1000 });
    const trigger = find("trigger")!;

    trigger.click();
    fixture.detectChanges();
    vi.advanceTimersByTime(600);
    trigger.click();
    fixture.detectChanges();

    // 600ms into the first copy plus 600 more: past the first timeout, and the
    // second must still be showing.
    vi.advanceTimersByTime(600);
    fixture.detectChanges();
    expect(host.getAttribute("data-copied")).toBe("");

    vi.advanceTimersByTime(500);
    fixture.detectChanges();
    expect(host.hasAttribute("data-copied")).toBe(false);
    expect(trigger.textContent?.trim()).toBe("Copy");
  });

  it("spells the input's read-only state the way Ark does, not the way the rest of the library does", () => {
    const { find } = render({ value: "v" });
    // `stateFlag` would write `""` here, which is right everywhere else in this
    // package and wrong here — zag emits the literal string. See the component.
    expect(find("input")!.getAttribute("data-readonly")).toBe("true");
  });

  it("drops the value box entirely in the button variant", () => {
    const { find } = render({ value: "v", variant: "button" });
    expect(find("input")).toBeNull();
    expect(find("trigger")).not.toBeNull();
  });
});
