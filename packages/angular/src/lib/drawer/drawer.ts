import { Overlay, type OverlayRef, type BlockScrollStrategy } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import { FocusTrapFactory, type FocusTrap } from "@angular/cdk/a11y";
import {
  ApplicationRef,
  Component,
  DOCUMENT,
  Directive,
  ElementRef,
  EmbeddedViewRef,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  type Signal,
} from "@angular/core";
import { DRAWER_CLASS, DRAWER_CLOSE_ICON_SIZE } from "@ui-organized/core";
import { UioPart } from "../part.js";
import { HostPresence } from "../host-presence.js";
import { UioIcon } from "../icons/icon.js";
import { hideOthersFrom } from "../overlay/aria-hidden.js";
import { pushLayer, removeLayer, type DismissibleLayer } from "../overlay/dismiss.js";
import { flushNow } from "../overlay/flush.js";
import { focusInside, restoreFocus } from "../overlay/focus.js";
import {
  applySurfaceStacking,
  createSurface,
  raiseSurface,
  setSurfaceInteractive,
} from "../overlay/surface.js";
import { glyph } from "../icons/glyph.js";
import { UioDrawerContext } from "./drawer-context.js";
import { DrawerSwipe } from "./drawer-swipe.js";

/**
 * A panel along the bottom edge, dismissed by swiping it down, by Escape, by
 * the backdrop or by its close button.
 *
 * ```html
 * <button uioButton uioDrawerTrigger [drawer]="share">Share</button>
 * <uio-drawer #share="uioDrawer">
 *   <h2 uioDrawerTitle>Share</h2>
 *   <div uioDrawerDescription>Anyone with the link can view.</div>
 *   <div uioDrawerFooter><button uioButton uioDrawerClose>Done</button></div>
 * </uio-drawer>
 * ```
 *
 * The surface is a Sheet's (see `UioSheet`, and `UioDialog` for why the host
 * disappears and the surface is attached before it opens): the CDK pane, the
 * focus trap on the positioner, the page's `aria-hidden` marks, the scroll
 * block and the dismissible layer. What is the Drawer's own:
 *
 * - **The close is animated.** A Sheet here hides at once; a drawer slides
 *   out, and from wherever a swipe left it. `data-state` flips to `closed` and
 *   the panel stays displayed until its exit animation ends, which is what
 *   Ark's presence does in the other three libraries.
 * - **`data-expanded`** is zag's "resting at its one snap point", which zag
 *   knows once it has measured the panel against the viewport. A
 *   ResizeObserver measures it here.
 * - **The swipe**, in `DrawerSwipe`, on core's arithmetic.
 */
@Component({
  selector: "uio-drawer",
  standalone: true,
  exportAs: "uioDrawer",
  imports: [UioIcon],
  providers: [UioDrawerContext, HostPresence],
  template: `
    <!-- See UioDialog: a container anchored on the host is re-homed by projection. -->
    <ng-container #anchor />
    <ng-template #surface>
      <div
        [class]="CLASS.backdrop"
        data-scope="drawer"
        data-part="backdrop"
        [id]="drawerContext.partId('backdrop')"
        [attr.data-state]="state()"
        [attr.hidden]="visible() ? null : ''"
      ></div>
      <div
        [class]="CLASS.positioner"
        data-scope="drawer"
        data-part="positioner"
        data-swipe-direction="down"
        [id]="drawerContext.partId('positioner')"
        [attr.data-state]="state()"
        [attr.hidden]="visible() ? null : ''"
      >
        <div
          [class]="CLASS.popup"
          data-scope="drawer"
          data-part="content"
          data-swipe-direction="down"
          role="dialog"
          tabindex="-1"
          [id]="drawerContext.partId('content')"
          [attr.data-state]="state()"
          [attr.data-expanded]="expanded() ? '' : null"
          [attr.hidden]="visible() ? null : ''"
          [attr.aria-modal]="modal() ? 'true' : 'false'"
          [attr.aria-labelledby]="drawerContext.labelledBy()"
          [attr.aria-describedby]="drawerContext.describedBy()"
        >
          @if (showGrabber()) {
            <div
              [class]="CLASS.grabber"
              data-scope="drawer"
              data-part="grabber"
              style="touch-action: none"
              [id]="drawerContext.partId('grabber')"
            >
              <div
                [class]="CLASS.grabberIndicator"
                data-scope="drawer"
                data-part="grabber-indicator"
                [id]="drawerContext.partId('grabber-indicator')"
              ></div>
            </div>
          }
          @if (showClose()) {
            <button
              [class]="CLASS.close"
              data-scope="drawer"
              data-part="close-trigger"
              type="button"
              aria-label="Close"
              [id]="drawerContext.partId('close-trigger')"
              (click)="requestClose()"
            >
              <span uioIcon [name]="glyph('close')" [size]="CLOSE_ICON_SIZE"></span>
            </button>
          }
          <ng-content />
        </div>
      </div>
    </ng-template>
  `,
})
export class UioDrawer implements OnInit, OnDestroy {
  protected readonly glyph = glyph;
  protected readonly CLASS = DRAWER_CLASS;
  protected readonly CLOSE_ICON_SIZE = DRAWER_CLOSE_ICON_SIZE;

