import { Component, ViewChild, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { UioHoverCard, UioHoverCardTrigger } from "./hover-card.js";

/**
 * A hover card is entirely timing, and the parity gate can only prove that the
 * surface eventually appears.
 *
 * Two behaviours matter and neither is visible in a rendered tree. The delays,
 * which are the difference between a preview and a surface that flashes at
 * every pointer that crosses the page — and **the travel**: the pointer has to
 * be able to leave the trigger and reach the card without it closing on the way,
 * or every link inside it is unclickable.
 */
@Component({
  standalone: true,
  imports: [UioHoverCard, UioHoverCardTrigger],
  template: `
    <button uioHoverCardTrigger [hoverCard]="h">Profile</button>
    <uio-hover-card #h="uioHoverCard">Preview</uio-hover-card>
  `,
})
class Host {
  @ViewChild(UioHoverCard, { static: true }) card!: UioHoverCard;
}

describe("UioHoverCard", () => {
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
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector("button") as HTMLButtonElement;
    const content = () =>
      document.querySelector<HTMLElement>('.cdk-overlay-container [data-part="content"]')!;
    const state = () => content().getAttribute("data-state");
    const enter = (element: HTMLElement) =>
      element.dispatchEvent(new PointerEvent("pointerenter", { bubbles: false, pointerType: "mouse" }));
    const leave = (element: HTMLElement) =>
      element.dispatchEvent(new PointerEvent("pointerleave", { bubbles: false, pointerType: "mouse" }));
    return { fixture, trigger, content, state, enter, leave };
  };

  it("waits before opening on hover, and waits again before closing", () => {
    const { fixture, trigger, state, enter, leave } = render();
    enter(trigger);
    fixture.detectChanges();
    // Still shut: a pointer crossing a paragraph of links must not open every
    // card it passes over.
    expect(state()).toBe("closed");

    vi.advanceTimersByTime(600);
    fixture.detectChanges();
    expect(state()).toBe("open");

    leave(trigger);
    fixture.detectChanges();
    expect(state()).toBe("open");
    vi.advanceTimersByTime(300);
    fixture.detectChanges();
    expect(state()).toBe("closed");
    fixture.destroy();
  });

  it("stays open while the pointer travels from the trigger onto the card", () => {
    const { fixture, trigger, content, state, enter, leave } = render();
    enter(trigger);
    vi.advanceTimersByTime(600);
    fixture.detectChanges();
    expect(state()).toBe("open");

    // The travel: leaving the trigger schedules a close, entering the card has
    // to cancel it. Without the card's own pointer handlers this is the moment
    // it disappears, and nothing inside it is ever reachable.
    leave(trigger);
    enter(content());
    vi.advanceTimersByTime(1000);
    fixture.detectChanges();
    expect(state()).toBe("open");

    leave(content());
    vi.advanceTimersByTime(300);
    fixture.detectChanges();
    expect(state()).toBe("closed");
    fixture.destroy();
  });

  it("opens and closes at once for a keyboard", () => {
    // A keyboard user has already committed to the control; making them wait
    // 600ms for the preview they tabbed to is the wrong trade, and zag makes
    // the same one.
    const { fixture, trigger, state } = render();
    trigger.dispatchEvent(new FocusEvent("focus"));
    fixture.detectChanges();
    expect(state()).toBe("open");

    trigger.dispatchEvent(new FocusEvent("blur"));
    fixture.detectChanges();
    expect(state()).toBe("closed");
    fixture.destroy();
  });

  it("ignores touch, which has no hover to express intent with", () => {
    // A tap fires `pointerenter` and never `pointerleave`, so a card opened by
    // touch would stay open until something else dismissed it.
    const { fixture, trigger, state } = render();
    trigger.dispatchEvent(new PointerEvent("pointerenter", { pointerType: "touch" }));
    vi.advanceTimersByTime(2000);
    fixture.detectChanges();
    expect(state()).toBe("closed");
    fixture.destroy();
  });

  it("opens on a delay the caller sets", () => {
    const fixture = TestBed.createComponent(Host);
    // Initializer-based inputs are not registered by JIT — see `sheet.spec.ts`.
    (fixture.componentInstance.card as unknown as Record<string, unknown>)["openDelay"] = signal(0);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector("button") as HTMLButtonElement;
    trigger.dispatchEvent(new PointerEvent("pointerenter", { pointerType: "mouse" }));
    fixture.detectChanges();
    expect(
      document
        .querySelector('.cdk-overlay-container [data-part="content"]')!
        .getAttribute("data-state"),
    ).toBe("open");
    fixture.destroy();
  });
});
