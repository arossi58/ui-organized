import { Component, ViewChild, provideZonelessChangeDetection, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  UioCarousel,
  carouselSeedPageCount,
  carouselSnapPoints,
  type CarouselSlide,
} from "./carousel.js";

/**
 * Geometry captured from a **running** `@ark-ui/react` Carousel in Chromium.
 *
 * Each row is one shape of carousel, rendered by the parity harness at a
 * 1280×800 viewport with the library's own stylesheet: every item's scroll
 * offset, the scrollable range zag divides by (`scrollWidth − offsetWidth`), and
 * the page count the machine arrived at — read back out of the DOM by binding
 * `page` to 99 and seeing which indicator `connect` clamped `data-current` onto.
 *
 * This is the reference value, not a restatement of the implementation. The
 * point of the table is the rows arithmetic gets wrong: **four slides at three
 * per page measure three pages**, not the two `ceil(4 / 3)` predicts, because
 * `maxScroll` rounds to an integer 427 while the third item sits at 853.31 —
 * over the clamp, so it merges with the end and the second does not. Five at
 * three per page measure three; six measure five; eight measure six. Any closed
 * form that agreed with the easy rows would put Angular's `disabled` arrows and
 * `data-current` dot out of step with React's on these, silently.
 *
 * To regenerate: run the parity harness (`pnpm --filter @ui-organized/parity
 * harness`), open `/react.html?component=Carousel&props=…` with `page: 99` so
 * `connect` clamps `data-current` onto the last page, and read each item's
 * `getBoundingClientRect().left − group.left + group.scrollLeft` together with
 * `group.scrollWidth − group.offsetWidth`.
 */
const ZAG_GEOMETRY: { n: number; perPage: number; offsets: number[]; maxScroll: number; pages: number }[] = [
  { n: 1, perPage: 1, offsets: [0], maxScroll: 0, pages: 1 },
  { n: 1, perPage: 3, offsets: [0], maxScroll: 0, pages: 1 },
  { n: 2, perPage: 1, offsets: [0, 1280], maxScroll: 1280, pages: 2 },
  { n: 2, perPage: 2, offsets: [0, 640], maxScroll: 0, pages: 1 },
  { n: 2, perPage: 3, offsets: [0, 426.65625], maxScroll: 0, pages: 1 },
  { n: 3, perPage: 1, offsets: [0, 1280, 2560], maxScroll: 2560, pages: 3 },
  { n: 3, perPage: 2, offsets: [0, 640, 1280], maxScroll: 640, pages: 2 },
  { n: 3, perPage: 3, offsets: [0, 426.65625, 853.3125], maxScroll: 0, pages: 1 },
  { n: 4, perPage: 1, offsets: [0, 1280, 2560, 3840], maxScroll: 3840, pages: 4 },
  { n: 4, perPage: 2, offsets: [0, 640, 1280, 1920], maxScroll: 1280, pages: 3 },
  // The row that kills the arithmetic.
  { n: 4, perPage: 3, offsets: [0, 426.65625, 853.3125, 1279.96875], maxScroll: 427, pages: 3 },
  { n: 4, perPage: 4, offsets: [0, 320, 640, 960], maxScroll: 0, pages: 1 },
  { n: 5, perPage: 2, offsets: [0, 640, 1280, 1920, 2560], maxScroll: 1920, pages: 4 },
  {
    n: 5,
    perPage: 3,
    offsets: [0, 426.65625, 853.3125, 1279.96875, 1706.625],
    maxScroll: 853,
    pages: 3,
  },
  { n: 5, perPage: 4, offsets: [0, 320, 640, 960, 1280], maxScroll: 320, pages: 2 },
  { n: 6, perPage: 2, offsets: [0, 640, 1280, 1920, 2560, 3200], maxScroll: 2560, pages: 5 },
  {
    n: 6,
    perPage: 3,
    offsets: [0, 426.65625, 853.3125, 1279.96875, 1706.625, 2133.28125],
    maxScroll: 1280,
    pages: 5,
  },
  { n: 6, perPage: 4, offsets: [0, 320, 640, 960, 1280, 1600], maxScroll: 640, pages: 3 },
  {
    n: 7,
    perPage: 3,
    offsets: [0, 426.65625, 853.3125, 1279.96875, 1706.625, 2133.28125, 2559.9375],
    maxScroll: 1707,
    pages: 6,
  },
  { n: 7, perPage: 4, offsets: [0, 320, 640, 960, 1280, 1600, 1920], maxScroll: 960, pages: 4 },
  {
    n: 8,
    perPage: 2,
    offsets: [0, 640, 1280, 1920, 2560, 3200, 3840, 4480],
    maxScroll: 3840,
    pages: 7,
  },
  {
    n: 8,
    perPage: 3,
    offsets: [
      0, 426.65625, 853.3125, 1279.96875, 1706.625, 2133.28125, 2559.9375, 2986.59375,
    ],
    maxScroll: 2133,
    pages: 6,
  },
  { n: 8, perPage: 4, offsets: [0, 320, 640, 960, 1280, 1600, 1920, 2240], maxScroll: 1280, pages: 5 },
  // Fractional pages, where a slide can be 80% visible and still count.
  { n: 3, perPage: 1.5, offsets: [0, 853.328125, 1706.65625], maxScroll: 1280, pages: 3 },
  { n: 5, perPage: 2.5, offsets: [0, 512, 1024, 1536, 2048], maxScroll: 1280, pages: 4 },
  {
    n: 6,
    perPage: 1.8,
    offsets: [0, 711.109375, 1422.21875, 2133.328125, 2844.4375, 3555.546875],
    maxScroll: 2987,
    pages: 6,
  },
];

