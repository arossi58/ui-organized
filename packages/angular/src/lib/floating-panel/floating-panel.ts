import { Overlay, type OverlayRef } from "@angular/cdk/overlay";
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
  signal,
  untracked,
  type Signal,
} from "@angular/core";
import { floatingPanelStyles, type ControlSize, type FloatingPanelVariants } from "@ui-organized/core";
import { UioPart, stateFlag } from "../part.js";
import { HostPresence } from "../host-presence.js";
import { UioIcon } from "../icons/icon.js";
import { nextMachineId } from "../part-ids.js";
import { flushNow } from "../overlay/flush.js";
import { createSurface, raiseSurface, setSurfaceInteractive } from "../overlay/surface.js";

export type FloatingPanelSize = ControlSize;
export type FloatingPanelVariant = NonNullable<FloatingPanelVariants["variant"]>;

export interface PanelSize {
  width: number;
  height: number;
}

export interface PanelPosition {
  x: number;
  y: number;
}

/** zag's fallbacks, used when the caller gives neither a size nor a position. */
const FALLBACK_SIZE: PanelSize = { width: 320, height: 240 };
const FALLBACK_POSITION: PanelPosition = { x: 300, y: 100 };

/** Header affordances stay a fixed small edge, as they do in the React panel. */
const HEADER_ICON_SIZE = 16;

/** Every edge and corner, in the order the React panel renders them. */
const RESIZE_AXES = ["n", "e", "s", "w", "ne", "se", "sw", "nw"] as const;
type ResizeAxis = (typeof RESIZE_AXES)[number];

/** zag's `getResizeAxisStyle`, which places each grab area on its own edge. */
const RESIZE_STYLES: Record<ResizeAxis, string> = {
  n: "position: absolute; touch-action: none; cursor: n-resize; width: 100%; top: 0px; left: 50%; translate: -50%;",
  e: "position: absolute; touch-action: none; cursor: e-resize; height: 100%; right: 0px; top: 50%; translate: 0px -50%;",
  s: "position: absolute; touch-action: none; cursor: s-resize; width: 100%; bottom: 0px; left: 50%; translate: -50%;",
  w: "position: absolute; touch-action: none; cursor: w-resize; height: 100%; left: 0px; top: 50%; translate: 0px -50%;",
  ne: "position: absolute; touch-action: none; cursor: ne-resize; top: 0px; right: 0px;",
  se: "position: absolute; touch-action: none; cursor: se-resize; bottom: 0px; right: 0px;",
  sw: "position: absolute; touch-action: none; cursor: sw-resize; bottom: 0px; left: 0px;",
  nw: "position: absolute; touch-action: none; cursor: nw-resize; top: 0px; left: 0px;",
};

const clamp = (value: number, low: number, high: number) => Math.min(Math.max(value, low), high);

/**
 * A draggable, resizable panel that floats over the page.
 *
 * ```html
 * <button uioFloatingPanelTrigger [panel]="layers">Layers</button>
 * <uio-floating-panel #layers="uioFloatingPanel">
 *   <h2 uioFloatingPanelTitle>Layers</h2>
 *   <div uioFloatingPanelBody>…</div>
 * </uio-floating-panel>
 * ```
 *
 * Structurally this is the Dialog's story told again — the host element is
 * removed because Ark's root renders nothing, the surface is attached on init
 * because Ark keeps its portal rendered, and a user interaction flushes change
 * detection so the trigger and the panel never disagree.
 *
 * ── The one overlay here that is not anchored ───────────────────────────────
 *
 * Unlike every other surface in this package, a floating panel is not
 * popper-positioned: it sits at an absolute `--x`/`--y` the *user* moved it to,
 * and the positioner carries no inline `z-index` at all. So it uses the CDK's
 * global position strategy and lets its own `position: fixed` inline style do the
 * placing — the same style zag writes — rather than asking the CDK to anchor it
 * to anything.
 *
 * ── `data-topmost` and `data-behind` are one fact, written twice ────────────
 *
 * zag keeps a stack of open panels so several can overlap, and reports the top
 * one on the content *and* the header. With one panel that reduces to "open",
 * and both attributes are emitted rather than only the true one, because
 * `dataAttr(!isTopmost)` is what the other three libraries render and the
 * stylesheet is shared.
 *
 * ── The panel's geometry is not part of the compared contract ───────────────
 *
 * Size and position reach the DOM as `--width`, `--height`, `--x` and `--y`, and
 * `style` is not compared by the parity gate. So the drag and resize arithmetic
 * here is this package's own rather than a transcription of zag's rect maths:
 * it clamps to `minSize`/`maxSize` and keeps the panel's top-left where the
 * pointer left it, which is what a user can see. What *is* compared — the parts,
 * the states, the ids and the `aria-labelledby` — is exact.
 */
