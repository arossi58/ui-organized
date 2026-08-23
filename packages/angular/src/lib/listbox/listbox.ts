import {
  Component,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  model,
  output,
  signal,
  type Signal,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { clsx } from "clsx";
import {
  CONTROL_ICON_SIZE,
  listboxStyles,
  type ControlSize,
  type ListboxVariants,
} from "@ui-organized/core";
import { UioPart, stateFlag } from "../part.js";
import { nextMachineId } from "../part-ids.js";
import { UioIcon } from "../icons/icon.js";
import { firstEnabled } from "../overlay/roving.js";

export type ListboxSize = NonNullable<ListboxVariants["size"]>;
export type ListboxVariant = NonNullable<ListboxVariants["variant"]>;
export type ListboxSelectionMode = "single" | "multiple" | "extended";

export interface ListboxOption {
  /** Form value submitted when the option is selected. */
  value: string;
  /** Display text. */
  label: string;
  /** Prevents selection while keeping the option visible. */
  disabled?: boolean;
  /** Group heading this option belongs under. Options sharing a group render together. */
  group?: string;
}

/** One rendered bucket: a group heading with its options, or `null` for the ungrouped ones. */
interface OptionGroup {
  key: string | null;
  /** Stable per bucket, so the group and its label can name each other by id. */
  id: string;
  options: ListboxOption[];
}

/**
 * An always-visible list of choices — the popup half of a Select, standing on
 * its own.
 *
 * ```html
 * <div uioListbox [options]="fruit" label="Fruit" [(value)]="picked"></div>
 * ```
 *
 * ── The list keeps focus; the option is only named ──────────────────────────
 *
 * One tab stop, on the content, and the option a user is on is named by
 * `aria-activedescendant` rather than focused. That is why `[data-highlighted]`
 * — which is the whole hover-and-arrow treatment in `Listbox.css` — sits on an
 * element that does not have DOM focus.
 *
 * ── The trap: a highlight is not the same as an active descendant ───────────
 *
 * They look like one state and are two, and the difference is visible the moment
 * anyone clicks. Zag reports an option as highlighted only when the *modality is
 * keyboard*:
 *
 * ```js
 * highlighted: highlighted && (inputState.focused ? focused : focusVisible)
 * ```
 *
 * So clicking an option sets `aria-activedescendant` to it and paints no
 * highlight; pressing ArrowDown next paints one. A port that drove
 * `data-highlighted` straight off the highlighted value would light up an option
 * under the mouse pointer that Ark leaves alone, on every click, in a component
 * whose entire visual state is that attribute.
 *
 * {@link keyboardModality} is the local stand-in for zag's document-wide focus
 * modality: a pointer press inside the list clears it and a keypress sets it,
 * which is the same answer for everything this component can observe.
 *
 * ── Two behaviours worth not "fixing" ───────────────────────────────────────
 *
 * Arrow keys do **not** wrap — `loopFocus` is off — so ArrowDown at the end of
 * the list stays put rather than jumping to the top. And arrowing does not
 * select: `selectOnHighlight` is off, so the selection only moves on click,
 * Enter or Space. Both differ from `UioMenu`, and both are Ark's.
 */
@Component({
  selector: "div[uioListbox]",
  standalone: true,
  imports: [NgTemplateOutlet, UioIcon],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UioListbox), multi: true },
  ],
  template: `
    @if (label(); as text) {
      <span
        class="listbox__label"
        data-scope="listbox"
        data-part="label"
        [id]="partId('label')"
        [attr.data-disabled]="flag(disabled())"
        >{{ text }}</span
      >
    }
    <!--
      aria-labelledby names the label part whether or not one was rendered —
      Ark emits it unconditionally, and the reference dangles in a listbox with
      no label. Reproduced rather than corrected: the harness compares the
      reference, and "Angular alone drops it" is a difference this port would
      have invented.
    -->
    <div
      class="listbox__content"
      data-scope="listbox"
      data-part="content"
      role="listbox"
      tabindex="0"
      data-layout="list"
      style="--column-count: 1;"
      [id]="partId('content')"
      [attr.data-orientation]="orientation()"
      [attr.aria-labelledby]="partId('label')"
      [attr.aria-multiselectable]="multiple() ? 'true' : null"
      [attr.aria-activedescendant]="activeDescendant()"
      [attr.data-activedescendant]="activeDescendant()"
      [attr.data-empty]="flag(!options().length)"
      (focus)="onFocus()"
      (blur)="focused.set(false)"
      (keydown)="onKeydown($event)"
      (pointerdown)="keyboardModality.set(false)"
    >
      @for (group of groups(); track group.id) {
        @if (group.key === null) {
          @for (option of group.options; track option.value) {
            <ng-container [ngTemplateOutlet]="item" [ngTemplateOutletContext]="{ $implicit: option }" />
          }
        } @else {
          <div
            class="listbox__group"
            data-scope="listbox"
            data-part="item-group"
            role="group"
            [id]="groupId(group.id)"
            [attr.aria-labelledby]="groupLabelId(group.id)"
            [attr.data-orientation]="orientation()"
            [attr.data-disabled]="flag(disabled())"
          >
            <div
              class="listbox__group-label"
              data-scope="listbox"
              data-part="item-group-label"
              role="presentation"
              [id]="groupLabelId(group.id)"
            >
              {{ group.key }}
            </div>
            @for (option of group.options; track option.value) {
              <ng-container
                [ngTemplateOutlet]="item"
                [ngTemplateOutletContext]="{ $implicit: option }"
              />
            }
          </div>
        }
      }
      <!-- Ark renders the Empty part only when the collection has no items. -->
      @if (!options().length) {
        <div class="listbox__empty" data-scope="listbox" data-part="empty" role="presentation">
          {{ emptyMessage() }}
        </div>
      }
    </div>

    <ng-template #item let-option>
      <div
        class="listbox__item"
        data-scope="listbox"
        data-part="item"
        role="option"
        data-layout="list"
        [id]="optionId(option.value)"
        [attr.data-value]="option.value"
        [attr.data-orientation]="orientation()"
        [attr.aria-selected]="isSelected(option.value) ? 'true' : 'false'"
        [attr.data-selected]="flag(isSelected(option.value))"
        [attr.data-state]="isSelected(option.value) ? 'checked' : 'unchecked'"
        [attr.data-highlighted]="flag(isHighlighted(option.value))"
        [attr.data-disabled]="flag(isDisabled(option))"
        [attr.aria-disabled]="isDisabled(option) ? 'true' : null"
        (mousedown)="onItemMouseDown($event)"
        (click)="choose(option, $event)"
      >
        <div
          class="listbox__item-text"
          data-scope="listbox"
          data-part="item-text"
          [attr.data-state]="isSelected(option.value) ? 'checked' : 'unchecked'"
          [attr.data-highlighted]="flag(isHighlighted(option.value))"
          [attr.data-disabled]="flag(isDisabled(option))"
        >
          {{ option.label }}
        </div>
        <div
          class="listbox__item-indicator"
          data-scope="listbox"
          data-part="item-indicator"
          aria-hidden="true"
          [attr.data-state]="isSelected(option.value) ? 'checked' : 'unchecked'"
          [attr.hidden]="isSelected(option.value) ? null : ''"
        >
          <span uioIcon name="check" [size]="iconSize()"></span>
        </div>
      </div>
    </ng-template>
  `,
  host: {
    "[class]": "hostClass()",
    "[id]": "rootId",
  },
})
export class UioListbox extends UioPart implements ControlValueAccessor {
  readonly scope = "listbox";
  readonly part = "root";

