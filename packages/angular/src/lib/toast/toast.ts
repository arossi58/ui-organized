import { Overlay, type OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import {
  ApplicationRef,
  Component,
  EnvironmentInjector,
  Injectable,
  OnDestroy,
  inject,
  signal,
  type ComponentRef,
  type Signal,
} from "@angular/core";
import { toastStyles } from "@ui-organized/core";
import type { CanonicalIconName } from "@ui-organized/utils";
import { stateFlag } from "../part.js";
import { nextMachineId } from "../part-ids.js";
import { UioIcon } from "../icons/icon.js";
import { applyOverlayStacking } from "../overlay/stacking.js";
import { createSurface, setSurfaceInteractive } from "../overlay/surface.js";
import { flushNow } from "../overlay/flush.js";

/** Drives the accent colour and the icon. Set through `add({ type })`. */
export type ToastStatus = "info" | "success" | "warning" | "error";

export interface ToastAction {
  label: string;
  onClick?: () => void;
}

export interface ToastOptions {
  title?: string;
  description?: string;
  /**
   * Free-form, and reported verbatim as `data-type`.
   *
   * Only the four statuses pick an accent and an icon; anything else falls back
   * to `info` for the styling while keeping its own word on the attribute. That
   * split is Zag's and it is deliberate — an application may key its own CSS off
   * `[data-type="deploy-finished"]` without the library having to know about it.
   */
  type?: string;
  /** Auto-dismiss after this many ms. `Infinity` keeps it until it is closed. */
  duration?: number;
  /** An inline button, e.g. "Undo". Dismisses the toast when pressed. */
  action?: ToastAction;
  /** Supply one to update an existing toast rather than adding another. */
  id?: string;
}

/**
 * The toaster's own settings, fixed rather than injected.
 *
 * The React library builds its module-level toaster with exactly these, and a
 * toast that appeared bottom-right in three libraries and top-left in the fourth
 * would be a difference no test in this repo is looking for. When there is a
 * reason to vary them it should be varied in all four at once.
 */
const PLACEMENT = "bottom-end";
const SIDE = "bottom";
const ALIGN = "end";
const DEFAULT_DURATION = 5000;
/** How long a dismissed toast stays in the DOM so its exit transition can run. */
const REMOVE_DELAY = 200;
const ICON_SIZE = 20;

/**
 * The hotkey Zag names in the region's accessible label.
 *
 * Reproduced as a string rather than implemented: the label is part of the
 * rendered contract and the parity gate compares it, while the shortcut itself
 * is a document-level listener that would be the fourth library on a page
 * fighting for alt+T. Named here so that whoever adds the listener finds the
 * label already waiting for it.
 */
const REGION_LABEL = `Notifications, ${PLACEMENT} (alt+T)`;

const STATUS_ICON: Record<ToastStatus, CanonicalIconName> = {
  info: "info",
  success: "check-circle",
  warning: "alert-triangle",
  error: "alert-circle",
};

function resolveStatus(type: string | undefined): ToastStatus {
  return type === "success" || type === "warning" || type === "error" ? type : "info";
}

/** One live toast, as the region renders it. */
export interface ToastRecord {
  id: string;
  title?: string;
  description?: string;
  type: string;
  status: ToastStatus;
  action?: ToastAction;
  duration: number;
  /** `open` until it is dismissed; `closed` for the exit transition. */
  state: "open" | "closed";
  /** Lands a frame after the element exists — see `UioToaster.add`. */
  mounted: boolean;
  paused: boolean;
}

interface Timer {
  handle: ReturnType<typeof setTimeout>;
  startedAt: number;
  remaining: number;
}

/**
 * Toasts, from anywhere, with no markup to place.
 *
 * ```ts
 * const toaster = inject(UioToaster);
 * toaster.add({ title: "Saved", description: "Your changes are live.", type: "success" });
 * ```
 *
 * ── Why this is a root service and not a `<uio-toast-provider>` ─────────────
 *
 * The other three libraries build one `createToaster()` at module scope and hand
 * it to a `<Toaster>` the application places in its tree. Two things have to be
 * true for that: the imperative handle must be reachable from any file, and the
 * region must have somewhere to render.
 *
 * A module-level singleton would satisfy the first here too, and it is the wrong
 * answer in Angular — it is a global that no test can replace, that survives
 * between test cases in the same process, and that is invisible to the injector
 * everything else in this library is reached through. `providedIn: "root"` *is*
 * Angular's module-level singleton, with an injector around it: one instance per
 * application, swappable in a `TestBed`, and disposed with the application.
 *
 * The second — somewhere to render — is what the CDK overlay is for, and it is
 * why this needs no provider component at all. The region is created into an
 * overlay the first time a toast is added, so an application that never toasts
 * renders nothing and an application that does needs no markup. That is a real
 * difference from React, where `<ToastProvider>` renders an empty region from
 * first paint; it is the same difference `MatSnackBar` has, and it is the reason
 * this API is one import instead of an import plus a wrapper component.
 *
 * ── What it does *not* take from the overlay layer ──────────────────────────
 *
 * `pushLayer` from `overlay/dismiss.ts` is deliberately not used. That stack
 * routes Escape and outside clicks to the *topmost* surface, which is right for
 * a menu and wrong for a toast: a toast is not modal, it does not take focus,
 * and an Escape meant for the dialog underneath it must not be swallowed. Zag
 * puts the Escape handler on the toast's own root, where it fires only when the
 * toast itself has focus, and so does this.
 */
@Injectable({ providedIn: "root" })
export class UioToaster implements OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(EnvironmentInjector);
  private readonly appRef = inject(ApplicationRef);

  /** Newest first, as Zag's store unshifts. The region renders them in order. */
  private readonly records = signal<readonly ToastRecord[]>([]);
  readonly toasts: Signal<readonly ToastRecord[]> = this.records.asReadonly();

  private overlayRef?: OverlayRef;
  private region?: ComponentRef<UioToastRegion>;
  private readonly timers = new Map<string, Timer>();
  private readonly frames = new Map<string, number>();

  /**
   * Show a toast. Returns its id, for `close` and `update`.
   *
   * The manager surface is React's — `add`/`close`/`update` — rather than Ark's
   * `create`/`dismiss`/`update`, because the React library already chose those
   * names when it wrapped Base UI and four libraries with three spellings would
   * be worse than one shared spelling that happens to be nobody's default.
   */
  add(options: ToastOptions): string {
    const id = options.id ?? `toast:${nextMachineId()}`;
    if (this.records().some((toast) => toast.id === id)) {
      this.update(id, options);
      return id;
    }

    this.ensureRegion();
    const record = this.toRecord(id, options);
    this.records.update((toasts) => [record, ...toasts]);
    this.startTimer(record);

    /**
     * `data-mounted` a frame later, exactly as Zag's `setMounted` does.
     *
     * It is what an entrance transition keys off: the element has to exist at its
     * "before" state for one frame or the browser has nothing to animate from.
     * Anything reading the DOM the instant a toast opens therefore sees
     * `data-state="open"` without it — which is a real race the browser parity
     * gate had to learn to wait for, not a detail.
     */
    this.frames.set(
      id,
      requestAnimationFrame(() => {
        this.frames.delete(id);
        this.patch(id, { mounted: true });
        this.sync();
      }),
    );

    this.sync();
    return id;
  }

  /** Begin dismissing a toast. It leaves the DOM after its exit transition. */
  close(id: string): void {
    if (!this.records().some((toast) => toast.id === id)) return;
    this.clearTimer(id);
    this.patch(id, { state: "closed" });
    setTimeout(() => this.remove(id), REMOVE_DELAY);
    this.sync();
  }

  /** Dismiss every toast at once. */
  closeAll(): void {
    for (const toast of this.records()) this.close(toast.id);
  }

  /**
   * Replace a live toast's content in place.
   *
   * The auto-dismiss timer restarts, which is Zag's behaviour (`UPDATE` runs
   * `resetCloseTimer`) and the only sensible one: an update is new information,
   * and leaving the old countdown running would hide it after the time the
   * *previous* message had already spent on screen.
   */
  update(id: string, options: ToastOptions): void {
    const current = this.records().find((toast) => toast.id === id);
    if (!current) return;
    const next = this.toRecord(id, { ...this.toOptions(current), ...options });
    // Neither is content: a toast being updated has already appeared, and
    // re-arming `mounted` would replay its entrance animation.
    next.mounted = current.mounted;
    next.paused = current.paused;
    this.records.update((toasts) => toasts.map((toast) => (toast.id === id ? next : toast)));
    this.clearTimer(id);
    if (!next.paused) this.startTimer(next);
    this.sync();
  }

  /**
   * Hold every countdown while the pointer or focus is inside the region.
   *
   * A toast that disappears mid-sentence is the complaint this prevents, and it
   * is the one piece of a toaster that cannot be expressed as markup: the
   * remaining time has to be banked when the timer is cleared, or resuming would
   * restart every toast at its full duration.
   */
  pause(): void {
    const now = Date.now();
    for (const toast of this.records()) {
      // Already paused is not a no-op by accident: the region pauses on pointer
      // *and* on focus, and both fire when a user tabs into a toast they are
      // already hovering. Without this the second call would bank the same
      // elapsed time twice and swallow the rest of the countdown.
      if (toast.paused) continue;
      const timer = this.timers.get(toast.id);
      if (!timer) continue;
      clearTimeout(timer.handle);
      this.timers.set(toast.id, {
        ...timer,
        remaining: Math.max(0, timer.remaining - (now - timer.startedAt)),
      });
      this.patch(toast.id, { paused: true });
    }
    this.sync();
  }

  resume(): void {
    for (const toast of this.records()) {
      if (!toast.paused) continue;
      const timer = this.timers.get(toast.id);
      if (!timer) continue;
      this.timers.delete(toast.id);
      this.startTimer({ ...toast, duration: timer.remaining });
      this.patch(toast.id, { paused: false });
    }
    this.sync();
  }

  ngOnDestroy(): void {
    for (const timer of this.timers.values()) clearTimeout(timer.handle);
    this.timers.clear();
    for (const frame of this.frames.values()) cancelAnimationFrame(frame);
    this.frames.clear();
    this.region?.destroy();
    this.overlayRef?.dispose();
  }

  private toRecord(id: string, options: ToastOptions): ToastRecord {
    return {
      id,
      title: options.title,
      description: options.description,
      type: options.type ?? "info",
      status: resolveStatus(options.type),
      action: options.action,
      duration: options.duration ?? DEFAULT_DURATION,
      state: "open",
      mounted: false,
      paused: false,
    };
  }

  private toOptions(record: ToastRecord): ToastOptions {
    return {
      title: record.title,
      description: record.description,
      type: record.type,
      duration: record.duration,
      action: record.action,
    };
  }

  /** Changes one record. Callers `sync()` once, after however many they make. */
  private patch(id: string, changes: Partial<ToastRecord>): void {
    this.records.update((toasts) =>
      toasts.map((toast) => (toast.id === id ? { ...toast, ...changes } : toast)),
    );
  }

  private remove(id: string): void {
    this.records.update((toasts) => toasts.filter((toast) => toast.id !== id));
    this.sync();
  }

  private startTimer(record: ToastRecord): void {
    if (!Number.isFinite(record.duration)) return;
    this.timers.set(record.id, {
      handle: setTimeout(() => this.close(record.id), record.duration),
      startedAt: Date.now(),
      remaining: record.duration,
    });
  }

  private clearTimer(id: string): void {
    const timer = this.timers.get(id);
    if (!timer) return;
    clearTimeout(timer.handle);
    this.timers.delete(id);
  }

  /**
   * Push the change into the DOM now.
   *
   * `add` is called from wherever the application happens to be — an HTTP error
   * handler, a form submit — which is React's "discrete event" case, where the
   * update lands before the handler returns. Zoneless Angular would otherwise
   * schedule it for the next task, and anything that reads the DOM straight
   * after adding a toast (the parity gate does) would find nothing there.
   */
  private sync(): void {
    if (this.overlayRef) setSurfaceInteractive(this.overlayRef, this.records().length > 0);
    flushNow(this.appRef);
  }

  private ensureRegion(): void {
    if (this.overlayRef) return;
    /**
     * `createSurface`, not `overlay.create`: the CDK stamps an `id` on every pane
     * it makes, and the parity gate numbers every id in the document in order —
     * one extra shifts every placeholder after it and reports identical markup as
     * different. See `overlay/surface.ts`.
     */
    this.overlayRef = createSurface(this.overlay, {
      positionStrategy: this.overlay.position().global(),
      // Never `block()`: a toast is not modal, and the page stays scrollable
      // under it. `reposition()` would be wasted work on a fixed region.
      scrollStrategy: this.overlay.scrollStrategies.noop(),
    });
    this.region = this.overlayRef.attach(
      new ComponentPortal(UioToastRegion, null, this.injector),
    );
    // The portal creates the component but does not render it, and the stacking
    // level below is read off a *computed* style — so the group has to exist and
    // have the stylesheet applied before it is asked.
    this.region.changeDetectorRef.detectChanges();

    const group = this.overlayRef.overlayElement.querySelector<HTMLElement>(
      '[data-part="group"]',
    );
    /**
     * Zag writes `z-index: 2147483647` inline on the region. This takes the level
     * `.toast__viewport` itself declares instead — the same mechanism every other
     * surface in this package uses, and the one that keeps the design system's
     * scale the single source of the answer. `--z-index-toast` is already above
     * `--z-index-dialog`, so a toast still paints over a modal; what it no longer
     * does is paint over a consumer's own top-level chrome by claiming the
     * largest number there is.
     */
    if (group) applyOverlayStacking(this.overlayRef.overlayElement, group);
    // A region with no toasts in it must not swallow clicks on the page beneath.
    setSurfaceInteractive(this.overlayRef, false);
  }
}