@Component({
  selector: "uio-floating-panel",
  standalone: true,
  exportAs: "uioFloatingPanel",
  providers: [HostPresence],
  imports: [UioIcon],
  template: `
    <!--
      The portal's view container is anchored here, inside the component's own
      template, and never on the host element — see the note in "UioPopover" for
      the projection bug that causes.
    -->
    <ng-container #anchor />
    <ng-template #surface>
      <div
        class="floating-panel__positioner"
        data-scope="floating-panel"
        data-part="positioner"
        [id]="partId('positioner')"
        [attr.style]="positionerStyle()"
      >
        <div
          [class]="contentClass()"
          data-scope="floating-panel"
          data-part="content"
          role="dialog"
          tabindex="0"
          [id]="partId('content')"
          [attr.aria-labelledby]="partId('title')"
          [attr.data-state]="state()"
          [attr.hidden]="open() ? null : ''"
          [attr.data-dragging]="flag(dragging())"
          [attr.data-topmost]="flag(topmost())"
          [attr.data-behind]="flag(!topmost())"
          [attr.style]="contentStyle"
          (keydown)="onContentKeydown($event)"
        >
          <div
            class="floating-panel__header"
            data-scope="floating-panel"
            data-part="header"
            [id]="partId('header')"
            [attr.data-dragging]="flag(dragging())"
            [attr.data-topmost]="flag(topmost())"
            [attr.data-behind]="flag(!topmost())"
          >
            <!--
              The drag handle wraps the header's contents rather than sitting
              beside them, which is why grabbing the title bar is what moves the
              panel. Same nesting as the other three libraries.
            -->
            <div
              class="floating-panel__drag"
              data-scope="floating-panel"
              data-part="drag-trigger"
              [attr.data-disabled]="flag(!canDrag())"
              [attr.style]="dragStyle"
              (pointerdown)="onDragStart($event)"
            >
              <ng-content select="[uioFloatingPanelTitle]" />
              @if (showClose()) {
                <button
                  class="floating-panel__close"
                  data-scope="floating-panel"
                  data-part="close-trigger"
                  type="button"
                  aria-label="Close panel"
                  [disabled]="disabled()"
                  (click)="hide()"
                >
                  <span uioIcon name="close" [size]="HEADER_ICON_SIZE"></span>
                </button>
              }
            </div>
          </div>

          <ng-content />

          @for (axis of AXES; track axis) {
            <div
              data-scope="floating-panel"
              data-part="resize-trigger"
              [class]="resizeClass(axis)"
              [attr.data-axis]="axis"
              [attr.data-disabled]="flag(!canResize())"
              [attr.style]="resizeStyle(axis)"
              (pointerdown)="onResizeStart($event, axis)"
            ></div>
          }
        </div>
      </div>
    </ng-template>
  `,
})
export class UioFloatingPanel implements OnInit, OnDestroy {
  readonly open = model(false);
  readonly size = input<FloatingPanelSize>("md");
  readonly variant = input<FloatingPanelVariant>("default");
  readonly showClose = input(true, { transform: booleanAttribute });
  readonly draggable = input(true, { transform: booleanAttribute });
  readonly resizable = input(true, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Panel size in pixels. Uncontrolled until something binds it. */
  readonly panelSize = model<PanelSize>(FALLBACK_SIZE);
  /** Panel position in pixels. Uncontrolled until something binds it. */
  readonly position = model<PanelPosition>(FALLBACK_POSITION);
  readonly minSize = input<PanelSize | undefined>(undefined);
  readonly maxSize = input<PanelSize | undefined>(undefined);
  /** Use `absolute` when the panel must stay inside a scrolling container. */
  readonly strategy = input<"absolute" | "fixed">("fixed");
  /** How far an arrow key moves the panel. zag's `gridSize`. */
  readonly gridSize = input(1);
  /**
   * Whether Escape closes the panel. **Defaults to false**, which is the
   * machine's own default and therefore what every other library in this system
   * does: zag guards its ESCAPE transition on `closeOnEsc`, and the React
   * facade passes no `closeOnEscape`, so a floating panel does not close on
   * Escape unless it is asked to. Defaulting this to `true` would be the more
   * obvious choice and would make Angular the one library whose panels vanish.
   */
  readonly closeOnEscape = input(false, { transform: booleanAttribute });

  protected readonly AXES = RESIZE_AXES;
  protected readonly HEADER_ICON_SIZE = HEADER_ICON_SIZE;
  protected readonly flag = stateFlag;
  private readonly draggingNow = signal(false);
  protected readonly dragging = this.draggingNow.asReadonly();
  /** Read by the projected body, which zag also marks while a drag is running. */
  readonly isDragging = this.dragging;

  protected readonly state = computed(() => (this.open() ? "open" : "closed"));

  /**
   * Whether this is the panel on top, and why it is a latch rather than `open()`.
   *
   * zag keeps a stack of panels so several can overlap, pushes onto it when one
   * opens, and never recomputes `isTopmost` on the way down — so a panel that has
   * been opened once keeps `data-topmost` after it closes, and one that never has
   * carries `data-behind` instead. With a single panel that reduces to "has this
   * ever been open", which is what this is. Both attributes are emitted rather
   * than only the true one, because `dataAttr(!isTopmost)` is what the other
   * three libraries render.
   */
  private readonly opened = signal(false);
  protected readonly topmost = this.opened.asReadonly();

  /** zag's `canDrag` / `canResize`, which the two grab areas report as `data-disabled`. */
  protected readonly canDrag = computed(() => this.draggable() && !this.disabled());
  protected readonly canResize = computed(() => this.resizable() && !this.disabled());

  protected readonly contentClass = computed(() =>
    floatingPanelStyles({ size: this.size(), variant: this.variant() }),
  );

  private readonly machine = nextMachineId();
  /**
   * `float`, not `floating-panel`.
   *
   * zag's id prefix for this component is not its scope, which is unique in the
   * library and is why the SSR gate needs an `aria-controls` allowance for it.
   * Reproduced so the four libraries render ids of the same shape.
   */
  readonly rootId = `float:${this.machine}`;
  partId(part: string): string {
    return `${this.rootId}:${part}`;
  }

  protected readonly positionerStyle = computed(() => {
    const { width, height } = this.panelSize();
    const { x, y } = this.position();
    return (
      `--width: ${width}px; --height: ${height}px; --x: ${x}px; --y: ${y}px; ` +
      `position: ${this.strategy()}; top: var(--y); left: var(--x);`
    );
  });

  protected readonly contentStyle = "width: var(--width); height: var(--height);";
  protected readonly dragStyle = "user-select: none; touch-action: none; cursor: move;";

  protected resizeClass(axis: ResizeAxis): string {
    return `floating-panel__resize floating-panel__resize--${axis}`;
  }
  protected resizeStyle(axis: ResizeAxis): string {
    return RESIZE_STYLES[axis];
  }

  /** See `UioDialog` — decorator queries are the spelling both compilers register. */
  @ViewChild("surface", { static: true }) private surface!: TemplateRef<unknown>;
  @ViewChild("anchor", { read: ViewContainerRef, static: true }) private anchor!: ViewContainerRef;

  private readonly overlay = inject(Overlay);
  private readonly document = inject(DOCUMENT);
  private readonly presence = inject(HostPresence);
  private readonly appRef = inject(ApplicationRef);

  private overlayRef?: OverlayRef;
  private surfaceView?: EmbeddedViewRef<unknown>;
  private opener: HTMLElement | null = null;
  private applied = false;

  constructor() {
    effect(() => {
      this.open();
      untracked(() => this.sync());
    });
  }

  /** `ngOnInit`, not `ngAfterViewInit` — see the note in `UioDialog`. */
  ngOnInit(): void {
    this.overlayRef = createSurface(this.overlay, {
      // Global rather than connected: a floating panel is not anchored to
      // anything. Its own `position: fixed` inline style — the one zag writes —
      // is what places it, from `--x` and `--y`.
      positionStrategy: this.overlay.position().global(),
      scrollStrategy: this.overlay.scrollStrategies.noop(),
    });
    this.surfaceView = this.overlayRef.attach(
      new TemplatePortal(this.surface, this.anchor),
    ) as EmbeddedViewRef<unknown>;
    setSurfaceInteractive(this.overlayRef, false);
    this.presence.hide();
  }

  ngOnDestroy(): void {
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

  /** Told by the trigger, so focus can go back where it came from. */
  rememberOpener(element: HTMLElement | null): void {
    this.opener = element;
  }

  private setOpen(next: boolean): void {
    if (next === this.open()) return;
    this.open.set(next);
    flushNow(this.appRef);
  }

  private contentElement(): HTMLElement | null {
    return (
      this.overlayRef?.overlayElement.querySelector<HTMLElement>('[data-part="content"]') ?? null
    );
  }

  /**
   * Whether the panel has been through a transition yet.
   *
   * The focus moves belong to the *transition*, not to the state: zag hangs
   * `setInitialFocus` off the closed→open edge and `setFinalFocus` off the way
   * back, and a panel that starts open — `defaultOpen` — never crosses either.
   * So a panel rendered open leaves focus wherever it was, which is what the
   * other three libraries do and what a page with a panel already on it should
   * do rather than stealing focus on load.
   */
  private settled = false;

  private sync(): void {
    const open = this.open();
    // Recorded before the early return, not after it: a panel that starts
    // *closed* changes nothing on its first pass, and a flag set only on the way
    // through would still be unset when the user's first click arrived — so the
    // click would be treated as the initial render and focus would not move.
    const first = !this.settled;
    this.settled = true;
    if (open === this.applied) return;
    const transition = !first;
    this.applied = open;
    if (open) this.opened.set(true);
    this.surfaceView?.detectChanges();
    const ref = this.overlayRef;
    if (!ref) return;
    setSurfaceInteractive(ref, open);
    if (!open) {
      if (transition) this.opener?.focus({ preventScroll: true });
      return;
    }
    raiseSurface(ref);
    if (transition) this.contentElement()?.focus({ preventScroll: true });
  }

  /**
   * Escape closes, and the arrows move the panel.
   *
   * The arrow keys are only the panel's while the content itself has focus —
   * once focus is inside the body they belong to whatever is there, which is why
   * this checks the target rather than only the key.
   */
  protected onContentKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented) return;
    if (event.key === "Escape") {
      if (this.closeOnEscape()) this.hide();
      return;
    }
    if (event.currentTarget !== event.target) return;
    const step = (event.shiftKey ? 10 : 1) * this.gridSize();
    const delta =
      event.key === "ArrowLeft"
        ? { x: -step, y: 0 }
        : event.key === "ArrowRight"
          ? { x: step, y: 0 }
          : event.key === "ArrowUp"
            ? { x: 0, y: -step }
            : event.key === "ArrowDown"
              ? { x: 0, y: step }
              : null;
    if (!delta) return;
    event.preventDefault();
    const { x, y } = this.position();
    this.setPosition({ x: x + delta.x, y: y + delta.y });
  }