  readonly open = model(false);
  /** The handle along the top edge, which always drags. */
  readonly showGrabber = input(true, { transform: booleanAttribute });
  /** On by default, as on a Sheet: a keyboard needs a way out a swipe is not. */
  readonly showClose = input(true, { transform: booleanAttribute });
  readonly modal = input(true, { transform: booleanAttribute });
  /** Whether a press on the content, not only on the grabber, can drag. */
  readonly draggable = input(true, { transform: booleanAttribute });
  /**
   * Off by default: Escape, an outside click, a swipe past the threshold, the
   * × and `uioDrawerClose` close the drawer and report it through
   * `openChange`. On, they only ask, through `closeRequest`, and a refused
   * swipe springs back. See `UioSheet.controlled`.
   */
  readonly controlled = input(false, { transform: booleanAttribute });
  readonly closeRequest = output<void>();

  readonly drawerContext = inject(UioDrawerContext);

  /** On its way out: closed, but still displayed until the exit animation ends. */
  private readonly exiting = signal(false);
  protected readonly visible = computed(() => this.open() || this.exiting());
  protected readonly state = computed(() => (this.open() ? "open" : "closed"));
  protected readonly expanded = signal(false);

  /** See `UioDialog` — decorator queries are the spelling both compilers register. */
  @ViewChild("surface", { static: true }) private surface!: TemplateRef<unknown>;
  @ViewChild("anchor", { read: ViewContainerRef, static: true }) private anchor!: ViewContainerRef;

  private readonly overlay = inject(Overlay);
  private readonly document = inject(DOCUMENT);
  private readonly presence = inject(HostPresence);
  private readonly focusTraps = inject(FocusTrapFactory);
  private readonly appRef = inject(ApplicationRef);

  private overlayRef?: OverlayRef;
  private surfaceView?: EmbeddedViewRef<unknown>;
  private scrollBlock?: BlockScrollStrategy;
  private trap?: FocusTrap;
  private restoreAria?: () => void;
  private opener: HTMLElement | null = null;
  private applied = false;
  private resize?: ResizeObserver;
  private stopExit: (() => void) | null = null;

  private readonly swipe = new DrawerSwipe(this.document, {
    content: () => this.contentElement(),
    backdrop: () => this.backdropElement(),
    active: () => this.open(),
    contentDraggable: () => this.draggable(),
    dismiss: () => {
      this.requestClose();
      return !this.open();
    },
  });

  private readonly layer: DismissibleLayer = {
    surface: () => this.contentElement(),
    trigger: () => this.opener,
    /** As for a Sheet: a non-modal drawer sits beside the page, so only Escape dismisses it. */
    dismiss: (reason) => {
      if (reason === "escape" || this.modal()) this.requestClose();
    },
  };

  constructor() {
    effect(() => {
      this.open();
      untracked(() => this.sync());
    });
  }

