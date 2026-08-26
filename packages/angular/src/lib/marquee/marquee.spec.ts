import { Component, ViewChild, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  UioMarquee,
  marqueeDuration,
  marqueeMultiplier,
  marqueeTranslate,
  type MarqueeItem,
} from "./marquee.js";

/**
 * Measurements taken from a **running** `@ark-ui/react` Marquee in Chromium.
 *
 * Each row is one marquee rendered by the parity harness at a 1280×800 viewport
 * with the library's own stylesheet, read back out of the DOM: how wide the
 * track and one copy of the content turned out to be, how many copies the
 * machine ended up rendering, and the `--marquee-duration` it published.
 *
 * `copies` and `duration` are the reference values. They are what the other
 * three libraries put in the DOM, and the count is contract — every copy is a
 * `content` part with its own `data-index`, `data-clone`, `role` and
 * `aria-hidden`, so a multiplier that is out by one is a visible parity failure
 * rather than a rounding detail.
 *
 * The vertical row's `rootSize` is the *settled* height, not the one the machine
 * divided by: a vertical marquee is as tall as the copies inside it, and zag
 * measures once, while two copies are on screen (284px), then keeps the fresh
 * value in a ref that never re-renders. Its `duration` still checks out, because
 * the `autoFill` branch does not use `rootSize` at all — which is why the row is
 * kept and why the multiplier assertion below skips it.
 *
 * To regenerate: run the parity harness, open
 * `/react.html?component=Marquee&props=…`, and read `root.clientWidth`,
 * `content.clientWidth`, the number of `[data-part="content"]` elements and the
 * root's `--marquee-duration`.
 */
const ZAG_MEASUREMENTS = [
  { name: "three items", rootSize: 1264, contentSize: 172, autoFill: true, speed: 50, copies: 9, duration: 27.52 },
  { name: "three items, no auto fill", rootSize: 1264, contentSize: 172, autoFill: false, speed: 50, copies: 2, duration: 25.28 },
  { name: "three items, 2rem gap", rootSize: 1264, contentSize: 252, autoFill: true, speed: 50, copies: 7, duration: 30.24 },
  { name: "three items, speed 120", rootSize: 1264, contentSize: 172, autoFill: true, speed: 120, copies: 9, duration: 11.466666666666667 },
  // A single short item needs nineteen clones to cover the track.
  { name: "one item", rootSize: 1264, contentSize: 68, autoFill: true, speed: 50, copies: 20, duration: 25.84 },
  // Content wider than the track: `autoFill` has nothing to fill, so the
  // multiplier stays 1 and the two branches of `calculateDuration` converge.
  { name: "twelve items", rootSize: 1264, contentSize: 1514, autoFill: true, speed: 50, copies: 2, duration: 30.28 },
  { name: "twelve items, no auto fill", rootSize: 1264, contentSize: 1514, autoFill: false, speed: 50, copies: 2, duration: 30.28 },
];

/** Measured with four copies on screen; the machine divided by 284. See above. */
const ZAG_VERTICAL = {
  rootSize: 584,
  contentSize: 134,
  autoFill: true,
  speed: 50,
  copies: 4,
  duration: 8.04,
};

const ITEMS: MarqueeItem[] = [
  { id: "a", content: "One" },
  { id: "b", content: "Two" },
  { id: "c", content: "Three" },
];

@Component({
  standalone: true,
  imports: [UioMarquee],
  template: `<div uioMarquee></div>`,
})
class Host {
  @ViewChild(UioMarquee, { static: true }) marquee!: UioMarquee;
}

describe("marqueeMultiplier", () => {
  it("reproduces zag's copy count from zag's own measurements", () => {
    for (const row of ZAG_MEASUREMENTS) {
      expect(
        marqueeMultiplier(row.rootSize, row.contentSize, row.autoFill) + 1,
        row.name,
      ).toBe(row.copies);
    }
  });

  it("never asks for more than one copy without autoFill", () => {
    expect(marqueeMultiplier(1264, 20, false)).toBe(1);
  });

  it("treats content it could not measure as one copy", () => {
    // Dividing by zero here would ask for `Infinity` copies, which is a browser
    // that stops responding rather than a wrong number on screen.
    expect(marqueeMultiplier(1264, 0, true)).toBe(1);
  });
});

describe("marqueeDuration", () => {
  it("reproduces zag's published --marquee-duration", () => {
    for (const row of [...ZAG_MEASUREMENTS, { ...ZAG_VERTICAL, name: "three items, vertical" }]) {
      const multiplier = row.copies - 1;
      expect(
        marqueeDuration({
          rootSize: row.rootSize,
          contentSize: row.contentSize,
          speed: row.speed,
          multiplier,
          autoFill: row.autoFill,
        }),
        row.name,
      ).toBeCloseTo(row.duration, 6);
    }
  });

  it("crosses the whole track when the content is shorter than it", () => {
    // Without autoFill a short strip still travels the full width, or it would
    // appear to stop halfway.
    expect(marqueeDuration({ rootSize: 1000, contentSize: 100, speed: 50, multiplier: 1, autoFill: false })).toBe(20);
  });

  it("survives a speed of zero", () => {
    // zag clamps to 0.001 rather than dividing by zero, which would publish
    // `--marquee-duration: Infinity s` and stop the animation dead.
    expect(Number.isFinite(marqueeDuration({ rootSize: 100, contentSize: 50, speed: 0, multiplier: 1, autoFill: true }))).toBe(true);
  });
});

