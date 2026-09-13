import { Injectable, computed, signal, type Signal } from "@angular/core";
import { nextMachineId } from "../part-ids.js";
import { inDomOrder, moveHighlight } from "../overlay/roving.js";

/** What a `UioToggle` inside a group has to tell the group about itself. */
export interface ToggleGroupItem {
  readonly element: HTMLElement;
  readonly itemValue: Signal<string | undefined>;
  readonly isDisabled: Signal<boolean>;
}

/**
 * The state a row of toggles shares.
 *
 * ── Why a `UioToggle` needs one at all ──────────────────────────────────────
 *
 * Ark splits the standalone toggle (`Toggle.Root`) from the group item
 * (`ToggleGroup.Item`), and the two render different elements: `data-scope`
 * changes, the group item gains an id, a `data-ownedby`, a roving `tabindex`
 * and either `role="radio"`/`aria-checked` or `aria-pressed`. React tells them
 * apart by whether a `value` was passed. In Angular the presence of this
 * provider is the better discriminator: it is decided at construction rather
 * than on an input that has not landed yet, and a toggle inside a group *is* a
 * group item whatever it was given.
 *
 * ── Roving focus, and why the group holds it ────────────────────────────────
 *
 * Arrow keys move **real focus** between the buttons — `tabindex` is 0 on the
 * focused one and -1 on the rest, and the group itself is the tab stop that
 * hands focus to the first item. That is Zag's arrangement, and it has to be the
 * group's business because no item can see its siblings.
 */
@Injectable()
export class UioToggleGroupContext {
  /** Ark builds every id as `<scope>:<machine>:<part>`; an item's part is its value. */
  private readonly machine = nextMachineId();

  get rootId(): string {
    return `toggle-group:${this.machine}`;
  }
  itemId(value: string | undefined): string {
    return `toggle-group:${this.machine}:${value}`;
  }

  /** Replaced wholesale by the root — see `UioFieldContext.bind`. */
  value: Signal<readonly string[]> = signal([]);
  multiple: Signal<boolean> = signal(false);
  disabled: Signal<boolean> = signal(false);
  orientation: Signal<"horizontal" | "vertical"> = signal("horizontal");
  private commit: (value: string[]) => void = () => {};

  private readonly focused = signal<string | null>(null);
  readonly focusedId: Signal<string | null> = this.focused;
  readonly hasFocus = computed(() => this.focused() !== null);

  /**
   * Whether a Shift+Tab is on its way out of the group.
   *
   * The root is a tab stop, so without this a backwards Tab out of the first
   * item would land straight back on the root and trap the user. Zag drops the
   * root's `tabindex` for exactly the one keystroke.
   */
  private readonly tabbingBackward = signal(false);
  readonly rootTabIndex = computed(() => (this.tabbingBackward() ? -1 : 0));

  private items: ToggleGroupItem[] = [];

  bind(state: {
    value: Signal<readonly string[]>;
    multiple: Signal<boolean>;
    disabled: Signal<boolean>;
    orientation: Signal<"horizontal" | "vertical">;
    commit: (value: string[]) => void;
  }): void {
    this.value = state.value;
    this.multiple = state.multiple;
    this.disabled = state.disabled;
    this.orientation = state.orientation;
    this.commit = state.commit;
  }

  register(item: ToggleGroupItem): void {
    this.items.push(item);
  }
  unregister(item: ToggleGroupItem): void {
    this.items = this.items.filter((entry) => entry !== item);
  }

  isPressed(value: string | undefined): boolean {
    return value !== undefined && this.value().includes(value);
  }

  /**
   * Zag's `setValue`, both branches written out.
   *
   * Single mode is *deselectable*: clicking the pressed toggle clears the group
   * rather than doing nothing, which is what makes it a toggle row and not a
   * radio group. `deselectable` defaults to true and neither React nor this
   * exposes it.
   */
  toggle(value: string | undefined): void {
    if (value === undefined) return;
    const current = this.value();
    let next: string[];
    if (this.multiple()) {
      next = current.includes(value)
        ? current.filter((entry) => entry !== value)
        : [...current, value];
    } else {
      next = current.length === 1 && current[0] === value ? [] : [value];
    }
    this.commit(next);
  }

  setFocused(id: string | null): void {
    this.focused.set(id);
    if (id !== null) this.tabbingBackward.set(false);
  }
  /** Called when focus leaves the group entirely — see `UioToggleGroup`. */
  clearFocus(): void {
    this.focused.set(null);
    this.tabbingBackward.set(false);
  }
  shiftTabbing(): void {
    this.tabbingBackward.set(true);
  }

  /** Zag's `ROOT.FOCUS`: the group is the tab stop, the first item takes focus. */
  focusFirst(): void {
    this.ordered()[0]?.element.focus({ preventScroll: true });
  }

  /**
   * `step` of ±1 moves one item, `"home"`/`"end"` jump to an end.
   *
   * The arithmetic is `moveHighlight`'s, so a disabled toggle is stepped over
   * here exactly as a disabled option is in Menu and Select.
   */
  move(step: 1 | -1 | "home" | "end"): void {
    const items = this.ordered();
    if (!items.length) return;
    const navigable = items.map((item) => ({ disabled: item.isDisabled() }));
    const from =
      step === "home" || step === "end"
        ? -1
        : items.findIndex((item) => this.itemId(item.itemValue()) === this.focused());
    const direction = step === "home" ? 1 : step === "end" ? -1 : step;
    const next = moveHighlight(navigable, from, direction);
    if (next === -1) return;
    items[next]?.element.focus({ preventScroll: true });
  }

  /** Registration order is template order only until something conditional appears. */
  private ordered(): ToggleGroupItem[] {
    return inDomOrder(this.items);
  }
}