  /** `ngOnInit`, not `ngAfterViewInit` — see `UioDialog` for the ordering. */
  ngOnInit(): void {
    this.overlayRef = createSurface(this.overlay, {
      positionStrategy: this.overlay.position().global(),
      scrollStrategy: this.overlay.scrollStrategies.noop(),
    });
    this.scrollBlock = this.overlay.scrollStrategies.block();
    this.surfaceView = this.overlayRef.attach(
      new TemplatePortal(this.surface, this.anchor),
    ) as EmbeddedViewRef<unknown>;
    applySurfaceStacking(this.overlayRef);
    setSurfaceInteractive(this.overlayRef, false);
    this.presence.hide();
    const content = this.contentElement();
    if (content) this.swipe.attach(content);
  }

  ngOnDestroy(): void {
    this.stopExit?.();
    this.resize?.disconnect();
    this.swipe.detach();
    removeLayer(this.layer);
    this.restoreAria?.();
    this.trap?.destroy();
    this.scrollBlock?.disable();
    this.overlayRef?.dispose();
  }

  show(): void {
    this.setOpen(true);
  }
  hide(): void {
    this.setOpen(false);
  }
  toggle(): void {
    this.setOpen(!this.open());
  }
  /** A dismissal by the user: closes, or only asks when `controlled`. */
  requestClose(): void {
    if (this.controlled()) this.closeRequest.emit();
    else this.hide();
  }

  /** Remembered on open so focus can be given back to it on close. */
  rememberOpener(element: HTMLElement | null): void {
    this.opener = element;
  }

  private find(part: string): HTMLElement | null {
    return (
      this.overlayRef?.overlayElement.querySelector<HTMLElement>(
        `[data-scope="drawer"][data-part="${part}"]`,
      ) ?? null
    );
  }
  private contentElement(): HTMLElement | null {
    return this.find("content");
  }
  private positionerElement(): HTMLElement | null {
    return this.find("positioner");
  }
  private backdropElement(): HTMLElement | null {
    return this.find("backdrop");
  }

  /** Two halves on purpose — see `UioDialog.setOpen` for the timing. */
  private setOpen(next: boolean): void {
    this.open.set(next);
    if (next) pushLayer(this.document, this.layer);
    else removeLayer(this.layer);
    flushNow(this.appRef);
  }

  private sync(): void {
    const open = this.open();
    if (open === this.applied) return;
    if (open) this.applyOpen();
    else this.applyClose();
  }

  private applyOpen(): void {
    this.applied = true;
    const ref = this.overlayRef;
    if (!ref) return;
    // Reopened on the way out: the exit is abandoned, and the panel slides in
    // from the edge rather than from wherever the last swipe left it.
    this.stopExit?.();
    this.exiting.set(false);
    this.swipe.reset();
    this.surfaceView?.detectChanges();
    raiseSurface(ref);
    setSurfaceInteractive(ref, true);

    const positioner = this.positionerElement();
    const content = this.contentElement();
    if (this.modal() && positioner) {
      this.restoreAria = hideOthersFrom(positioner);
      this.scrollBlock?.enable();
      // On the positioner, for the reason UioSheet gives.
      this.trap = this.focusTraps.create(positioner);
    }
    if (content) {
      focusInside(content);
      this.measure(content);
    }
    pushLayer(this.document, this.layer);
  }

  /**
   * zag's `data-expanded`: the panel is at rest at its one snap point (fully
   * open), which it is whenever it fits the viewport. Re-measured as either
   * changes size.
   */
  private measure(content: HTMLElement): void {
    const view = this.document.defaultView;
    const check = () => {
      if (!this.open()) return;
      this.expanded.set(content.offsetHeight <= (view?.innerHeight ?? Infinity));
      flushNow(this.appRef);
    };
    this.resize?.disconnect();
    if (view && "ResizeObserver" in view) {
      this.resize = new view.ResizeObserver(check);
      this.resize.observe(content);
    } else {
      check();
    }
  }

  private applyClose(): void {
    this.applied = false;
    removeLayer(this.layer);
    this.restoreAria?.();
    this.restoreAria = undefined;
    this.trap?.destroy();
    this.trap = undefined;
    this.scrollBlock?.disable();
    if (this.overlayRef) setSurfaceInteractive(this.overlayRef, false);
    this.exiting.set(true);
    this.surfaceView?.detectChanges();
    restoreFocus(this.opener);
    this.trackExit(() => {
      this.exiting.set(false);
      this.expanded.set(false);
      this.resize?.disconnect();
      this.resize = undefined;
      this.swipe.reset();
      this.surfaceView?.detectChanges();
    });
  }

