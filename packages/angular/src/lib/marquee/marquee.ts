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
import { marqueeStyles } from "@ui-organized/core";
import { UioPart, stateFlag } from "../part.js";
import { nextMachineId } from "../part-ids.js";
import { flushNow } from "../overlay/flush.js";

export type MarqueeOrientation = "horizontal" | "vertical";

export interface MarqueeItem {
  /** Unique across the marquee. */
  id: string;
  /** A string, or a template for anything richer — see `CarouselSlide.content`. */
  content?: string | TemplateRef<unknown>;
}

/** Authored default gap, matching the React component's. */
const DEFAULT_SPACING = "var(--spacing-space-04)";

/**
 * The duration the machine uses before it has measured anything, in seconds:
 * `2000 / speed`. zag's `duration` bindable default, and what the first frame
 * animates at.
 */
const UNMEASURED_TRAVEL = 2000;

/** zag clamps `speed` off zero before dividing by it. */
const MIN_SPEED = 0.001;

/**
 * How many copies of the content fill the track.
 *
 * ── This is measured in every library, and has to be ────────────────────────
 *
 * `autoFill` promises there is never a gap, which means enough copies of the
 * content to cover the viewport — and how many that is depends on how wide the
 * content turned out to be, which depends on the caller's items, the font, and
 * the `spacing` gap they chose. zag measures `root.clientWidth` and
 * `content[0].clientWidth` with a `ResizeObserver` and divides. There is no
 * arithmetic that gets there from the props.
 *
 * It is not a detail the gate can miss, either: each copy is a `content` part
 * carrying `data-index`, `data-clone`, `role="presentation"` and
 * `aria-hidden="true"`, so a library that guessed the count wrong renders a
 * different number of elements from React and fails on the first case.
 *
 * @param rootSize    The viewport's extent along the scroll axis.
 * @param contentSize The first copy's extent along the same axis.
 */
export function marqueeMultiplier(
  rootSize: number,
  contentSize: number,
  autoFill: boolean,
): number {
  if (!autoFill) return 1;
  if (contentSize === 0) return 1;
  return contentSize < rootSize ? Math.ceil(rootSize / contentSize) : 1;
}

/**
 * Seconds for one pass, from the measured geometry and the caller's `speed`.
 *
 * zag's `calculateDuration`. Without `autoFill` a pass covers whichever is
 * longer — the content or the viewport — so short content still crosses the
 * whole track; with it, the copies are what travel, so the distance is the
 * content times the multiplier.
 */
export function marqueeDuration(options: {
  rootSize: number;
  contentSize: number;
  speed: number;
  multiplier: number;
  autoFill: boolean;
}): number {
  const { rootSize, contentSize, multiplier, autoFill } = options;
  const speed = Math.max(MIN_SPEED, options.speed);
  if (autoFill) return (contentSize * multiplier) / speed;
  return contentSize < rootSize ? rootSize / speed : contentSize / speed;
}

/**
 * Which way the content travels, as the end offset the keyframes animate to.
 *
 * zag's `getMarqueeTranslate`. `dir` is a parameter rather than a constant
 * because the sign flips with it for the inline sides and not for the block
 * ones — the library is `ltr` throughout today, and hardcoding that here would
 * put the bug somewhere nobody would look for it.
 */
export function marqueeTranslate(
  side: "start" | "end" | "top" | "bottom",
  dir: "ltr" | "rtl" = "ltr",
): string {
  if (side === "top") return "-100%";
  if (side === "bottom") return "100%";
  const negative = (side === "start" && dir === "ltr") || (side === "end" && dir === "rtl");
  return negative ? "-100%" : "100%";
}

/**
 * Continuously scrolling content.
 *
 * ```html
 * <div uioMarquee [items]="items"></div>
 * ```
 *
 * ── The animation is the stylesheet's, and so is reduced motion ─────────────
 *
 * This is the one component whose animation is authored in
 * `@ui-organized/core` rather than driven from here: the machine measures the
 * content, derives the timing, and publishes duration, delay, loop count,
 * translate and spacing as custom properties, and `Marquee.css` owns the
 * `@keyframes`.
 *
 * That is also where `prefers-reduced-motion` is handled — the stylesheet drops
 * the animation entirely under the media query, because continuous motion with
 * no way to stop it is a WCAG 2.2.2 failure. Forcing `paused` here instead
 * would make the component disagree with its own stylesheet, render a
 * `data-paused` the other three libraries do not, and fail the parity gate on a
 * machine with the preference set.
 *
 * ── `reverse` only names the direction ──────────────────────────────────────
 *
 * The public prop reaches the DOM as `data-reverse` on every content copy and
 * changes nothing else, because the direction of travel comes from `side`,
 * which is chosen from `orientation` alone. That is what the other three
 * libraries do, and reproducing it is deliberate: making `reverse` flip `side`
 * here would leave Angular scrolling the other way from React for the same
 * props.
 */
