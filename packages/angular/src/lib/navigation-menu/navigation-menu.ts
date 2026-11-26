import {
  Component,
  DOCUMENT,
  ElementRef,
  OnDestroy,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  untracked,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import {
  NAVIGATION_MENU_CHEVRON_SIZE,
  NAVIGATION_MENU_CLASS,
  NAVIGATION_MENU_CLOSE_DELAY,
  NAVIGATION_MENU_LINK_ICON_SIZE,
  NAVIGATION_MENU_OPEN_DELAY,
  navigationMenuContentStyles,
  type NavigationMenuColumns,
} from "@ui-organized/core";
import { stateFlag } from "../part.js";
import { nextMachineId } from "../part-ids.js";
import { UioIcon, type IconName } from "../icons/icon.js";
import { glyph, type IconGlyph } from "../icons/glyph.js";
import { pushLayer, removeLayer, type DismissibleLayer } from "../overlay/dismiss.js";

export type { NavigationMenuColumns };

type Key = "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight" | "Home" | "End";
const NAVIGATION_KEYS = new Set<string>([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
]);

/**
 * zag's `navigate`: the element a key moves to, or null when it moves nowhere.
 * It never wraps, and at either end it returns the element it started on, so
 * the key is still consumed. Left to right only, as the menu is.
 */
function navigate(
  items: readonly HTMLElement[],
  current: Element | null,
  key: string,
  orientation: "horizontal" | "both",
): HTMLElement | null {
  if (!current || !items.length || !NAVIGATION_KEYS.has(key)) return null;
  const vertical = key === "ArrowUp" || key === "ArrowDown";
  if (orientation === "horizontal" && vertical) return null;
  if (key === "Home") return items[0] ?? null;
  if (key === "End") return items[items.length - 1] ?? null;
  const index = items.indexOf(current as HTMLElement);
  if (index === -1) return null;
  const forward = (key as Key) === "ArrowDown" || key === "ArrowRight";
  return items[forward ? Math.min(index + 1, items.length - 1) : Math.max(0, index - 1)] ?? null;
}

/** zag's focusable selector, less the media and frame elements a menu panel does not hold. */
const FOCUSABLE =
  "input:not([type='hidden']):not([disabled]), select:not([disabled]), " +
  "textarea:not([disabled]), a[href], button:not([disabled]), [tabindex], " +
  "[contenteditable]:not([contenteditable='false']), details > summary:first-of-type";

/**
 * What zag's `getTabbables` returns: focusable, rendered, and not taken out of
 * the tab order. "Rendered" is the part that matters here, because a closed
 * panel is `hidden` and so has nothing tabbable in it.
 */
function tabbables(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  return [...container.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => {
    if (el.tabIndex > 0) return true;
    if (el.closest("[inert]")) return false;
    const visible = el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
    return visible && parseInt(el.getAttribute("tabindex") || "0", 10) >= 0;
  });
}

/**
 * A site's top navigation: triggers that each open a panel of links, and links
 * that go straight to a page.
 *
 * ```html
 * <nav uioNavigationMenu aria-label="Main">
 *   <div uioNavigationMenuItem value="product" label="Product">
 *     <a uioNavigationMenuLink href="/reports" description="Charts of every metric.">Reports</a>
 *   </div>
 *   <div uioNavigationMenuItem value="pricing" label="Pricing" href="/pricing"></div>
 * </nav>
 * ```
 *
 * ── zag's machine, by hand ──────────────────────────────────────────────────
 *
 * The other three libraries run zag's navigation-menu machine, and this is that
 * machine for a menu with no viewport, which is the only kind this library
 * makes. Each panel renders under its own item and is `hidden` while closed.
 *
 *  - **Hover**, with a mouse only: resting on a trigger opens its panel after
 *    `openDelay`, or at once when another panel is already open. Leaving the
 *    trigger or the panel closes it after `closeDelay`, and entering either
 *    cancels that.
 *  - **Click** toggles a panel.
 *  - **Keys**: Left, Right, Home and End move along the bar without wrapping,
 *    and ArrowDown on a trigger, while a panel is open, moves into it. In a
 *    panel every arrow moves between its links. Tab is the browser's own.
 *  - **Dismissal**: Escape, a press outside the panel and its triggers, or
 *    focus leaving the menu closes it; Escape and the rest put focus back on
 *    the trigger when it was inside the panel. A followed link closes it too.
 *  - **Tab order**: when focus leaves an open panel, or a dismissal closes it,
 *    zag takes the panel's links out of the tab order (`tabindex="-1"`, the old
 *    value kept in `data-tabindex`) and puts them back on the next change.
 *    Reproduced exactly, `data-tabindex` and all, because the parity gate
 *    compares `data-*` and it is what zag leaves on the page.
 */
@Component({
  selector: "nav[uioNavigationMenu]",
  standalone: true,
  exportAs: "uioNavigationMenu",
  template: `
    <div
      class="navigation-menu__list"
      data-scope="navigation-menu"
      data-part="list"
      data-orientation="horizontal"
      [id]="rootId + ':list'"
    >
      <ng-content />
    </div>
  `,
  host: {
    class: "navigation-menu",
    "data-scope": "navigation-menu",
    "data-part": "root",
    "data-orientation": "horizontal",
    "[id]": "rootId",
    "[attr.value]": "null",
  },
})
export class UioNavigationMenu implements OnDestroy {
  /** The open item's `value`, or `""` when every panel is closed. Two-way: `[(value)]`. */
  readonly value = model<string>("");
  /** How long a pointer rests on a trigger before its panel opens, in ms. Defaults to 200. */
  readonly openDelay = input(NAVIGATION_MENU_OPEN_DELAY);
  /** How long a panel stays open after the pointer leaves it, in ms. Defaults to 300. */
  readonly closeDelay = input(NAVIGATION_MENU_CLOSE_DELAY);

  readonly machine = nextMachineId();
  /** zag's prefix, which is not the scope: `nav-menu:`, while parts say `navigation-menu`. */
  readonly rootId = `nav-menu:${this.machine}`;

  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  private closeTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly openTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private restoreTabOrder?: () => void;
  private listening = false;

  private readonly layer: DismissibleLayer = {
    surface: () => this.contentElement(this.value()),
    trigger: () => null,
    contains: (target) => this.triggerElements().some((trigger) => trigger.contains(target)),
    dismiss: () => this.close(this.value()),
  };

  constructor() {
    // zag's `watch` on the value: put the last panel's links back in the tab
    // order, and track the open panel for dismissal.
    effect(() => {
      const value = this.value();
      untracked(() => {
        this.restoreTabOrder?.();
        if (value) {
          pushLayer(this.document, this.layer);
          this.listen(true);
        } else {
          removeLayer(this.layer);
          this.listen(false);
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.clearCloseTimer();
    this.clearOpenTimers();
    removeLayer(this.layer);
    this.listen(false);
  }

  itemId(value: string): string {
    return `${this.rootId}:item:${value}`;
  }
  triggerId(value: string): string {
    return `${this.rootId}:trigger:${value}`;
  }
  triggerProxyId(value: string): string {
    return `${this.rootId}:trigger-proxy:${value}`;
  }
  contentId(value: string): string {
    return `${this.rootId}:content:${value}`;
  }

  // ── Pointer ──────────────────────────────────────────────────────────────

  /** @internal */
  triggerEnter(event: PointerEvent, value: string, disabled: boolean): void {
    if (event.pointerType !== "mouse" || disabled) return;
    this.clearCloseTimer();
    const skipDelay = this.value() !== "";
    // A timeout inside a timeout, as zag schedules it: only the outer one can
    // be cancelled by leaving the trigger.
    const timer = setTimeout(
      () => setTimeout(() => this.value.set(value)),
      skipDelay ? 0 : this.openDelay(),
    );
    this.openTimers.set(value, timer);
  }

  /** @internal */
  triggerLeave(event: PointerEvent, value: string, disabled: boolean): void {
    if (event.pointerType !== "mouse" || disabled) return;
    this.scheduleClose();
    const timer = this.openTimers.get(value);
    if (timer) clearTimeout(timer);
    this.openTimers.delete(value);
  }

  /** @internal */
  contentEnter(event: PointerEvent): void {
    if (event.pointerType !== "mouse") return;
    this.clearCloseTimer();
  }

  /** @internal */
  contentLeave(event: PointerEvent): void {
    if (event.pointerType !== "mouse") return;
    this.scheduleClose();
  }

  /** @internal */
  triggerClick(value: string): void {
    this.value.set(this.value() === value ? "" : value);
  }

  /** @internal A followed link closes the menu, unless it opens in a new tab with Meta. */
  linkClick(event: MouseEvent, closeOnClick: boolean): void {
    if (closeOnClick && !event.defaultPrevented && !event.metaKey) this.close();
  }

  // ── Keys ─────────────────────────────────────────────────────────────────

  /** @internal */
  triggerKeydown(event: KeyboardEvent): void {
    if (this.value() && event.key === "ArrowDown") {
      this.focusContent();
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.moveFocus(event, this.barElements(), "horizontal");
  }

  /**
   * @internal A link moves along whatever it belongs to: its panel's links, or
   * the bar. Up and Down find nothing here and bubble to the item.
   */
  linkKeydown(event: KeyboardEvent, value: string): void {
    const target = event.currentTarget as HTMLElement;
    const inPanel = target.closest('[data-scope="navigation-menu"][data-part="content"]');
    this.moveFocus(event, inPanel ? this.linkElements(value) : this.barElements(), "horizontal");
  }

  /** @internal Every arrow and Home and End stop at the item, which moves between its panel's links. */
  itemKeydown(event: KeyboardEvent, value: string): void {
    if (!NAVIGATION_KEYS.has(event.key)) return;
    const active = this.document.activeElement;
    const links = this.linkElements(value);
    if (active && links.includes(active as HTMLElement)) {
      navigate(links, active, event.key, "both")?.focus();
    }
    event.preventDefault();
    event.stopPropagation();
  }

  // ── State ────────────────────────────────────────────────────────────────

  /**
   * zag's `CLOSE`. A dismissal names the panel that was open, so focus can come
   * back from it and its links leave the tab order; a followed link names none.
   */
  close(value?: string): void {
    this.clearOpenTimers();
    this.value.set("");
    if (!value) return;
    const content = this.contentElement(value);
    if (content?.contains(this.document.activeElement)) {
      this.document.getElementById(this.triggerId(value))?.focus();
    }
    this.removeFromTabOrder(value);
  }

  private scheduleClose(): void {
    this.clearCloseTimer();
    this.closeTimer = setTimeout(() => this.value.set(""), this.closeDelay());
  }

  private clearCloseTimer(): void {
    if (this.closeTimer) clearTimeout(this.closeTimer);
    this.closeTimer = null;
  }

  private clearOpenTimers(): void {
    for (const timer of this.openTimers.values()) clearTimeout(timer);
    this.openTimers.clear();
  }

  private focusContent(): void {
    this.restoreTabOrder?.();
    const value = this.value();
    requestAnimationFrame(() => {
      const [first] = tabbables(this.contentElement(value));
      first?.focus();
    });
  }

  private removeFromTabOrder(value: string): void {
    const candidates = tabbables(this.contentElement(value));
    if (!candidates.length) return;
    for (const el of candidates) {
      el.dataset["tabindex"] = el.getAttribute("tabindex") || "";
      el.setAttribute("tabindex", "-1");
    }
    this.restoreTabOrder = () => {
      for (const el of candidates) el.setAttribute("tabindex", el.dataset["tabindex"] ?? "");
    };
  }

  private moveFocus(
    event: KeyboardEvent,
    items: readonly HTMLElement[],
    orientation: "horizontal" | "both",
  ): void {
    const next = navigate(items, event.currentTarget as Element, event.key, orientation);
    if (!next) return;
    next.focus();
    event.preventDefault();
    event.stopPropagation();
  }

  // ── Focus leaving the menu ───────────────────────────────────────────────

  private readonly onFocusIn = (event: FocusEvent): void => {
    const value = this.value();
    const target = event.target;
    if (!value || !(target instanceof HTMLElement)) return;
    if (this.contentElement(value)?.contains(target)) return;
    // Moving to a trigger, any menu's, is moving along the bar, not away.
    if (
      target.matches('[data-scope="navigation-menu"][data-part="trigger"], [data-trigger-proxy]')
    ) {
      return;
    }
    this.removeFromTabOrder(value);
    if (this.host.contains(target)) return;
    this.close(value);
  };

  private listen(on: boolean): void {
    if (on === this.listening) return;
    this.listening = on;
    if (on) this.document.addEventListener("focusin", this.onFocusIn);
    else this.document.removeEventListener("focusin", this.onFocusIn);
  }

  // ── DOM ──────────────────────────────────────────────────────────────────

  private contentElement(value: string): HTMLElement | null {
    return value ? this.document.getElementById(this.contentId(value)) : null;
  }

  private triggerElements(): HTMLElement[] {
    return [
      ...this.host.querySelectorAll<HTMLElement>(
        `[data-part="trigger"][data-uid="${this.machine}"]`,
      ),
    ];
  }

  /** The triggers that can be used and the links in the bar, in order. */
  private barElements(): HTMLElement[] {
    return [
      ...this.host.querySelectorAll<HTMLElement>(
        `[data-part="list"] [data-part="trigger"][data-uid="${this.machine}"]:not([data-disabled]), ` +
          `[data-part="list"] [data-part="item"] > [data-part="link"]`,
      ),
    ];
  }

  private linkElements(value: string): HTMLElement[] {
    const content = this.contentElement(value);
    if (!content) return [];
    return [
      ...content.querySelectorAll<HTMLElement>(
        `[data-part="link"][data-ownedby="${this.contentId(value)}"]`,
      ),
    ];
  }
}

/**
 * One entry in the bar. With a `label` it is a trigger and the panel it opens,
 * which holds the projected links; with `href` too, a link straight to that
 * page. With neither, its only content is a projected `a[uioNavigationMenuLink]`,
 * which is how a router link sits in the bar.
 *
 * ```html
 * <div uioNavigationMenuItem value="docs"><a uioNavigationMenuLink routerLink="/docs">Docs</a></div>
 * ```
 */
@Component({
  selector: "div[uioNavigationMenuItem]",
  standalone: true,
  imports: [NgTemplateOutlet, UioIcon],
  template: `
    <ng-template #body><ng-content /></ng-template>
    @if (href() != null) {
      <a
        [class]="classes.trigger"
        data-scope="navigation-menu"
        data-part="link"
        [attr.href]="href()"
        [attr.data-value]="value()"
        [attr.data-current]="flag(current())"
        [attr.aria-current]="current() ? 'page' : null"
        [attr.data-ownedby]="menu.contentId(value())"
        (click)="menu.linkClick($event, true)"
        (keydown)="menu.linkKeydown($event, value())"
        >{{ label() }}</a
      >
    } @else if (label() != null) {
      <button
        type="button"
        [class]="classes.trigger"
        data-scope="navigation-menu"
        data-part="trigger"
        [id]="menu.triggerId(value())"
        [attr.data-uid]="menu.machine"
        [attr.data-trigger-proxy-id]="menu.triggerProxyId(value())"
        [disabled]="disabled()"
        [attr.data-value]="value()"
        [attr.data-state]="state()"
        [attr.data-disabled]="flag(disabled())"
        [attr.aria-controls]="menu.contentId(value())"
        [attr.aria-expanded]="open()"
        (pointerenter)="menu.triggerEnter($event, value(), disabled())"
        (pointerleave)="menu.triggerLeave($event, value(), disabled())"
        (click)="menu.triggerClick(value())"
        (keydown)="menu.triggerKeydown($event)"
      >
        {{ label()
        }}<span uioIcon [class]="classes.chevron" [name]="chevron" [size]="chevronSize"></span>
      </button>
      <div
        [class]="contentClass()"
        data-scope="navigation-menu"
        data-part="content"
        data-orientation="horizontal"
        [id]="menu.contentId(value())"
        [attr.hidden]="open() ? null : ''"
        [attr.aria-labelledby]="menu.triggerId(value())"
        [attr.data-uid]="menu.machine"
        [attr.data-state]="state()"
        [attr.data-value]="value()"
        (pointerenter)="menu.contentEnter($event)"
        (pointerleave)="menu.contentLeave($event)"
      >
        <ng-container [ngTemplateOutlet]="body" />
      </div>
    } @else {
      <ng-container [ngTemplateOutlet]="body" />
    }
  `,
  host: {
    class: "navigation-menu__item",
    "data-scope": "navigation-menu",
    "data-part": "item",
    "data-orientation": "horizontal",
    "[id]": "menu.itemId(value())",
    "[attr.data-value]": "value()",
    "[attr.data-state]": "state()",
    "[attr.data-disabled]": "flag(disabled())",
    "(keydown)": "menu.itemKeydown($event, value())",
    // Inputs written as static attributes stay on the element otherwise, and a
    // stray `disabled` on a div is one the parity gate compares.
    "[attr.value]": "null",
    "[attr.label]": "null",
    "[attr.href]": "null",
    "[attr.current]": "null",
    "[attr.disabled]": "null",
    "[attr.columns]": "null",
  },
})
export class UioNavigationMenuItem {
  /** Names the item. Unique within the menu: it ends up in ids. */
  readonly value = input.required<string>();
  /** The text in the bar: a trigger's, or with `href` the link's. */
  readonly label = input<string | undefined>(undefined);
  /** Makes the item a link in the bar rather than a trigger. */
  readonly href = input<string | undefined>(undefined);
  /** With `href`: this item is the current page. */
  readonly current = input(false, { transform: booleanAttribute });
  /** The trigger can't be used. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** The panel's columns of links. Defaults to 1. */
  readonly columns = input<NavigationMenuColumns>(1);

  protected readonly menu = inject(UioNavigationMenu);
  protected readonly classes = NAVIGATION_MENU_CLASS;
  protected readonly chevron: IconGlyph = glyph("chevron-down");
  protected readonly chevronSize = NAVIGATION_MENU_CHEVRON_SIZE;
  protected readonly flag = stateFlag;

  /** A panel, which projected links sit in. */
  readonly hasPanel = computed(() => this.href() == null && this.label() != null);
  protected readonly open = computed(() => this.menu.value() === this.value());
  protected readonly state = computed(() => (this.open() ? "open" : "closed"));
  protected readonly contentClass = computed(() =>
    navigationMenuContentStyles({ columns: this.columns() }),
  );
}

/**
 * A link. In a trigger's panel it is a row with an optional icon and
 * description; as an item's only content it sits in the bar like a trigger.
 * The host is the anchor, so `routerLink` goes straight on it.
 */
@Component({
  selector: "a[uioNavigationMenuLink]",
  standalone: true,
  imports: [NgTemplateOutlet, UioIcon],
  template: `
    <ng-template #title><ng-content /></ng-template>
    @if (inPanel()) {
      @if (icon(); as name) {
        <span [class]="classes.linkIcon"
          ><span uioIcon [name]="name" [size]="iconSize"></span
        ></span>
      }
      <span [class]="classes.linkBody"
        ><span [class]="classes.linkTitle"><ng-container [ngTemplateOutlet]="title" /></span>
        @if (description() != null) {
          <span [class]="classes.linkDescription">{{ description() }}</span>
        }
      </span>
    } @else {
      <ng-container [ngTemplateOutlet]="title" />
    }
  `,
  host: {
    "[class]": "inPanel() ? classes.link : classes.trigger",
    "data-scope": "navigation-menu",
    "data-part": "link",
    "[attr.data-value]": "item.value()",
    "[attr.data-current]": "flag(current())",
    "[attr.aria-current]": "current() ? 'page' : null",
    "[attr.data-ownedby]": "menu.contentId(item.value())",
    "(click)": "menu.linkClick($event, closeOnClick())",
    "(keydown)": "menu.linkKeydown($event, item.value())",
    "[attr.current]": "null",
  },
})
export class UioNavigationMenuLink {
  /** This link is the current page. */
  readonly current = input(false, { transform: booleanAttribute });
  /** In a panel: an icon before the title. */
  readonly icon = input<IconName | IconGlyph | undefined>(undefined);
  /** In a panel: a line under the title. */
  readonly description = input<string | undefined>(undefined);
  /** Close the menu when the link is followed. Defaults to true. */
  readonly closeOnClick = input(true, { transform: booleanAttribute });

  protected readonly menu = inject(UioNavigationMenu);
  protected readonly item = inject(UioNavigationMenuItem);
  protected readonly classes = NAVIGATION_MENU_CLASS;
  protected readonly iconSize = NAVIGATION_MENU_LINK_ICON_SIZE;
  protected readonly flag = stateFlag;
  protected readonly inPanel = computed(() => this.item.hasPanel());
}
