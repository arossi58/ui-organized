import {
  drawerDragOffset,
  drawerDragStarted,
  drawerReleaseVelocity,
  drawerShouldDismiss,
  drawerSwipeProgress,
  drawerSwipeStrength,
  type DrawerSwipeSample,
} from "@ui-organized/core";

export interface DrawerSwipeOptions {
  content: () => HTMLElement | null;
  backdrop: () => HTMLElement | null;
  /** Whether the drawer can be dragged now: open, and not on its way out. */
  active: () => boolean;
  /** Whether a press on the content, not only on the grabber, can drag. */
  contentDraggable: () => boolean;
  /** A release past the threshold. Closes the drawer, or asks to; returns whether it closed. */
  dismiss: (strength: number) => boolean;
}

/** A press here is typing or choosing, never a drag. zag's exemptions. */
const EXEMPT =
  'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [data-no-drag]';

/** Samples older than this are dropped as the drag goes; velocity reads the last 100ms. */
const SAMPLE_KEEP_MS = 300;

/** zag's DRAG_START_THRESHOLD: a press on the grabber is a drag after this much movement. */
const GRABBER_START_PX = 0.3;

/**
 * Angular's swipe-to-dismiss: what zag's drawer machine does for the other
 * three libraries, with its arithmetic shared through core's drawerSwipe.ts so
 * a drag ends in the same place in all four.
 *
 * A press on the grabber drags on its first movement. A press on the content waits until
 * the pointer has clearly moved down or up, so a click, a text selection or a
 * sideways scroll stays one; and not at all from a control that takes typing,
 * or from content scrolled away from its top, where dragging down is scrolling
 * back up first.
 *
 * It writes straight to the DOM rather than through bindings, as zag does:
 * `--drawer-translate-y` and the inline transform that reads it, with the
 * transition off while the pointer holds the panel; `--drawer-swipe-progress`
 * on the backdrop; `--drawer-swipe-strength` on a release; and the
 * `data-swiping`/`data-dragging` marks. A pointermove never runs change
 * detection.
 */
export class DrawerSwipe {
  private pointerId: number | null = null;
  private start: { x: number; y: number } | null = null;
  private dragging = false;
  private fromGrabber = false;
  private offset = 0;
  private samples: DrawerSwipeSample[] = [];
  private stopListening: (() => void) | null = null;
  private detachContent: (() => void) | null = null;
  private restoreSelection: (() => void) | null = null;

  constructor(
    private readonly doc: Document,
    private readonly options: DrawerSwipeOptions,
  ) {}

  /** Listen for presses on the content. */
  attach(content: HTMLElement): void {
    this.detach();
    const onDown = (event: PointerEvent) => this.onPointerDown(event, content);
    content.addEventListener("pointerdown", onDown);
    this.detachContent = () => content.removeEventListener("pointerdown", onDown);
  }

  detach(): void {
    this.detachContent?.();
    this.detachContent = null;
    this.endGesture();
  }

  /** Clear everything a drag wrote, so the next open starts at rest. */
  reset(): void {
    for (const el of [this.options.content(), this.options.backdrop()]) {
      if (!el) continue;
      for (const name of [
        "--drawer-translate-y",
        "--drawer-swipe-progress",
        "--drawer-swipe-strength",
        "transform",
        "transition-duration",
      ]) {
        el.style.removeProperty(name);
      }
      el.removeAttribute("data-swiping");
      el.removeAttribute("data-dragging");
    }
    this.offset = 0;
  }

  private onPointerDown(event: PointerEvent, content: HTMLElement): void {
    if (!this.options.active() || this.pointerId !== null) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const target = event.target instanceof Element ? event.target : null;
    const onGrabber = !!target?.closest('[data-part="grabber"]');
    if (!onGrabber) {
      if (!this.options.contentDraggable()) return;
      if (target?.closest(EXEMPT)) return;
      if (scrolledFromTop(target, content)) return;
    }

    this.pointerId = event.pointerId;
    this.fromGrabber = onGrabber;
    this.start = { x: event.clientX, y: event.clientY };
    // Sampled from the first movement, not the press, as zag's session is: the
    // whole-gesture speed of a drag that paused before letting go is measured
    // over the movement alone.
    this.samples = [];

    const move = (e: PointerEvent) => this.onPointerMove(e, content);
    const up = (e: PointerEvent) => this.onPointerUp(e, content);
    const cancel = (e: PointerEvent) => {
      if (e.pointerId !== this.pointerId) return;
      if (this.dragging) this.snapBack(content);
      this.endGesture();
    };
    this.doc.addEventListener("pointermove", move);
    this.doc.addEventListener("pointerup", up);
    this.doc.addEventListener("pointercancel", cancel);
    this.stopListening = () => {
      this.doc.removeEventListener("pointermove", move);
      this.doc.removeEventListener("pointerup", up);
      this.doc.removeEventListener("pointercancel", cancel);
    };
  }

