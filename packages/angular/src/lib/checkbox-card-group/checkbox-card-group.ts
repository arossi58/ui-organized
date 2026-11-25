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
import { checkboxCardGroupStyles } from "@ui-organized/core";
import { stateFlag } from "../part.js";
import { VISUALLY_HIDDEN_INPUT, nextMachineId } from "../part-ids.js";
import { UioIcon } from "../icons/icon.js";
import { glyph } from "../icons/glyph.js";
import type {
  SelectionCardColumns,
  SelectionCardIndicator,
  SelectionCardOption,
  SelectionCardSize,
} from "../radio-card-group/radio-card-group.js";

/**
 * Any number of choices from a set of cards: add-ons, interests, permissions.
 *
 * ```html
 * <div uioCheckboxCardGroup label="Add-ons" [options]="extras" [(value)]="chosen"></div>
 * ```
 *
 * Ark renders each card as a checkbox of its own inside a `group`, with its own
 * machine and so its own ids; the parts are written out here as UioCheckbox
 * writes them, once per option. The input is named by the title alone and
 * described by the description.
 */
@Component({
  selector: "div[uioCheckboxCardGroup]",
  standalone: true,
  imports: [UioIcon],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UioCheckboxCardGroup), multi: true },
  ],
  template: `
    @if (label(); as text) {
      <div class="selection-card-group__label" [id]="labelId">{{ text }}</div>
    }
    <div
      class="selection-card-group__items"
      data-scope="checkbox"
      data-part="group"
      role="group"
      [attr.aria-labelledby]="label() ? labelId : null"
      [attr.aria-label]="label() ? null : ariaLabel()"
      [attr.aria-describedby]="errorMessage() ? errorId : null"
    >
      @for (option of options(); track option.value) {
        <label
          [class]="cardClass()"
          data-scope="checkbox"
          data-part="root"
          [id]="rootId(option.value)"
          [attr.for]="partId(option.value, 'input')"
          [attr.data-state]="itemState(option.value)"
          [attr.data-disabled]="flag(isDisabled(option))"
          [attr.data-invalid]="flag(invalid())"
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
              data-scope="checkbox"
              data-part="label"
              [id]="partId(option.value, 'label')"
              [attr.data-state]="itemState(option.value)"
              [attr.data-disabled]="flag(isDisabled(option))"
              [attr.data-invalid]="flag(invalid())"
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
            class="checkbox__control selection-card__control"
            data-scope="checkbox"
            data-part="control"
            aria-hidden="true"
            [id]="partId(option.value, 'control')"
            [attr.data-state]="itemState(option.value)"
            [attr.data-disabled]="flag(isDisabled(option))"
            [attr.data-invalid]="flag(invalid())"
            [attr.data-hover]="flag(hovered() === option.value)"
            [attr.data-focus]="flag(focused() === option.value)"
            [attr.data-focus-visible]="flag(focusVisible() === option.value)"
          >
            <div
              class="checkbox__indicator"
              data-scope="checkbox"
              data-part="indicator"
              [attr.data-state]="itemState(option.value)"
              [attr.data-disabled]="flag(isDisabled(option))"
              [attr.data-invalid]="flag(invalid())"
              [attr.data-hover]="flag(hovered() === option.value)"
              [attr.data-focus]="flag(focused() === option.value)"
              [attr.data-focus-visible]="flag(focusVisible() === option.value)"
              [attr.hidden]="isChecked(option.value) ? null : ''"
            >
              <span uioIcon class="checkbox__check" [name]="glyph('check')" [size]="CHECK_SIZE"></span>
            </div>
          </div>
          <input
            type="checkbox"
            [id]="partId(option.value, 'input')"
            [attr.style]="HIDDEN"
            [attr.name]="name()"
            [attr.value]="option.value"
            [attr.aria-labelledby]="partId(option.value, 'label')"
            [attr.aria-describedby]="option.description ? descriptionId(option.value) : null"
            [attr.aria-invalid]="invalid() ? 'true' : 'false'"
            [checked]="isChecked(option.value)"
            [disabled]="isDisabled(option)"
            (change)="toggle(option.value, $event)"
            (focus)="onItemFocus(option.value, $event)"
            (blur)="onItemBlur()"
          />
        </label>
      }
    </div>
    @if (errorMessage(); as message) {
      <div class="selection-card-group__error" [id]="errorId">
        <span uioIcon [name]="glyph('alert-circle')" [size]="ERROR_ICON_SIZE"></span>
        <span>{{ message }}</span>
      </div>
    }
  `,
  host: { "[class]": "hostClass()" },
})
export class UioCheckboxCardGroup implements ControlValueAccessor {
  protected readonly glyph = glyph;
  protected readonly hovered = signal<string | null>(null);
  protected readonly focused = signal<string | null>(null);
  protected readonly focusVisible = signal<string | null>(null);

  readonly options = input<readonly SelectionCardOption[]>([]);
  readonly value = model<string[]>([]);
  readonly label = input<string | undefined>(undefined);
  readonly columns = input<SelectionCardColumns>(1);
  readonly size = input<SelectionCardSize>("md");
  readonly indicator = input<SelectionCardIndicator>("end");
  readonly name = input<string | undefined>(undefined);
  /** A string shows an error message under the cards; `true` marks the group invalid without one. */
  readonly error = input<string | boolean | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined, { alias: "aria-label" });
  readonly valueChange = output<string[]>();

  protected readonly disabledInput = input(false, { alias: "disabled", transform: booleanAttribute });
  private readonly formDisabled = signal(false);
  protected readonly disabled = computed(() => this.disabledInput() || this.formDisabled());
  protected readonly invalid = computed(() => !!this.error());
  protected readonly errorMessage = computed(() => {
    const error = this.error();
    return typeof error === "string" && error ? error : null;
  });

  // The group's own ids; each card is a checkbox machine of its own, as in Ark.
  private readonly machine = nextMachineId();
  protected readonly labelId = `checkbox-card-group:${this.machine}:label`;
  protected readonly errorId = `checkbox-card-group:${this.machine}:error`;
  protected rootId(value: string): string {
    return `checkbox:${this.machine}-${value}`;
  }
  protected partId(value: string, part: string): string {
    return `${this.rootId(value)}:${part}`;
  }
  protected descriptionId(value: string): string {
    return `checkbox-card-group:${this.machine}:description-${value}`;
  }

  protected readonly ICON_SIZE = 20;
  protected readonly CHECK_SIZE = 16;
  protected readonly ERROR_ICON_SIZE = 16;
  protected readonly HIDDEN = VISUALLY_HIDDEN_INPUT;
  protected readonly flag = stateFlag;
  protected readonly hostClass = computed(() =>
    checkboxCardGroupStyles({ size: this.size(), columns: this.columns(), invalid: this.invalid() }),
  );
  protected readonly cardClass = computed(() =>
    clsx("selection-card", `selection-card--indicator-${this.indicator()}`),
  );

  protected isDisabled(option: SelectionCardOption): boolean {
    return !!option.disabled || this.disabled();
  }
  protected isChecked(value: string): boolean {
    return this.value().includes(value);
  }
  protected itemState(value: string): string {
    return this.isChecked(value) ? "checked" : "unchecked";
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
  private onChange: (value: string[]) => void = () => {};

  protected toggle(value: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.value();
    const next = checked ? [...current.filter((v) => v !== value), value] : current.filter((v) => v !== value);
    this.value.set(next);
    this.valueChange.emit(next);
    this.onChange(next);
  }

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
