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
  untracked,
  type Signal,
} from "@angular/core";
import { dialogStyles, type DialogVariants } from "@ui-organized/core";
import { UioPart } from "../part.js";
import { HostPresence } from "../host-presence.js";
import { UioIcon } from "../icons/icon.js";
import { hideOthersFrom } from "../overlay/aria-hidden.js";
import { pushLayer, removeLayer, type DismissibleLayer } from "../overlay/dismiss.js";
import { flushNow } from "../overlay/flush.js";
import { focusInside, restoreFocus } from "../overlay/focus.js";
import { applySurfaceStacking, createSurface, raiseSurface, setSurfaceInteractive } from "../overlay/surface.js";
import { UioDialogContext } from "./dialog-context.js";

export type DialogSize = NonNullable<DialogVariants["size"]>;

/**
 * A modal surface that takes the page over until it is answered.
 *
 * ```html
 * <button uioButton uioDialogTrigger [dialog]="confirm">Delete</button>
 * <uio-dialog #confirm="uioDialog">
 *   <h2 uioDialogTitle>Delete this?</h2>
 *   <div uioDialogDescription>This cannot be undone.</div>
 *   <div uioDialogFooter>
 *     <button uioButton uioDialogClose>Cancel</button>
 *   </div>
 * </uio-dialog>
 * ```
 *
 * ── Why the element disappears ──────────────────────────────────────────────
 *
 * Ark's Dialog root renders no element at all — a React dialog leaves nothing
 * behind where it was written, and everything it does render is portalled. An
 * Angular component cannot decline to render the element the caller wrote, so
 * `HostPresence` takes `<uio-dialog>` out of the DOM once its surface has been
 * handed to the overlay. Without that, every dialog on a page would leave an
 * empty element in the middle of its parent's layout.
 *
 * ── Why the surface is attached before it is opened ─────────────────────────
 *
 * The CDK's habit is to attach an overlay when it opens and detach it when it
 * closes. This one attaches on init and stays attached, because Ark does: a
 * React dialog's backdrop and popup are in the document from first render,
 * carrying `data-state="closed"` and `hidden`. Two things depend on it. The
 * shared stylesheet's exit transition (`opacity 150ms` on `[data-state="closed"]`)
 * needs an element to still be there to fade, and `hideOthersFrom` marks the
 * *other* surfaces on the page — a select declared inside this dialog has to
 * already exist when the dialog opens, or it is never marked and reaches a
 * screen reader through a modal that is supposed to have hidden it.
 *
 * It also means a closed dialog's full-viewport positioner is laid out over the
 * page, which is why `setSurfaceInteractive` exists.
 */
@Component({
  selector: "uio-dialog",
  standalone: true,
  exportAs: "uioDialog",
  imports: [UioIcon],
  providers: [UioDialogContext, HostPresence],
  template: `
    <!--
      The portal's view container is anchored *here*, inside the component's
      own template, and never on the host element.

      A view container anchored on the host is re-homed when the host is
      projected somewhere else — Angular's projection re-appends a projected
      node's container views along with it — and the surface of a popover
      declared inside a dialog was dragged back out of its own overlay pane and
      into the dialog's the moment the dialog attached. The two surfaces then
      shared a pane, so they shared a stacking level, and the popover-inside-a-
      dialog case this port exists to get right was silently broken. A
      container one level down is invisible to projection.
    -->
    <ng-container #anchor />
    <ng-template #surface>
      <div
        class="dialog__backdrop"
        data-scope="dialog"
        data-part="backdrop"
        [id]="dialogContext.partId('backdrop')"
        [attr.data-state]="state()"
        [attr.hidden]="open() ? null : ''"
      ></div>
      <!--
        The positioner centres the popup and, while the dialog is closed, has to
        stop taking clicks: it is a fixed, full-viewport layer and it is still
        there. Zag writes the same thing inline, for the same reason.
    -->
      <div
        class="dialog__positioner"
        data-scope="dialog"
        data-part="positioner"
        [id]="dialogContext.partId('positioner')"
        [style.pointer-events]="open() ? null : 'none'"
      >
        <div
          [class]="popupClass()"
          data-scope="dialog"
          data-part="content"
          role="dialog"
          tabindex="-1"
          [id]="dialogContext.partId('content')"
          [attr.data-state]="state()"
          [attr.hidden]="open() ? null : ''"
          [attr.aria-modal]="modal() ? 'true' : null"
          [attr.aria-labelledby]="dialogContext.labelledBy()"
          [attr.aria-describedby]="dialogContext.describedBy()"
        >
          @if (showClose()) {
            <button
              class="dialog__close"
              data-scope="dialog"
              data-part="close-trigger"
              type="button"
              aria-label="Close"
              [id]="dialogContext.partId('close')"
              (click)="hide()"
            >
              <span uioIcon name="close" [size]="CLOSE_ICON_SIZE"></span>
            </button>
          }
          <ng-content />
        </div>
      </div>
    </ng-template>
  `,
})
export class UioDialog implements OnInit, OnDestroy {
  readonly open = model(false);
  readonly size = input<DialogSize>("md");
  readonly showClose = input(true, { transform: booleanAttribute });
  readonly modal = input(true, { transform: booleanAttribute });