/**
 * The region every toast is rendered into.
 *
 * Created by `UioToaster` into a CDK overlay; never placed by hand, which is why
 * it takes no inputs — it reads the service directly. That also sidesteps the
 * JIT limitation the rest of this package works around, since there is no input
 * for a JIT-compiled template to fail to bind.
 *
 * ── Why the host element is not the group ───────────────────────────────────
 *
 * Ark renders the region as a `<div>`, and the parity gate compares tag names.
 * An Angular component's host element is named by its selector, so making the
 * host *be* the group would render `<uio-toast-region data-part="group">` and
 * differ from all three other libraries on the one attribute-free property they
 * all agree on. The host stays an empty wrapper inside the overlay pane, where
 * it is outside the compared region and carries no id to renumber.
 */
@Component({
  selector: "uio-toast-region",
  standalone: true,
  imports: [UioIcon],
  template: `
    <div
      class="toast__viewport"
      data-scope="toast"
      data-part="group"
      role="region"
      tabindex="-1"
      aria-live="polite"
      aria-relevant="additions text"
      aria-atomic="false"
      [id]="GROUP_ID"
      [attr.aria-label]="REGION_LABEL"
      [attr.data-placement]="PLACEMENT"
      [attr.data-side]="SIDE"
      [attr.data-align]="ALIGN"
      [attr.style]="GROUP_STYLE"
      (pointerenter)="toaster.pause()"
      (pointerleave)="toaster.resume()"
      (focusin)="toaster.pause()"
      (focusout)="toaster.resume()"
    >
      @for (toast of toaster.toasts(); track toast.id; let index = $index) {
        <div
          [class]="rootClass(toast)"
          data-scope="toast"
          data-part="root"
          role="status"
          aria-atomic="true"
          tabindex="0"
          data-stack
          [id]="rootId(toast)"
          [attr.data-state]="toast.state"
          [attr.data-type]="toast.type"
          [attr.data-placement]="PLACEMENT"
          [attr.data-side]="SIDE"
          [attr.data-align]="ALIGN"
          [attr.data-mounted]="flag(toast.mounted)"
          [attr.data-paused]="flag(toast.paused)"
          [attr.data-first]="flag(index === 0)"
          [attr.data-sibling]="flag(index !== 0)"
          [attr.aria-labelledby]="toast.title ? titleId(toast) : null"
          [attr.aria-describedby]="toast.description ? descriptionId(toast) : null"
          [attr.style]="ROOT_STYLE"
          (keydown)="onKeydown($event, toast)"
        >
          <!--
            The two ghosts are Zag's, and they are not decoration: the one behind
            the toast keeps the pointer "inside" while the toast transitions out,
            and the one above it bridges the gap to the next toast so that moving
            between two of them never reads as leaving the stack. Both are part of
            the rendered contract, so both are here.
          -->
          <div data-ghost="before" [attr.style]="GHOST_BEFORE"></div>
          <span class="toast__icon">
            <span uioIcon [name]="iconFor(toast)" [size]="ICON_SIZE"></span>
          </span>
          <div class="toast__content">
            <div
              class="toast__title text-strong-body-medium"
              data-scope="toast"
              data-part="title"
              [id]="titleId(toast)"
            >{{ toast.title }}</div>
            <div
              class="toast__description text-default-body-medium"
              data-scope="toast"
              data-part="description"
              [id]="descriptionId(toast)"
            >{{ toast.description }}</div>
          </div>
          @if (toast.action; as action) {
            <button
              class="toast__action text-emphasis-body-small"
              data-scope="toast"
              data-part="action-trigger"
              type="button"
              (click)="act(toast, action)"
            >{{ action.label }}</button>
          }
          <button
            class="toast__close"
            data-scope="toast"
            data-part="close-trigger"
            type="button"
            aria-label="Dismiss"
            [id]="closeId(toast)"
            (click)="toaster.close(toast.id)"
          >
            <span uioIcon name="close" [size]="ICON_SIZE"></span>
          </button>
          <div data-ghost="after" [attr.style]="GHOST_AFTER"></div>
        </div>
      }
    </div>
  `,
})
export class UioToastRegion {
  protected readonly toaster = inject(UioToaster);

