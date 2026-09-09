import {
  ApplicationRef,
  Component,
  ElementRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  type Signal,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { segmentedControlStyles, type SegmentedControlVariants } from "@ui-organized/core";
import type { CanonicalIconName } from "@ui-organized/utils";
import { UioPart, stateFlag } from "../part.js";
import { VISUALLY_HIDDEN_INPUT, nextMachineId } from "../part-ids.js";
import { UioIcon } from "../icons/icon.js";
import { flushNow } from "../overlay/flush.js";

export type SegmentedControlSize = NonNullable<SegmentedControlVariants["size"]>;

export interface SegmentedControlItem {
  /** Unique value reported — and submitted — when this segment is selected. */
  value: string;
  label: string;
  icon?: CanonicalIconName;
  /** Disable just this segment. */
  disabled?: boolean;
}

/** Leading icons render at 16px across every size, as in the other three libraries. */
const ICON_SIZE = 16;

/** The pill's measured box, in the coordinates the stylesheet reads it in. */
interface IndicatorRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * One choice out of a row, shown as a segmented pill.
 *
 * ```html
 * <div uioSegmentedControl [items]="ranges" [(value)]="range" aria-label="Range"></div>
 * ```
 *
 * ── It is a radio group, and that is not cosmetic ───────────────────────────
 *
 * Every segment is a `<label>` wrapping a visually-hidden `<input type="radio">`,
 * all sharing one `name`. That is Ark's anatomy — its `segment-group` is Zag's
 * radio-group machine under a different name, which is why the ids read
 * `radio-group:<machine>:radio:<value>` — and reproducing it is what makes the
 * keyboard work: **roving focus here is the browser's own**. A native radio
 * group is a single tab stop that lands on the checked control, and the arrow
 * keys move and select within it. Nothing in this file implements that, and
 * nothing should: a hand-rolled `keydown` would be a second, subtly different
 * implementation shadowing the one every user already knows.
 *
 * What the group *does* need is a shared `name`, which is why an unnamed control
 * still gets one — its own machine id, the only string guaranteed unique on the
 * page. Without it two segmented controls on one page would be one radio group.
 *
 * ── The indicator is measured, not laid out ─────────────────────────────────
 *
 * The sliding pill is a single absolutely-positioned element, and CSS has no way
 * to size it to "whichever segment is checked". Zag measures the checked item
 * and writes `--left`/`--top`/`--width`/`--height` inline; `.segmented__indicator`
 * reads all four. Reproduced here in an after-render hook, because the numbers
 * only exist once the row has been laid out.
 *
 * It is `hidden` until it has been measured — Zag's rule, and the one thing
 * about the pill a DOM comparison can see. An unmeasured pill would otherwise
 * paint a full-size block over the whole control on first frame.
 */
@Component({
  selector: "div[uioSegmentedControl]",
  standalone: true,
  exportAs: "uioSegmentedControl",
  imports: [UioIcon],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UioSegmentedControl), multi: true },
  ],
  template: `
    <div
      class="segmented__indicator"
      data-scope="segment-group"
      data-part="indicator"
      [id]="partId('indicator')"
      [attr.data-disabled]="flag(isDisabled())"
      [attr.data-orientation]="orientation()"
      [attr.hidden]="rect() ? null : ''"
    ></div>
    @for (item of items(); track item.value) {
      <!--
        Ark's Item *is* the <label>, and the radio it names is inside it. The
        label is what carries the segment's state; the input carries only what a
        form needs.
      -->
      <label
        class="segmented__item"
        data-scope="segment-group"
        data-part="item"
        [id]="itemId(item.value)"
        [attr.for]="inputId(item.value)"
        [attr.data-state]="stateOf(item.value)"
        [attr.data-disabled]="flag(isItemDisabled(item))"
        [attr.data-focus]="flag(focusedValue() === item.value)"
        [attr.data-focus-visible]="flag(focusVisibleValue() === item.value)"
        [attr.data-hover]="flag(hoveredValue() === item.value)"
        [attr.data-orientation]="orientation()"
        (pointerenter)="onHover(item)"
        (pointerleave)="hoveredItem.set(null)"
      >
        @if (item.icon; as name) {
          <span uioIcon class="segmented__item-icon" [name]="name" [size]="ICON_SIZE"></span>
        }
        <!--
          The text reports the *same* state as the label around it — Zag builds
          both out of one getItemDataAttrs, so a hovered segment marks its text
          too. Nothing in the stylesheet reads it there today; the contract does.
        -->
        <span
          class="segmented__item-text"
          data-scope="segment-group"
          data-part="item-text"
          [id]="itemTextId(item.value)"
          [attr.data-state]="stateOf(item.value)"
          [attr.data-disabled]="flag(isItemDisabled(item))"
          [attr.data-focus]="flag(focusedValue() === item.value)"
          [attr.data-focus-visible]="flag(focusVisibleValue() === item.value)"
          [attr.data-hover]="flag(hoveredValue() === item.value)"
          [attr.data-orientation]="orientation()"
        >{{ item.label }}</span>
        <input
          type="radio"
          [id]="inputId(item.value)"
          [attr.style]="HIDDEN"
          [attr.data-ownedby]="rootId"
          [attr.name]="groupName()"
          [attr.value]="item.value"
          [attr.aria-labelledby]="itemTextId(item.value)"
          [checked]="selectedValue() === item.value"
          [disabled]="isItemDisabled(item)"
          (change)="select(item.value)"
          (focus)="onFocus($event, item.value)"
          (blur)="onBlur()"
        />
      </label>
    }
  `,
  host: {
    "[class]": "hostClass()",
    "[id]": "rootId",
    role: "radiogroup",
    "[attr.aria-disabled]": "isDisabled() ? 'true' : null",
    "[attr.aria-orientation]": "orientation()",
    "[attr.aria-label]": "ariaLabel()",
  },
})
export class UioSegmentedControl extends UioPart implements ControlValueAccessor {
  readonly scope = "segment-group";
  readonly part = "root";

