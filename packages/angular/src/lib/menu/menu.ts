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
  output,
  signal,
  untracked,
  type Signal,
} from "@angular/core";
import { clsx } from "clsx";
import { dividerStyles } from "@ui-organized/core";
import type { CanonicalIconName } from "@ui-organized/utils";
import { UioPart } from "../part.js";
import { nextMachineId } from "../part-ids.js";
import { UioMenubarContext } from "../menubar/menubar-context.js";
import { HostPresence } from "../host-presence.js";
import { UioIcon } from "../icons/icon.js";
import { AnchoredSurface } from "../overlay/anchored.js";
import { anchoredPositions, type OverlayAlign, type OverlaySide } from "../overlay/anchor.js";
import { pushLayer, removeLayer, type DismissibleLayer } from "../overlay/dismiss.js";
import { flushNow } from "../overlay/flush.js";
import { restoreFocus } from "../overlay/focus.js";
import { inDomOrder, moveHighlight } from "../overlay/roving.js";
import { applySurfaceStacking, raiseSurface, setSurfaceInteractive } from "../overlay/surface.js";

/**
 * What the menu needs to know about one of its items.
 *
 * Functions rather than values, so the menu always reads the item's *current*
 * state: an item registers once, and its `value` and `disabled` are signals that
 * can change under it afterwards.
 */
interface MenuItemHandle {
  readonly element: HTMLElement;
  value(): string;
  disabled(): boolean;
  choose(): void;
}

/**
 * A list of actions, anchored to the control that opened it.
 *
 * ```html
 * <button uioButton uioMenuTrigger [menu]="actions">Actions</button>
 * <uio-menu #actions="uioMenu">
 *   <div uioMenuItem value="rename" icon="pencil">Rename</div>
 *   <div uioMenuSeparator></div>
 *   <div uioMenuItem value="delete" destructive>Delete</div>
 * </uio-menu>
 * ```
 *
 * ── Focus goes to the menu, not to the item ─────────────────────────────────
 *
 * Ark drives a menu with `aria-activedescendant`: DOM focus stays on the
 * `role="menu"` element — which is why it carries `tabindex="0"` — and the
 * highlighted item is *named* rather than focused. That is what the shared
 * stylesheet reads (`.menu__item[data-highlighted]` is the hover treatment), and
 * it is why `@angular/cdk/menu`, which implements the APG pattern by moving real
 * focus between items, could not be used underneath this: the two disagree about
 * which element is focused, so every `:focus-visible` rule and every
 * `[data-highlighted]` rule in the stylesheet would apply to the wrong element.
 *
 * The pointer highlights too, for the same reason: `[data-highlighted]` *is* the
 * hover state in this system, so a mouse and a keyboard have to write the same
 * attribute or a menu looks dead under the pointer.
 */
@Component({
  selector: "uio-menu",
  standalone: true,
  exportAs: "uioMenu",
  providers: [HostPresence],
  template: `
    <!-- See UioPopover: a container anchored on the host is re-homed by projection. -->
    <ng-container #anchor />
    <ng-template #surface>
      <div
        class="menu__positioner"
        data-scope="menu"
        data-part="positioner"
        [id]="partId('popper')"
      >
        <div
          [class]="popupClass()"
          data-scope="menu"
          data-part="content"
          role="menu"
          tabindex="0"
          [id]="partId('content')"
          [attr.data-state]="state()"
          [attr.hidden]="open() ? null : ''"
          [attr.data-placement]="anchored.placement()"
          [attr.data-side]="anchored.side()"
          [attr.aria-labelledby]="triggerId()"
          [attr.aria-activedescendant]="activeDescendant()"
          (keydown)="onKeydown($event)"
        >
          <ng-content />
        </div>
      </div>
    </ng-template>
  `,
})
export class UioMenu implements OnInit, OnDestroy {
  readonly open = model(false);
  readonly side = input<OverlaySide>("bottom");
  readonly align = input<OverlayAlign>("start");
  readonly sideOffset = input(4);
  readonly alignOffset = input(0);
  /**
   * Extra classes for the popup surface.
   *
   * The surface is portalled, so a `class` written on `<uio-menu>` would land on
   * a host element that is removed from the DOM before anything is painted (see
   * `HostPresence` below) — it cannot reach the popup the way React's
   * `<MenuContent className>` does. This is the input that can. `UioPagination`
   * is the caller that needs it: its jump menus carry
   * `pagination__ellipsis-menu`, which is what caps a long hidden range to a
   * scrollable height.
   */
  readonly contentClass = input<string | undefined>(undefined);
  /** The value of the item that was chosen. */
  readonly select = output<string>();

  readonly machine = nextMachineId();
  readonly anchored = new AnchoredSurface(inject(Overlay));

  /** `null` until something is highlighted, which is how a menu opens. */
  readonly highlighted = signal<string | null>(null);

  protected readonly state = computed(() => (this.open() ? "open" : "closed"));
  protected readonly popupClass = computed(() => clsx("menu__popup", this.contentClass()));
  protected readonly activeDescendant = computed(() => {
    const value = this.highlighted();
    return value === null ? null : this.itemId(value);
  });

