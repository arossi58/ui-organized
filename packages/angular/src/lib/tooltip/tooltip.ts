import { Overlay } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import {
  ApplicationRef,
  Component,
  ComponentRef,
  DOCUMENT,
  Directive,
  ElementRef,
  Injectable,
  Injector,
  OnDestroy,
  OnInit,
  type Provider,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  untracked,
} from "@angular/core";
import { UioPart, stateFlag } from "../part.js";
import { nextMachineId } from "../part-ids.js";
import { AnchoredSurface } from "../overlay/anchored.js";
import { anchoredPositions, type OverlayAlign, type OverlaySide } from "../overlay/anchor.js";
import { pushLayer, removeLayer, type DismissibleLayer } from "../overlay/dismiss.js";
import { flushNow } from "../overlay/flush.js";
import { applySurfaceStacking, raiseSurface, setSurfaceInteractive } from "../overlay/surface.js";

/**
 * Shared open/close delays for every tooltip below a provider.
 *
 * Ark has no app-level delay provider — its delays are per-Root props — and the
 * React facade preserves the older API with a React context. This is that
 * context in Angular's spelling; {@link provideTooltipDelays} is how an app
 * sets it, and a `delay` on an individual tooltip still wins.
 */
@Injectable()
export class UioTooltipDelays {
  delay?: number;
  closeDelay?: number;
}

/**
 * ```ts
 * bootstrapApplication(App, { providers: [provideTooltipDelays({ delay: 400 })] });
 * ```
 */
export function provideTooltipDelays(delays: {
  delay?: number;
  closeDelay?: number;
}): Provider {
  return { provide: UioTooltipDelays, useValue: Object.assign(new UioTooltipDelays(), delays) };
}

/**
 * The state the portalled surface reads.
 *
 * The tooltip is a **directive**, because its host is whatever element the
 * caller decorated — very often a `button[uioButton]`, and two components
 * cannot share one element. A directive has no template, so the surface is a
 * component of its own, attached as a component portal and handed this state
 * through an injector rather than through inputs: `ComponentRef.setInput` on an
 * initializer-based input does nothing under the JIT compiler, and this
 * package's specs are JIT-compiled.
 */
export interface TooltipSurfaceState {
  partId(part: string): string;
  open(): boolean;
  content(): string | undefined;
  /** The placement the surface *ended up* at, which is what Ark reflects. */
  placement(): string | null;
  resolvedSide(): string | null;
}

@Component({
  selector: "uio-tooltip-surface",
  standalone: true,
  // Transparent to layout: the CDK pane is a flex container, and this host is
  // scaffolding that the other three libraries do not render at all.
  host: { style: "display: contents" },
  template: `
    <div
      class="tooltip__positioner"
      data-scope="tooltip"
      data-part="positioner"
      [id]="tooltip.partId('popper')"
    >
      <div
        class="tooltip__popup text-default-body-small"
        data-scope="tooltip"
        data-part="content"
        role="tooltip"
        [id]="tooltip.partId('content')"
        [attr.data-state]="tooltip.open() ? 'open' : 'closed'"
        [attr.hidden]="tooltip.open() ? null : ''"
        [attr.data-placement]="tooltip.placement()"
        [attr.data-side]="tooltip.resolvedSide()"
      >{{ tooltip.content() }}</div>
    </div>
  `,
})
export class UioTooltipSurface {
  protected readonly tooltip: TooltipSurfaceState = inject(UioTooltip);
}

/**
 * A small label that appears beside a control on hover or focus.
 *
 * ```html
 * <button uioButton uioTooltip="Copy" icon="copy"></button>
 * ```
 *
 * ── Why the content is a string ─────────────────────────────────────────────
 *
 * Every library in this system takes it as one. A tooltip's whole contract is
 * that it is a short label — `role="tooltip"` names a control, it does not hold
 * interactive content — and taking projected content would invite a popover to
 * be built out of it, which has different focus and dismissal rules.
 *
 * ── The trigger class ───────────────────────────────────────────────────────
 *
 * `tooltip__trigger` is on the host unconditionally. React renders its own
 * button when the child is not an element and adds the class there; here the
 * caller's element always *is* the trigger, so the class always applies. It is
 * `display: inline-flex` and nothing else.
 */
@Directive({
  selector: "[uioTooltip]",
  standalone: true,
  exportAs: "uioTooltip",
  host: {
    class: "tooltip__trigger",
    "[id]": "partId('trigger')",
    "[attr.data-ownedby]": "machine",
    "[attr.data-expanded]": "flag(open())",
    "[attr.aria-describedby]": "open() ? partId('content') : null",
    "(pointerenter)": "openSoon()",
    "(pointerleave)": "closeSoon()",
    "(focus)": "openNow()",
    "(blur)": "closeNow()",
    // Ark closes on press: a tooltip hanging over the thing the user just
    // clicked is in the way of the result.
    "(pointerdown)": "closeNow()",
  },
})
export class UioTooltip extends UioPart implements OnInit, OnDestroy, TooltipSurfaceState {
  readonly scope = "tooltip";
  readonly part = "trigger";