  readonly items = input<readonly SegmentedControlItem[]>([]);
  /** Uncontrolled until something binds it — see `UioSwitch`. Unset means the first item. */
  readonly value = model<string | undefined>(undefined);
  readonly valueChange = output<string>();
  readonly size = input<SegmentedControlSize>("md");
  readonly name = input<string | undefined>(undefined);
  /**
   * The control renders no Label part, so this is the only thing that can name
   * it. Ark's own `aria-labelledby` would point at an element that never exists
   * — the dangling-IDREF failure `OMIT_ARIA` exists for in the other three — so
   * nothing is bound in its place.
   */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: "aria-label" });

  /** `disabled` comes from the caller *or* from a reactive form's disabled state. */
  protected readonly disabledInput = input(false, {
    alias: "disabled",
    transform: booleanAttribute,
  });
  private readonly formDisabled = signal(false);
  override readonly disabled: Signal<boolean> = computed(
    () => this.disabledInput() || this.formDisabled(),
  );
  protected readonly isDisabled: Signal<boolean> = this.disabled;

  /**
   * Fixed, not an input. Ark's segment group takes an orientation and the shared
   * stylesheet lays the control out in one direction only — `.segmented` is an
   * `inline-grid` with `grid-auto-flow: column`. Declared because every part
   * reports it.
   */
  override readonly orientation: Signal<"horizontal"> = signal("horizontal");

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly appRef = inject(ApplicationRef);

  protected readonly ICON_SIZE = ICON_SIZE;
  protected readonly HIDDEN = VISUALLY_HIDDEN_INPUT;
  protected readonly flag = stateFlag;
  protected readonly hostClass = computed(() => segmentedControlStyles({ size: this.size() }));

  /**
   * Ark builds every id as `<scope>:<machine>:<part>` — and this scope's ids say
   * `radio-group`, not `segment-group`, because the machine underneath is the
   * radio group's. It looks like a typo and it is the contract.
   */
  private readonly machine = nextMachineId();
  protected get rootId(): string {
    return `radio-group:${this.machine}`;
  }
  protected partId(part: string): string {
    return `radio-group:${this.machine}:${part}`;
  }
  protected itemId(value: string): string {
    return this.partId(`radio:${value}`);
  }
  protected itemTextId(value: string): string {
    return this.partId(`radio:label:${value}`);
  }
  protected inputId(value: string): string {
    return this.partId(`radio:input:${value}`);
  }

  /** Radios in one group share a name; an unnamed control uses its own id. */
  protected readonly groupName = computed(() => this.name() ?? this.rootId);

  /**
   * The selected value, falling back to the first item.
   *
   * An uncontrolled control defaults to its first segment so the indicator has
   * somewhere to be — the same fallback React makes, and the reason there is no
   * "nothing selected" state to render.
   */
  protected readonly selectedValue = computed<string | undefined>(
    () => this.value() ?? this.items()[0]?.value,
  );

  /**
   * Which segment is focused, focused *visibly*, and hovered — three separate
   * questions, and none of them the root's own state.
   *
   * Named for the item rather than the state, because `UioPart` already owns
   * `focus`, `focusVisible` and `hover` as the *root's* booleans and a subclass
   * field of the same name would replace them: a control with one hovered
   * segment would report `data-hover` on the whole row, which Zag's
   * `getRootProps` never does.
   */
  private readonly focusedItem = signal<string | null>(null);
  private readonly focusVisibleItem = signal<string | null>(null);
  protected readonly hoveredItem = signal<string | null>(null);
  protected readonly focusedValue: Signal<string | null> = this.focusedItem;
  protected readonly focusVisibleValue: Signal<string | null> = this.focusVisibleItem;
  protected readonly hoveredValue: Signal<string | null> = this.hoveredItem;

  /** `null` until the row has been laid out, which is what keeps the pill hidden. */
  protected readonly rect = signal<IndicatorRect | null>(null);

  constructor() {
    super();
    afterRenderEffect({
      // Read through the signals so the pill re-measures when the selection
      // moves or the items change.
      earlyRead: () => {
        this.items();
        return this.measure(this.selectedValue());
      },
      write: (measured) => this.apply(measured()),
    });
  }

  protected stateOf(value: string): "checked" | "unchecked" {
    return this.selectedValue() === value ? "checked" : "unchecked";
  }
  /** A whole-control disable reaches every segment, and each may disable itself. */
  protected isItemDisabled(item: SegmentedControlItem): boolean {
    return !!item.disabled || this.isDisabled();
  }

  protected onHover(item: SegmentedControlItem): void {
    if (this.isItemDisabled(item)) return;
    this.hoveredItem.set(item.value);
  }

  /**
   * `:focus-visible` rather than a guess at whether the keyboard was used.
   *
   * Zag runs a focus-visible polyfill; the browser has the real answer, and
   * `.segmented__item[data-focus-visible]` is the entire focus ring in the
   * shared stylesheet. `matches` throws on browsers without the selector, which
   * is why it is guarded rather than trusted.
   */
  protected onFocus(event: FocusEvent, value: string): void {
    this.focusedItem.set(value);
    const input = event.target as HTMLInputElement;
    let visible = false;
    try {
      visible = input.matches(":focus-visible");
    } catch {
      visible = false;
    }
    this.focusVisibleItem.set(visible ? value : null);
    flushNow(this.appRef);
  }

  protected onBlur(): void {
    this.focusedItem.set(null);
    this.focusVisibleItem.set(null);
    this.onTouched();
    flushNow(this.appRef);
  }

  protected select(next: string): void {
    if (next === this.selectedValue()) return;
    this.value.set(next);
    this.valueChange.emit(next);
    this.onChange(next);
    flushNow(this.appRef);
  }

  /**
   * The checked segment's box, relative to the control.
   *
   * `offsetLeft`/`offsetTop` rather than two `getBoundingClientRect` calls
   * subtracted: `.segmented` is `position: relative`, so the segments' offset
   * parent *is* the control, and the numbers come out already in the coordinate
   * system `--left`/`--top` are read in — padding included, which is why the
   * first segment measures `4px` rather than `0`.
   */
  private measure(value: string | undefined): IndicatorRect | null {
    const index = this.items().findIndex((item) => item.value === value);
    if (index === -1) return null;
    // Index-aligned with `items()`, because one `@for` renders both — the same
    // arrangement `UioTabs` and `UioAccordion` use to reach their own elements.
    const item = this.host.nativeElement.querySelectorAll<HTMLElement>('[data-part="item"]')[index];
    if (!item) return null;
    const rect = {
      left: item.offsetLeft,
      top: item.offsetTop,
      width: item.offsetWidth,
      height: item.offsetHeight,
    };
    // An unlaid-out row measures zero, and a zero-size pill is Zag's "not ready
    // yet" — reported as `null` so the element stays hidden rather than
    // painting a collapsed sliver.
    return rect.width === 0 && rect.height === 0 ? null : rect;
  }

  /**
   * Written straight onto the element rather than through a binding.
   *
   * This runs in an after-render hook, where setting a signal would schedule
   * another whole change-detection pass to move four custom properties. The
   * `hidden` attribute *is* bound, off `rect()`, because it is part of the
   * rendered contract and a stale one would be a real difference.
   */
  private apply(rect: IndicatorRect | null): void {
    const element = this.host.nativeElement.querySelector<HTMLElement>('[data-part="indicator"]');
    if (!element) return;
    this.rect.set(rect);
    if (!rect) return;
    element.style.setProperty("--left", `${rect.left}px`);
    element.style.setProperty("--top", `${rect.top}px`);
    element.style.setProperty("--width", `${rect.width}px`);
    element.style.setProperty("--height", `${rect.height}px`);
    // `left` is what actually moves the pill; the custom property is only where
    // the number is kept. Zag writes the same pair, and the stylesheet's
    // `--transition-duration` is what animates between them.
    element.style.setProperty("left", "var(--left)");
  }

  protected onTouched: () => void = () => {};
  private onChange: (value: string) => void = () => {};

  writeValue(value: string | null): void {
    this.value.set(value ?? undefined);
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}
