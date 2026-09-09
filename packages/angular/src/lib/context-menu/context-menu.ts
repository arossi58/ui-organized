import { Overlay } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import {
  ApplicationRef,
  Component,
  DOCUMENT,
  Directive,
  ElementRef,
  EmbeddedViewRef,
  Injectable,
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
} from "@angular/core";
import { clsx } from "clsx";
import { dividerStyles } from "@ui-organized/core";
import type { CanonicalIconName } from "@ui-organized/utils";
import { UioPart } from "../part.js";
import { nextMachineId } from "../part-ids.js";
import { HostPresence } from "../host-presence.js";
import { UioIcon } from "../icons/icon.js";
import { anchoredPositions } from "../overlay/anchor.js";
import { pushLayer, removeLayer, type DismissibleLayer } from "../overlay/dismiss.js";
import { flushNow } from "../overlay/flush.js";
import { restoreFocus } from "../overlay/focus.js";
import { inDomOrder, moveHighlight } from "../overlay/roving.js";
import { applySurfaceStacking, raiseSurface, setSurfaceInteractive } from "../overlay/surface.js";
import { PointerSurface, type AnchorPoint } from "./pointer-surface.js";

/** Zag's own long-press threshold, for the touch equivalent of a right-click. */
const LONG_PRESS = 700;
const ITEM_ICON_SIZE = 20;
const CHECK_ICON_SIZE = 16;

/**
 * What the menu needs to know about one of its items. Functions rather than
 * values, so the menu always reads the item's *current* state.
 */
interface ContextMenuItemHandle {
  readonly element: HTMLElement;
  value(): string;
  disabled(): boolean;
  choose(): void;
}

/**
 * A menu opened by right-clicking an area of the page.
 *
 * ```html
 * <div uioContextMenuTrigger [contextMenu]="actions">Right-click here</div>
 * <uio-context-menu #actions="uioContextMenu">
 *   <div uioContextMenuItem value="cut" icon="scissors">Cut</div>
 *   <div uioContextMenuSeparator></div>
 *   <div uioContextMenuItem value="delete" destructive>Delete</div>
 * </uio-context-menu>
 * ```
 *
 * ── It is a Menu anchored to a point ────────────────────────────────────────
 *
 * Ark has no context-menu primitive: it is the Menu machine with a
 * `ContextTrigger`, so the scope stays `menu` and every part below carries the
 * ids and roles `UioMenu`'s do. What differs is the anchor. A `UioMenu` hangs
 * off a button; this hangs off wherever the pointer was, and that has a
 * consequence in the rendered DOM which is easy to get wrong in the other
 * direction: **a context menu that has never been right-clicked reports no
 * placement at all.** Opened declaratively it is `data-state="open"` with no
 * `data-placement` and no `data-side`, because zag never measured it. See
 * `PointerSurface`.
 *
 * The same fork governs the content's accessible name. Zag names it after the
 * *context* trigger once a point exists, and after the plain trigger — an
 * element this component never renders — before then. That dangling reference
 * is Ark's, reproduced rather than tidied, because the two libraries have to
 * render the same thing and a difference here would be a difference in what a
 * screen reader announces.
 *
 * Focus, dismissal and the highlight are `UioMenu`'s story, written up there:
 * DOM focus stays on the `role="menu"` element and the highlighted item is
 * *named* with `aria-activedescendant`, which is what the shared stylesheet's
 * `[data-highlighted]` rules read.
 */
@Component({
  selector: "uio-context-menu",
  standalone: true,
  exportAs: "uioContextMenu",
  providers: [HostPresence],
  template: `
    <!-- See UioPopover: a container anchored on the host is re-homed by projection. -->
    <ng-container #anchor />
    <ng-template #surface>
      <div
        class="context-menu__positioner"
        data-scope="menu"
        data-part="positioner"
        [id]="partId('popper')"
      >
        <div
          class="context-menu__popup"
          data-scope="menu"
          data-part="content"
          role="menu"
          tabindex="0"
          [id]="partId('content')"
          [attr.data-state]="state()"
          [attr.hidden]="open() ? null : ''"
          [attr.data-placement]="pointer.placement()"
          [attr.data-side]="pointer.side()"
          [attr.aria-labelledby]="labelledBy()"
          [attr.aria-activedescendant]="activeDescendant()"
          (keydown)="onKeydown($event)"
        >
          <ng-content />
        </div>
      </div>
    </ng-template>
  `,
})
export class UioContextMenu implements OnInit, OnDestroy {
  readonly open = model(false);
  /** Gap between the cursor and the menu, in px. */
  readonly sideOffset = input(4);
  readonly alignOffset = input(0);
  /** The value of the item that was chosen. */
  readonly select = output<string>();

