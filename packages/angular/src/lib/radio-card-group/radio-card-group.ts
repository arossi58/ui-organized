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
import { radioCardGroupStyles } from "@ui-organized/core";
import { stateFlag } from "../part.js";
import { VISUALLY_HIDDEN_INPUT, nextMachineId } from "../part-ids.js";
import { UioIcon, type IconName } from "../icons/icon.js";
import { glyph, type IconGlyph } from "../icons/glyph.js";

export interface SelectionCardOption {
  value: string;
  /** The card's title, and the option's accessible name. */
  label: string;
  /** A line under the title. It describes the option rather than naming it. */
  description?: string;
  /** An icon before the text. */
  icon?: IconName | IconGlyph;
  disabled?: boolean;
}

export type SelectionCardColumns = 1 | 2 | 3 | 4;
export type SelectionCardSize = "sm" | "md";
export type SelectionCardIndicator = "start" | "end";

/**
 * A single choice from a set of cards: a plan, a delivery speed, a layout.
 *
 * ```html
 * <div uioRadioCardGroup label="Plan" [options]="plans" [(value)]="plan"></div>
 * ```
 *
 * The radio-group parts are written out here as UioRadioGroup writes them, so
 * the DOM matches what Ark renders in the other three libraries. Each card is
 * the item's `<label>`, so the whole card is the hit target; the input is named
 * by the title alone and described by the description.
 */
@Component({
  selector: "div[uioRadioCardGroup]",
  standalone: true,
  imports: [UioIcon],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UioRadioCardGroup), multi: true },
  ],
  template: `
    @if (label(); as text) {
      <div class="selection-card-group__label" [id]="partId('label')">{{ text }}</div>
    }
    <div
      class="selection-card-group__items"
      data-scope="radio-group"
      data-part="root"
      role="radiogroup"
      [id]="rootId"
      [attr.aria-labelledby]="label() ? partId('label') : null"
      [attr.aria-label]="label() ? null : ariaLabel()"
      [attr.aria-describedby]="errorMessage() ? partId('error') : null"
      [attr.aria-disabled]="disabled() ? 'true' : null"
      [attr.data-disabled]="flag(disabled())"
      data-orientation="vertical"
      aria-orientation="vertical"
    >
      @for (option of options(); track option.value) {
        <label
          [class]="cardClass()"
          data-scope="radio-group"
          data-part="item"
          [id]="itemId(option.value)"
          [attr.for]="inputId(option.value)"
          [attr.data-state]="itemState(option.value)"
          [attr.data-disabled]="flag(isDisabled(option))"
          data-orientation="vertical"
          [attr.data-hover]="flag(hovered() === option.value)"
          [attr.data-focus]="flag(focused() === option.value)"
          [attr.data-focus-visible]="flag(focusVisible() === option.value)"
          (mouseenter)="hovered.set(option.value)"
          (mouseleave)="hovered.set(null)"
        >
          @if (option.icon; as icon) {
            <span class="selection-card__icon" aria-hidden="true"
              ><span uioIcon [name]="icon" [size]="ICON_SIZE"></span
            ></span>
          }
          <span class="selection-card__body">
            <span
              class="selection-card__title"
              data-scope="radio-group"
              data-part="item-text"
              [id]="itemTextId(option.value)"
              [attr.data-state]="itemState(option.value)"
              [attr.data-disabled]="flag(isDisabled(option))"
              data-orientation="vertical"
              [attr.data-hover]="flag(hovered() === option.value)"
              [attr.data-focus]="flag(focused() === option.value)"
              [attr.data-focus-visible]="flag(focusVisible() === option.value)"
              >{{ option.label }}</span
            >
            @if (option.description; as description) {
              <span class="selection-card__description" [id]="descriptionId(option.value)">{{ description }}</span>
            }
          </span>
          <div
            class="radio-item__control selection-card__control"
            data-scope="radio-group"
            data-part="item-control"
            aria-hidden="true"
            [id]="itemControlId(option.value)"
            [attr.data-state]="itemState(option.value)"
            [attr.data-disabled]="flag(isDisabled(option))"
            data-orientation="vertical"
            [attr.data-hover]="flag(hovered() === option.value)"
            [attr.data-focus]="flag(focused() === option.value)"
            [attr.data-focus-visible]="flag(focusVisible() === option.value)"
          >
            <span class="radio-item__indicator"></span>
          </div>
          <input
            type="radio"
            [id]="inputId(option.value)"
            [attr.style]="HIDDEN"
            [attr.data-ownedby]="rootId"
            [attr.name]="groupName()"
            [attr.value]="option.value"
            [attr.aria-labelledby]="itemTextId(option.value)"
            [attr.aria-describedby]="option.description ? descriptionId(option.value) : null"
            [checked]="value() === option.value"
            [disabled]="isDisabled(option)"
            (change)="select(option.value)"
            (focus)="onItemFocus(option.value, $event)"
            (blur)="onItemBlur()"
          />
        </label>
      }
    </div>
    @if (errorMessage(); as message) {
      <div class="selection-card-group__error" [id]="partId('error')">
        <span uioIcon [name]="glyph('alert-circle')" [size]="ERROR_ICON_SIZE"></span>
        <span>{{ message }}</span>
      </div>
    }
  `,
  host: { "[class]": "hostClass()" },
})
export class UioRadioCardGroup implements ControlValueAccessor {
  protected readonly glyph = glyph;
  protected readonly hovered = signal<string | null>(null);
  protected readonly focused = signal<string | null>(null);
  protected readonly focusVisible = signal<string | null>(null);

