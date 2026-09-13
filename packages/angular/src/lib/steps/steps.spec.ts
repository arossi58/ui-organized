import { Component, ViewChild, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UioSteps, type StepItem } from "./steps.js";

/**
 * The linear guard, the bounds, and the one panel that is not a step.
 *
 * The parity gate drives Next, Back and a refused jump and compares the markup.
 * What it cannot see is the *callback* side: that `stepComplete` fires exactly
 * once, at the end, and that a refused jump reports nothing at all — a port that
 * emitted a change and then ignored it would look identical in the DOM.
 *
 * Inputs are replaced with writable signals rather than bound: JIT never
 * registers initializer-based inputs. See `select.spec.ts`.
 */
const STEPS: StepItem[] = [
  { title: "One", content: "first" },
  { title: "Two", content: "second" },
  { title: "Three", content: "third" },
];

@Component({
  standalone: true,
  imports: [UioSteps],
  template: `<div uioSteps></div>`,
})
class Host {
  @ViewChild(UioSteps, { static: true }) steps!: UioSteps;
}

describe("UioSteps", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = (props: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(Host);
    const component = fixture.componentInstance.steps;
    const instance = component as unknown as Record<string, unknown>;
    instance["steps"] = signal(props["steps"] ?? STEPS);
    for (const [key, value] of Object.entries(props)) {
      if (key !== "steps") instance[key] = signal(value);
    }
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const root = host.querySelector<HTMLElement>('[data-part="root"]')!;
    const triggers = () => [...host.querySelectorAll<HTMLButtonElement>('[data-part="trigger"]')];
    const panels = () => [...host.querySelectorAll<HTMLElement>('[data-part="content"]')];
    const openPanel = () => panels().find((panel) => !panel.hasAttribute("hidden"));
    const action = (part: string) => host.querySelector<HTMLButtonElement>(`[data-part="${part}"]`)!;
    const click = (element: HTMLElement) => {
      element.click();
      fixture.detectChanges();
    };
    /** Exactly one of complete / current / incomplete, per step. */
    const states = () =>
      triggers().map((trigger) =>
        ["complete", "current", "incomplete"].find((state) =>
          trigger.hasAttribute(`data-${state}`),
        ),
      );
    return { fixture, host, component, root, triggers, panels, openPanel, action, click, states };
  };

  it("marks each step complete, current or incomplete and nothing else", () => {
    const { states } = render({ step: 1 });
    expect(states()).toEqual(["complete", "current", "incomplete"]);
  });

  it("moves forward and back within its bounds", () => {
    const { component, action, click } = render();
    expect(action("prev-trigger").disabled).toBe(true);

    click(action("next-trigger"));
    expect(component.step()).toBe(1);
    click(action("prev-trigger"));
    expect(component.step()).toBe(0);
  });

  it("runs one step past the last, which is what completed means", () => {
    const completions: unknown[] = [];
    const { component, action, click, openPanel } = render({
      step: 2,
      completedContent: "All done",
    });
    component.stepComplete.subscribe(() => completions.push(true));

    click(action("next-trigger"));
    expect(component.step()).toBe(3);
    // The completed panel is the `count`-th content part, not a branch — which
    // is what keeps `hidden` alone deciding which panel shows.
    expect(openPanel()!.textContent?.trim()).toBe("All done");
    expect(action("next-trigger").disabled).toBe(true);
    expect(completions).toHaveLength(1);
  });

  it("jumps to a step that is clicked", () => {
    const changes: number[] = [];
    const { component, triggers, click } = render();
    component.stepChange.subscribe((step) => changes.push(step));

    click(triggers()[2]!);
    expect(component.step()).toBe(2);
    expect(changes).toEqual([2]);
  });

  it("ignores a click on any step but the current one when linear", () => {
    const changes: number[] = [];
    const { component, triggers, click } = render({ linear: true });
    component.stepChange.subscribe((step) => changes.push(step));

    click(triggers()[2]!);
    // Ignored rather than refused loudly, and reported to nobody: the list is a
    // progress indicator in this mode, not a menu.
    expect(component.step()).toBe(0);
    expect(changes).toEqual([]);
    // The steps stay enabled, so a screen reader still hears where it is. Only
    // the tab order drops them.
    expect(triggers()[2]!.disabled).toBe(false);
    expect(triggers().map((trigger) => trigger.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
  });

  it("still moves through a linear flow with Next", () => {
    const { component, action, click } = render({ linear: true });
    click(action("next-trigger"));
    expect(component.step()).toBe(1);
  });

  it("puts the progress on the root as a custom property", () => {
    const { root } = render({ step: 1 });
    // Steps.css draws the bar from --percent, so this is the whole of the
    // progress indicator — one of three, one third of the way.
    expect(root.getAttribute("style")).toContain("--percent: 33.33333333333333%");
  });

  it("keeps its identity references pointing at each other", () => {
    const { host, triggers, panels } = render();
    const list = host.querySelector<HTMLElement>('[data-part="list"]')!;
    expect(list.getAttribute("aria-owns")).toBe(
      triggers()
        .map((trigger) => trigger.id)
        .join(" "),
    );
    for (const [index, trigger] of triggers().entries()) {
      expect(trigger.getAttribute("aria-controls")).toBe(panels()[index]!.id);
      expect(panels()[index]!.getAttribute("aria-labelledby")).toBe(trigger.id);
    }
  });

  it("drops the panels and the actions together when content is off", () => {
    const { host } = render({ showContent: false });
    expect(host.querySelectorAll('[data-part="content"]')).toHaveLength(0);
    expect(host.querySelector(".steps__actions")).toBeNull();
  });

  it("guards a step trigger against submitting the form it sits in", () => {
    const { triggers } = render();
    // zag 1.43 adds this and the machine Ark React bundles does not; ours keeps
    // it because a bare <button> in a form submits it. See scenarios/Steps.ts.
    expect(triggers().every((trigger) => trigger.getAttribute("type") === "button")).toBe(true);
  });
});
