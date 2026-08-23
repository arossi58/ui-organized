import { Component, ViewChild, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { UioScrollArea } from "./scroll-area.js";

/**
 * The anatomy and the decay, which are the two halves jsdom *can* answer.
 *
 * Everything else about a scroll area is a measurement, and jsdom measures every
 * element as zero — so which scrollbars exist, and whether `data-scrolling`
 * turns itself back off, are tested here, while the measurement itself is what
 * the browser parity gate waits for `[data-overflow-y]` to prove.
 *
 * Inputs are replaced with writable signals rather than bound: JIT never
 * registers initializer-based inputs. See `select.spec.ts`.
 */
@Component({
  standalone: true,
  imports: [UioScrollArea],
  template: `<div uioScrollArea><p>One</p></div>`,
})
class Host {
  @ViewChild(UioScrollArea, { static: true }) area!: UioScrollArea;
}

describe("UioScrollArea", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  const render = (props: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(Host);
    const instance = fixture.componentInstance.area as unknown as Record<string, unknown>;
    for (const [key, value] of Object.entries(props)) instance[key] = signal(value);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector("div[uioScrollArea]") as HTMLElement;
    const scrollbars = () => [
      ...host.querySelectorAll<HTMLElement>('[data-part="scrollbar"]'),
    ];
    return { fixture, host, scrollbars };
  };

  it("mounts without the observers jsdom does not implement", () => {
    // The guard in `ngAfterViewInit` is the assertion: without it every spec in
    // this package that happens to contain a scroll area would throw here.
    const { host } = render();
    expect(host.querySelector('[data-part="viewport"]')).not.toBeNull();
    expect(host.querySelector('[data-part="content"]')?.textContent?.trim()).toBe("One");
  });

  it("names the root from the parts Ark names it from, and not from the others", () => {
    const { host } = render({ orientationInput: "both" });
    const root = host.id;
    expect(root).not.toBe("");
    for (const selector of ["viewport", "scrollbar", "thumb", "corner"]) {
      const part = host.querySelector(`[data-part="${selector}"]`)!;
      expect(part.getAttribute("data-ownedby"), selector).toBe(root);
    }
    // The content part carries no `data-ownedby` — zag does not put one there,
    // and an extra attribute is as much a parity failure as a missing one.
    expect(host.querySelector('[data-part="content"]')!.hasAttribute("data-ownedby")).toBe(false);
  });

  it("draws the scrollbars the orientation asks for, and a corner only for both", () => {
    expect(render().scrollbars().map((bar) => bar.getAttribute("data-orientation"))).toEqual([
      "vertical",
    ]);
    expect(
      render({ orientationInput: "horizontal" })
        .scrollbars()
        .map((bar) => bar.getAttribute("data-orientation")),
    ).toEqual(["horizontal"]);

    const both = render({ orientationInput: "both" });
    expect(both.scrollbars().map((bar) => bar.getAttribute("data-orientation"))).toEqual([
      "vertical",
      "horizontal",
    ]);
    // The corner is the square where the two meet, so it exists only when both
    // do — and starts hidden, because nothing has been measured yet.
    expect(both.host.querySelector('[data-part="corner"]')!.getAttribute("data-state")).toBe(
      "hidden",
    );
  });

  it("leaves the root's own orientation unreported", () => {
    // `UioPart.orientation` is *this element's* orientation and Ark puts none on
    // a scroll area's root — which is why the caller's `orientation` input is
    // held under another name. A `data-orientation` here would style every
    // scroll area as if it were a scrollbar.
    expect(render({ orientationInput: "both" }).host.hasAttribute("data-orientation")).toBe(false);
  });

  it("turns the scrolling state back off after the scroll stops", () => {
    vi.useFakeTimers();
    const { fixture, host, scrollbars } = render();
    const viewport = host.querySelector<HTMLElement>('[data-part="viewport"]')!;
    // jsdom cannot scroll, so the position is moved directly — what is under
    // test is the decay, not the geometry.
    Object.defineProperty(viewport, "scrollTop", { value: 40, configurable: true });
    viewport.dispatchEvent(new Event("scroll"));
    fixture.detectChanges();
    expect(scrollbars()[0]!.getAttribute("data-scrolling")).toBe("");

    vi.advanceTimersByTime(1001);
    fixture.detectChanges();
    // Decaying rather than sticky: a scrollbar that never turns this off stays
    // painted over the content for the rest of the session.
    expect(scrollbars()[0]!.hasAttribute("data-scrolling")).toBe(false);
  });

  it("reports hover, which is what fades the scrollbar in", () => {
    const { fixture, host, scrollbars } = render();
    host.dispatchEvent(new MouseEvent("pointerenter"));
    fixture.detectChanges();
    expect(scrollbars()[0]!.getAttribute("data-hover")).toBe("");

    host.dispatchEvent(new MouseEvent("pointerleave"));
    fixture.detectChanges();
    expect(scrollbars()[0]!.hasAttribute("data-hover")).toBe(false);
  });
});
