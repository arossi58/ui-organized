import { Component, provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  UioDialog,
  UioDialogClose,
  UioDialogDescription,
  UioDialogFooter,
  UioDialogTitle,
  UioDialogTrigger,
} from "./dialog.js";

/**
 * Everything about a dialog that the browser parity gate cannot see.
 *
 * The gate compares rendered trees, so it already covers the ids, the ARIA and
 * the state attributes. What it does not cover is where focus goes, what an
 * Escape reaches, and whether the page comes back — the half of a modal that is
 * invisible in a DOM diff and is exactly the half a screen-reader user lives in.
 *
 * The trigger is wired with `[dialog]`, which is a **decorator** input for this
 * reason: JIT never registers an initializer-based input, and these specs are
 * JIT-compiled. See the note on `UioDialogTrigger.dialog`.
 */
@Component({
  standalone: true,
  imports: [
    UioDialog,
    UioDialogTrigger,
    UioDialogTitle,
    UioDialogDescription,
    UioDialogFooter,
    UioDialogClose,
  ],
  template: `
    <button uioDialogTrigger [dialog]="d">Open</button>
    <uio-dialog #d="uioDialog">
      <h2 uioDialogTitle>Title</h2>
      <div uioDialogDescription>Description</div>
      <div uioDialogFooter><button uioDialogClose>Cancel</button></div>
    </uio-dialog>
  `,
})
class Host {}

describe("UioDialog", () => {
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
    const positioner = () =>
      document.querySelector<HTMLElement>('.cdk-overlay-container [data-part="positioner"]')!;
    return { fixture, trigger, surface, positioner };
  };

  it("puts focus on the first thing inside it, and gives it back on close", () => {
    const { fixture, trigger, surface } = render();
    trigger.focus();
    trigger.click();
    fixture.detectChanges();

    // The close button, which is the first focusable element Ark lands on too.
    expect(document.activeElement).toBe(surface().querySelector('[data-part="close-trigger"]'));

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    fixture.detectChanges();
    // Not `document.body`: losing the user's place in the page is the failure
    // this is here to catch, and it is completely silent.
    expect(document.activeElement).toBe(trigger);
    fixture.destroy();
  });

  it("hides the rest of the page while it is open, and restores it", () => {
    const { fixture, trigger } = render();
    const host = fixture.nativeElement as HTMLElement;
    trigger.click();
    fixture.detectChanges();
    expect(host.closest("body > *")!.getAttribute("aria-hidden")).toBe("true");

    trigger.click();
    fixture.detectChanges();
    expect(host.closest("body > *")!.hasAttribute("aria-hidden")).toBe(false);
    fixture.destroy();
  });

  it("traps Tab inside the surface while it is open", () => {
    const { fixture, trigger, positioner } = render();
    trigger.click();
    fixture.detectChanges();
    // The CDK's trap works by putting a tabbable anchor either side of what it
    // guards. They belong to the *positioner*, never inside it: the popup's
    // subtree is a region the parity gate compares element for element.
    const anchors = () => document.querySelectorAll(".cdk-focus-trap-anchor");
    expect(anchors().length).toBe(2);
    expect([...anchors()].every((anchor) => anchor.parentElement !== positioner())).toBe(true);

    trigger.click();
    fixture.detectChanges();
    expect(anchors().length).toBe(0);
    fixture.destroy();
  });

  it("closes on a pointer outside it, and stays open on one inside", () => {
    const { fixture, trigger, surface } = render();
    trigger.click();
    fixture.detectChanges();

    surface().dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    fixture.detectChanges();
    expect(surface().getAttribute("data-state")).toBe("open");

    document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    fixture.detectChanges();
    expect(surface().getAttribute("data-state")).toBe("closed");
    fixture.destroy();
  });

  it("closes from a close button the caller placed", () => {
    const { fixture, trigger, surface } = render();
    trigger.click();
    fixture.detectChanges();
    surface().querySelector<HTMLElement>("[uioDialogClose]")!.click();
    fixture.detectChanges();
    expect(surface().getAttribute("data-state")).toBe("closed");
    expect(document.activeElement).toBe(trigger);
    fixture.destroy();
  });

  it("stops taking pointer events while it is closed", () => {
    // The surface is attached from the moment the component initialises, the
    // way Ark keeps its portal rendered — so a closed dialog's full-viewport
    // positioner is laid out over the page and would swallow every click on it.
    const { fixture, positioner } = render();
    const pane = positioner().closest<HTMLElement>(".cdk-overlay-pane")!;
    expect(pane.style.pointerEvents).toBe("none");
    fixture.destroy();
  });

  it("names itself after the parts that are actually there", () => {
    // A dialog with a title and no description must not point at a description:
    // a dangling IDREF outranks any label beside it, and the popup arrives
    // unnamed. The gate sees this too — this pins the mechanism.
    const { fixture, trigger, surface } = render();
    trigger.click();
    fixture.detectChanges();
    expect(surface().getAttribute("aria-labelledby")).toMatch(/:title$/);
    expect(surface().getAttribute("aria-describedby")).toMatch(/:description$/);
    fixture.destroy();
  });
});
