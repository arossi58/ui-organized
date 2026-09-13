import { Overlay } from "@angular/cdk/overlay";
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
import { UioPart, stateFlag } from "../part.js";
import { HostPresence } from "../host-presence.js";
import { AnchoredSurface } from "../overlay/anchored.js";
import { anchoredPositions, type OverlayAlign, type OverlaySide } from "../overlay/anchor.js";
import { pushLayer, removeLayer, type DismissibleLayer } from "../overlay/dismiss.js";
import { flushNow } from "../overlay/flush.js";
import { focusInside, restoreFocus } from "../overlay/focus.js";
import { applySurfaceStacking, raiseSurface, setSurfaceInteractive } from "../overlay/surface.js";
import { UioPopoverContext } from "./popover-context.js";

/**
 * A small anchored surface with its own heading, body and dismiss.
 *
 * ```html
 * <button uioButton uioPopoverTrigger [popover]="details">Details</button>
 * <uio-popover #details="uioPopover" side="right" align="start">
 *   <div uioPopoverTitle>Shipping</div>
 *   <div uioPopoverDescription>Arrives in 2 days.</div>
 *   <button uioButton uioPopoverClose>Got it</button>
 * </uio-popover>
 * ```
 *
 * Everything structural is the Dialog's story told again — the host element is
 * removed because Ark's root renders nothing, the surface is attached on init
 * because Ark keeps its portal rendered, and a user interaction flushes change
 * detection so the trigger and the popup never disagree. What is new here is
 * *placement*: `side`/`align` are the facade's vocabulary, the CDK's is four
 * corner keywords, and Ark reports the resolved answer as `data-placement`. See
 * `overlay/anchored.ts` for how the three are reconciled.
 *
 * ── One difference from the Dialog, and it is not cosmetic ──────────────────
 *
 * A closed popover really is hidden. `.popover__popup` declares no `display`, so
 * the `hidden` attribute does what it says — where `.dialog__popup` sets
 * `display: flex` and stays in the accessibility tree even when closed. That is
 * the shared stylesheet's behaviour rather than this port's, and it is why the
 * parity gate can assert this one is invisible and can only compare the other.
 */
