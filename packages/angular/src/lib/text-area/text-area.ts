import {
  Component,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  numberAttribute,
  signal,
  type Signal,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { textAreaFieldStyles, type InputVariants } from "@ui-organized/core";
import { UioPart } from "../part.js";
import { UioFieldContext } from "../field/field-context.js";
import { UioFieldLabel } from "../field/field.js";
import { UioFieldError } from "../field-error/field-error.js";

export type TextAreaSize = NonNullable<InputVariants["size"]>;
export type TextAreaResize = "none" | "vertical" | "horizontal" | "both";

/**
 * A multi-line text field.
 *
 * The same field as `UioInput` with a `textarea` where the `input` is — which
 * is exactly how the other three libraries write it too, as a near-copy rather
 * than a shared abstraction. The two diverge on more than the tag: the control
 * is a different Ark part, it carries `data-resize` for the affordance the
 * stylesheet turns into a `resize` rule, and its height comes from
 * `.textarea-field__control`, which opts out of the shared single-line control
 * height. A wrapper parameterised over the tag would hide all three.
 *
 * ```html
 * <div uioTextArea label="Bio" resize="vertical" [rows]="6" [formControl]="bio"></div>
 * ```
 */
@Component({
  selector: "div[uioTextArea]",
  standalone: true,
  providers: [
    UioFieldContext,
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UioTextArea), multi: true },
  ],
  imports: [UioFieldLabel, UioFieldError],
  template: `
    @if (label(); as text) {
      <label uioFieldLabel
        >{{ text }}@if (required()) {<span class="field__required" aria-hidden="true"></span>}</label
      >
    }
    <textarea
      class="field__control textarea-field__control"
      data-scope="field"
      data-part="textarea"
      [id]="field.controlId"
      [attr.name]="name()"
      [attr.placeholder]="placeholder()"
      [attr.rows]="rows()"
      [attr.data-resize]="resize()"
      [attr.required]="required() ? '' : null"
      [attr.readonly]="readOnly() ? '' : null"
      [attr.aria-invalid]="invalid() ? 'true' : null"
      [attr.aria-describedby]="field.describedBy()"
      [attr.data-invalid]="flag(invalid())"
      [disabled]="isDisabled()"
      [value]="value()"
      (input)="write($event)"
      (blur)="onTouched()"
    ></textarea>
    @if (helperVisible()) {
      <span
        class="field__description"
        data-scope="field"
        data-part="helper-text"
        [id]="field.partId('helper-text')"
      >{{ helperText() }}</span>
    }
    <span uioFieldError [message]="errorMessage()"></span>
  `,
  host: {
    role: "group",
    "[class]": "hostClass()",
    "[id]": "field.rootId",
  },
})
export class UioTextArea extends UioPart implements ControlValueAccessor {
  readonly scope = "field";
  readonly part = "root";

  readonly label = input<string | undefined>(undefined);
  readonly helperText = input<string | undefined>(undefined);
  /** A string shows an error message; `true` marks the field invalid without one. */
  readonly error = input<string | boolean | undefined>(undefined);
  readonly size = input<TextAreaSize>("md");
  /**
   * The native resize affordance. `both` by default, with horizontal dragging
   * capped at the field's width by the stylesheet.
   */
  readonly resize = input<TextAreaResize>("both");
  readonly rows = input<number | undefined>(undefined, { transform: optionalNumber });
  readonly required = input(false, { transform: booleanAttribute });
  readonly readOnly = input(false, { transform: booleanAttribute });
  readonly name = input<string | undefined>(undefined);
  readonly placeholder = input<string | undefined>(undefined);

  /** `disabled` comes from the caller *or* from a reactive form's disabled state. */
  protected readonly disabledInput = input(false, {
    alias: "disabled",
    transform: booleanAttribute,
  });
  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabledInput() || this.formDisabled());

  override readonly invalid: Signal<boolean> = computed(() => !!this.error());
  protected readonly errorMessage = computed(() =>
    typeof this.error() === "string" ? (this.error() as string) : undefined,
  );
  protected readonly helperVisible = computed(() => !!this.helperText() && !this.invalid());

  protected readonly field = inject(UioFieldContext);
  protected readonly hostClass = computed(() => textAreaFieldStyles({ size: this.size() }));
  protected readonly value = signal("");

  constructor() {
    super();
    this.field.bind({
      invalid: this.invalid,
      // `disabled` is a native attribute on the control here, not a state of
      // the field — see the note on UioInput.
      disabled: signal(false),
      required: signal(false),
      readOnly: signal(false),
    });
    this.field.describe("helper-text", this.helperVisible);
  }

  protected onTouched: () => void = () => {};
  private onChange: (value: string) => void = () => {};

  protected write(event: Event): void {
    const next = (event.target as HTMLTextAreaElement).value;
    this.value.set(next);
    this.onChange(next);
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? "");
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

/**
 * `numberAttribute` turns an absent value into `NaN`, which renders as
 * `rows="NaN"`. A textarea with no `rows` has to have no attribute at all.
 */
function optionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = numberAttribute(value as string | number);
  return Number.isNaN(parsed) ? undefined : parsed;
}
