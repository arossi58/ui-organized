import {
  ApplicationRef,
  Component,
  ViewChild,
  provideZonelessChangeDetection,
  signal,
} from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { UioPagination } from "./pagination.js";

/**
 * The page window at its edges, and what the component does with it.
 *
 * The arithmetic itself belongs to `@ui-organized/core` and is tested there. What
 * is Angular's — and what the browser gate can only sample a few points of — is
 * the translation: which entries become numbers and which become gaps, what each
 * gap says it hides, where `aria-current` lands, and when the arrows are dead.
 *
 * The browser gate deliberately never clicks a page (React's fixture is
 * controlled and moves nowhere), so the one thing it cannot check at all is that
 * clicking actually changes the page. That is the last spec here.
 *
 * Inputs are replaced with writable signals rather than bound: JIT registers no
 * initializer-based input — see `accordion.spec.ts`.
 */
@Component({
  standalone: true,
  imports: [UioPagination],
  template: `<nav uioPagination></nav>`,
})
class Host {
  @ViewChild(UioPagination, { static: true }) pagination!: UioPagination;
}

interface Options {
  page?: number;
  count?: number;
  siblingCount?: number;
  boundaryCount?: number;
  showPrevNext?: boolean;
}

describe("UioPagination", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });
  afterEach(() => TestBed.resetTestingModule());

  const render = (options: Options = {}) => {
    const fixture = TestBed.createComponent(Host);
    const instance = fixture.componentInstance.pagination as unknown as Record<string, unknown>;
    instance["page"] = signal(options.page ?? 1);
    instance["count"] = signal(options.count ?? 1);
    instance["siblingCount"] = signal(options.siblingCount ?? 1);
    instance["boundaryCount"] = signal(options.boundaryCount ?? 1);
    instance["showPrevNext"] = signal(options.showPrevNext ?? true);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const pages = () => [...host.querySelectorAll<HTMLElement>(".pagination__page")];
    /** What a reader sees in the row, gaps included, in order. */
    const row = () =>
      [...host.querySelectorAll<HTMLElement>(".pagination__page, .pagination__ellipsis")].map(
        (element) =>
          element.classList.contains("pagination__ellipsis") ? "…" : element.textContent!.trim(),
      );
    const gaps = () => [...host.querySelectorAll<HTMLElement>(".pagination__ellipsis")];
    const arrows = () => [
      ...host.querySelectorAll<HTMLButtonElement>("button.btn"),
    ];
    /**
     * Each jump menu's hidden pages, portalled into the CDK's container.
     *
     * Read off the item's *text* rather than its `data-value`, because JIT
     * registers no initializer-based input: `[value]` never binds here and every
     * item falls back to its generated id. The same limitation `menu.spec.ts`
     * describes, and it is the harness's rather than the component's — the
     * parity gate renders the built package, where the value lands.
     */
    const jumpMenus = () =>
      [...document.querySelectorAll<HTMLElement>('.cdk-overlay-container [data-part="content"]')]
        .map((content) =>
          [...content.querySelectorAll<HTMLElement>(".menu__item-label")].map(
            (item) => item.textContent!.trim(),
          ),
        );
    const click = (element: HTMLElement) => {
      element.click();
      fixture.detectChanges();
      TestBed.inject(ApplicationRef).tick();
    };
    return {
      fixture,
      host,
      pages,
      row,
      gaps,
      arrows,
      jumpMenus,
      click,
      pagination: fixture.componentInstance.pagination,
    };
  };

  it("collapses a long range into two gaps around the current page", () => {
    const { fixture, row } = render({ page: 5, count: 10 });
    expect(row()).toEqual(["1", "…", "4", "5", "6", "…", "10"]);
    fixture.destroy();
  });

  it("pins the window at either end without leaving a stray gap", () => {
    // The two edges, where a window computed as "page ± siblings" would run off
    // the range and render fewer numbers than the middle case does.
    const first = render({ page: 1, count: 10 });
    expect(first.row()).toEqual(["1", "2", "3", "4", "5", "…", "10"]);
    first.fixture.destroy();

    const last = render({ page: 10, count: 10 });
    expect(last.row()).toEqual(["1", "…", "6", "7", "8", "9", "10"]);
    last.fixture.destroy();
  });

  it("never hides a single page behind a gap", () => {
    /**
     * The edge the algorithm exists for: where exactly one page would be
     * collapsed, it is shown instead. An ellipsis concealing one number is
     * strictly worse than the number — it costs a click to reach something that
     * would have fitted.
     */
    const { fixture, row, gaps } = render({ page: 1, count: 5 });
    expect(row()).toEqual(["1", "2", "3", "4", "5"]);
    expect(gaps()).toHaveLength(0);
    fixture.destroy();
  });

  it("renders no gaps at all when every page fits", () => {
    const { fixture, row } = render({ page: 2, count: 3 });
    expect(row()).toEqual(["1", "2", "3"]);
    fixture.destroy();
  });

  it("widens the window with siblingCount and the ends with boundaryCount", () => {
    const siblings = render({ page: 6, count: 20, siblingCount: 2 });
    expect(siblings.row()).toEqual(["1", "…", "4", "5", "6", "7", "8", "…", "20"]);
    siblings.fixture.destroy();

    const boundaries = render({ page: 10, count: 20, boundaryCount: 3 });
    expect(boundaries.row()).toEqual([
      "1", "2", "3", "…", "9", "10", "11", "…", "18", "19", "20",
    ]);
    boundaries.fixture.destroy();
  });

  it("offers every page a gap hides, and names the range it covers", () => {
    // A gap is not decoration: it is the only way to reach what it collapsed, so
    // the menu behind it has to hold exactly those pages and no others.
    const { fixture, gaps, jumpMenus } = render({ page: 5, count: 10 });
    expect(gaps().map((gap) => gap.getAttribute("aria-label"))).toEqual([
      "Jump to a page between 2 and 3",
      "Jump to a page between 7 and 9",
    ]);
    expect(jumpMenus()).toEqual([
      ["2", "3"],
      ["7", "8", "9"],
    ]);
    fixture.destroy();
  });

  it("marks exactly one page as current", () => {
    const { fixture, pages } = render({ page: 5, count: 10 });
    const current = pages().filter((page) => page.getAttribute("aria-current") === "page");
    expect(current.map((page) => page.textContent!.trim())).toEqual(["5"]);
    fixture.destroy();
  });

  it("disables the arrow that would leave the range", () => {
    const first = render({ page: 1, count: 10 });
    expect(first.arrows().map((arrow) => arrow.disabled)).toEqual([true, false]);
    first.fixture.destroy();

    const last = render({ page: 10, count: 10 });
    expect(last.arrows().map((arrow) => arrow.disabled)).toEqual([false, true]);
    last.fixture.destroy();

    // One page: there is nowhere to go in either direction.
    const only = render({ page: 1, count: 1 });
    expect(only.arrows().map((arrow) => arrow.disabled)).toEqual([true, true]);
    only.fixture.destroy();
  });

  it("drops both arrows when showPrevNext is off", () => {
    const { fixture, arrows, row } = render({ page: 5, count: 10, showPrevNext: false });
    expect(arrows()).toHaveLength(0);
    // …and the numbers are untouched by their absence.
    expect(row()).toEqual(["1", "…", "4", "5", "6", "…", "10"]);
    fixture.destroy();
  });

  it("moves the page when a number is clicked, and reports it once", () => {
    /**
     * The half the browser gate cannot compare: React's fixture is controlled
     * and moves nowhere on a click, so nothing there ever asserts that clicking
     * works. `page` is a `model()`, so it moves on its own *and* notifies.
     */
    const { fixture, pages, click, pagination } = render({ page: 5, count: 10 });
    const reported: number[] = [];
    pagination.pageChange.subscribe((page) => reported.push(page));

    click(pages().find((page) => page.textContent!.trim() === "6")!);
    expect(pagination.page()).toBe(6);
    expect(reported).toEqual([6]);
    expect(
      pages().find((page) => page.getAttribute("aria-current") === "page")!.textContent!.trim(),
    ).toBe("6");
    fixture.destroy();
  });

  it("steps one page at a time with the arrows", () => {
    const { fixture, arrows, click, pagination } = render({ page: 5, count: 10 });
    click(arrows()[0]!);
    expect(pagination.page()).toBe(4);
    click(arrows()[1]!);
    click(arrows()[1]!);
    expect(pagination.page()).toBe(6);
    fixture.destroy();
  });
});