  /**
   * Run `done` when the exit animation ends, or at once when there is none.
   * The Collapsible's arrangement (see `UioCollapsibleContext.trackAnimation`):
   * the closed state is written first, and its animation read a frame later.
   */
  private trackExit(done: () => void): void {
    const content = this.contentElement();
    this.stopExit?.();
    if (!content) {
      done();
      return;
    }
    flushNow(this.appRef);
    const view = this.document.defaultView;
    const finish = () => {
      this.stopExit?.();
      done();
      flushNow(this.appRef);
    };
    const frame = view?.requestAnimationFrame(() => {
      const name = view.getComputedStyle(content).animationName;
      if (!name || name === "none") {
        finish();
        return;
      }
      const onEnd = (event: AnimationEvent) => {
        if (event.target === content) finish();
      };
      content.addEventListener("animationend", onEnd);
      this.stopExit = () => {
        content.removeEventListener("animationend", onEnd);
        this.stopExit = null;
      };
    });
    this.stopExit = () => {
      if (frame !== undefined) view?.cancelAnimationFrame(frame);
      this.stopExit = null;
    };
  }
}

/** Opens the drawer, and reports its state the way Ark's drawer trigger does. */
@Directive({
  selector: "button[uioDrawerTrigger]",
  standalone: true,
  host: {
    type: "button",
    "aria-haspopup": "dialog",
    "[id]": "drawer ? drawer.drawerContext.partId('trigger') : null",
    "[attr.data-ownedby]": "drawer ? drawer.drawerContext.machineId : null",
    "[attr.aria-expanded]": "isOpen() ? 'true' : 'false'",
    "[attr.aria-controls]": "isOpen() ? drawer!.drawerContext.partId('content') : null",
    "(click)": "activate()",
  },
})
export class UioDrawerTrigger extends UioPart {
  readonly scope = "drawer";
  readonly part = "trigger";

  /** A decorator input — see `UioDialogTrigger` for why this one is not `input()`. */
  @Input("drawer") drawer?: UioDrawer;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly isOpen: Signal<boolean> = computed(() => !!this.drawer?.open());
  override readonly state = computed(() => (this.isOpen() ? "open" : "closed"));

  protected activate(): void {
    const drawer = this.drawer;
    if (!drawer) return;
    drawer.rememberOpener(this.host.nativeElement);
    drawer.toggle();
  }
}

/** Names the drawer. Ark's Title is an `h2`; the caller writes their own. */
@Directive({
  selector: "[uioDrawerTitle]",
  standalone: true,
  host: {
    class: "dialog__title text-strong-heading-small",
    "[id]": "drawerContext.partId('title')",
  },
})
export class UioDrawerTitle extends UioPart {
  readonly scope = "drawer";
  readonly part = "title";
  protected readonly drawerContext = inject(UioDrawerContext);
  constructor() {
    super();
    this.drawerContext.registerTitle();
  }
}

/** Describes the drawer. Absent, and the panel carries no `aria-describedby`. */
@Directive({
  selector: "[uioDrawerDescription]",
  standalone: true,
  host: {
    class: "dialog__description text-default-body-medium",
    "[id]": "drawerContext.partId('description')",
  },
})
export class UioDrawerDescription extends UioPart {
  readonly scope = "drawer";
  readonly part = "description";
  protected readonly drawerContext = inject(UioDrawerContext);
  constructor() {
    super();
    this.drawerContext.registerDescription();
  }
}

/** The action row. Its buttons fill the row, the reachable ones on a phone. Not an Ark part. */
@Directive({
  selector: "[uioDrawerFooter]",
  standalone: true,
  host: { class: "dialog__footer drawer__footer" },
})
export class UioDrawerFooter {}

/** Closes the drawer from inside it. No class of its own, as React's `DrawerClose`. */
@Directive({
  selector: "button[uioDrawerClose]",
  standalone: true,
  host: {
    type: "button",
    "[id]": "drawer.drawerContext.partId('close-trigger')",
    "(click)": "drawer.requestClose()",
  },
})
export class UioDrawerClose extends UioPart {
  readonly scope = "drawer";
  readonly part = "close-trigger";
  protected readonly drawer = inject(UioDrawer);
}