  @ViewChild("surface", { static: true }) private surface!: TemplateRef<unknown>;
  @ViewChild("anchor", { read: ViewContainerRef, static: true }) private anchor!: ViewContainerRef;

  private readonly document = inject(DOCUMENT);
  private readonly presence = inject(HostPresence);
  private readonly appRef = inject(ApplicationRef);

  private surfaceView?: EmbeddedViewRef<unknown>;
  private items: MenuItemHandle[] = [];
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
    const ref = this.anchored.create(
      this.opener ?? this.document.body,
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
    this.anchored.dispose();
  }

  partId(part: string): string {
    return `menu:${this.machine}:${part}`;
  }
  /**
   * Ark's item ids are `<machine>/<value>` rather than `<scope>:<machine>:<part>`
   * — the collection's own key, not a part name. Reproduced, so two menus on a
   * page cannot collide and a reference reads the same way it does in React.
   */
  itemId(value: string): string {
    return `${this.machine}/${value}`;
  }
  triggerId(): string | null {
    return this.opener ? this.partId("trigger") : null;
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

  rememberOpener(element: HTMLElement | null): void {
    this.opener = element;
    if (element) this.anchored.setAnchor(element);
  }

  register(item: MenuItemHandle): void {
    this.items.push(item);
  }
  unregister(item: MenuItemHandle): void {
    this.items = this.items.filter((candidate) => candidate !== item);
  }

  /** The pointer highlights exactly as the keyboard does — see the class note. */
  highlight(value: string | null): void {
    this.highlighted.set(value);
  }

  choose(value: string): void {
    this.select.emit(value);
    this.hide();
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
    this.anchored.reposition();
    raiseSurface(ref);
    setSurfaceInteractive(ref, true);
    // Ark opens a menu with nothing highlighted; the first arrow key chooses.
    this.highlighted.set(null);
    this.contentElement()?.focus({ preventScroll: true });
    pushLayer(this.document, this.layer);
  }

  private applyClose(): void {
    this.applied = false;
    removeLayer(this.layer);
    this.highlighted.set(null);
    this.surfaceView?.detectChanges();
    const ref = this.anchored.overlayRef;
    if (ref) setSurfaceInteractive(ref, false);
    restoreFocus(this.opener);
  }

  private ordered(): MenuItemHandle[] {
    return inDomOrder(this.items);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const items = this.ordered();
    const navigable = items.map((item) => ({ disabled: item.disabled() }));
    const current = items.findIndex((item) => item.value() === this.highlighted());

    const move = (step: number) => {
      const next = items[moveHighlight(navigable, current, step)];
      if (next) this.highlighted.set(next.value());
      event.preventDefault();
    };

    switch (event.key) {
      case "ArrowDown":
        return move(1);
      case "ArrowUp":
        return move(-1);
      case "Home":
        this.highlighted.set(null);
        return move(1);
      case "End":
        this.highlighted.set(null);
        return move(-1);
      case "Enter":
      case " ": {
        const item = items[current];
        if (!item) return;
        event.preventDefault();
        item.choose();
        return;
      }
      case "Tab":
        // A menu is a modal-ish surface: Tab closes it rather than walking into
        // the page behind. Not prevented, so focus still moves on from the
        // trigger the way a user expects.
        this.hide();
        return;
      default:
        return;
    }
  }
}

/**
 * Opens a menu.
 *
 * `data-controls` is on the trigger whether the menu is open or not, and
 * `aria-controls` only while it is. That asymmetry is Ark's: the data attribute
 * is how a menubar finds the content belonging to each of its triggers, and the
 * ARIA one is a reference that must not dangle. Both are reproduced.
 */
@Directive({
  selector: "button[uioMenuTrigger]",
  standalone: true,
  host: {
    type: "button",
    "aria-haspopup": "menu",
    "[id]": "menu ? menu.partId('trigger') : null",
    "[attr.data-uid]": "menu ? menu.machine : null",
    "[attr.data-controls]": "menu ? menu.partId('content') : null",
    "[attr.aria-expanded]": "isOpen() ? 'true' : 'false'",
    "[attr.aria-controls]": "isOpen() ? menu!.partId('content') : null",
    "[attr.data-placement]": "menu?.anchored?.placement() ?? null",
    "[attr.data-side]": "menu?.anchored?.side() ?? null",
    "[attr.role]": "inMenubar ? 'menuitem' : null",
    "[attr.data-menubar-item]": "flag(inMenubar)",
    "(click)": "activate()",
    "(keydown)": "onKeydown($event)",
  },
})
export class UioMenuTrigger extends UioPart implements OnInit {
  readonly scope = "menu";
  readonly part = "trigger";

