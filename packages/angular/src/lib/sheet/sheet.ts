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
import { sheetStyles, type SheetVariants } from "@ui-organized/core";
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

export type SheetSide = NonNullable<SheetVariants["side"]>;
export type SheetSize = NonNullable<SheetVariants["size"]>;

/**
 * A panel that slides in from an edge of the viewport.
 *
 * ```html
 * <button uioButton uioSheetTrigger [sheet]="filters">Filters</button>
 * <uio-sheet #filters="uioSheet" side="left" size="lg">
 *   <h2 uioSheetTitle>Filters</h2>
 *   <div uioSheetDescription>Narrow the results.</div>
 *   <div uioSheetFooter><button uioSheetClose>Done</button></div>
 * </uio-sheet>
 * ```
 *
 * ── What makes it a Sheet rather than a Dialog ──────────────────────────────
 *
 * The machine: none of it. Ark builds a Sheet out of the same Dialog primitive,
 * so the scope, the backdrop, the ids and the whole focus and dismissal story
 * are the Dialog's — which is why the parts below share `UioDialogContext` and
 * emit `data-scope="dialog"`. What is new is the *positioning*, and it happens
 * entirely in CSS: `.sheet__positioner` is `display: contents` and the panel
 * pins itself to an edge with `inset`. There is no centring layer to fight, and
 * the backdrop alone owns outside-click.
 *
 * That is why `side` and `size` are inputs on this component and not on some
 * content part: they are two class names on the popup, chosen by `sheetStyles`.
 *
 * The structural notes — why the host element disappears, why the surface is
 * attached before it is opened, why a user interaction flushes change detection
 * — are written up once in `UioDialog` and are the same here.
 */
@Component({
  selector: "uio-sheet",
  standalone: true,
  exportAs: "uioSheet",
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
      <!--
        "display: contents", so unlike the Dialog's this positioner is not a
        full-viewport layer over the page — but the CDK pane around it still is,
        which is why setSurfaceInteractive is called on close exactly as it is
        for a Dialog.
      -->
      <div
        class="dialog__positioner sheet__positioner"
        data-scope="dialog"
        data-part="positioner"
        [id]="dialogContext.partId('positioner')"
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
          role="dialog"
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
export class UioSheet implements OnInit, OnDestroy {
  readonly open = model(false);
  /** The edge the panel slides in from. */
  readonly side = input<SheetSide>("right");
  /** Width for a left/right sheet, height for a top/bottom one. */
  readonly size = input<SheetSize>("md");
  /** On by default: a sheet is a place, and a place needs a way out. */
  readonly showClose = input(true, { transform: booleanAttribute });
  readonly modal = input(true, { transform: booleanAttribute });

  readonly dialogContext = inject(UioDialogContext);
  protected readonly state = computed(() => (this.open() ? "open" : "closed"));
  protected readonly popupClass = computed(() =>
    sheetStyles({ side: this.side(), size: this.size() }),
  );
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
     * A non-modal sheet is a panel beside the page rather than in front of it,
     * so a click on the page is work rather than a dismissal — which is zag's
     * `closeOnInteractOutside: modal && !alertDialog`. Escape closes either way.
     */
    dismiss: (reason) => {
      if (reason === "escape" || this.modal()) this.hide();
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
    // The browser's top layer stacks by show order, and this surface has been
    // showing since the page loaded. See `raiseSurface`.
    raiseSurface(ref);
    setSurfaceInteractive(ref, true);

    const positioner = this.positionerElement();
    const content = this.contentElement();
    if (this.modal() && positioner) {
      this.restoreAria = hideOthersFrom(positioner);
      this.scrollBlock?.enable();
      /**
       * Only when modal, which is zag's `trapFocus: modal`. A non-modal sheet
       * is meant to be worked *beside*: trapping Tab inside it would make the
       * page it sits next to unreachable by keyboard while leaving it perfectly
       * usable with a mouse.
       *
       * The trap goes on the positioner, not the popup: its two focus anchors
       * are inserted as *siblings* of whatever it guards, and siblings of the
       * popup would be inside a region the parity gate compares.
       */
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

/** Opens the sheet, and reports its state the way Ark's dialog trigger does. */
@Directive({
  selector: "button[uioSheetTrigger]",
  standalone: true,
  host: {
    type: "button",
    "aria-haspopup": "dialog",
    "[id]": "sheet ? sheet.dialogContext.partId('trigger') : null",
    "[attr.data-ownedby]": "sheet ? sheet.dialogContext.machineId : null",
    "[attr.aria-expanded]": "isOpen() ? 'true' : 'false'",
    "[attr.aria-controls]": "isOpen() ? sheet!.dialogContext.partId('content') : null",
    "(click)": "activate()",
  },
})
export class UioSheetTrigger extends UioPart {
  readonly scope = "dialog";
  readonly part = "trigger";

  /** A decorator input — see `UioDialogTrigger` for why this one is not `input()`. */
  @Input("sheet") sheet?: UioSheet;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly isOpen: Signal<boolean> = computed(() => !!this.sheet?.open());
  override readonly state = computed(() => (this.isOpen() ? "open" : "closed"));

  protected activate(): void {
    const sheet = this.sheet;
    if (!sheet) return;
    // Remembered *before* the state flips, so the element focus returns to is
    // the one the user actually pressed rather than whatever has it by then.
    sheet.rememberOpener(this.host.nativeElement);
    sheet.toggle();
  }
}

/** Names the sheet. Ark's Title is an `h2`; the caller writes their own. */
@Directive({
  selector: "[uioSheetTitle]",
  standalone: true,
  host: {
    class: "dialog__title text-strong-heading-small",
    "[id]": "dialogContext.partId('title')",
  },
})
export class UioSheetTitle extends UioPart {
  readonly scope = "dialog";
  readonly part = "title";
  protected readonly dialogContext = inject(UioDialogContext);
  constructor() {
    super();
    this.dialogContext.registerTitle();
  }
}

/** Describes the sheet. Absent, and the popup carries no `aria-describedby`. */
@Directive({
  selector: "[uioSheetDescription]",
  standalone: true,
  host: {
    class: "dialog__description text-default-body-medium",
    "[id]": "dialogContext.partId('description')",
  },
})
export class UioSheetDescription extends UioPart {
  readonly scope = "dialog";
  readonly part = "description";
  protected readonly dialogContext = inject(UioDialogContext);
  constructor() {
    super();
    this.dialogContext.registerDescription();
  }
}

/**
 * The action row, pinned to the bottom of the panel.
 *
 * Two classes: `.dialog__footer` for the gap and the alignment, and
 * `.sheet__footer` for `margin-top: auto`, which is what pushes it to the
 * bottom of a full-height panel rather than leaving it under the body copy.
 * Not an Ark part in any library — the facade adds it.
 */
@Directive({
  selector: "[uioSheetFooter]",
  standalone: true,
  host: { class: "dialog__footer sheet__footer" },
})
export class UioSheetFooter {}

/**
 * Closes the sheet from inside it.
 *
 * No class of its own, matching React's `SheetClose`: the caller styles it —
 * usually with `uioButton` — and a footer of two of them splits the row because
 * `.sheet__footer > *` is `flex: 1` on a narrow sheet.
 */
@Directive({
  selector: "button[uioSheetClose]",
  standalone: true,
  host: {
    type: "button",
    "[id]": "sheet.dialogContext.partId('close')",
    "(click)": "sheet.hide()",
  },
})
export class UioSheetClose extends UioPart {
  readonly scope = "dialog";
  readonly part = "close-trigger";
  protected readonly sheet = inject(UioSheet);
}
