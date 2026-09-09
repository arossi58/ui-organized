import { Component, ViewChild, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UioSignaturePad } from "./signature-pad.js";

/**
 * What is left once the ink is `signature-stroke.spec.ts`'s problem.
 *
 * Drawing needs a pointer and a laid-out surface, so it belongs to the browser
 * scenarios. These cover the structure a caller sees and the callbacks the DOM
 * comparison cannot: that clearing reports itself the same way a finished stroke
 * does, and that an empty pad rasterises to an empty string rather than to a
 * blank image.
 *
 * Inputs are replaced with writable signals rather than bound: JIT never
 * registers initializer-based inputs. See `steps.spec.ts`.
 */
const PATHS = ["M 10 40 q 20 -30 40 0", "M 60 20 l 20 20"];

@Component({
  standalone: true,
  imports: [UioSignaturePad],
  template: `<div uioSignaturePad></div>`,
})
class Host {
  @ViewChild(UioSignaturePad, { static: true }) pad!: UioSignaturePad;
}

describe("UioSignaturePad", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = (props: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(Host);
    const component = fixture.componentInstance.pad;
    const instance = component as unknown as Record<string, unknown>;
    // A `signal()` is writable, which is what lets `paths` — a `model()` — still
    // be set from inside the component after the replacement.
    for (const [key, value] of Object.entries(props)) instance[key] = signal(value);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      component,
      host,
      part: (name: string) => host.querySelector<HTMLElement>(`[data-part="${name}"]`)!,
      all: (name: string) => [...host.querySelectorAll<HTMLElement>(`[data-part="${name}"]`)],
      input: () => host.querySelector<HTMLInputElement>("input")!,
    };
  };

  it("names the drawing for assistive technology", () => {
    const { part } = render();
    const control = part("control");
    expect(control.getAttribute("role")).toBe("application");
    expect(control.getAttribute("aria-roledescription")).toBe("signature pad");
    expect(control.getAttribute("aria-label")).toBe("signature pad");
    // The svg's accessible name, and part of the compared contract — an svg
    // without one is an unlabelled graphic.
    expect(part("segment").querySelector("title")?.textContent).toBe("Signature");
  });

  /**
   * The machine writes `aria-disabled` whether or not anything is disabled. Odd,
   * and reproduced rather than tidied: dropping the `"false"` would give Angular
   * a control the other three libraries do not render.
   */
  it("writes aria-disabled even when it is false", () => {
    expect(render().part("control").getAttribute("aria-disabled")).toBe("false");
    expect(render({ disabled: true }).part("control").getAttribute("aria-disabled")).toBe("true");
  });

  it("takes a disabled pad out of the tab order and leaves a read-only one in it", () => {
    expect(render().part("control").getAttribute("tabindex")).toBe("0");
    expect(render({ readOnly: true }).part("control").getAttribute("tabindex")).toBe("0");
    expect(render({ disabled: true }).part("control").hasAttribute("tabindex")).toBe(false);
  });

  it("draws one path per stroke and submits them all", () => {
    const { all, input } = render({ paths: PATHS });
    expect(all("segment-path")).toHaveLength(2);
    expect(all("segment-path").map((el) => el.getAttribute("d"))).toEqual(PATHS);
    expect(input().value).toBe(PATHS.join(" "));
  });

  it("hides the clear trigger while there is nothing to clear", () => {
    expect(render().part("clear-trigger").hasAttribute("hidden")).toBe(true);
    expect(render({ paths: PATHS }).part("clear-trigger").hasAttribute("hidden")).toBe(false);
  });

  it("clears the strokes, and reports it the way a finished stroke does", () => {
    const { component, fixture, all, part, input } = render({ paths: PATHS });
    const drawn: string[][] = [];
    const ended: string[][] = [];
    component.draw.subscribe((paths) => drawn.push(paths));
    component.drawEnd.subscribe((details) => ended.push(details.paths));

    part("clear-trigger").click();
    fixture.detectChanges();

    expect(all("segment-path")).toHaveLength(0);
    expect(input().value).toBe("");
    expect(drawn).toEqual([[]]);
    expect(ended).toEqual([[]]);
  });

  it("rasterises an empty pad to an empty string rather than a blank image", async () => {
    await expect(render().component.getDataUrl("image/png")).resolves.toBe("");
  });

  /**
   * The label points at the hidden input, which is what a form submits; clicking
   * it focuses the pad instead, because the input cannot take focus.
   */
  it("labels the input and focuses the pad", () => {
    const { part, input, host } = render({ label: "Signature" });
    expect(part("label").getAttribute("for")).toBe(input().id);
    part("label").click();
    expect(host.ownerDocument.activeElement).toBe(part("control"));
  });

  it("marks a required field on the label", () => {
    const plain = render({ label: "Signature" });
    expect(plain.part("label").hasAttribute("data-required")).toBe(false);
    expect(plain.part("label").querySelector(".field__required")).toBe(null);

    const required = render({ label: "Signature", required: true });
    expect(required.part("label").hasAttribute("data-required")).toBe(true);
    expect(required.part("label").querySelector(".field__required")).not.toBe(null);
  });
});
