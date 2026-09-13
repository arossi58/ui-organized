import { Component, ViewChild, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { UioTooltip } from "./tooltip.js";

/**
 * The delays and the describing reference, neither of which a rendered tree
 * shows.
 *
 * A tooltip's whole behaviour is timing — it opens late on hover and at once on
 * focus, because a keyboard user has already committed to the control and a
 * mouse user may only be passing over it. The parity gate can prove the popup
 * eventually appears; only a fake clock can prove *when*.
 */
@Component({
  standalone: true,
  imports: [UioTooltip],
  template: `<button uioTooltip>Hover me</button>`,
})
class Host {
  @ViewChild(UioTooltip, { static: true }) tooltip!: UioTooltip;
}

describe("UioTooltip", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  const render = () => {
    const fixture = TestBed.createComponent(Host);
    // `content` is initializer-based and JIT binds none of those; the parity
    // harness covers real binding against the built package.
    (fixture.componentInstance.tooltip as unknown as Record<string, unknown>)["content"] =
      signal("Copy");
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector("button") as HTMLButtonElement;
    const content = () =>
      document.querySelector<HTMLElement>('.cdk-overlay-container [data-part="content"]')!;
    return { fixture, trigger, content };
  };

  it("waits before opening on hover, and closes after a grace period", () => {
    const { fixture, trigger, content } = render();
    trigger.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
    fixture.detectChanges();
    // Still shut: a pointer crossing a toolbar must not light up every control
    // it passes.
    expect(content().getAttribute("data-state")).toBe("closed");

    vi.advanceTimersByTime(1000);
    fixture.detectChanges();
    expect(content().getAttribute("data-state")).toBe("open");
    expect(content().textContent).toBe("Copy");

    trigger.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true }));
    fixture.detectChanges();
    expect(content().getAttribute("data-state")).toBe("open");
    vi.advanceTimersByTime(500);
    fixture.detectChanges();
    expect(content().getAttribute("data-state")).toBe("closed");
    fixture.destroy();
  });

  it("opens at once on focus", () => {
    // A keyboard user has already committed to the control; making them wait a
    // second for its only label is the wrong trade.
    const { fixture, trigger, content } = render();
    trigger.dispatchEvent(new FocusEvent("focus"));
    fixture.detectChanges();
    expect(content().getAttribute("data-state")).toBe("open");
    fixture.destroy();
  });

  it("names the trigger only while it is showing", () => {
    const { fixture, trigger, content } = render();
    expect(trigger.hasAttribute("aria-describedby")).toBe(false);
    trigger.dispatchEvent(new FocusEvent("focus"));
    fixture.detectChanges();
    expect(trigger.getAttribute("aria-describedby")).toBe(content().id);

    trigger.dispatchEvent(new FocusEvent("blur"));
    fixture.detectChanges();
    // A reference to a hidden element is worse than none: it is announced.
    expect(trigger.hasAttribute("aria-describedby")).toBe(false);
    fixture.destroy();
  });

  it("gets out of the way when the control is pressed", () => {
    const { fixture, trigger, content } = render();
    trigger.dispatchEvent(new FocusEvent("focus"));
    fixture.detectChanges();
    trigger.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    fixture.detectChanges();
    expect(content().getAttribute("data-state")).toBe("closed");
    fixture.destroy();
  });

  it("closes on Escape", () => {
    const { fixture, trigger, content } = render();
    trigger.dispatchEvent(new FocusEvent("focus"));
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    fixture.detectChanges();
    expect(content().getAttribute("data-state")).toBe("closed");
    fixture.destroy();
  });

  it("never takes pointer events, even open", () => {
    // A tooltip that swallowed the pointer would sit over the control it
    // describes and close itself the moment it appeared.
    const { fixture, trigger, content } = render();
    trigger.dispatchEvent(new FocusEvent("focus"));
    fixture.detectChanges();
    expect(content().closest<HTMLElement>(".cdk-overlay-pane")!.style.pointerEvents).toBe("none");
    fixture.destroy();
  });

  it("attaches nothing at all when it is disabled", () => {
    const fixture = TestBed.createComponent(Host);
    const tooltip = fixture.componentInstance.tooltip as unknown as Record<string, unknown>;
    tooltip["content"] = signal("Copy");
    tooltip["disabled"] = signal(true);
    fixture.detectChanges();
    expect(document.querySelector('.cdk-overlay-container [data-part="content"]')).toBeNull();
    fixture.destroy();
  });
});
