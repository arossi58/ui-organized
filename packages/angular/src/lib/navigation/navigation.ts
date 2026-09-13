import { NgTemplateOutlet } from "@angular/common";
import {
  Component,
  Directive,
  TemplateRef,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
} from "@angular/core";
import { clsx } from "clsx";
import { navItemStyles, navSubItemStyles } from "@ui-organized/core";
import type { CanonicalIconName } from "@ui-organized/utils";
import { nextMachineId } from "../part-ids.js";
import { UioIcon } from "../icons/icon.js";
import { UioNavContext } from "./nav-context.js";

/** The sizes every library asks `Icon` for in each position. */
const ITEM_ICON_SIZE = 18;
const CARET_SIZE = 20;
const SUB_ICON_SIZE = 20;
const TOGGLE_ICON_SIZE = 20;

/**
 * One sub-page in an expandable `UioNavItem`'s list.
 *
 * Data rather than a component the caller places *inside the item*, which is the
 * one shape difference from the other three libraries and is deliberate.
 * `UioNavItem` has to know whether it has sub-items *before* it renders — that
 * is what decides the caret, `aria-expanded`, `aria-controls` and the panel —
 * and a content query cannot answer that: the query populates from
 * `<ng-content>`, which lives inside the very `@if` the answer controls. Every
 * other collection in this package resolves the same problem the same way
 * (`TabItem`, `AccordionItem`, `RadioOption`, `SelectOption`).
 *
 * The button itself is still a component — {@link UioNavSubItem} — and the item
 * renders this data through it, so there is one implementation rather than two.
 * Reach for it directly to place a sub-page outside an item's list.
 */
export interface NavSubItem {
  /** Text label for the sub-page. */
  label: string;
  /** Optional leading icon. */
  icon?: CanonicalIconName;
  /** Marks this sub-page as the current page. */
  selected?: boolean;
  disabled?: boolean;
}

/**
 * A sub-page button, on its own.
 *
 * ```html
 * <button uioNavSubItem label="Weekly" icon="chart" selected></button>
 * ```
 *
 * `UioNavItem` renders each of its `subItems` through this, so the two spellings
 * cannot drift. Written directly it also reaches the one state the list form
 * cannot: an item suppresses its whole sub-list on a collapsed rail, so
 * `nav-sub-item--collapsed` and the `title` that replaces the hidden label are
 * only ever visible on a sub-item placed by hand.
 */
@Component({
  selector: "button[uioNavSubItem]",
  standalone: true,
  imports: [UioIcon],
  template: `
    @if (icon(); as name) {
      <span uioIcon class="nav-sub-item__icon" [name]="name" [size]="SUB_ICON_SIZE"></span>
    }
    <span class="nav-sub-item__label">{{ label() }}</span>
  `,
  host: {
    type: "button",
    "[class]": "hostClass()",
    "[disabled]": "disabled()",
    "[attr.aria-current]": "selected() ? 'page' : null",
    // The label is out of sight on a rail, so the accessible name has to come
    // from somewhere the pointer can reach. Same trick `UioNavItem` uses.
    "[attr.title]": "isCollapsed() ? label() : null",
  },
})
export class UioNavSubItem {
  /** Text label for the sub-page. */
  readonly label = input("");
  readonly icon = input<CanonicalIconName | undefined>(undefined);
  /** Marks this sub-page as the current page. */
  readonly selected = input(false, { transform: booleanAttribute });
  /**
   * Render as an icon-only rail. Tri-state: left unset it inherits the
   * surrounding `UioNavProvider`'s rail — see `UioNavItem.collapsed`.
   */
  readonly collapsed = input<boolean | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Optional, so a sub-item outside any sidebar renders uncollapsed. */
  private readonly nav = inject(UioNavContext, { optional: true });

  protected readonly SUB_ICON_SIZE = SUB_ICON_SIZE;

  protected readonly isCollapsed = computed(
    () => this.collapsed() ?? this.nav?.collapsed() ?? false,
  );

  protected readonly hostClass = computed(() =>
    clsx(
      "text-default-body-medium",
      navSubItemStyles({ selected: this.selected() }),
      this.isCollapsed() && "nav-sub-item--collapsed",
    ),
  );
}

/**
 * Shares a rail with every `UioNavItem` below it.
 *
 * `UioSidebar` provides this itself; reach for the bare provider only when
 * building a container of your own.
 *
 * ```html
 * <div uioNavProvider [collapsed]="rail()">…</div>
 * ```
 *
 * A directive on the caller's own element rather than a wrapper component,
 * because React's `NavProvider` renders no element and an `<uio-nav-provider>`
 * would be one the other three libraries do not have.
 */
@Directive({
  selector: "[uioNavProvider]",
  standalone: true,
  providers: [UioNavContext],
})
export class UioNavProvider {
  /** Collapse all descendant nav items to an icon-only rail. */
  readonly collapsed = input(false, { transform: booleanAttribute });

  constructor() {
    inject(UioNavContext).connect(this.collapsed);
  }
}

