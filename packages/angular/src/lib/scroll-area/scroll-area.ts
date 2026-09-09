import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { UioPart, stateFlag } from "../part.js";
import { nextMachineId } from "../part-ids.js";

export type ScrollAreaOrientation = "vertical" | "horizontal" | "both";
type Axis = "vertical" | "horizontal";

/** Ark never draws a thumb smaller than this, however long the content is. */
const MIN_THUMB_SIZE = 20;
/** How long after the last scroll event the scrollbar stays lit. Zag's number. */
const SCROLL_TIMEOUT = 1000;
/** Zag's tolerance for "the scroll is resting on that edge", in pixels. */
const EDGE_THRESHOLD = 1;

interface Sides {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

/**
 * A scrollable box with a themed scrollbar instead of the platform one.
 *
 * ```html
 * <div uioScrollArea [style.height.px]="200">…</div>
 * ```
 *
 * ── This component is a measurement ─────────────────────────────────────────
 *
 * Everything that makes a scroll area look like one is written *after* the
 * browser has laid it out. `data-overflow-x` / `data-overflow-y` say whether
 * there is anything to scroll, `--thumb-height` sizes the thumb to the
 * proportion of content on screen, and `--corner-width` reserves the square
 * where two scrollbars meet. None of them can exist in static markup, which is
 * why the parity gate waits for `[data-overflow-y]` before it compares anything:
 * a port that rendered the whole anatomy and never measured would produce a
 * scroll area with an invisible scrollbar and pass every static check.
 *
 * There are three things to re-measure on, and all three are needed:
 *
 *  - the content resizing (`ResizeObserver`), which is the common case;
 *  - the viewport becoming visible (`IntersectionObserver`), because an area
 *    inside a closed accordion measures zero and would keep that answer;
 *  - scrolling, which moves the thumb and changes which edge is reached.
 *
 * ── The bit that is not measurement ─────────────────────────────────────────
 *
 * `data-hover` and `data-scrolling` are what `ScrollArea.css` fades the
 * scrollbar in on, and `data-scrolling` is a *decaying* state — it turns itself
 * off a second after the last scroll rather than on any event. A port that only
 * ever set it would leave every scrollbar permanently visible.
 *
 * `data-ownedby` is on every part but the root, naming the root by id. Ark emits
 * it so a scrollbar rendered outside the root's subtree is still findable;
 * nothing in this system reads it, and it is reproduced because the gate
 * compares it.
 */
@Component({
  selector: "div[uioScrollArea]",
  standalone: true,
  template: `
    <!--
      The viewport is the element that scrolls, and a pointer drag is the only
      way to reach content below the fold unless the content itself can take
      focus. Prose and tables depend on this tab stop; links and inputs make it
      redundant but harmless.
    -->
    <div
      class="scroll-area__viewport"
      data-scope="scroll-area"
      data-part="viewport"
      role="presentation"
      tabindex="0"
      style="overflow: auto;"
      [id]="partId('viewport')"
      [attr.data-ownedby]="rootId"
      [attr.data-at-top]="flag(sides().top)"
      [attr.data-at-bottom]="flag(sides().bottom)"
      [attr.data-at-left]="flag(sides().left)"
      [attr.data-at-right]="flag(sides().right)"
      [attr.data-overflow-x]="flag(overflowX())"
      [attr.data-overflow-y]="flag(overflowY())"
      (scroll)="onScroll()"
    >
      <div
        class="scroll-area__content"
        data-scope="scroll-area"
        data-part="content"
        role="presentation"
        style="min-width: fit-content;"
        [id]="partId('content')"
        [attr.data-overflow-x]="flag(overflowX())"
        [attr.data-overflow-y]="flag(overflowY())"
      >
        <ng-content />
      </div>
    </div>
    @if (showVertical()) {
      <div
        class="scroll-area__scrollbar"
        data-scope="scroll-area"
        data-part="scrollbar"
        data-orientation="vertical"
        style="position: absolute; touch-action: none; user-select: none; top: 0px; bottom: var(--corner-height); inset-inline-end: 0px;"
        [attr.data-ownedby]="rootId"
        [attr.data-scrolling]="flag(scrollingY())"
        [attr.data-hover]="flag(hovering())"
        [attr.data-dragging]="flag(dragging())"
        [attr.data-overflow-x]="flag(overflowX())"
        [attr.data-overflow-y]="flag(overflowY())"
      >
        <div
          class="scroll-area__thumb"
          data-scope="scroll-area"
          data-part="thumb"
          data-orientation="vertical"
          style="height: var(--thumb-height);"
          [attr.data-ownedby]="rootId"
          [attr.data-hover]="flag(hovering())"
          [attr.data-dragging]="flag(dragging())"
          (pointerdown)="startDrag($event, 'vertical')"
        ></div>
      </div>
    }
    @if (showHorizontal()) {
      <div
        class="scroll-area__scrollbar"
        data-scope="scroll-area"
        data-part="scrollbar"
        data-orientation="horizontal"
        style="position: absolute; touch-action: none; user-select: none; inset-inline-start: 0px; inset-inline-end: var(--corner-width); bottom: 0px;"
        [attr.data-ownedby]="rootId"
        [attr.data-scrolling]="flag(scrollingX())"
        [attr.data-hover]="flag(hovering())"
        [attr.data-dragging]="flag(dragging())"
        [attr.data-overflow-x]="flag(overflowX())"
        [attr.data-overflow-y]="flag(overflowY())"
      >
        <div
          class="scroll-area__thumb"
          data-scope="scroll-area"
          data-part="thumb"
          data-orientation="horizontal"
          style="width: var(--thumb-width);"
          [attr.data-ownedby]="rootId"
          [attr.data-hover]="flag(hovering())"
          [attr.data-dragging]="flag(dragging())"
          (pointerdown)="startDrag($event, 'horizontal')"
        ></div>
      </div>
    }
    @if (showBoth()) {
      <div
        class="scroll-area__corner"
        data-scope="scroll-area"
        data-part="corner"
        style="position: absolute; bottom: 0px; inset-inline-end: 0px; width: var(--corner-width); height: var(--corner-height);"
        [attr.data-ownedby]="rootId"
        [attr.data-hover]="flag(hovering())"
        [attr.data-state]="cornerHidden() ? 'hidden' : 'visible'"
        [attr.data-overflow-x]="flag(overflowX())"
        [attr.data-overflow-y]="flag(overflowY())"
      ></div>
    }
  `,
  host: {
    class: "scroll-area",
    role: "presentation",
    "[id]": "rootId",
    "[attr.data-overflow-x]": "flag(overflowX())",
    "[attr.data-overflow-y]": "flag(overflowY())",
    "(pointerenter)": "hovering.set(true)",
    "(pointerleave)": "hovering.set(false)",
  },
})
export class UioScrollArea extends UioPart implements AfterViewInit, OnDestroy {
  readonly scope = "scroll-area";
  readonly part = "root";

