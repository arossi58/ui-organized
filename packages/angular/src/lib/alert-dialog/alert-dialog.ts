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
import { buttonStyles, dialogStyles, type ButtonVariants, type DialogVariants } from "@ui-organized/core";
import { UioPart } from "../part.js";
import { HostPresence } from "../host-presence.js";
import { UioIcon } from "../icons/icon.js";
import { UioDialogContext } from "../dialog/dialog-context.js";
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

export type AlertDialogSize = NonNullable<DialogVariants["size"]>;
/** The two intents a confirm action is ever given. Destructive for deletes. */
export type AlertDialogIntent = Extract<NonNullable<ButtonVariants["intent"]>, "primary" | "destructive">;

/**
 * A modal that asks a question and will not take silence for an answer.
 *
 * ```html
 * <button uioButton uioAlertDialogTrigger [alertDialog]="confirm">Delete</button>
 * <uio-alert-dialog #confirm="uioAlertDialog">
 *   <h2 uioAlertDialogTitle>Delete this?</h2>
 *   <p uioAlertDialogDescription>This cannot be undone.</p>
 *   <div uioAlertDialogFooter>
 *     <button uioAlertDialogCancel>Cancel</button>
 *     <button uioAlertDialogConfirm intent="destructive" (click)="remove()">Delete</button>
 *   </div>
 * </uio-alert-dialog>
 * ```
 *
 * ── Why this is not `UioDialog` with a different role ───────────────────────
 *
 * It renders the Dialog's chrome — same scope, same backdrop, same popup recipe,
 * same title/description/footer — and it is still a component of its own, for
 * the same reason React's is: `role="alertdialog"` changes the machine, not just
 * the attribute. Zag reads the role in `props()` and turns **outside-click
 * dismissal off** (`closeOnInteractOutside: modal && !alertDialog`), because an
 * alert is a question and a stray click is not an answer. It also aims initial
 * focus at the close trigger rather than at whatever happens to be first.
 *
 * Everything structural is the Dialog's story told again — the host element is
 * removed because Ark's root renders nothing, the surface is attached on init
 * because Ark keeps its portal rendered, and a user interaction flushes change
 * detection so the trigger and the popup never disagree. Those notes live in
 * `UioDialog`; what is written up here is only what differs.
 *
 * The parts below share `UioDialogContext`, so the ids read
 * `dialog:<machine>:title` exactly as they do in React — an AlertDialog *is* a
 * dialog machine, and giving it a scope of its own would put a `data-scope` in
 * the DOM that no stylesheet and no other library has.
 */
