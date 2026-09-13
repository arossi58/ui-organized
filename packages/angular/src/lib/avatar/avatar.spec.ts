import { Component, ViewChild, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UioAvatar } from "./avatar.js";

/**
 * The load state, which is the only thing an Avatar does.
 *
 * Both the image and the fallback are always rendered and `hidden` is swapped
 * between them — so what a static comparison sees is two elements and what a
 * user sees depends on an event that has or has not happened yet. A port that
 * mounted one *or* the other would look identical in the DOM contract for the
 * loaded case and flash empty on every slow connection.
 *
 * Inputs are replaced with writable signals rather than bound: JIT never
 * registers initializer-based inputs. See `select.spec.ts`.
 */
@Component({
  standalone: true,
  imports: [UioAvatar],
  template: `<div uioAvatar></div>`,
})
class Host {
  @ViewChild(UioAvatar, { static: true }) avatar!: UioAvatar;
}

describe("UioAvatar", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = (props: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(Host);
    const instance = fixture.componentInstance.avatar as unknown as Record<string, unknown>;
    for (const [key, value] of Object.entries(props)) instance[key] = signal(value);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector("div[uioAvatar]") as HTMLElement;
    const image = () => host.querySelector<HTMLImageElement>('[data-part="image"]');
    const fallback = () => host.querySelector<HTMLElement>('[data-part="fallback"]')!;
    return { fixture, host, image, fallback };
  };

  it("derives initials from a name", () => {
    expect(render({ name: "Ada Lovelace" }).fallback().textContent?.trim()).toBe("AL");
    expect(render({ name: "Ada" }).fallback().textContent?.trim()).toBe("A");
  });

  it("prefers an explicit fallback over the derived one", () => {
    expect(render({ name: "Ada Lovelace", fallback: "??" }).fallback().textContent?.trim()).toBe(
      "??",
    );
  });

  it("shows the fallback until the image says it has loaded", () => {
    const { fixture, image, fallback } = render({ src: "/ada.png", name: "Ada Lovelace" });
    // Rendered, and hidden — not absent. The element has to exist for its own
    // load event to be the thing that reveals it.
    expect(image()!.getAttribute("data-state")).toBe("hidden");
    expect(image()!.hasAttribute("hidden")).toBe(true);
    expect(fallback().getAttribute("data-state")).toBe("visible");
    expect(fallback().hasAttribute("hidden")).toBe(false);

    image()!.dispatchEvent(new Event("load"));
    fixture.detectChanges();

    expect(image()!.getAttribute("data-state")).toBe("visible");
    expect(image()!.hasAttribute("hidden")).toBe(false);
    expect(fallback().getAttribute("data-state")).toBe("hidden");
    expect(fallback().hasAttribute("hidden")).toBe(true);
  });

  it("goes back to the fallback when an image fails, and can recover", () => {
    const { fixture, image, fallback } = render({ src: "/gone.png", name: "Ada Lovelace" });
    image()!.dispatchEvent(new Event("load"));
    fixture.detectChanges();
    image()!.dispatchEvent(new Event("error"));
    fixture.detectChanges();

    expect(fallback().getAttribute("data-state")).toBe("visible");
    // The image is still in the DOM: an error is not a removal, so a later
    // `src` that works can still take over.
    expect(image()).not.toBeNull();
    image()!.dispatchEvent(new Event("load"));
    fixture.detectChanges();
    expect(image()!.getAttribute("data-state")).toBe("visible");
  });

  it("takes its size and shape from the shared class table", () => {
    const { host } = render({ name: "Ada", size: "lg", shape: "square" });
    expect(host.className.split(" ").sort()).toEqual(["avatar", "avatar--lg", "avatar--square"]);
  });
});
