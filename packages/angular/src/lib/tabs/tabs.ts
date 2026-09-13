import { NgTemplateOutlet } from "@angular/common";
import {
  ApplicationRef,
  Component,
  ElementRef,
  TemplateRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  type Signal,
} from "@angular/core";
import { tabsStyles, type TabsVariants } from "@ui-organized/core";
import { UioPart, stateFlag } from "../part.js";
import { nextMachineId } from "../part-ids.js";
import { flushNow } from "../overlay/flush.js";
import { firstFocusable } from "../overlay/focus.js";
import { moveHighlight } from "../overlay/roving.js";

export type TabsOrientation = NonNullable<TabsVariants["orientation"]>;
export type TabsSize = NonNullable<TabsVariants["size"]>;

export interface TabItem {
  /** Identifies the tab. Coerced to a string at the boundary, as Zag does. */
  value: string | number;
  label: string;
  /**
   * A string, or a template for anything richer.
   *
   * The other three libraries take a node here, which Angular has no equivalent
   * of inside a data array — the tabs are *data*, and an `<ng-content>` per tab
   * would mean the caller placing panels the component then has to go and find.
   * A `TemplateRef` is the Angular way to hand a component markup it will render
   * itself, and it costs the string case nothing.
   */
  content?: string | TemplateRef<unknown>;
  disabled?: boolean;
}

/**
 * One panel at a time, chosen from a row of tabs.
 *
 * ```html
 * <div uioTabs [tabs]="views" [(value)]="view"></div>
 * ```
 *
 * ── Real focus, not `aria-activedescendant` ─────────────────────────────────
 *
 * Menu and Select in this library keep DOM focus on the popup and *name* the
 * highlighted option. Tabs is the opposite, and it is worth being explicit
 * about, because the two patterns look alike from the outside: Ark's tab list
 * moves **real focus** between triggers — `tabIndex` is 0 on the selected tab
 * and -1 on the rest, and `focusNextTab` calls `.focus()` — so the roving
 * highlight and the browser's focus are the same thing. Reproducing it with
 * `aria-activedescendant` instead would leave `:focus-visible` on the tab the
 * user arrowed *away* from, and `.tabs__tab:focus-visible` is the entire focus
 * ring in the shared stylesheet.
 *
 * `overlay/roving.ts` still supplies the arithmetic — wrapping, and skipping
 * disabled tabs — because that part is the same wherever the highlight lives.
 *
 * ── Automatic activation ────────────────────────────────────────────────────
 *
 * Zag's default `activationMode` is `"automatic"`: arrowing to a tab selects it.
 * Zag defers that selection by a frame (`selectFocusedTab` runs inside a `raf`)
 * so the focus lands first; here focus is moved by hand and the selection
 * follows in the same handler, which reaches the same end state without a frame
 * in which the DOM disagrees with itself.
 */