  setPosition(position: PanelPosition): void {
    this.position.set(position);
    flushNow(this.appRef);
  }

  setSize(size: PanelSize): void {
    const min = this.minSize() ?? { width: 0, height: 0 };
    const max = this.maxSize() ?? {
      width: Number.POSITIVE_INFINITY,
      height: Number.POSITIVE_INFINITY,
    };
    this.panelSize.set({
      width: clamp(size.width, min.width, max.width),
      height: clamp(size.height, min.height, max.height),
    });
    flushNow(this.appRef);
  }

  protected onDragStart(event: PointerEvent): void {
    if (!this.draggable() || this.disabled() || event.button !== 0) return;
    // Not from the close button: a click that starts a drag never fires a click.
    if ((event.target as HTMLElement | null)?.closest('[data-part="close-trigger"]')) return;
    event.preventDefault();
    const origin = { x: event.clientX, y: event.clientY };
    const start = this.position();
    this.track((moved) => {
      this.setPosition({
        x: start.x + (moved.clientX - origin.x),
        y: start.y + (moved.clientY - origin.y),
      });
    });
  }

  protected onResizeStart(event: PointerEvent, axis: ResizeAxis): void {
    if (!this.resizable() || this.disabled() || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const origin = { x: event.clientX, y: event.clientY };
    const startSize = this.panelSize();
    const startPosition = this.position();
    this.track((moved) => {
      const dx = moved.clientX - origin.x;
      const dy = moved.clientY - origin.y;
      const west = axis.includes("w");
      const north = axis.includes("n");
      const east = axis.includes("e");
      const south = axis.includes("s");
      const width = startSize.width + (east ? dx : west ? -dx : 0);
      const height = startSize.height + (south ? dy : north ? -dy : 0);
      this.setSize({ width, height });
      // Dragging a north or west edge moves the panel as well as sizing it, and
      // by exactly what the size actually changed by — so a panel that hits its
      // minimum stops moving rather than sliding out from under the pointer.
      const applied = this.panelSize();
      this.setPosition({
        x: west ? startPosition.x + (startSize.width - applied.width) : startPosition.x,
        y: north ? startPosition.y + (startSize.height - applied.height) : startPosition.y,
      });
    });
  }

  /**
   * Follow a pointer on the document until it is released.
   *
   * On the document rather than the grabbed element, because a drag leaves the
   * eight-pixel resize strip immediately and a panel that stopped following
   * would be unusable.
   */
  private track(move: (moved: PointerEvent) => void): void {
    const document = this.document;
    this.draggingNow.set(true);
    const onMove = (moved: PointerEvent) => move(moved);
    const stop = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", stop);
      document.removeEventListener("pointercancel", stop);
      this.draggingNow.set(false);
      flushNow(this.appRef);
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", stop);
    document.addEventListener("pointercancel", stop);
    flushNow(this.appRef);
  }
}

/** Opens and closes a panel, and reports its state the way Ark's trigger does. */
@Directive({
  selector: "button[uioFloatingPanelTrigger]",
  standalone: true,
  host: {
    type: "button",
    "[id]": "panel ? panel.partId('trigger') : null",
    "[attr.aria-controls]": "panel ? panel.partId('content') : null",
    "(click)": "activate()",
  },
})
export class UioFloatingPanelTrigger extends UioPart {
  readonly scope = "floating-panel";
  readonly part = "trigger";