  readonly dialogContext = inject(UioDialogContext);
  protected readonly state = computed(() => (this.open() ? "open" : "closed"));
  protected readonly popupClass = computed(() => dialogStyles({ size: this.size() }));
  protected readonly CLOSE_ICON_SIZE = 20;

  /**
   * `@ViewChild` rather than `viewChild()`: this package's own specs are
   * JIT-compiled, and JIT never registers initializer-based queries — the read
   * resolves to nothing and NG0951 is thrown on the first access. ng-packagr
   * compiles the shipped library ahead of time, where both work; the decorator
   * is the spelling that works in both.
   */
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
  /** What the DOM has actually been told, so the effect can see a transition. */
  private applied = false;

  private readonly layer: DismissibleLayer = {
    surface: () => this.contentElement(),
    trigger: () => this.opener,
    dismiss: () => this.hide(),
  };

  constructor() {
    /**
     * Catches `[open]="editing()"` — a caller driving the dialog declaratively,
     * where nothing called `show()`. The imperative path does not wait for this:
     * see {@link sync}.
     *
     * `untracked` because the work below reads signals that have no business
     * becoming dependencies of this effect, and because it runs `detectChanges()`
     * on another view.
     */
    effect(() => {
      this.open();
      untracked(() => this.sync());
    });
  }

  /**
   * `ngOnInit`, not `ngAfterViewInit`, and the queries are static because of it.
   *
   * `ngAfterViewInit` runs bottom-up: a select declared inside a dialog attaches
   * its overlay *before* the dialog attaches its own, so the CDK's single
   * container ends up holding the inner surface first. The other three libraries
   * portal each surface straight into `document.body`, where a dialog's backdrop
   * and popup land before anything declared inside them — and anything reading
   * the document in order sees a different tree for the same page.
   *
   * It is also the right order on its own terms: an inner surface should not
   * exist before the surface that contains it, because `hideOthersFrom` and the
   * browser's top layer both work from what is already there.
   */
  ngOnInit(): void {
    this.overlayRef = createSurface(this.overlay, {
      // Not `scrollStrategies.block()`: a scroll strategy is enabled when the
      // overlay attaches, and this one attaches while closed — the page would be
      // unscrollable from the moment a dialog was declared. Blocking is done by
      // hand in `applyOpen` instead.
      positionStrategy: this.overlay.position().global(),
      scrollStrategy: this.overlay.scrollStrategies.noop(),
    });
    this.scrollBlock = this.overlay.scrollStrategies.block();
    this.surfaceView = this.overlayRef.attach(
      new TemplatePortal(this.surface, this.anchor),
    ) as EmbeddedViewRef<unknown>;
    applySurfaceStacking(this.overlayRef);
    setSurfaceInteractive(this.overlayRef, false);
    // After the portal, never before: the portal creates its view *next to* this
    // element before moving it into the pane, so removing the element first
    // leaves the view with nowhere to be born.
    this.presence.hide();
  }