  readonly options = input<readonly ListboxOption[]>([]);
  readonly label = input<string | undefined>(undefined);
  /** Uncontrolled until something binds it — see `UioSwitch` on the same fork. */
  readonly value = model<string[]>([]);
  readonly selectionMode = input<ListboxSelectionMode>("single");
  readonly size = input<ListboxSize>("md");
  readonly variant = input<ListboxVariant>("default");
  readonly emptyMessage = input("No options");
  readonly valueChange = output<string[]>();

  /** `disabled` comes from the caller *or* from a reactive form's disabled state. */
  protected readonly disabledInput = input(false, {
    alias: "disabled",
    transform: booleanAttribute,
  });
  private readonly formDisabled = signal(false);
  override readonly disabled: Signal<boolean> = computed(
    () => this.disabledInput() || this.formDisabled(),
  );
  override readonly orientation: Signal<"vertical"> = computed(() => "vertical");

  private readonly machine = nextMachineId();

  /** Whether the content has DOM focus. Half of what makes a highlight visible. */
  protected readonly focused = signal(false);
  /**
   * Whether the user is driving this by keyboard.
   *
   * Zag reads a document-wide focus modality; this is the same question narrowed
   * to what one component can see. Cleared by a pointer press inside the list,
   * set by a keypress in it.
   *
   * Named for the modality rather than `focusVisible`, which is `UioPart`
   * vocabulary: overriding that would put `data-focus-visible` on the root the
   * moment a key was pressed, and Ark puts none there.
   */
  protected readonly keyboardModality = signal(false);
  private readonly highlightedValue = signal<string | null>(null);