@Component({
  selector: "div[uioMarquee]",
  standalone: true,
  exportAs: "uioMarquee",
  imports: [NgTemplateOutlet],
  template: `
    @if (showEdges()) {
      <!--
        Both edges are named "start" and "end" whatever the orientation. zag's
        edge part also understands "top" and "bottom"; the component never asks
        for them, and "Marquee.css" selects on [data-side="end"] under
        .marquee--vertical to turn the fade round instead.
      -->
      <div
        class="marquee__edge"
        data-scope="marquee"
        data-part="edge"
        data-side="start"
        [attr.data-orientation]="orientation()"
        [attr.style]="edgeStyle('start')"
      ></div>
      <div
        class="marquee__edge"
        data-scope="marquee"
        data-part="edge"
        data-side="end"
        [attr.data-orientation]="orientation()"
        [attr.style]="edgeStyle('end')"
      ></div>
    }

    <div
      class="marquee__viewport"
      data-scope="marquee"
      data-part="viewport"
      [id]="partId('viewport')"
      [attr.data-orientation]="orientation()"
      [attr.data-side]="side()"
      [attr.style]="viewportStyle()"
    >
      @for (copy of copies(); track copy) {
        <div
          class="marquee__content"
          data-scope="marquee"
          data-part="content"
          [id]="partId('content:' + copy)"
          [attr.data-index]="copy"
          [attr.data-orientation]="orientation()"
          [attr.data-side]="side()"
          [attr.data-reverse]="flag(reverse())"
          [attr.data-clone]="flag(copy > 0)"
          [attr.role]="copy > 0 ? 'presentation' : null"
          [attr.aria-hidden]="copy > 0 ? 'true' : null"
          [attr.style]="contentStyle()"
        >
          @for (item of items(); track item.id) {
            <div
              class="marquee__item"
              data-scope="marquee"
              data-part="item"
              [attr.style]="itemStyle()"
            >
              @if (asTemplate(item.content); as template) {
                <ng-container [ngTemplateOutlet]="template" />
              } @else {
                {{ item.content }}
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  host: {
    "[class]": "hostClass()",
    "[id]": "rootId",
    role: "region",
    "aria-roledescription": "marquee",
    "aria-live": "off",
    "aria-label": "Marquee content",
    "[attr.data-paused]": "flag(paused())",
    "[attr.style]": "rootStyle()",
    "(mouseenter)": "onInteraction(true)",
    "(mouseleave)": "onInteraction(false)",
    "(focusin)": "onFocusIn($event)",
    "(focusout)": "onFocusOut($event)",
  },
})
export class UioMarquee extends UioPart {
  readonly scope = "marquee";
  readonly part = "root";

  readonly items = input<MarqueeItem[]>([]);
  /** Pixels travelled per second. */
  readonly speed = input(50);
  /** Seconds before the first pass. */
  readonly delay = input(0);
  override readonly orientation = input<MarqueeOrientation>("horizontal");
  /** Names the direction on every content copy. See the class note. */
  readonly reverse = input(false, { transform: booleanAttribute });
  /** Gap between items, as a CSS length. */
  readonly spacing = input(DEFAULT_SPACING);
  /** Repeats the content until the track is full. */
  readonly autoFill = input(true, { transform: booleanAttribute });
  /** Pauses while hovered or focused. */
  readonly pauseOnInteraction = input(false, { transform: booleanAttribute });
  /** Whether it is stopped. Uncontrolled until something binds it. */
  readonly paused = model(false);
  readonly pausedChange = output<boolean>();
  /** Passes before stopping. 0 scrolls forever. */
  readonly loopCount = input(0);
  /** Fades the leading and trailing edges into the background. */
  readonly showEdges = input(true, { transform: booleanAttribute });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly appRef = inject(ApplicationRef);

  protected readonly hostClass = computed(() =>
    marqueeStyles({ orientation: this.orientation() }),
  );

  override readonly state = computed(() => (this.paused() ? "paused" : "idle"));

  private readonly vertical = computed(() => this.orientation() === "vertical");

  /**
   * The machine has no `orientation`; it has `side`, the direction of travel,
   * which implies the axis. The component keeps the library's spelling and
   * picks the default side for each axis here — the same mapping the other
   * three libraries make.
   */
  protected readonly side = computed<"start" | "top">(() =>
    this.vertical() ? "top" : "start",
  );

  /**
   * The last measurement — a plain field, and that is the whole point.
   *
   * ── Why the count does not chase itself ─────────────────────────────────
   *
   * zag keeps this in a *ref*, which does not notify: the `ResizeObserver`
   * writes to it and nothing re-renders. The multiplier is a `computed` that
   * reads it, so it is re-derived on whatever render happens next, from
   * whichever measurement was most recent.
   *
   * That is not a detail. A **vertical** marquee has no height of its own — it
   * is as tall as the copies inside it — so a measurement that triggered a
   * render would measure a taller root, ask for more copies, and grow again.
   * With this in a signal, three items became fourteen hundred copies before
   * the browser gave up. React renders four, from the single measurement taken
   * while the first two copies were on screen (`root 284px / content 134px`
   * → multiplier 3 → four copies, and `--marquee-duration: 8.04s` computed from
   * the same numbers). This field, and the methods below that read it without
   * subscribing to it, are what reproduce that.
   */
  private dimensionsRef: { rootSize: number; contentSize: number } | null = null;

  /**
   * Bumped exactly once, when the first measurement lands.
   *
   * zag's `initialDurationSet`: the first measurement sets `duration`, which is
   * context rather than a ref and so *does* render. Every later measurement is
   * silent. Reading this signal in the methods below is what gives them the same
   * single, deliberate re-render.
   */
  private readonly measured = signal(0);

  private multiplier(): number {
    this.measured();
    const dimensions = this.dimensionsRef;
    if (!dimensions) return 1;
    return marqueeMultiplier(dimensions.rootSize, dimensions.contentSize, this.autoFill());
  }

  /**
   * One entry per rendered copy — the original, then the clones.
   *
   * A method rather than a `computed`, so that it is re-evaluated with every
   * change-detection pass over this view, exactly as zag's `computed` is
   * re-derived with every React render. A `computed` would memoise on a field
   * that never notifies and freeze the count at one copy.
   */
  protected copies(): number[] {
    return Array.from({ length: this.multiplier() + 1 }, (_, index) => index);
  }

  private duration(): number {
    this.measured();
    const dimensions = this.dimensionsRef;
    // Before anything has a width the machine animates at `2000 / speed`, and
    // replaces it the moment the observer fires. Reproduced rather than left at
    // zero, so the first frame is a slow pass rather than an instant one.
    if (!dimensions) return UNMEASURED_TRAVEL / Math.max(MIN_SPEED, this.speed());
    return marqueeDuration({
      rootSize: dimensions.rootSize,
      contentSize: dimensions.contentSize,
      speed: this.speed(),
      multiplier: this.multiplier(),
      autoFill: this.autoFill(),
    });
  }

  protected rootStyle(): string {
    const vertical = this.vertical();
    const loops = this.loopCount();
    return (
      `display: flex; flex-direction: ${vertical ? "column" : "row"}; position: relative; ` +
      // Clipping is what makes the track a window rather than a long row, and
      // the containment keeps an animation that never stops from invalidating
      // the whole page's layout.
      "overflow: hidden; contain: layout style paint; " +
      `--marquee-duration: ${this.duration()}s; ` +
      `--marquee-spacing: ${this.spacing()}; ` +
      `--marquee-delay: ${this.delay()}s; ` +
      `--marquee-loop-count: ${loops === 0 ? "infinite" : loops}; ` +
      `--marquee-translate: ${marqueeTranslate(this.side())};`
    );
  }

  protected readonly viewportStyle = computed(() => {
    const vertical = this.vertical();
    return (
      `display: flex; ${vertical ? "height" : "width"}: 100%; ` +
      `flex-direction: ${vertical ? "column" : "row"};`
    );
  });

  protected readonly contentStyle = computed(() => {
    const vertical = this.vertical();
    return (
      `display: flex; flex-direction: ${vertical ? "column" : "row"}; flex-shrink: 0; ` +
      "backface-visibility: hidden; -webkit-backface-visibility: hidden; " +
      `will-change: ${this.paused() ? "auto" : "transform"}; transform: translateZ(0); ` +
      `${vertical ? "min-width" : "min-height"}: auto; contain: paint;`
    );
  });

  protected readonly itemStyle = computed(
    () =>
      `${this.vertical() ? "margin-block" : "margin-inline"}: ` +
      "calc(var(--marquee-spacing) / 2);",
  );

  protected edgeStyle(side: "start" | "end"): string {
    const base = "pointer-events: none; position: absolute; ";
    // zag's `getEdgePositionStyles`, for the two sides the component asks for.
    return side === "start"
      ? `${base}top: 0px; inset-inline-start: 0px; height: 100%;`
      : `${base}top: 0px; inset-inline-end: 0px; height: 100%;`;
  }

  protected readonly flag = stateFlag;

  private readonly machine = nextMachineId();
  protected get rootId(): string {
    return `${this.scope}:${this.machine}`;
  }
  protected partId(part: string): string {
    return `${this.scope}:${this.machine}:${part}`;
  }

  protected asTemplate(content: MarqueeItem["content"]): TemplateRef<unknown> | null {
    return content instanceof TemplateRef ? content : null;
  }

  private resize: ResizeObserver | null = null;
  private observed: Element[] = [];

  constructor() {
    super();

    afterRenderEffect(() => {
      // Anything that changes how wide a copy is changes how many are needed.
      this.items();
      this.spacing();
      this.orientation();
      this.autoFill();
      untracked(() => this.measure());
    });

    inject(DestroyRef).onDestroy(() => this.resize?.disconnect());
  }

  private contentEl(): HTMLElement | null {
    return this.host.nativeElement.querySelector<HTMLElement>('[data-part="content"]');
  }

  /**
   * Measure the track, and keep measuring it.
   *
   * zag observes the root and the first copy with a `ResizeObserver`, and so
   * does this: the count has to survive a window resize and a webfont landing
   * after the first paint, neither of which re-renders anything.
   */
  private measure(): void {
    const root = this.host.nativeElement;
    const content = this.contentEl();
    if (!content) return;

    const vertical = this.vertical();
    const rootSize = vertical ? root.clientHeight : root.clientWidth;
    const contentSize = vertical ? content.clientHeight : content.clientWidth;
    // A track with no extent has not been laid out; measuring it would report a
    // single copy and never correct itself, because nothing re-renders.
    if (rootSize > 0 && contentSize > 0) {
      this.dimensionsRef = { rootSize, contentSize };
      // Only the first measurement renders — see `measured`. Every later one is
      // read by whatever render happens next, which is what keeps a vertical
      // marquee from growing itself a copy at a time.
      if (this.measured() === 0) {
        this.measured.set(1);
        flushNow(this.appRef);
      }
    }

    if (typeof ResizeObserver === "undefined") return;
    const watched = [root, content];
    const unchanged =
      !!this.resize &&
      watched.length === this.observed.length &&
      watched.every((el, index) => el === this.observed[index]);
    if (unchanged) return;
    this.resize?.disconnect();
    this.observed = watched;
    this.resize = new ResizeObserver(() => this.measure());
    for (const el of watched) this.resize.observe(el);
  }

  protected onInteraction(entering: boolean): void {
    if (!this.pauseOnInteraction()) return;
    this.setPaused(entering);
  }

  /**
   * `focus` does not bubble and `focusin` does, which is why this is not a
   * `focus` listener. zag reaches the same place with React's `onFocusCapture`;
   * both of them ignore the root taking focus itself, so tabbing *to* the region
   * does not stop it — only reaching something inside it does.
   */
  protected onFocusIn(event: FocusEvent): void {
    if (!this.pauseOnInteraction()) return;
    if (event.target === this.host.nativeElement) return;
    this.setPaused(true);
  }

  protected onFocusOut(event: FocusEvent): void {
    if (!this.pauseOnInteraction()) return;
    const next = event.relatedTarget;
    // Moving between two items inside the marquee is not leaving it.
    if (next instanceof Node && this.host.nativeElement.contains(next)) return;
    this.setPaused(false);
  }

  /** Stop or start the marquee from outside it. */
  pause(): void {
    this.setPaused(true);
  }

  resume(): void {
    this.setPaused(false);
  }

  togglePause(): void {
    this.setPaused(!this.paused());
  }

  private setPaused(paused: boolean): void {
    if (paused === this.paused()) return;
    this.paused.set(paused);
    this.pausedChange.emit(paused);
    flushNow(this.appRef);
  }
}
