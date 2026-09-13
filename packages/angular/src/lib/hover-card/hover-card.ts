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
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  untracked,
  type Signal,
} from "@angular/core";
import { UioPart } from "../part.js";
import { nextMachineId } from "../part-ids.js";
import { HostPresence } from "../host-presence.js";
import { AnchoredSurface } from "../overlay/anchored.js";
import { anchoredPositions, type OverlayAlign, type OverlaySide } from "../overlay/anchor.js";
import { pushLayer, removeLayer, type DismissibleLayer } from "../overlay/dismiss.js";
import { flushNow } from "../overlay/flush.js";
import { applySurfaceStacking, raiseSurface, setSurfaceInteractive } from "../overlay/surface.js";

/** Zag's own delays, so a card feels the same in all four libraries. */
const OPEN_DELAY = 600;
const CLOSE_DELAY = 300;

/**
 * A rich preview that appears when a control is hovered or focused.
 *
 * ```html
 * <a uioHoverCardTrigger [hoverCard]="profile" href="/u/ada">@ada</a>
 * <uio-hover-card #profile="uioHoverCard">
 *   <strong>Ada Lovelace</strong>
 *   <p>Wrote the first algorithm.</p>
 * </uio-hover-card>
 * ```
 *
 * ── Not a Tooltip, and not a Popover ────────────────────────────────────────
 *
 * It looks like both and behaves like neither, and the differences are all in
 * what the surface is *for*:
 *
 *  - A tooltip is a label. Its popup is `pointer-events: none` decoration and it
 *    carries `role="tooltip"`. A hover card holds content a user reaches into —
 *    a link, a follow button — so the popup takes the pointer, and hovering it
 *    is what keeps it open. That is why the content below has its own
 *    pointer handlers: leaving the trigger starts a close, entering the card
 *    cancels it, and without that pair the card vanishes as you travel to it.
 *  - A popover is opened by a click and holds focus. A hover card is never
 *    focused on open — Ark moves no focus into it and gives its trigger no
 *    `aria-expanded`, `aria-controls` or `aria-haspopup` at all. Reproduced
 *    exactly: a hover-triggered surface that announced itself as an expandable
 *    control would promise a keyboard user something hover cannot deliver.
 *
 * The structural notes — why the host element disappears, why the surface is
 * attached before it is opened, how a resolved placement is recovered from the
 * CDK — are written up in `UioPopover` and `overlay/anchored.ts`.
 */
@Component({
  selector: "uio-hover-card",
  standalone: true,
  exportAs: "uioHoverCard",
  providers: [HostPresence],
  template: `
    <!-- See UioPopover: a container anchored on the host is re-homed by projection. -->
    <ng-container #anchor />
    <ng-template #surface>
      <div
        class="hover-card__positioner"
        data-scope="hover-card"
        data-part="positioner"
        [id]="partId('popper')"
      >
        <div
          class="hover-card__popup text-default-body-medium"
          data-scope="hover-card"
          data-part="content"
          tabindex="-1"
          [id]="partId('content')"
          [attr.data-state]="state()"
          [attr.hidden]="open() ? null : ''"
          [attr.data-placement]="anchored.placement()"
          [attr.data-side]="anchored.side()"
          (pointerenter)="onContentEnter($event)"
          (pointerleave)="onContentLeave($event)"
        >
          <ng-content />
        </div>
      </div>
    </ng-template>
  `,
})
export class UioHoverCard implements OnInit, OnDestroy {
  readonly open = model(false);
  readonly side = input<OverlaySide>("bottom");
  readonly align = input<OverlayAlign>("center");
  readonly sideOffset = input(8);
  readonly alignOffset = input(0);
  /** Hover this long before the card appears. Zag's default is 600ms. */
  readonly openDelay = input(OPEN_DELAY);
  /** Grace period after the pointer leaves, so a card can be travelled to. */
  readonly closeDelay = input(CLOSE_DELAY);
  /** Nothing opens, and the trigger keeps its identity — see `UioTooltip`. */
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly machine = nextMachineId();
  readonly anchored = new AnchoredSurface(inject(Overlay));

  protected readonly state = computed(() => (this.open() ? "open" : "closed"));

  /** See `UioDialog` — decorator queries are the spelling both compilers register. */
  @ViewChild("surface", { static: true }) private surface!: TemplateRef<unknown>;
  @ViewChild("anchor", { read: ViewContainerRef, static: true }) private anchor!: ViewContainerRef;

  private readonly document = inject(DOCUMENT);
  private readonly presence = inject(HostPresence);
  private readonly appRef = inject(ApplicationRef);

  private surfaceView?: EmbeddedViewRef<unknown>;
  private timer?: ReturnType<typeof setTimeout>;
  private trigger: HTMLElement | null = null;
  private applied = false;

  private readonly layer: DismissibleLayer = {
    surface: () => this.contentElement(),
    trigger: () => this.trigger,
    dismiss: () => this.closeNow(),
  };