  protected readonly flag = stateFlag;
  protected readonly iconSize = computed(() => CONTROL_ICON_SIZE[this.size() as ControlSize]);
  protected readonly hostClass = computed(() =>
    clsx(listboxStyles({ size: this.size(), variant: this.variant() })),
  );

  /** `extended` is multi-select too — it only adds shift-ranges on top. */
  protected readonly multiple = computed(() => this.selectionMode() !== "single");

  protected readonly activeDescendant = computed(() => {
    const value = this.highlightedValue();
    return value === null ? null : this.optionId(value);
  });

  /**
   * Options bucketed by `group`, in declaration order, with the ungrouped ones
   * keeping a bucket of their own.
   *
   * The `null` bucket must render its options *unwrapped*: an `ItemGroup` with
   * no heading announces a group with no name, which is worse than no group.
   */
  protected readonly groups = computed<OptionGroup[]>(() => {
    const buckets = new Map<string | null, OptionGroup>();
    for (const option of this.options()) {
      const key = option.group ?? null;
      const bucket = buckets.get(key);
      if (bucket) bucket.options.push(option);
      else buckets.set(key, { key, id: `g${buckets.size}`, options: [option] });
    }
    return [...buckets.values()];
  });

  get rootId(): string {
    return `listbox:${this.machine}`;
  }
  protected partId(part: string): string {
    return `listbox:${this.machine}:${part}`;
  }
  /** Ark's option ids carry the value, so two listboxes on a page cannot collide. */
  optionId(value: string): string {
    return this.partId(`item:${value}`);
  }
  protected groupId(key: string): string {
    return this.partId(`item-group:${key}`);
  }
  protected groupLabelId(key: string): string {
    return this.partId(`item-group-label:${key}`);
  }

  protected isSelected(value: string): boolean {
    return this.value().includes(value);
  }
  protected isDisabled(option: ListboxOption): boolean {
    return this.disabled() || !!option.disabled;
  }
  protected isHighlighted(value: string): boolean {
    return this.highlightedValue() === value && this.focused() && this.keyboardModality();
  }