  readonly options = input<readonly SelectionCardOption[]>([]);
  readonly value = model<string | undefined>(undefined);
  readonly label = input<string | undefined>(undefined);
  readonly columns = input<SelectionCardColumns>(1);
  readonly size = input<SelectionCardSize>("md");
  readonly indicator = input<SelectionCardIndicator>("end");
  readonly name = input<string | undefined>(undefined);
  /** A string shows an error message under the cards; `true` marks the group invalid without one. */
  readonly error = input<string | boolean | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined, { alias: "aria-label" });
  readonly valueChange = output<string>();

  protected readonly disabledInput = input(false, { alias: "disabled", transform: booleanAttribute });
  private readonly formDisabled = signal(false);
  protected readonly disabled = computed(() => this.disabledInput() || this.formDisabled());
  protected readonly errorMessage = computed(() => {
    const error = this.error();
    return typeof error === "string" && error ? error : null;
  });

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
  protected descriptionId(value: string): string {
    return this.partId(`description-${value}`);
  }
  protected readonly groupName = computed(() => this.name() ?? this.rootId);

  protected readonly ICON_SIZE = 20;
  protected readonly ERROR_ICON_SIZE = 16;
  protected readonly HIDDEN = VISUALLY_HIDDEN_INPUT;
  protected readonly flag = stateFlag;
  protected readonly hostClass = computed(() =>
    radioCardGroupStyles({ size: this.size(), columns: this.columns(), invalid: !!this.error() }),
  );
  protected readonly cardClass = computed(() =>
    clsx("selection-card", `selection-card--indicator-${this.indicator()}`),
  );

  protected isDisabled(option: SelectionCardOption): boolean {
    return !!option.disabled || this.disabled();
  }
  protected itemState(value: string): string {
    return this.value() === value ? "checked" : "unchecked";
  }

  protected onItemFocus(value: string, event: FocusEvent): void {
    this.focused.set(value);
    const target = event.target as Element | null;
    // Guarded as UioRadioGroup is: old engines throw on an unknown pseudo-class.
    try {
      this.focusVisible.set(target?.matches(":focus-visible") ? value : null);
    } catch {
      this.focusVisible.set(null);
    }
  }
  protected onItemBlur(): void {
    this.focused.set(null);
    this.focusVisible.set(null);
    this.onTouched();
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