  /** A decorator input — see `UioDialogTrigger` for why this one is not `input()`. */
  @Input("panel") panel?: UioFloatingPanel;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly isOpen: Signal<boolean> = computed(() => !!this.panel?.open());
  override readonly state = computed(() => (this.isOpen() ? "open" : "closed"));

  ngOnInit(): void {
    this.panel?.rememberOpener(this.host.nativeElement);
  }

  protected activate(): void {
    const panel = this.panel;
    if (!panel) return;
    panel.rememberOpener(this.host.nativeElement);
    panel.toggle();
  }
}

/** Names the panel. Its `role="dialog"` has no accessible name without one. */
@Directive({
  selector: "[uioFloatingPanelTitle]",
  standalone: true,
  host: {
    class: "floating-panel__title text-strong-body-large",
    "[id]": "panel.partId('title')",
  },
})
export class UioFloatingPanelTitle extends UioPart {
  readonly scope = "floating-panel";
  readonly part = "title";
  protected readonly panel = inject(UioFloatingPanel);
}

/** The scrolling area below the header. */
@Directive({
  selector: "[uioFloatingPanelBody]",
  standalone: true,
  host: {
    class: "floating-panel__body text-default-body-medium",
    "[attr.data-dragging]": "flag(panel.isDragging())",
  },
})
export class UioFloatingPanelBody extends UioPart {
  readonly scope = "floating-panel";
  readonly part = "body";
  protected readonly panel = inject(UioFloatingPanel);
  protected readonly flag = stateFlag;
}