const SLIDES: CarouselSlide[] = [
  { id: "a", content: "First" },
  { id: "b", content: "Second" },
  { id: "c", content: "Third" },
];

@Component({
  standalone: true,
  imports: [UioCarousel],
  template: `<div uioCarousel></div>`,
})
class Host {
  @ViewChild(UioCarousel, { static: true }) carousel!: UioCarousel;
}

describe("carouselSnapPoints", () => {
  it("reproduces zag's page count from zag's own geometry", () => {
    for (const row of ZAG_GEOMETRY) {
      expect(
        carouselSnapPoints(row.offsets, row.maxScroll).length,
        `${row.n} slides at ${row.perPage} per page`,
      ).toBe(row.pages);
    }
  });

  it("clamps to the scrollable range and de-duplicates what lands on it", () => {
    expect(carouselSnapPoints([0, 640, 1280, 1920], 1280)).toEqual([0, 640, 1280]);
    // A track that does not overflow has exactly one page, however many slides.
    expect(carouselSnapPoints([0, 320, 640, 960], 0)).toEqual([0]);
    expect(carouselSnapPoints([], 500)).toEqual([]);
  });

  it("treats a negative range as no range at all", () => {
    // `scrollWidth − offsetWidth` goes negative while a track is mid-layout, and
    // a negative clamp would put every page at a negative scroll position.
    expect(carouselSnapPoints([0, 100, 200], -8)).toEqual([0]);
  });
});

describe("carouselSeedPageCount", () => {
  it("is zag's pre-layout seed: a page per stride, stopping at the end", () => {
    expect(carouselSeedPageCount(3, 1)).toBe(3);
    expect(carouselSeedPageCount(1, 1)).toBe(1);
    // 0 + 2 fits, 2 + 2 does not.
    expect(carouselSeedPageCount(3, 2)).toBe(1);
    expect(carouselSeedPageCount(4, 2)).toBe(2);
    expect(carouselSeedPageCount(0, 1)).toBe(0);
    expect(carouselSeedPageCount(3, 0)).toBe(0);
  });
});

/**
 * The half of the machine that has no geometry in it.
 *
 * Everything measured belongs to the browser scenarios, which run the built
 * package in Chromium. What is worth pinning here is the derivation the parity
 * cases exist to catch — `loop` defaulting to `!!autoplay` — and the callbacks,
 * which the DOM comparison cannot see at all.
 *
 * Inputs are replaced with writable signals rather than bound: JIT never
 * registers initializer-based inputs. See `steps.spec.ts`.
 */
