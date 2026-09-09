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
  type OnDestroy,
  type OnInit,
  type Signal,
} from "@angular/core";
import { clsx } from "clsx";
import {
  CONTROL_ICON_SIZE,
  CONTROL_TEXT_CLASS,
  toggleStyles,
  type ToggleVariants,
} from "@ui-organized/core";
import type { CanonicalIconName } from "@ui-organized/utils";
import { UioPart, stateFlag } from "../part.js";
import { UioIcon } from "../icons/icon.js";
import { flushNow } from "../overlay/flush.js";
import { UioToggleGroupContext } from "./toggle-group-context.js";

export type ToggleSize = NonNullable<ToggleVariants["size"]>;
export type ToggleOrientation = "horizontal" | "vertical";

/**
 * A button that is either on or off.
 *
 * ```html
 * <button uioToggle label="Bold" icon="bold" [(pressed)]="bold"></button>
 *
 * <div uioToggleGroup [(value)]="alignment">
 *   <button uioToggle value="left" label="Left"></button>
 *   <button uioToggle value="center" label="Center"></button>
 * </div>
 * ```
 *
 * ── One component, two Ark parts ────────────────────────────────────────────
 *
 * Inside a group this is `ToggleGroup.Item` and outside it is `Toggle.Root`, and
 * the two render different elements — different `data-scope`, and the group item
 * additionally carries an id, `data-ownedby`, a roving `tabindex`, and either
 * `role="radio"`/`aria-checked` or `aria-pressed` depending on `multiple`. So
 * `scope` and `part` are decided from whether a `UioToggleGroupContext` was
 * found, which is settled at construction. React makes the same split on whether
 * a `value` was passed.
 *
 * ── The label is an input, not projected content ────────────────────────────
 *
 * An icon with no label collapses to a square (`.toggle--icon-only`), and
 * `<ng-content>` cannot be tested for emptiness — a component that always
 * projects "whatever the caller gave us" believes it has content. Same answer as
 * `UioFieldError`'s and `UioSwitch`'s: anything whose absence changes the
 * rendering has to be told so in a value.
 */
@Component({
  selector: "button[uioToggle]",
  standalone: true,
  exportAs: "uioToggle",
  imports: [UioIcon],
  template: `
    @if (icon(); as name) {
      <span uioIcon [name]="name" [size]="iconSize()"></span>
    }
    @if (label(); as text) {
      {{ text }}
    }
  `,
  host: {
    type: "button",
    "[class]": "hostClass()",
    "[disabled]": "isDisabled()",
    "[attr.id]": "group ? group.itemId(value()) : null",
    "[attr.data-ownedby]": "group ? group.rootId : null",
    "[attr.tabindex]": "group ? (isFocused() ? 0 : -1) : null",
    "[attr.role]": "asRadio() ? 'radio' : null",
    "[attr.aria-checked]": "asRadio() ? isPressed() : null",
    "[attr.aria-pressed]": "asRadio() ? null : isPressed()",
    /**
     * Standalone only. Zag's `getItemProps` emits no `data-pressed` — the group
     * item reports itself through `data-state` alone — and adding one would be a
     * difference from all three other libraries on every item of every group.
     */
    "[attr.data-pressed]": "group ? null : flag(isPressed())",
    "(click)": "onClick()",
    "(focus)": "onFocus()",
    "(keydown)": "onKeydown($event)",
  },
})
export class UioToggle extends UioPart implements OnInit, OnDestroy {
  /** Read before `scope`/`part` below, which is why it is declared first. */
  protected readonly group = inject(UioToggleGroupContext, { optional: true });

  readonly scope = this.group ? "toggle-group" : "toggle";
  readonly part = this.group ? "item" : "root";

  /** Standalone only: a group item's pressed state belongs to the group. */
  readonly pressed = model(false);
  readonly pressedChange = output<boolean>();
  /** Identifies this toggle within a group. */
  readonly value = input<string | undefined>(undefined);
  readonly label = input<string | undefined>(undefined);
  readonly icon = input<CanonicalIconName | undefined>(undefined);
  readonly size = input<ToggleSize>("md");

  protected readonly disabledInput = input(false, {
    alias: "disabled",
    transform: booleanAttribute,
  });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly appRef = inject(ApplicationRef);

  protected readonly isPressed = computed(() =>
    this.group ? this.group.isPressed(this.value()) : this.pressed(),
  );
  /**
   * A single-select group is a `radiogroup` of `radio`s and reports
   * `aria-checked`; a multi-select one and a standalone toggle report
   * `aria-pressed`. Zag emits exactly one of the two, never both.
   */
  protected readonly asRadio = computed(() => !!this.group && !this.group.multiple());
  readonly isDisabled = computed(
    () => this.disabledInput() || (this.group?.disabled() ?? false),
  );
  protected readonly isFocused = computed(
    () => !!this.group && this.group.focusedId() === this.group.itemId(this.value()),
  );

  override readonly state = computed<"on" | "off">(() => (this.isPressed() ? "on" : "off"));
  override readonly disabled: Signal<boolean> = this.isDisabled;
  override readonly focus: Signal<boolean> = this.isFocused;
  override readonly orientation: Signal<ToggleOrientation | null> = computed(
    () => this.group?.orientation() ?? null,
  );