  /**
   * Ark focuses the content on mousedown rather than letting the click land
   * where it may — without it a click on an option's text leaves focus on the
   * body and the next arrow key goes nowhere.
   */
  protected onItemMouseDown(event: MouseEvent): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement).closest<HTMLElement>('[data-part="content"]')?.focus();
  }

  protected onFocus(): void {
    this.focused.set(true);
    // A list arrived at with nothing chosen opens on its first option, so the
    // first arrow key moves from somewhere rather than from nothing.
    if (this.value().length || this.highlightedValue() !== null) return;
    const first = this.enabledIndex(0, 1);
    if (first !== -1) this.highlightedValue.set(this.options()[first]!.value);
  }

  protected choose(option: ListboxOption, event: MouseEvent): void {
    if (this.isDisabled(option)) return;
    this.highlightedValue.set(option.value);
    this.select(option.value, event.shiftKey, event.ctrlKey || event.metaKey);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const options = this.options();
    const current = options.findIndex((option) => option.value === this.highlightedValue());

    const moveTo = (index: number) => {
      // Set before the guard: the modality changed even if the highlight had
      // nowhere to go, and it is what makes the *current* highlight visible.
      this.keyboardModality.set(true);
      const next = options[index];
      // No `preventDefault` when nothing moves, so a listbox at the end of its
      // list still scrolls the page — which is what Ark leaves the browser to do.
      if (!next) return;
      event.preventDefault();
      this.highlightedValue.set(next.value);
    };

    switch (event.key) {
      case "ArrowDown":
        // No wrap: `loopFocus` is off, so the end of the list is the end.
        return moveTo(current === -1 ? this.enabledIndex(0, 1) : this.enabledIndex(current + 1, 1));
      case "ArrowUp":
        return moveTo(
          current === -1
            ? this.enabledIndex(options.length - 1, -1)
            : this.enabledIndex(current - 1, -1),
        );
      case "Home":
        return moveTo(this.enabledIndex(0, 1));
      case "End":
        return moveTo(this.enabledIndex(options.length - 1, -1));
      case "Enter":
      case " ": {
        event.preventDefault();
        this.keyboardModality.set(true);
        const option = options[current];
        if (option && !this.isDisabled(option)) {
          this.select(option.value, event.shiftKey, event.ctrlKey || event.metaKey);
        }
        return;
      }
      default:
        return;
    }
  }

  private enabledIndex(from: number, step: number): number {
    return firstEnabled(
      this.options().map((option) => ({ disabled: this.isDisabled(option) })),
      from,
      step,
    );
  }

  /**
   * Ark's three selection modes, which differ only in what a plain click means.
   *
   * `single` replaces — and does *not* deselect, because `deselectable` is off,
   * so clicking the chosen option again leaves it chosen. `multiple` always
   * toggles. `extended` replaces on a plain click, toggles with a modifier, and
   * takes a range with Shift.
   */
  private select(value: string, shiftKey: boolean, metaKey: boolean): void {
    const mode = this.selectionMode();
    const current = this.value();
    let next: string[];

    if (mode === "single") {
      next = [value];
    } else if (shiftKey && current.length) {
      next = this.range(current[current.length - 1]!, value);
    } else if (mode === "multiple" || metaKey) {
      next = current.includes(value)
        ? current.filter((entry) => entry !== value)
        : [...current, value];
    } else {
      next = [value];
    }

    if (next.length === current.length && next.every((entry, index) => entry === current[index])) {
      return;
    }
    this.value.set(next);
    this.valueChange.emit(next);
    this.onChange(next);
  }

  /** Every selectable option between two values, inclusive, in list order. */
  private range(from: string, to: string): string[] {
    const options = this.options();
    const start = options.findIndex((option) => option.value === from);
    const end = options.findIndex((option) => option.value === to);
    if (start === -1 || end === -1) return [to];
    const [low, high] = start <= end ? [start, end] : [end, start];
    return options
      .slice(low, high + 1)
      .filter((option) => !this.isDisabled(option))
      .map((option) => option.value);
  }

  protected onTouched: () => void = () => {};
  private onChange: (value: string[]) => void = () => {};

  writeValue(value: string[] | null): void {
    this.value.set(value ?? []);
  }
  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}