  /**
   * Which scrollbars to draw, under a property name that is not `orientation`.
   *
   * `UioPart.orientation` is *this element's own* orientation, and Ark puts none
   * on a scroll area's root — only on its scrollbars and thumbs, one each. The
   * same `xInput`-aliased-to-`x` split `UioSwitch` and `UioTabs` use, and for
   * the same reason: the two meanings collide on one name.
   */
  protected readonly orientationInput = input<ScrollAreaOrientation>("vertical", {
    alias: "orientation",
  });

  private readonly machine = nextMachineId();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly overflowX = signal(false);
  protected readonly overflowY = signal(false);
  protected readonly cornerHidden = signal(true);
  protected readonly sides = signal<Sides>({ top: false, right: false, bottom: false, left: false });
  protected readonly hovering = signal(false);
  protected readonly dragging = signal(false);
  protected readonly scrollingX = signal(false);
  protected readonly scrollingY = signal(false);

  protected readonly flag = stateFlag;
  protected readonly showVertical = computed(
    () => this.orientationInput() === "vertical" || this.orientationInput() === "both",
  );
  protected readonly showHorizontal = computed(
    () => this.orientationInput() === "horizontal" || this.orientationInput() === "both",
  );
  protected readonly showBoth = computed(() => this.orientationInput() === "both");

  private resize?: ResizeObserver;
  private intersection?: IntersectionObserver;
  private scrollXTimer?: ReturnType<typeof setTimeout>;
  private scrollYTimer?: ReturnType<typeof setTimeout>;
  private lastScroll = { x: 0, y: 0 };
  private drag?: { axis: Axis; start: number; from: number };

  get rootId(): string {
    return `scroll-area-${this.machine}`;
  }
  /** Zag's scroll-area ids are `scroll-area-<id>:<part>` — a dash, then a colon. */
  protected partId(part: string): string {
    return `scroll-area-${this.machine}:${part}`;
  }

