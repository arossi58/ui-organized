import {
  Component,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  signal,
  type Signal,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { inputFieldStyles, type InputVariants } from "@ui-organized/core";
import { UioPart } from "../part.js";
import { UioFieldContext } from "../field/field-context.js";
import { UioFieldLabel } from "../field/field.js";
import { UioFieldError } from "../field-error/field-error.js";

export type InputSize = NonNullable<InputVariants["size"]>;

/**
 * A single-line text field, with its label, helper text and error already wired
 * to it.
 *
 * ── Why the parts are written out here ──────────────────────────────────────
 *
 * This is `UioField` prepackaged, and it could have been assembled from
 * `UioFieldControl` and `UioFieldDescription`. It is not, for the reason Switch
 * writes its track and thumb into a template: the control's whole attribute
 * surface is then visible in one place, next to the states that drive it, and
 * the browser parity gate compares every one of them. Assembling it from
 * directives would also mean this component's `[disabled]` and the directive's
 * own host binding both writing `disabled` on the same element every pass, with
 * the host binding winning.
 *
 * The two parts that *are* reused are the ones with nothing to fight over: the
 * label, which only projects content, and the error pill, which takes its
 * identity from the field context this component provides.
 *
 * ── What is deliberately absent ─────────────────────────────────────────────
 *
 * `data-disabled`, on every part. React does not emit one either: `disabled`
 * here is a native attribute on the control rather than a state of the field,
 * and `.field__control:disabled` is in the stylesheet beside
 * `.field__control[data-disabled]`. Disable the whole field instead — label and
 * helper text included — with `<div uioField disabled>`.
 *
 * Angular has no prop spread, so the native attributes worth having are
 * declared. Anything beyond them is a `UioField` away.
 */
@Component({
  selector: "div[uioInput]",
  standalone: true,
  providers: [
    UioFieldContext,
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UioInput), multi: true },
  ],
  imports: [UioFieldLabel, UioFieldError],
  template: `
    @if (label(); as text) {
      <label uioFieldLabel
        >{{ text }}@if (required()) {<span class="field__required" aria-hidden="true"></span>}</label
      >
    }
    <input
      class="field__control"
      data-scope="field"
      data-part="input"
      [id]="field.controlId"
      [attr.type]="type()"
      [attr.name]="name()"
      [attr.placeholder]="placeholder()"
      [attr.autocomplete]="autocomplete()"
      [attr.required]="required() ? '' : null"
      [attr.readonly]="readOnly() ? '' : null"
      [attr.aria-invalid]="invalid() ? 'true' : null"
      [attr.aria-describedby]="field.describedBy()"
      [attr.data-invalid]="flag(invalid())"
      [disabled]="isDisabled()"
      [value]="value()"
      (input)="write($event)"
      (blur)="onTouched()"
    />
    @if (helperVisible()) {
      <span
        class="field__description"
        data-scope="field"
        data-part="helper-text"
        [id]="field.partId('helper-text')"
      >{{ helperText() }}</span>
    }
    <!--
      Shows only while the field is invalid and holding a message, which is
      what Ark's ErrorText does — see UioFieldError. That is also why the
      helper text above is hidden by an error rather than merely covered:
      two lines of guidance under one control is one too many.
    -->
    <span uioFieldError [message]="errorMessage()"></span>
  `,
  host: {
    role: "group",
    "[class]": "hostClass()",
    "[id]": "field.rootId",
  },
})
export class UioInput extends UioPart implements ControlValueAccessor {
  readonly scope = "field";
  readonly part = "root";

  readonly label = input<string | undefined>(undefined);
  readonly helperText = input<string | undefined>(undefined);
  /**
   * A string shows an error message; `true` marks the field invalid without
   * one. Same fork the other three take, and the reason `invalid` below is
   * derived rather than an input of its own.
   */
  readonly error = input<string | boolean | undefined>(undefined);
  readonly size = input<InputSize>("md");
  readonly required = input(false, { transform: booleanAttribute });
  readonly readOnly = input(false, { transform: booleanAttribute });
  readonly type = input<string | undefined>(undefined);
  readonly name = input<string | undefined>(undefined);
  readonly placeholder = input<string | undefined>(undefined);
  readonly autocomplete = input<string | undefined>(undefined);

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
  /** An error replaces the helper text rather than stacking under it. */
  protected readonly helperVisible = computed(() => !!this.helperText() && !this.invalid());

  protected readonly field = inject(UioFieldContext);
  protected readonly hostClass = computed(() => inputFieldStyles({ size: this.size() }));
  protected readonly value = signal("");

  constructor() {
    super();
    this.field.bind({
      invalid: this.invalid,
      // Not the field's state: see the note above about `data-disabled`.
      disabled: signal(false),
      required: signal(false),
      readOnly: signal(false),
    });
    this.field.describe("helper-text", this.helperVisible);
  }

  protected onTouched: () => void = () => {};
  private onChange: (value: string) => void = () => {};

  protected write(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    // Kept in step with the element so the binding above never has to fight the
    // user for the caret: the signal only ever differs from the DOM when
    // something *else* wrote the value.
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