  protected readonly iconSize = computed(() => CONTROL_ICON_SIZE[this.size()]);
  /**
   * An icon with no label is a square whose side matches the labelled height for
   * the size — the same treatment `Button` gives an icon-only button, so the two
   * line up in a row instead of one rendering short and wide.
   */
  protected readonly hostClass = computed(() =>
    clsx(
      CONTROL_TEXT_CLASS[this.size()],
      toggleStyles({ size: this.size() }),
      !!this.icon() && !this.label() && "toggle--icon-only",
    ),
  );
  protected readonly flag = stateFlag;

  /** The element and the two signals the group needs; see `ToggleGroupItem`. */
  readonly element = this.host.nativeElement;
  readonly itemValue: Signal<string | undefined> = this.value;

  ngOnInit(): void {
    this.group?.register(this);
  }
  ngOnDestroy(): void {
    this.group?.unregister(this);
  }

  protected onClick(): void {
    if (this.isDisabled()) return;
    if (this.group) {
      this.group.toggle(this.value());
      return;
    }
    const next = !this.pressed();
    this.pressed.set(next);
    this.pressedChange.emit(next);
    flushNow(this.appRef);
  }

  protected onFocus(): void {
    if (!this.group || this.isDisabled()) return;
    this.group.setFocused(this.group.itemId(this.value()));
    flushNow(this.appRef);
  }

  /**
   * Arrow keys move focus, and which arrows do so depends on the group's
   * orientation: an ArrowDown in a horizontal row is the page's to scroll with
   * and is left alone rather than swallowed.
   */
  protected onKeydown(event: KeyboardEvent): void {
    const group = this.group;
    if (!group || this.isDisabled()) return;
    if (event.key === "Tab") {
      if (event.shiftKey) group.shiftTabbing();
      return;
    }
    const horizontal = group.orientation() === "horizontal";
    const move = ((): 1 | -1 | "home" | "end" | null => {
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
    if (move === null) return;
    event.preventDefault();
    group.move(move);
    flushNow(this.appRef);
  }
}

/**
 * A row of toggles that share a value.
 *
 * The group is the tab stop — `tabindex="0"` on the container, -1 on every
 * button — and arrow keys move focus between the buttons from there. That is
 * Zag's arrangement and it is why the roving state lives in
 * `UioToggleGroupContext` rather than in any one toggle.
 *
 * `multiple` decides both the ARIA and the semantics: a single-select group is a
 * `radiogroup` of `radio`s, a multi-select one is a plain `group` of pressed
 * buttons. Single mode is still deselectable — clicking the pressed toggle
 * clears the group — which is what keeps it a row of toggles rather than a radio
 * group that cannot be unset.
 */
@Component({
  selector: "div[uioToggleGroup]",
  standalone: true,
  exportAs: "uioToggleGroup",
  providers: [UioToggleGroupContext],
  template: `<ng-content />`,
  host: {
    class: "toggle-group",
    "[id]": "ctx.rootId",
    "[attr.role]": "multiple() ? 'group' : 'radiogroup'",
    "[attr.tabindex]": "ctx.rootTabIndex()",
    /**
     * The container takes focus so it can hand it to the first toggle, and a
     * focus ring on a container nobody sees as focusable would be noise. Zag
     * writes the same inline style; there is no class for it in the shared
     * stylesheet to reach for instead.
     */
    "[style.outline]": "'none'",
    "(focus)": "ctx.focusFirst()",
    "(focusout)": "onFocusOut($event)",
  },
})
export class UioToggleGroup extends UioPart {
  readonly scope = "toggle-group";
  readonly part = "root";

  /** Uncontrolled until something binds it — see `UioSwitch`. */
  readonly value = model<readonly string[]>([]);
  readonly multiple = input(false, { transform: booleanAttribute });
  override readonly orientation = input<ToggleOrientation>("horizontal");
  readonly valueChange = output<string[]>();

  override readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly ctx = inject(UioToggleGroupContext);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly appRef = inject(ApplicationRef);

  override readonly focus: Signal<boolean> = this.ctx.hasFocus;

  constructor() {
    super();
    this.ctx.bind({
      value: this.value,
      multiple: this.multiple,
      disabled: this.disabled,
      orientation: this.orientation,
      commit: (next) => this.commit(next),
    });
  }

  /**
   * Only a blur that leaves the group clears the focused toggle.
   *
   * `focusout` rather than `blur`, because the event has to be heard from a
   * descendant and `blur` does not bubble. Moving between two toggles fires it
   * with the next one as `relatedTarget`; clearing unconditionally would drop
   * `data-focus` off the whole group for a tick, and anything reading the DOM in
   * between — the parity gate does exactly that — sees a group nobody is in.
   */
  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (next instanceof Node && this.host.nativeElement.contains(next)) return;
    this.ctx.clearFocus();
    flushNow(this.appRef);
  }

  private commit(next: string[]): void {
    this.value.set(next);
    this.valueChange.emit(next);
    flushNow(this.appRef);
  }
}