  protected readonly PLACEMENT = PLACEMENT;
  protected readonly SIDE = SIDE;
  protected readonly ALIGN = ALIGN;
  protected readonly REGION_LABEL = REGION_LABEL;
  protected readonly ICON_SIZE = ICON_SIZE;
  /** Placement-derived, like Zag's, so two regions could never collide. */
  protected readonly GROUP_ID = `toast-group:${PLACEMENT}`;

  /**
   * The layout Zag writes inline, reduced to what this design system's rules
   * actually need.
   *
   * `.toast__viewport` sets `bottom`, `right` and `z-index` but no `position`, so
   * without at least `position: fixed` here the region would sit wherever the
   * overlay pane put it — top-left — with three correct offsets doing nothing.
   *
   * What is *not* reproduced is Zag's stacking choreography: it positions every
   * toast absolutely and drives `--y`, `--offset` and `--index` from measured
   * heights, and none of those variables appear anywhere in `Toast.css`. A flex
   * column with the stylesheet's own `--gap` puts the toasts in the same corner
   * out of the layout engine instead of out of a `ResizeObserver`.
   * `column-reverse` because the list is newest-first, and the newest toast
   * belongs nearest the corner.
   *
   * It is the same *placement*, not the same *picture*, and this comment used to
   * claim otherwise. The parity harness's visual gate measured it: with two
   * toasts up, React collapses the stack — both at the same `y`, the front one
   * covering the rest — and this lays them out in flow, 187px apart. Reproducing
   * the collapse means reproducing the measured-height choreography, which is
   * real work and is recorded as accepted drift in
   * `tooling/parity/browser/visual.browser.spec.ts` rather than pretended away.
   */
  protected readonly GROUP_STYLE =
    "position: fixed; display: flex; flex-direction: column-reverse; " +
    "align-items: flex-end; gap: var(--gap);";
  /** Only so the two absolutely-positioned ghosts are measured against it. */
  protected readonly ROOT_STYLE = "position: relative;";
  protected readonly GHOST_BEFORE =
    "position: absolute; inset: 0px; scale: 1 2; pointer-events: none;";
  protected readonly GHOST_AFTER =
    "position: absolute; left: 0px; height: calc(var(--gap) + 2px); bottom: 100%; width: 100%;";