  readonly content = input<string | undefined>(undefined, { alias: "uioTooltip" });
  readonly open = model(false);
  readonly side = input<OverlaySide>("top");
  readonly align = input<OverlayAlign>("center");
  readonly sideOffset = input(6);
  /**
   * No tooltip is attached and nothing opens.
   *
   * The trigger keeps its part identity, where React's `disabled` returns the
   * child untouched and renders no trigger at all. Angular cannot un-declare the
   * element the caller decorated, and a `data-scope` on a control that shows
   * nothing is inert — where dropping the attributes would mean a control whose
   * identity appeared and disappeared with a boolean.
   */
  override readonly disabled = input(false, { transform: booleanAttribute });

  /** Zag's own defaults, so a tooltip feels the same in all four libraries. */
  readonly delay = input<number | undefined>(undefined);
  readonly closeDelay = input<number | undefined>(undefined);

  private readonly shared = inject(UioTooltipDelays, { optional: true });
  private readonly openDelay = computed(() => this.delay() ?? this.shared?.delay ?? 1000);
  private readonly hideDelay = computed(() => this.closeDelay() ?? this.shared?.closeDelay ?? 500);

  override readonly state = computed(() => (this.open() ? "open" : "closed"));
  protected readonly flag = stateFlag;
  protected readonly machine = nextMachineId();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(Injector);
  private readonly anchored = new AnchoredSurface(inject(Overlay));

  private timer?: ReturnType<typeof setTimeout>;
  private surfaceRef?: ComponentRef<UioTooltipSurface>;
  private applied = false;

  private readonly layer: DismissibleLayer = {
    // A tooltip is never pointed at, so nothing is "inside" it for dismissal
    // purposes — an outside click closes it, and so does Escape.
    surface: () => null,
    trigger: () => this.host.nativeElement,
    dismiss: () => this.closeNow(),
  };

  constructor() {
    super();
    effect(() => {
      this.open();
      untracked(() => this.sync());
    });
    effect(() => {
      const candidates = anchoredPositions(this.side(), this.align(), this.sideOffset());
      untracked(() => this.anchored.setCandidates(candidates));
    });
  }

  partId(part: string): string {
    return `tooltip:${this.machine}:${part}`;
  }
  placement(): string | null {
    return this.anchored.placement();
  }
  /**
   * The side the surface ended up on, which is not the `side` input: that is the
   * request, and a tooltip asked for `top` at the top of the viewport comes out
   * `bottom` in every library.
   */
  resolvedSide(): string | null {
    return this.anchored.side();
  }

  /**
   * `ngOnInit`, not `ngAfterViewInit`, for the reason the other four surfaces
   * give: `ngAfterViewInit` runs bottom-up, so a tooltip inside a dialog would
   * put its surface into the shared overlay container before the dialog's, and
   * the container would not read in the order the other three libraries' body
   * children do.
   */
  ngOnInit(): void {
    if (this.disabled()) return;
    const ref = this.anchored.create(
      this.host.nativeElement,
      anchoredPositions(this.side(), this.align(), this.sideOffset()),
    );
    this.surfaceRef = ref.attach(
      new ComponentPortal(
        UioTooltipSurface,
        // No view container, deliberately: the CDK then creates the component
        // against the ApplicationRef, and the surface belongs to no container in
        // the caller's tree that a projection could re-home. See `UioPopover`.
        null,
        Injector.create({ providers: [{ provide: UioTooltip, useValue: this }], parent: this.injector }),
      ),
    );
    applySurfaceStacking(ref);
    setSurfaceInteractive(ref, false);
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
    removeLayer(this.layer);
    this.anchored.dispose();
  }

  protected openSoon(): void {
    this.after(this.openDelay(), true);
  }
  protected closeSoon(): void {
    this.after(this.hideDelay(), false);
  }
  protected openNow(): void {
    this.after(0, true);
  }
  protected closeNow(): void {
    this.after(0, false);
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

  private sync(): void {
    const open = this.open();
    if (open === this.applied) return;
    this.applied = open;
    const ref = this.anchored.overlayRef;
    if (!ref) return;
    if (open) {
      /**
       * Refresh the surface before measuring it.
       *
       * The popup is `hidden` while closed, so it has no height — and the CDK
       * chooses a placement by asking which candidate fits. A zero-height popup
       * fits *above* a trigger sitting at the top of the viewport, so the
       * tooltip would report `data-placement="top"` where every other library
       * flips it to `bottom`. Its view belongs to the ApplicationRef and is
       * refreshed after this effect, so it is refreshed by hand here.
       */
      this.surfaceRef?.changeDetectorRef.detectChanges();
      this.anchored.reposition();
      raiseSurface(ref);
    }
    // The popup never takes pointer events even when open — the shared
    // stylesheet's `.tooltip__popup` is decoration, and zag writes
    // `pointer-events: none` on it for the same reason: a tooltip that swallowed
    // the pointer would close itself the moment it appeared.
    setSurfaceInteractive(ref, false);
  }
}