/**
 * The sidebar shell: a logo region, a scrollable nav landmark, and a footer that
 * can carry the collapse toggle.
 *
 * ```html
 * <div uioSidebar collapsible logo="Acme">
 *   <div uioNavItem label="Home" icon="home" selected></div>
 *   <div uioNavItem label="Reports" icon="chart" [subItems]="reports"></div>
 * </div>
 * ```
 *
 * Ark UI has no Navigation primitive, so everything here — the landmark, the
 * collapse, the rail shared with descendants — is this library's own, and the
 * root carries no `data-scope`/`data-part`. It therefore does not extend
 * `UioPart`, for the same reason `UioToolbar` does not.
 *
 * There is no `defaultCollapsed`: `model()` is uncontrolled until something
 * binds it, so `[collapsed]="true"` is both an initial value and a bound one and
 * the controlled/uncontrolled fork React implements by hand does not arise —
 * the same note `UioSwitch` carries.
 */
@Component({
  selector: "div[uioSidebar]",
  standalone: true,
  exportAs: "uioSidebar",
  imports: [NgTemplateOutlet, UioIcon],
  providers: [UioNavContext],
  template: `
    @if (hasLogo()) {
      <div class="sidebar__logo">
        @if (asTemplate(logoNode()); as template) {
          <ng-container [ngTemplateOutlet]="template" />
        } @else {
          {{ logoNode() }}
        }
      </div>
    }

    <nav class="sidebar__nav" [attr.aria-label]="navLabel()"><ng-content /></nav>

    @if (showFooter()) {
      <div class="sidebar__footer">
        @if (footer() != null) {
          <div class="sidebar__footer-content">
            @if (asTemplate(footer()); as template) {
              <ng-container [ngTemplateOutlet]="template" />
            } @else {
              {{ footer() }}
            }
          </div>
        }
        @if (collapsible()) {
          <button
            type="button"
            class="sidebar__toggle text-default-body-medium"
            [attr.aria-expanded]="!collapsed()"
            [attr.aria-label]="collapsed() ? 'Expand sidebar' : 'Collapse sidebar'"
            [attr.title]="collapsed() ? 'Expand' : 'Collapse'"
            (click)="toggle()"
          >
            <span
              uioIcon
              class="sidebar__toggle-icon"
              [name]="collapsed() ? 'chevron-right' : 'chevron-left'"
              [size]="TOGGLE_ICON_SIZE"
            ></span>
            <span class="sidebar__toggle-label">{{ collapsed() ? "Expand" : "Collapse" }}</span>
          </button>
        }
      </div>
    }
  `,
  host: { "[class]": "hostClass()" },
})
export class UioSidebar {
  /** Logo / wordmark pinned to the top. A string, or a template for markup. */
  readonly logo = input<string | TemplateRef<unknown> | undefined>(undefined);
  /** Compact mark shown when collapsed. Falls back to `logo` when omitted. */
  readonly logoCollapsed = input<string | TemplateRef<unknown> | undefined>(undefined);
  /** Footer region pinned to the bottom, above the collapse toggle. */
  readonly footer = input<string | TemplateRef<unknown> | undefined>(undefined);
  /** Accessible label for the inner nav landmark. */
  readonly navLabel = input("Primary");
  /**
   * Allow collapsing to an icon-only rail. When true, a working expand/collapse
   * toggle is rendered in the footer automatically — which is why the footer
   * region can appear with no footer content in it at all.
   */
  readonly collapsible = input(false, { transform: booleanAttribute });
  readonly collapsed = model(false);
  readonly collapsedChange = output<boolean>();

  private readonly nav = inject(UioNavContext);

  protected readonly TOGGLE_ICON_SIZE = TOGGLE_ICON_SIZE;

  constructor() {
    // Connected rather than pushed, so descendants read this very signal and
    // never render a frame behind it — see `UioNavContext`.
    this.nav.connect(this.collapsed);
  }

  /** A rail has room for a mark but not a wordmark; fall back when there is no compact one. */
  protected readonly logoNode = computed(() =>
    this.collapsed() ? (this.logoCollapsed() ?? this.logo()) : this.logo(),
  );
  protected readonly hasLogo = computed(() => this.logo() != null || this.logoCollapsed() != null);
  protected readonly showFooter = computed(() => this.footer() != null || this.collapsible());
  protected readonly hostClass = computed(() =>
    clsx("sidebar", this.collapsed() && "sidebar--collapsed"),
  );

  protected asTemplate(
    node: string | TemplateRef<unknown> | undefined,
  ): TemplateRef<unknown> | null {
    return node instanceof TemplateRef ? node : null;
  }

  protected toggle(): void {
    const next = !this.collapsed();
    this.collapsed.set(next);
    this.collapsedChange.emit(next);
  }
}

