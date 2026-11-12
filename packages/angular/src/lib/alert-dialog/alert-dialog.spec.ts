import { Component, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  UioAlertDialog,
  UioAlertDialogCancel,
  UioAlertDialogConfirm,
  UioAlertDialogDescription,
  UioAlertDialogFooter,
  UioAlertDialogTitle,
  UioAlertDialogTrigger,
} from "./alert-dialog.js";

/**
 * The half of an alert the browser gate cannot see.
 *
 * The gate compares rendered trees, so the ids, the ARIA and the state
 * attributes are already covered. What it does not cover is the one thing that
 * makes an alert an alert rather than a dialog with a different role: **a click
 * outside it is not an answer.** Nor where focus goes, or whether the page comes
 * back afterwards.
 */
@Component({
  standalone: true,
  imports: [
    UioAlertDialog,
    UioAlertDialogTrigger,
    UioAlertDialogTitle,
    UioAlertDialogDescription,
    UioAlertDialogFooter,
    UioAlertDialogCancel,
    UioAlertDialogConfirm,
  ],
  template: `
    <button uioAlertDialogTrigger [alertDialog]="d">Delete</button>
    <uio-alert-dialog #d="uioAlertDialog">
      <h2 uioAlertDialogTitle>Title</h2>
      <div uioAlertDialogDescription>Description</div>
      <div uioAlertDialogFooter>
        <button uioAlertDialogCancel>Cancel</button>
        <button uioAlertDialogConfirm>Confirm</button>
      </div>
    </uio-alert-dialog>
  `,
})
class Host {}

describe("UioAlertDialog", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector("button") as HTMLButtonElement;
    const surface = () =>
      document.querySelector<HTMLElement>('.cdk-overlay-container [data-part="content"]')!;
    return { fixture, trigger, surface };
  };

  it("does not close when something outside it is clicked", () => {
    // The whole difference from a Dialog. Zag turns outside dismissal off for
    // `role="alertdialog"` (`closeOnInteractOutside: modal && !alertDialog`),
    // because an alert is a question and a stray click is not an answer.
    const { fixture, trigger, surface } = render();
    trigger.click();
    fixture.detectChanges();
    expect(surface().getAttribute("data-state")).toBe("open");

    document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    fixture.detectChanges();
    expect(surface().getAttribute("data-state")).toBe("open");
    fixture.destroy();
  });

  it("still closes on Escape, and gives focus back to what opened it", () => {
    const { fixture, trigger, surface } = render();
    trigger.focus();
    trigger.click();
    fixture.detectChanges();
    // Cancel: zag aims an alertdialog's initial focus at the close trigger, and
    // with no × rendered Cancel is both the first close trigger and the first
    // focusable thing in the popup.
    expect(document.activeElement).toBe(surface().querySelector("[uioAlertDialogCancel]"));

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    fixture.detectChanges();
    expect(surface().getAttribute("data-state")).toBe("closed");
    // Not `document.body`: losing the user's place in the page is the failure
    // this is here to catch, and it is completely silent.
    expect(document.activeElement).toBe(trigger);
    fixture.destroy();
  });

  it("closes from either action, and puts the page back", () => {
    const { fixture, trigger, surface } = render();
    const host = fixture.nativeElement as HTMLElement;
    trigger.click();
    fixture.detectChanges();
    expect(host.closest("body > *")!.getAttribute("aria-hidden")).toBe("true");

    surface().querySelector<HTMLElement>("[uioAlertDialogConfirm]")!.click();
    fixture.detectChanges();
    expect(surface().getAttribute("data-state")).toBe("closed");
    expect(host.closest("body > *")!.hasAttribute("aria-hidden")).toBe(false);
    expect(document.activeElement).toBe(trigger);
    fixture.destroy();
  });

  /**
   * Uncontrolled, the parts' own listeners close the alert before the caller's
   * `(click)` runs, so an `openChange` handler that clears the question has
   * cleared it before Confirm can read it. Controlled, every dismissal only
   * asks, and Confirm leaves closing to the caller.
   */
  it("only asks to close when controlled, and Confirm leaves it to the caller", () => {
    const fixture = TestBed.createComponent(Host);
    const alert = fixture.debugElement.query(By.directive(UioAlertDialog))
      .componentInstance as UioAlertDialog;
    // An initializer-based input: JIT cannot bind it, so it is replaced.
    (alert as unknown as Record<string, unknown>)["controlled"] = signal(true);
    fixture.detectChanges();
    const surface = () =>
      document.querySelector<HTMLElement>('.cdk-overlay-container [data-part="content"]')!;
    let requests = 0;
    alert.closeRequest.subscribe(() => requests++);
    alert.show();
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    surface().querySelector<HTMLElement>("[uioAlertDialogCancel]")!.click();
    fixture.detectChanges();
    expect(requests).toBe(2);
    expect(surface().getAttribute("data-state")).toBe("open");

    surface().querySelector<HTMLElement>("[uioAlertDialogConfirm]")!.click();
    fixture.detectChanges();
    expect(requests).toBe(2);
    expect(surface().getAttribute("data-state")).toBe("open");
    fixture.destroy();
  });
});
