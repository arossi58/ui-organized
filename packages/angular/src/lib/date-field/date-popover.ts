import { Overlay } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
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
  computed,
  effect,
  inject,
  input,
  model,
  untracked,
  type Signal,
} from "@angular/core";
import { HostPresence } from "../host-presence.js";
import { AnchoredSurface } from "../overlay/anchored.js";
import { anchoredPositions } from "../overlay/anchor.js";
import { pushLayer, removeLayer, type DismissibleLayer } from "../overlay/dismiss.js";
import { flushNow } from "../overlay/flush.js";
import { focusInside, restoreFocus } from "../overlay/focus.js";
import { applySurfaceStacking, raiseSurface, setSurfaceInteractive } from "../overlay/surface.js";
import { UioPart, stateFlag } from "../part.js";
import { UioPopoverContext } from "../popover/popover-context.js";

/** Ark's Popover gutter for the date fields — the popup clears the field by 6px. */
const DATE_POPOVER_GUTTER = 6;

/**
 * The calendar surface the date fields share.
 *
 * Internal, and deliberately not `UioPopover`: the two render the same Ark
 * popover parts but not the same classes — `.date-popover` declares no
 * `display`, `.popover__popup` does — and the class names are baked into
 * `UioPopover`'s template. Everything else here is that component's story told
 * again, so read it for why the surface is attached on init, why the view
 * container is one level down, and why a user interaction flushes.
 *
 * Two things are its own:
 *
 *  - It is anchored to the **field row**, not to the small calendar button, so
 *    the popup lines up with the control rather than with a 32px icon. The field
 *    tells it which element that is.
 *  - It opens onto the calendar's active day rather than onto the first
 *    focusable thing in it, which would be the "Previous month" button. The
 *    field supplies {@link initialFocus} for the same reason React passes
 *    `initialFocusEl`.
 */
@Component({
  selector: "uio-date-popover",
  standalone: true,
  exportAs: "uioDatePopover",
  providers: [UioPopoverContext, HostPresence],
  template: `
    <!-- See UioPopover: a view container anchored on the host is re-homed by projection. -->
    <ng-container #anchor />
    <ng-template #surface>
      <div
        class="date-popover-positioner"
        data-scope="popover"
        data-part="positioner"
        [id]="popoverContext.partId('popper')"
      >
        <div
          class="date-popover"
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
          [attr.aria-label]="label()"
        >
          <ng-content />
        </div>
      </div>
    </ng-template>
  `,
})
export class UioDatePopover implements OnInit, OnDestroy {
  readonly open = model(false);
  /**
   * The popup's accessible name.
   *
   * `role="dialog"` needs one, and the calendar inside is not it — that is the
   * content. The trigger's own phrase is reused, as in the other three.
   */
  readonly label = input<string>("");

  /** Where focus lands when the popup opens. Replaced by the owning field. */
  initialFocus: () => HTMLElement | null = () => null;

  readonly popoverContext = inject(UioPopoverContext);
  readonly anchored = new AnchoredSurface(inject(Overlay));

  protected readonly state = computed(() => (this.open() ? "open" : "closed"));
  protected readonly flag = stateFlag;

  /** Decorator queries — the spelling both compilers register. See `UioDialog`. */
  @ViewChild("surface", { static: true }) private surface!: TemplateRef<unknown>;
  @ViewChild("anchor", { read: ViewContainerRef, static: true }) private anchor!: ViewContainerRef;

  private readonly document = inject(DOCUMENT);
  private readonly presence = inject(HostPresence);
  private readonly appRef = inject(ApplicationRef);

  private surfaceView?: EmbeddedViewRef<unknown>;
  private anchorElement: HTMLElement | null = null;
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
  }

  ngOnInit(): void {
    const ref = this.anchored.create(
      this.anchorElement ?? this.document.body,
      anchoredPositions("bottom", "start", DATE_POPOVER_GUTTER),
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
   * The row the popup is measured against, and the button focus returns to.
   *
   * Two elements rather than one, unlike `UioPopover`: the trigger is a 32px
   * icon inside a full-width field, and a popup aligned to it would hang off the
   * left of the control it belongs to.
   */
  anchorTo(row: HTMLElement | null, opener: HTMLElement | null): void {
    if (opener) this.opener = opener;
    if (row) {
      this.anchorElement = row;
      this.anchored.setAnchor(row);
    }
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
    const active = this.initialFocus();
    if (active) active.focus({ preventScroll: true });
    else if (content) focusInside(content);
    pushLayer(this.document, this.layer);
  }

  private applyClose(): void {
    this.applied = false;
    removeLayer(this.layer);
    this.surfaceView?.detectChanges();
    const ref = this.anchored.overlayRef;
    if (ref) setSurfaceInteractive(ref, false);
    restoreFocus(this.opener);
  }
}

/**
 * Opens and closes a date popover, and reports its state the way Ark's trigger
 * does.
 *
 * A separate directive rather than `UioPopoverTrigger` only because that one is
 * typed to `UioPopover`. The rendered contract is identical, down to
 * `aria-controls` being dropped while the popup is closed — a reference to
 * unmounted content costs the button its accessible name.
 */
@Directive({
  selector: "button[uioDatePopoverTrigger]",
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
export class UioDatePopoverTrigger extends UioPart {
  readonly scope = "popover";
  readonly part = "trigger";

  /** A decorator input — see `UioDialogTrigger` for why this one is not `input()`. */
  @Input("datePopover") popover?: UioDatePopover;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly isOpen: Signal<boolean> = computed(() => !!this.popover?.open());
  override readonly state = computed(() => (this.isOpen() ? "open" : "closed"));

  ngOnInit(): void {
    // Before the surface's own `ngOnInit`, so focus returns here rather than to
    // the document body. The row it is anchored *to* is supplied by the field.
    this.popover?.anchorTo(null, this.host.nativeElement);
  }

  protected activate(): void {
    this.popover?.anchorTo(null, this.host.nativeElement);
    this.popover?.toggle();
  }
}