  ngOnDestroy(): void {
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

  /**
   * Two halves, on purpose, and the split is the whole timing story.
   *
   * **Dismissibility is registered now.** The effect below runs on the next
   * change-detection cycle, and the surface's own bindings run in that same
   * cycle — so between the click that opened the dialog and the effect there is
   * a window where the popup already reads `data-state="open"` and nothing has
   * registered it as dismissible. An Escape in that window is silently lost.
   * The stack is not DOM, so registering it here costs nothing.
   *
   * **Everything that writes to the DOM waits for the flush.** Focus, the
   * aria-hidden marks and the scroll block land in the effect, which runs after
   * this component's *parent* view has been refreshed — that is, after the
   * trigger's own `aria-expanded` and `data-state` have been updated. Doing it
   * before would hide the page from assistive technology while the button that
   * opened it still claimed to be closed. `flushNow` makes that whole sequence
   * happen inside the call, the way React handles a discrete event.
   */
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

  /** Remembered on open so focus can be given back to it on close. */
  rememberOpener(element: HTMLElement | null): void {
    this.opener = element;
  }

  private contentElement(): HTMLElement | null {
    return this.overlayRef?.overlayElement.querySelector<HTMLElement>('[data-part="content"]') ?? null;
  }
  private positionerElement(): HTMLElement | null {
    return (
      this.overlayRef?.overlayElement.querySelector<HTMLElement>('[data-part="positioner"]') ?? null
    );
  }

  private applyOpen(): void {
    this.applied = true;
    const ref = this.overlayRef;
    if (!ref) return;
    this.surfaceView?.detectChanges();
    // The browser's top layer stacks by show order, and this surface has been
    // showing since the page loaded. See `raiseSurface`.
    raiseSurface(ref);
    setSurfaceInteractive(ref, true);

    const positioner = this.positionerElement();
    const content = this.contentElement();
    if (this.modal() && positioner) {
      this.restoreAria = hideOthersFrom(positioner);
      this.scrollBlock?.enable();
    }
    if (positioner) {
      // The trap goes on the positioner, not the popup: its two focus anchors
      // are inserted as *siblings* of whatever it guards, and siblings of the
      // popup would be inside the positioner — which is a compared region.
      this.trap = this.focusTraps.create(positioner);
    }
    if (content) focusInside(content);
    pushLayer(this.document, this.layer);
  }

  private applyClose(): void {
    this.applied = false;
    removeLayer(this.layer);
    this.restoreAria?.();
    this.restoreAria = undefined;
    this.trap?.destroy();
    this.trap = undefined;
    this.scrollBlock?.disable();
    this.surfaceView?.detectChanges();
    if (this.overlayRef) setSurfaceInteractive(this.overlayRef, false);
    restoreFocus(this.opener);
  }
}

/**
 * Opens a dialog, and reports its state the way Ark's trigger does.
 *
 * `aria-controls` is dropped while the dialog is closed even though the content
 * is still in the document — Ark drops it because *its* content is unmounted,
 * and `popupControls` in `@ui-organized/core` explains why a dangling reference
 * is worse than no reference. Keeping the two libraries' triggers identical
 * matters more than the fact that this one could get away with it.
 */
@Directive({
  selector: "button[uioDialogTrigger]",
  standalone: true,
  host: {
    type: "button",
    "aria-haspopup": "dialog",
    "[id]": "dialog ? dialog.dialogContext.partId('trigger') : null",
    "[attr.data-ownedby]": "dialog ? dialog.dialogContext.machineId : null",
    "[attr.aria-expanded]": "isOpen() ? 'true' : 'false'",
    "[attr.aria-controls]": "isOpen() ? dialog!.dialogContext.partId('content') : null",
    "(click)": "activate()",
  },
})
export class UioDialogTrigger extends UioPart {
  readonly scope = "dialog";
  readonly part = "trigger";

  /**
   * A decorator input, deliberately, where the rest of this library writes
   * `input()`.
   *
   * JIT never registers an initializer-based input, and this package's own specs
   * are JIT-compiled — so with `input()` no spec could ever wire a trigger to a
   * dialog, and the two behaviours worth testing here (focus returning to the
   * opener, and the trigger reporting the dialog's state) would have no way to be
   * exercised. Decorator inputs are registered by both compilers. Every other
   * input in this file stays on `input()`, because none of them has to be bound
   * for a spec to be meaningful.
   */
  @Input("dialog") dialog?: UioDialog;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly isOpen: Signal<boolean> = computed(() => !!this.dialog?.open());
  override readonly state = computed(() => (this.isOpen() ? "open" : "closed"));

  protected activate(): void {
    const dialog = this.dialog;
    if (!dialog) return;
    // Remembered *before* the state flips, so the element focus returns to is
    // the one the user actually pressed rather than whatever has it by then.
    dialog.rememberOpener(this.host.nativeElement);
    dialog.toggle();
  }
}

/** Names the dialog. Ark's Title is an `h2`; the caller writes their own. */
@Directive({
  selector: "[uioDialogTitle]",
  standalone: true,
  host: {
    class: "dialog__title text-strong-heading-small",
    "[id]": "dialogContext.partId('title')",
  },
})
export class UioDialogTitle extends UioPart {
  readonly scope = "dialog";
  readonly part = "title";
  protected readonly dialogContext = inject(UioDialogContext);
  constructor() {
    super();
    this.dialogContext.registerTitle();
  }
}

/** Describes the dialog. Absent, and the popup carries no `aria-describedby`. */
@Directive({
  selector: "[uioDialogDescription]",
  standalone: true,
  host: {
    class: "dialog__description text-default-body-medium",
    "[id]": "dialogContext.partId('description')",
  },
})
export class UioDialogDescription extends UioPart {
  readonly scope = "dialog";
  readonly part = "description";
  protected readonly dialogContext = inject(UioDialogContext);
  constructor() {
    super();
    this.dialogContext.registerDescription();
  }
}

/**
 * The right-aligned action row. Not an Ark part — the facade adds it, so it
 * carries a class and nothing else, in all four libraries.
 */
@Directive({
  selector: "[uioDialogFooter]",
  standalone: true,
  host: { class: "dialog__footer" },
})
export class UioDialogFooter {}

/**
 * Closes the dialog from inside it.
 *
 * No `id`, unlike the close button the dialog renders for itself: two elements
 * claiming `dialog:<machine>:close` would be a duplicate id on the page, and
 * this one is reached by content rather than by reference.
 */
@Directive({
  selector: "[uioDialogClose]",
  standalone: true,
  host: { "(click)": "dialog.hide()" },
})
export class UioDialogClose extends UioPart {
  readonly scope = "dialog";
  readonly part = "close-trigger";
  protected readonly dialog = inject(UioDialog);
}