  readonly machine = nextMachineId();
  readonly pointer = new PointerSurface(inject(Overlay));

  /** `null` until something is highlighted, which is how a menu opens. */
  readonly highlighted = signal<string | null>(null);

  protected readonly state = computed(() => (this.open() ? "open" : "closed"));
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
  private items: ContextMenuItemHandle[] = [];
  private trigger: HTMLElement | null = null;
  /** Where the next open should place the surface, set by the right-click. */
  private pending: AnchorPoint | null = null;
  private applied = false;

  private readonly layer: DismissibleLayer = {
    surface: () => this.contentElement(),
    /**
     * `null`, not the trigger area.
     *
     * For every other overlay the trigger is excluded from "outside" so a click
     * on it cannot dismiss and re-open in one gesture. A context menu is opened
     * by a *right*-click, so a left-click anywhere — the trigger area very much
     * included — is a dismissal, which is what every desktop context menu does.
     */
    trigger: () => null,
    dismiss: () => this.hide(),
  };

  constructor() {
    effect(() => {
      this.open();
      untracked(() => this.sync());
    });
    effect(() => {
      // `bottom-start` is zag's placement for a context menu: the menu hangs
      // down and to the right of the cursor, and flips when there is no room.
      const candidates = anchoredPositions("bottom", "start", this.sideOffset(), this.alignOffset());
      untracked(() => this.pointer.setCandidates(candidates));
    });
  }

  /** `ngOnInit`, not `ngAfterViewInit` — see `UioMenu` for the ordering. */
  ngOnInit(): void {
    const ref = this.pointer.create(
      anchoredPositions("bottom", "start", this.sideOffset(), this.alignOffset()),
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
    this.pointer.dispose();
  }

  partId(part: string): string {
    return `menu:${this.machine}:${part}`;
  }
  /**
   * Ark's item ids are `<machine>/<value>` rather than `<scope>:<machine>:<part>`
   * — the collection's own key, not a part name.
   */
  itemId(value: string): string {
    return `${this.machine}/${value}`;
  }

  /**
   * The trigger the content is named after — the *context* trigger once a
   * right-click has placed the menu, and the id of a plain trigger this
   * component never renders before that. Both halves are Ark's; see the class
   * note.
   */
  protected labelledBy(): string {
    return this.pointer.anchored ? this.partId("ctx-trigger") : this.partId("trigger");
  }

  show(): void {
    this.setOpen(true);
  }
  hide(): void {
    this.setOpen(false);
  }

  /** Called by the trigger on right-click (or long-press). */
  openAt(point: AnchorPoint, trigger: HTMLElement): void {
    this.trigger = trigger;
    this.pending = point;
    // A second right-click while open has to move the menu, and `sync` only
    // runs on a *change* of state — so re-place it here as well.
    if (this.open()) this.place();
    this.setOpen(true);
  }

  rememberTrigger(element: HTMLElement | null): void {
    this.trigger = element;
  }

  register(item: ContextMenuItemHandle): void {
    this.items.push(item);
  }
  unregister(item: ContextMenuItemHandle): void {
    this.items = this.items.filter((candidate) => candidate !== item);
  }

  /** The pointer highlights exactly as the keyboard does — see `UioMenu`. */
  highlight(value: string | null): void {
    this.highlighted.set(value);
  }

  choose(value: string): void {
    this.select.emit(value);
    this.hide();
  }

  private contentElement(): HTMLElement | null {
    return (
      this.pointer.overlayRef?.overlayElement.querySelector<HTMLElement>('[data-part="content"]') ??
      null
    );
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
    if (open) this.applyOpen();
    else this.applyClose();
  }

  private place(): void {
    if (!this.pending) return;
    // Refreshed first: while closed the popup is `hidden` and has no size, and
    // the CDK chooses a candidate by asking which one fits.
    this.surfaceView?.detectChanges();
    this.pointer.placeAt(this.pending);
  }

  private applyOpen(): void {
    this.applied = true;
    const ref = this.pointer.overlayRef;
    if (!ref) return;
    this.surfaceView?.detectChanges();
    this.place();
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
    const ref = this.pointer.overlayRef;
    if (ref) setSurfaceInteractive(ref, false);
    restoreFocus(this.trigger);
  }

  private ordered(): ContextMenuItemHandle[] {
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
        // the page behind.
        this.hide();
        return;
      default:
        return;
    }
  }
}

