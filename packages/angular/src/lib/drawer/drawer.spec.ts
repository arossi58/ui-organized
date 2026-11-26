import { Component, ViewChild, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  UioDrawer,
  UioDrawerClose,
  UioDrawerDescription,
  UioDrawerFooter,
  UioDrawerTitle,
  UioDrawerTrigger,
} from "./drawer.js";
import { DrawerSwipe } from "./drawer-swipe.js";

/**
 * What the parity harness cannot show: the exit, which leaves the panel
 * displayed until its animation ends; `controlled`, where a dismissal only
 * asks; and the swipe engine's two endings, on core's arithmetic.
 */
@Component({
  standalone: true,
  imports: [
    UioDrawer,
    UioDrawerTrigger,
    UioDrawerTitle,
    UioDrawerDescription,
    UioDrawerFooter,
    UioDrawerClose,
  ],
  template: `
    <button uioDrawerTrigger [drawer]="d">Open</button>
    <uio-drawer #d="uioDrawer">
      <h2 uioDrawerTitle>Title</h2>
      <div uioDrawerDescription>Description</div>
      <div uioDrawerFooter><button uioDrawerClose>Close</button></div>
    </uio-drawer>
  `,
})
class Host {
  @ViewChild(UioDrawer, { static: true }) drawer!: UioDrawer;
}

const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** jsdom has no PointerEvent; a MouseEvent with a pointer id is what the engine reads. */
function pointer(type: string, target: EventTarget, clientY: number): void {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: 10,
    clientY,
    button: 0,
  });
  Object.defineProperty(event, "pointerId", { value: 1 });
  Object.defineProperty(event, "pointerType", { value: "mouse" });
  target.dispatchEvent(event);
}

describe("UioDrawer", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  /** Initializer inputs cannot be bound under JIT; see sheet.spec.ts. */
  const render = (inputs: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(Host);
    for (const [name, value] of Object.entries(inputs)) {
      (fixture.componentInstance.drawer as unknown as Record<string, unknown>)[name] =
        signal(value);
    }
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector("button") as HTMLButtonElement;
    const content = () =>
      document.querySelector<HTMLElement>(
        '.cdk-overlay-container [data-scope="drawer"][data-part="content"]',
      )!;
    return { fixture, trigger, content };
  };

  it("names its parts as Ark's drawer does", () => {
    const { fixture, trigger, content } = render();
    trigger.click();
    fixture.detectChanges();
    const panel = content();
    expect(panel.getAttribute("role")).toBe("dialog");
    expect(panel.getAttribute("data-swipe-direction")).toBe("down");
    expect(panel.id).toMatch(/^drawer:[^:]+:content$/);
    expect(
      panel.querySelector('[data-part="grabber"] [data-part="grabber-indicator"]'),
    ).not.toBeNull();
    expect(trigger.getAttribute("aria-controls")).toBe(panel.id);
    fixture.destroy();
  });

  it("closes on Escape, gives focus back, and hides only once the exit is done", async () => {
    const { fixture, trigger, content } = render();
    trigger.focus();
    trigger.click();
    fixture.detectChanges();
    expect(content().contains(document.activeElement)).toBe(true);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    fixture.detectChanges();
    expect(content().getAttribute("data-state")).toBe("closed");
    expect(document.activeElement).toBe(trigger);
    // Still displayed for the slide out; jsdom runs no animation, so the next
    // frame finds none and the panel hides.
    expect(content().hidden).toBe(false);
    await frame();
    await frame();
    expect(content().hidden).toBe(true);
    fixture.destroy();
  });

  it("only asks to close when controlled", () => {
    const { fixture, trigger, content } = render({ controlled: true });
    let asked = 0;
    fixture.componentInstance.drawer.closeRequest.subscribe(() => asked++);
    trigger.click();
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    fixture.detectChanges();
    expect(asked).toBe(1);
    expect(content().getAttribute("data-state")).toBe("open");
    fixture.destroy();
  });
});

describe("DrawerSwipe", () => {
  /** A 200px panel with a grabber, and a swipe engine whose dismissals are counted. */
  const setup = (closes = true) => {
    const content = document.createElement("div");
    const grabber = document.createElement("div");
    grabber.setAttribute("data-part", "grabber");
    content.append(grabber);
    document.body.append(content);
    Object.defineProperty(content, "offsetHeight", { value: 200 });
    const dismissed: number[] = [];
    const swipe = new DrawerSwipe(document, {
      content: () => content,
      backdrop: () => null,
      active: () => true,
      contentDraggable: () => true,
      dismiss: (strength) => {
        dismissed.push(strength);
        return closes;
      },
    });
    swipe.attach(content);
    return { content, grabber, swipe, dismissed };
  };

  /** Down by `dy` in ten paced moves, a hold, and a release: no fling. */
  async function drag(target: Element, dy: number) {
    pointer("pointerdown", target, 0);
    for (let i = 1; i <= 10; i++) {
      pointer("pointermove", document, (dy * i) / 10);
      await wait(16);
    }
    await wait(100);
    pointer("pointerup", document, dy);
  }

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("follows a drag on the grabber and springs back from a short one", async () => {
    const { content, grabber, swipe, dismissed } = setup();
    pointer("pointerdown", grabber, 0);
    for (const y of [10, 20, 30, 40]) {
      await wait(40);
      pointer("pointermove", document, y);
    }
    expect(content.hasAttribute("data-dragging")).toBe(true);
    expect(content.style.getPropertyValue("--drawer-translate-y")).toBe("40px");
    // 30px over 120ms of movement is a slow drag; held, it carries no fling. (A
    // 40px flick in a millisecond is a fling, and closes it here as in zag.)
    await wait(150);
    pointer("pointerup", document, 40);
    expect(dismissed).toEqual([]);
    expect(content.style.getPropertyValue("--drawer-translate-y")).toBe("0px");
    expect(content.hasAttribute("data-swiping")).toBe(false);
    swipe.detach();
  });

  it("dismisses past halfway, and keeps the panel where the drag left it", async () => {
    const { content, grabber, swipe, dismissed } = setup();
    await drag(grabber, 120);
    expect(dismissed).toHaveLength(1);
    expect(content.style.getPropertyValue("--drawer-translate-y")).toBe("120px");
    swipe.detach();
  });

  it("springs back when the caller refuses the close", async () => {
    const { content, grabber, swipe, dismissed } = setup(false);
    await drag(grabber, 120);
    expect(dismissed).toHaveLength(1);
    expect(content.style.getPropertyValue("--drawer-translate-y")).toBe("0px");
    swipe.detach();
  });

  it("waits for a clear downward move before a press on the content drags", () => {
    const { content, swipe } = setup();
    pointer("pointerdown", content, 0);
    pointer("pointermove", document, 4);
    expect(content.hasAttribute("data-dragging")).toBe(false);
    pointer("pointermove", document, 12);
    expect(content.hasAttribute("data-dragging")).toBe(true);
    pointer("pointerup", document, 12);
    swipe.detach();
  });

  it("never drags from a control that takes typing", () => {
    const { content, swipe } = setup();
    const input = document.createElement("input");
    content.append(input);
    pointer("pointerdown", input, 0);
    pointer("pointermove", document, 40);
    expect(content.hasAttribute("data-dragging")).toBe(false);
    pointer("pointerup", document, 40);
    swipe.detach();
  });
});