  constructor() {
    effect(() => {
      this.open();
      untracked(() => this.sync());
    });
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

  /** `ngOnInit`, not `ngAfterViewInit` — see `UioPopover` for the ordering. */
  ngOnInit(): void {
    const ref = this.anchored.create(
      this.trigger ?? this.document.body,
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
    clearTimeout(this.timer);
    removeLayer(this.layer);
    this.anchored.dispose();
  }

  partId(part: string): string {
    return `hover-card:${this.machine}:${part}`;
  }

  /** Told by the trigger, so the surface is anchored to it rather than to the body. */
  rememberTrigger(element: HTMLElement | null): void {
    this.trigger = element;
    if (element) this.anchored.setAnchor(element);
  }

  /** Hover: delayed both ways. Focus: immediate, because focus is deliberate. */
  openSoon(): void {
    this.after(this.openDelay(), true);
  }
  closeSoon(): void {
    this.after(this.closeDelay(), false);
  }
  openNow(): void {
    this.after(0, true);
  }
  closeNow(): void {
    this.after(0, false);
  }

  /**
   * A pointer moving between the trigger and the card must not close it.
   *
   * `pointerleave` on the trigger fires before `pointerenter` on the content,
   * so the travel is a close *scheduled* and then cancelled — which is what the
   * single shared timer gives for free. Without the content's own handlers the
   * card would disappear the moment the pointer left the trigger, and every
   * link inside it would be unreachable.
   */
  protected onContentEnter(event: PointerEvent): void {
    if (event.pointerType === "touch") return;
    this.after(0, true);
  }
  protected onContentLeave(event: PointerEvent): void {
    if (event.pointerType === "touch") return;
    this.closeSoon();
  }

  private after(delay: number, next: boolean): void {
    if (this.disabled()) return;
    clearTimeout(this.timer);
    if (delay === 0) {
      this.setOpen(next);
      return;
    }
    this.timer = setTimeout(() => this.setOpen(next), delay);
  }

  private setOpen(next: boolean): void {
    if (this.open() === next) return;
    this.open.set(next);
    if (next) pushLayer(this.document, this.layer);
    else removeLayer(this.layer);
    flushNow(this.appRef);
  }

  private contentElement(): HTMLElement | null {
    return (
      this.anchored.overlayRef?.overlayElement.querySelector<HTMLElement>('[data-part="content"]') ??
      null
    );
  }

  private sync(): void {
    const open = this.open();
    if (open === this.applied) return;
    this.applied = open;
    const ref = this.anchored.overlayRef;
    if (!ref) return;
    // Refreshed before it is measured: while closed the popup is `hidden` and
    // has no size, so the CDK would place a zero-height box and report a side
    // the card never used. Same reason `UioTooltip` does it.
    this.surfaceView?.detectChanges();
    if (open) {
      this.anchored.reposition();
      raiseSurface(ref);
    }
    // The popup takes the pointer only while it is open — a closed card's pane
    // would otherwise sit over the page swallowing clicks.
    setSurfaceInteractive(ref, open);
  }
}

/**
 * The control that reveals the card.
 *
 * An attribute rather than a component, so the caller's own element — very often
 * an `<a>` — is the trigger. React needs a `render` prop and a `cloneElement`
 * for the same thing.
 *
 * `focus` is listened for on the host, where it does not have to bubble.
 */
@Directive({
  selector: "[uioHoverCardTrigger]",
  standalone: true,
  host: {
    "[id]": "hoverCard ? hoverCard.partId('trigger') : null",
    "[attr.data-ownedby]": "hoverCard ? hoverCard.machine : null",
    // Sticky, exactly as Ark leaves them: a trigger that has opened once keeps
    // reporting where its card went.
    "[attr.data-placement]": "hoverCard?.anchored?.placement() ?? null",
    "[attr.data-side]": "hoverCard?.anchored?.side() ?? null",
    "(pointerenter)": "onEnter($event)",
    "(pointerleave)": "onLeave($event)",
    "(focus)": "hoverCard?.openNow()",
    "(blur)": "hoverCard?.closeNow()",
  },
})
export class UioHoverCardTrigger extends UioPart implements OnInit {
  readonly scope = "hover-card";
  readonly part = "trigger";

  /** A decorator input — see `UioDialogTrigger` for why this one is not `input()`. */
  @Input("hoverCard") hoverCard?: UioHoverCard;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly isOpen: Signal<boolean> = computed(() => !!this.hoverCard?.open());
  override readonly state = computed(() => (this.isOpen() ? "open" : "closed"));

  ngOnInit(): void {
    // Before the card's own `ngOnInit` runs its anchoring, so the surface is
    // pinned to this element rather than to the document body.
    this.hoverCard?.rememberTrigger(this.host.nativeElement);
  }

  /**
   * Touch is ignored, as it is in zag.
   *
   * A tap fires `pointerenter` and never `pointerleave`, so a card opened by
   * touch would stay open until something else dismissed it — and on a phone
   * there is no hover to express the intent in the first place.
   */
  protected onEnter(event: PointerEvent): void {
    if (event.pointerType === "touch") return;
    this.hoverCard?.rememberTrigger(this.host.nativeElement);
    this.hoverCard?.openSoon();
  }
  protected onLeave(event: PointerEvent): void {
    if (event.pointerType === "touch") return;
    this.hoverCard?.closeSoon();
  }
}
