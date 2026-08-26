import {
  Component,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  model,
  output,
  signal,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { clsx } from "clsx";
import { radioGroupStyles, type RadioGroupVariants } from "@ui-organized/core";
import { stateFlag } from "../part.js";
import { VISUALLY_HIDDEN_INPUT, nextMachineId } from "../part-ids.js";
import { UioIcon } from "../icons/icon.js";

export type RadioOrientation = NonNullable<RadioGroupVariants["orientation"]>;

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
  /** Shown beneath the option, and puts that one control in its error state. */
  error?: string;
}

/**
 * One choice out of several.
 *
 * ── Why the group is one component and not a root plus items ────────────────
 *
 * A radio group is the one control in this family where the parts are not
 * independent: exactly one item may be checked, every item shares a `name`, and
 * arrow keys move between them. Handing a caller a `UioRadioItem` to place
 * himself would mean each item finding its group, agreeing on the name, and
 * reporting back — for no gain, since the options are data. So the group takes
 * them as data, exactly as the other three do.
 *
 * ── The host is not an Ark part ─────────────────────────────────────────────
 *
 * This is the one component here that does not extend `UioPart`. The element
 * the caller writes is the `.radio-group` wrapper, which holds the group's own
 * heading *outside* the `radiogroup` — Ark's root is the inner `.radio-group__items`.
 * Extending the base would put `data-scope`/`data-part` on the wrapper, which is
 * one element too high, and every state attribute with it.
 *
 * That heading is also why the group's accessible name is wired by hand: it is
 * a sibling of the radiogroup rather than a part of it, so `aria-labelledby`
 * names it explicitly, and with no heading the reference is dropped rather than
 * left dangling — a dangling IDREF outranks `aria-label`.
 *
 * ```html
 * <div uioRadioGroup label="Fruit" [options]="fruit" formControlName="fruit"></div>
 * ```
 */
@Component({
  selector: "div[uioRadioGroup]",
  standalone: true,
  imports: [UioIcon],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UioRadioGroup), multi: true },
  ],
  template: `
    @if (label(); as text) {
      <div class="radio-group__label" [id]="partId('label')">{{ text }}</div>
    }
    <div
      class="radio-group__items"
      data-scope="radio-group"
      data-part="root"
      role="radiogroup"
      [id]="rootId"
      [attr.aria-labelledby]="label() ? partId('label') : null"
      [attr.aria-label]="label() ? null : ariaLabel()"
      [attr.aria-disabled]="disabled() ? 'true' : null"
      [attr.data-disabled]="flag(disabled())"
      [attr.data-orientation]="orientation()"
      [attr.aria-orientation]="orientation()"
    >
      @for (option of options(); track option.value) {
        <div class="radio-item-wrap">
          <!--
            Ark's Item *is* the <label>; the dot inside the control is a plain
            child shown by [data-state="checked"] in CSS rather than an
            element that comes and goes.
          -->
          <label
            [class]="itemClass(option)"
            data-scope="radio-group"
            data-part="item"
            [id]="itemId(option.value)"
            [attr.for]="inputId(option.value)"
            [attr.data-state]="itemState(option.value)"
            [attr.data-disabled]="flag(isDisabled(option))"
            [attr.data-orientation]="orientation()"
          >
            <div
              class="radio-item__control"
              data-scope="radio-group"
              data-part="item-control"
              aria-hidden="true"
              [id]="itemControlId(option.value)"
              [attr.data-state]="itemState(option.value)"
              [attr.data-disabled]="flag(isDisabled(option))"
              [attr.data-orientation]="orientation()"
            >
              <span class="radio-item__indicator"></span>
            </div>
            <span
              class="radio-item__label text-default-body-large"
              data-scope="radio-group"
              data-part="item-text"
              [id]="itemTextId(option.value)"
              [attr.data-state]="itemState(option.value)"
              [attr.data-disabled]="flag(isDisabled(option))"
              [attr.data-orientation]="orientation()"
            >{{ option.label }}</span>
            <input
              type="radio"
              [id]="inputId(option.value)"
              [attr.style]="HIDDEN"
              [attr.data-ownedby]="rootId"
              [attr.name]="groupName()"
              [attr.value]="option.value"
              [attr.aria-labelledby]="itemTextId(option.value)"
              [checked]="value() === option.value"
              [disabled]="isDisabled(option)"
              (change)="select(option.value)"
              (blur)="onTouched()"
            />
          </label>
          @if (option.error; as message) {
            <div class="radio-item__error-message">
              <span uioIcon name="alert-circle" [size]="ERROR_ICON_SIZE"></span>
              <span class="radio-item__error-text text-emphasis-body-small">{{ message }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  host: { "[class]": "hostClass()" },
})
export class UioRadioGroup implements ControlValueAccessor {
  readonly options = input<readonly RadioOption[]>([]);
  readonly value = model<string | undefined>(undefined);
  readonly label = input<string | undefined>(undefined);
  readonly orientation = input<RadioOrientation>("vertical");
  readonly name = input<string | undefined>(undefined);
  /** Only used when the group has no visible `label`. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: "aria-label" });
  readonly valueChange = output<string>();

  /** `disabled` comes from the caller *or* from a reactive form's disabled state. */
  protected readonly disabledInput = input(false, {
    alias: "disabled",
    transform: booleanAttribute,
  });
  private readonly formDisabled = signal(false);
  protected readonly disabled = computed(() => this.disabledInput() || this.formDisabled());

  /**
   * Ark builds every id as `<scope>:<machine>:<part>`, and an item's parts carry
   * the option's value on the end so two groups on a page cannot collide.
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
  protected itemControlId(value: string): string {
    return this.partId(`radio:control:${value}`);
  }
  protected itemTextId(value: string): string {
    return this.partId(`radio:label:${value}`);
  }
  protected inputId(value: string): string {
    return this.partId(`radio:input:${value}`);
  }

  /**
   * Radios in one group share a name — that is what makes the browser treat
   * them as one choice — so an unnamed group still needs one, and its own id is
   * the only value guaranteed unique on the page.
   */
  protected readonly groupName = computed(() => this.name() ?? this.rootId);

  protected readonly ERROR_ICON_SIZE = 16;
  protected readonly HIDDEN = VISUALLY_HIDDEN_INPUT;
  protected readonly flag = stateFlag;
  protected readonly hostClass = computed(() =>
    radioGroupStyles({ orientation: this.orientation() }),
  );

  protected isDisabled(option: RadioOption): boolean {
    return !!option.disabled || this.disabled();
  }
  protected itemState(value: string): string {
    return this.value() === value ? "checked" : "unchecked";
  }
  /**
   * The option's own state, not the group's. A group-level `disabled` reports
   * itself through `[data-disabled]` on every part instead, and the split is
   * load-bearing rather than cosmetic: `.radio-item--disabled` is what carries
   * the dimming, so adding it for a group-level disable would fade a whole
   * group that the other three leave at full strength.
   */
  protected itemClass(option: RadioOption): string {
    return clsx(
      "radio-item",
      option.disabled && "radio-item--disabled",
      option.error && "radio-item--error",
    );
  }

  protected onTouched: () => void = () => {};
  private onChange: (value: string) => void = () => {};

  protected select(next: string): void {
    this.value.set(next);
    this.valueChange.emit(next);
    this.onChange(next);
  }

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