  /** A decorator input — see `UioDialogTrigger` for why this one is not `input()`. */
  @Input("menu") menu?: UioMenu;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Inside a menubar the trigger stops being a button and becomes one of the
   * bar's menuitems — `role="menubar"` admits no other children — and the data
   * attribute is how the bar finds its own triggers for the roving tabindex.
   *
   * Read from an optional provider rather than passed down: `UioMenu` is an
   * independent overlay and the bar has no handle on the triggers inside it, so
   * the bar announces itself and the trigger asks. Outside a bar both attributes
   * are absent, which is what React renders for a plain menu trigger.
   *
   * A plain field, not a signal: a bar does not appear or disappear around a
   * trigger that is already mounted.
   */
  protected readonly inMenubar = !!inject(UioMenubarContext, { optional: true });

  protected readonly isOpen: Signal<boolean> = computed(() => !!this.menu?.open());
  override readonly state = computed(() => (this.isOpen() ? "open" : "closed"));

  ngOnInit(): void {
    this.menu?.rememberOpener(this.host.nativeElement);
  }

  protected activate(): void {
    this.menu?.rememberOpener(this.host.nativeElement);
    this.menu?.toggle();
  }

  /**
   * Arrow keys open the menu, which is the APG behaviour and the one thing a
   * click handler alone cannot give a keyboard user.
   */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    this.menu?.rememberOpener(this.host.nativeElement);
    this.menu?.show();
  }
}

/**
 * One action in a menu.
 *
 * A `div` with `role="menuitem"` rather than a `button`, because that is what
 * Ark renders and because `role="menu"` admits no other children — a real button
 * would bring its own focus behaviour into a surface whose focus lives on the
 * menu itself.
 */
@Component({
  selector: "[uioMenuItem]",
  standalone: true,
  imports: [UioIcon],
  template: `
    @if (icon(); as name) {
      <span uioIcon class="menu__item-icon" [name]="name" [size]="ICON_SIZE"></span>
    }
    <span class="menu__item-label"><ng-content /></span>
  `,
  host: {
    role: "menuitem",
    "[class]": "hostClass()",
    "[id]": "menu.itemId(itemValue())",
    "[attr.data-ownedby]": "menu.partId('content')",
    "[attr.data-value]": "itemValue()",
    "[attr.aria-disabled]": "disabled() ? 'true' : null",
    "(click)": "choose()",
    "(pointermove)": "menu.highlight(disabled() ? null : itemValue())",
    "(pointerleave)": "menu.highlight(null)",
  },
})
export class UioMenuItem extends UioPart implements OnInit, OnDestroy {
  readonly scope = "menu";
  readonly part = "item";

  /**
   * The value reported when the item is chosen.
   *
   * Optional, and falls back to a generated id — the same fork React takes.
   * Ark requires a stable value per item where Base UI did not, and a menu of
   * one-off actions has nothing meaningful to put there.
   */
  readonly value = input<string | undefined>(undefined);
  readonly icon = input<CanonicalIconName | undefined>(undefined);
  /** Red text at rest, filling solid on highlight — the destructive-ghost button. */
  readonly destructive = input(false, { transform: booleanAttribute });
  override readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly menu = inject(UioMenu);
  protected readonly ICON_SIZE = 20;
  protected readonly hostClass = computed(() =>
    clsx("menu__item", this.destructive() && "menu__item--destructive"),
  );

  private readonly generated = nextMachineId();
  /** Falls back to a generated id, so every item has a stable identity. */
  protected readonly itemValue = computed(() => this.value() ?? this.generated);

  override readonly highlighted = computed(() => this.menu.highlighted() === this.itemValue());

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Registration rather than a query.
   *
   * `contentChildren()` would be the obvious way for the menu to find its items,
   * and initializer-based queries are not registered by the JIT compiler this
   * package's specs run under — so the keyboard navigation, which is the whole
   * reason the menu needs the list, could not be tested. Items telling the menu
   * they exist works in both compilers, and the menu sorts them by document
   * position anyway (see `inDomOrder`), so registration order is never relied on.
   */
  private readonly handle: MenuItemHandle = {
    element: this.host.nativeElement,
    value: () => this.itemValue(),
    disabled: () => this.disabled(),
    choose: () => this.choose(),
  };

  ngOnInit(): void {
    this.menu.register(this.handle);
  }

  ngOnDestroy(): void {
    this.menu.unregister(this.handle);
  }

  protected choose(): void {
    if (this.disabled()) return;
    this.menu.choose(this.itemValue());
  }
}

/**
 * The rule between groups of actions.
 *
 * The surface is the design system's Divider — same height, colour and full
 * width as everywhere else — with Ark's separator identity merged onto it. React
 * does that with `asChild`; Angular has no such thing and cannot put two
 * components on one element, so the class is composed from `dividerStyles`
 * directly. Same rendered element, one fewer indirection.
 */
@Directive({
  selector: "[uioMenuSeparator]",
  standalone: true,
  host: {
    role: "separator",
    "aria-orientation": "horizontal",
    "[class]": "hostClass",
  },
})
export class UioMenuSeparator extends UioPart {
  readonly scope = "menu";
  readonly part = "separator";
  protected readonly hostClass = clsx(
    dividerStyles({ orientation: "horizontal", spacing: "none" }),
    "menu__separator",
  );
}