@Component({
  selector: "div[uioTabs]",
  standalone: true,
  exportAs: "uioTabs",
  imports: [NgTemplateOutlet],
  template: `
    <div
      class="tabs__list"
      data-scope="tabs"
      data-part="list"
      role="tablist"
      [id]="listId"
      [attr.data-focus]="flag(focus())"
      [attr.aria-orientation]="orientation()"
      [attr.data-orientation]="orientation()"
      (keydown)="onKeydown($event)"
    >
      @for (tab of tabs(); track keyOf(tab)) {
        <!--
          aria-controls is bound only while the tab is selected: every other
          panel is hidden, and a reference to something no user can reach is the
          dangling-IDREF failure in a different disguise. Ark drops it too.
        -->
        <button
          class="tabs__tab text-emphasis-body-large"
          data-scope="tabs"
          data-part="trigger"
          role="tab"
          type="button"
          [id]="triggerId(keyOf(tab))"
          [attr.data-orientation]="orientation()"
          [attr.data-value]="keyOf(tab)"
          [attr.data-disabled]="flag(tab.disabled)"
          [attr.aria-disabled]="tab.disabled ? 'true' : null"
          [attr.aria-selected]="isSelected(keyOf(tab))"
          [attr.data-selected]="flag(isSelected(keyOf(tab)))"
          [attr.data-focus]="flag(focusedValue() === keyOf(tab))"
          [attr.aria-controls]="isSelected(keyOf(tab)) ? contentId(keyOf(tab)) : null"
          [attr.data-ownedby]="listId"
          [disabled]="!!tab.disabled"
          [tabIndex]="isSelected(keyOf(tab)) ? 0 : -1"
          (click)="choose(keyOf(tab))"
          (focus)="onTriggerFocus(keyOf(tab))"
          (blur)="onTriggerBlur($event)"
        >{{ tab.label }}</button>
      }
    </div>
    <!--
      Not an Ark part: Ark renders each Content straight into the root, and this
      wrapper is the design system's own — .tabs__panels is what takes the space
      beside a vertical list. It carries no scope or part, so none of the shared
      stylesheet's state vocabulary applies to it.
    -->
    <div class="tabs__panels">
      @for (tab of tabs(); track keyOf(tab)) {
        <div
          class="tabs__panel"
          data-scope="tabs"
          data-part="content"
          role="tabpanel"
          [id]="contentId(keyOf(tab))"
          [attr.tabindex]="panelTabIndex(keyOf(tab))"
          [attr.aria-labelledby]="triggerId(keyOf(tab))"
          [attr.data-ownedby]="listId"
          [attr.data-selected]="flag(isSelected(keyOf(tab)))"
          [attr.data-orientation]="orientation()"
          [attr.data-state]="isSelected(keyOf(tab)) ? 'open' : 'closed'"
          [attr.hidden]="isSelected(keyOf(tab)) ? null : ''"
        >
          @if (asTemplate(tab.content); as template) {
            <ng-container [ngTemplateOutlet]="template" />
          } @else {
            {{ tab.content }}
          }
        </div>
      }
    </div>
  `,
  host: {
    "[class]": "hostClass()",
    "[id]": "rootId",
  },
})
export class UioTabs extends UioPart {
  readonly scope = "tabs";
  readonly part = "root";

  readonly tabs = input<readonly TabItem[]>([]);
  /**
   * Uncontrolled until something binds it, which is what makes React's
   * `value`/`defaultValue` fork unnecessary — see `UioSwitch` for the same note.
   * Unset means the first tab, exactly as React's `resolvedDefault` does.
   */
  readonly value = model<string | number | undefined>(undefined);
  readonly size = input<TabsSize>("default");
  override readonly orientation = input<TabsOrientation>("horizontal");
  readonly valueChange = output<string>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly appRef = inject(ApplicationRef);

  protected readonly flag = stateFlag;
  protected readonly hostClass = computed(() =>
    tabsStyles({ orientation: this.orientation(), size: this.size() }),
  );

  /**
   * The selected tab's key, falling back to the first tab.
   *
   * Not `selected`: `UioPart` already owns that name for the boolean behind
   * `data-selected`, and the tabs *root* reports no such attribute — only its
   * triggers and panels do.
   */
  protected readonly selectedValue = computed<string | null>(() => {
    const value = this.value();
    if (value != null) return String(value);
    const first = this.tabs()[0];
    return first ? this.keyOf(first) : null;
  });

  /**
   * Which tab reports `data-focus`, which is not the same as which is selected.
   *
   * Zag seeds `focusedValue` from the initial selection and only starts tracking
   * focus once a trigger has been focused or clicked — so a tab strip nobody has
   * touched still marks its selected tab, and one that has been tabbed away from
   * marks none. `touched` is that "the machine owns this now" flip; without it
   * the initial render would report no focused tab where all three other
   * libraries report one.
   */
  private readonly touched = signal(false);
  private readonly focusedTab = signal<string | null>(null);
  readonly focusedValue = computed<string | null>(() =>
    this.touched() ? this.focusedTab() : this.selectedValue(),
  );
  /** The root and the list report focus only while it is really inside them. */
  override readonly focus: Signal<boolean> = computed(
    () => this.touched() && this.focusedTab() !== null,
  );

  /**
   * Ark builds every id as `<scope>:<machine>:<part>`, and a tab's parts carry
   * the tab's own value on the end so two strips on a page cannot collide.
   */
  private readonly machine = nextMachineId();
  protected get rootId(): string {
    return `tabs:${this.machine}`;
  }
  protected get listId(): string {
    return `tabs:${this.machine}:list`;
  }
  protected triggerId(value: string): string {
    return `tabs:${this.machine}:trigger-${value}`;
  }
  protected contentId(value: string): string {
    return `tabs:${this.machine}:content-${value}`;
  }