  private beginDrag(content: HTMLElement): void {
    this.dragging = true;
    const backdrop = this.options.backdrop();
    content.setAttribute("data-swiping", "");
    content.setAttribute("data-dragging", "");
    backdrop?.setAttribute("data-swiping", "");
    content.style.transitionDuration = "0s";
    content.style.transform = "translate3d(0, var(--drawer-translate-y, 0px), 0)";
    // A drag is not a text selection, as zag's `disableTextSelection` has it.
    const body = this.doc.body;
    const previous = body.style.userSelect;
    body.style.userSelect = "none";
    this.restoreSelection = () => {
      body.style.userSelect = previous;
    };
  }

  private onPointerMove(event: PointerEvent, content: HTMLElement): void {
    if (event.pointerId !== this.pointerId || !this.start) return;
    if (!this.dragging) {
      const dx = event.clientX - this.start.x;
      const dy = event.clientY - this.start.y;
      const started = this.fromGrabber
        ? Math.abs(dy) >= GRABBER_START_PX
        : drawerDragStarted(dx, dy);
      if (!started) return;
      // Upward, on content that can still scroll down, is the reader scrolling:
      // zag gives the gesture to the scroll, even from the grabber.
      if (dy < 0 && canScrollDown(content)) {
        this.endGesture();
        return;
      }
      this.beginDrag(content);
    }
    const now = performance.now();
    this.samples.push({ y: event.clientY, time: now });
    while (this.samples.length > 2 && this.samples[0]!.time < now - SAMPLE_KEEP_MS)
      this.samples.shift();
    this.offset = drawerDragOffset(this.start.y, event.clientY);
    content.style.setProperty("--drawer-translate-y", `${this.offset}px`);
    this.options
      .backdrop()
      ?.style.setProperty(
        "--drawer-swipe-progress",
        `${drawerSwipeProgress(this.offset, content.offsetHeight)}`,
      );
    if (event.cancelable) event.preventDefault();
  }

  private onPointerUp(event: PointerEvent, content: HTMLElement): void {
    if (event.pointerId !== this.pointerId) return;
    if (!this.dragging) {
      this.endGesture();
      return;
    }
    const velocity = drawerReleaseVelocity(this.samples, performance.now());
    const size = content.offsetHeight;
    this.swallowNextClick();
    if (drawerShouldDismiss(this.offset, velocity, size)) {
      const strength = drawerSwipeStrength(this.offset, size, velocity);
      content.style.setProperty("--drawer-swipe-strength", `${strength}`);
      this.options.backdrop()?.style.setProperty("--drawer-swipe-strength", `${strength}`);
      content.removeAttribute("data-dragging");
      this.endGesture();
      // The exit animation starts from where the drag left the panel; a caller
      // that refuses the close gets the panel back.
      if (!this.options.dismiss(strength)) this.snapBack(content);
      return;
    }
    this.snapBack(content);
    this.endGesture();
  }

  /** Back to rest, through the stylesheet's transition. */
  private snapBack(content: HTMLElement): void {
    const backdrop = this.options.backdrop();
    content.style.removeProperty("transition-duration");
    content.style.setProperty("--drawer-translate-y", "0px");
    content.removeAttribute("data-swiping");
    content.removeAttribute("data-dragging");
    backdrop?.style.setProperty("--drawer-swipe-progress", "0");
    backdrop?.removeAttribute("data-swiping");
    this.offset = 0;
  }

  /** The press that ended a drag is not also a click on whatever it ended over. */
  private swallowNextClick(): void {
    const stop = (event: Event) => {
      event.stopPropagation();
      event.preventDefault();
    };
    this.doc.addEventListener("click", stop, { capture: true, once: true });
    setTimeout(() => this.doc.removeEventListener("click", stop, { capture: true }));
  }

  private endGesture(): void {
    this.stopListening?.();
    this.stopListening = null;
    this.restoreSelection?.();
    this.restoreSelection = null;
    this.pointerId = null;
    this.start = null;
    this.dragging = false;
    this.fromGrabber = false;
    this.samples = [];
  }
}

/** Whether the content has more to show below what it shows now. zag's half-pixel slack. */
function canScrollDown(content: HTMLElement): boolean {
  return content.scrollHeight - content.clientHeight - content.scrollTop > 0.5;
}

/** Whether the press is inside something scrolled away from its top, the content included. */
function scrolledFromTop(target: Element | null, content: HTMLElement): boolean {
  for (let el: Element | null = target; el; el = el.parentElement) {
    if (el instanceof HTMLElement && el.scrollTop > 0 && el.scrollHeight > el.clientHeight)
      return true;
    if (el === content) break;
  }
  return false;
}