@Component({
  selector: "uio-alert-dialog",
  standalone: true,
  exportAs: "uioAlertDialog",
  imports: [UioIcon],
  providers: [UioDialogContext, HostPresence],
  template: `
    <!-- See UioDialog: a container anchored on the host is re-homed by projection. -->
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
      <div
        class="dialog__positioner"
        data-scope="dialog"
        data-part="positioner"
        [id]="dialogContext.partId('positioner')"
        [style.pointer-events]="open() ? null : 'none'"
      >
        <!--
          aria-modal is written as both words and never dropped: zag takes it
          straight from the prop, so a non-modal surface reports
          aria-modal="false". Dropping it is the tidier-looking of the two and
          would differ from every other library here.
        -->
        <div
          [class]="popupClass()"
          data-scope="dialog"
          data-part="content"
          role="alertdialog"
          tabindex="-1"
          [id]="dialogContext.partId('content')"
          [attr.data-state]="state()"
          [attr.hidden]="open() ? null : ''"
          [attr.aria-modal]="modal() ? 'true' : 'false'"
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
export class UioAlertDialog implements OnInit, OnDestroy {
  readonly open = model(false);
  /** Narrower than a Dialog by default: an alert is one question, not a form. */
  readonly size = input<AlertDialogSize>("sm");
  /** Off by default — an alert is answered with its actions, not dismissed. */
  readonly showClose = input(false, { transform: booleanAttribute });
  readonly modal = input(true, { transform: booleanAttribute });

  readonly dialogContext = inject(UioDialogContext);
  protected readonly state = computed(() => (this.open() ? "open" : "closed"));
  protected readonly popupClass = computed(() => dialogStyles({ size: this.size() }));
  protected readonly CLOSE_ICON_SIZE = 20;

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

  private readonly layer: DismissibleLayer = {
    surface: () => this.contentElement(),
    trigger: () => this.opener,
    /**
     * Escape only. A click outside an alert is not an answer to it, and zag
     * says so in one line — `closeOnInteractOutside: modal && !alertDialog`.
     * Registering the layer anyway is what keeps *Escape* working and, just as
     * importantly, keeps this dialog on top of the dismissal stack so a click
     * outside it cannot reach whatever is underneath.
     */
    dismiss: (reason) => {
      if (reason === "escape") this.hide();
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

  /** Remembered on open so focus can be given back to it on close. */
  rememberOpener(element: HTMLElement | null): void {
    this.opener = element;
  }

  private contentElement(): HTMLElement | null {
    return (
      this.overlayRef?.overlayElement.querySelector<HTMLElement>('[data-part="content"]') ?? null
    );
  }
  private positionerElement(): HTMLElement | null {
    return (
      this.overlayRef?.overlayElement.querySelector<HTMLElement>('[data-part="positioner"]') ?? null
    );
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
    this.surfaceView?.detectChanges();
    raiseSurface(ref);
    setSurfaceInteractive(ref, true);

    const positioner = this.positionerElement();
    const content = this.contentElement();
    if (this.modal() && positioner) {
      this.restoreAria = hideOthersFrom(positioner);
      this.scrollBlock?.enable();
    }
    if (positioner) this.trap = this.focusTraps.create(positioner);
    /**
     * The first focusable inside the popup, which for an alert is its close
     * trigger — the × when one is shown, otherwise Cancel. That is not a
     * coincidence dressed up as agreement: zag aims an alertdialog's initial
     * focus at `dialog:<machine>:close`, every close trigger in this component
     * carries that id, and the first one in the DOM is the first focusable.
     */
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
 * Opens the alert, and reports its state the way Ark's trigger does.
 *
 * `aria-controls` is dropped while the dialog is closed even though the content
 * is still in the document — see `UioDialogTrigger`, which explains why keeping
 * the two libraries' triggers identical outranks the fact that this one could
 * get away with it.
 */
@Directive({
  selector: "button[uioAlertDialogTrigger]",
  standalone: true,
  host: {
    type: "button",
    "aria-haspopup": "dialog",
    "[id]": "alertDialog ? alertDialog.dialogContext.partId('trigger') : null",
    "[attr.data-ownedby]": "alertDialog ? alertDialog.dialogContext.machineId : null",
    "[attr.aria-expanded]": "isOpen() ? 'true' : 'false'",
    "[attr.aria-controls]": "isOpen() ? alertDialog!.dialogContext.partId('content') : null",
    "(click)": "activate()",
  },
})
export class UioAlertDialogTrigger extends UioPart {
  readonly scope = "dialog";
  readonly part = "trigger";

  /** A decorator input — see `UioDialogTrigger` for why this one is not `input()`. */
  @Input("alertDialog") alertDialog?: UioAlertDialog;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly isOpen: Signal<boolean> = computed(() => !!this.alertDialog?.open());
  override readonly state = computed(() => (this.isOpen() ? "open" : "closed"));

  protected activate(): void {
    const dialog = this.alertDialog;
    if (!dialog) return;
    // Remembered *before* the state flips, so the element focus returns to is
    // the one the user actually pressed rather than whatever has it by then.
    dialog.rememberOpener(this.host.nativeElement);
    dialog.toggle();
  }
}

/** Names the alert. Ark's Title is an `h2`; the caller writes their own. */
@Directive({
  selector: "[uioAlertDialogTitle]",
  standalone: true,
  host: {
    class: "dialog__title text-strong-heading-small",
    "[id]": "dialogContext.partId('title')",
  },
})
export class UioAlertDialogTitle extends UioPart {
  readonly scope = "dialog";
  readonly part = "title";
  protected readonly dialogContext = inject(UioDialogContext);
  constructor() {
    super();
    this.dialogContext.registerTitle();
  }
}

/** Describes the consequence. Absent, and the popup carries no `aria-describedby`. */
@Directive({
  selector: "[uioAlertDialogDescription]",
  standalone: true,
  host: {
    class: "dialog__description text-default-body-medium",
    "[id]": "dialogContext.partId('description')",
  },
})
export class UioAlertDialogDescription extends UioPart {
  readonly scope = "dialog";
  readonly part = "description";
  protected readonly dialogContext = inject(UioDialogContext);
  constructor() {
    super();
    this.dialogContext.registerDescription();
  }
}

/**
 * The right-aligned action row holding Cancel and Confirm.
 *
 * Not an Ark part — the facade adds it, so it carries a class and nothing else,
 * in all four libraries.
 */
@Directive({
  selector: "[uioAlertDialogFooter]",
  standalone: true,
  host: { class: "dialog__footer" },
})
export class UioAlertDialogFooter {}

/**
 * Dismisses the alert without acting, styled as the secondary button.
 *
 * It carries `dialog:<machine>:close`, the same id the × does — which makes two
 * elements on the page with one id whenever `showClose` is on. Reproduced rather
 * than tidied: Ark stamps every CloseTrigger with the part id, the duplicate is
 * in React's own output, and the difference this gate exists to catch is the one
 * where the two libraries disagree.
 */
@Directive({
  selector: "button[uioAlertDialogCancel]",
  standalone: true,
  host: {
    type: "button",
    "[class]": "hostClass",
    "[id]": "alertDialog.dialogContext.partId('close')",
    "(click)": "alertDialog.hide()",
  },
})
export class UioAlertDialogCancel extends UioPart {
  readonly scope = "dialog";
  readonly part = "close-trigger";
  protected readonly alertDialog = inject(UioAlertDialog);
  protected readonly hostClass = buttonStyles({ intent: "secondary" });
}

/**
 * Confirms and closes. The action itself is the caller's own `(click)`, which
 * runs alongside this one — order does not matter, because closing is a signal
 * write rather than anything that unmounts the handler.
 */
@Directive({
  selector: "button[uioAlertDialogConfirm]",
  standalone: true,
  host: {
    type: "button",
    "[class]": "hostClass()",
    "[id]": "alertDialog.dialogContext.partId('close')",
    "(click)": "alertDialog.hide()",
  },
})
export class UioAlertDialogConfirm extends UioPart {
  readonly scope = "dialog";
  readonly part = "close-trigger";

  /** `destructive` for anything the user cannot undo. */
  readonly intent = input<AlertDialogIntent>("primary");

  protected readonly alertDialog = inject(UioAlertDialog);
  protected readonly hostClass = computed(() => buttonStyles({ intent: this.intent() }));
}