  protected keyOf(tab: TabItem): string {
    return String(tab.value);
  }
  protected isSelected(value: string): boolean {
    return this.selectedValue() === value;
  }
  protected asTemplate(content: TabItem["content"]): TemplateRef<unknown> | null {
    return content instanceof TemplateRef ? content : null;
  }

  /**
   * The selected panel stops being a tab stop of its own once it holds something
   * focusable.
   *
   * The APG's rule, and zag's `syncTabIndex`: a panel of text has to be reachable
   * by Tab or its content is unreachable to a keyboard, while a panel that
   * already contains a button is reachable through it. Both write this *after*
   * render because both have to look at the panel — which is why it starts at
   * `0`: if the render hook never runs (a server render, a test that never
   * flushes) the markup is still what Ark emits before its own `raf` fires,
   * rather than something neither library ever shows.
   */
  private readonly panelIsFocusable = signal(false);
  protected panelTabIndex(value: string): "0" | null {
    return this.isSelected(value) && this.panelIsFocusable() ? null : "0";
  }

  constructor() {
    super();
    afterRenderEffect(() => {
      // Read through the signal so the hook re-runs when the selection moves.
      this.selectedValue();
      const panel = this.host.nativeElement.querySelector<HTMLElement>(
        '[data-part="content"][data-selected]',
      );
      this.panelIsFocusable.set(!!panel && !!firstFocusable(panel));
    });
  }

  /** Clicking a tab both focuses and selects it — Zag's `TAB_CLICK`. */
  protected choose(value: string): void {
    this.touched.set(true);
    this.focusedTab.set(value);
    this.select(value);
  }

  protected onTriggerFocus(value: string): void {
    this.touched.set(true);
    this.focusedTab.set(value);
    flushNow(this.appRef);
  }

  /**
   * Only a blur that leaves the tab list clears the focused tab.
   *
   * Moving between two triggers fires blur on the old one *before* focus on the
   * new one; clearing unconditionally would drop `data-focus` off the whole
   * strip for a tick, and anything reading the DOM in between — the parity gate
   * does exactly that — sees a strip nobody is in. Zag makes the same test on
   * `relatedTarget`.
   */
  protected onTriggerBlur(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (next instanceof HTMLElement && next.getAttribute("role") === "tab") return;
    this.touched.set(true);
    this.focusedTab.set(null);
    flushNow(this.appRef);
  }

  private select(value: string): void {
    if (this.selectedValue() === value) return;
    this.value.set(value);
    this.valueChange.emit(value);
    flushNow(this.appRef);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const horizontal = this.orientation() === "horizontal";
    const move = ((): number | "home" | "end" | null => {
      switch (event.key) {
        case "ArrowRight":
          return horizontal ? 1 : null;
        case "ArrowLeft":
          return horizontal ? -1 : null;
        case "ArrowDown":
          return horizontal ? null : 1;
        case "ArrowUp":
          return horizontal ? null : -1;
        case "Home":
          return "home";
        case "End":
          return "end";
        default:
          return null;
      }
    })();
    // An ArrowDown in a horizontal strip is the page's to scroll with, so it is
    // left alone rather than swallowed.
    if (move === null) return;
    event.preventDefault();

    const navigable = this.tabs().map((tab) => ({ disabled: !!tab.disabled }));
    // -1 is `moveHighlight`'s "nothing highlighted yet", which is exactly what
    // Home and End want: start from the far end and walk to the first enabled.
    const from = move === "home" || move === "end" ? -1 : this.indexOfFocused();
    const step = move === "home" ? 1 : move === "end" ? -1 : move;
    const next = moveHighlight(navigable, from, step);
    if (next === -1) return;

    // Focus first: the trigger's own focus handler is what records the move, so
    // a keyboard and a mouse arrive at the state through one path.
    this.triggerElements()[next]?.focus();
    // Automatic activation. The focus handler has already recorded the tab, so
    // this reads it back rather than trusting the same index twice.
    const value = this.focusedValue();
    if (value !== null) this.select(value);
  }

  private indexOfFocused(): number {
    const focused = this.focusedValue();
    return this.tabs().findIndex((tab) => this.keyOf(tab) === focused);
  }

  /**
   * The triggers as rendered, in DOM order.
   *
   * Index-aligned with `tabs()` because one `@for` produces both, so the
   * arithmetic above happens on the data and is applied to the elements.
   */
  private triggerElements(): HTMLElement[] {
    return [...this.host.nativeElement.querySelectorAll<HTMLElement>('[data-part="trigger"]')];
  }
}