/**
 * The area a right-click opens the menu over.
 *
 * A directive on the caller's own element rather than a component, because the
 * target is arbitrary content — a row, a canvas, a card — and Ark projects its
 * own `ContextTrigger` onto a plain `div` for exactly that reason. The
 * `user-select` inline style is Ark's too: without it a long-press on touch
 * starts a text selection instead of opening the menu.
 */
@Directive({
  selector: "[uioContextMenuTrigger]",
  standalone: true,
  host: {
    style: "user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;",
    "[id]": "contextMenu ? contextMenu.partId('ctx-trigger') : null",
    "[attr.data-ownedby]": "contextMenu ? contextMenu.machine : null",
    "(contextmenu)": "onContextMenu($event)",
    "(pointerdown)": "onPointerDown($event)",
    "(pointermove)": "cancelLongPress()",
    "(pointerup)": "cancelLongPress()",
    "(pointercancel)": "cancelLongPress()",
  },
})
export class UioContextMenuTrigger extends UioPart implements OnInit, OnDestroy {
  readonly scope = "menu";
  readonly part = "context-trigger";

  /** A decorator input — see `UioDialogTrigger` for why this one is not `input()`. */
  @Input("contextMenu") contextMenu?: UioContextMenu;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private timer?: ReturnType<typeof setTimeout>;

  override readonly state = computed(() => (this.contextMenu?.open() ? "open" : "closed"));

  ngOnInit(): void {
    this.contextMenu?.rememberTrigger(this.host.nativeElement);
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }

  protected onContextMenu(event: MouseEvent): void {
    if (!this.contextMenu) return;
    // Prevented, or the browser's own menu opens on top of this one.
    event.preventDefault();
    this.contextMenu.openAt({ x: event.clientX, y: event.clientY }, this.host.nativeElement);
  }

  /**
   * The touch equivalent of a right-click: press and hold.
   *
   * Mouse pointers are ignored — they have `contextmenu` — and any movement
   * cancels, so a scroll that starts on the trigger is a scroll rather than a
   * menu appearing under the user's thumb.
   */
  protected onPointerDown(event: PointerEvent): void {
    if (event.pointerType === "mouse" || !this.contextMenu) return;
    const point = { x: event.clientX, y: event.clientY };
    clearTimeout(this.timer);
    this.timer = setTimeout(
      () => this.contextMenu?.openAt(point, this.host.nativeElement),
      LONG_PRESS,
    );
  }

  protected cancelLongPress(): void {
    clearTimeout(this.timer);
  }
}

/**
 * One action in a context menu.
 *
 * A `div` with `role="menuitem"` rather than a `button`, because that is what
 * Ark renders and because `role="menu"` admits no other children.
 */
