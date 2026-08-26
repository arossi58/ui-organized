import {
  ApplicationRef,
  DestroyRef,
  Injectable,
  computed,
  inject,
  signal,
  type Signal,
} from "@angular/core";
import { nextMachineId } from "../part-ids.js";
import { flushNow } from "../overlay/flush.js";

/** Zag's three collapsible states. `closing` is open-but-on-its-way-out. */
export type CollapsiblePhase = "open" | "closing" | "closed";

/**
 * The identity and the animation state every part of a collapsible reads.
 *
 * ── Why there is a phase at all ─────────────────────────────────────────────
 *
 * A disclosure that merely toggled `hidden` would need none of this. This one
 * animates, and `Collapsible.css` animates it with **keyframes** rather than a
 * transition — `.collapsible__panel[data-state="open"] { animation:
 * collapsible-down }` — because a transition cannot interpolate to `auto`. So
 * the panel has to stay in the DOM, unhidden, for the whole of its exit
 * animation, and that is a third state between open and closed.
 *
 * The keyframes interpolate to `var(--height)`, which nothing computes for
 * free: it is the panel's own measured height, written inline before the
 * animation starts. `Accordion` left that measurement out because its panel has
 * no transition to feed; here it is the whole mechanism.
 *
 * ── The attribute that is absent on purpose ─────────────────────────────────
 *
 * A **settled open** panel reports no `data-state` at all. Zag computes
 * `skip = !initial && open` and drops the attribute when it holds, so
 * `data-state="open"` exists only while the enter animation is running — which
 * is exactly as long as the rule that reads it needs to apply. A port that
 * emitted a helpful permanent `data-state="open"` would restart the animation on
 * every re-render and differ from all three other libraries at rest.
 *
 * `initial` is that flag: false on mount (so an `open` collapsible shows no
 * animation and no state), true from the moment something toggles it, false
 * again once the animation ends.
 */
@Injectable()
export class UioCollapsibleContext {
  /** Ark builds every id as `<scope>:<machine>:<part>`, the root without a part. */
  private readonly machine = nextMachineId();

  get rootId(): string {
    return `collapsible:${this.machine}`;
  }
  partId(part: string): string {
    return `collapsible:${this.machine}:${part}`;
  }

  /**
   * Replaced wholesale by the root in its constructor. Plain properties rather
   * than signals kept in sync, for the reason `UioFieldContext.bind` gives.
   */
  disabled: Signal<boolean> = signal(false);

  private readonly phase = signal<CollapsiblePhase>("closed");
  private readonly initial = signal(false);

  /** What the root and the trigger report — the target state, not the animation's. */
  readonly open = computed(() => this.phase() === "open");
  /** The panel is in the DOM for the whole of its exit animation. */
  readonly visible = computed(() => this.phase() !== "closed");
  /**
   * What the root and the trigger report.
   *
   * Always one of the two words, unlike the panel's below: only the panel drops
   * `data-state` once it has settled open, and a root that did the same would
   * take `.collapsible[data-state]` rules with it.
   */
  readonly state = computed<"open" | "closed">(() => (this.open() ? "open" : "closed"));
  /** See the class note: `null` is the settled-open case, and it is deliberate. */
  readonly contentState = computed<"open" | "closed" | null>(() => {
    const open = this.open();
    if (open && !this.initial()) return null;
    return open ? "open" : "closed";
  });

  private readonly appRef = inject(ApplicationRef);
  private content: HTMLElement | null = null;
  private stopTracking: (() => void) | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopTracking?.());
  }

  /**
   * Asks the root to change the open state, so a `[(open)]` binding and a click
   * on the trigger take the same path.
   *
   * A callback rather than the trigger injecting the root directly: the root's
   * `open` is a `model()` it owns, and a part reaching in to write another
   * component's model is how two sources of truth start.
   */
  request: (open: boolean) => void = () => {};

  /** Called by the root once, before anything can toggle. */
  bind(state: { disabled: Signal<boolean>; request: (open: boolean) => void }): void {
    this.disabled = state.disabled;
    this.request = state.request;
  }

  /**
   * The panel hands over its own element, because measuring it is the context's
   * job and a component cannot measure a sibling it does not know about.
   */
  bindContent(element: HTMLElement): void {
    this.content = element;
    // The keyframes read these from the first frame. Zag writes `0px` before it
    // has measured anything too, so an animation that somehow starts early
    // collapses rather than interpolating to an undefined length.
    element.style.setProperty("--height", "0px");
    element.style.setProperty("--width", "0px");
  }

  /** The mount state. No transition, so no `initial` and no animation. */
  seed(open: boolean): void {
    this.phase.set(open ? "open" : "closed");
  }

  setOpen(open: boolean): void {
    if (open === this.open()) return;
    this.stopTracking?.();
    this.initial.set(true);
    // Before the phase flips, so `--height` is right at the frame the keyframes
    // start rather than one frame into them. Zag measures inside a `raf` and
    // lives with that; there is no reason to reproduce the lateness.
    this.measure();
    this.phase.set(open ? "open" : "closing");
    this.trackAnimation(() => {
      if (!open) this.phase.set("closed");
      this.initial.set(false);
    });
  }

  /**
   * The panel's laid-out size, read with the two things that would falsify it
   * turned off: it is `hidden` while closed, and it may already be mid-animation.
   * Both are restored in the same synchronous block, so the bindings that own
   * them never see the difference.
   */
  private measure(): void {
    const element = this.content;
    if (!element) return;
    const hidden = element.hidden;
    const animation = element.style.animationName;
    element.style.animationName = "none";
    element.hidden = false;
    const rect = element.getBoundingClientRect();
    element.hidden = hidden;
    element.style.animationName = animation;
    element.style.setProperty("--height", `${rect.height}px`);
    element.style.setProperty("--width", `${rect.width}px`);
  }

  /**
   * Run `done` when the panel's animation finishes — or immediately when there
   * is none.
   *
   * "None" is the case that matters: `Collapsible.css` sets `animation: none`
   * under `prefers-reduced-motion`, and a closing panel that waited for an
   * `animationend` that never comes would stay in the DOM forever. Zag makes the
   * same test, and for the same reason.
   *
   * The read has to happen after the phase has been written to the DOM, since
   * the rule that supplies the animation selects on the attribute the phase
   * produces — hence the flush and the frame.
   */
  private trackAnimation(done: () => void): void {
    const element = this.content;
    if (!element) {
      done();
      return;
    }
    flushNow(this.appRef);
    const frame = requestAnimationFrame(() => {
      const name = getComputedStyle(element).animationName;
      if (!name || name === "none") {
        this.stopTracking = null;
        done();
        flushNow(this.appRef);
        return;
      }
      const onEnd = (event: AnimationEvent) => {
        if (event.target !== element) return;
        this.stopTracking?.();
        done();
        flushNow(this.appRef);
      };
      element.addEventListener("animationend", onEnd);
      this.stopTracking = () => {
        element.removeEventListener("animationend", onEnd);
        this.stopTracking = null;
      };
    });
    this.stopTracking = () => {
      cancelAnimationFrame(frame);
      this.stopTracking = null;
    };
  }
}