describe("UioCarousel", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = (props: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(Host);
    const component = fixture.componentInstance.carousel;
    const instance = component as unknown as Record<string, unknown>;
    instance["slides"] = signal(props["slides"] ?? SLIDES);
    for (const [key, value] of Object.entries(props)) {
      if (key !== "slides") instance[key] = signal(value);
    }
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const part = (name: string) => host.querySelector<HTMLElement>(`[data-part="${name}"]`)!;
    const all = (name: string) => [...host.querySelectorAll<HTMLElement>(`[data-part="${name}"]`)];
    const click = (element: HTMLElement) => {
      element.click();
      fixture.detectChanges();
    };
    return { fixture, component, host, part, all, click };
  };

  it("gives one indicator per slide, and marks the page's own", () => {
    const { all } = render();
    expect(all("indicator")).toHaveLength(3);
    expect(all("indicator").map((dot) => dot.hasAttribute("data-current"))).toEqual([
      true,
      false,
      false,
    ]);
  });

  it("disables the arrow that would run off the end", () => {
    const { part, click } = render();
    expect(part("prev-trigger").hasAttribute("disabled")).toBe(true);
    expect(part("next-trigger").hasAttribute("disabled")).toBe(false);
    click(part("next-trigger"));
    click(part("next-trigger"));
    expect(part("prev-trigger").hasAttribute("disabled")).toBe(false);
    expect(part("next-trigger").hasAttribute("disabled")).toBe(true);
  });

  it("wraps in both directions when looping", () => {
    const { part, click, component } = render({ loop: true });
    expect(part("prev-trigger").hasAttribute("disabled")).toBe(false);
    click(part("prev-trigger"));
    expect(component.page()).toBe(2);
    click(part("next-trigger"));
    expect(component.page()).toBe(0);
  });

  /**
   * The derivation the parity cases were written for: the machine defaults
   * `loop` to `!!autoplay`, so an autoplaying carousel wraps unless the caller
   * says otherwise. A port that defaults the input to `false` renders the
   * previous arrow `disabled` on the first slide, and nothing else says so.
   */
  it("derives loop from autoplay, and lets an explicit loop win", () => {
    expect(render({ autoplay: true }).part("prev-trigger").hasAttribute("disabled")).toBe(false);
    expect(
      render({ autoplay: true, loop: false }).part("prev-trigger").hasAttribute("disabled"),
    ).toBe(true);
    expect(render({}).part("prev-trigger").hasAttribute("disabled")).toBe(true);
  });

  it("silences the live region while it is playing itself", () => {
    expect(render().part("item-group").getAttribute("aria-live")).toBe("polite");
    expect(render({ autoplay: true }).part("item-group").getAttribute("aria-live")).toBe("off");
  });

  it("reports every page change once, and a no-op not at all", () => {
    const { component, part, click } = render();
    const seen: number[] = [];
    component.pageChange.subscribe((page) => seen.push(page));
    click(part("next-trigger"));
    click(part("next-trigger"));
    // Already on the last page: zag clamps rather than emitting.
    click(part("next-trigger"));
    expect(seen).toEqual([1, 2]);
  });

  /**
   * An indicator addresses a *slide* index, which past the last page is a page
   * that does not exist. zag clamps it in `connect` and keeps the caller's own
   * value; nothing rewrites the bound signal behind their back.
   */
  it("clamps a page past the end without rewriting it", () => {
    const { component, all, click } = render({ slides: SLIDES, slidesPerPage: 3 });
    // Seeded at one page: 0 + 3 fits, 3 + 3 does not.
    click(all("indicator")[2]!);
    expect(component.page()).toBe(2);
    expect(all("indicator").map((dot) => dot.hasAttribute("data-current"))).toEqual([
      true,
      false,
      false,
    ]);
  });
});