/**
 * One page in a sidebar. Give it `subItems` to make it expandable.
 *
 * ```html
 * <div uioNavItem label="Reports" icon="chart" [subItems]="reports"></div>
 * ```
 *
 * An icon-only rail has no room for an inline sub-list, so a collapsed item
 * loses its caret, its `aria-expanded`/`aria-controls` and its panel — the state
 * most likely to be got wrong, because an item that ignored the rail renders a
 * full-width label inside a 56px column with nothing else visibly amiss.
 */
@Component({
  selector: "div[uioNavItem]",
  standalone: true,
  exportAs: "uioNavItem",
  imports: [UioIcon, UioNavSubItem],
  template: `
    <button
      type="button"
      [class]="triggerClass()"
      [disabled]="disabled()"
      [attr.aria-current]="selected() ? 'page' : null"
      [attr.aria-expanded]="showSubList() ? expanded() : null"
      [attr.aria-controls]="showSubList() ? subListId : null"
      [attr.title]="isCollapsed() ? label() : null"
      (click)="toggle()"
    >
      <span class="nav-item__content">
        @if (icon(); as name) {
          <span uioIcon class="nav-item__icon" [name]="name" [size]="ITEM_ICON_SIZE"></span>
        }
        <span class="nav-item__label">{{ label() }}</span>
      </span>
      @if (showSubList()) {
        <span
          uioIcon
          class="nav-item__caret"
          [name]="expanded() ? 'chevron-up' : 'chevron-down'"
          [size]="CARET_SIZE"
        ></span>
      }
    </button>
    @if (showSubList()) {
      <!--
        role="group", not list: the sub-items are buttons, and a list may only
        contain listitems — the mismatch is an ARIA error. What the panel
        actually is here is the disclosure the button above expands.
      -->
      <div [id]="subListId" class="nav-item__sub-list" role="group">
        <div class="nav-item__sub-list-inner">
          @for (sub of subItems(); track $index) {
            <!--
              Through the component rather than repeating its markup, so the
              placed spelling and the data one cannot drift. "collapsed" is
              passed explicitly rather than inherited: this item's own rail may
              differ from the provider's, and the sub-item would otherwise read
              the wrong one.
            -->
            <button
              uioNavSubItem
              [label]="sub.label"
              [icon]="sub.icon"
              [selected]="!!sub.selected"
              [disabled]="!!sub.disabled"
              [collapsed]="isCollapsed()"
            ></button>
          }
        </div>
      </div>
    }
  `,
  host: { "[class]": "hostClass()" },
})
export class UioNavItem {
  /** Text label for the page. */
  readonly label = input("");
  readonly icon = input<CanonicalIconName | undefined>(undefined);
  /** Marks this page as the current page — the filled, emphasized appearance. */
  readonly selected = input(false, { transform: booleanAttribute });
  /**
   * Render as an icon-only rail. Tri-state: left unset it inherits the
   * surrounding `UioSidebar`'s rail, which is the whole point of the context —
   * a `false` default would pin every item open inside a collapsed sidebar.
   */
  readonly collapsed = input<boolean | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Sub-pages shown beneath the item when expanded. Providing any makes it expandable. */
  readonly subItems = input<readonly NavSubItem[]>([]);
  /** Uncontrolled until something binds it — see `UioSidebar.collapsed`. */
  readonly expanded = model(false);
  readonly expandedChange = output<boolean>();

  /**
   * Optional, so an item used outside any sidebar renders uncollapsed rather
   * than throwing a `NullInjectorError` — the fallback React's `useContext`
   * default gives it for free.
   */
  private readonly nav = inject(UioNavContext, { optional: true });

  protected readonly ITEM_ICON_SIZE = ITEM_ICON_SIZE;
  protected readonly CARET_SIZE = CARET_SIZE;

  /**
   * React uses `useId()` here; the literal is not the contract, since the parity
   * gate numbers every id positionally. What is, is that the trigger's
   * `aria-controls` names the panel it opens and names nothing when there is
   * none — a dangling IDREF is the failure this drops the attribute to avoid.
   */
  protected readonly subListId = `nav-item:${nextMachineId()}:sub-list`;

  protected readonly isCollapsed = computed(
    () => this.collapsed() ?? this.nav?.collapsed() ?? false,
  );
  /** An icon-only rail has no room for an inline sub-list, so suppress it. */
  protected readonly showSubList = computed(
    () => this.subItems().length > 0 && !this.isCollapsed(),
  );

  protected readonly hostClass = computed(() =>
    clsx(
      "nav-item",
      this.isCollapsed() && "nav-item--collapsed",
      this.showSubList() && this.expanded() && "nav-item--expanded",
    ),
  );
  protected readonly triggerClass = computed(() =>
    clsx(
      "text-default-body-medium",
      navItemStyles({ selected: this.selected(), expandable: this.showSubList() }),
    ),
  );

  /**
   * A sub-item never carries the collapsed treatment, and that is not an
   * omission: a collapsed rail suppresses the sub-list entirely, so a collapsed
   * sub-item cannot be on screen to be styled.
   */
  protected toggle(): void {
    if (!this.showSubList()) return;
    const next = !this.expanded();
    this.expanded.set(next);
    this.expandedChange.emit(next);
  }
}
