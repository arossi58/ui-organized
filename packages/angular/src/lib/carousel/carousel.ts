import {
  ApplicationRef,
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { carouselStyles, type CarouselVariants, type ControlSize } from "@ui-organized/core";
import { UioPart, stateFlag } from "../part.js";
import { nextMachineId } from "../part-ids.js";
import { UioButton } from "../button/button.js";
import { flushNow } from "../overlay/flush.js";

export type CarouselSize = ControlSize;
export type CarouselVariant = NonNullable<CarouselVariants["variant"]>;
export type CarouselOrientation = "horizontal" | "vertical";

export interface CarouselSlide {
  /** Unique across the carousel. */
  id: string;
  /**
   * A string, or a template for anything richer.
   *
   * The other three libraries take a node here, which Angular has no equivalent
   * of inside a data array — the same shape as `SplitterPanelDef.content`.
   */
  content?: string | TemplateRef<unknown>;
}

/** zag's default when `autoplay` is `true` rather than `{ delay }`. */
const DEFAULT_AUTOPLAY_DELAY = 4000;

/**
 * The fraction of a slide that has to be inside the viewport for it to count as
 * in view. zag's `inViewThreshold`, handed to the same `IntersectionObserver`
 * zag uses, so both libraries answer `data-inview` from the same measurement.
 */
const IN_VIEW_THRESHOLD = 0.6;

/**
 * How far the track may sit from its page's snap point before a refresh drags it
 * back. zag's `DRIFT_THRESHOLD`, in pixels.
 */
const DRIFT_THRESHOLD = 1;

/** Authored default gap, matching the React component's. */
const DEFAULT_SPACING = "var(--spacing-space-04)";

/**
 * The pages of a carousel, from the laid-out geometry — zag's page count,
 * reproduced.
 *
 * ── Why this is measured rather than counted ────────────────────────────────
 *
 * The obvious arithmetic is wrong, and it is wrong in a way that only a browser
 * can show. zag lays the track out with CSS scroll snapping and reads the snap
 * positions back (`@zag-js/scroll-snap` `getScrollSnapPositions`): every item's
 * scroll offset, clamped into `[0, scrollWidth − offsetWidth]`, de-duplicated.
 * The pages are those positions.
 *
 * Clamping is what makes the count un-derivable. With `slidesPerPage: 3` in a
 * 1280px viewport a slide is 426.65625px wide, `scrollWidth` and `offsetWidth`
 * are integers, and whether the second-to-last offset lands above or below the
 * clamp is decided by sub-pixel rounding. Four slides at three per page measure
 * **three** pages, not the two that `ceil(4 / 3)` predicts, because
 * `maxScroll` rounds to 427 and the third item's offset is 853.31 — over the
 * line, so it collapses onto the end while the second does not. Five slides at
 * three per page measure three; six measure five. No closed form reproduces
 * that sequence, and one that agreed on the easy cases would put Angular's
 * `disabled` arrows and `data-current` dot out of step with React's on the hard
 * ones without ever failing a unit test.
 *
 * So this is zag's computation on zag's inputs. Every whole slide snaps —
 * `Carousel.css` sets `scroll-snap-align: start` on `.carousel__item`, which is
 * why the offsets are *all* the items' and not only the ones zag also writes it
 * on inline.
 *
 * Checked, not merely ported: `carousel.spec.ts` holds geometry captured from a
 * running `@ark-ui/react` Carousel in Chromium — offsets, `maxScroll`, and the
 * page count the machine arrived at — for twenty-odd shapes, and asserts this
 * function reproduces the count from the same numbers.
 *
 * @param offsets   Each item's scroll offset from the start of the track.
 * @param maxScroll `scrollWidth − offsetWidth` along the scroll axis.
 */
export function carouselSnapPoints(offsets: readonly number[], maxScroll: number): number[] {
  const limit = Math.max(maxScroll, 0);
  const points: number[] = [];
  for (const offset of offsets) {
    const clamped = Math.min(Math.max(offset, 0), limit);
    if (!points.includes(clamped)) points.push(clamped);
  }
  return points;
}

/**
 * The page count before anything has been laid out.
 *
 * zag seeds `pageSnapPoints` with this and replaces it the moment the track has
 * a width, so it is what the first frame renders and never what a user sees. It
 * is reproduced rather than left at zero because the alternative first frame —
 * no pages, both arrows `disabled` — is the one a screenshot test would catch.
 *
 * zag's `getPageSnapPoints`, transcribed: a page starts at every `perMove`-th
 * slide, and the walk stops as soon as a page would run off the end.
 */
export function carouselSeedPageCount(slideCount: number, slidesPerPage: number): number {
  const perMove = Math.floor(slidesPerPage);
  if (slideCount <= 0 || slidesPerPage <= 0 || perMove <= 0) return 0;
  let pages = 0;
  for (let i = 0; i < slideCount; i += perMove) {
    if (i + slidesPerPage > slideCount) break;
    pages++;
  }
  return pages;
}

/**
 * A scroll-snap slide track with page controls and dot indicators.
 *
 * ```html
 * <div uioCarousel [slides]="slides" [(page)]="page"></div>
 * ```
 *
 * ── What is measured, and why all of it has to be ───────────────────────────
 *
 * Two things here read the laid-out DOM rather than deriving anything:
 * `carouselSnapPoints` above, and `data-inview`. Both because the alternative
 * silently disagrees with the other three libraries.
 *
 * `data-inview` is an `IntersectionObserver` at threshold 0.6 rooted on the item
 * group — zag's own mechanism, and a browser API rather than a dependency. A
 * whole-slide count would be exact for an integer `slidesPerPage` and wrong for
 * a fractional one: at `slidesPerPage: 1.8` the second slide is 80% visible,
 * which clears the threshold, and no count of whole slides predicts that.
 *
 * The cost is that `data-inview` — and the `aria-hidden` derived from it — is
 * empty for a frame after mount, exactly as it is in the other three libraries,
 * which seed `slidesInView: []` and fill it from the observer.
 *
 * ── `loop` is derived from `autoplay` ───────────────────────────────────────
 *
 * The machine defaults `loop` to `!!autoplay`, so an autoplaying carousel wraps
 * unless the caller says otherwise, and a *playing* carousel wraps even when
 * `loop` is false — but stops at the end rather than wrapping forever, because
 * the tick pauses instead of advancing once `canScrollNext` is false. Both
 * halves are reproduced; defaulting the input to `false` instead would replace a
 * derivation with a decision the caller never made, and the symptom is the
 * previous arrow rendering `disabled` on the first slide.
 *
 * ── Reduced motion ─────────────────────────────────────────────────────────
 *
 * There is deliberately no policy here. zag's carousel does not consult
 * `prefers-reduced-motion`, so neither does this; `Carousel.css` drops the
 * indicator transition under the media query, which is where the design system
 * expresses it. Inventing an autoplay policy would make Angular the one library
 * whose carousel stops moving.
 */
@Component({
  selector: "div[uioCarousel]",
  standalone: true,
  exportAs: "uioCarousel",
  imports: [UioButton, NgTemplateOutlet],
  template: `
    <div
      class="carousel__items"
      data-scope="carousel"
      data-part="item-group"
      tabindex="0"
      [id]="partId('item-group')"
      [attr.data-orientation]="orientation()"
      [attr.aria-live]="playing() ? 'off' : 'polite'"
      [attr.style]="itemGroupStyle()"
      (keydown)="onItemGroupKeydown($event)"
    >
      @for (slide of slides(); track slide.id; let index = $index) {
        <div
          class="carousel__item"
          data-scope="carousel"
          data-part="item"
          role="group"
          aria-roledescription="slide"
          [id]="partId('item:' + index)"
          [attr.data-index]="index"
          [attr.data-orientation]="orientation()"
          [attr.data-inview]="flag(inView().includes(index))"
          [attr.aria-hidden]="inView().includes(index) ? null : 'true'"
          [attr.aria-label]="index + 1 + ' of ' + slides().length"
          [attr.style]="itemStyle(index)"
        >
          @if (asTemplate(slide.content); as template) {
            <ng-container [ngTemplateOutlet]="template" />
          } @else {
            {{ slide.content }}
          }
        </div>
      }
    </div>

    <div
      class="carousel__control"
      data-scope="carousel"
      data-part="control"
      [attr.data-orientation]="orientation()"
    >
      @if (variant() !== "minimal") {
        <button
          uioButton
          intent="ghost"
          icon="chevron-left"
          aria-label="Previous slide"
          data-scope="carousel"
          data-part="prev-trigger"
          [id]="partId('prev-trigger')"
          [size]="size()"
          [disabled]="!canScrollPrev()"
          [attr.data-orientation]="orientation()"
          [attr.aria-controls]="partId('item-group')"
          (click)="previous()"
        ></button>
      }

      @if (showIndicators()) {
        <div
          class="carousel__indicators"
          data-scope="carousel"
          data-part="indicator-group"
          [id]="partId('indicator-group')"
          [attr.data-orientation]="orientation()"
          (keydown)="onIndicatorKeydown($event)"
        >
          <!--
            One indicator per *slide*, not per page. That is what the other three
            libraries render, because the component maps its own slide list here
            and hands each entry an index. With more than one slide per page the
            trailing dots therefore name pages that do not exist; zag clamps such
            an index on arrival rather than refusing it, and so does "commit".
          -->
          @for (slide of slides(); track slide.id; let index = $index) {
            <button
              class="carousel__indicator"
              data-scope="carousel"
              data-part="indicator"
              type="button"
              [id]="partId('indicator:' + index)"
              [attr.data-orientation]="orientation()"
              [attr.data-index]="index"
              [attr.data-current]="flag(index === activePage())"
              [attr.aria-label]="'Go to slide ' + (index + 1)"
              (click)="goTo(index)"
            ></button>
          }
        </div>
      }

      @if (variant() !== "minimal") {
        <button
          uioButton
          intent="ghost"
          icon="chevron-right"
          aria-label="Next slide"
          data-scope="carousel"
          data-part="next-trigger"
          [id]="partId('next-trigger')"
          [size]="size()"
          [disabled]="!canScrollNext()"
          [attr.data-orientation]="orientation()"
          [attr.aria-controls]="partId('item-group')"
          (click)="next()"
        ></button>
      }
    </div>
  `,
  host: {
    "[class]": "hostClass()",
    "[id]": "rootId",
    role: "region",
    "aria-roledescription": "carousel",
    "[attr.aria-label]": "label() ?? null",
    /**
     * The whole `style` attribute rather than `[style.--slide-spacing]`, so the
     * custom properties reach the element the same way in a JIT-compiled spec as
     * in the built package — the arrangement `UioSteps` and `UioProgress` use.
     * `Carousel.css` reads all three, and the item-size expression is zag's own:
     * a hardcoded width here would put the layout and the snap points — which
     * are measured off that layout — out of step.
     */
    "[attr.style]": "rootStyle()",
  },
})
export class UioCarousel extends UioPart {
  readonly scope = "carousel";
  readonly part = "root";

  readonly slides = input<CarouselSlide[]>([]);
  /** Accessible label for the carousel region. */
  readonly label = input<string | undefined>(undefined);
  /** The visible page. Uncontrolled until something binds it. */
  readonly page = model(0);
  readonly pageChange = output<number>();
  /** How many slides are visible at once. */
  readonly slidesPerPage = input(1);
  /** Gap between slides, as a CSS length. */
  readonly spacing = input(DEFAULT_SPACING);
  /**
   * Wraps from the last page back to the first. Left `undefined` on purpose —
   * see the class note; the resolved value is `loop ?? !!autoplay`.
   */
  readonly loop = input<boolean | undefined>(undefined);
  /** `true` for zag's 4s interval, or `{ delay }` in milliseconds. */
  readonly autoplay = input<boolean | { delay: number } | undefined>(undefined);
  override readonly orientation = input<CarouselOrientation>("horizontal");
  readonly size = input<CarouselSize>("md");
  readonly variant = input<CarouselVariant>("default");
  readonly showIndicators = input(true, { transform: booleanAttribute });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly appRef = inject(ApplicationRef);

  protected readonly hostClass = computed(() =>
    carouselStyles({ size: this.size(), variant: this.variant() }),
  );

  protected readonly horizontal = computed(() => this.orientation() === "horizontal");

  /**
   * Slides moved per page.
   *
   * `Math.floor`, because zag's `slidesPerMove` defaults to `"auto"` and resolves
   * to `Math.floor(slidesPerPage)` — a carousel showing 2.5 slides moves two.
   */
  private readonly perMove = computed(() => Math.max(1, Math.floor(this.slidesPerPage())));

  /** Measured snap positions; `null` until the track has been laid out. */
  private readonly snapPoints = signal<number[] | null>(null);

  protected readonly pageCount = computed(
    () =>
      this.snapPoints()?.length ??
      carouselSeedPageCount(this.slides().length, this.slidesPerPage()),
  );

  /**
   * The page actually shown, clamped into range.
   *
   * zag clamps in `connect` rather than in the machine, so a caller who binds
   * `page` past the end sees the last page while keeping their own value. The
   * same split is reproduced, which is what lets an indicator name a page that
   * does not exist without the component rewriting the caller's signal.
   */
  protected readonly activePage = computed(() => {
    const pages = this.pageCount();
    if (pages === 0) return 0;
    return Math.min(Math.max(this.page(), 0), pages - 1);
  });

  private readonly resolvedLoop = computed(() => this.loop() ?? !!this.autoplay());

  protected readonly playing = signal(false);

  protected readonly canScrollPrev = computed(() => this.resolvedLoop() || this.activePage() > 0);
  protected readonly canScrollNext = computed(
    () => this.resolvedLoop() || this.activePage() < this.pageCount() - 1,
  );

  private readonly inViewSet = signal<number[]>([]);
  protected readonly inView = this.inViewSet.asReadonly();

  protected readonly rootStyle = computed(
    () =>
      `--slides-per-page: ${this.slidesPerPage()}; --slide-spacing: ${this.spacing()}; ` +
      "--slide-item-size: calc(100% / var(--slides-per-page) - var(--slide-spacing) * " +
      "(var(--slides-per-page) - 1) / var(--slides-per-page));",
  );

  protected readonly itemGroupStyle = computed(() => {
    const horizontal = this.horizontal();
    return (
      "display: grid; gap: var(--slide-spacing); " +
      `scroll-snap-type: ${horizontal ? "x" : "y"} mandatory; ` +
      `grid-auto-flow: ${horizontal ? "column" : "row"}; ` +
      "scrollbar-width: none; overscroll-behavior-x: contain; " +
      `${horizontal ? "grid-auto-columns" : "grid-auto-rows"}: var(--slide-item-size); ` +
      `${horizontal ? "overflow-x" : "overflow-y"}: auto;`
    );
  });

  protected itemStyle(index: number): string {
    const horizontal = this.horizontal();
    // zag writes `scroll-snap-align` inline on the items a page starts at, and
    // leaves the rest to `.carousel__item`, which sets it on every slide anyway.
    // Reproduced as written rather than tidied: the stylesheet is shared, so the
    // rendered behaviour is identical either way, and matching the inline styles
    // keeps a DOM diff between the two libraries readable.
    const snaps = index % this.perMove() === 0;
    return (
      `flex: 0 0 auto; ${horizontal ? "max-width" : "max-height"}: 100%;` +
      (snaps ? " scroll-snap-align: start;" : "")
    );
  }

  protected readonly flag = stateFlag;

  private readonly machine = nextMachineId();
  protected get rootId(): string {
    return `${this.scope}:${this.machine}`;
  }
  protected partId(part: string): string {
    return `${this.scope}:${this.machine}:${part}`;
  }

  protected asTemplate(content: CarouselSlide["content"]): TemplateRef<unknown> | null {
    return content instanceof TemplateRef ? content : null;
  }

  private observer: IntersectionObserver | null = null;
  private resize: ResizeObserver | null = null;
  private observed: Element[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    super();

    /**
     * Re-measure whenever the shape of the track changes.
     *
     * zag watches the DOM with a `MutationObserver` because it cannot know when
     * its consumer re-renders. Angular can: reading the inputs that decide the
     * layout is the same trigger, without a second observer. `afterRenderEffect`
     * rather than `effect`, because all of this reads geometry and has to run
     * after the view it is measuring exists.
     */
    afterRenderEffect(() => {
      this.slides();
      this.slidesPerPage();
      this.spacing();
      this.orientation();
      untracked(() => {
        this.observeItems();
        this.refresh();
      });
    });

    // The scroll position is the machine's only real output — CSS snapping does
    // the rest — so it is written whenever the resolved page moves.
    afterRenderEffect(() => {
      const page = this.activePage();
      untracked(() => this.scrollToPage(page));
    });

    afterRenderEffect(() => {
      const autoplay = this.autoplay();
      untracked(() => this.playing.set(!!autoplay));
    });

    afterRenderEffect(() => {
      const delay = this.autoplayInterval();
      const playing = this.playing();
      untracked(() => this.runAutoplay(playing, delay));
    });

    this.host.nativeElement.ownerDocument.addEventListener(
      "visibilitychange",
      this.onVisibilityChange,
    );

    inject(DestroyRef).onDestroy(() => {
      this.observer?.disconnect();
      this.resize?.disconnect();
      this.stopAutoplay();
      this.host.nativeElement.ownerDocument.removeEventListener(
        "visibilitychange",
        this.onVisibilityChange,
      );
    });
  }

  private readonly autoplayInterval = computed(() => {
    const autoplay = this.autoplay();
    return typeof autoplay === "object" && autoplay !== null
      ? autoplay.delay
      : DEFAULT_AUTOPLAY_DELAY;
  });

  private itemGroupEl(): HTMLElement | null {
    return this.host.nativeElement.querySelector<HTMLElement>('[data-part="item-group"]');
  }

  private itemEls(): HTMLElement[] {
    const root = this.itemGroupEl();
    return root ? [...root.querySelectorAll<HTMLElement>('[data-part="item"]')] : [];
  }

  private observeItems(): void {
    const root = this.itemGroupEl();
    if (!root || typeof IntersectionObserver === "undefined") return;
    const items = this.itemEls();
    // Re-observing the same elements replays every entry and rewrites the set
    // with the values it already holds, so an unrelated re-render would make
    // `data-inview` flicker.
    const unchanged =
      !!this.observer &&
      items.length === this.observed.length &&
      items.every((item, index) => item === this.observed[index]);
    if (unchanged) return;

    this.observer?.disconnect();
    this.resize?.disconnect();
    this.observed = items;

    this.observer = new IntersectionObserver(
      (entries) => {
        const next = new Set(this.inViewSet());
        for (const entry of entries) {
          const index = Number((entry.target as HTMLElement).dataset["index"] ?? "-1");
          if (Number.isNaN(index) || index === -1) continue;
          if (entry.isIntersecting) next.add(index);
          else next.delete(index);
        }
        this.inViewSet.set([...next].sort((a, b) => a - b));
        flushNow(this.appRef);
      },
      { root, threshold: IN_VIEW_THRESHOLD },
    );
    for (const item of items) this.observer.observe(item);

    if (typeof ResizeObserver === "undefined") return;
    // The snap points are pixel positions, so anything that changes the track's
    // width changes the page count — a window resize as much as a new slide.
    this.resize = new ResizeObserver(() => this.refresh());
    this.resize.observe(root);
    for (const item of items) this.resize.observe(item);
  }

  /** Re-measure the snap points, and drag the track back if it has drifted. */
  private refresh(): void {
    const el = this.itemGroupEl();
    if (!el) return;
    const horizontal = this.horizontal();
    /**
     * A track with no extent has not been laid out, and its geometry is not
     * evidence: every item measures at offset 0, the clamp collapses them onto
     * each other, and the carousel reports one page with both arrows disabled.
     * That is the state a `display: none` ancestor, a detached element and a
     * jsdom test all produce, and in every one of them the seed count is closer
     * to the truth than the measurement.
     */
    if ((horizontal ? el.offsetWidth : el.offsetHeight) === 0) return;
    const groupBox = el.getBoundingClientRect();
    const scrolled = horizontal ? el.scrollLeft : el.scrollTop;
    const offsets = this.itemEls().map((item) => {
      const box = item.getBoundingClientRect();
      return horizontal ? box.left - groupBox.left + scrolled : box.top - groupBox.top + scrolled;
    });
    const maxScroll = horizontal
      ? el.scrollWidth - el.offsetWidth
      : el.scrollHeight - el.offsetHeight;
    const points = carouselSnapPoints(offsets, maxScroll);

    const previous = this.snapPoints();
    const same =
      !!previous &&
      previous.length === points.length &&
      previous.every((value, index) => value === points[index]);
    if (!same) {
      this.snapPoints.set(points);
      flushNow(this.appRef);
    }

    // zag's `scrollToPageIfDrifted`: a re-measure that leaves the track between
    // two pages puts it back on one, instantly, without animating a correction
    // nobody asked for.
    const target = points[this.activePage()];
    if (target == null || Math.abs(scrolled - target) <= DRIFT_THRESHOLD) return;
    el.scrollTo(horizontal ? { left: target } : { top: target });
  }

  private scrollToPage(page: number): void {
    const el = this.itemGroupEl();
    const target = this.snapPoints()?.[page];
    if (!el || target == null) return;
    const horizontal = this.horizontal();
    if (Math.abs((horizontal ? el.scrollLeft : el.scrollTop) - target) <= DRIFT_THRESHOLD) return;
    el.scrollTo(horizontal ? { left: target } : { top: target });
  }

  private runAutoplay(playing: boolean, delay: number): void {
    this.stopAutoplay();
    if (!playing) return;
    this.timer = setInterval(() => {
      // zag's `autoUpdateSlide`: a tick that cannot advance pauses rather than
      // wrapping, so `autoplay` with `loop: false` stops on the last page —
      // which is also what flips `aria-live` back to "polite".
      if (!this.canScrollNext()) {
        this.playing.set(false);
        flushNow(this.appRef);
        return;
      }
      this.advance(1);
      flushNow(this.appRef);
    }, delay);
  }

  private stopAutoplay(): void {
    if (this.timer === null) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  /** A carousel nobody can see does not advance. zag's `trackDocumentVisibility`. */
  private readonly onVisibilityChange = (): void => {
    if (this.host.nativeElement.ownerDocument.visibilityState === "visible") return;
    this.playing.set(false);
  };

  protected next(): void {
    this.advance(1);
    flushNow(this.appRef);
  }

  protected previous(): void {
    this.advance(-1);
    flushNow(this.appRef);
  }

  protected goTo(page: number): void {
    this.commit(page);
    flushNow(this.appRef);
  }

  /**
   * One step in either direction.
   *
   * A *running* carousel wraps whatever `loop` says — zag reads
   * `state.matches("autoplay") || prop("loop")` here — so pausing is the only
   * thing that makes autoplay stop at the end.
   */
  private advance(step: number): void {
    const pages = this.pageCount();
    if (pages === 0) return;
    const loop = this.playing() || this.resolvedLoop();
    const next = this.activePage() + step;
    if (next < 0) this.commit(loop ? pages - 1 : 0);
    else if (next > pages - 1) this.commit(loop ? 0 : pages - 1);
    else this.commit(next);
  }

  private commit(page: number): void {
    if (page === this.page()) return;
    this.page.set(page);
    this.pageChange.emit(page);
  }

  /** The arrow keys move the track while the viewport itself has focus. */
  protected onItemGroupKeydown(event: KeyboardEvent): void {
    const step = this.stepForKey(event.key);
    if (step === null) return;
    event.preventDefault();
    this.advance(step);
    flushNow(this.appRef);
  }

  /**
   * The indicator strip takes Home and End as well as the arrows, and moves
   * focus with the selection — a dot that changes the page without moving focus
   * leaves a keyboard user pressing an arrow that no longer does anything.
   */
  protected onIndicatorKeydown(event: KeyboardEvent): void {
    const pages = this.pageCount();
    const jump = event.key === "Home" ? 0 : event.key === "End" ? pages - 1 : null;
    if (jump !== null) {
      event.preventDefault();
      this.commit(jump);
      this.focusIndicator();
      flushNow(this.appRef);
      return;
    }
    const step = this.stepForKey(event.key);
    if (step === null) return;
    event.preventDefault();
    this.advance(step);
    this.focusIndicator();
    flushNow(this.appRef);
  }

  private stepForKey(key: string): number | null {
    const horizontal = this.horizontal();
    if (key === "ArrowRight") return horizontal ? 1 : null;
    if (key === "ArrowLeft") return horizontal ? -1 : null;
    if (key === "ArrowDown") return horizontal ? null : 1;
    if (key === "ArrowUp") return horizontal ? null : -1;
    return null;
  }

  private focusIndicator(): void {
    queueMicrotask(() => {
      this.host.nativeElement
        .querySelector<HTMLElement>(`[data-part="indicator"][data-index="${this.activePage()}"]`)
        ?.focus({ preventScroll: true });
    });
  }
}