  /**
   * The same presence-only encoding every other part in this library uses:
   * `[data-mounted]` matches `="false"` too, so the natural Angular spelling
   * would mark every unmounted toast as mounted.
   */
  protected readonly flag = stateFlag;

  protected rootClass(toast: ToastRecord): string {
    return toastStyles({ status: toast.status });
  }
  protected iconFor(toast: ToastRecord): CanonicalIconName {
    return STATUS_ICON[toast.status];
  }

  /**
   * Zag's ids, including the one that is missing a colon.
   *
   * `getCloseTriggerId` is `toast${id}:close` where every sibling is
   * `toast:${id}:…`. It is upstream's typo and it is upstream's contract;
   * "fixing" it here would be the fourth library rendering a different id from
   * the other three for no gain.
   */
  protected rootId(toast: ToastRecord): string {
    return `toast:${toast.id}`;
  }
  protected titleId(toast: ToastRecord): string {
    return `toast:${toast.id}:title`;
  }
  protected descriptionId(toast: ToastRecord): string {
    return `toast:${toast.id}:description`;
  }
  protected closeId(toast: ToastRecord): string {
    return `toast${toast.id}:close`;
  }

  protected act(toast: ToastRecord, action: ToastAction): void {
    action.onClick?.();
    this.toaster.close(toast.id);
  }

  /**
   * Escape closes the toast that has focus, and only that one.
   *
   * On the root rather than on the document: `overlay/dismiss.ts` would route
   * every Escape on the page to the newest toast, including one a user pressed to
   * close the dialog the toast happens to be sitting over.
   */
  protected onKeydown(event: KeyboardEvent, toast: ToastRecord): void {
    if (event.key !== "Escape" || event.defaultPrevented) return;
    event.preventDefault();
    this.toaster.close(toast.id);
  }
}
