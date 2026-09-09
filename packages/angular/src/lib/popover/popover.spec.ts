import { Component, ViewChild, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  UioPopover,
  UioPopoverClose,
  UioPopoverDescription,
  UioPopoverTitle,
  UioPopoverTrigger,
} from "./popover.js";

/**
 * Focus, dismissal and the sticky placement — the parts of a popover a rendered
 * tree cannot show.
 */
@Component({
  standalone: true,
  imports: [UioPopover, UioPopoverTrigger, UioPopoverTitle, UioPopoverDescription, UioPopoverClose],
  template: `
    <button uioPopoverTrigger [popover]="popover">Open</button>
    <uio-popover #popover="uioPopover">
      <div uioPopoverTitle>Title</div>
      <div uioPopoverDescription>Description</div>
      <button uioPopoverClose>Close</button>
    </uio-popover>
  `,
})
class Host {
  @ViewChild("popover", { static: true }) popover!: UioPopover;
}

describe("UioPopover", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector("button") as HTMLButtonElement;
    const content = () =>
      document.querySelector<HTMLElement>('.cdk-overlay-container [data-part="content"]')!;
    return { fixture, trigger, content, popover: fixture.componentInstance.popover };
  };

  it("moves focus inside on open and gives it back on close", () => {
    const { fixture, trigger, content } = render();
    trigger.focus();
    trigger.click();
    fixture.detectChanges();
    expect(content().contains(document.activeElement)).toBe(true);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    fixture.detectChanges();
    expect(content().getAttribute("data-state")).toBe("closed");
    expect(document.activeElement).toBe(trigger);
    fixture.destroy();
  });

  it("closes on a pointer outside it", () => {
    const { fixture, trigger, content } = render();
    trigger.click();
    fixture.detectChanges();
    document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    fixture.detectChanges();
    expect(content().getAttribute("data-state")).toBe("closed");
    fixture.destroy();
  });

  it("does not dismiss itself when the pointer lands on its own trigger", () => {
    // Without the trigger being treated as "inside", the outside handler closes
    // the popover on pointerdown and the trigger's own click re-opens it — so
    // clicking the trigger of an open popover would never close it.
    const { fixture, trigger, content } = render();
    trigger.click();
    fixture.detectChanges();
    trigger.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    trigger.click();
    fixture.detectChanges();
    expect(content().getAttribute("data-state")).toBe("closed");
    fixture.destroy();
  });

  it("reports no placement until it has been opened, and keeps it afterwards", () => {
    // The overlay is attached while closed, so the CDK has already positioned
    // it — but Ark puts `data-placement` on a trigger only once its popup has
    // been shown, and leaves it there when it closes again.
    const { fixture, trigger, content } = render();
    expect(trigger.hasAttribute("data-placement")).toBe(false);

    trigger.click();
    fixture.detectChanges();
    expect(trigger.getAttribute("data-placement")).toBeTruthy();
    const placement = trigger.getAttribute("data-placement");

    trigger.click();
    fixture.detectChanges();
    expect(content().getAttribute("data-state")).toBe("closed");
    expect(trigger.getAttribute("data-placement")).toBe(placement);
    fixture.destroy();
  });

  it("traps focus only when it is asked to be modal", () => {
    const { fixture, trigger, popover } = render();
    trigger.click();
    fixture.detectChanges();
    expect(document.querySelectorAll(".cdk-focus-trap-anchor").length).toBe(0);
    trigger.click();
    fixture.detectChanges();

    (popover as unknown as Record<string, unknown>)["modal"] = signal(true);
    trigger.click();
    fixture.detectChanges();
    expect(document.querySelectorAll(".cdk-focus-trap-anchor").length).toBe(2);
    fixture.destroy();
  });

  it("closes from its own close button", () => {
    const { fixture, trigger, content } = render();
    trigger.click();
    fixture.detectChanges();
    content().querySelector<HTMLElement>('[data-part="close-trigger"]')!.click();
    fixture.detectChanges();
    expect(content().getAttribute("data-state")).toBe("closed");
    fixture.destroy();
  });
});
