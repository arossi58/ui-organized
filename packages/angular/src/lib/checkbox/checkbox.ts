import {
  Component,
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
import { clsx } from "clsx";
import { UioInteractionState } from "../interaction-state.js";
import { UioPart } from "../part.js";
import { VISUALLY_HIDDEN_INPUT, nextMachineId } from "../part-ids.js";
import { UioIcon } from "../icons/icon.js";

/**
 * A box that is ticked, empty, or neither.
 *
 * Built the way Switch is — the root `<label>` *is* the control, the box and
 * its indicator are `aria-hidden` decoration, and a visually-hidden input takes
 * the focus and carries the value into a form. What Switch does not have is the
 * third state.
 *
 * ── Indeterminate ──────────────────────────────────────────────────────────
 *
 * Ark folds it into the checked value (`checked="indeterminate"`); the facade
 * across all four libraries keeps it a separate boolean, because "some of the
 * children are ticked" is a different question from "is this ticked" and a
 * caller answering the first should not have to widen the type of the second.
 * So `indeterminate` wins over `checked` throughout — the state word, the
 * indicator's dash, and the hidden input, which comes out unchecked with its
 * `indeterminate` *property* set. A property and not an attribute because
 * there is no such attribute, which is also why the parity gate cannot see it.
 *
 * The indicator carries `hidden` unless the box is ticked, as Ark's does, and
 * is painted anyway: `.checkbox__indicator` sets `display`, which outranks the
 * attribute. That is the stylesheet's decision and it is shared by all four
 * libraries — reproducing the attribute is what keeps them comparable.
 *
 * ```html
 * <label uioCheckbox label="Accept" formControlName="accept"></label>
 * <label uioCheckbox label="All" [indeterminate]="some()" [(checked)]="all"></label>
 * ```
 */
@Component({
  selector: "label[uioCheckbox]",
  standalone: true,
  imports: [UioIcon],
  // Reports hover and focus so the shared stylesheet can draw a focus ring —
  // see UioInteractionState for why it is a host directive rather than a base.
  hostDirectives: [UioInteractionState],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UioCheckbox), multi: true },
  ],
  template: `
    <div
      class="checkbox__control"
      data-scope="checkbox"
      data-part="control"
      aria-hidden="true"
      [id]="partId('control')"
      [attr.data-state]="state()"
      [attr.data-disabled]="flag(disabled())"
      [attr.data-required]="flag(required())"
      [attr.data-hover]="flag(hover())"
      [attr.data-focus]="flag(focus())"
      [attr.data-focus-visible]="flag(focusVisible())"
    >
      <div
        class="checkbox__indicator"
        data-scope="checkbox"
        data-part="indicator"
        [attr.data-state]="state()"
        [attr.data-disabled]="flag(disabled())"
        [attr.data-required]="flag(required())"
        [attr.data-hover]="flag(hover())"
        [attr.data-focus]="flag(focus())"
        [attr.data-focus-visible]="flag(focusVisible())"
        [attr.hidden]="state() === 'checked' ? null : ''"
      >
        @if (indeterminate()) {
          <span class="checkbox__indicator--indeterminate"></span>
        } @else {
          <span uioIcon class="checkbox__check" name="check" [size]="ICON_SIZE"></span>
        }
      </div>
    </div>
    @if (label(); as text) {
      <span
        class="checkbox__label text-default-body-large"
        data-scope="checkbox"
        data-part="label"
        [id]="partId('label')"
        [attr.data-state]="state()"
        [attr.data-disabled]="flag(disabled())"
        [attr.data-required]="flag(required())"
        [attr.data-hover]="flag(hover())"
        [attr.data-focus]="flag(focus())"
        [attr.data-focus-visible]="flag(focusVisible())"
        >{{ text }}</span
      >
    }
    <!--
      Ark points the input at the Label part unconditionally. With no label
      there is no such element, so the reference would dangle — and a dangling
      aria-labelledby outranks aria-label, leaving the box nameless. That is
      what OMIT_ARIA guards in the other three; here the reference is simply not
      written.
    -->
    <input
      type="checkbox"
      value="on"
      [id]="partId('input')"
      [attr.style]="HIDDEN"
      [checked]="checked() && !indeterminate()"
      [indeterminate]="indeterminate()"
      [disabled]="disabled()"
      [attr.required]="required() ? '' : null"
      [attr.name]="name()"
      [attr.aria-invalid]="invalid() ? 'true' : 'false'"
      [attr.aria-labelledby]="label() ? partId('label') : null"
      [attr.aria-label]="label() ? null : ariaLabel()"
      (change)="toggle($event)"
      (blur)="onTouched()"
    />
  `,
  host: {
    "[class]": "hostClass()",
    "[id]": "rootId",
    "[attr.for]": "partId('input')",
    /** Not on `UioPart`: no stylesheet selects on it. See UioSwitch. */
    "[attr.data-required]": "flag(required())",
  },
})
export class UioCheckbox extends UioPart implements ControlValueAccessor {
  readonly scope = "checkbox";
  readonly part = "root";

  private readonly interaction = inject(UioInteractionState);
  override readonly hover: Signal<boolean> = this.interaction.hover;
  override readonly focus: Signal<boolean> = this.interaction.focus;
  override readonly focusVisible: Signal<boolean> = this.interaction.focusVisible;

  readonly checked = model(false);
  readonly indeterminate = input(false, { transform: booleanAttribute });
  readonly label = input<string | undefined>(undefined);
  readonly required = input(false, { transform: booleanAttribute });
  readonly name = input<string | undefined>(undefined);
  /** Only used when there is no visible label — with one, the label names the box. */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: "aria-label" });
  readonly checkedChange = output<boolean>();

  /** `disabled` comes from the caller *or* from a reactive form's disabled state. */
  protected readonly disabledInput = input(false, {
    alias: "disabled",
    transform: booleanAttribute,
  });
  private readonly formDisabled = signal(false);
  override readonly disabled: Signal<boolean> = computed(
    () => this.disabledInput() || this.formDisabled(),
  );
  override readonly state = computed(() => {
    if (this.indeterminate()) return "indeterminate";
    return this.checked() ? "checked" : "unchecked";
  });

  private readonly machine = nextMachineId();
  protected get rootId(): string {
    return `${this.scope}:${this.machine}`;
  }
  protected partId(part: string): string {
    return `${this.scope}:${this.machine}:${part}`;
  }

  protected readonly ICON_SIZE = 16;
  protected readonly HIDDEN = VISUALLY_HIDDEN_INPUT;
  protected readonly hostClass = computed(() =>
    clsx("checkbox", this.disabled() && "checkbox--disabled"),
  );

  protected onTouched: () => void = () => {};
  private onChange: (value: boolean) => void = () => {};

  protected toggle(event: Event): void {
    const next = (event.target as HTMLInputElement).checked;
    this.checked.set(next);
    this.checkedChange.emit(next);
    this.onChange(next);
  }

  writeValue(value: boolean): void {
    this.checked.set(!!value);
  }
  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}
