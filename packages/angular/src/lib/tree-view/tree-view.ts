import { NgTemplateOutlet } from "@angular/common";
import {
  ApplicationRef,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from "@angular/core";
import {
  CONTROL_ICON_SIZE,
  treeViewStyles,
  type ControlSize,
  type TreeViewVariants,
} from "@ui-organized/core";
import type { CanonicalIconName } from "@ui-organized/utils";
import { UioPart, stateFlag } from "../part.js";
import { nextMachineId } from "../part-ids.js";
import { UioIcon } from "../icons/icon.js";
import { flushNow } from "../overlay/flush.js";

export type TreeViewSize = NonNullable<TreeViewVariants["size"]>;
export type TreeViewVariant = NonNullable<TreeViewVariants["variant"]>;
export type TreeViewSelectionMode = "single" | "multiple";

/**
 * The chevron and the node icons stay one step below the text: they mark the
 * row rather than compete with it.
 */
const INDICATOR_SIZE = 16;

export interface TreeViewNode {
  /** Unique across the whole tree. Selection and expansion are keyed on this. */
  id: string;
  /** Display text. */
  label: string;
  /** A node with children renders as a branch, one without as a leaf. */
  children?: TreeViewNode[];
  /** Icon before the label. Branches default to a folder, leaves to none. */
  icon?: CanonicalIconName;
  /** Prevents selection and focus while keeping the node visible. */
  disabled?: boolean;
}

/** One node paired with where it sits, which is what every part below reads. */
interface FlatNode {
  node: TreeViewNode;
  /** The child index at each level, which is zag's `data-path`. */
  indexPath: number[];
  /** 1-based, and both `aria-level` and the `--depth` the indentation uses. */
  depth: number;
  isBranch: boolean;
  /** Whether every ancestor is expanded, i.e. whether the row is on screen. */
  visible: boolean;
}

/**
 * A disclosure tree.
 *
 * ```html
 * <div uioTreeView [items]="files" label="Files" [(selectedValue)]="picked"></div>
 * ```
 *
 * ── The tree is data, and it has to be ──────────────────────────────────────
 *
 * Every other framework in this system takes `items` too, so the shape is not
 * an Angular concession — but Angular is the one where it is *forced*. The node
 * decides whether it renders as a branch or a leaf, and a branch renders a
 * panel that holds its children. A content query cannot answer that question:
 * the query populates from `<ng-content>`, which lives inside the very `@if`
 * the answer controls. `UioNavItem`'s `[subItems]` is the same constraint one
 * level shallower, and every collection in this package resolves it the same
 * way.
 *
 * The recursion is a `<ng-template>` that renders itself. A component per node
 * would work too and would mean a second class, a second registration list and
 * a second place for selection state to live; the template keeps every decision
 * in this one component, where the selection and expansion actually are.
 *
 * ── Focus is real, and it roves ─────────────────────────────────────────────
 *
 * Menu and Select in this library keep DOM focus on the popup and *name* the
 * highlighted option. A tree is the opposite, and Ark is explicit about it: the
 * tree itself is `tabindex="-1"`, the focused node is `tabindex="0"`, and arrow
 * keys move real focus between rows. That matters for the stylesheet as much as
 * for the user — `.tree-view__item[data-focus]` is the keyboard highlight, and
 * it has to be the row the browser has actually focused or a `:focus-visible`
 * ring would appear on a different row than the fill.
 *
 * One node always carries `data-focus`, from first render, before anything has
 * been clicked: the first node that is not disabled. That is zag's
 * `focusedValue` default, and dropping it would leave a tree whose first Tab
 * lands nowhere.
 *
 * ── A collapsed branch still renders its children ───────────────────────────
 *
 * The panel is `hidden`, not absent, in all four libraries — so expanding
 * changes attributes rather than the element list. Ark builds each branch out of
 * a Collapsible, which is why the branch and its content carry
 * `collapsible:<machine>` ids rather than tree ones, and why a **settled open**
 * panel reports no `data-state` at all. See `UioCollapsibleContext` for the
 * whole of that rule; here there is no animation to feed, so the attribute is
 * simply absent while open and `"closed"` while closed.
 */
@Component({
  selector: "div[uioTreeView]",
  standalone: true,
  exportAs: "uioTreeView",
  imports: [NgTemplateOutlet, UioIcon],
  template: `
    @if (label(); as text) {
      <h3 class="tree-view__label" data-scope="tree-view" data-part="label" [id]="partId('label')">
        {{ text }}
      </h3>
    }
    <!--
      aria-label is the literal string zag ships as its default translation, and
      aria-labelledby points at the label part whether or not one was rendered.
      Both are Ark's: an unlabelled tree ships a dangling reference in every
      library, and correcting it here would be the one difference this gate
      could not tell from a port bug.
    -->
    <div
      class="tree-view__tree"
      data-scope="tree-view"
      data-part="tree"
      role="tree"
      aria-label="Tree View"
      tabindex="-1"
      [id]="partId('tree')"
      [attr.aria-labelledby]="partId('label')"
      [attr.aria-multiselectable]="selectionMode() === 'multiple' ? 'true' : null"
      (keydown)="onKeydown($event)"
    >
      <ng-container
        [ngTemplateOutlet]="nodes"
        [ngTemplateOutletContext]="{ $implicit: items(), path: [] }"
      />
    </div>

    <!--
      The recursion. "path" is the index path of the *parent*, so each level
      appends its own index and a child never has to be told where it sits.
    -->
    <ng-template #nodes let-list let-path="path">
      @for (node of list; track node.id; let index = $index) {
        @let indexPath = path.concat(index);
        @let depth = indexPath.length;
        @if (node.children && node.children.length) {
          <div
            class="tree-view__branch"
            data-scope="tree-view"
            data-part="branch"
            role="treeitem"
            [id]="branchId(node.id)"
            [attr.data-branch]="node.id"
            [attr.data-value]="node.id"
            [attr.data-ownedby]="partId('tree')"
            [attr.data-path]="indexPath.join('/')"
            [attr.data-depth]="depth"
            [attr.aria-level]="depth"
            [attr.data-state]="expandedState(node.id)"
            [attr.aria-expanded]="isExpanded(node.id)"
            [attr.aria-selected]="node.disabled ? null : isSelected(node.id)"
            [attr.data-selected]="flag(isSelected(node.id))"
            [attr.aria-disabled]="node.disabled ? 'true' : null"
            [attr.data-disabled]="flag(node.disabled)"
            [attr.style]="depthStyle(depth)"
          >
            <div
              class="tree-view__branch-control"
              data-scope="tree-view"
              data-part="branch-control"
              role="button"
              [id]="nodeId(node.id)"
              [attr.tabindex]="isFocused(node.id) ? 0 : -1"
              [attr.data-path]="indexPath.join('/')"
              [attr.data-value]="node.id"
              [attr.data-depth]="depth"
              [attr.data-state]="expandedState(node.id)"
              [attr.data-selected]="flag(isSelected(node.id))"
              [attr.data-focus]="flag(isFocused(node.id))"
              [attr.data-disabled]="flag(node.disabled)"
              (click)="onBranchClick(node)"
              (focus)="focusNode(node.id)"
            >
              <div
                class="tree-view__branch-indicator"
                data-scope="tree-view"
                data-part="branch-indicator"
                aria-hidden="true"
                [attr.data-state]="expandedState(node.id)"
                [attr.data-selected]="flag(isSelected(node.id))"
                [attr.data-focus]="flag(isFocused(node.id))"
                [attr.data-disabled]="flag(node.disabled)"
              >
                <span uioIcon name="chevron-right" [size]="INDICATOR_SIZE"></span>
              </div>
              <!-- A branch always asks for an icon; a leaf only when it has one. -->
              <span
                uioIcon
                class="tree-view__node-icon"
                [name]="node.icon ?? 'folder'"
                [size]="iconSize()"
              ></span>
              <span
                class="tree-view__node-text"
                data-scope="tree-view"
                data-part="branch-text"
                [attr.data-state]="expandedState(node.id)"
                [attr.data-disabled]="flag(node.disabled)"
              >{{ node.label }}</span>
            </div>
            <div
              class="tree-view__branch-content"
              data-scope="tree-view"
              data-part="branch-content"
              data-collapsible=""
              role="group"
              [id]="branchContentId(node.id)"
              [attr.data-value]="node.id"
              [attr.data-path]="indexPath.join('/')"
              [attr.data-depth]="depth"
              [attr.data-state]="isExpanded(node.id) ? null : 'closed'"
              [attr.hidden]="isExpanded(node.id) ? null : ''"
            >
              @if (showIndentGuides()) {
                <div
                  class="tree-view__indent-guide"
                  data-scope="tree-view"
                  data-part="branch-indent-guide"
                  [attr.data-depth]="depth"
                ></div>
              }
              <ng-container
                [ngTemplateOutlet]="nodes"
                [ngTemplateOutletContext]="{ $implicit: node.children, path: indexPath }"
              />
            </div>
          </div>
        } @else {
          <div
            class="tree-view__item"
            data-scope="tree-view"
            data-part="item"
            role="treeitem"
            [id]="nodeId(node.id)"
            [attr.data-ownedby]="partId('tree')"
            [attr.data-path]="indexPath.join('/')"
            [attr.data-value]="node.id"
            [attr.data-depth]="depth"
            [attr.aria-level]="depth"
            [attr.tabindex]="isFocused(node.id) ? 0 : -1"
            [attr.data-focus]="flag(isFocused(node.id))"
            [attr.aria-current]="isSelected(node.id) ? 'true' : null"
            [attr.aria-selected]="node.disabled ? null : isSelected(node.id)"
            [attr.data-selected]="flag(isSelected(node.id))"
            [attr.aria-disabled]="node.disabled ? 'true' : null"
            [attr.data-disabled]="flag(node.disabled)"
            [attr.style]="depthStyle(depth)"
            (click)="onItemClick(node)"
            (focus)="focusNode(node.id)"
          >
            @if (node.icon; as name) {
              <span uioIcon class="tree-view__node-icon" [name]="name" [size]="iconSize()"></span>
            }
            <span
              class="tree-view__node-text"
              data-scope="tree-view"
              data-part="item-text"
              [attr.data-selected]="flag(isSelected(node.id))"
              [attr.data-focus]="flag(isFocused(node.id))"
              [attr.data-disabled]="flag(node.disabled)"
            >{{ node.label }}</span>
          </div>
        }
      }
    </ng-template>
  `,
  host: { "[class]": "hostClass()", "[id]": "partId('root')" },
})
export class UioTreeView extends UioPart {
  readonly scope = "tree-view";
  readonly part = "root";

  /** The tree to render, in display order. */
  readonly items = input<readonly TreeViewNode[]>([]);
  /** Accessible label rendered above the tree. */
  readonly label = input<string | undefined>(undefined);
  /** Uncontrolled until something binds it — see `UioSwitch` on the same fork. */
  readonly selectedValue = model<string[]>([]);
  /** Which branches are open, by node id. */
  readonly expandedValue = model<string[]>([]);
  readonly selectionMode = input<TreeViewSelectionMode>("single");
  readonly size = input<TreeViewSize>("md");
  readonly variant = input<TreeViewVariant>("default");
  /** The vertical rules connecting a branch to its children. */
  readonly showIndentGuides = input(true, { transform: booleanAttribute });

  readonly selectionChange = output<string[]>();
  readonly expandedChange = output<string[]>();

  /**
   * Ark spells this machine's ids `tree:<machine>:…` — the *machine* name, not
   * the scope, which is `tree-view`. Reproduced, because a consumer reading two
   * DOM trees side by side should find the same shape in both.
   */
  private readonly machine = nextMachineId();
  /**
   * Each branch is a Collapsible in Ark, with an id from that machine's own
   * counter. Cached per node so a branch keeps its id across re-renders — an id
   * that changed when the list re-rendered would break every reference to it.
   */
  private readonly branchIds = new Map<string, string>();

  private readonly appRef = inject(ApplicationRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** `null` until something has been focused, when it means "the first node". */
  private readonly focusedValue = signal<string | null>(null);

  protected readonly flag = stateFlag;
  protected readonly INDICATOR_SIZE = INDICATOR_SIZE;
  protected readonly iconSize = computed(() => CONTROL_ICON_SIZE[this.size() as ControlSize]);
  protected readonly hostClass = computed(() =>
    treeViewStyles({ size: this.size(), variant: this.variant() }),
  );

  /**
   * Every node in reading order, with whether its ancestors are all expanded.
   *
   * Arrow keys move between *visible* rows, so the walk has to know about
   * collapsed ancestors — moving to a node inside a closed branch would focus
   * an element the browser cannot focus, and focus would silently fall to the
   * body.
   */
  private readonly flat = computed<FlatNode[]>(() => {
    const out: FlatNode[] = [];
    const walk = (nodes: readonly TreeViewNode[], path: number[], visible: boolean) => {
      nodes.forEach((node, index) => {
        const indexPath = [...path, index];
        const isBranch = !!node.children?.length;
        out.push({ node, indexPath, depth: indexPath.length, isBranch, visible });
        if (isBranch) {
          walk(node.children!, indexPath, visible && this.isExpanded(node.id));
        }
      });
    };
    walk(this.items(), [], true);
    return out;
  });

  /** The rows a keyboard can reach, which excludes disabled ones. */
  private readonly navigable = computed(() =>
    this.flat().filter((entry) => entry.visible && !entry.node.disabled),
  );

  /** Zag's default: the first node that is not disabled, before anything is clicked. */
  private readonly focused = computed(
    () => this.focusedValue() ?? this.navigable()[0]?.node.id ?? null,
  );

  protected partId(part: string): string {
    return `tree:${this.machine}:${part}`;
  }
  protected nodeId(value: string): string {
    return `tree:${this.machine}:node:${value}`;
  }
  protected branchId(value: string): string {
    let id = this.branchIds.get(value);
    if (!id) {
      id = `collapsible:${nextMachineId()}`;
      this.branchIds.set(value, id);
    }
    return id;
  }
  protected branchContentId(value: string): string {
    return `${this.branchId(value)}:content`;
  }

  /**
   * The indentation, written as the whole `style` attribute rather than through
   * `[style.--depth]`.
   *
   * A custom property does not reach the element through a style binding in a
   * JIT-compiled spec the way it does in the built package, and
   * `.tree-view__item` computes its `padding-inline-start` from `--depth`. Same
   * reason `UioProgress` writes `--percent` this way; nothing else on these rows
   * is styled inline.
   */
  protected depthStyle(depth: number): string {
    return `--depth: ${depth}`;
  }

  isExpanded(value: string): boolean {
    return this.expandedValue().includes(value);
  }
  isSelected(value: string): boolean {
    return this.selectedValue().includes(value);
  }
  protected isFocused(value: string): boolean {
    return this.focused() === value;
  }
  /** The branch reports both words; only its *content* drops one. */
  protected expandedState(value: string): "open" | "closed" {
    return this.isExpanded(value) ? "open" : "closed";
  }

  /**
   * Moves the roving tabindex. Called from the row's own `focus` handler.
   *
   * Not named `focus`: `UioPart` already declares one, and it is the *signal*
   * behind `data-focus` on the host rather than an action.
   */
  protected focusNode(value: string): void {
    this.focusedValue.set(value);
  }

  toggleExpanded(value: string): void {
    const next = this.isExpanded(value)
      ? this.expandedValue().filter((id) => id !== value)
      : [...this.expandedValue(), value];
    this.expandedValue.set(next);
    this.expandedChange.emit(next);
    flushNow(this.appRef);
  }

  select(value: string): void {
    const current = this.selectedValue();
    const next =
      this.selectionMode() === "multiple"
        ? current.includes(value)
          ? current.filter((id) => id !== value)
          : [...current, value]
        : [value];
    this.selectedValue.set(next);
    this.selectionChange.emit(next);
    flushNow(this.appRef);
  }

  /** A branch row both selects and toggles, which is what Ark's control does. */
  protected onBranchClick(node: TreeViewNode): void {
    if (node.disabled) return;
    this.focusedValue.set(node.id);
    this.select(node.id);
    this.toggleExpanded(node.id);
  }

  protected onItemClick(node: TreeViewNode): void {
    if (node.disabled) return;
    this.focusedValue.set(node.id);
    this.select(node.id);
  }

  /**
   * The APG tree keyboard, on the tree rather than on each row.
   *
   * One listener instead of one per node, which is what zag does and which also
   * means a row added while a key is held is navigable immediately. Arrow
   * left/right are the disclosure keys: right opens a closed branch and steps
   * into an open one, left closes an open branch and steps out of anything else.
   */
  protected onKeydown(event: KeyboardEvent): void {
    const rows = this.navigable();
    if (!rows.length) return;
    const value = this.focused();
    const index = rows.findIndex((row) => row.node.id === value);
    const current = rows[index];

    const moveTo = (next: FlatNode | undefined) => {
      if (!next) return;
      event.preventDefault();
      this.focusedValue.set(next.node.id);
      flushNow(this.appRef);
      // The element, not just the state: the roving tabindex is half of it, and
      // a row that reports `data-focus` without holding focus leaves the next
      // Tab starting from the top of the page.
      //
      // Found by walking the rows rather than by id selector, because a node id
      // is the caller's string and may hold anything a CSS selector would have
      // to be escaped for.
      const rows = this.host.nativeElement.querySelectorAll<HTMLElement>(
        '[data-part="branch-control"], [data-part="item"]',
      );
      for (const row of Array.from(rows)) {
        if (row.dataset["value"] === next.node.id) {
          row.focus();
          return;
        }
      }
    };

    switch (event.key) {
      case "ArrowDown":
        return moveTo(rows[index + 1]);
      case "ArrowUp":
        return moveTo(rows[index - 1]);
      case "Home":
        return moveTo(rows[0]);
      case "End":
        return moveTo(rows[rows.length - 1]);
      case "ArrowRight": {
        if (!current?.isBranch) return;
        event.preventDefault();
        if (!this.isExpanded(current.node.id)) this.toggleExpanded(current.node.id);
        else moveTo(this.navigable()[index + 1]);
        return;
      }
      case "ArrowLeft": {
        if (!current) return;
        event.preventDefault();
        if (current.isBranch && this.isExpanded(current.node.id)) {
          this.toggleExpanded(current.node.id);
          return;
        }
        // Out to the parent, found by index path rather than by a back-pointer
        // — the flat walk already knows where every row sits.
        const parentPath = current.indexPath.slice(0, -1).join("/");
        if (!parentPath) return;
        moveTo(rows.find((row) => row.indexPath.join("/") === parentPath));
        return;
      }
      case "Enter":
      case " ": {
        if (!current) return;
        event.preventDefault();
        this.select(current.node.id);
        if (current.isBranch) this.toggleExpanded(current.node.id);
        return;
      }
      default:
        return;
    }
  }
}