  ngAfterViewInit(): void {
    const view = this.host.nativeElement.ownerDocument.defaultView;
    const viewport = this.viewport();
    if (!view || !viewport) return;

    // Guarded: jsdom implements neither observer, and a spec that only asserts
    // the rendered anatomy must not be the thing that throws.
    if (typeof view.ResizeObserver === "function") {
      this.resize = new view.ResizeObserver(() => this.measure());
      this.resize.observe(viewport);
      this.resize.observe(this.host.nativeElement);
    }
    if (typeof view.IntersectionObserver === "function") {
      this.intersection = new view.IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.intersectionRatio > 0)) this.measure();
      });
      this.intersection.observe(viewport);
    }
    this.measure();
  }

  ngOnDestroy(): void {
    this.resize?.disconnect();
    this.intersection?.disconnect();
    clearTimeout(this.scrollXTimer);
    clearTimeout(this.scrollYTimer);
    this.stopDrag();
  }

  protected onScroll(): void {
    const viewport = this.viewport();
    if (!viewport) return;
    const moved = {
      x: viewport.scrollLeft - this.lastScroll.x,
      y: viewport.scrollTop - this.lastScroll.y,
    };
    this.lastScroll = { x: viewport.scrollLeft, y: viewport.scrollTop };
    this.measure();

    // Per axis, and decaying rather than sticky: the scrollbar fades out again a
    // second after the last scroll, which is what `[data-scrolling]` is for.
    if (moved.y !== 0) {
      this.scrollingY.set(true);
      clearTimeout(this.scrollYTimer);
      this.scrollYTimer = setTimeout(() => this.scrollingY.set(false), SCROLL_TIMEOUT);
    }
    if (moved.x !== 0) {
      this.scrollingX.set(true);
      clearTimeout(this.scrollXTimer);
      this.scrollXTimer = setTimeout(() => this.scrollingX.set(false), SCROLL_TIMEOUT);
    }
  }

  /**
   * Everything the browser has to be asked rather than told.
   *
   * The whole viewport box is read once, up front, so the thumb is sized from
   * the same layout the overflow flags came from — measuring again after writing
   * a custom property would read the frame in between.
   */
  private measure(): void {
    const viewport = this.viewport();
    const root = this.host.nativeElement;
    if (!viewport) return;

    const { clientHeight, clientWidth, scrollHeight, scrollWidth, scrollTop, scrollLeft } = viewport;
    // Nothing has been laid out yet; a zero here would report "no overflow" for
    // content that has simply not been measured.
    if (scrollHeight === 0 || scrollWidth === 0) return;

    const yHidden = clientHeight >= scrollHeight;
    const xHidden = clientWidth >= scrollWidth;
    this.overflowY.set(!yHidden);
    this.overflowX.set(!xHidden);
    this.cornerHidden.set(yHidden || xHidden);
    this.sides.set(sidesOf(viewport));

    const scrollbarY = this.find('[data-part="scrollbar"][data-orientation="vertical"]');
    const scrollbarX = this.find('[data-part="scrollbar"][data-orientation="horizontal"]');
    const thumbY = this.find('[data-part="thumb"][data-orientation="vertical"]');
    const thumbX = this.find('[data-part="thumb"][data-orientation="horizontal"]');

    const roomY = (yHidden ? 0 : clientHeight) - edges(scrollbarY, "y", "padding") - edges(thumbY, "y", "margin");
    const roomX = (xHidden ? 0 : clientWidth) - edges(scrollbarX, "x", "padding") - edges(thumbX, "x", "margin");
    const height = Math.max(
      MIN_THUMB_SIZE,
      Math.min(scrollbarY?.offsetHeight ?? roomY, roomY) * (clientHeight / scrollHeight),
    );
    const width = Math.max(
      MIN_THUMB_SIZE,
      Math.min(scrollbarX?.offsetWidth ?? roomX, roomX) * (clientWidth / scrollWidth),
    );
    root.style.setProperty("--thumb-height", `${height}px`);
    root.style.setProperty("--thumb-width", `${width}px`);

    // The square where the two scrollbars meet, and zero unless both are drawn.
    const noCorner = yHidden || xHidden;
    root.style.setProperty("--corner-width", noCorner ? "0px" : `${scrollbarY?.offsetWidth ?? 0}px`);
    root.style.setProperty(
      "--corner-height",
      noCorner ? "0px" : `${scrollbarX?.offsetHeight ?? 0}px`,
    );

    if (scrollbarY && thumbY) {
      const travel = scrollbarY.offsetHeight - height - edges(scrollbarY, "y", "padding") - edges(thumbY, "y", "margin");
      const ratio = scrollTop / Math.max(1, scrollHeight - clientHeight);
      thumbY.style.transform = `translate3d(0px, ${clamp(ratio * travel, 0, travel)}px, 0px)`;
    }
    if (scrollbarX && thumbX) {
      const travel = scrollbarX.offsetWidth - width - edges(scrollbarX, "x", "padding") - edges(thumbX, "x", "margin");
      const ratio = scrollLeft / Math.max(1, scrollWidth - clientWidth);
      thumbX.style.transform = `translate3d(${clamp(ratio * travel, 0, travel)}px, 0px, 0px)`;
    }

    // Four properties the shared stylesheet can hang an overscroll shadow on.
    // Zero on an axis that does not scroll, rather than absent, so a rule can
    // read them unconditionally.
    const maxTop = Math.max(0, scrollHeight - clientHeight);
    const maxLeft = Math.max(0, scrollWidth - clientWidth);
    const fromTop = yHidden ? 0 : clamp(scrollTop, 0, maxTop);
    const fromLeft = xHidden ? 0 : clamp(scrollLeft, 0, maxLeft);
    viewport.style.setProperty("--scroll-area-overflow-y-start", `${fromTop}px`);
    viewport.style.setProperty("--scroll-area-overflow-y-end", `${yHidden ? 0 : maxTop - fromTop}px`);
    viewport.style.setProperty("--scroll-area-overflow-x-start", `${fromLeft}px`);
    viewport.style.setProperty(
      "--scroll-area-overflow-x-end",
      `${xHidden ? 0 : maxLeft - fromLeft}px`,
    );
  }

  protected startDrag(event: PointerEvent, axis: Axis): void {
    const viewport = this.viewport();
    if (!viewport || event.button !== 0) return;
    event.preventDefault();
    this.dragging.set(true);
    this.drag = {
      axis,
      start: axis === "vertical" ? event.clientY : event.clientX,
      from: axis === "vertical" ? viewport.scrollTop : viewport.scrollLeft,
    };
    const view = viewport.ownerDocument.defaultView;
    view?.addEventListener("pointermove", this.onDragMove);
    view?.addEventListener("pointerup", this.onDragEnd);
  }

  /**
   * Arrow properties, not methods.
   *
   * Each is handed to `addEventListener` and taken back off it, so both calls
   * have to name the same function — a `.bind(this)` at each site produces a new
   * one and leaks a listener per drag.
   */
  private readonly onDragMove = (event: PointerEvent): void => {
    const viewport = this.viewport();
    const drag = this.drag;
    if (!viewport || !drag) return;
    const vertical = drag.axis === "vertical";
    const scrollbar = this.find(`[data-part="scrollbar"][data-orientation="${drag.axis}"]`);
    if (!scrollbar) return;
    // The thumb travels the track; the content travels the viewport. The ratio
    // between the two is what turns pixels of drag into pixels of scroll.
    const track = vertical ? scrollbar.offsetHeight : scrollbar.offsetWidth;
    const content = vertical ? viewport.scrollHeight : viewport.scrollWidth;
    const visible = vertical ? viewport.clientHeight : viewport.clientWidth;
    const moved = (vertical ? event.clientY : event.clientX) - drag.start;
    const next = clamp(drag.from + (moved / Math.max(1, track)) * content, 0, content - visible);
    if (vertical) viewport.scrollTop = next;
    else viewport.scrollLeft = next;
  };

  private readonly onDragEnd = (): void => this.stopDrag();

  private stopDrag(): void {
    if (!this.drag) return;
    this.drag = undefined;
    this.dragging.set(false);
    const view = this.host.nativeElement.ownerDocument.defaultView;
    view?.removeEventListener("pointermove", this.onDragMove);
    view?.removeEventListener("pointerup", this.onDragEnd);
  }

  private viewport(): HTMLElement | null {
    return this.find('[data-part="viewport"]');
  }
  private find(selector: string): HTMLElement | null {
    return this.host.nativeElement.querySelector<HTMLElement>(selector);
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Which edges the scroll rests against — false on an axis that cannot scroll. */
function sidesOf(viewport: HTMLElement): Sides {
  const maxTop = viewport.scrollHeight - viewport.clientHeight;
  const maxLeft = viewport.scrollWidth - viewport.clientWidth;
  const canScrollY = maxTop > EDGE_THRESHOLD;
  const canScrollX = maxLeft > EDGE_THRESHOLD;
  return {
    top: canScrollY && viewport.scrollTop <= EDGE_THRESHOLD,
    bottom: canScrollY && viewport.scrollTop >= maxTop - EDGE_THRESHOLD,
    left: canScrollX && viewport.scrollLeft <= EDGE_THRESHOLD,
    right: canScrollX && viewport.scrollLeft >= maxLeft - EDGE_THRESHOLD,
  };
}

/** The two `padding` or `margin` edges on one axis, in pixels. */
function edges(element: HTMLElement | null, axis: "x" | "y", box: "padding" | "margin"): number {
  const view = element?.ownerDocument.defaultView;
  if (!element || !view) return 0;
  const style = view.getComputedStyle(element);
  const sides = axis === "x" ? ["left", "right"] : ["top", "bottom"];
  return sides.reduce(
    (total, side) => total + (Number.parseFloat(style.getPropertyValue(`${box}-${side}`)) || 0),
    0,
  );
}