describe("marqueeTranslate", () => {
  it("is zag's table", () => {
    expect(marqueeTranslate("top")).toBe("-100%");
    expect(marqueeTranslate("bottom")).toBe("100%");
    expect(marqueeTranslate("start", "ltr")).toBe("-100%");
    expect(marqueeTranslate("end", "ltr")).toBe("100%");
    // The inline sides swap with the writing direction; the block ones do not.
    expect(marqueeTranslate("start", "rtl")).toBe("100%");
    expect(marqueeTranslate("end", "rtl")).toBe("-100%");
    expect(marqueeTranslate("top", "rtl")).toBe("-100%");
  });
});

/**
 * What is left once the geometry is someone else's problem.
 *
 * jsdom has no layout, so the measurement never lands and the component renders
 * the machine's unmeasured state: two copies, the original and one clone. That
 * is the right thing to assert here — the measured counts are asserted above
 * against zag's own numbers, and the rendered ones by the browser scenarios.
 *
 * Inputs are replaced with writable signals rather than bound: JIT never
 * registers initializer-based inputs. See `steps.spec.ts`.
 */
describe("UioMarquee", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = (props: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(Host);
    const component = fixture.componentInstance.marquee;
    const instance = component as unknown as Record<string, unknown>;
    instance["items"] = signal(props["items"] ?? ITEMS);
    for (const [key, value] of Object.entries(props)) {
      if (key !== "items") instance[key] = signal(value);
    }
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      component,
      host,
      root: host.querySelector<HTMLElement>("[uiomarquee]")!,
      all: (name: string) => [...host.querySelectorAll<HTMLElement>(`[data-part="${name}"]`)],
    };
  };

  it("marks every copy but the first out of the accessibility tree", () => {
    const { all } = render();
    const copies = all("content");
    expect(copies).toHaveLength(2);
    expect(copies.map((el) => el.getAttribute("data-index"))).toEqual(["0", "1"]);
    expect(copies.map((el) => el.hasAttribute("data-clone"))).toEqual([false, true]);
    expect(copies.map((el) => el.getAttribute("aria-hidden"))).toEqual([null, "true"]);
    expect(copies.map((el) => el.getAttribute("role"))).toEqual([null, "presentation"]);
  });

  it("renders both edges, and neither when asked not to", () => {
    expect(render().all("edge").map((el) => el.getAttribute("data-side"))).toEqual([
      "start",
      "end",
    ]);
    expect(render({ showEdges: false }).all("edge")).toHaveLength(0);
  });

  /**
   * `reverse` names the direction and does nothing else: the travel comes from
   * `side`, which is chosen from `orientation` alone. A port that flipped `side`
   * here would scroll the other way from every other library.
   */
  it("puts reverse on the copies without changing the side", () => {
    const { all } = render({ reverse: true });
    expect(all("content").every((el) => el.hasAttribute("data-reverse"))).toBe(true);
    expect(all("content").every((el) => el.getAttribute("data-side") === "start")).toBe(true);
    expect(all("viewport")[0]!.getAttribute("data-side")).toBe("start");
  });

  it("takes its side from the orientation", () => {
    expect(render({ orientation: "vertical" }).all("viewport")[0]!.getAttribute("data-side")).toBe(
      "top",
    );
  });

  it("reports the paused state on the root, both ways", () => {
    const { root } = render();
    expect(root.getAttribute("data-state")).toBe("idle");
    expect(root.hasAttribute("data-paused")).toBe(false);
    const stopped = render({ paused: true });
    expect(stopped.root.getAttribute("data-state")).toBe("paused");
    expect(stopped.root.hasAttribute("data-paused")).toBe(true);
  });

  it("only pauses on interaction when asked to", () => {
    const idle = render();
    idle.root.dispatchEvent(new MouseEvent("mouseenter"));
    idle.fixture.detectChanges();
    expect(idle.root.hasAttribute("data-paused")).toBe(false);

    const reactive = render({ pauseOnInteraction: true });
    const seen: boolean[] = [];
    reactive.component.pausedChange.subscribe((paused) => seen.push(paused));
    reactive.root.dispatchEvent(new MouseEvent("mouseenter"));
    reactive.fixture.detectChanges();
    expect(reactive.root.hasAttribute("data-paused")).toBe(true);
    reactive.root.dispatchEvent(new MouseEvent("mouseleave"));
    reactive.fixture.detectChanges();
    expect(reactive.root.hasAttribute("data-paused")).toBe(false);
    expect(seen).toEqual([true, false]);
  });

  /**
   * `focus` does not bubble; `focusin` does. The region taking focus itself is
   * not a reason to stop — only something inside it is — and moving between two
   * items inside it is not leaving.
   */
  it("pauses for focus inside it, and not for its own", () => {
    const { root, fixture, all } = render({ pauseOnInteraction: true });
    root.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    fixture.detectChanges();
    expect(root.hasAttribute("data-paused")).toBe(false);

    const item = all("item")[0]!;
    item.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    fixture.detectChanges();
    expect(root.hasAttribute("data-paused")).toBe(true);

    item.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: all("item")[1]! }));
    fixture.detectChanges();
    expect(root.hasAttribute("data-paused")).toBe(true);

    item.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: document.body }));
    fixture.detectChanges();
    expect(root.hasAttribute("data-paused")).toBe(false);
  });
});