@Component({
  selector: "[uioContextMenuItem]",
  standalone: true,
  imports: [UioIcon],
  template: `
    @if (icon(); as name) {
      <span uioIcon class="context-menu__item-icon" [name]="name" [size]="ICON_SIZE"></span>
    }
    <span class="context-menu__item-label"><ng-content /></span>
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
export class UioContextMenuItem extends UioPart implements OnInit, OnDestroy {
  readonly scope = "menu";
  readonly part = "item";

  /** Optional, and falls back to a generated id — the same fork React takes. */
  readonly value = input<string | undefined>(undefined);
  readonly icon = input<CanonicalIconName | undefined>(undefined);
  /** Red text at rest, filling solid on highlight — the destructive-ghost button. */
  readonly destructive = input(false, { transform: booleanAttribute });
  override readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly menu = inject(UioContextMenu);
  protected readonly ICON_SIZE = ITEM_ICON_SIZE;
  protected readonly hostClass = computed(() =>
    clsx("context-menu__item", this.destructive() && "context-menu__item--destructive"),
  );

  private readonly generated = nextMachineId();
  protected readonly itemValue = computed(() => this.value() ?? this.generated);

  override readonly highlighted = computed(() => this.menu.highlighted() === this.itemValue());

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Registration rather than a content query — see `UioMenuItem` for why. */
  private readonly handle: ContextMenuItemHandle = {
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
 * The surface is the design system's Divider with Ark's separator identity
 * merged onto it. React does that with `asChild`; Angular has no such thing and
 * cannot put two components on one element, so the class is composed from
 * `dividerStyles` directly. Same rendered element, one fewer indirection.
 */
@Directive({
  selector: "[uioContextMenuSeparator]",
  standalone: true,
  host: {
    role: "separator",
    "aria-orientation": "horizontal",
    "[class]": "hostClass",
  },
})
export class UioContextMenuSeparator extends UioPart {
  readonly scope = "menu";
  readonly part = "separator";
  protected readonly hostClass = clsx(
    dividerStyles({ orientation: "horizontal", spacing: "none" }),
    "context-menu__separator",
  );
}

/** The id a group and its label share, so the one can name the other. */
@Injectable()
export class UioContextMenuGroupContext {
  private readonly menu = inject(UioContextMenu);
  private readonly key = nextMachineId();

  get groupId(): string {
    return this.menu.partId(`group:${this.key}`);
  }
  get labelId(): string {
    return this.menu.partId(`group-label:${this.key}`);
  }
}

/**
 * A titled block of related actions.
 *
 * `aria-labelledby` points at the label whether or not one was written, which
 * is Ark's own behaviour rather than an oversight copied — zag builds both ids
 * from the same key and never checks that the label exists. A group with no
 * label therefore ships a dangling reference in all four libraries alike, and
 * the fix belongs upstream.
 */
@Directive({
  selector: "[uioContextMenuGroup]",
  standalone: true,
  providers: [UioContextMenuGroupContext],
  host: {
    class: "context-menu__group",
    role: "group",
    "[id]": "group.groupId",
    "[attr.aria-labelledby]": "group.labelId",
  },
})
export class UioContextMenuGroup extends UioPart {
  readonly scope = "menu";
  readonly part = "item-group";
  protected readonly group = inject(UioContextMenuGroupContext);
}

/** Names the group above it. */
@Directive({
  selector: "[uioContextMenuGroupLabel]",
  standalone: true,
  host: {
    class: "context-menu__group-label text-strong-body-small",
    "[id]": "group.labelId",
  },
})
export class UioContextMenuGroupLabel extends UioPart {
  readonly scope = "menu";
  readonly part = "item-group-label";
  protected readonly group = inject(UioContextMenuGroupContext);
}

/**
 * A togglable action, drawn with the design system's checkbox control.
 *
 * The check is driven by the *item's* `data-state`, not by the control's own —
 * `.context-menu__item--check[data-state="checked"] .checkbox__indicator` is the
 * rule, which is why the control below is inert markup rather than a
 * `UioCheckbox`. A real checkbox inside a `role="menu"` would bring an input,
 * its own focus, and a second thing to tab to.
 */
@Component({
  selector: "[uioContextMenuCheckboxItem]",
  standalone: true,
  imports: [UioIcon],
  template: `
    <span class="checkbox__control context-menu__control">
      <span class="checkbox__indicator">
        <span uioIcon class="checkbox__check" name="check" [size]="CHECK_SIZE"></span>
      </span>
    </span>
    <span class="context-menu__item-label"><ng-content /></span>
  `,
  host: {
    class: "context-menu__item context-menu__item--check",
    "data-type": "checkbox",
    role: "menuitemcheckbox",
    "[id]": "menu.itemId(itemValue())",
    "[attr.data-ownedby]": "menu.partId('content')",
    "[attr.data-value]": "itemValue()",
    "[attr.aria-checked]": "checked()",
    "[attr.aria-disabled]": "disabled() ? 'true' : null",
    "(click)": "toggle()",
    "(pointermove)": "menu.highlight(disabled() ? null : itemValue())",
    "(pointerleave)": "menu.highlight(null)",
  },
})
export class UioContextMenuCheckboxItem extends UioPart implements OnInit, OnDestroy {
  readonly scope = "menu";
  readonly part = "item";

  readonly value = input<string | undefined>(undefined);
  readonly checked = model(false);
  readonly checkedChange = output<boolean>();
  override readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly menu = inject(UioContextMenu);
  protected readonly CHECK_SIZE = CHECK_ICON_SIZE;

  private readonly generated = nextMachineId();
  protected readonly itemValue = computed(() => this.value() ?? this.generated);

  /** `checked`/`unchecked` rather than `open`/`closed` — zag's spelling for an option item. */
  override readonly state = computed(() => (this.checked() ? "checked" : "unchecked"));
  override readonly highlighted = computed(() => this.menu.highlighted() === this.itemValue());

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly handle: ContextMenuItemHandle = {
    element: this.host.nativeElement,
    value: () => this.itemValue(),
    disabled: () => this.disabled(),
    choose: () => this.toggle(),
  };

  ngOnInit(): void {
    this.menu.register(this.handle);
  }
  ngOnDestroy(): void {
    this.menu.unregister(this.handle);
  }

  protected toggle(): void {
    if (this.disabled()) return;
    const next = !this.checked();
    this.checked.set(next);
    this.checkedChange.emit(next);
    // A checkbox item does not close the menu: toggling several in a row is the
    // whole reason it is a checkbox rather than an action.
  }
}

/** One choice at a time, shared by the radio items inside it. */
@Injectable()
export class UioContextMenuRadioContext {
  readonly value = signal<string | null>(null);
  choose: (value: string) => void = () => {};
}

/**
 * A set of mutually exclusive choices.
 *
 * Not an Ark part in its own right — `RadioItemGroup` renders the same
 * `item-group` element a plain group does — so this carries the group's
 * identity and, additionally, the selected value its items read.
 */
@Directive({
  selector: "[uioContextMenuRadioGroup]",
  standalone: true,
  providers: [UioContextMenuGroupContext, UioContextMenuRadioContext],
  host: {
    class: "context-menu__group",
    role: "group",
    "[id]": "group.groupId",
    "[attr.aria-labelledby]": "group.labelId",
  },
})
export class UioContextMenuRadioGroup extends UioPart {
  readonly scope = "menu";
  readonly part = "item-group";

  readonly value = model<string | null>(null);
  readonly valueChange = output<string>();

  protected readonly group = inject(UioContextMenuGroupContext);
  private readonly radio = inject(UioContextMenuRadioContext);

  constructor() {
    super();
    this.radio.choose = (value) => {
      this.value.set(value);
      this.valueChange.emit(value);
    };
    // The context holds a plain signal rather than the model itself, so that a
    // spec replacing the input after construction — which is the only way a JIT
    // fixture can set one — still reaches the items. Same reason
    // `UioCollapsible` wraps its `disabled`.
    effect(() => this.radio.value.set(this.value()));
  }
}

/** One choice, drawn with the design system's radio control. */
@Component({
  selector: "[uioContextMenuRadioItem]",
  standalone: true,
  template: `
    <span class="radio-item__control context-menu__control">
      <span class="radio-item__indicator"></span>
    </span>
    <span class="context-menu__item-label"><ng-content /></span>
  `,
  host: {
    class: "context-menu__item context-menu__item--check",
    "data-type": "radio",
    role: "menuitemradio",
    "[id]": "menu.itemId(value())",
    "[attr.data-ownedby]": "menu.partId('content')",
    "[attr.data-value]": "value()",
    "[attr.aria-checked]": "isChecked()",
    "[attr.aria-disabled]": "disabled() ? 'true' : null",
    "(click)": "choose()",
    "(pointermove)": "menu.highlight(disabled() ? null : value())",
    "(pointerleave)": "menu.highlight(null)",
  },
})
export class UioContextMenuRadioItem extends UioPart implements OnInit, OnDestroy {
  readonly scope = "menu";
  readonly part = "item";

  /** Required: a radio item is identified by the value it selects. */
  readonly value = input.required<string>();
  override readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly menu = inject(UioContextMenu);
  private readonly radio = inject(UioContextMenuRadioContext);

  protected readonly isChecked = computed(() => this.radio.value() === this.value());
  override readonly state = computed(() => (this.isChecked() ? "checked" : "unchecked"));
  override readonly highlighted = computed(() => this.menu.highlighted() === this.value());

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly handle: ContextMenuItemHandle = {
    element: this.host.nativeElement,
    value: () => this.value(),
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
    this.radio.choose(this.value());
    this.menu.choose(this.value());
  }
}