@Component({
  selector: "uio-popover",
  standalone: true,
  exportAs: "uioPopover",
  providers: [UioPopoverContext, HostPresence],
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
        class="popover__positioner"
        data-scope="popover"
        data-part="positioner"
        [id]="popoverContext.partId('popper')"
      >
        <div
          class="popover__popup text-default-body-medium"
          data-scope="popover"
          data-part="content"
          role="dialog"
          tabindex="-1"
          [id]="popoverContext.partId('content')"
          [attr.data-state]="state()"
          [attr.data-expanded]="flag(open())"
          [attr.hidden]="open() ? null : ''"
          [attr.data-placement]="anchored.placement()"
          [attr.data-side]="anchored.side()"
          [attr.aria-labelledby]="popoverContext.labelledBy()"
          [attr.aria-describedby]="popoverContext.describedBy()"
        >
          <ng-content />
        </div>
      </div>
    </ng-template>
  `,
})
export class UioPopover implements OnInit, OnDestroy {
  readonly open = model(false);
  readonly side = input<OverlaySide>("bottom");
  readonly align = input<OverlayAlign>("center");
  readonly sideOffset = input(8);
  readonly alignOffset = input(0);
  /** Traps Tab inside the popover and blocks the page behind it. */
  readonly modal = input(false, { transform: booleanAttribute });

  readonly popoverContext = inject(UioPopoverContext);
  readonly anchored = new AnchoredSurface(inject(Overlay));

  protected readonly state = computed(() => (this.open() ? "open" : "closed"));
  protected readonly flag = stateFlag;

  /** See `UioDialog` — decorator queries are the spelling both compilers register. */
  @ViewChild("surface", { static: true }) private surface!: TemplateRef<unknown>;
  @ViewChild("anchor", { read: ViewContainerRef, static: true }) private anchor!: ViewContainerRef;

  private readonly document = inject(DOCUMENT);
  private readonly presence = inject(HostPresence);
  private readonly focusTraps = inject(FocusTrapFactory);
  private readonly appRef = inject(ApplicationRef);

  private surfaceView?: EmbeddedViewRef<unknown>;
  private trap?: FocusTrap;
  private opener: HTMLElement | null = null;
  private applied = false;

  private readonly layer: DismissibleLayer = {
    surface: () => this.contentElement(),
    trigger: () => this.opener,
    dismiss: () => this.hide(),
  };

  constructor() {
    effect(() => {
      this.open();
      untracked(() => this.sync());
    });
    // Placement is configuration rather than state: recomputing the candidate
    // list is all that is needed, and the CDK re-measures on the next open.
    effect(() => {
      const candidates = anchoredPositions(
        this.side(),
        this.align(),
        this.sideOffset(),
        this.alignOffset(),
      );
      untracked(() => this.anchored.setCandidates(candidates));
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
    const anchor = this.opener ?? this.document.body;
    const ref = this.anchored.create(
      anchor,
      anchoredPositions(this.side(), this.align(), this.sideOffset(), this.alignOffset()),
    );
    this.surfaceView = ref.attach(
      new TemplatePortal(this.surface, this.anchor),
    ) as EmbeddedViewRef<unknown>;
    applySurfaceStacking(ref);
    setSurfaceInteractive(ref, false);
    this.presence.hide();
  }

  ngOnDestroy(): void {
    removeLayer(this.layer);
    this.trap?.destroy();
    this.anchored.dispose();
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
   * Told by the trigger, before the state flips.
   *
   * It is both the element focus returns to and the element the surface is
   * anchored against, so a popover whose trigger registers after this component
   * initialises re-anchors rather than staying pinned to `document.body`.
   */
  rememberOpener(element: HTMLElement | null): void {
    this.opener = element;
    if (element) this.anchored.setAnchor(element);
  }

  private contentElement(): HTMLElement | null {
    return (
      this.anchored.overlayRef?.overlayElement.querySelector<HTMLElement>('[data-part="content"]') ??
      null
    );
  }

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
    const ref = this.anchored.overlayRef;
    if (!ref) return;
    this.surfaceView?.detectChanges();
    // Measured only now: while it was closed the popup was `hidden`, had no
    // size, and the CDK placed a zero-height box.
    this.anchored.reposition();
    raiseSurface(ref);
    setSurfaceInteractive(ref, true);

    const content = this.contentElement();
    if (this.modal() && content?.parentElement) {
      // On the positioner, so the trap's two focus anchors land outside the
      // popup rather than inside the subtree the parity gate compares.
      this.trap = this.focusTraps.create(content.parentElement);
    }
    if (content) focusInside(content);
    pushLayer(this.document, this.layer);
  }

  private applyClose(): void {
    this.applied = false;
    removeLayer(this.layer);
    this.trap?.destroy();
    this.trap = undefined;
    this.surfaceView?.detectChanges();
    const ref = this.anchored.overlayRef;
    if (ref) setSurfaceInteractive(ref, false);
    restoreFocus(this.opener);
  }
}

/** Opens and closes a popover, and reports its state the way Ark's trigger does. */
@Directive({
  selector: "button[uioPopoverTrigger]",
  standalone: true,
  host: {
    type: "button",
    "aria-haspopup": "dialog",
    "[id]": "popover ? popover.popoverContext.partId('trigger') : null",
    "[attr.data-ownedby]": "popover ? popover.popoverContext.machineId : null",
    "[attr.aria-expanded]": "isOpen() ? 'true' : 'false'",
    "[attr.aria-controls]": "isOpen() ? popover!.popoverContext.partId('content') : null",
    // Sticky, exactly as Ark leaves them: a trigger that has opened once keeps
    // reporting where its surface went.
    "[attr.data-placement]": "popover?.anchored?.placement() ?? null",
    "[attr.data-side]": "popover?.anchored?.side() ?? null",
    "(click)": "activate()",
  },
})
export class UioPopoverTrigger extends UioPart {
  readonly scope = "popover";
  readonly part = "trigger";

  /** A decorator input — see `UioDialogTrigger` for why this one is not `input()`. */
  @Input("popover") popover?: UioPopover;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly isOpen: Signal<boolean> = computed(() => !!this.popover?.open());
  override readonly state = computed(() => (this.isOpen() ? "open" : "closed"));

  ngOnInit(): void {
    // Before the surface's own `ngAfterViewInit`, which is where the overlay is
    // anchored — so the popover is pinned to this element rather than to the
    // document body.
    this.popover?.rememberOpener(this.host.nativeElement);
  }

  protected activate(): void {
    const popover = this.popover;
    if (!popover) return;
    popover.rememberOpener(this.host.nativeElement);
    popover.toggle();
  }
}

/** Names the popover. Without one its `role="dialog"` has no accessible name. */
@Directive({
  selector: "[uioPopoverTitle]",
  standalone: true,
  host: {
    class: "popover__title text-strong-body-large",
    "[id]": "popoverContext.partId('title')",
  },
})
export class UioPopoverTitle extends UioPart {
  readonly scope = "popover";
  readonly part = "title";
  protected readonly popoverContext = inject(UioPopoverContext);
  constructor() {
    super();
    this.popoverContext.registerTitle();
  }
}

/** Supporting copy under the title; becomes the popover's description. */
@Directive({
  selector: "[uioPopoverDescription]",
  standalone: true,
  host: {
    class: "popover__description text-default-body-medium",
    "[id]": "popoverContext.partId('desc')",
  },
})
export class UioPopoverDescription extends UioPart {
  readonly scope = "popover";
  readonly part = "description";
  protected readonly popoverContext = inject(UioPopoverContext);
  constructor() {
    super();
    this.popoverContext.registerDescription();
  }
}

/**
 * Closes the popover from inside it.
 *
 * `aria-label="close"` in Ark's own lower-case spelling, because Ark's
 * CloseTrigger supplies it and the popover facade does not override it — unlike
 * the Dialog's, which does and is therefore capitalised. Reproduced rather than
 * tidied: the two libraries render the same element.
 */
@Directive({
  selector: "button[uioPopoverClose]",
  standalone: true,
  host: {
    type: "button",
    "aria-label": "close",
    "[id]": "popover.popoverContext.partId('close')",
    "(click)": "popover.hide()",
  },
})
export class UioPopoverClose extends UioPart {
  readonly scope = "popover";
  readonly part = "close-trigger";
  protected readonly popover = inject(UioPopover);
}
