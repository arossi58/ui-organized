import { Component, ViewChild, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  UioCollapsible,
  UioCollapsibleContent,
  UioCollapsibleTrigger,
} from "./collapsible.js";

/**
 * The three-state machine behind a two-state control.
 *
 * The browser gate compares the two *settled* states, which is what a user sees.
 * What it cannot pin down is the state in between: a closing panel stays in the
 * DOM, unhidden, carrying `data-state="closed"` for the whole of its exit
 * animation — that is what `collapsible-up` interpolates from — and a port that
 * unmounted on the click would look correct in every screenshot and never
 * animate shut.
 *
 * jsdom runs no animations and reports `animationName: ""`, which is the same
 * branch a `prefers-reduced-motion` user takes: no animation to wait for, so the
 * transition completes at once. That makes this the right place to assert the
 * *end* states and the browser gate the right place for the middle.
 *
 * Inputs are assigned onto the instance rather than bound — JIT registers no
 * initializer-based input. See `accordion.spec.ts`.
 */
@Component({
  standalone: true,
  imports: [UioCollapsible, UioCollapsibleTrigger, UioCollapsibleContent],
  template: `
    <div uioCollapsible>
      <button uioCollapsibleTrigger>Details</button>
      <div uioCollapsibleContent>Panel body</div>
    </div>
  `,
})
class Host {
  @ViewChild(UioCollapsible, { static: true }) collapsible!: UioCollapsible;
}

describe("UioCollapsible", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = (options: { open?: boolean; disabled?: boolean } = {}) => {
    const fixture = TestBed.createComponent(Host);
    const instance = fixture.componentInstance.collapsible as unknown as Record<string, unknown>;
    if (options.open !== undefined) instance["open"] = signal(options.open);
    instance["disabledInput"] = signal(options.disabled ?? false);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const root = host.querySelector<HTMLElement>('[data-part="root"]')!;
    const trigger = host.querySelector<HTMLButtonElement>('[data-part="trigger"]')!;
    const panel = host.querySelector<HTMLElement>('[data-part="content"]')!;
    const click = () => {
      trigger.click();
      fixture.detectChanges();
    };
    /**
     * The exit is finished a frame later, not in the click.
     *
     * The machine has to read the panel's computed `animationName` to know
     * whether there *is* an animation to wait for, and that can only be read
     * once the phase it selects on has been written to the DOM — so Zag defers
     * it a frame and so does this. jsdom then reports no animation, which is the
     * reduced-motion branch: the transition completes at once from there.
     */
    const settle = async () => {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      fixture.detectChanges();
    };
    return { fixture, host, root, trigger, panel, click, settle };
  };

  it("starts closed, with the panel rendered but out of the page", () => {
    const { root, trigger, panel } = render();
    expect(root.getAttribute("data-state")).toBe("closed");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(panel.getAttribute("data-state")).toBe("closed");
    expect(panel.hasAttribute("hidden")).toBe(true);
    // Ark's marker for "this is a collapsible panel", present open or closed.
    expect(panel.getAttribute("data-collapsible")).toBe("");
  });

  it("drops the panel's data-state entirely once it is settled open", () => {
    // The attribute exists only while the enter animation runs, because it is
    // what the animation selects on. A permanent `data-state="open"` is the
    // natural thing for a port to emit and would restart the animation on every
    // render — as well as differing from all three other libraries at rest.
    const { root, trigger, panel } = render({ open: true });
    expect(root.getAttribute("data-state")).toBe("open");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(panel.hasAttribute("data-state")).toBe(false);
    expect(panel.hasAttribute("hidden")).toBe(false);
  });

  it("opens and closes from the trigger", async () => {
    const { root, trigger, panel, click, settle } = render();
    click();
    expect(root.getAttribute("data-state")).toBe("open");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(panel.hasAttribute("hidden")).toBe(false);

    click();
    // Closing, not closed: the panel stays in the page, unhidden, with
    // `data-state="closed"` on it — which is what `collapsible-up` interpolates
    // from. A port that unmounted on the click would look right in every
    // screenshot and never animate shut.
    expect(root.getAttribute("data-state")).toBe("closed");
    expect(panel.getAttribute("data-state")).toBe("closed");
    expect(panel.hasAttribute("hidden")).toBe(false);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    await settle();
    expect(panel.hasAttribute("hidden")).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("follows a bound open state without a click", () => {
    const { fixture, root, panel } = render({ open: false });
    const instance = fixture.componentInstance.collapsible as unknown as Record<string, unknown>;
    (instance["open"] as ReturnType<typeof signal<boolean>>).set(true);
    fixture.detectChanges();
    expect(root.getAttribute("data-state")).toBe("open");
    expect(panel.hasAttribute("hidden")).toBe(false);
  });

  it("refuses the click while disabled, and keeps the trigger focusable", () => {
    const { root, trigger, panel, click } = render({ disabled: true });
    // No native `disabled`: Zag puts none on the trigger and refuses the click
    // in its handler instead, so the button stays in the tab order. A port that
    // reached for the attribute would look like it was being helpful.
    expect(trigger.disabled).toBe(false);
    expect(trigger.getAttribute("data-disabled")).toBe("");
    expect(panel.getAttribute("data-disabled")).toBe("");
    // The root reports none — only the trigger and the panel do.
    expect(root.hasAttribute("data-disabled")).toBe(false);

    click();
    expect(root.getAttribute("data-state")).toBe("closed");
  });

  it("names the panel from the trigger, and the panel answers to that id", () => {
    const { trigger, panel } = render();
    expect(trigger.getAttribute("aria-controls")).toBe(panel.id);
    expect(panel.id).toBeTruthy();
  });
});
