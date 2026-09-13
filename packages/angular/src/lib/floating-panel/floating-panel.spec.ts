import { Component, ViewChild, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  UioFloatingPanel,
  UioFloatingPanelBody,
  UioFloatingPanelTitle,
  UioFloatingPanelTrigger,
} from "./floating-panel.js";

/**
 * The half of a floating panel the browser parity gate cannot reach.
 *
 * The gate compares rendered trees, so the parts, the ids and the state
 * attributes are already covered. What is left here is the behaviour that only
 * shows up over *time*: which state a panel is in after it has been opened and
 * closed again, whether Escape does anything, and where focus lands — and one
 * structural fact, the resize strip, whose order is what the stylesheet's eight
 * `--n`…`--nw` rules are keyed on.
 *
 * The trigger is wired with `[panel]`, which is a **decorator** input for the
 * reason `UioDialogTrigger.dialog` gives: JIT never registers an
 * initializer-based input, and these specs are JIT-compiled.
 */
@Component({
  standalone: true,
  imports: [UioFloatingPanel, UioFloatingPanelTrigger, UioFloatingPanelTitle, UioFloatingPanelBody],
  template: `
    <button uioFloatingPanelTrigger [panel]="p">Open</button>
    <uio-floating-panel #p="uioFloatingPanel">
      <h2 uioFloatingPanelTitle>Layers</h2>
      <div uioFloatingPanelBody>Body</div>
    </uio-floating-panel>
  `,
})
class Host {
  @ViewChild(UioFloatingPanel, { static: true }) panel!: UioFloatingPanel;
}

describe("UioFloatingPanel", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = (props: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(Host);
    const panel = fixture.componentInstance.panel;
    const instance = panel as unknown as Record<string, unknown>;
    for (const [key, value] of Object.entries(props)) instance[key] = signal(value);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector("button") as HTMLButtonElement;
    /**
     * This panel's own overlay pane, not the container.
     *
     * Two panels rendered in one test share the CDK's single
     * `.cdk-overlay-container`, so a query against it finds whichever was
     * created first — which quietly asserted the wrong panel's attributes until
     * this was scoped.
     */
    const pane = [...document.querySelectorAll<HTMLElement>(".cdk-overlay-pane")].at(-1)!;
    const part = (name: string) => pane.querySelector<HTMLElement>(`[data-part="${name}"]`)!;
    const all = (name: string) => [
      ...pane.querySelectorAll<HTMLElement>(`[data-part="${name}"]`),
    ];
    return { fixture, panel, trigger, pane, part, all };
  };

  it("renders every edge and corner, in the order the stylesheet names them", () => {
    // Eight rules in `FloatingPanel.css` are keyed on these, and the order is
    // also the one the other three libraries render them in.
    expect(render().all("resize-trigger").map((el) => el.getAttribute("data-axis"))).toEqual([
      "n",
      "e",
      "s",
      "w",
      "ne",
      "se",
      "sw",
      "nw",
    ]);
  });

  /**
   * `draggable` and `resizable` remove nothing: the machine disables the grab
   * areas so the panel keeps its outline, and reports it as `data-disabled`.
   */
  it("disables the grab areas rather than removing them", () => {
    const loose = render();
    expect(loose.part("drag-trigger").hasAttribute("data-disabled")).toBe(false);
    expect(loose.all("resize-trigger").some((el) => el.hasAttribute("data-disabled"))).toBe(false);

    const pinned = render({ draggable: false, resizable: false });
    expect(pinned.part("drag-trigger").hasAttribute("data-disabled")).toBe(true);
    expect(pinned.all("resize-trigger")).toHaveLength(8);
    expect(pinned.all("resize-trigger").every((el) => el.hasAttribute("data-disabled"))).toBe(true);
  });

  /**
   * The latch. zag pushes a panel onto its stack when it opens and never
   * recomputes the flag on the way down, so a panel that has been opened once
   * keeps `data-topmost` after it closes — while one that never has carries
   * `data-behind`. Both attributes are always emitted, because that is what the
   * shared stylesheet is written against.
   */
  it("keeps data-topmost once it has been opened, and starts data-behind", () => {
    const { fixture, trigger, part } = render();
    const content = () => part("content");
    expect(content().hasAttribute("data-topmost")).toBe(false);
    expect(content().hasAttribute("data-behind")).toBe(true);

    trigger.click();
    fixture.detectChanges();
    expect(content().hasAttribute("data-topmost")).toBe(true);
    expect(content().hasAttribute("data-behind")).toBe(false);

    trigger.click();
    fixture.detectChanges();
    expect(content().getAttribute("data-state")).toBe("closed");
    expect(content().hasAttribute("data-topmost")).toBe(true);
    expect(content().hasAttribute("data-behind")).toBe(false);
  });

  /**
   * Escape does **not** close a floating panel by default, which is the opposite
   * of every other overlay in this library and is the machine's own default:
   * zag guards its ESCAPE transition on `closeOnEsc`, and the facade passes no
   * `closeOnEscape` in any of the four libraries.
   */
  it("ignores Escape unless asked to honour it", () => {
    const stubborn = render();
    stubborn.trigger.click();
    stubborn.fixture.detectChanges();
    stubborn.part("content").dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    stubborn.fixture.detectChanges();
    expect(stubborn.panel.open()).toBe(true);

    const dismissible = render({ closeOnEscape: true });
    dismissible.trigger.click();
    dismissible.fixture.detectChanges();
    dismissible.part("content").dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    dismissible.fixture.detectChanges();
    expect(dismissible.panel.open()).toBe(false);
  });

  it("moves focus into the panel on opening and back to the trigger on closing", () => {
    const { fixture, trigger, part } = render();
    trigger.focus();
    trigger.click();
    fixture.detectChanges();
    expect(document.activeElement).toBe(part("content"));

    trigger.click();
    fixture.detectChanges();
    expect(document.activeElement).toBe(trigger);
  });

  /** The title names the panel, and the panel points at it whether or not it exists. */
  it("labels the panel with its title", () => {
    const { part } = render();
    expect(part("content").getAttribute("aria-labelledby")).toBe(part("title").id);
  });

  it("moves by whole grid steps from the keyboard", () => {
    const { fixture, trigger, part, panel } = render();
    trigger.click();
    fixture.detectChanges();
    const start = panel.position();

    const press = (key: string, shiftKey = false) => {
      const content = part("content");
      const event = new KeyboardEvent("keydown", { key, shiftKey, bubbles: true });
      // The arrows are the panel's only while the content itself has focus —
      // once focus is inside the body they belong to whatever is there.
      Object.defineProperty(event, "target", { value: content });
      content.dispatchEvent(event);
      fixture.detectChanges();
    };

    press("ArrowRight");
    expect(panel.position()).toEqual({ x: start.x + 1, y: start.y });
    press("ArrowDown", true);
    expect(panel.position()).toEqual({ x: start.x + 1, y: start.y + 10 });
  });
});
