import { Component, ViewChild, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  UioSheet,
  UioSheetClose,
  UioSheetDescription,
  UioSheetFooter,
  UioSheetTitle,
  UioSheetTrigger,
} from "./sheet.js";

/**
 * What a rendered tree cannot show about a sheet: where focus goes, and what
 * `modal` actually turns off.
 *
 * The `modal` half is the one worth pinning. A non-modal sheet renders almost
 * identically — one attribute differs — and behaves completely differently: the
 * page beside it stays reachable by keyboard and stays visible to a screen
 * reader. Both of those are absences, and an absence is exactly what a DOM diff
 * of the *sheet* cannot report.
 */
@Component({
  standalone: true,
  imports: [UioSheet, UioSheetTrigger, UioSheetTitle, UioSheetDescription, UioSheetFooter, UioSheetClose],
  template: `
    <button uioSheetTrigger [sheet]="s">Open</button>
    <uio-sheet #s="uioSheet">
      <h2 uioSheetTitle>Title</h2>
      <div uioSheetDescription>Description</div>
      <div uioSheetFooter><button uioSheetClose>Close</button></div>
    </uio-sheet>
  `,
})
class Host {
  @ViewChild(UioSheet, { static: true }) sheet!: UioSheet;
}

describe("UioSheet", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  /**
   * `modal` is an initializer-based input and JIT registers none of those, so a
   * spec cannot bind one — it replaces the signal instead. The parity harness
   * covers real binding, against the built package.
   */
  const render = (modal = true) => {
    const fixture = TestBed.createComponent(Host);
    (fixture.componentInstance.sheet as unknown as Record<string, unknown>)["modal"] =
      signal(modal);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector("button") as HTMLButtonElement;
    const surface = () =>
      document.querySelector<HTMLElement>('.cdk-overlay-container [data-part="content"]')!;
    return { fixture, trigger, surface };
  };

  it("focuses the close button and gives focus back on dismissal", () => {
    const { fixture, trigger, surface } = render();
    trigger.focus();
    trigger.click();
    fixture.detectChanges();
    // The × the sheet renders for itself, which is the first focusable element
    // in the panel and the one Ark lands on too.
    expect(document.activeElement).toBe(surface().querySelector(".dialog__close"));

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    fixture.detectChanges();
    expect(surface().getAttribute("data-state")).toBe("closed");
    expect(document.activeElement).toBe(trigger);
    fixture.destroy();
  });

  it("hides the page and traps focus while modal", () => {
    const { fixture, trigger } = render(true);
    const host = fixture.nativeElement as HTMLElement;
    trigger.click();
    fixture.detectChanges();
    expect(host.closest("body > *")!.getAttribute("aria-hidden")).toBe("true");
    // The CDK's trap works by putting a tabbable anchor either side of what it
    // guards; two of them is the trap being installed.
    expect(document.querySelectorAll(".cdk-focus-trap-anchor").length).toBe(2);

    trigger.click();
    fixture.detectChanges();
    expect(host.closest("body > *")!.hasAttribute("aria-hidden")).toBe(false);
    expect(document.querySelectorAll(".cdk-focus-trap-anchor").length).toBe(0);
    fixture.destroy();
  });

  it("leaves the page alone when it is not modal, outside clicks included", () => {
    const { fixture, trigger, surface } = render(false);
    const host = fixture.nativeElement as HTMLElement;
    trigger.click();
    fixture.detectChanges();

    // A panel worked *beside* the page: trapping Tab inside it would make the
    // page unreachable by keyboard while leaving it perfectly usable with a
    // mouse, and hiding it would take it away from a screen reader entirely.
    expect(host.closest("body > *")!.hasAttribute("aria-hidden")).toBe(false);
    expect(document.querySelectorAll(".cdk-focus-trap-anchor").length).toBe(0);

    document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    fixture.detectChanges();
    expect(surface().getAttribute("data-state")).toBe("open");

    // Escape still works: it is unambiguous in a way a stray click is not.
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    fixture.detectChanges();
    expect(surface().getAttribute("data-state")).toBe("closed");
    fixture.destroy();
  });
});
